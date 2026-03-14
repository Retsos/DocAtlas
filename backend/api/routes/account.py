from urllib.parse import urlparse
from fastapi import APIRouter, Depends, HTTPException, Request
from firebase_admin import auth, firestore
from core.firebase import get_firestore_client, verify_token
from models.RegisterRequest import RegisterRequest
from models.WebsiteUrlUpdateRequest import WebsiteUrlUpdateRequest
from services.logger import log_account_created, log_error

router = APIRouter(prefix="/api", tags=["account"])


def _normalize_origin(raw_value: str) -> str:
    # Normalize tenant website URL to strict origin format: scheme + host.
    # Used for per-tenant origin checks in query endpoints.
    candidate = raw_value.strip()
    if not candidate:
        raise HTTPException(status_code=400, detail="Website URL is required.")

    if not candidate.startswith(("http://", "https://")):
        candidate = f"https://{candidate}"

    parsed = urlparse(candidate)
    if parsed.scheme not in {"http", "https"} or not parsed.netloc:
        raise HTTPException(status_code=400, detail="Invalid website URL.")

    return f"{parsed.scheme}://{parsed.netloc}"


@router.post("/auth/register")
async def register_hospital(payload: RegisterRequest, request: Request):
    try:
        normalized_origin = _normalize_origin(payload.website_url)
        created_user = auth.create_user(email=payload.email, password=payload.password)

        firestore_client = get_firestore_client()
        firestore_client.collection("users").document(created_user.uid).set(
            {
                "hospitalName": payload.hospital_name.strip(),
                "email": payload.email,
                "role": "admin",
                "uploadedDocsCount": 0,
                "websiteUrl": normalized_origin,
                "websiteUrlUpdatedAt": firestore.SERVER_TIMESTAMP,
                "createdAt": firestore.SERVER_TIMESTAMP,
            }
        )

        log_account_created(
            user_id=created_user.uid,
            email=payload.email,
            hospital_name=payload.hospital_name.strip(),
            website_url=normalized_origin,
        )

        return {
            "uid": created_user.uid,
            "email": payload.email,
            "hospitalName": payload.hospital_name.strip(),
            "websiteUrl": normalized_origin,
        }
    except auth.EmailAlreadyExistsError:
        detail_msg = "This email is already in use."
        log_error(tenant_id=None, status_code=409, method=request.method, detail=detail_msg)
        raise HTTPException(status_code=409, detail=detail_msg)
    except HTTPException as e:
        log_error(tenant_id=None, status_code=e.status_code, method=request.method, detail=e.detail)
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Register failed: {e}")


@router.get("/me")
async def get_me(request: Request, admin_data: dict = Depends(verify_token)):
    try:
        uid = admin_data.get("uid")
        if not uid:
            log_error(tenant_id=None, status_code=401, method=request.method, detail="Unauthorized.")
            raise HTTPException(status_code=401, detail="Unauthorized.")

        firestore_client = get_firestore_client()
        user_snapshot = firestore_client.collection("users").document(uid).get()
        user_data = user_snapshot.to_dict() if user_snapshot.exists else {}

        return {
            "id": uid,
            "email": admin_data.get("email") or user_data.get("email") or "",
            "hospitalName": user_data.get("hospitalName") or "Hospital",
            "role": user_data.get("role") or "admin",
            "uploadedDocsCount": (
                user_data.get("uploadedDocsCount")
                if isinstance(user_data.get("uploadedDocsCount"), int)
                and user_data.get("uploadedDocsCount") >= 0
                else 0
            ),
            "websiteUrl": user_data.get("websiteUrl") if isinstance(user_data, dict) else None,
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load profile: {e}")


@router.get("/website-url")
async def get_website_url(request: Request,admin_data: dict = Depends(verify_token)):
    try:
        uid = admin_data.get("uid")
        if not uid:
            log_error(tenant_id=None, status_code=401, method=request.method, detail="Unauthorized.")
            raise HTTPException(status_code=401, detail="Unauthorized.")

        firestore_client = get_firestore_client()
        snapshot = firestore_client.collection("users").document(uid).get()
        if not snapshot.exists:
            return {"websiteUrl": None}

        data = snapshot.to_dict() or {}
        website_url = data.get("websiteUrl")
        return {"websiteUrl": website_url if isinstance(website_url, str) else None}
    except HTTPException as e:
        log_error(tenant_id=None, status_code=e.status_code, method=request.method, detail=e.detail)
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load website URL: {e}")


@router.put("/website-url")
async def update_website_url(
    request: Request,
    payload: WebsiteUrlUpdateRequest,
    admin_data: dict = Depends(verify_token),
):
    # Update tenant's allowlisted origin used for widget/API origin validation.
    try:
        uid = admin_data.get("uid")
        if not uid:
            log_error(tenant_id=None, status_code=401, method=request.method, detail="Unauthorized.")
            raise HTTPException(status_code=401, detail="Unauthorized.")

        normalized_origin = _normalize_origin(payload.website_url)
        firestore_client = get_firestore_client()
        firestore_client.collection("users").document(uid).set(
            {
                "websiteUrl": normalized_origin,
                "websiteUrlUpdatedAt": firestore.SERVER_TIMESTAMP,
            },
            merge=True,
        )

        return {"websiteUrl": normalized_origin}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update website URL: {e}")
