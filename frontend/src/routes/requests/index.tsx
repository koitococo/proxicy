import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { zodValidator } from '@tanstack/zod-adapter'
import { z } from 'zod'

import { api } from '@/lib/api'
import { removeUndefinedFields } from '@/lib/utils'
import { queryClient } from '@/components/app/query-provider'
import { RequestsDataTable } from '@/pages/requests/data-table'

const requestsSearchSchema = z.object({
  page: z.number().catch(1),
  pageSize: z.number().catch(20),
  apiKeyId: z.number().optional(),
  upstreamId: z.number().optional(),
})

type RequestsSearchSchema = z.infer<typeof requestsSearchSchema>

const requestsQueryOptions = ({ page, pageSize, apiKeyId, upstreamId }: RequestsSearchSchema) =>
  queryOptions({
    queryKey: ['requests', { page, pageSize, apiKeyId, upstreamId }],
    queryFn: async () => {
      const { data, error } = await api.admin.completions.get({
        query: {
          offset: (page - 1) * pageSize,
          limit: pageSize,
          ...removeUndefinedFields({ apiKeyId, upstreamId }),
        },
      })
      if (error) throw new Error('An error occurred while fetching requests.')
      return data
    },
  })

export const Route = createFileRoute('/requests/')({
  validateSearch: zodValidator(requestsSearchSchema),
  loaderDeps: ({ search }) => ({ ...search }),
  loader: ({ deps }) => queryClient.ensureQueryData(requestsQueryOptions(deps)),
  component: RouteComponent,
})

function RouteComponent() {
  const search = Route.useSearch()
  const {
    data: { data, total },
  } = useSuspenseQuery(requestsQueryOptions(search))

  return (
    <main className="px-4">
      <RequestsDataTable data={data} total={total} />
    </main>
  )
}
