from datetime import datetime
from decimal import Decimal
from enum import Enum

from pydantic import BaseModel, ConfigDict, Field, HttpUrl

from app.models.lot import LotStatus


class LotRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    external_id: str
    set_id: int
    project_name: str
    address: str
    rooms: int
    area: Decimal
    floor: int
    price: Decimal
    price_base: Decimal
    price_per_sqm: Decimal | None
    status: LotStatus
    created_at: datetime
    
class LotSortField(str, Enum):
    PRICE = "price"
    PRICE_PER_SQM = "price_per_sqm"
    AREA = "area"
    CREATED_AT = "created_at"
    
class SortDirection(str, Enum):
    ASC = "asc"
    DESC = "desc"
    
class LotListParams(BaseModel):
    project_name: str | None = None
    rooms: int | None = None
    price_per_sqm_min: Decimal | None = None
    price_per_sqm_max: Decimal | None = None
    status: LotStatus | None = None
    sort_by: LotSortField = LotSortField.CREATED_AT
    sort_dir: SortDirection = SortDirection.DESC
    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=20, ge=1, le=100)
    
class LotSetRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    name: str
    uploaded_at: datetime
    lots_count: int
    is_active: bool
    
class FeedUploadResult(BaseModel):
    lot_set: LotSetRead
    skipped_count: int
    
class FeedUploadUrlRequest(BaseModel):
    url: HttpUrl
