import { useEffect, useState } from 'react'
import { useApi } from '../../api/TransportContext'
import { LotFilters } from '../../components/LotFilters/LotFilters'
import { LotCard } from '../../components/LotCard/LotCard'
import { Pagination } from '../../components/Pagination/Pagination'
import { TransportSwitcher } from '../../components/TransportSwitcher/TransportSwitcher'
import type { Lot, LotListParams } from '../../types/lot'
import './CatalogPage.css'

const DEFAULT_PARAMS: LotListParams = { page: 1, page_size: 12 }

export function CatalogPage() {
  const { api } = useApi()
  const [params, setParams] = useState<LotListParams>(DEFAULT_PARAMS)
  const [lots, setLots] = useState<Lot[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    api
      .listLots(params)
      .then((page) => {
        if (cancelled) return
        setLots(page.items)
        setTotal(page.total)
      })
      .catch((err) => {
        if (cancelled) return
        setError(err instanceof Error ? err.message : 'Не удалось загрузить лоты')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [api, params])

  return (
    <div className="catalog-page">
      <div className="catalog-page__header">
        <h1 className="catalog-page__title">Выборщик лотов</h1>
        <TransportSwitcher />
      </div>

      <LotFilters value={params} onChange={setParams} />

      {loading && <p className="catalog-page__hint">Загрузка...</p>}
      {error && <p className="catalog-page__error">{error}</p>}
      {!loading && !error && lots.length === 0 && (
        <p className="catalog-page__hint">Лоты не найдены.</p>
      )}

      <div className="catalog-page__grid">
        {lots.map((lot) => (
          <LotCard key={lot.id} lot={lot} />
        ))}
      </div>

      <Pagination
        page={params.page ?? 1}
        pageSize={params.page_size ?? 12}
        total={total}
        onChange={(page) => setParams((prev) => ({ ...prev, page }))}
      />
    </div>
  )
}
