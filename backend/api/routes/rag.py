from fastapi import APIRouter, HTTPException, Request
from chromadb import K, Knn, Rrf, Search
from chromadb.api.models.Collection import Collection
from config.chromaClient import get_chroma_collection
from core.rate_limit import limiter
from models.RequestBody import RequestBody
from services.documentProcessing import normalize_greek_text
from services.llmService import generate_answer
from fastapi.concurrency import run_in_threadpool

router = APIRouter(prefix="/api", tags=["query"])


@router.post("/query")
@limiter.limit("100/minute")
async def query(
    request: Request,
    body: RequestBody,
):
    # Hybrid retrieval (dense + sparse) scoped to the caller tenant.
    try:
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
            "sources": retrieved_docs # Send sources back so the UI can cite them
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
