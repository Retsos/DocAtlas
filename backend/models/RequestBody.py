from pydantic import BaseModel, Field
from typing import List, Dict
class RequestBody(BaseModel):
    tenant_id: str
    prompt: str
    top_k: int = Field(default=5, le=20)
    history: List[Dict[str, str]] = []
