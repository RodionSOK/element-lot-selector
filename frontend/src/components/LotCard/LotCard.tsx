import { Link } from 'react-router-dom'
import type { Lot } from '../../types/lot'
import { Badge } from '../ui/Badge/Badge'
import { formatArea, formatMoney, LOT_STATUS_LABELS } from '../../lib/format'
import './LotCard.css'

const STATUS_TONE: Record<Lot['status'], 'success' | 'warning' | 'neutral'> = {
  for_sale: 'success',
  reserved: 'warning',
  sold: 'neutral',
}

export function LotCard({ lot }: { lot: Lot }) {
  return (
    <Link to={`/lots/${lot.id}`} className="lot-card">
      <div className="lot-card__header">
        <span className="lot-card__project">{lot.project_name}</span>
        <Badge tone={STATUS_TONE[lot.status]}>{LOT_STATUS_LABELS[lot.status]}</Badge>
      </div>
      <h3 className="lot-card__title">
        {lot.rooms === 0 ? 'Студия' : `${lot.rooms}-комн.`} · {formatArea(lot.area)}
      </h3>
      <p className="lot-card__address">{lot.address}</p>
      <div className="lot-card__price">
        <span className="lot-card__price-main">{formatMoney(lot.price)}</span>
        {lot.price_per_sqm && (
          <span className="lot-card__price-sqm">{formatMoney(lot.price_per_sqm)}/м²</span>
        )}
      </div>
    </Link>
  )
}
