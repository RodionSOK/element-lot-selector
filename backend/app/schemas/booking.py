from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.models.booking import BookingStatus
from app.schemas.common import ContactInfo


class BookingCreate(BaseModel):
    lot_id: int
    contact: ContactInfo


class BookingRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    lot_id: int
    contact_name: str
    contact_info: str
    status: BookingStatus
    created_at: datetime
