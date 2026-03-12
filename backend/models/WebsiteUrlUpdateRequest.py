from pydantic import BaseModel, Field

class WebsiteUrlUpdateRequest(BaseModel):
    website_url: str = Field(min_length=1, max_length=500)
