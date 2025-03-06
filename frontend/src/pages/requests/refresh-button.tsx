import { useState, type ComponentProps } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useSearch } from '@tanstack/react-router'
import { CheckIcon, RefreshCwIcon } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'

export function RefreshButton({ className, ...props }: ComponentProps<typeof Button>) {
  const { page, pageSize, apiKeyId, upstreamId } = useSearch({ from: '/requests/' })
  const queryClient = useQueryClient()
  const [loading, setLoading] = useState(false)
  const [successful, setSuccessful] = useState(false)

  return (
    <Button
      disabled={loading}
      className={cn('group size-7 *:transition-transform', className)}
      variant="ghost"
      size="icon"
      onClick={() => {
        setSuccessful(false)
        setLoading(true)
        queryClient.invalidateQueries({ queryKey: ['requests', { page, pageSize, apiKeyId, upstreamId }] }).then(() => {
          setLoading(false)
          setSuccessful(true)
          setTimeout(() => setSuccessful(false), 1000)
        })
      }}
      {...props}
    >
      <RefreshCwIcon className={cn((loading || successful) && 'scale-0 -rotate-90')} />
      <Spinner className={cn('absolute', !loading && 'scale-0 rotate-90')} />
      <CheckIcon className={cn('absolute', !successful && 'scale-0')} />
    </Button>
  )
}
