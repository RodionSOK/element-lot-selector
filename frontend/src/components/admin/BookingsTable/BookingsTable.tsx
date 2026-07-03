import { useEffect, useState } from 'react'
import { useApi } from '../../../api/TransportContext'
import { useAuth } from '../../../auth/AuthContext'
import type { Booking, BookingStatus } from '../../../types/booking'
import { Select } from '../../ui/Select/Select'
import './BookingsTable.css'

export function BookingsTable() {
  const { api } = useApi()
  const { token } = useAuth()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [status, setStatus] = useState<BookingStatus | ''>('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!token) return
    api
      .listBookings(token, status || undefined)
      .then(setBookings)
      .catch(() => setError('Не удалось загрузить брони'))
  }, [api, token, status])

  if (error) return <p className="bookings-table__error">{error}</p>

  return (
    <div>
      <Select
        value={status}
        onChange={(e) => setStatus(e.target.value as BookingStatus | '')}
        className="mb-3 w-48"
      >
        <option value="">Все статусы</option>
        <option value="active">Активна</option>
        <option value="cancelled">Отменена</option>
      </Select>
      <table className="bookings-table">
        <thead>
          <tr>
            <th>Лот</th>
            <th>Контакт</th>
            <th>Статус</th>
            <th>Создана</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((booking) => (
            <tr key={booking.id}>
              <td>#{booking.lot_id}</td>
              <td>{booking.contact_name} · {booking.contact_info}</td>
              <td>{booking.status === 'active' ? 'Активна' : 'Отменена'}</td>
              <td>{new Date(booking.created_at).toLocaleString('ru-RU')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
