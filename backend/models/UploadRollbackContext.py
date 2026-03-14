from typing import Any
from chromadb.api.models.Collection import Collection
from fastapi.concurrency import run_in_threadpool
from core.firebase import delete_storage_object

class UploadRollbackContext:
    storage_path: str | None = None
    doc_ref: Any | None = None
    col: Collection | None = None
    ids: list[str] | None = None
    chroma_attempted: bool = False


async def rollback_upload(context: UploadRollbackContext) -> None:
    # Best-effort cleanup for partial writes.
    if context.doc_ref is not None:
        try:
            context.doc_ref.delete()
        except Exception:
            pass

    if context.chroma_attempted and context.col is not None and context.ids:
        try:
            await run_in_threadpool(context.col.delete, ids=context.ids)
        except Exception:
            pass

    if context.storage_path:
        try:
            delete_storage_object(context.storage_path)
        except Exception:
            pass