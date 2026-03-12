from datetime import datetime, timezone
from urllib.parse import quote

# Per-file upload limit (10MB).
MAX_FILE_SIZE = 10 * 1024 * 1024
ALLOWED_EXTENSIONS = {"pdf", "docx", "doc", "csv", "xls", "xlsx", "txt"}


def timestamp_to_iso(value):
    if isinstance(value, datetime):
        dt = value if value.tzinfo is not None else value.replace(tzinfo=timezone.utc)
        return dt.isoformat()

    if hasattr(value, "to_datetime"):
        dt = value.to_datetime()
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt.isoformat()

    return None


def normalize_page(value: int) -> int:
    return value if value > 0 else 1


def normalize_page_size(value: int) -> int:
    safe = value if value > 0 else 5
    return min(safe, 50)


def build_storage_download_url(bucket_name: str, full_path: str, token: str) -> str:
    encoded_path = quote(full_path, safe="")
    return (
        f"https://firebasestorage.googleapis.com/v0/b/{bucket_name}/o/{encoded_path}"
        f"?alt=media&token={token}"
    )
