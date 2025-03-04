import type { ColumnDef } from '@tanstack/react-table'

import type { api } from '@/lib/api'
import { ApiKeyCopyButton } from '@/pages/api-keys/api-key-copy-button'

import { RowActionButton } from './row-action-button'

export type Upstream = Exclude<Awaited<ReturnType<typeof api.admin.upstream.get>>['data'], null>[number]

export const columns: ColumnDef<Upstream>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'model',
    header: 'Model',
  },
  {
    accessorKey: 'url',
    header: 'URL',
  },
  {
    accessorKey: 'apiKey',
    header: 'API Key',
    cell: ({ row }) => {
      const apiKey = row.original.apiKey
      return apiKey ? <ApiKeyCopyButton apiKey={apiKey} /> : null
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => <RowActionButton data={row.original} />,
  },
]
