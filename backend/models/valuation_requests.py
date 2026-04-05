from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field


class PublicValuationRequestCreate(BaseModel):
    full_name: str = Field(min_length=2, max_length=160)
    email: EmailStr
    phone: Optional[str] = Field(default=None, max_length=64)
    property_address: Optional[str] = Field(default=None, max_length=500)
    message: Optional[str] = Field(default=None, max_length=3000)
    captcha_provider: Optional[str] = Field(default=None, max_length=32)
    captcha_token: Optional[str] = Field(default=None, max_length=4096)
    submission_language: str = Field(default="es", max_length=8)
    submission_source: str = Field(default="private_estates_landing")
