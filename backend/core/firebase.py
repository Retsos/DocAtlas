import json
import os

import firebase_admin
from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from firebase_admin import auth, credentials, firestore, storage

security = HTTPBearer()


def normalize_bucket_name(bucket_name: str) -> str:
    # Firebase Admin expects the raw bucket name, not gs:// URL format.
    if bucket_name.startswith("gs://"):
        return bucket_name.replace("gs://", "", 1)
    return bucket_name


def get_configured_bucket_name() -> str:
    # Priority: explicit env var.
    explicit_bucket = normalize_bucket_name(
        os.getenv("FIREBASE_STORAGE_BUCKET", "").strip()
    )
    if explicit_bucket:
        return explicit_bucket

    # Fallback: infer from service account project_id.
    firebase_creds = os.getenv("FIREBASE_SERVICE_ACCOUNT", "").strip()
    if not firebase_creds:
        return ""

    try:
        parsed = json.loads(firebase_creds)
    except Exception:
        return ""

    project_id = parsed.get("project_id")
    if not isinstance(project_id, str) or not project_id:
        return ""

    # Firebase default bucket naming used by newer projects.
    return f"{project_id}.firebasestorage.app"


def initialize_firebase() -> None:
    firebase_creds = os.getenv("FIREBASE_SERVICE_ACCOUNT")
    firebase_storage_bucket = get_configured_bucket_name()

    if not firebase_creds:
        print("Warning: No Firebase credentials found. Authentication will fail.")
        return

    # Avoid re-initializing when the module is imported multiple times.
    if firebase_admin._apps:
        return

    cred = credentials.Certificate(json.loads(firebase_creds))
    firebase_options = {}
    if firebase_storage_bucket:
        firebase_options["storageBucket"] = firebase_storage_bucket

    if firebase_options:
        firebase_admin.initialize_app(cred, firebase_options)
    else:
        firebase_admin.initialize_app(cred)


def verify_token(creds: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    # Shared auth dependency for protected endpoints.
    try:
        return auth.verify_id_token(creds.credentials)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token.")


def get_firestore_client():
    return firestore.client()


def delete_storage_object(storage_path: str) -> str | None:
    # Best-effort storage delete: return an error string instead of raising.
    if not storage_path:
        return None

    try:
        default_bucket = storage.bucket()
        default_bucket.blob(storage_path).delete()
        return None
    except ValueError:
        pass
    except Exception as exc:
        return str(exc)

    fallback_bucket_name = get_configured_bucket_name()
    if not fallback_bucket_name:
        return "Storage bucket is not configured. Set FIREBASE_STORAGE_BUCKET."

    try:
        fallback_bucket = storage.bucket(fallback_bucket_name)
        fallback_bucket.blob(storage_path).delete()
        return None
    except Exception as exc:
        return str(exc)
