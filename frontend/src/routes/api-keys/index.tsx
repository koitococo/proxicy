import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { zodValidator } from '@tanstack/zod-adapter'
import { z } from 'zod'

import { api } from '@/lib/api'
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
  const { includeRevoked = false } = Route.useSearch()
  const { data } = useSuspenseQuery(apiKeysQueryOptions({ includeRevoked }))

  return (
    <main>
      <div className="mx-auto max-w-6xl px-4">
        <ApiKeysDataTable data={data} includeRevoked={includeRevoked} />
      </div>
    </main>
  )
}
