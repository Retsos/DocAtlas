import re
from pydantic import BaseModel, Field, field_validator
from typing import List, Dict

class RequestBody(BaseModel):
    tenant_id: str
    prompt: str = Field(..., max_length=1000)
    top_k: int = Field(default=5, le=20)
    history: List[Dict[str, str]] = []

    @field_validator('prompt')
    @classmethod
    def sanitize_prompt(cls, v: str) -> str:
        #Removes all HTML like characters
        clean_text = re.sub(r'<[^>]+>', '', v)
        
        #Removes special characters which could produce errors to databases
        clean_text = re.sub(r'[\x00-\x1F\x7F]', '', clean_text)
        
        return clean_text.strip()