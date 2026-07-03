import { useRef, useState } from 'react'
import { useApi } from '../../../api/TransportContext'
import { useAuth } from '../../../auth/AuthContext'
import { Button } from '../../ui/Button/Button'
import './FeedUploadForm.css'

interface Props {
  onUploaded: () => void
}

export function FeedUploadForm({ onUploaded }: Props) {
  const { api } = useApi()
  const { token } = useAuth()
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleUpload() {
    const file = inputRef.current?.files?.[0]
    if (!file || !token) return

    setUploading(true)
    setError(null)
    setMessage(null)

    try {
      const result = await api.uploadFeed(file, token)
      setMessage(
        `Набор «${result.lot_set.name}» создан: ${result.lot_set.lots_count} лотов, пропущено ${result.skipped_count}.`,
      )
      if (inputRef.current) inputRef.current.value = ''
      onUploaded()
    } catch {
      setError('Не удалось загрузить фид.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="feed-upload-form">
      <input ref={inputRef} type="file" accept=".xml" className="feed-upload-form__input" />
      <Button onClick={handleUpload} disabled={uploading}>
        {uploading ? 'Загрузка...' : 'Загрузить фид'}
      </Button>
      {message && <p className="feed-upload-form__message">{message}</p>}
      {error && <p className="feed-upload-form__error">{error}</p>}
    </div>
  )
}
