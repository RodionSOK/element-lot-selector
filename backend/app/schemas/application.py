from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.application import ApplicationStatus
from app.schemas.common import ContactInfo


class ApplicationCreate(BaseModel):
    lot_id: int | None = None
    contact: ContactInfo
    comment: str = Field(min_length=1, max_length=2000)


class ApplicationRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    lot_id: int | None
    contact_name: str
    contact_info: str
    comment: str
    status: ApplicationStatus
    created_at: datetime
