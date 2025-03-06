import { type ComponentProps } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useSearch } from '@tanstack/react-router'

import { RefreshButton } from '@/components/app/refresh-button'
import { Button } from '@/components/ui/button'

export function RequestsRefreshButton({ ...props }: ComponentProps<typeof Button>) {
  const { page, pageSize, apiKeyId, upstreamId } = useSearch({ from: '/requests/' })
  const queryClient = useQueryClient()
  return (
    <RefreshButton
      loader={() => queryClient.invalidateQueries({ queryKey: ['requests', { page, pageSize, apiKeyId, upstreamId }] })}
      {...props}
    />
  )
}
