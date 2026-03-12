from pydantic import BaseModel, Field, EmailStr


class RegisterRequest(BaseModel):
    hospital_name: str = Field(min_length=1, max_length=200)
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)
    website_url: str = Field(min_length=1, max_length=500)