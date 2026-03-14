from fastapi import APIRouter, HTTPException, Request
from chromadb import K, Knn, Rrf, Search
from chromadb.api.models.Collection import Collection
from config.chromaClient import get_chroma_collection
from core.rate_limit import limiter
from models.RequestBody import RequestBody
from services.doc_processing import normalize_greek_text
from services.llmService import generate_answer, classify_intent, rewrite_query
from services.citations import build_citations
from fastapi.concurrency import run_in_threadpool
from core.firebase import get_firestore_client

router = APIRouter(prefix="/api", tags=["query"])


@router.post("/query")
@limiter.limit("100/minute")
async def query(
    request: Request,
    body: RequestBody,
):
    try:
        request_origin = request.headers.get("origin")

        db = get_firestore_client()
        tenant_ref = db.collection("users").document(body.tenant_id)
        tenant_doc = tenant_ref.get()

        if not tenant_doc.exists:
            raise HTTPException(status_code=403, detail="Unknown tenant_id.")

        tenant_data = tenant_doc.to_dict()
        allowed_origin = tenant_data.get("websiteUrl")

        if not allowed_origin or request_origin != allowed_origin:
            print(
                f"[SECURITY] Rejected origin: {request_origin}. "
                f"Expected: {allowed_origin}"
            )
            raise HTTPException(
                status_code=403,
                detail="Origin is not allowed for this tenant.",
            )

        col: Collection = get_chroma_collection()

        search_prompt = await run_in_threadpool(rewrite_query, body.prompt, body.history)
        print(f"[REWRITER] Τελικό Prompt στη Βάση: '{search_prompt}'")

        clean_prompt = normalize_greek_text(search_prompt)

        intent = await run_in_threadpool(classify_intent, search_prompt)
        print(f"[INTENT] Κατηγοριοποίηση πρόθεσης: '{intent}'")

        if intent == "MEDICAL":
            return {
                "answer": "Δεν είμαι εξουσιοδοτημένος να παρέχω ιατρική διάγνωση, παρακαλώ μιλήστε με έναν γιατρό.",
                "sources": []
            }

        elif intent == "GENERAL":
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

        search_query = (
            Search()
            .where({"tenant_id": body.tenant_id})
            .rank(hybrid_rank)
            .limit(body.top_k)
            .select(K.DOCUMENT, K.METADATA, K.ID)
        )

        results = col.search(search_query)

        retrieved_docs = results.get("documents", [[]])[0] if results else []
        retrieved_metadatas = results.get("metadatas", [[]])[0] if results else []

        sources_list = build_citations(
            db=db,
            tenant_id=body.tenant_id,
            retrieved_metadatas=retrieved_metadatas,
            max_items=10,
        )

        answer = await run_in_threadpool(generate_answer, body.prompt, retrieved_docs, body.history)

        return {
            "answer": answer,
            "sources": sources_list,
        }
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Query pipeline failed: {e}")