import structlog
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.booking import Booking, BookingStatus
from app.models.lot import Lot, LotStatus
from app.schemas.booking import BookingCreate, BookingRead
from app.services.errors import ConflictError, NotFoundError

logger = structlog.get_logger(__name__)


async def create_booking(session: AsyncSession, data: BookingCreate) -> BookingRead:
    lot = (
        await session.execute(select(Lot).where(Lot.id == data.lot_id).with_for_update())
    ).scalar_one_or_none()

    if lot is None:
        raise NotFoundError(f"lot {data.lot_id} not found")

    if lot.status != LotStatus.FOR_SALE:
        raise ConflictError(f"lot {lot.id} is not available for booking")


    lot.status = LotStatus.RESERVED

    booking = Booking(
        lot_id=lot.id,
        contact_name=data.contact.name,
        contact_info=data.contact.contact_info,
    )
    session.add(booking)
    await session.commit()
    await session.refresh(booking)

    logger.info("booking.created", lot_id=lot.id, booking_id=booking.id)

    return BookingRead.model_validate(booking)


async def list_bookings(
    session: AsyncSession, status: BookingStatus | None = None
) -> list[BookingRead]:
    query = select(Booking).order_by(Booking.created_at.desc())
    if status is not None:
        query = query.where(Booking.status == status)

    result = await session.execute(query)
    return [BookingRead.model_validate(booking) for booking in result.scalars().all()]
