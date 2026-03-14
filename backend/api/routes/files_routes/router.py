from fastapi import APIRouter

# Shared router used by all file-related endpoint modules.
router = APIRouter(prefix="/api", tags=["files"])
