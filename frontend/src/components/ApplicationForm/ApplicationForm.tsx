import { useState, type FormEvent } from 'react'
import { useApi } from '../../api/TransportContext'
import { Input } from '../ui/Input/Input'
import { Textarea } from '../ui/Textarea/Textarea'
import { Button } from '../ui/Button/Button'
import './ApplicationForm.css'

interface Props {
  lotId?: number
  onSuccess: () => void
}

export function ApplicationForm({ lotId, onSuccess }: Props) {
  const { api } = useApi()
  const [name, setName] = useState('')
  const [contactInfo, setContactInfo] = useState('')
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      await api.createApplication({
        lot_id: lotId ?? null,
        contact: { name, contact_info: contactInfo },
        comment,
      })
      onSuccess()
    } catch {
      setError('Не удалось отправить заявку. Попробуйте ещё раз.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="application-form">
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
      <Textarea
        required
        placeholder="Комментарий"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={3}
        className="w-full"
      />
      {error && <p className="application-form__error">{error}</p>}
      <Button type="submit" disabled={submitting} className="w-full">
        {submitting ? 'Отправка...' : 'Оставить заявку'}
      </Button>
    </form>
  )
}
