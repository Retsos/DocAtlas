from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query, Request
from firebase_admin import firestore
from api.routes.files_routes.shared import normalize_page_size, timestamp_to_iso
from core.firebase import get_firestore_client, verify_token
from services.logger import log_error

router = APIRouter(prefix="/api", tags=["logs"])

MAX_PAGE_SIZE = 100


def _coerce_datetime(value):
    if isinstance(value, datetime):
        return value if value.tzinfo is not None else value.replace(tzinfo=timezone.utc)

    if hasattr(value, "to_datetime"):
        dt = value.to_datetime()
        return dt if dt.tzinfo is not None else dt.replace(tzinfo=timezone.utc)

    return None


def _doc_to_item(doc) -> dict:
    data = doc.to_dict() or {}
    created_at = _coerce_datetime(data.get("createdAt"))
    return {
        "id": doc.id,
        **data,
        "createdAt": timestamp_to_iso(created_at),
    }


@router.get("/logs")
async def list_logs(
    request: Request,
    page_size: int = Query(default=25),
    event: str = Query(default=""),
    cursor: str = Query(default=""),
    admin_data: dict = Depends(verify_token),
):

    try:
        admin_uid = admin_data.get("uid")
        if not admin_uid:
            log_error(tenant_id=None, status_code=401, method=request.method, detail="Unauthorized.")
            raise HTTPException(status_code=401, detail="Unauthorized.")

        safe_page_size = min(normalize_page_size(page_size), MAX_PAGE_SIZE)
        event_filter = event.strip()

        firestore_client = get_firestore_client()
        logs_ref = firestore_client.collection("logs")

        query = logs_ref.where("tenantId", "==", admin_uid)

        if event_filter:
            query = query.where("event", "==", event_filter)

        query = query.order_by("createdAt", direction=firestore.Query.DESCENDING)

        # Resolve and apply the cursor if one was supplied.
        if cursor:
            cursor_snap = logs_ref.document(cursor).get()
            if cursor_snap.exists:
                query = query.start_after(cursor_snap)

        # Fetch one extra doc to determine if a next page exists.
        docs = list(query.limit(safe_page_size + 1).stream())

        has_next = len(docs) > safe_page_size
        page_docs = docs[:safe_page_size]

        return {
            "items": [_doc_to_item(doc) for doc in page_docs],
            "page_size": safe_page_size,
            "has_next": has_next,
            "next_cursor": page_docs[-1].id if has_next and page_docs else "",
        }

    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))