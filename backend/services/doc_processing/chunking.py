import io
import pandas as pd

def chunk_text(text: str, chunk_size: int = 600) -> list[str]:
    """Prose chunker (PDF, DOCX, TXT) — unchanged."""
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
# STRUCTURED CHUNKING FOR TABULAR FILES (THE RIGHT WAY)
# ──────────────────────────────────────────────

def chunk_tabular_file(
    file_name: str,
    file_content: bytes,
    document_title: str = "",
) -> list[str]:
    """
    Διαβάζει οποιοδήποτε Excel/CSV δυναμικά, χωρίς hardcoded μαντεψιές.
    Κάθε γραμμή γίνεται ένα αυτόνομο chunk που ξέρει από ποιο αρχείο προήλθε
    και ποια είναι η κεφαλίδα κάθε κελιού της.
    """
    extension = file_name.split(".")[-1].lower()
    
    try:
        # Αφήνουμε το Pandas να βρει τις κεφαλίδες στην 1η γραμμή (default συμπεριφορά)
        if extension == "csv":
            df = pd.read_csv(io.BytesIO(file_content))
        else:
            df = pd.read_excel(io.BytesIO(file_content))
    except Exception as e:
        print(f"Σφάλμα ανάγνωσης του αρχείου {file_name}: {e}")
        return []

    # 1. Καθαρίζουμε τα σκουπίδια (εντελώς κενές γραμμές ή στήλες)
    df.dropna(how="all", inplace=True)
    df.dropna(axis=1, how="all", inplace=True)
    df = df.fillna("")

    # 2. Παίρνουμε τις δυναμικές κεφαλίδες του αρχείου
    headers = df.columns.tolist()
    chunks: list[str] = []

    # 3. Ορίζουμε την ταυτότητα (Πηγή) μία φορά
    source_identity = f"Πηγή: {file_name}"
    if document_title:
        source_identity += f" ({document_title})"

    # 4. Χτίζουμε τα chunks
    for _, row in df.iterrows():
        row_parts = []
        for header in headers:
            val = str(row[header]).strip()
            
            # Κρατάμε μόνο τα κελιά που έχουν δεδομένα. 
            # Αγνοούμε τις "Unnamed" στήλες που φτιάχνει το Pandas αν βρει κενά headers.
            if val and "unnamed" not in str(header).lower():
                row_parts.append(f"{header}: {val}")
        
        # Αν η γραμμή έχει έστω και ένα δεδομένο, την κάνουμε chunk
        if row_parts:
            chunk_text = f"{source_identity} | " + " - ".join(row_parts)
            chunks.append(chunk_text)

    return chunks