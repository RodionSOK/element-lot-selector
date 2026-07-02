from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base

if TYPE_CHECKING:
    from app.models.lot import Lot
    
class LotSet(Base):
    __tablename__ = "lot_sets"
    
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str]
    uploaded_at: Mapped[datetime] = mapped_column(server_default=func.now())
    lots_count: Mapped[int] = mapped_column(default=0)
    is_active: Mapped[bool] = mapped_column(default=False)
    
    lots: Mapped[list["Lot"]] = relationship(
        back_populates="lot_set", cascade="all, delete-orphan"
    )