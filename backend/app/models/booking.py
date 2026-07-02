import enum
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base

if TYPE_CHECKING:
    from app.models.lot import Lot


class BookingStatus(str, enum.Enum):
    ACTIVE = "active"
    CANCELLED = "cancelled"


class Booking(Base):
    __tablename__ = "bookings"

    id: Mapped[int] = mapped_column(primary_key=True)
    lot_id: Mapped[int] = mapped_column(ForeignKey("lots.id", ondelete="CASCADE"))

    contact_name: Mapped[str]
    contact_info: Mapped[str]
    status: Mapped[BookingStatus] = mapped_column(default=BookingStatus.ACTIVE)

    created_at: Mapped[datetime] = mapped_column(server_default=func.now())

    lot: Mapped["Lot"] = relationship()
