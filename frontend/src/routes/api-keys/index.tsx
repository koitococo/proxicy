import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { zodValidator } from '@tanstack/zod-adapter'
import { z } from 'zod'

import { api } from '@/lib/api'
import { AddButton } from '@/components/api-keys/add-button'
import { ApiKeysDataTable } from '@/components/api-keys/data-table'
import { queryClient } from '@/components/app/query-provider'

const apiKeysQueryOptions = ({ includeRevoked = false }: { includeRevoked?: boolean }) =>
  queryOptions({
    queryKey: ['apiKeys', { includeRevoked }],
    queryFn: async () => {
      const { data, error } = await api.admin.apiKey.get({ query: { includeRevoked } })
      if (error) throw new Error('An error occurred while fetching API keys.')
      return data
    },
  })

const apiKeysSearchSchema = z.object({
  includeRevoked: z.boolean().optional(),
})

export const Route = createFileRoute('/api-keys/')({
  validateSearch: zodValidator(apiKeysSearchSchema),
  loaderDeps: ({ search: { includeRevoked } }) => ({ includeRevoked }),
  loader: ({ deps: { includeRevoked } }) => queryClient.ensureQueryData(apiKeysQueryOptions({ includeRevoked })),
  component: RouteComponent,
})

function RouteComponent() {
  const { includeRevoked } = Route.useSearch()
  const { data } = useSuspenseQuery(apiKeysQueryOptions({ includeRevoked }))

  return (
    <div className="px-4">
      <ApiKeysDataTable data={data} />
      <div className="mt-4">
        <AddButton />
      </div>
    </div>
  )
}
