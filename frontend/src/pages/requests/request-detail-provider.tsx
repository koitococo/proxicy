import { createContext, useContext, useMemo, useState, type Dispatch, type ReactNode, type SetStateAction } from 'react'

import type { ChatRequest } from '@/pages/requests/columns'

export const RequestDetailContext = createContext<{
  selectedRequestId: number | undefined
  setSelectedRequestId: Dispatch<SetStateAction<number | undefined>>
  selectedRequest: ChatRequest | undefined
  requests: ChatRequest[]
  total: number
  isSelectedRequest: boolean
} | null>(null)

export const RequestDetailProvider = ({
  children,
  data,
  total,
}: {
  children: ReactNode
  data: ChatRequest[]
  total: number
}) => {
  const [selectedRequestId, setSelectedRequestId] = useState<number | undefined>(undefined)
  const selectedRequest = useMemo(() => data.find((log) => log.id === selectedRequestId), [data, selectedRequestId])

  return (
    <RequestDetailContext.Provider
      value={{
        selectedRequestId,
        setSelectedRequestId,
        selectedRequest,
        requests: data,
        total,
        isSelectedRequest: selectedRequestId !== undefined,
      }}
    >
      {children}
    </RequestDetailContext.Provider>
  )
}

export function useRequestDetail() {
  const context = useContext(RequestDetailContext)
  if (!context) throw new Error('useRequestDetail must be used within a RequestDetailProvider')
  return context
}
