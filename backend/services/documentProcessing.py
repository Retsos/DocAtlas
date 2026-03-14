# Backward-compatibility wrapper:
# older imports from services.documentProcessing continue to work
# while the implementation now lives in services.doc_processing.
# This file should contain no business logic; it only forwards imports.
from services.doc_processing import (
    MAX_CHUNK_SIZE,
    chunk_text,
    extract_text_from_csv,
    extract_text_from_docx,
    extract_text_from_excel,
    extract_text_from_pdf,
    extract_text_from_url,
    get_raw_text,
    normalize_greek_text,
    prepare_document_for_chroma,
)

__all__ = [
    "MAX_CHUNK_SIZE",
    "normalize_greek_text",
    "extract_text_from_pdf",
    "extract_text_from_docx",
    "extract_text_from_csv",
    "extract_text_from_excel",
    "extract_text_from_url",
    "get_raw_text",
    "chunk_text",
    "prepare_document_for_chroma",
]
