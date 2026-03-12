from urllib.parse import urlparse
from fastapi import APIRouter, Depends, HTTPException
from firebase_admin import auth, firestore
from core.firebase import get_firestore_client, verify_token
from models.RegisterRequest import RegisterRequest
from models.WebsiteUrlUpdateRequest import WebsiteUrlUpdateRequest

router = APIRouter(prefix="/api", tags=["account"])

def _normalize_origin(raw_value: str) -> str:
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
async def register_hospital(payload: RegisterRequest):
    try:
        normalized_origin = _normalize_origin(payload.website_url)
        created_user = auth.create_user(email=payload.email, password=payload.password)

        firestore_client = get_firestore_client()
        firestore_client.collection("users").document(created_user.uid).set(
            {
                "hospitalName": payload.hospital_name.strip(),
                "email": payload.email,
                "role": "admin",
                "websiteUrl": normalized_origin,
                "websiteUrlUpdatedAt": firestore.SERVER_TIMESTAMP,
                "createdAt": firestore.SERVER_TIMESTAMP,
            }
        )

        return {
            "uid": created_user.uid,
            "email": payload.email,
            "hospitalName": payload.hospital_name.strip(),
            "websiteUrl": normalized_origin,
        }
    except auth.EmailAlreadyExistsError:
        raise HTTPException(status_code=409, detail="This email is already in use.")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Register failed: {e}")


@router.get("/me")
async def get_me(admin_data: dict = Depends(verify_token)):
    try:
        uid = admin_data.get("uid")
        if not uid:
            raise HTTPException(status_code=401, detail="Unauthorized.")

        firestore_client = get_firestore_client()
        user_snapshot = firestore_client.collection("users").document(uid).get()
        user_data = user_snapshot.to_dict() if user_snapshot.exists else {}

        return {
            "id": uid,
            "email": admin_data.get("email") or user_data.get("email") or "",
            "hospitalName": user_data.get("hospitalName") or "Hospital",
            "role": user_data.get("role") or "admin",
            "websiteUrl": user_data.get("websiteUrl") if isinstance(user_data, dict) else None,
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load profile: {e}")


@router.get("/website-url")
async def get_website_url(admin_data: dict = Depends(verify_token)):
    try:
        uid = admin_data.get("uid")
        if not uid:
            raise HTTPException(status_code=401, detail="Unauthorized.")

        firestore_client = get_firestore_client()
        snapshot = firestore_client.collection("users").document(uid).get()
        if not snapshot.exists:
            return {"websiteUrl": None}

        data = snapshot.to_dict() or {}
        website_url = data.get("websiteUrl")
        return {"websiteUrl": website_url if isinstance(website_url, str) else None}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load website URL: {e}")


@router.put("/website-url")
async def update_website_url(
    payload: WebsiteUrlUpdateRequest,
    admin_data: dict = Depends(verify_token),
):
    try:
        uid = admin_data.get("uid")
        if not uid:
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
