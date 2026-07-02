import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.lot import Lot, LotStatus
from app.schemas.booking import BookingCreate
from app.schemas.common import ContactInfo
from app.services import bookings as bookings_service
from app.services.errors import ConflictError, NotFoundError


async def test_create_booking_marks_lot_as_reserved(session: AsyncSession, for_sale_lot: Lot):
    data = BookingCreate(
        lot_id=for_sale_lot.id,
        contact=ContactInfo(name="Ivan", contact_info="+79990000000"),
    )

    booking = await bookings_service.create_booking(session, data)

    assert booking.lot_id == for_sale_lot.id
    await session.refresh(for_sale_lot)
    assert for_sale_lot.status == LotStatus.RESERVED


async def test_cannot_book_already_reserved_lot(session: AsyncSession, for_sale_lot: Lot):
    data = BookingCreate(
        lot_id=for_sale_lot.id,
        contact=ContactInfo(name="Ivan", contact_info="+79990000000"),
    )
    await bookings_service.create_booking(session, data)

    with pytest.raises(ConflictError):
        await bookings_service.create_booking(session, data)


async def test_cannot_book_nonexistent_lot(session: AsyncSession):
    data = BookingCreate(
        lot_id=999999,
        contact=ContactInfo(name="Ivan", contact_info="+79990000000"),
    )

    with pytest.raises(NotFoundError):
        await bookings_service.create_booking(session, data)
