import { createContext, useContext, type ReactNode } from 'react'

import type { ChatRequest } from './columns'

const RequestsDataContext = createContext<{
  data: ChatRequest[]
  total: number
} | null>(null)

export const RequestsDataProvider = ({
  children,
  data,
  total,
}: {
  children: ReactNode
  data: ChatRequest[]
  total: number
}) => {
  return <RequestsDataContext.Provider value={{ data, total }}>{children}</RequestsDataContext.Provider>
}

export function useRequestsData() {
  const ctx = useContext(RequestsDataContext)
  if (!ctx) throw new Error('useRequestData must be used within a RequestDataProvider')
  return ctx
}
