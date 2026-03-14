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

router = APIRouter(prefix="/api", tags=["query"])
reranker = CrossEncoder('amberoad/bert-multilingual-passage-reranking-msmarco')


@router.post("/query")
@limiter.limit("100/minute")
async def query(
    request: Request,
    body: RequestBody,
):
    try:
        # Dynamic tenant origin check:
        # We read the browser Origin header and compare it to the tenant's
        # allowlisted websiteUrl stored in Firestore. This complements global
        # CORS by enforcing per-tenant isolation for widget requests.
        request_origin = request.headers.get("origin")

        db = get_firestore_client()
        tenant_ref = db.collection("users").document(body.tenant_id)
        tenant_doc = tenant_ref.get()

        if not tenant_doc.exists:
            raise HTTPException(status_code=403, detail="Unknown tenant_id.")

        tenant_data = tenant_doc.to_dict()
        allowed_origin = tenant_data.get("websiteUrl")

        # Strict origin validation:
        # If the tenant has no allowlisted origin or the current request origin
        # does not match exactly, we reject the call. This prevents one tenant
        # from querying another tenant's index by spoofing tenant_id values.
        if not allowed_origin or request_origin != allowed_origin:
            print(
                f"[SECURITY] Rejected origin: {request_origin}. "
                f"Expected: {allowed_origin}"
            )
            raise HTTPException(
                status_code=403,
                detail="Origin is not allowed for this tenant.",
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
            return {
                "answer": "Δεν είμαι εξουσιοδοτημένος να παρέχω ιατρική διάγνωση, παρακαλώ μιλήστε με έναν γιατρό.",
                "sources": []
            }
        
        elif intent == "GENERAL":
            #Passes an empty context list, the LLM will handle the small talk without retrieval
            answer = await run_in_threadpool(generate_answer, body.prompt, [], body.history)
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

        retrieved_docs = results.get("documents", [[]])[0] if results else []

        if len(retrieved_docs) > 0:
            cross_inp = [[clean_prompt, doc] for doc in retrieved_docs]
            scores = reranker.predict(cross_inp)
            
            #Safely extract the actual scalar float score, no matter the array shape
            processed_scores = []
            for score in scores:
                # If the model returns a 2D array like [negative_prob, positive_prob]
                if hasattr(score, '__len__') and len(score) > 1:
                    processed_scores.append(float(score[1])) # Take the positive class score
                # If the model returns a 1D array with a single element like [score]
                elif hasattr(score, '__len__') and len(score) == 1:
                    processed_scores.append(float(score[0]))
                # If it's already a standard scalar float
                else:
                    processed_scores.append(float(score))

            doc_score_pairs = list(zip(retrieved_docs, processed_scores))

            # Sort will work perfectly because it's comparing standard Python floats
            doc_score_pairs.sort(key=lambda x: x[1], reverse=True)

            reranked_docs = [doc for doc, score in doc_score_pairs][:body.top_k]
        else:
            reranked_docs = []

        answer = await run_in_threadpool(generate_answer, body.prompt, reranked_docs, body.history)
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
