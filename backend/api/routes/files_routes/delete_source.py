from fastapi import Depends, HTTPException, Query, Request
from api.routes.files_routes.router import router
from config.chromaClient import get_chroma_collection
from core.firebase import get_firestore_client, verify_token
from models.DeleteSourceTransaction import delete_source_transaction
from services.logger import log_error, log_document_deleted


@router.delete("/delete-source/{source_id}")
async def delete_source(
    request: Request,
    source_id: str,
    admin_data: dict = Depends(verify_token),
):
    try:
        admin_uid = admin_data.get("uid")
        if not admin_uid:
            log_error(tenant_id=None, status_code=401, method=request.method, detail="Unauthorized.")
            raise HTTPException(status_code=401, detail="Unauthorized.")

        firestore_client = get_firestore_client()
        source_ref = firestore_client.collection("documents").document(source_id)
        source_snapshot = source_ref.get()

        if not source_snapshot.exists:
            log_error(tenant_id=admin_uid, status_code=404, method=request.method, detail="Source not found.")
            raise HTTPException(status_code=404, detail="Source not found.")

        source_data = source_snapshot.to_dict() or {}

        source_owner_id = source_data.get("ownerId")
        storage_path = source_data.get("storagePath")
        source_name = source_data.get("name")
        if source_owner_id != admin_uid:
            log_error(tenant_id=admin_uid, status_code=403, method=request.method, detail="No permission.")
            raise HTTPException(status_code=403, detail="No permission.")

        await delete_source_transaction(
            admin_uid=admin_uid,
            source_ref=source_ref,
            source_data=source_data,
            firestore_client=firestore_client,
            col=get_chroma_collection(),
        )

        log_document_deleted(
            user_id=admin_uid,
            document_id=source_id,
            name=source_name if isinstance(source_name, str) else None,
            storage_path=storage_path if isinstance(storage_path, str) else None,
        )

        return {"message": "Source deleted.", "warnings": []}
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.delete("/delete-all-sources")
async def delete_all_sources(
    request: Request,
    ownerId: str = Query(...),
    admin_data: dict = Depends(verify_token),
):
    # Canonical bulk delete flow: Chroma index -> Firestore doc -> Storage object.
    try:
        admin_uid = admin_data.get("uid")
        if not admin_uid:
            log_error(tenant_id=None, status_code=401, method=request.method, detail="Unauthorized.")
            raise HTTPException(status_code=401, detail="Unauthorized.")

        # Security check: Ensure they are only deleting their own files
        if ownerId != admin_uid:
            log_error(tenant_id=admin_uid, status_code=403, method=request.method, detail="No permission.")
            raise HTTPException(status_code=403, detail="No permission.")

        firestore_client = get_firestore_client()
        docs_query = firestore_client.collection("documents").where(
            "ownerId", "==", admin_uid
        )
        
        docs = list(docs_query.stream())
        if not docs:
            return {
                "message": "No sources found to delete.",
                "warnings": [],
            }

        deleted_count = 0

        col = get_chroma_collection()

        for doc in docs:
            source_data = doc.to_dict() or {}
            await delete_source_transaction(
                admin_uid=admin_uid,
                source_ref=doc.reference,
                source_data=doc.to_dict() or {},
                firestore_client=firestore_client,
                col=col,
            )

            storage_path = source_data.get("storagePath")
            source_name = source_data.get("name")

            log_document_deleted(
                user_id=admin_uid,
                document_id=doc.id,
                name=source_name if isinstance(source_name, str) else None,
                storage_path=storage_path if isinstance(storage_path, str) else None,
            )


            deleted_count += 1

        return {
            "message": f"Successfully deleted {deleted_count} sources.",
            "warnings": [],
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
