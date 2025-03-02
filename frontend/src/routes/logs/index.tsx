import { createFileRoute } from '@tanstack/react-router'
import {
  AppHeader,
  AppHeaderPart,
  AppHeaderTitle,
  AppSidebarSeparator,
  AppSidebarTrigger,
} from '@/components/app/app-header'

export const Route = createFileRoute('/logs/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <>
    <AppHeader>
      <AppHeaderPart>
        <AppSidebarTrigger />
        <AppSidebarSeparator />
        <AppHeaderTitle>Logs</AppHeaderTitle>
      </AppHeaderPart>
    </AppHeader>
  </>
}
