import { useRef, useState } from 'react'
import { useApi } from '../../../api/TransportContext'
import { useAuth } from '../../../auth/AuthContext'
import { Button } from '../../ui/Button/Button'
import { Input } from '../../ui/Input/Input'
import type { FeedUploadResult } from '../../../types/lot'
import './FeedUploadForm.css'

interface Props {
  onUploaded: () => void
}

export function FeedUploadForm({ onUploaded }: Props) {
  const { api } = useApi()
  const { token } = useAuth()
  const inputRef = useRef<HTMLInputElement>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [url, setUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  function showResult(result: FeedUploadResult) {
    setMessage(
      `Набор «${result.lot_set.name}» создан: ${result.lot_set.lots_count} лотов, пропущено ${result.skipped_count}.`,
    )
    onUploaded()
  }

  async function handleUploadFile() {
    const file = inputRef.current?.files?.[0]
    if (!file || !token) return

    setUploading(true)
    setError(null)
    setMessage(null)

    try {
      const result = await api.uploadFeed(file, token)
      showResult(result)
      if (inputRef.current) inputRef.current.value = ''
      setFileName(null)
    } catch {
      setError('Не удалось загрузить фид из файла.')
    } finally {
      setUploading(false)
    }
  }

  async function handleUploadUrl() {
    if (!url || !token) return

    setUploading(true)
    setError(null)
    setMessage(null)

    try {
      const result = await api.uploadFeedFromUrl(url, token)
      showResult(result)
      setUrl('')
    } catch {
      setError('Не удалось загрузить фид по ссылке.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="feed-upload-form">
      <div className="feed-upload-form__row">
        <Button type="button" variant="secondary" onClick={() => inputRef.current?.click()}>
          Выбрать файл
        </Button>
        <span className="feed-upload-form__file-name">{fileName ?? 'Файл не выбран'}</span>
        <input
          id="feed-file"
          ref={inputRef}
          type="file"
          accept=".xml"
          className="feed-upload-form__file-input"
          onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
        />
        <Button onClick={handleUploadFile} disabled={uploading || !fileName}>
          {uploading ? 'Загрузка...' : 'Загрузить фид'}
        </Button>
      </div>

      <div className="feed-upload-form__row">
        <Input
          type="url"
          placeholder="https://.../feed.xml"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="feed-upload-form__url-input"
        />
        <Button onClick={handleUploadUrl} disabled={uploading || !url}>
          {uploading ? 'Загрузка...' : 'Загрузить по ссылке'}
        </Button>
      </div>

      {message && <p className="feed-upload-form__message">{message}</p>}
      {error && <p className="feed-upload-form__error">{error}</p>}
    </div>
  )
}
