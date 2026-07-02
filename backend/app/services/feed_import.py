import xml.etree.ElementTree as ET
from dataclasses import dataclass
from decimal import Decimal, InvalidOperation

import structlog
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.lot import Lot, LotStatus
from app.models.lot_set import LotSet

logger = structlog.get_logger(__name__)

_STATUS_MAP = {
    "FREE": LotStatus.FOR_SALE,
    "RESERVED": LotStatus.RESERVED,
    "SOLD": LotStatus.SOLD,
}


@dataclass
class ParsedLot:
    external_id: str
    project_name: str
    address: str
    rooms: int
    area: Decimal
    floor: int
    price: Decimal
    price_base: Decimal
    status: LotStatus


@dataclass
class ParsedFeed:
    lots: list[ParsedLot]
    skipped_count: int


def parse_feed(xml_bytes: bytes) -> ParsedFeed:
    root = ET.fromstring(xml_bytes)

    lots: list[ParsedLot] = []
    skipped_count = 0

    for obj in root.findall("object"):
        project_name = (obj.findtext("name") or "").strip()
        address = (obj.findtext("address") or "").strip()

        for flat in obj.findall("buildings/building/flats/flat"):
            try:
                lots.append(_parse_flat(flat, project_name=project_name, address=address))
            except (ValueError, InvalidOperation, KeyError) as exc:
                skipped_count += 1
                logger.warning(
                    "feed_import.skipped_flat",
                    flat_id=flat.findtext("flat_id"),
                    error=str(exc),
                )

    return ParsedFeed(lots=lots, skipped_count=skipped_count)


def _parse_flat(flat: ET.Element, *, project_name: str, address: str) -> ParsedLot:
    status_raw = _require_text(flat, "status")

    return ParsedLot(
        external_id=_require_text(flat, "flat_id"),
        project_name=project_name,
        address=address,
        rooms=int(_require_text(flat, "room")),
        area=Decimal(_require_text(flat, "area")),
        floor=int(_require_text(flat, "floor")),
        price=Decimal(_require_text(flat, "price")),
        price_base=Decimal(flat.findtext("price_base") or "0"),
        status=_STATUS_MAP[status_raw],
    )


def _require_text(element: ET.Element, tag: str) -> str:
    text = element.findtext(tag)
    if text is None or not text.strip():
        raise ValueError(f"missing required field <{tag}>")
    return text.strip()


async def import_feed(
    xml_bytes: bytes, *, filename: str, session: AsyncSession
) -> tuple[LotSet, int]:
    parsed = parse_feed(xml_bytes)

    lot_set = LotSet(name=filename, lots_count=len(parsed.lots))
    session.add(lot_set)
    await session.flush()

    session.add_all(
        Lot(
            set_id=lot_set.id,
            external_id=lot.external_id,
            project_name=lot.project_name,
            address=lot.address,
            rooms=lot.rooms,
            area=lot.area,
            floor=lot.floor,
            price=lot.price,
            price_base=lot.price_base,
            status=lot.status,
        )
        for lot in parsed.lots
    )
    await session.commit()

    logger.info(
        "feed_import.completed",
        lot_set_id=lot_set.id,
        lots_created=len(parsed.lots),
        skipped=parsed.skipped_count,
    )

    return lot_set, parsed.skipped_count
