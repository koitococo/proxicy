import { useState, type ComponentProps } from 'react'
import { CheckIcon, RefreshCwIcon } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'

export function RefreshButton({
  className,
  loader,
  successTimeout = 1000,
  ...props
}: ComponentProps<typeof Button> & { loader: () => Promise<void>; successTimeout?: number }) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle')

  return (
    <Button
      disabled={status === 'loading'}
      className={cn('group size-7 *:transition-transform', className)}
      variant="ghost"
      size="icon"
      onClick={() => {
        setStatus('loading')
        loader().then(() => {
          setStatus('success')
          setTimeout(() => setStatus('idle'), successTimeout)
        })
      }}
      {...props}
    >
      <RefreshCwIcon className={cn(status !== 'idle' && 'scale-0 -rotate-90')} />
      <Spinner className={cn('absolute', status !== 'loading' && 'scale-0 rotate-90')} />
      <CheckIcon className={cn('absolute', status !== 'success' && 'scale-0')} />
    </Button>
  )
}
