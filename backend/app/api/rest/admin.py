from typing import Annotated

from fastapi import APIRouter, Depends, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_admin
from app.config import Settings, get_settings
from app.db import get_db
from app.models.application import ApplicationStatus
from app.models.booking import BookingStatus
from app.schemas.application import ApplicationRead
from app.schemas.auth import LoginRequest, TokenResponse
from app.schemas.booking import BookingRead
from app.schemas.lot import FeedUploadResult, LotSetRead, FeedUploadUrlRequest
from app.services import applications as applications_service
from app.services import auth as auth_service
from app.services import bookings as bookings_service
from app.services import feed_import as feed_import_service
from app.services import lots as lots_service

router = APIRouter(prefix="/admin", tags=["admin"])


@router.post("/login", response_model=TokenResponse)
async def login(
    payload: LoginRequest,
    settings: Annotated[Settings, Depends(get_settings)],
) -> TokenResponse:
    return auth_service.authenticate(payload, settings)


@router.post("/feeds", response_model=FeedUploadResult, status_code=201)
async def upload_feed(
    file: UploadFile,
    session: Annotated[AsyncSession, Depends(get_db)],
    _admin: Annotated[str, Depends(get_current_admin)],
) -> FeedUploadResult:
    content = await file.read()
    lot_set, skipped_count = await feed_import_service.import_feed(
        content, filename=file.filename or "feed.xml", session=session
    )
    return FeedUploadResult(
        lot_set=LotSetRead.model_validate(lot_set), skipped_count=skipped_count
    )


@router.get("/feeds", response_model=list[LotSetRead])
async def list_feeds(
    session: Annotated[AsyncSession, Depends(get_db)],
    _admin: Annotated[str, Depends(get_current_admin)],
) -> list[LotSetRead]:
    return await lots_service.list_lot_sets(session)


@router.post("/feeds/{lot_set_id}/activate", response_model=LotSetRead)
async def activate_feed(
    lot_set_id: int,
    session: Annotated[AsyncSession, Depends(get_db)],
    _admin: Annotated[str, Depends(get_current_admin)],
) -> LotSetRead:
    return await lots_service.activate_lot_set(session, lot_set_id)


@router.get("/bookings", response_model=list[BookingRead])
async def list_bookings_admin(
    session: Annotated[AsyncSession, Depends(get_db)],
    _admin: Annotated[str, Depends(get_current_admin)],
    status: BookingStatus | None = None,
) -> list[BookingRead]:
    return await bookings_service.list_bookings(session, status)


@router.get("/applications", response_model=list[ApplicationRead])
async def list_applications_admin(
    session: Annotated[AsyncSession, Depends(get_db)],
    _admin: Annotated[str, Depends(get_current_admin)],
    status: ApplicationStatus | None = None,
) -> list[ApplicationRead]:
    return await applications_service.list_applications(session, status)

@router.post("/feeds/from-url", response_model=FeedUploadResult, status_code=201)
async def upload_feed_from_url(
    payload: FeedUploadUrlRequest,
    session: Annotated[AsyncSession, Depends(get_db)],
    _admin: Annotated[str, Depends(get_current_admin)],
) -> FeedUploadResult:
    lot_set, skipped_count = await feed_import_service.import_feed_from_url(
        str(payload.url), session=session
    )
    return FeedUploadResult(
        lot_set=LotSetRead.model_validate(lot_set), skipped_count=skipped_count
    )