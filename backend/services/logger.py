from __future__ import annotations
from typing import Any
from firebase_admin import firestore
from core.firebase import get_firestore_client

def _safe_write_log(payload: dict[str, Any]) -> None:
    #Best-effort logging to firestore
    try:
        firestore_client = get_firestore_client()
        firestore_client.collection("logs").add(payload)
    except Exception:
        #Intentionally swallows logging failures to avoid breaking primary flows
        return


def log_account_created(
    *,
    user_id: str,
    email: str,
    hospital_name: str,
    website_url: str,
) -> None:
    _safe_write_log(
        {
            "event": "account_created",
            "actorId": user_id,
            "actorEmail": email,
            "hospitalName": hospital_name,
            "websiteUrl": website_url,
            "createdAt": firestore.SERVER_TIMESTAMP,
        }
    )


def log_document_uploaded(
    *,
    user_id: str,
    document_id: str | None,
    name: str,
    size_bytes: int,
    storage_path: str,
    download_url: str,
    hospital_name: str | None = None,
) -> None:
    payload: dict[str, Any] = {
        "event": "document_uploaded",
        "actorId": user_id,
        "documentId": document_id,
        "name": name,
        "sizeBytes": size_bytes,
        "storagePath": storage_path,
        "url": download_url,
        "createdAt": firestore.SERVER_TIMESTAMP,
    }
    if hospital_name:
        payload["hospitalName"] = hospital_name

    _safe_write_log(payload)


def log_document_deleted(
    *,
    user_id: str,
    document_id: str,
    name: str | None = None,
    storage_path: str | None = None,
) -> None:
    payload: dict[str, Any] = {
        "event": "document_deleted",
        "actorId": user_id,
        "documentId": document_id,
        "createdAt": firestore.SERVER_TIMESTAMP,
    }
    if name:
        payload["name"] = name
    if storage_path:
        payload["storagePath"] = storage_path

    _safe_write_log(payload)


def log_error(
    *,
    tenant_id: str | None,
    status_code: int,
    method: str,
    detail: str,
) -> None:
    payload: dict[str, Any] = {
        "event": "error",
        "statusCode": status_code,
        "method": method,
        "detail": detail,
        "createdAt": firestore.SERVER_TIMESTAMP,
    }
    if tenant_id:
        payload["tenantId"] = tenant_id

    _safe_write_log(payload)


def log_chat_message(
    *,
    tenant_id: str,
    prompt: str,
    origin: str | None = None,
) -> str | None:
    payload: dict[str, Any] = {
        "event": "chat_message",
        "tenantId": tenant_id,
        "prompt": prompt,
        "response": None,
        "createdAt": firestore.SERVER_TIMESTAMP,
    }
    if origin:
        payload["origin"] = origin

    try:
        firestore_client = get_firestore_client()
        _, doc_ref = firestore_client.collection("logs").add(payload)
        return doc_ref.id if doc_ref else None
    except Exception:
        return None


def log_chat_response(
    *,
    log_id: str | None,
    response: str,
    intent: str | None = None,
) -> None:
    if not log_id:
        return

    payload: dict[str, Any] = {
        "response": response,
    }
    if intent:
        payload["intent"] = intent

    try:
        firestore_client = get_firestore_client()
        firestore_client.collection("logs").document(log_id).set(payload, merge=True)
    except Exception:
        return
