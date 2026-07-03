import { useState } from 'react'
import { useAuth } from '../../auth/AuthContext'
import { Button } from '../../components/ui/Button/Button'
import { FeedUploadForm } from '../../components/admin/FeedUploadForm/FeedUploadForm'
import { FeedList } from '../../components/admin/FeedList/FeedList'
import { BookingsTable } from '../../components/admin/BookingsTable/BookingsTable'
import { ApplicationsTable } from '../../components/admin/ApplicationsTable/ApplicationsTable'
import { cn } from '../../lib/cn'
import './AdminPanelPage.css'

type Tab = 'feeds' | 'bookings' | 'applications'

const TABS: { id: Tab; label: string }[] = [
  { id: 'feeds', label: 'Фиды' },
  { id: 'bookings', label: 'Брони' },
  { id: 'applications', label: 'Заявки' },
]

export function AdminPanelPage() {
  const { logout } = useAuth()
  const [tab, setTab] = useState<Tab>('feeds')
  const [refreshKey, setRefreshKey] = useState(0)

  return (
    <div className="admin-panel-page">
      <div className="admin-panel-page__header">
        <h1 className="admin-panel-page__title">Админка</h1>
        <Button variant="secondary" onClick={logout}>Выйти</Button>
      </div>

      <div className="admin-panel-page__tabs">
        {TABS.map((item) => (
          <button
            key={item.id}
            className={cn('admin-panel-page__tab', tab === item.id && 'admin-panel-page__tab--active')}
            onClick={() => setTab(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === 'feeds' && (
        <div>
          <FeedUploadForm onUploaded={() => setRefreshKey((k) => k + 1)} />
          <FeedList refreshKey={refreshKey} />
        </div>
      )}
      {tab === 'bookings' && <BookingsTable />}
      {tab === 'applications' && <ApplicationsTable />}
    </div>
  )
}
