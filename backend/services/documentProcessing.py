import uuid
import io
import pandas as pd
import requests
import string
from bs4 import BeautifulSoup
from pypdf import PdfReader
import docx2txt
import re


#Defined to prevent surpassing chroma limits and crashing the server
MAX_CHUNK_SIZE = 1000

#Normalizes Greek text by removing accents and converting to lowercase to help in hybrid search
def normalize_greek_text(text: str) -> str:
    if not text:
        return ""
    
    text = text.lower()

    #We keep letters, numbers and :/- for dates and urls, but remove other punctuation
    text = re.sub(r'[^\w\s/\-:]', '', text)

    return text.strip()


def extract_text_from_pdf(file_content: bytes) -> str:
    reader = PdfReader(io.BytesIO(file_content))
    return " ".join(page.extract_text() for page in reader.pages if page.extract_text())

def extract_text_from_docx(file_content: bytes) -> str:
    text = docx2txt.process(io.BytesIO(file_content))
    return text if text else ""

# def extract_text_from_csv(file_content: bytes) -> str:
#     df = pd.read_csv(io.BytesIO(file_content))
#     return df.to_string(index=False)

# def extract_text_from_excel(file_content: bytes) -> str:
#     df = pd.read_excel(io.BytesIO(file_content))
#     return df.to_string(index=False)

def extract_text_from_csv(file_content: bytes) -> str:
    # Διαβάζουμε χωρίς να θεωρούμε την πρώτη γραμμή "κεφαλίδα"
    df = pd.read_csv(io.BytesIO(file_content), header=None)
    df = df.fillna("")
    
    lines = []
    for index, row in df.iterrows():
        # Πετάμε τα κενά κελιά και τα σκουπίδια του Pandas
        row_values = [str(val).strip() for val in row.values if str(val).strip() and str(val).strip().lower() not in ['nan', 'unnamed']]
        if row_values:
            # Ενώνουμε τα κελιά της γραμμής με ένα καθαρό κενό.
            lines.append(" ".join(row_values))
            
    return "\n".join(lines)

def extract_text_from_excel(file_content: bytes) -> str:
    df = pd.read_excel(io.BytesIO(file_content), header=None)
    df = df.fillna("")
    
    lines = []
    for index, row in df.iterrows():
        row_values = [str(val).strip() for val in row.values if str(val).strip() and str(val).strip().lower() not in ['nan', 'unnamed']]
        if row_values:
            lines.append(" ".join(row_values))
            
    return "\n".join(lines)

#Scrapes paragraph text from a web page.
def extract_text_from_url(url: str) -> str:
    response = requests.get(url, timeout=10)
    response.raise_for_status()
    soup = BeautifulSoup(response.text, 'html.parser')
    return " ".join(p.get_text(strip=True) for p in soup.find_all('p'))


#Routes the input to the correct text extraction function based on file extension or URL.
def get_raw_text(file_name: str = None, file_content: bytes = None, url: str = None) -> str:
    if url:
        return extract_text_from_url(url)
        
    if not file_name or not file_content:
        raise ValueError("Must provide either a URL or a file_name and file_content")

    extension = file_name.split('.')[-1].lower()
    
    if extension == 'pdf':
        return extract_text_from_pdf(file_content)
    elif extension in ['docx', 'doc']:
        return extract_text_from_docx(file_content)
    elif extension == 'csv':
        return extract_text_from_csv(file_content)
    elif extension in ['xls', 'xlsx']:
        return extract_text_from_excel(file_content)
    elif extension == 'txt':
        return file_content.decode('utf-8')
    else:
        raise ValueError(f"Unsupported file type: {extension}")


#Extracts text, chunks it, and prepares the arrays for ChromaDB.
def chunk_text(text: str, chunk_size: int = 600) -> list[str]:
    lines = text.split('\n')
    chunks = []
    current_chunk = ""

    for line in lines:
        #Appends only if the line fits within the chunk size limit, otherwise saves the current chunk and starts a new one
        if len(current_chunk) + len(line) < chunk_size:
            current_chunk += " " + line if current_chunk else line
        else:

            if current_chunk:
                chunks.append(current_chunk.strip())
            
            #Defensive guard against long lines that exceed the chunk size on their own
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

    #Appends any remaining text as the last chunk
    if current_chunk:
        chunks.append(current_chunk.strip())

    return chunks


#Extracts text, chunks it, and prepares the arrays for ChromaDB.
def prepare_document_for_chroma(file_name: str = None, file_content: bytes = None, url: str = None):
    raw_text = get_raw_text(file_name, file_content, url)

    original_chunks = chunk_text(raw_text)

    if len(original_chunks) > MAX_CHUNK_SIZE:
        raise ValueError(f"Document is too large. Number of chunks: {len(original_chunks)}. Max allowed: {MAX_CHUNK_SIZE}")

    source_context = url if url else (file_name or "Άγνωστο Έγγραφο")
    enriched_chunks = [f"Πηγή {source_context}: {chunk}" for chunk in original_chunks]

    normalized_chunks = [normalize_greek_text(chunk) for chunk in original_chunks]

    #Prepares the metadata for chroma
    #TODO Add hospital id to link with front end
    source_name = url if url else file_name
    ids = [str(uuid.uuid4()) for _ in original_chunks]
    document_id = str(uuid.uuid4())
    extension = file_name.split('.')[-1].lower() if file_name else "url"

    metadatas = [{
            "source": source_name, 
            "chunk_index": i,
            "original_text": original_chunks[i],
            "doc_id": document_id,
            "file_type": extension
        } 
        for i in range(len(original_chunks))]
    
    return ids, normalized_chunks, metadatas