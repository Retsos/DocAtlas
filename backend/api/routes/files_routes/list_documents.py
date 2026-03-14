from fastapi import Depends, HTTPException, Query
from firebase_admin import firestore
from google.api_core.exceptions import FailedPrecondition

from api.routes.files_routes.router import router
from api.routes.files_routes.shared import normalize_page, normalize_page_size, timestamp_to_iso
from core.firebase import get_firestore_client, verify_token


@router.get("/documents")
async def list_documents(
    page: int = Query(default=1),
    page_size: int = Query(default=5),
    search: str = Query(default=""),
    admin_data: dict = Depends(verify_token),
):
    # Paginated document listing scoped to authenticated owner.
    try:
        admin_uid = admin_data.get("uid")
        if not admin_uid:
            raise HTTPException(status_code=401, detail="Unauthorized.")

        safe_page = normalize_page(page)
        safe_page_size = normalize_page_size(page_size)
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
                    "createdAt": timestamp_to_iso(data.get("createdAt")),
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
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))
