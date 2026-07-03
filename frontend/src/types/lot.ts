export type LotStatus = 'for_sale' | 'reserved' | 'sold'

export interface Lot {
  id: number
  external_id: string
  set_id: number
  project_name: string
  address: string
  rooms: number
  area: string
  floor: number
  price: string
  price_base: string
  price_per_sqm: string | null
  status: LotStatus
  created_at: string
}

export type LotSortField = 'price' | 'price_per_sqm' | 'area' | 'created_at'
export type SortDirection = 'asc' | 'desc'

export interface LotListParams {
  project_name?: string
  rooms?: number
  price_per_sqm_min?: number
  price_per_sqm_max?: number
  status?: LotStatus
  sort_by?: LotSortField
  sort_dir?: SortDirection
  page?: number
  page_size?: number
}

export interface LotSet {
  id: number
  name: string
  uploaded_at: string
  lots_count: number
  is_active: boolean
}

export interface FeedUploadResult {
  lot_set: LotSet
  skipped_count: number
}
