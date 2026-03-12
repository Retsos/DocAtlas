import io

import docx2txt
import pandas as pd
import requests
from bs4 import BeautifulSoup
from pypdf import PdfReader


def extract_text_from_pdf(file_content: bytes) -> str:
    # Read all PDF pages and concatenate extracted text.
    reader = PdfReader(io.BytesIO(file_content))
    return " ".join(page.extract_text() for page in reader.pages if page.extract_text())


def extract_text_from_docx(file_content: bytes) -> str:
    # docx2txt accepts a file-like object; return empty string when no text exists.
    text = docx2txt.process(io.BytesIO(file_content))
    return text if text else ""


def extract_text_from_csv(file_content: bytes) -> str:
    # Parse CSV without assuming header row and flatten rows to plain text lines.
    df = pd.read_csv(io.BytesIO(file_content), header=None)
    df = df.fillna("")

    lines: list[str] = []
    for _, row in df.iterrows():
        row_values = [
            str(val).strip()
            for val in row.values
            if str(val).strip() and str(val).strip().lower() not in ["nan", "unnamed"]
        ]
        if row_values:
            lines.append(" ".join(row_values))

    return "\n".join(lines)


def extract_text_from_excel(file_content: bytes) -> str:
    # Parse Excel sheets similarly to CSV so downstream chunking stays format-agnostic.
    df = pd.read_excel(io.BytesIO(file_content), header=None)
    df = df.fillna("")

    lines: list[str] = []
    for _, row in df.iterrows():
        row_values = [
            str(val).strip()
            for val in row.values
            if str(val).strip() and str(val).strip().lower() not in ["nan", "unnamed"]
        ]
        if row_values:
            lines.append(" ".join(row_values))

    return "\n".join(lines)


def extract_text_from_url(url: str) -> str:
    # Fetch HTML and keep only paragraph text for a clean content signal.
    response = requests.get(url, timeout=10)
    response.raise_for_status()
    soup = BeautifulSoup(response.text, "html.parser")
    return " ".join(p.get_text(strip=True) for p in soup.find_all("p"))


def get_raw_text(
    file_name: str | None = None,
    file_content: bytes | None = None,
    url: str | None = None,
) -> str:
    # Entry point for extraction:
    # URL input uses web extractor, file input is routed by extension.
    if url:
        return extract_text_from_url(url)

    if not file_name or not file_content:
        raise ValueError("Must provide either a URL or a file_name and file_content")

    extension = file_name.split(".")[-1].lower()

    if extension == "pdf":
        return extract_text_from_pdf(file_content)
    if extension in ["docx", "doc"]:
        return extract_text_from_docx(file_content)
    if extension == "csv":
        return extract_text_from_csv(file_content)
    if extension in ["xls", "xlsx"]:
        return extract_text_from_excel(file_content)
    if extension == "txt":
        return file_content.decode("utf-8")

    raise ValueError(f"Unsupported file type: {extension}")
