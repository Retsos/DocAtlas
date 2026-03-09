from pydantic import BaseModel, Field

class RequestBody(BaseModel):
    tenant_id: str
    prompt: str
    top_k: int = Field(default=5, le=20)
