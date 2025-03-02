import type { ComponentProps } from 'react'

import { cn } from '@/lib/utils'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'

export function AppHeader({ className, children, ...props }: ComponentProps<'header'>) {
  return (
    <header className={cn('bg-background flex h-12 shrink-0 items-center gap-2', className)} {...props}>
      {children}
    </header>
  )
}

export function AppSidebarTrigger({ className, ...props }: ComponentProps<typeof SidebarTrigger>) {
  return <SidebarTrigger className={cn('-ml-1.5', className)} {...props} />
}

export function AppSidebarSeparator({ className, ...props }: ComponentProps<typeof Separator>) {
  return <Separator orientation="vertical" className={cn('mr-2 !h-4', className)} {...props} />
}

export function AppHeaderPart({ className, children, ...props }: ComponentProps<'div'>) {
  return (
    <div className={cn('flex items-center gap-2 px-4', className)} {...props}>
      {children}
    </div>
  )
}

export function AppHeaderSpacer({ className, ...props }: ComponentProps<'div'>) {
  return <div className={cn('flex-grow', className)} {...props} />
}

export function AppHeaderTitle({ className, children, ...props }: ComponentProps<'h1'>) {
  return (
    <h1 className={cn('text-foreground text-sm', className)} {...props}>
      {children}
    </h1>
  )
}
