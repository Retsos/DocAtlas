from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from api.routes.files import router as files_router
from api.routes.health import router as health_router
from api.routes.rag import router as query_router
from api.routes.account import router as account_router
from core.firebase import initialize_firebase
from core.rate_limit import limiter

# Initialize Firebase Admin once during app bootstrap.
initialize_firebase()

app = FastAPI()

# Register the global rate limiter instance on the app.
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS is a browser-side access control layer that limits which frontend origins
# can issue cross-site requests to this API. We keep an explicit allowlist for
# production domains and local dev hosts to avoid accidental open access while
# still supporting local development and Vercel-hosted clients.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://doc-atlas-taupe.vercel.app",
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
    ],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)

# Mount modular route groups.
app.include_router(health_router)
app.include_router(files_router)
app.include_router(query_router)
app.include_router(account_router)
