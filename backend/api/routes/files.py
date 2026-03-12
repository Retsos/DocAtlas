from datetime import datetime, timezone
from urllib.parse import quote
from uuid import uuid4
from chromadb.api.models.Collection import Collection
from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile
from fastapi.concurrency import run_in_threadpool
from firebase_admin import firestore, storage
from google.api_core.exceptions import FailedPrecondition
from config.chromaClient import get_chroma_collection
from core.firebase import (
    delete_storage_object,
    get_configured_bucket_name,
    get_firestore_client,
    verify_token,
)
from services.documentProcessing import prepare_document_for_chroma

router = APIRouter(prefix="/api", tags=["files"])

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
ALLOWED_EXTENSIONS = {"pdf", "docx", "doc", "csv", "xls", "xlsx", "txt"}


def _timestamp_to_iso(value):
    if isinstance(value, datetime):
        dt = value if value.tzinfo is not None else value.replace(tzinfo=timezone.utc)
        return dt.isoformat()

    if hasattr(value, "to_datetime"):
        dt = value.to_datetime()
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt.isoformat()

    return None


def _normalize_page(value: int) -> int:
    return value if value > 0 else 1


def _normalize_page_size(value: int) -> int:
    safe = value if value > 0 else 5
    return min(safe, 50)


def _build_storage_download_url(bucket_name: str, full_path: str, token: str) -> str:
    encoded_path = quote(full_path, safe="")
    return (
        f"https://firebasestorage.googleapis.com/v0/b/{bucket_name}/o/{encoded_path}"
        f"?alt=media&token={token}"
    )


@router.post("/upload-file")
async def upload_file(
    file: UploadFile = File(...),
    tenant_id: str = Form(...),
    admin_data: dict = Depends(verify_token),
):
    # Canonical upload flow: Storage + Firestore + Chroma, fully server-side.
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

        ids, documents, metadatas = prepare_document_for_chroma(filename, file_content)
        if not ids:
            raise HTTPException(
                status_code=422,
                detail=f"No extractable text found in '{filename}'.",
            )
        metadatas = [{**metadata, "tenant_id": tenant_id} for metadata in metadatas]

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
        download_url = _build_storage_download_url(
            resolved_bucket_name, storage_path, download_token
        )

        firestore_client.collection("documents").add(
            {
                "ownerId": tenant_id,
                "hospitalName": hospital_name,
                "type": "file",
                "name": filename,
                "url": download_url,
                "storagePath": storage_path,
                "sizeBytes": len(file_content),
                "createdAt": firestore.SERVER_TIMESTAMP,
            }
        )

        col: Collection = get_chroma_collection()
        await run_in_threadpool(
            col.add, ids=ids, documents=documents, metadatas=metadatas
        )

        return {
            "message": f"File {filename} uploaded.",
            "chunks_inserted": len(ids),
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/documents")
async def list_documents(
    page: int = Query(default=1),
    page_size: int = Query(default=5),
    search: str = Query(default=""),
    admin_data: dict = Depends(verify_token),
):
    try:
        admin_uid = admin_data.get("uid")
        if not admin_uid:
            raise HTTPException(status_code=401, detail="Unauthorized.")

        safe_page = _normalize_page(page)
        safe_page_size = _normalize_page_size(page_size)
        trimmed_search = search.strip().lower()

        firestore_client = get_firestore_client()
        docs_query = firestore_client.collection("documents").where(
            "ownerId", "==", admin_uid
        )

        try:
            snapshot = docs_query.order_by(
                "createdAt", direction=firestore.Query.DESCENDING
            ).stream()
            docs = list(snapshot)
        except FailedPrecondition:
            docs = list(docs_query.stream())

        mapped = []
        for document in docs:
            data = document.to_dict() or {}
            mapped.append(
                {
                    "id": document.id,
                    "ownerId": data.get("ownerId", ""),
                    "hospitalName": data.get("hospitalName", ""),
                    "type": data.get("type", "file"),
                    "name": data.get("name", "Untitled"),
                    "url": data.get("url", ""),
                    "storagePath": data.get("storagePath"),
                    "sizeBytes": data.get("sizeBytes"),
                    "createdAt": _timestamp_to_iso(data.get("createdAt")),
                }
            )

        mapped.sort(key=lambda item: item.get("createdAt") or "", reverse=True)

        if trimmed_search:
            mapped = [
                item
                for item in mapped
                if isinstance(item.get("name"), str)
                and trimmed_search in item["name"].lower()
            ]

        total = len(mapped)
        start = (safe_page - 1) * safe_page_size
        end = start + safe_page_size
        page_items = mapped[start:end]

        return {
            "items": page_items,
            "total": total,
            "page": safe_page,
            "page_size": safe_page_size,
            "has_next": end < total,
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
            warnings.append(
                "Chroma delete skipped: missing source name in Firestore doc."
            )

        return {
            "message": "Source deleted.",
            "warnings": warnings,
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
