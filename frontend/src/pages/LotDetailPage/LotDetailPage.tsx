import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useApi } from '../../api/TransportContext'
import { BookingForm } from '../../components/BookingForm/BookingForm'
import { ApplicationForm } from '../../components/ApplicationForm/ApplicationForm'
import { formatArea, formatMoney, LOT_STATUS_LABELS } from '../../lib/format'
import type { Lot } from '../../types/lot'
import './LotDetailPage.css'

export function LotDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { api } = useApi()
  const navigate = useNavigate()
  const [lot, setLot] = useState<Lot | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [bookingDone, setBookingDone] = useState(false)
  const [applicationDone, setApplicationDone] = useState(false)


  useEffect(() => {
    if (!id) return
    api.getLot(Number(id)).then(setLot).catch(() => setError('Лот не найден'))
  }, [api, id])

  if (error) return <p className="lot-detail-page__error">{error}</p>
  if (!lot) return <p className="lot-detail-page__hint">Загрузка...</p>

  return (
    <div className="lot-detail-page">
      <button onClick={() => navigate(-1)} className="lot-detail-page__back">
         ← Назад в каталог
      </button>


      <div>
        <span className="lot-detail-page__project">{lot.project_name}</span>
        <h1 className="lot-detail-page__title">
          {lot.rooms === 0 ? 'Студия' : `${lot.rooms}-комн.`}, {formatArea(lot.area)}
        </h1>
        <p className="lot-detail-page__address">{lot.address}, этаж {lot.floor}</p>
        <p className="lot-detail-page__price">{formatMoney(lot.price)}</p>
        {lot.price_per_sqm && (
          <p className="lot-detail-page__price-sqm">{formatMoney(lot.price_per_sqm)}/м²</p>
        )}
        <p className="lot-detail-page__status">{LOT_STATUS_LABELS[lot.status]}</p>
      </div>

      {lot.status === 'for_sale' && (
        <div className="lot-detail-page__section">
          <h2 className="lot-detail-page__section-title">Забронировать</h2>
          {bookingDone ? (
            <p className="lot-detail-page__success">Бронь оформлена, мы свяжемся с вами.</p>
          ) : (
            <BookingForm lotId={lot.id} onSuccess={() => setBookingDone(true)} />
          )}
        </div>
      )}

      <div className="lot-detail-page__section">
        <h2 className="lot-detail-page__section-title">Оставить заявку</h2>
        {applicationDone ? (
          <p className="lot-detail-page__success">Заявка отправлена, мы свяжемся с вами.</p>
        ) : (
          <ApplicationForm lotId={lot.id} onSuccess={() => setApplicationDone(true)} />
        )}
      </div>
    </div>
  )
}
