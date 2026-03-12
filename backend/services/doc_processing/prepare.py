import uuid

from services.doc_processing.chunking import chunk_text
from services.doc_processing.constants import MAX_CHUNK_SIZE
from services.doc_processing.extractors import get_raw_text
from services.doc_processing.normalization import normalize_greek_text


def prepare_document_for_chroma(
    file_name: str | None = None,
    file_content: bytes | None = None,
    url: str | None = None,
):
    # Main doc-processing entrypoint.
    # Called by: backend/api/routes/files.py -> upload_file() before col.add(...).
    # extract -> chunk -> validate size -> normalize -> build metadata payloads.
    raw_text = get_raw_text(file_name, file_content, url)
    original_chunks = chunk_text(raw_text)

    # Guard against oversized ingestion jobs.
    if len(original_chunks) > MAX_CHUNK_SIZE:
        raise ValueError(
            f"Document is too large. Number of chunks: {len(original_chunks)}. "
            f"Max allowed: {MAX_CHUNK_SIZE}"
        )

    # Keep searchable text normalized while storing original text in metadata.
    normalized_chunks = [normalize_greek_text(chunk) for chunk in original_chunks]

    # Build stable payload expected by Chroma add(ids, documents, metadatas).
    source_name = url if url else file_name
    ids = [str(uuid.uuid4()) for _ in original_chunks]
    document_id = str(uuid.uuid4())
    extension = file_name.split(".")[-1].lower() if file_name else "url"

    metadatas = [
        {
            "source": source_name,
            "chunk_index": i,
            "original_text": original_chunks[i],
            "doc_id": document_id,
            "file_type": extension,
        }
        for i in range(len(original_chunks))
    ]

    return ids, normalized_chunks, metadatas
