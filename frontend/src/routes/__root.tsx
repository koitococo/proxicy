import type { CSSProperties } from 'react'
import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'

import { AppSidebar } from '@/components/app-sidebar'
import { SidebarProvider } from '@/components/ui/sidebar'

export const Route = createRootRoute({
  component: () => (
    <SidebarProvider style={{ '--sidebar-width': '15rem' } as CSSProperties}>
      <AppSidebar />
      <main>
        <Outlet />
      </main>
      <TanStackRouterDevtools />
    </SidebarProvider>
  ),
})
