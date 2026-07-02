import enum
from datetime import datetime
from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, Numeric, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base

if TYPE_CHECKING:
    from app.models.lot_set import LotSet
    
class LotStatus(str, enum.Enum):
    FOR_SALE = "for_sale"
    RESERVED = "reserved"
    SOLD = "sold"
    
class Lot(Base):
    __tablename__ = "lots"
    
    id: Mapped[int] = mapped_column(primary_key=True)
    external_id: Mapped[str] = mapped_column(index=True)
    set_id: Mapped[int] = mapped_column(ForeignKey("lot_sets.id", ondelete="CASCADE"))
    
    project_name: Mapped[str]
    address: Mapped[str]
    rooms: Mapped[int]
    area: Mapped[Decimal] = mapped_column(Numeric(10, 2))
    floor: Mapped[int]
    price: Mapped[Decimal] = mapped_column(Numeric(14, 2))
    price_base: Mapped[Decimal] = mapped_column(Numeric(14, 2))
    status: Mapped[LotStatus] = mapped_column(default=LotStatus.FOR_SALE)

    created_at: Mapped[datetime] = mapped_column(server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(server_default=func.now(), onupdate=func.now())

    lot_set: Mapped["LotSet"] = relationship(back_populates="lots")