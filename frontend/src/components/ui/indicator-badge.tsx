import type { ComponentProps } from 'react'

import { cn } from '@/lib/utils'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

export function IndicatorBadge({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'bg-muted text-muted-foreground inline-flex rounded-full px-2 py-0.5 text-xs font-medium',
        className,
      )}
      {...props}
    />
  )
}

export function MiniIndicatorBadge({ className, children, ...props }: ComponentProps<'div'>) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger tabIndex={-1} className="-m-1 p-1">
          <div className={cn('size-1.5 rounded-full', className)} {...props} />
        </TooltipTrigger>
        <TooltipContent className="flex items-center gap-1.5">
          <div className={cn('size-1.5 rounded-full', className)} />
          {children}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
