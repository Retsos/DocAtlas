import chromadb
from chromadb import Schema, SparseVectorIndexConfig, K, VectorIndexConfig
from chromadb.api import ClientAPI
from chromadb.api.models.Collection import Collection
from chromadb.utils import embedding_functions
from dotenv import load_dotenv
import os

load_dotenv()

_client: ClientAPI | None = None
_collection: Collection | None = None


#Dense embedding for semantic search with open-source model from Hugging Face
hf_ef = embedding_functions.SentenceTransformerEmbeddingFunction(
    model_name="paraphrase-multilingual-MiniLM-L12-v2"
)

#Sparse Embedding for keyword-based search using BM25 algorithm
sparse_ef = embedding_functions.ChromaBm25EmbeddingFunction()

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

		schema = Schema()
		
		#Creates the dense index for semantic search
		schema.create_index(
            config=VectorIndexConfig(
                embedding_function=hf_ef
            )
        )

		#Creates the sparse index for keyword/date search
		schema.create_index(
			config=SparseVectorIndexConfig(
				embedding_function=sparse_ef,
				source_key=K.DOCUMENT
			),
			key="sparse_embedding"
		)

		#Fetches the collection if it exists, otherwise creates a new one
		_collection = client.get_or_create_collection(
		    name="documents",
			schema=schema
		)
	return _collection