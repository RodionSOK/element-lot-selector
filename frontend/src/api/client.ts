import type { Application, ApplicationCreate, ApplicationStatus } from '../types/application'
import type { Booking, BookingCreate, BookingStatus } from '../types/booking'
import type { LoginRequest, TokenResponse } from '../types/auth'
import type { Page } from '../types/common'
import type { FeedUploadResult, Lot, LotListParams, LotSet } from '../types/lot'
import { restClient } from './rest'
import { rpcClient } from './rpc'

export interface ApiClient {
  listLots(params: LotListParams): Promise<Page<Lot>>
  getLot(id: number): Promise<Lot>
  createBooking(lotId: number, data: BookingCreate): Promise<Booking>
  createApplication(data: ApplicationCreate): Promise<Application>
  login(data: LoginRequest): Promise<TokenResponse>
  uploadFeed(file: File, token: string): Promise<FeedUploadResult>
  listFeeds(token: string): Promise<LotSet[]>
  activateFeed(lotSetId: number, token: string): Promise<LotSet>
  listBookings(token: string, status?: BookingStatus): Promise<Booking[]>
  listApplications(token: string, status?: ApplicationStatus): Promise<Application[]>
}

export type Transport = 'rest' | 'rpc'

const TRANSPORT_STORAGE_KEY = 'transport'

export function getStoredTransport(): Transport {
  return localStorage.getItem(TRANSPORT_STORAGE_KEY) === 'rpc' ? 'rpc' : 'rest'
}

export function setStoredTransport(transport: Transport): void {
  localStorage.setItem(TRANSPORT_STORAGE_KEY, transport)
}

export function getApiClient(transport: Transport): ApiClient {
  return transport === 'rpc' ? rpcClient : restClient
}
