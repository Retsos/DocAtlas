from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from fastapi.concurrency import run_in_threadpool
from chromadb.api.models.Collection import Collection

from config.chromaClient import get_chroma_collection
from core.firebase import delete_storage_object, get_firestore_client, verify_token
from services.documentProcessing import prepare_document_for_chroma

router = APIRouter(prefix="/api", tags=["files"])

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB


@router.post("/upload-file")
async def upload_file(
    file: UploadFile = File(...),
    tenant_id: str = Form(...),
    admin_data: dict = Depends(verify_token),
):
    # Upload and index a document while enforcing tenant ownership.
    try:
        if admin_data.get("uid") != tenant_id:
            raise HTTPException(status_code=403, detail="No permission.")

        col: Collection = get_chroma_collection()

        if file.size and file.size > MAX_FILE_SIZE:
            raise HTTPException(status_code=413, detail="File too large.")

        file_content = await file.read()

        ids, documents, metadatas = prepare_document_for_chroma(
            file.filename, file_content
        )
        metadatas = [{**metadata, "tenant_id": tenant_id} for metadata in metadatas]

        if not ids:
            return {"message": "Empty file.", "chunks_inserted": 0}

        await run_in_threadpool(col.add, ids=ids, documents=documents, metadatas=metadatas)

        return {
            "message": f"File {file.filename} uploaded.",
            "chunks_inserted": len(ids),
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



@router.delete("/delete-source/{source_id}")
async def delete_source(
    source_id: str,
    admin_data: dict = Depends(verify_token),
):
    # Canonical delete flow: Firestore doc, Storage object, and Chroma index.
    try:
        admin_uid = admin_data.get("uid")
        if not admin_uid:
            raise HTTPException(status_code=401, detail="Unauthorized.")

        firestore_client = get_firestore_client()
        source_ref = firestore_client.collection("documents").document(source_id)
        source_snapshot = source_ref.get()

        if not source_snapshot.exists:
            raise HTTPException(status_code=404, detail="Source not found.")

        source_data = source_snapshot.to_dict() or {}
        source_owner_id = source_data.get("ownerId")
        if source_owner_id != admin_uid:
            raise HTTPException(status_code=403, detail="No permission.")

        storage_path = source_data.get("storagePath")
        source_name = source_data.get("name")
        warnings = []

        if isinstance(storage_path, str) and storage_path:
            storage_delete_error = delete_storage_object(storage_path)
            if storage_delete_error:
                warnings.append(f"Storage delete failed: {storage_delete_error}")

        source_ref.delete()

        if isinstance(source_name, str) and source_name:
            col: Collection = get_chroma_collection()
            col.delete(
                where={
                    "$and": [
                        {"source": source_name},
                        {"tenant_id": admin_uid},
                    ]
                }
            )
        else:
            warnings.append("Chroma delete skipped: missing source name in Firestore doc.")

        return {
            "message": "Source deleted.",
            "warnings": warnings,
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
