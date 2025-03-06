import type { ColumnDef } from '@tanstack/react-table'
import { format } from 'date-fns'

import type { api } from '@/lib/api'

import { ApiKeyCopyButton } from './api-key-copy-button'
import { RowActionButton } from './row-action-button'

export type ApiKey = Exclude<Awaited<ReturnType<typeof api.admin.apiKey.get>>['data'], null>[number]

export const columns: ColumnDef<ApiKey>[] = [
  {
    accessorKey: 'comment',
    header: 'Name',
  },
  {
    accessorKey: 'key',
    header: 'API Key',
    cell: ({ row }) => <ApiKeyCopyButton apiKey={row.original.key} revoked={row.original.revoked} />,
  },
  {
    accessorKey: 'createdAt',
    header: 'Created At',
    cell: ({ row }) => {
      return <div>{format(row.original.createdAt, 'yyyy-MM-dd')}</div>
    },
  },
  {
    accessorKey: 'expiresAt',
    header: 'Expires At',
    cell: ({ row }) => {
      if (!row.original.expiresAt) {
        return <div>Never</div>
      }
      return <div>{format(row.original.expiresAt, 'yyyy-MM-dd')}</div>
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => <RowActionButton data={row.original} />,
  },
]
