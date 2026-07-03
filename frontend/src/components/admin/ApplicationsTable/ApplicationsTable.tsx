import { useEffect, useState } from 'react'
import { useApi } from '../../../api/TransportContext'
import { useAuth } from '../../../auth/AuthContext'
import type { Application, ApplicationStatus } from '../../../types/application'
import { Select } from '../../ui/Select/Select'
import './ApplicationsTable.css'

const STATUS_LABELS: Record<ApplicationStatus, string> = {
  new: 'Новая',
  in_progress: 'В работе',
  closed: 'Закрыта',
}

export function ApplicationsTable() {
  const { api } = useApi()
  const { token } = useAuth()
  const [applications, setApplications] = useState<Application[]>([])
  const [status, setStatus] = useState<ApplicationStatus | ''>('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!token) return
    api
      .listApplications(token, status || undefined)
      .then(setApplications)
      .catch(() => setError('Не удалось загрузить заявки'))
  }, [api, token, status])

  if (error) return <p className="applications-table__error">{error}</p>

  return (
    <div>
      <Select
        value={status}
        onChange={(e) => setStatus(e.target.value as ApplicationStatus | '')}
        className="mb-3 w-48"
      >
        <option value="">Все статусы</option>
        <option value="new">Новая</option>
        <option value="in_progress">В работе</option>
        <option value="closed">Закрыта</option>
      </Select>
      <table className="applications-table">
        <thead>
          <tr>
            <th>Лот</th>
            <th>Контакт</th>
            <th>Комментарий</th>
            <th>Статус</th>
            <th>Создана</th>
          </tr>
        </thead>
        <tbody>
          {applications.map((application) => (
            <tr key={application.id}>
              <td>{application.lot_id ? `#${application.lot_id}` : '—'}</td>
              <td>{application.contact_name} · {application.contact_info}</td>
              <td className="applications-table__comment">{application.comment}</td>
              <td>{STATUS_LABELS[application.status]}</td>
              <td>{new Date(application.created_at).toLocaleString('ru-RU')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
