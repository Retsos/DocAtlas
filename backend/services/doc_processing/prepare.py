import uuid

from services.doc_processing.chunking import chunk_tabular_file, chunk_text
from services.doc_processing.constants import MAX_CHUNK_SIZE
from services.doc_processing.extractors import get_raw_text
from services.doc_processing.normalization import normalize_greek_text

TABULAR_EXTENSIONS = {"csv", "xls", "xlsx"}


def prepare_document_for_chroma(
    file_name: str | None = None,
    file_content: bytes | None = None,
    url: str | None = None,
    document_title: str = "",
):
    """
    Main ingestion entrypoint. Routes files to the correct chunking strategy:
      - CSV / Excel  → chunk_tabular_file (self-contained row chunks)
      - Everything else → get_raw_text → chunk_text (sliding window)
    """
    extension = file_name.split(".")[-1].lower() if file_name else "url"

    if extension in TABULAR_EXTENSIONS and file_content:
        # Structured chunking: each chunk carries title + column labels + values.
        # Pass document_title from the upload form if available, otherwise
        # chunk_tabular_file will try to auto-detect it from the first rows.
        original_chunks = chunk_tabular_file(file_name, file_content, document_title)
    else:
        raw_text = get_raw_text(file_name, file_content, url)
        original_chunks = chunk_text(raw_text)

    if len(original_chunks) > MAX_CHUNK_SIZE:
        raise ValueError(
            f"Document is too large. Chunks: {len(original_chunks)}, max: {MAX_CHUNK_SIZE}"
        )

    normalized_chunks = [normalize_greek_text(chunk) for chunk in original_chunks]

    source_name = url if url else file_name
    document_id = str(uuid.uuid4())
    ids = [str(uuid.uuid4()) for _ in original_chunks]

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