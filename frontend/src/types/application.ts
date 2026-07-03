import type { ContactInfo } from './common'

export type ApplicationStatus = 'new' | 'in_progress' | 'closed'

export interface ApplicationCreate {
  lot_id?: number | null
  contact: ContactInfo
  comment: string
}

export interface Application {
  id: number
  lot_id: number | null
  contact_name: string
  contact_info: string
  comment: string
  status: ApplicationStatus
  created_at: string
}
