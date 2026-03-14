from datetime import datetime
from uuid import uuid4
from fastapi import Depends, File, Form, HTTPException, UploadFile, Request
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
    get_configured_bucket_name,
    get_firestore_client,
    verify_token,
)
from services.doc_processing import prepare_document_for_chroma
from services.logger import log_error, log_document_uploaded
from models.UploadRollbackContext import UploadRollbackContext, rollback_upload

@router.post("/upload-file")
async def upload_file(
    request: Request,
    file: UploadFile = File(...),
    tenant_id: str = Form(...),
    admin_data: dict = Depends(verify_token),
):
    # Canonical upload flow: validate -> process -> persist -> index.
    rollback_context = UploadRollbackContext()

    try:
        if admin_data.get("uid") != tenant_id:
            log_error(tenant_id=tenant_id, status_code=403, method=request.method, detail="No permission.")
            raise HTTPException(status_code=403, detail="No permission.")

        filename = file.filename or ""
        if not filename.strip():
            log_error(tenant_id=tenant_id, status_code=400, method=request.method, detail="Missing filename.")
            raise HTTPException(status_code=400, detail="Missing filename.")

        extension = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
        if extension not in ALLOWED_EXTENSIONS:
            detail_msg = f"Unsupported file type: {extension or 'unknown'}"
            log_error(tenant_id=tenant_id, status_code=400, method=request.method, detail=detail_msg)
            raise HTTPException(status_code=400, detail=detail_msg)

        file_content = await file.read()
        if not file_content:
            log_error(tenant_id=tenant_id, status_code=400, method=request.method, detail="Uploaded file is empty.")
            raise HTTPException(status_code=400, detail="Uploaded file is empty.")

        if len(file_content) > MAX_FILE_SIZE:
            log_error(tenant_id=tenant_id, status_code=413, method=request.method, detail="File too large.")
            raise HTTPException(status_code=413, detail="File too large.")

        # Main doc-processing call.
        ids, documents, metadatas = prepare_document_for_chroma(filename, file_content)
        rollback_context.ids = ids
        if not ids:
            detail_msg = f"No extractable text found in '{filename}'."
            log_error(tenant_id=tenant_id, status_code=422, method=request.method, detail=detail_msg)
            raise HTTPException(status_code=422, detail=detail_msg)
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
        rollback_context.storage_path = storage_path
        download_token = str(uuid4())
        blob = bucket.blob(storage_path)
        blob.metadata = {"firebaseStorageDownloadTokens": download_token}
        blob.upload_from_string(
            file_content, content_type=file.content_type or "application/octet-stream"
        )
        blob.patch()

        resolved_bucket_name = bucket.name or bucket_name
        if not resolved_bucket_name:
            detail_msg = "Unable to resolve Firebase Storage bucket."
            log_error(tenant_id=tenant_id, status_code=500, method=request.method, detail=detail_msg)
            raise HTTPException(status_code=500, detail=detail_msg)
        download_url = build_storage_download_url(
            resolved_bucket_name, storage_path, download_token
        )

        col = get_chroma_collection()
        rollback_context.col = col
        rollback_context.chroma_attempted = True
        await run_in_threadpool(
            col.add, ids=ids, documents=documents, metadatas=metadatas
        )

        doc_ref = firestore_client.collection("documents").document()
        rollback_context.doc_ref = doc_ref
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

        log_document_uploaded(
            user_id=tenant_id,
            document_id=doc_ref.id if doc_ref else None,
            name=filename,
            size_bytes=len(file_content),
            storage_path=storage_path,
            download_url=download_url,
            hospital_name=hospital_name,
        )

        return {
            "message": f"File {filename} uploaded.",
            "chunks_inserted": len(ids),
        }
    except HTTPException:
        await rollback_upload(rollback_context)
        raise
    except Exception as exc:
        await rollback_upload(rollback_context)
        raise HTTPException(status_code=500, detail=str(exc))
