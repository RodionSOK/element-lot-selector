from pydantic import BaseModel

from app.models.application import ApplicationStatus
from app.models.booking import BookingStatus


class LotIdParams(BaseModel):
    lot_id: int


class LotSetIdParams(BaseModel):
    lot_set_id: int


class BookingListParams(BaseModel):
    status: BookingStatus | None = None


class ApplicationListParams(BaseModel):
    status: ApplicationStatus | None = None


class FeedUploadParams(BaseModel):
    filename: str
    content_base64: str
