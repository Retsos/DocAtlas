from chromadb.api.models.Collection import Collection
from fastapi import Depends, HTTPException
from fastapi.concurrency import run_in_threadpool
from firebase_admin import storage
from api.routes.files_routes.router import router
from config.chromaClient import get_chroma_collection
from core.firebase import (
    delete_storage_object,
    get_configured_bucket_name,
    get_firestore_client,
    verify_token,
)
from services.doc_processing import prepare_document_for_chroma


@router.delete("/delete-source/{source_id}")
async def delete_source(
    source_id: str,
    admin_data: dict = Depends(verify_token),
):
    # Canonical delete flow: Chroma index -> Firestore doc -> Storage object
    storage_path: str | None = None
    source_name: str | None = None
    source_url: str | None = None
    source_type: str | None = None
    doc_id: str | None = None
    source_data: dict | None = None
    source_ref = None
    user_ref = None
    col: Collection | None = None
    chroma_deleted = False
    firestore_deleted = False
    count_updated = False
    previous_count: int | None = None

    async def restore_chroma_from_storage(admin_uid: str) -> None:
        if col is None:
            return
        if storage_path and source_name:
            bucket_name = get_configured_bucket_name()
            bucket = storage.bucket(bucket_name or None)
            blob = bucket.blob(storage_path)
            file_bytes = blob.download_as_bytes()

            rollback_ids, rollback_documents, rollback_metadatas = (
                prepare_document_for_chroma(source_name, file_bytes)
            )
        elif source_url:
            rollback_ids, rollback_documents, rollback_metadatas = (
                prepare_document_for_chroma(url=source_url)
            )
        else:
            return

        rollback_metadatas = [
            {
                **metadata,
                "tenant_id": admin_uid,
                "doc_id": doc_id or metadata.get("doc_id"),
            }
            for metadata in rollback_metadatas
        ]
        await run_in_threadpool(
            col.add,
            ids=rollback_ids,
            documents=rollback_documents,
            metadatas=rollback_metadatas,
        )

    async def rollback_delete(admin_uid: str) -> None:
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
                await restore_chroma_from_storage(admin_uid)
            except Exception:
                pass

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
        source_url = source_data.get("url")
        source_type = source_data.get("type")
        doc_id = source_data.get("docId")

        if source_type == "file" and not (
            isinstance(storage_path, str) and storage_path
        ):
            raise HTTPException(
                status_code=422,
                detail="Missing storagePath for file source.",
            )

        if not (
            (isinstance(doc_id, str) and doc_id)
            or (isinstance(source_name, str) and source_name)
        ):
            raise HTTPException(
                status_code=422,
                detail="Missing Chroma identifiers for delete.",
            )

        col = get_chroma_collection()
        if isinstance(doc_id, str) and doc_id:
            chroma_where = {"$and": [{"doc_id": doc_id}, {"tenant_id": admin_uid}]}
        else:
            chroma_where = {"$and": [{"source": source_name}, {"tenant_id": admin_uid}]}

        await run_in_threadpool(col.delete, where=chroma_where)
        chroma_deleted = True

        source_ref.delete()
        firestore_deleted = True

        user_ref = firestore_client.collection("users").document(admin_uid)
        user_snapshot = user_ref.get()
        user_data = user_snapshot.to_dict() if user_snapshot.exists else {}
        previous_count = (
            user_data.get("uploadedDocsCount")
            if isinstance(user_data, dict)
            and isinstance(user_data.get("uploadedDocsCount"), int)
            else 0
        )
        user_ref.set({"uploadedDocsCount": max(previous_count - 1, 0)}, merge=True)
        count_updated = True

        if isinstance(storage_path, str) and storage_path:
            storage_delete_error = delete_storage_object(storage_path)
            if storage_delete_error:
                raise HTTPException(
                    status_code=500,
                    detail=f"Storage delete failed: {storage_delete_error}",
                )

        return {"message": "Source deleted.", "warnings": []}
    except HTTPException:
        await rollback_delete(admin_uid)
        raise
    except Exception as exc:
        await rollback_delete(admin_uid)
        raise HTTPException(status_code=500, detail=str(exc))
