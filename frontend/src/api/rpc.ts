import { API_BASE_URL, ApiError } from './http'
import type { ApiClient } from './client'

let requestId = 0

const RPC_ERROR_TO_STATUS: Record<number, number> = {
  [-32601]: 404,
  [-32602]: 400,
  [-32001]: 404,
  [-32002]: 409,
  [-32003]: 401,
  [-32603]: 500,
}

async function call<T>(method: string, params?: unknown, token?: string): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`

  const response = await fetch(`${API_BASE_URL}/api/rpc`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ jsonrpc: '2.0', method, params: params ?? {}, id: ++requestId }),
  })

  const body = await response.json()

  if (body.error) {
    throw new ApiError(RPC_ERROR_TO_STATUS[body.error.code] ?? 500, body.error.message)
  }

  return body.result as T
}

async function fileToBase64(file: File): Promise<string> {
  const buffer = await file.arrayBuffer()
  let binary = ''
  for (const byte of new Uint8Array(buffer)) {
    binary += String.fromCharCode(byte)
  }
  return btoa(binary)
}

export const rpcClient: ApiClient = {
  listLots: (params) => call('lots.list', params),
  getLot: (id) => call('lots.get', { lot_id: id }),
  createBooking: (lotId, data) => call('bookings.create', { lot_id: lotId, contact: data.contact }),
  createApplication: (data) => call('applications.create', data),
  login: (data) => call('admin.login', data),

  uploadFeed: async (file, token) => {
    const content_base64 = await fileToBase64(file)
    return call('admin.feeds.upload', { filename: file.name, content_base64 }, token)
  },

  listFeeds: (token) => call('admin.feeds.list', {}, token),
  activateFeed: (lotSetId, token) => call('admin.feeds.activate', { lot_set_id: lotSetId }, token),
  listBookings: (token, status) => call('admin.bookings.list', { status }, token),
  listApplications: (token, status) => call('admin.applications.list', { status }, token),
}
