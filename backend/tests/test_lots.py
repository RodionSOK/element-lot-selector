from decimal import Decimal

from app.models.lot import Lot
from app.schemas.lot import LotListParams
from app.services import lots as lots_service


async def test_list_lots_computes_price_per_sqm(session, for_sale_lot: Lot) -> None:
    page = await lots_service.list_lots(session, LotListParams())

    assert page.total == 1
    assert page.items[0].price_per_sqm == Decimal("100000.00")


async def test_list_lots_empty_when_no_active_set(session) -> None:
    page = await lots_service.list_lots(session, LotListParams())

    assert page.total == 0
    assert page.items == []
