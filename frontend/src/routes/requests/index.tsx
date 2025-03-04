import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/requests/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>hello from requests</div>
}
