import { useEffect } from 'react'
import { useQueryErrorResetBoundary } from '@tanstack/react-query'
import { useRouter, type ErrorComponentProps } from '@tanstack/react-router'

import { Button } from '@/components/ui/button'

export function AppErrorComponent({ error }: ErrorComponentProps) {
  const router = useRouter()
  const queryErrorResetBoundary = useQueryErrorResetBoundary()

  useEffect(() => {
    queryErrorResetBoundary.reset()
  }, [queryErrorResetBoundary])

  return (
    <div className="flex flex-col items-center px-4 py-10">
      <div className="bg-background flex flex-col items-center gap-4 rounded-lg border px-6 py-4 sm:min-w-[280px]">
        <h3 className="text-muted-foreground font-medium">An error occurred</h3>
        <p className="text-sm">{error.message}</p>
        <Button variant="outline" onClick={() => router.invalidate()}>
          Retry
        </Button>
      </div>
    </div>
  )
}
