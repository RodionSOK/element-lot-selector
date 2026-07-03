export interface ContactInfo {
  name: string
  contact_info: string
}

export interface Page<T> {
  items: T[]
  total: number
  page: number
  page_size: number
}
