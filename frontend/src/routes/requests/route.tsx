import { createFileRoute, Outlet } from '@tanstack/react-router'

import {
  AppHeader,
  AppHeaderPart,
  AppHeaderTitle,
  AppSidebarSeparator,
  AppSidebarTrigger,
} from '@/components/app/app-header'

export const Route = createFileRoute('/requests')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <>
      <AppHeader>
        <AppHeaderPart>
          <AppSidebarTrigger />
          <AppSidebarSeparator />
          <AppHeaderTitle>Requests</AppHeaderTitle>
        </AppHeaderPart>
      </AppHeader>
      <Outlet />
    </>
  )
}
