import type { LotListParams, LotSortField, SortDirection } from '../../types/lot'
import { Input } from '../ui/Input/Input'
import { Select } from '../ui/Select/Select'
import './LotFilters.css'

interface Props {
  value: LotListParams
  onChange: (value: LotListParams) => void
}

export function LotFilters({ value, onChange }: Props) {
  function update(patch: Partial<LotListParams>) {
    onChange({ ...value, ...patch, page: 1 })
  }

  return (
    <div className="lot-filters">
      <Input
        type="text"
        placeholder="ЖК"
        value={value.project_name ?? ''}
        onChange={(e) => update({ project_name: e.target.value || undefined })}
      />
      <Select
        value={value.rooms ?? ''}
        onChange={(e) => update({ rooms: e.target.value ? Number(e.target.value) : undefined })}
      >
        <option value="">Комнатность</option>
        <option value="0">Студия</option>
        <option value="1">1 комната</option>
        <option value="2">2 комнаты</option>
        <option value="3">3 комнаты</option>
        <option value="4">4+ комнаты</option>
      </Select>
      <Input
        type="number"
        placeholder="Цена/м² от"
        value={value.price_per_sqm_min ?? ''}
        onChange={(e) =>
          update({ price_per_sqm_min: e.target.value ? Number(e.target.value) : undefined })
        }
        className="w-36"
      />
      <Input
        type="number"
        placeholder="Цена/м² до"
        value={value.price_per_sqm_max ?? ''}
        onChange={(e) =>
          update({ price_per_sqm_max: e.target.value ? Number(e.target.value) : undefined })
        }
        className="w-36"
      />
      <Select
        value={value.status ?? ''}
        onChange={(e) =>
          update({ status: (e.target.value || undefined) as LotListParams['status'] })
        }
      >
        <option value="">Любой статус</option>
        <option value="for_sale">В продаже</option>
        <option value="reserved">Забронирован</option>
        <option value="sold">Продано</option>
      </Select>
      <Select
        value={`${value.sort_by ?? 'created_at'}:${value.sort_dir ?? 'desc'}`}
        onChange={(e) => {
          const [sort_by, sort_dir] = e.target.value.split(':') as [LotSortField, SortDirection]
          update({ sort_by, sort_dir })
        }}
      >
        <option value="created_at:desc">Сначала новые</option>
        <option value="price:asc">Цена ↑</option>
        <option value="price:desc">Цена ↓</option>
        <option value="price_per_sqm:asc">Цена/м² ↑</option>
        <option value="price_per_sqm:desc">Цена/м² ↓</option>
        <option value="area:asc">Площадь ↑</option>
        <option value="area:desc">Площадь ↓</option>
      </Select>
    </div>
  )
}
