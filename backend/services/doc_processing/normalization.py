import re


def normalize_greek_text(text: str) -> str:
    # Normalize search text for hybrid retrieval:
    # 1) lowercase, 2) remove punctuation noise, 3) preserve date/url symbols.
    if not text:
        return ""

    lowered = text.lower()
    cleaned = re.sub(r"[^\w\s/\-:]", "", lowered)
    return cleaned.strip()
