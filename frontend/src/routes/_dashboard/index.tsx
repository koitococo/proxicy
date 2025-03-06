import { createFileRoute } from '@tanstack/react-router'

import { AppErrorComponent } from '@/components/app/app-error'

export const Route = createFileRoute('/_dashboard/')({
  component: RouteComponent,
  errorComponent: AppErrorComponent,
})

function RouteComponent() {
  return <div>Hello from home</div>
}
