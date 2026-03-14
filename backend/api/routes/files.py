# Backward-compatibility wrapper for the old route module path.
# server.py imports `api.routes.files.router`; real endpoint code now lives
# in `api.routes.files_routes` split by endpoint.
from api.routes.files_routes import router

__all__ = ["router"]
