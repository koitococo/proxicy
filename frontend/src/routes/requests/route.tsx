import { createFileRoute, Outlet } from '@tanstack/react-router'

import {
  AppHeader,
  AppHeaderPart,
  AppHeaderTitle,
  AppSidebarSeparator,
  AppSidebarTrigger,
} from '@/components/app/app-header'
import { RequestsRefreshButton } from '@/pages/requests/refresh-button'

export const Route = createFileRoute('/requests')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <>
      <AppHeader className="border-b">
        <AppHeaderPart>
          <AppSidebarTrigger />
          <AppSidebarSeparator />
          <AppHeaderTitle>Requests</AppHeaderTitle>
          <RequestsRefreshButton />
        </AppHeaderPart>
      </AppHeader>
      <Outlet />
    </>
  )
}
