import { Button } from '../ui/Button/Button'
import './Pagination.css'

interface Props {
  page: number
  pageSize: number
  total: number
  onChange: (page: number) => void
}

export function Pagination({ page, pageSize, total, onChange }: Props) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize))
  if (pageCount <= 1) return null

  return (
    <div className="pagination">
      <Button variant="secondary" disabled={page <= 1} onClick={() => onChange(page - 1)}>
        Назад
      </Button>
      <span className="pagination__label">{page} / {pageCount}</span>
      <Button variant="secondary" disabled={page >= pageCount} onClick={() => onChange(page + 1)}>
        Вперёд
      </Button>
    </div>
  )
}
