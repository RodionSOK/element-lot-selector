from decimal import Decimal

from app.models.lot import LotStatus
from app.services.feed_import import parse_feed

_SAMPLE_XML = b"""<?xml version="1.0" encoding="UTF-8"?>
<feed>
  <object>
    <name>Test Project</name>
    <address>Test Address</address>
    <buildings>
      <building>
        <flats>
          <flat>
            <flat_id>flat-1</flat_id>
            <room>2</room>
            <area>50.5</area>
            <floor>3</floor>
            <price>5000000</price>
            <price_base>5000000</price_base>
            <status>FREE</status>
          </flat>
          <flat>
            <flat_id>flat-2</flat_id>
            <room>1</room>
            <area>30.0</area>
            <floor>1</floor>
            <price>3000000</price>
            <price_base>3000000</price_base>
            <status>SOLD</status>
          </flat>
          <flat>
            <room>1</room>
            <area>25.0</area>
            <floor>2</floor>
            <price>2000000</price>
            <status>FREE</status>
          </flat>
        </flats>
      </building>
    </buildings>
  </object>
</feed>
"""


def test_parse_feed_maps_statuses_and_fields() -> None:
    result = parse_feed(_SAMPLE_XML)

    assert len(result.lots) == 2
    assert result.skipped_count == 1

    free_lot = result.lots[0]
    assert free_lot.external_id == "flat-1"
    assert free_lot.project_name == "Test Project"
    assert free_lot.status == LotStatus.FOR_SALE
    assert free_lot.area == Decimal("50.5")

    sold_lot = result.lots[1]
    assert sold_lot.status == LotStatus.SOLD
