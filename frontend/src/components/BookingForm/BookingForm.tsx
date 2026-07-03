import { useState, type FormEvent } from 'react'
import { useApi } from '../../api/TransportContext'
import { ApiError } from '../../api/http'
import { Input } from '../ui/Input/Input'
import { Button } from '../ui/Button/Button'
import './BookingForm.css'

interface Props {
  lotId: number
  onSuccess: () => void
}

export function BookingForm({ lotId, onSuccess }: Props) {
  const { api } = useApi()
  const [name, setName] = useState('')
  const [contactInfo, setContactInfo] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      await api.createBooking(lotId, { contact: { name, contact_info: contactInfo } })
      onSuccess()
    } catch (err) {
      setError(
        err instanceof ApiError && err.status === 409
          ? 'Лот уже забронирован — попробуйте другой.'
          : 'Не удалось оформить бронь. Попробуйте ещё раз.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="booking-form">
      <Input
        required
        placeholder="Ваше имя"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full"
      />
      <Input
        required
        placeholder="Телефон или почта"
        value={contactInfo}
        onChange={(e) => setContactInfo(e.target.value)}
        className="w-full"
      />
      {error && <p className="booking-form__error">{error}</p>}
      <Button type="submit" disabled={submitting} className="w-full">
        {submitting ? 'Отправка...' : 'Забронировать'}
      </Button>
    </form>
  )
}
