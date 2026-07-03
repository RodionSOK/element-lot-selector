import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useApi } from '../../api/TransportContext'
import { LotFilters } from '../../components/LotFilters/LotFilters'
import { LotCard } from '../../components/LotCard/LotCard'
import { Pagination } from '../../components/Pagination/Pagination'
import { TransportSwitcher } from '../../components/TransportSwitcher/TransportSwitcher'
import type { Lot, LotListParams } from '../../types/lot'
import './CatalogPage.css'

function parseParams(searchParams: URLSearchParams): LotListParams {
  const params: LotListParams = {
    page: Number(searchParams.get('page')) || 1,
    page_size: Number(searchParams.get('page_size')) || 12,
  }

  const project_name = searchParams.get('project_name')
  if (project_name) params.project_name = project_name

  const rooms = searchParams.get('rooms')
  if (rooms) params.rooms = Number(rooms)

  const price_per_sqm_min = searchParams.get('price_per_sqm_min')
  if (price_per_sqm_min) params.price_per_sqm_min = Number(price_per_sqm_min)

  const price_per_sqm_max = searchParams.get('price_per_sqm_max')
  if (price_per_sqm_max) params.price_per_sqm_max = Number(price_per_sqm_max)

  const status = searchParams.get('status')
  if (status) params.status = status as LotListParams['status']

  const sort_by = searchParams.get('sort_by')
  if (sort_by) params.sort_by = sort_by as LotListParams['sort_by']

  const sort_dir = searchParams.get('sort_dir')
  if (sort_dir) params.sort_dir = sort_dir as LotListParams['sort_dir']

  return params
}

function serializeParams(params: LotListParams): URLSearchParams {
  const searchParams = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, String(value))
    }
  }
  return searchParams
}

export function CatalogPage() {
  const { api } = useApi()
  const [searchParams, setSearchParams] = useSearchParams()
  const params = parseParams(searchParams)
  const [lots, setLots] = useState<Lot[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [projects, setProjects] = useState<string[]>([])

  useEffect(() => {
    api.listProjects().then(setProjects).catch(() => {})
  }, [api])


  function setParams(next: LotListParams) {
    setSearchParams(serializeParams(next))
  }

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [api, searchParams.toString()])

  return (
    <div className="catalog-page">
      <div className="catalog-page__header">
        <h1 className="catalog-page__title">Выборщик лотов</h1>
        <TransportSwitcher />
      </div>

      <LotFilters value={params} onChange={setParams} projects={projects} />

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
        onChange={(page) => setParams({ ...params, page })}
      />
    </div>
  )
}
