from pydantic import BaseModel

class RequestBody(BaseModel):
    prompt: str
    top_k: int = 5