import { useEffect, useState } from 'react'
import { useApi } from '../../../api/TransportContext'
import { useAuth } from '../../../auth/AuthContext'
import { Badge } from '../../ui/Badge/Badge'
import type { LotSet } from '../../../types/lot'
import './FeedList.css'

interface Props {
  refreshKey: number
}

export function FeedList({ refreshKey }: Props) {
  const { api } = useApi()
  const { token } = useAuth()
  const [feeds, setFeeds] = useState<LotSet[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!token) return
    api.listFeeds(token).then(setFeeds).catch(() => setError('Не удалось загрузить наборы'))
  }, [api, token, refreshKey])

  async function handleActivate(lotSetId: number) {
    if (!token) return
    const updated = await api.activateFeed(lotSetId, token)
    setFeeds((prev) => prev.map((f) => (f.id === updated.id ? updated : { ...f, is_active: false })))
  }

  if (error) return <p className="feed-list__error">{error}</p>

  return (
    <table className="feed-list">
      <thead>
        <tr>
          <th>Набор</th>
          <th>Загружен</th>
          <th>Лотов</th>
          <th>Статус</th>
          <th />
        </tr>
      </thead>
      <tbody>
        {feeds.map((feed) => (
          <tr key={feed.id}>
            <td>{feed.name}</td>
            <td>{new Date(feed.uploaded_at).toLocaleString('ru-RU')}</td>
            <td>{feed.lots_count}</td>
            <td>{feed.is_active ? <Badge tone="success">Активен</Badge> : <Badge>Неактивен</Badge>}</td>
            <td>
              {!feed.is_active && (
                <button
                  type="button"
                  className="feed-list__activate"
                  onClick={() => handleActivate(feed.id)}
                >
                  Активировать
                </button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
