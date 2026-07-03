from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_db
from app.schemas.common import Page
from app.schemas.lot import LotListParams, LotRead
from app.services import lots as lots_service
from app.services.errors import NotFoundError

router = APIRouter(prefix="/lots", tags=["lots"])


@router.get("", response_model=Page[LotRead])
async def list_lots(
    params: Annotated[LotListParams, Query()],
    session: Annotated[AsyncSession, Depends(get_db)],
) -> Page[LotRead]:
    return await lots_service.list_lots(session, params)


@router.get("/projects", response_model=list[str])
async def list_projects(session: Annotated[AsyncSession, Depends(get_db)]) -> list[str]:
    return await lots_service.list_project_names(session)


@router.get("/{lot_id}", response_model=LotRead)
async def get_lot(
    lot_id: int,
    session: Annotated[AsyncSession, Depends(get_db)],
) -> LotRead:
    lot = await lots_service.get_lot(session, lot_id)
    if lot is None:
        raise NotFoundError(f"lot {lot_id} not found")
    return lot
