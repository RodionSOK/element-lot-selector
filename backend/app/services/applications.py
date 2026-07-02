import structlog
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.application import Application, ApplicationStatus
from app.models.lot import Lot
from app.schemas.application import ApplicationCreate, ApplicationRead
from app.services.errors import NotFoundError

logger = structlog.get_logger(__name__)


async def create_application(session: AsyncSession, data: ApplicationCreate) -> ApplicationRead:
    if data.lot_id is not None:
        lot = await session.get(Lot, data.lot_id)
        if lot is None:
            raise NotFoundError(f"lot {data.lot_id} not found")

    application = Application(
        lot_id=data.lot_id,
        contact_name=data.contact.name,
        contact_info=data.contact.contact_info,
        comment=data.comment,
    )
    session.add(application)
    await session.commit()
    await session.refresh(application)

    logger.info(
        "application.created", application_id=application.id, lot_id=application.lot_id
    )

    return ApplicationRead.model_validate(application)


async def list_applications(
    session: AsyncSession, status: ApplicationStatus | None = None
) -> list[ApplicationRead]:
    query = select(Application).order_by(Application.created_at.desc())
    if status is not None:
        query = query.where(Application.status == status)

    result = await session.execute(query)
    return [ApplicationRead.model_validate(app) for app in result.scalars().all()]
