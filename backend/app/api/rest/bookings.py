from typing import Annotated

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_db
from app.schemas.booking import BookingCreate, BookingRead
from app.schemas.common import ContactInfo
from app.services import bookings as bookings_service

router = APIRouter(prefix="/lots", tags=["bookings"])


class BookingBody(BaseModel):
    contact: ContactInfo


@router.post("/{lot_id}/bookings", response_model=BookingRead, status_code=201)
async def create_booking(
    lot_id: int,
    payload: BookingBody,
    session: Annotated[AsyncSession, Depends(get_db)],
) -> BookingRead:
    data = BookingCreate(lot_id=lot_id, contact=payload.contact)
    return await bookings_service.create_booking(session, data)
