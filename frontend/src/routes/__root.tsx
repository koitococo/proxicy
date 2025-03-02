import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'

import { AppSidebar } from '@/components/app/app-sidebar'
import { ThemeProvider } from '@/components/app/theme-provider'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { Toaster } from '@/components/ui/sonner'

export const Route = createRootRoute({
  component: () => (
    <ThemeProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <Outlet />
        </SidebarInset>
        <Toaster />
        <TanStackRouterDevtools position="bottom-right" />
      </SidebarProvider>
    </ThemeProvider>
  ),
})
