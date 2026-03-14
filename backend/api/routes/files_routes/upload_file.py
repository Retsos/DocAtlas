from datetime import datetime
from uuid import uuid4
from chromadb.api.models.Collection import Collection
from fastapi import Depends, File, Form, HTTPException, UploadFile
from fastapi.concurrency import run_in_threadpool
from firebase_admin import firestore, storage
from api.routes.files_routes.router import router
from api.routes.files_routes.shared import (
    ALLOWED_EXTENSIONS,
    MAX_FILE_SIZE,
    build_storage_download_url,
)
from config.chromaClient import get_chroma_collection
from core.firebase import (
    delete_storage_object,
    get_configured_bucket_name,
    get_firestore_client,
    verify_token,
)
from services.doc_processing import prepare_document_for_chroma


@router.post("/upload-file")
async def upload_file(
    file: UploadFile = File(...),
    tenant_id: str = Form(...),
    admin_data: dict = Depends(verify_token),
):
    # Canonical upload flow: validate -> process -> persist -> index.
    storage_path: str | None = None
    doc_ref = None
    chroma_attempted = False
    col: Collection | None = None
    ids: list[str] | None = None

    async def rollback_upload() -> None:
        # Best-effort cleanup for partial writes.
        if doc_ref is not None:
            try:
                doc_ref.delete()
            except Exception:
                pass

        if chroma_attempted and col is not None and ids:
            try:
                await run_in_threadpool(col.delete, ids=ids)
            except Exception:
                pass

        if storage_path:
            try:
                delete_storage_object(storage_path)
            except Exception:
                pass

    try:
        if admin_data.get("uid") != tenant_id:
            raise HTTPException(status_code=403, detail="No permission.")

        filename = file.filename or ""
        if not filename.strip():
            raise HTTPException(status_code=400, detail="Missing filename.")

        extension = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
        if extension not in ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported file type: {extension or 'unknown'}",
            )

        file_content = await file.read()
        if not file_content:
            raise HTTPException(status_code=400, detail="Uploaded file is empty.")

        if len(file_content) > MAX_FILE_SIZE:
            raise HTTPException(status_code=413, detail="File too large.")

        # Main doc-processing call.
        ids, documents, metadatas = prepare_document_for_chroma(filename, file_content)
        if not ids:
            raise HTTPException(
                status_code=422,
                detail=f"No extractable text found in '{filename}'.",
            )
        metadatas = [{**metadata, "tenant_id": tenant_id} for metadata in metadatas]
        doc_id = metadatas[0].get("doc_id") if metadatas else None

        firestore_client = get_firestore_client()
        user_snapshot = firestore_client.collection("users").document(tenant_id).get()
        user_data = user_snapshot.to_dict() if user_snapshot.exists else {}
        hospital_name = (
            user_data.get("hospitalName")
            if isinstance(user_data, dict)
            and isinstance(user_data.get("hospitalName"), str)
            and user_data.get("hospitalName")
            else "Hospital"
        )

        bucket_name = get_configured_bucket_name()
        bucket = storage.bucket(bucket_name or None)
        safe_file_name = filename.replace(" ", "_")
        storage_path = (
            f"knowledge-sources/{tenant_id}/"
            f"{int(datetime.now().timestamp() * 1000)}-{safe_file_name}"
        )
        download_token = str(uuid4())
        blob = bucket.blob(storage_path)
        blob.metadata = {"firebaseStorageDownloadTokens": download_token}
        blob.upload_from_string(
            file_content, content_type=file.content_type or "application/octet-stream"
        )
        blob.patch()

        resolved_bucket_name = bucket.name or bucket_name
        if not resolved_bucket_name:
            raise HTTPException(
                status_code=500,
                detail="Unable to resolve Firebase Storage bucket.",
            )
        download_url = build_storage_download_url(
            resolved_bucket_name, storage_path, download_token
        )

        col = get_chroma_collection()
        chroma_attempted = True
        await run_in_threadpool(
            col.add, ids=ids, documents=documents, metadatas=metadatas
        )

        doc_ref = firestore_client.collection("documents").document()
        doc_ref.set(
            {
                "ownerId": tenant_id,
                "hospitalName": hospital_name,
                "type": "file",
                "name": filename,
                "url": download_url,
                "storagePath": storage_path,
                "sizeBytes": len(file_content),
                "createdAt": firestore.SERVER_TIMESTAMP,
                "docId": doc_id,
            }
        )
        firestore_client.collection("users").document(tenant_id).set(
            {"uploadedDocsCount": firestore.Increment(1)},
            merge=True,
        )

        return {
            "message": f"File {filename} uploaded.",
            "chunks_inserted": len(ids),
        }
    except HTTPException:
        await rollback_upload()
        raise
    except Exception as exc:
        await rollback_upload()
        raise HTTPException(status_code=500, detail=str(exc))
