from fastapi import APIRouter

router = APIRouter()


@router.get("/")
def health_check():
    # Lightweight readiness check used by infra and local testing.
    return {"message": "DocAtlas API is running."}
