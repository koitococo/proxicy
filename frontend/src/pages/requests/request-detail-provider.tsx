import { createContext, useCallback, useContext, type Dispatch, type ReactNode, type SetStateAction } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate, useSearch } from '@tanstack/react-router'

import { api } from '@/lib/api'
import type { ChatRequest } from '@/pages/requests/columns'
import { useRequestsData } from '@/pages/requests/requests-data-provider'

export const RequestDetailContext = createContext<{
  selectedRequestId: number | undefined
  setSelectedRequestId: Dispatch<SetStateAction<number | undefined>>
  selectedRequest: ChatRequest | undefined
  isSelectedRequest: boolean
} | null>(null)

export const RequestDetailProvider = ({ children }: { children: ReactNode }) => {
  const { data } = useRequestsData()
  const { selectedRequestId, ...rest } = useSearch({ from: '/requests/' })
  const navigate = useNavigate()

  const { data: selectedRequest } = useQuery({
    queryKey: ['requests', selectedRequestId],
    queryFn: async () => {
      if (!selectedRequestId) return undefined
      const { data, error } = await api.admin.completions({ id: selectedRequestId }).get()
      if (error) throw new Error('An error occurred while fetching requests.')
      return data as ChatRequest
    },
    initialData: data.find((request) => request.id === selectedRequestId),
    enabled: !!selectedRequestId,
  })

  const setSelectedRequestId = useCallback(
    (id: (number | undefined) | ((id: number | undefined) => number | undefined)) => {
      const newId = typeof id === 'function' ? id(selectedRequestId) : id
      navigate({
        to: '/requests',
        search: { selectedRequestId: newId, ...rest },
      })
    },
    [navigate, rest, selectedRequestId],
  )

  return (
    <RequestDetailContext.Provider
      value={{
        selectedRequestId,
        setSelectedRequestId,
        selectedRequest,
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
