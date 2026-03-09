from fastapi import Depends, FastAPI, HTTPException, UploadFile, File, Request
from fastapi.concurrency import run_in_threadpool
from fastapi.middleware.cors import CORSMiddleware
from config.chromaClient import get_chroma_collection
from chromadb.api.models.Collection import Collection
from chromadb import Search, K, Knn, Rrf
from services.documentProcessing import prepare_document_for_chroma, normalize_greek_text
from models.RequestBody import RequestBody
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

app = FastAPI()

limiter = Limiter(key_func=get_remote_address)  #Fetches the client's IP address for rate limiting
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)


MAX_FILE_SIZE = 10 * 1024 * 1024  #10MB

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://doc-atlas-taupe.vercel.app",
        "http://localhost:5173",
        "http://localhost:5174"
        ],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)

@app.post("/test")
def test_endpoint():
    return {"message": "API is working!"}

@app.post("/upload-file")
async def upload_file(
    #Accepts a file from form-data
    file: UploadFile = File(...), 
    col: Collection = Depends(get_chroma_collection)
):
    try:

        if file.size and file.size > MAX_FILE_SIZE:
            raise HTTPException(status_code=413, detail=f"File size exceeds the maximum limit of {MAX_FILE_SIZE / (1024 * 1024)} MB")
        
        
        #Reads the file bytes into memory
        file_content = await file.read()

        #Processes the file
        ids, documents, metadatas = prepare_document_for_chroma(file.filename, file_content)
        
        if not ids:
            return {"message": f"No valid content found in {file.filename}", "chunks_inserted": 0}
        
        #Runs the synchronous chroma add method in a threadpool to avoid blocking the event loop
        await run_in_threadpool(col.add, ids=ids, documents=documents, metadatas=metadatas)
        
        return {
            "message": f"Successfully processed {file.filename}", 
            "chunks_inserted": len(ids)
        }
        
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

@app.post("/query")
@limiter.limit("100/minute")  #Rate limits to 100 requests per minute per IP
def query(
    request: Request,
    body: RequestBody,
    col: Collection = Depends(get_chroma_collection)
):
    try:
        clean_prompt = normalize_greek_text(body.prompt)

        hybrid_rank = Rrf(
            ranks=[
                #Semantic search
                Knn(
                    query=clean_prompt,
                    return_rank=True,
                    limit=15,
                ),
                #Exact keyword/date matching
                Knn(
                    query=clean_prompt,
                    key="sparse_embedding",
                    return_rank=True,
                    limit=15,
                )
            ],
            weights=[1.0, 1.0],
            k=60
        )

        search_query = Search().rank(hybrid_rank).limit(body.top_k).select(K.DOCUMENT, K.METADATA, K.ID)
        results = col.search(search_query)

        retrieved_docs = results.get('documents', [[]])[0] if results else []
        retrieved_metadatas = results.get('metadatas', [[]])[0] if results else []
        retrieved_ids = results.get('ids', [[]])[0] if results else []

        return{
            "query": body.prompt,
            "results": retrieved_docs,
            "metadatas": retrieved_metadatas,
            "ids": retrieved_ids
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))