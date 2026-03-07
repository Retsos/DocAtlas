from fastapi import Depends, FastAPI, HTTPException, UploadFile, File
from fastapi.concurrency import run_in_threadpool
from config.chromaClient import get_chroma_collection
from chromadb.api.models.Collection import Collection
from chromadb import Search, K, Knn, Rrf
from services.documentProcessing import prepare_document_for_chroma, normalize_greek_text
from models.RequestBody import RequestBody

app = FastAPI()

@app.post("/upload-file")
async def upload_file(
    #Accepts a file from form-data
    file: UploadFile = File(...), 
    col: Collection = Depends(get_chroma_collection)
):
    try:
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
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

@app.post("/query")
def query(
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

        search_query = Search().rank(hybrid_rank).limit(body.top_k).select(K.DOCUMENT)
        results = col.search(search_query)

        retrieved_docs = results.get('documents', [[]])[0] if results else []

        return{
            "query": body.prompt,
            "results": retrieved_docs
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))