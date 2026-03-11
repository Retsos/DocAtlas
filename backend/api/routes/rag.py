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

        # Tenant scoping is enforced in the vector query filter.
        # Even with valid retrieval, only documents tagged with the caller's
        # tenant_id are eligible to reach the LLM context window.
        search_query = (
            Search()
            .where({"tenant_id": body.tenant_id})
            .rank(hybrid_rank)
            .limit(body.top_k)
            .select(K.DOCUMENT, K.METADATA, K.ID)
        )

        results = col.search(search_query)

        retrieved_docs = results.get("documents", [[]])[0] if results else []
        answer = await run_in_threadpool(generate_answer, body.prompt, retrieved_docs, body.history)
        return {
            "answer": answer,
            "sources": retrieved_docs,  # Returned for optional UI citations.
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Query pipeline failed: {e}")
