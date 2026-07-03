import type { ContactInfo } from './common'

export type BookingStatus = 'active' | 'cancelled'

export interface BookingCreate {
  contact: ContactInfo
}

export interface Booking {
  id: number
  lot_id: number
  contact_name: string
  contact_info: string
  status: BookingStatus
  created_at: string
}
