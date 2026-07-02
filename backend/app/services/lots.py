from sqlalchemy import func, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.lot import Lot
from app.models.lot_set import LotSet
from app.schemas.common import Page
from app.schemas.lot import LotListParams, LotRead, LotSetRead, SortDirection

class LotSetNotFoundError(Exception):
    pass

def _lot_select_columns():
    return (
        Lot.id, 
        Lot.external_id, 
        Lot.set_id,
        Lot.project_name,
        Lot.address,
        Lot.rooms,
        Lot.area,
        Lot.floor,
        Lot.price,
        Lot.price_base,
        Lot.status,
        Lot.created_at,
        func.round(Lot.price / func.nullif(Lot.area, 0), 2).label("price_per_sqm"),
    )
    
async def _get_active_set_id(session: AsyncSession) -> int | None:
    result = await session.execute(select(LotSet.id).where(LotSet.is_active.is_(True)))
    return result.scalar_one_or_none()
    
async def list_lots(session: AsyncSession, params: LotListParams) -> Page[LotRead]:
    active_set_id = await _get_active_set_id(session)
    if active_set_id is None:
        return Page(items=[], total=0, page=params.page, page_size=params.page_size)
    
    base_query = select(*_lot_select_columns()).where(Lot.set_id == active_set_id)
    lots_with_price = base_query.subquery()
    query = select(lots_with_price)

    if params.project_name:
        query = query.where(lots_with_price.c.project_name.ilike(f"%{params.project_name}%"))
    if params.rooms is not None:
        query = query.where(lots_with_price.c.rooms == params.rooms)
    if params.status is not None:
        query = query.where(lots_with_price.c.status == params.status)
    if params.price_per_sqm_min is not None:
        query = query.where(lots_with_price.c.price_per_sqm >= params.price_per_sqm_min)
    if params.price_per_sqm_max is not None:
        query = query.where(lots_with_price.c.price_per_sqm <= params.price_per_sqm_max)

    sort_column = lots_with_price.c[params.sort_by.value]
    order = sort_column.asc() if params.sort_dir is SortDirection.ASC else sort_column.desc()
    query = query.order_by(order)

    total = (
        await session.execute(select(func.count()).select_from(query.subquery()))
    ).scalar_one()
    
    rows = (
        await session.execute(
            query.offset((params.page - 1) * params.page_size).limit(params.page_size)
        )
    ).mappings().all()

    return Page(
        items=[LotRead.model_validate(dict(row)) for row in rows],
        total=total,
        page=params.page,
        page_size=params.page_size,
    )
    
async def get_lot(session: AsyncSession, lot_id: int) -> LotRead | None:
    query = select(*_lot_select_columns()).where(Lot.id == lot_id)
    row = (await session.execute(query)).mappings().one_or_none()
    return LotRead.model_validate(dict(row)) if row else None

async def list_lot_sets(session: AsyncSession) -> list[LotSetRead]:
    result = await session.execute(select(LotSet).order_by(LotSet.uploaded_at.desc()))
    return [LotSetRead.model_validate(row) for row in result.scalars().all()]

async def activate_lot_set(session: AsyncSession, lot_set_id: int) -> LotSetRead:
    lot_set = await session.get(LotSet, lot_set_id)
    if lot_set is None:
        raise LotSetNotFoundError(lot_set_id)

    await session.execute(update(LotSet).values(is_active=False))
    lot_set.is_active = True
    await session.commit()
    await session.refresh(lot_set)

    return LotSetRead.model_validate(lot_set)