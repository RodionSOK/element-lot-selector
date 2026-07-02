from collections.abc import AsyncIterator
from decimal import Decimal

import pytest_asyncio
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

import app.models  # noqa: F401 — регистрирует все модели перед create_all
from app.db import Base
from app.models.lot import Lot, LotStatus
from app.models.lot_set import LotSet


@pytest_asyncio.fixture
async def session() -> AsyncIterator[AsyncSession]:
    engine = create_async_engine("sqlite+aiosqlite:///:memory:")

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    session_factory = async_sessionmaker(engine, expire_on_commit=False)

    async with session_factory() as db_session:
        yield db_session

    await engine.dispose()


@pytest_asyncio.fixture
async def active_lot_set(session: AsyncSession) -> LotSet:
    lot_set = LotSet(name="test-set", lots_count=1, is_active=True)
    session.add(lot_set)
    await session.flush()
    return lot_set


@pytest_asyncio.fixture
async def for_sale_lot(session: AsyncSession, active_lot_set: LotSet) -> Lot:
    lot = Lot(
        set_id=active_lot_set.id,
        external_id="ext-1",
        project_name="Test Project",
        address="Test Address",
        rooms=2,
        area=Decimal("50.00"),
        floor=3,
        price=Decimal("5000000.00"),
        price_base=Decimal("5000000.00"),
        status=LotStatus.FOR_SALE,
    )
    session.add(lot)
    await session.commit()
    return lot
