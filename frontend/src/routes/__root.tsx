import { createRootRoute, Outlet } from '@tanstack/react-router'
import { ThemeProvider } from 'next-themes'

import { AppSidebar } from '@/components/app/app-sidebar'
import { AuthDialog } from '@/components/app/auth-dialog'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { Toaster } from '@/components/ui/sonner'

export const Route = createRootRoute({
  component: Root,
})

function Root() {
  return (
    <ThemeProvider storageKey="ui-theme" attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <Outlet />
          <AuthDialog />
        </SidebarInset>
        <Toaster />
      </SidebarProvider>
    </ThemeProvider>
  )
}
