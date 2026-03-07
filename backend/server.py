from fastapi import Depends, FastAPI, HTTPException, UploadFile, File
from fastapi.concurrency import run_in_threadpool
from config.chromaClient import get_chroma_collection
from chromadb.api.models.Collection import Collection
from services.documentProcessing import prepare_document_for_chroma
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
        #Queries chroma for relevant documents
        results = col.query(
            query_texts=[body.prompt],
            n_results=body.top_k
        )

        retrieved_docs = results['documents'][0] if results['documents'] else []
        
        return {
            "query": body.prompt,
            "results": retrieved_docs
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))