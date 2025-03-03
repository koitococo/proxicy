import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

import { api } from '@/lib/api'
import { AddButton } from '@/components/api-keys/add-button'
import { ApiKeysDataTable } from '@/components/api-keys/data-table'
import { queryClient } from '@/components/app/query-provider'

const apiKeysQueryOptions = queryOptions({
  queryKey: ['apiKeys'],
  queryFn: async () => {
    const { data, error } = await api.admin.apiKey.get()
    if (error) throw new Error('unknown error')
    return data
  },
})

export const Route = createFileRoute('/api-keys/')({
  loader: () => queryClient.ensureQueryData(apiKeysQueryOptions),
  component: RouteComponent,
})

function RouteComponent() {
  const { data } = useSuspenseQuery(apiKeysQueryOptions)

  return (
    <div className="px-4">
      <ApiKeysDataTable data={data} />
      <div className="mt-4">
        <AddButton />
      </div>
    </div>
  )
}
