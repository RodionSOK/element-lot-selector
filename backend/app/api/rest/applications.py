from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_db
from app.schemas.application import ApplicationCreate, ApplicationRead
from app.services import applications as applications_service

router = APIRouter(prefix="/applications", tags=["applications"])


@router.post("", response_model=ApplicationRead, status_code=201)
async def create_application(
    payload: ApplicationCreate,
    session: Annotated[AsyncSession, Depends(get_db)],
) -> ApplicationRead:
    return await applications_service.create_application(session, payload)
