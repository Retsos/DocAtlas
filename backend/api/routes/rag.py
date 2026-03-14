import asyncio
from fastapi import APIRouter, HTTPException, Request
from chromadb import K, Knn, Rrf, Search
from chromadb.api.models.Collection import Collection
from config.chromaClient import get_chroma_collection
from core.rate_limit import limiter
from models.RequestBody import RequestBody
from services.doc_processing import normalize_greek_text
from services.llmService import generate_answer, classify_intent, rewrite_query
from fastapi.concurrency import run_in_threadpool
from core.firebase import get_firestore_client
from sentence_transformers import CrossEncoder
from services.logger import log_chat_message, log_chat_response, log_error

router = APIRouter(prefix="/api", tags=["query"])
reranker = CrossEncoder('amberoad/bert-multilingual-passage-reranking-msmarco')
rerank_semaphore = asyncio.Semaphore(4)
reranker_num_labels = getattr(reranker.model.config, "num_labels", 1)


@router.post("/query")
@limiter.limit("100/minute")
async def query(
    request: Request,
    body: RequestBody,
):
    try:
        log_id = None
        # Dynamic tenant origin check:
        # We read the browser Origin header and compare it to the tenant's
        # allowlisted websiteUrl stored in Firestore. This complements global
        # CORS by enforcing per-tenant isolation for widget requests.
        request_origin = request.headers.get("origin")

        db = get_firestore_client()
        tenant_ref = db.collection("users").document(body.tenant_id)
        tenant_doc = tenant_ref.get()

        if not tenant_doc.exists:
            detail_msg = "Unknown tenant_id."
            log_error(tenant_id=body.tenant_id, status_code=403, method=request.method, detail=detail_msg)
            raise HTTPException(status_code=403, detail=detail_msg)

        tenant_data = tenant_doc.to_dict()
        allowed_origin = tenant_data.get("websiteUrl")

        # Strict origin validation:
        # If the tenant has no allowlisted origin or the current request origin
        # does not match exactly, we reject the call. This prevents one tenant
        # from querying another tenant's index by spoofing tenant_id values.
        if not allowed_origin or request_origin != allowed_origin:
            detail_msg = "Origin is not allowed for this tenant."
            log_error(tenant_id=body.tenant_id, status_code=403, method=request.method, detail=detail_msg)
            raise HTTPException(status_code=403, detail=detail_msg)

        log_id = log_chat_message(
            tenant_id=body.tenant_id,
            prompt=body.prompt,
            origin=request_origin,
        )

        # Hybrid retrieval pipeline:
        # Dense KNN captures semantic similarity, sparse KNN captures lexical
        # keyword relevance, and RRF merges both rank lists into a balanced
        # result set for higher-quality retrieval before generation.

        col: Collection = get_chroma_collection()

        # --- QUERY REWRITING  ---

        search_prompt = await run_in_threadpool(rewrite_query, body.prompt, body.history)
        print(f"[REWRITER] Τελικό Prompt στη Βάση: '{search_prompt}'")
            
        clean_prompt = normalize_greek_text(search_prompt)
        # ------------------------------------------------

        # Το intent classification παίρνει τη σωστή, ξεκάθαρη ερώτηση πλέον
        intent = await run_in_threadpool(classify_intent, search_prompt)

        if intent == "MEDICAL":
            #Immediately returns the safety guardrail, no database search needed
            response_text = "Δεν είμαι εξουσιοδοτημένος να παρέχω ιατρική διάγνωση, παρακαλώ μιλήστε με έναν γιατρό."
            log_chat_response(log_id=log_id, response=response_text, intent=intent)
            return {
                "answer": response_text,
                "sources": []
            }
        
        elif intent == "GENERAL":

            #Passes an empty context list, the LLM will handle the small talk without retrieval
            answer = await run_in_threadpool(generate_answer, body.prompt, [], body.history)
            log_chat_response(log_id=log_id, response=answer, intent=intent)
            return {
                "answer": answer,
                "sources": []
            }

        hybrid_rank = Rrf(
            ranks=[
                Knn(
                    query=clean_prompt, 
                    return_rank=True, 
                    limit=25
                ),
                Knn(
                    query=clean_prompt,
                    key="sparse_embedding",
                    return_rank=True,
                    limit=25,
                ),
            ],
            weights=[1.0, 1.0],
            k=60,
        )

        # Tenant scoping is enforced in the vector query filter.
        # Even with valid retrieval, only documents tagged with the caller's
        # tenant_id are eligible to reach the LLM context window.
        search_query = (
            Search()
            .where({"tenant_id": body.tenant_id})
            .rank(hybrid_rank)
            .limit(50)#body.top_k
            .select(K.DOCUMENT, K.METADATA, K.ID)
        )

        results = col.search(search_query)

        retrieved_docs_raw = results.get("documents", [[]])[0] if results else []
        # Filter out None/empty docs to avoid odd inputs to the reranker
        retrieved_docs = [
            doc for doc in retrieved_docs_raw
            if isinstance(doc, str) and doc.strip()
        ]

        # Pre-trim candidates to reduce reranker latency
        rerank_candidates = retrieved_docs[:20]

        if len(rerank_candidates) > 0:
            cross_inp = [[clean_prompt, doc] for doc in rerank_candidates]
            async with rerank_semaphore:
                scores = await run_in_threadpool(reranker.predict, cross_inp)
            
            # Safely extract scalar float scores based on the model's label count
            processed_scores = []
            for score in scores:
                # Binary/multi-class: prefer the positive class score if available
                if reranker_num_labels and reranker_num_labels > 1:
                    if hasattr(score, "__len__") and len(score) > 1:
                        processed_scores.append(float(score[1]))
                    elif hasattr(score, "__len__") and len(score) == 1 and hasattr(score[0], "__len__"):
                        inner = score[0]
                        processed_scores.append(float(inner[1] if len(inner) > 1 else inner[0]))
                    else:
                        processed_scores.append(float(score))
                # Regression: use the single score
                elif hasattr(score, "__len__") and len(score) >= 1:
                    processed_scores.append(float(score[0]))
                else:
                    processed_scores.append(float(score))

            doc_score_pairs = list(zip(rerank_candidates, processed_scores))

            # Sort will work perfectly because it's comparing standard Python floats
            doc_score_pairs.sort(key=lambda x: x[1], reverse=True)

            reranked_docs = [doc for doc, score in doc_score_pairs][:body.top_k]
        else:
            reranked_docs = []

        answer = await run_in_threadpool(generate_answer, body.prompt, reranked_docs, body.history)
        log_chat_response(log_id=log_id, response=answer, intent=intent)
        
        return {
            "answer": answer,
            "sources": reranked_docs,  # Returned for optional UI citations.
        }
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Query pipeline failed: {e}")
