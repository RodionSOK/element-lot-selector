import { API_BASE_URL, ApiError } from './http'
import type { ApiClient } from './client'
import type { Application } from '../types/application'
import type { Booking } from '../types/booking'
import type { TokenResponse } from '../types/auth'
import type { FeedUploadResult, Lot, LotSet } from '../types/lot'
import type { Page } from '../types/common'

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  })

  if (!response.ok) {
    const body = await response.json().catch(() => ({ detail: response.statusText }))
    throw new ApiError(response.status, body.detail ?? response.statusText)
  }

  return response.json() as Promise<T>
}

function authHeaders(token: string): Record<string, string> {
  return { Authorization: `Bearer ${token}` }
}

function buildQuery<T extends object>(params: T): string {
  const query = new URLSearchParams()
  for (const [key, value] of Object.entries(params as Record<string, unknown>)) {
    if (value !== undefined && value !== null && value !== '') {
      query.set(key, String(value))
    }
  }
  const qs = query.toString()
  return qs ? `?${qs}` : ''
}

export const restClient: ApiClient = {
  listLots: (params) => request<Page<Lot>>(`/api/lots${buildQuery(params)}`),

  getLot: (id) => request<Lot>(`/api/lots/${id}`),

  createBooking: (lotId, data) =>
    request<Booking>(`/api/lots/${lotId}/bookings`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  createApplication: (data) =>
    request<Application>('/api/applications', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  login: (data) =>
    request<TokenResponse>('/api/admin/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  uploadFeed: async (file, token) => {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch(`${API_BASE_URL}/api/admin/feeds`, {
      method: 'POST',
      headers: authHeaders(token),
      body: formData,
    })

    if (!response.ok) {
      const body = await response.json().catch(() => ({ detail: response.statusText }))
      throw new ApiError(response.status, body.detail ?? response.statusText)
    }

    return response.json() as Promise<FeedUploadResult>
  },

  listFeeds: (token) => request<LotSet[]>('/api/admin/feeds', { headers: authHeaders(token) }),

  activateFeed: (lotSetId, token) =>
    request<LotSet>(`/api/admin/feeds/${lotSetId}/activate`, {
      method: 'POST',
      headers: authHeaders(token),
    }),

  listBookings: (token, status) =>
    request<Booking[]>(`/api/admin/bookings${buildQuery({ status })}`, {
      headers: authHeaders(token),
    }),

  listApplications: (token, status) =>
    request<Application[]>(`/api/admin/applications${buildQuery({ status })}`, {
      headers: authHeaders(token),
    }),
}
