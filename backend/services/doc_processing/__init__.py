# Package import surface for doc processing.
# Important: there is no "runtime init" logic here; this file only re-exports symbols.
# Python loads this file when code does: `import services.doc_processing ...`.
from services.doc_processing.chunking import chunk_text
from services.doc_processing.constants import MAX_CHUNK_SIZE
from services.doc_processing.extractors import (
    extract_text_from_csv,
    extract_text_from_docx,
    extract_text_from_excel,
    extract_text_from_pdf,
    extract_text_from_url,
    get_raw_text,
)
from services.doc_processing.normalization import normalize_greek_text
from services.doc_processing.prepare import prepare_document_for_chroma

# Re-exported API surface for clean imports.
# Example: from services.doc_processing import prepare_document_for_chroma
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
