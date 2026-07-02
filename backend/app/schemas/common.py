from typing import Generic, TypeVar

from pydantic import BaseModel, Field

T = TypeVar("T")

class ContactInfo(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    contact_info: str = Field(min_length=1, max_length=255)
    
class Page(BaseModel, Generic[T]):
    items: list[T]
    total: int
    page: int
    page_size: int
    