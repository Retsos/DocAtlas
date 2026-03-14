from typing import Any


def _chunk(values: list[str], size: int = 10) -> list[list[str]]:
    """
    Split a list into fixed-size chunks.

    This helper is mainly used to keep Firestore `in` queries within safe limits,
    because those queries accept only a bounded number of values per request.
    """
    return [values[i:i + size] for i in range(0, len(values), size)]


def build_citations(
    db: Any,
    tenant_id: str,
    retrieved_metadatas: list[dict[str, Any]],
    max_items: int = 10,
) -> list[dict[str, str | None]]:
    """
    Build a final citation list from retrieved metadata and Firestore document records.

    High-level flow:
    1) Keep retrieval order while removing duplicate candidates.
    2) Fetch matching Firestore documents by docId and by file name.
    3) Merge Firestore data with retrieval metadata and provide safe fallbacks.

    Args:
        db: Firestore client-like object used to query `documents`.
        tenant_id: Current tenant/owner identifier used for data isolation.
        retrieved_metadatas: Metadata list from retrieval pipeline.
        max_items: Maximum number of citations to return.
    """
    # Keep retrieval order and deduplicate by doc_id (or by normalized source name when doc_id is missing).
    citation_candidates: list[dict[str, str | None]] = []
    seen_keys: set[str] = set()

    for meta in retrieved_metadatas:
        # Defensive guard: ignore malformed metadata entries.
        if not isinstance(meta, dict):
            continue

        doc_id = meta.get("doc_id")
        source_name = meta.get("source")
        # Normalize source names to avoid duplicates caused by whitespace-only or padded names.
        normalized_source_name = (
            source_name.strip()
            if isinstance(source_name, str) and source_name.strip()
            else None
        )

        # Prefer doc_id as deduplication key because it is more stable than display names.
        dedupe_key = doc_id or normalized_source_name
        if isinstance(dedupe_key, str) and dedupe_key and dedupe_key not in seen_keys:
            seen_keys.add(dedupe_key)
            citation_candidates.append(
                {"doc_id": doc_id, "source_name": normalized_source_name}
            )

    # Hard-cap results to avoid over-querying Firestore and overloading response payload.
    safe_candidates = citation_candidates[:max_items]
    # Collect query inputs separately for docId and filename based lookups.
    doc_ids = [c["doc_id"] for c in safe_candidates if isinstance(c.get("doc_id"), str)]
    source_names = [
        c["source_name"] for c in safe_candidates if isinstance(c.get("source_name"), str)
    ]

    # Map Firestore documents by docId for fast O(1) candidate resolution.
    firestore_docs_by_doc_id: dict[str, dict[str, Any]] = {}
    for ids_chunk in _chunk(doc_ids, 10):
        # Query by tenant first, then by docId chunk.
        docs_ref = (
            db.collection("documents")
            .where("ownerId", "==", tenant_id)
            .where("docId", "in", ids_chunk)
            .stream()
        )
        for doc in docs_ref:
            data = doc.to_dict() or {}
            current_doc_id = data.get("docId")
            if isinstance(current_doc_id, str) and current_doc_id:
                firestore_docs_by_doc_id[current_doc_id] = data

    # Map Firestore documents by normalized file name when docId is unavailable.
    firestore_docs_by_name: dict[str, dict[str, Any]] = {}
    for names_chunk in _chunk(source_names, 10):
        docs_ref_by_name = (
            db.collection("documents")
            .where("ownerId", "==", tenant_id)
            .where("name", "in", names_chunk)
            .stream()
        )
        for doc in docs_ref_by_name:
            data = doc.to_dict() or {}
            name = data.get("name")
            if isinstance(name, str) and name.strip():
                firestore_docs_by_name[name.strip()] = data

    # Build the final API payload in the same order as `safe_candidates`.
    sources_list: list[dict[str, str | None]] = []
    for candidate in safe_candidates:
        candidate_doc_id = candidate.get("doc_id")
        candidate_name = candidate.get("source_name")

        data: dict[str, Any] = {}
        # Resolution priority:
        # 1) docId match (most reliable), 2) file name match (fallback path).
        if isinstance(candidate_doc_id, str) and candidate_doc_id in firestore_docs_by_doc_id:
            data = firestore_docs_by_doc_id[candidate_doc_id]
        elif isinstance(candidate_name, str) and candidate_name in firestore_docs_by_name:
            data = firestore_docs_by_name[candidate_name]

        # Prefer canonical Firestore filename, otherwise fallback to retrieval name, then generic label.
        file_name = data.get("name")
        if not isinstance(file_name, str) or not file_name.strip():
            file_name = candidate_name or "Unknown Document"

        # Keep URL always as a string to maintain consistent response shape.
        file_url = data.get("url")
        if not isinstance(file_url, str):
            file_url = ""

        # `docId` is kept from the retrieval candidate so callers can correlate responses.
        sources_list.append(
            {"name": file_name, "url": file_url, "docId": candidate_doc_id}
        )

    return sources_list
