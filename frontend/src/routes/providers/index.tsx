import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

import { api } from '@/lib/api'
import { queryClient } from '@/components/app/query-provider'
import { UpstreamsDataTable } from '@/components/upstreams/data-table'

const upstreamQueryOptions = () =>
  queryOptions({
    queryKey: ['upstreams'],
    queryFn: async () => {
      const { data, error } = await api.admin.upstream.get()
      if (error) {
        throw new Error('An error occurred while fetching providers.')
      }
      return data
    },
  })

export const Route = createFileRoute('/providers/')({
  loader: () => queryClient.ensureQueryData(upstreamQueryOptions()),
  component: RouteComponent,
})

function RouteComponent() {
  const { data } = useSuspenseQuery(upstreamQueryOptions())

  return (
    <main className="px-4">
      <div className="mx-auto max-w-6xl">
        <UpstreamsDataTable data={data} />
      </div>
    </main>
  )
}
