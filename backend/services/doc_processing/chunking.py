import io
import re

import pandas as pd


def chunk_text(text: str, chunk_size: int = 600) -> list[str]:
    """Prose chunker (PDF, DOCX, TXT) — unchanged from your original."""
    lines = text.split("\n")
    chunks: list[str] = []
    current_chunk = ""

    for line in lines:
        if len(current_chunk) + len(line) < chunk_size:
            current_chunk += " " + line if current_chunk else line
            continue
        if current_chunk:
            chunks.append(current_chunk.strip())
        if len(line) > chunk_size:
            words = line.split(" ")
            current_sub_chunk = ""
            for word in words:
                if len(current_sub_chunk) + len(word) < chunk_size:
                    current_sub_chunk += " " + word if current_sub_chunk else word
                else:
                    if current_sub_chunk:
                        chunks.append(current_sub_chunk.strip())
                    current_sub_chunk = word
            current_chunk = current_sub_chunk
        else:
            current_chunk = line

    if current_chunk:
        chunks.append(current_chunk.strip())
    return chunks


# ──────────────────────────────────────────────
# STRUCTURED CHUNKING FOR TABULAR FILES
# ──────────────────────────────────────────────

def _read_dataframe(file_name: str, file_content: bytes) -> pd.DataFrame:
    extension = file_name.split(".")[-1].lower()
    if extension == "csv":
        return pd.read_csv(io.BytesIO(file_content), header=None).fillna("")
    return pd.read_excel(io.BytesIO(file_content), header=None).fillna("")


def _positional_label(doc_title: str, values: list[str]) -> str:
    """Heuristic column labels when no header row is detected."""
    title_lower = doc_title.lower()

    if any(kw in title_lower for kw in ["εφημερι", "βαρδι", "on-call", "schedule"]):
        labels = ["Ημερομηνία", "Ημέρα", "Εφημερεύων 1", "Εφημερεύων 2", "Εφημερεύων 3"]
        return " | ".join(
            f"{labels[j]}: {values[j]}" for j in range(min(len(values), len(labels)))
        )

    if any(kw in title_lower for kw in ["χειρουργ", "επεμβ", "operat"]):
        labels = ["Ημερομηνία Επέμβασης", "Είδος Χειρουργείου"]
        return " | ".join(
            f"{labels[j]}: {values[j]}" for j in range(min(len(values), len(labels)))
        )

    return " | ".join(values)


def chunk_tabular_file(
    file_name: str,
    file_content: bytes,
    document_title: str = "",
) -> list[str]:
    """
    Converts CSV/Excel rows into self-contained natural-language chunks.

    Each chunk includes the document title + column labels + values so the
    retriever has full context without needing surrounding rows.

    Example output:
        "Πρόγραμμα Εφημεριών Μαρτίου 2026 – ΑΧΕΠΑ Παθολογική |
         Ημερομηνία: 04/03/2026 | Ημέρα: ΤΕΤΑΡΤΗ |
         Εφημερεύων 1: ΑΝΤΩΝΗΣ ΜΙΧΑΛΟΣ | Εφημερεύων 2: ΜΙΧΑΛΗΣ ΠΑΠΑΓΕΩΡΓΙΟΥ"
    """
    df = _read_dataframe(file_name, file_content)
    if df.empty:
        return []

    # ── Collect title from leading sparse rows ──
    title_rows: list[str] = []
    first_data_row_idx = 0
    for i, row in df.iterrows():
        vals = [str(v).strip() for v in row.values if str(v).strip()]
        if len(vals) <= 2 or int(str(i)) < 3:
            title_rows.append(" ".join(vals))
            first_data_row_idx = int(str(i)) + 1
        else:
            break

    doc_title = document_title or " ".join(title_rows).strip()

    # ── Detect header row ──
    header: list[str] = []
    for i in range(first_data_row_idx, len(df)):
        row_vals = [str(v).strip() for v in df.iloc[i].values if str(v).strip()]
        has_no_dates = not any(re.match(r"\d{1,2}/\d{1,2}/\d{4}", v) for v in row_vals)
        if row_vals and has_no_dates:
            header = row_vals
            first_data_row_idx = i + 1
            break

    # ── Emit one chunk per data row ──
    chunks: list[str] = []
    for i in range(first_data_row_idx, len(df)):
        row_vals = [
            str(v).strip() for v in df.iloc[i].values
            if str(v).strip() and str(v).strip().lower() not in ["nan", "unnamed"]
        ]
        if not row_vals:
            continue

        if header and len(header) >= len(row_vals):
            pairs = " | ".join(f"{header[j]}: {row_vals[j]}" for j in range(len(row_vals)))
        else:
            pairs = _positional_label(doc_title, row_vals)

        chunks.append(f"{doc_title} | {pairs}" if doc_title else pairs)

    return chunks