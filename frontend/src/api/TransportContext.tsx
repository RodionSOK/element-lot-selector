import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import {
  type ApiClient,
  type Transport,
  getApiClient,
  getStoredTransport,
  setStoredTransport,
} from './client'

interface TransportContextValue {
  transport: Transport
  setTransport: (transport: Transport) => void
  api: ApiClient
}

const TransportContext = createContext<TransportContextValue | null>(null)

export function TransportProvider({ children }: { children: ReactNode }) {
  const [transport, setTransportState] = useState<Transport>(getStoredTransport)

  function setTransport(next: Transport) {
    setStoredTransport(next)
    setTransportState(next)
  }

  const api = useMemo(() => getApiClient(transport), [transport])

  return (
    <TransportContext.Provider value={{ transport, setTransport, api }}>
      {children}
    </TransportContext.Provider>
  )
}

export function useApi(): TransportContextValue {
  const ctx = useContext(TransportContext)
  if (!ctx) throw new Error('useApi must be used within TransportProvider')
  return ctx
}
