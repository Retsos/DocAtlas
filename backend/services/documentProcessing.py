import uuid
import io
import pandas as pd
import requests
from bs4 import BeautifulSoup
from pypdf import PdfReader
import docx2txt

def extract_text_from_pdf(file_content: bytes) -> str:
    reader = PdfReader(io.BytesIO(file_content))
    return " ".join(page.extract_text() for page in reader.pages if page.extract_text())

def extract_text_from_docx(file_content: bytes) -> str:
    text = docx2txt.process(io.BytesIO(file_content))
    return text if text else ""

def extract_text_from_csv(file_content: bytes) -> str:
    df = pd.read_csv(io.BytesIO(file_content))
    return df.to_string(index=False)

def extract_text_from_excel(file_content: bytes) -> str:
    df = pd.read_excel(io.BytesIO(file_content))
    return df.to_string(index=False)

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
def chunk_text(text: str, chunk_size: int = 500, overlap: int = 50) -> list[str]:
    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunks.append(text[start:end])
        #Moves forward, but steps back by the overlap amount to maintain context between chunks
        start += chunk_size - overlap 
    return chunks


#Extracts text, chunks it, and prepares the arrays for ChromaDB.
def prepare_document_for_chroma(file_name: str = None, file_content: bytes = None, url: str = None):
    raw_text = get_raw_text(file_name, file_content, url)
    
    chunks = chunk_text(raw_text)
    
    #Prepares the metadata for chroma
    #TODO Add hospital id to link with front end
    source_name = url if url else file_name
    ids = [str(uuid.uuid4()) for _ in chunks]
    metadatas = [{"source": source_name, "chunk_index": i} for i in range(len(chunks))]
    
    return ids, chunks, metadatas