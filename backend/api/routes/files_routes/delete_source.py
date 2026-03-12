from chromadb.api.models.Collection import Collection
from fastapi import Depends, HTTPException

from api.routes.files_routes.router import router
from config.chromaClient import get_chroma_collection
from core.firebase import delete_storage_object, get_firestore_client, verify_token


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
        user_ref = firestore_client.collection("users").document(admin_uid)
        user_snapshot = user_ref.get()
        user_data = user_snapshot.to_dict() if user_snapshot.exists else {}
        current_count = (
            user_data.get("uploadedDocsCount")
            if isinstance(user_data, dict)
            and isinstance(user_data.get("uploadedDocsCount"), int)
            else 0
        )
        user_ref.set({"uploadedDocsCount": max(current_count - 1, 0)}, merge=True)

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
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))
