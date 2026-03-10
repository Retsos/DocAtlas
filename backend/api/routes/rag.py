from fastapi import APIRouter, HTTPException, Request
from chromadb import K, Knn, Rrf, Search
from chromadb.api.models.Collection import Collection
from config.chromaClient import get_chroma_collection
from core.rate_limit import limiter
from models.RequestBody import RequestBody
from services.documentProcessing import normalize_greek_text
from services.llmService import generate_answer
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
        # This endpoint performs a tenant-level origin authorization check before
        # touching vector retrieval. CORS middleware controls which browsers can call
        # the API globally, while this check ensures each tenant can only query from
        # its own allowlisted website domain stored in Firestore.
        request_origin = request.headers.get("origin")

        db = get_firestore_client()
        tenant_ref = db.collection("users").document(body.tenant_id)
        tenant_doc = tenant_ref.get()

        if not tenant_doc.exists:
            raise HTTPException(status_code=403, detail="Unknown tenant_id.")

        tenant_data = tenant_doc.to_dict()
        allowed_origin = tenant_data.get("websiteUrl")

        # Reject calls when the tenant has no configured website origin or when
        # the browser origin does not match exactly. This prevents cross-tenant
        # access where one widget could attempt to query another tenant's corpus
        # by submitting a different tenant_id in the request body.
        if not allowed_origin or request_origin != allowed_origin:
            print(
                f"[SECURITY] Rejected origin: {request_origin}. "
                f"Expected: {allowed_origin}"
            )
            raise HTTPException(
                status_code=403,
                detail="Origin is not allowed for this tenant.",
            )

        # Hybrid retrieval combines semantic (dense) and lexical (sparse) ranking.
        # Dense KNN helps with meaning-based matches, sparse KNN helps with exact
        # keyword matches, and RRF merges both rank lists for more stable results.
        col: Collection = get_chroma_collection()
        clean_prompt = normalize_greek_text(body.prompt)

        hybrid_rank = Rrf(
            ranks=[
                Knn(query=clean_prompt, return_rank=True, limit=15),
                Knn(
                    query=clean_prompt,
                    key="sparse_embedding",
                    return_rank=True,
                    limit=15,
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
        answer = await run_in_threadpool(generate_answer, body.prompt, retrieved_docs)

        return {
            "answer": answer,
            "sources": retrieved_docs,
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Query pipeline failed: {e}")
