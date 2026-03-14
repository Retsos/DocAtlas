from dataclasses import dataclass
from typing import Any
from chromadb.api.models.Collection import Collection
from fastapi import HTTPException
from fastapi.concurrency import run_in_threadpool
from firebase_admin import storage
from core.firebase import delete_storage_object, get_configured_bucket_name
from services.doc_processing import prepare_document_for_chroma


def _optional_str(value: Any) -> str | None:
    if isinstance(value, str) and value:
        return value
    return None


@dataclass
class SourceInfo:
    storage_path: str | None
    source_name: str | None
    source_url: str | None
    source_type: str | None
    doc_id: str | None


def parse_source_info(source_data: dict) -> SourceInfo:
    return SourceInfo(
        storage_path=_optional_str(source_data.get("storagePath")),
        source_name=_optional_str(source_data.get("name")),
        source_url=_optional_str(source_data.get("url")),
        source_type=_optional_str(source_data.get("type")),
        doc_id=_optional_str(source_data.get("docId")),
    )


def ensure_owner(admin_uid: str, source_data: dict) -> None:
    source_owner_id = source_data.get("ownerId")
    if source_owner_id != admin_uid:
        raise HTTPException(status_code=403, detail="No permission.")


def validate_source_info(info: SourceInfo) -> None:
    if info.source_type == "file" and not info.storage_path:
        raise HTTPException(
            status_code=422,
            detail="Missing storagePath for file source.",
        )

    if not (info.doc_id or info.source_name):
        raise HTTPException(
            status_code=422,
            detail="Missing Chroma identifiers for delete.",
        )


def build_chroma_where(info: SourceInfo, admin_uid: str) -> dict:
    if info.doc_id:
        return {"$and": [{"doc_id": info.doc_id}, {"tenant_id": admin_uid}]}
    return {"$and": [{"source": info.source_name}, {"tenant_id": admin_uid}]}


def read_uploaded_docs_count(user_ref: Any) -> int:
    user_snapshot = user_ref.get()
    user_data = user_snapshot.to_dict() if user_snapshot.exists else {}
    current_count = user_data.get("uploadedDocsCount") if isinstance(user_data, dict) else 0
    return current_count if isinstance(current_count, int) else 0


async def restore_chroma_from_storage(
    admin_uid: str,
    col: Collection,
    info: SourceInfo,
) -> None:
    if info.storage_path and info.source_name:
        bucket_name = get_configured_bucket_name()
        bucket = storage.bucket(bucket_name or None)
        blob = bucket.blob(info.storage_path)
        file_bytes = blob.download_as_bytes()

        rollback_ids, rollback_documents, rollback_metadatas = (
            prepare_document_for_chroma(info.source_name, file_bytes)
        )
    elif info.source_url:
        rollback_ids, rollback_documents, rollback_metadatas = (
            prepare_document_for_chroma(url=info.source_url)
        )
    else:
        return

    rollback_metadatas = [
        {
            **metadata,
            "tenant_id": admin_uid,
            "doc_id": info.doc_id or metadata.get("doc_id"),
        }
        for metadata in rollback_metadatas
    ]
    await run_in_threadpool(
        col.add,
        ids=rollback_ids,
        documents=rollback_documents,
        metadatas=rollback_metadatas,
    )


async def rollback_delete(
    admin_uid: str,
    source_ref: Any,
    source_data: dict,
    user_ref: Any | None,
    previous_count: int | None,
    col: Collection,
    info: SourceInfo,
    chroma_deleted: bool,
    firestore_deleted: bool,
    count_updated: bool,
) -> None:
    # Best-effort rollback for partial deletes.
    if firestore_deleted and source_ref is not None and source_data is not None:
        try:
            source_ref.set(source_data)
        except Exception:
            pass

    if count_updated and user_ref is not None and previous_count is not None:
        try:
            user_ref.set({"uploadedDocsCount": previous_count}, merge=True)
        except Exception:
            pass

    if chroma_deleted:
        try:
            await restore_chroma_from_storage(admin_uid, col, info)
        except Exception:
            pass


async def delete_source_transaction(
    admin_uid: str,
    source_ref: Any,
    source_data: dict,
    firestore_client: Any,
    col: Collection,
) -> None:
    ensure_owner(admin_uid, source_data)
    info = parse_source_info(source_data)
    validate_source_info(info)

    chroma_deleted = False
    firestore_deleted = False
    count_updated = False
    previous_count: int | None = None
    user_ref = None

    try:
        chroma_where = build_chroma_where(info, admin_uid)
        await run_in_threadpool(col.delete, where=chroma_where)
        chroma_deleted = True

        source_ref.delete()
        firestore_deleted = True

        user_ref = firestore_client.collection("users").document(admin_uid)
        previous_count = read_uploaded_docs_count(user_ref)
        user_ref.set({"uploadedDocsCount": max(previous_count - 1, 0)}, merge=True)
        count_updated = True

        if info.storage_path:
            storage_delete_error = delete_storage_object(info.storage_path)
            if storage_delete_error:
                raise HTTPException(
                    status_code=500,
                    detail=f"Storage delete failed: {storage_delete_error}",
                )
    except HTTPException:
        await rollback_delete(
            admin_uid,
            source_ref,
            source_data,
            user_ref,
            previous_count,
            col,
            info,
            chroma_deleted,
            firestore_deleted,
            count_updated,
        )
        raise
    except Exception as exc:
        await rollback_delete(
            admin_uid,
            source_ref,
            source_data,
            user_ref,
            previous_count,
            col,
            info,
            chroma_deleted,
            firestore_deleted,
            count_updated,
        )
        raise HTTPException(status_code=500, detail=str(exc))
