from pydantic import BaseModel, Field

class RequestBody(BaseModel):
    prompt: str
    top_k: int = Field(default=5, le=20)