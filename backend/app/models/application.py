import enum
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base

if TYPE_CHECKING:
    from app.models.lot import Lot


class ApplicationStatus(str, enum.Enum):
    NEW = "new"
    IN_PROGRESS = "in_progress"
    CLOSED = "closed"


class Application(Base):
    __tablename__ = "applications"

    id: Mapped[int] = mapped_column(primary_key=True)
    lot_id: Mapped[int | None] = mapped_column(
        ForeignKey("lots.id", ondelete="SET NULL"), nullable=True
    )

    contact_name: Mapped[str]
    contact_info: Mapped[str]
    comment: Mapped[str] = mapped_column(Text)
    status: Mapped[ApplicationStatus] = mapped_column(default=ApplicationStatus.NEW)

    created_at: Mapped[datetime] = mapped_column(server_default=func.now())

    lot: Mapped["Lot | None"] = relationship()
