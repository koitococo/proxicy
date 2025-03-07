import type { ComponentProps } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'

import { Button } from '@/components/ui/button'

export function FilterResetButton({ className, ...props }: ComponentProps<typeof Button>) {
  const { apiKeyId, upstreamId, ...rest } = useSearch({ from: '/requests/' })
  const hasFilters = Boolean(apiKeyId || upstreamId)
  const navigate = useNavigate()

  return (
    hasFilters && (
      <Button
        className={className}
        size="xs"
        variant="outline"
        onClick={() => navigate({ to: '/requests', search: { ...rest } })}
        {...props}
      >
        Clear filters
      </Button>
    )
  )
}
