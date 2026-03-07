import chromadb
from chromadb.api import ClientAPI
from chromadb.api.models.Collection import Collection
from chromadb.utils import embedding_functions
from dotenv import load_dotenv
import os

load_dotenv()

_client: ClientAPI | None = None
_collection: Collection | None = None

def get_chroma_client() -> ClientAPI:
	global _client
	if _client is None:
		_client = chromadb.CloudClient(
            api_key=os.getenv("CHROMA_API_KEY"),
            tenant=os.getenv("CHROMA_TENANT"),
            database=os.getenv("CHROMA_DATABASE")
        )
	return _client


def get_chroma_collection() -> Collection:
	global _collection
	if _collection is None:
		client = get_chroma_client()

		#Open-source model from Huggingface
		ef = embedding_functions.SentenceTransformerEmbeddingFunction(
			model_name="paraphrase-multilingual-MiniLM-L12-v2"
		)

		#Fetches the collection if it exists, otherwise creates a new one
		_collection = client.get_or_create_collection(
		    name="documents",
			embedding_function=ef
		)
	return _collection