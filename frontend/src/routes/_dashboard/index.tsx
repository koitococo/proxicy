import { createFileRoute, redirect } from '@tanstack/react-router'

import { AppErrorComponent } from '@/components/app/app-error'

export const Route = createFileRoute('/_dashboard/')({
  component: RouteComponent,
  errorComponent: AppErrorComponent,
  beforeLoad: () => redirect({ to: '/requests' }),
})

function RouteComponent() {
  return <div>Hello from home</div>
}
