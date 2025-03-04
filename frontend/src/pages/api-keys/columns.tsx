import type { ColumnDef } from '@tanstack/react-table'
import { format } from 'date-fns'

import type { api } from '@/lib/api'
import { ApiKeyCopyButton } from '@/components/api-keys/api-key-copy-button'
import { RowActionButton } from '@/components/api-keys/row-action-button'

export type ApiKey = Exclude<Awaited<ReturnType<typeof api.admin.apiKey.get>>['data'], null>[number]

export const columns: ColumnDef<ApiKey>[] = [
  {
    accessorKey: 'comment',
    header: 'Comment',
  },
  {
    accessorKey: 'key',
    header: 'Key',
    cell: ({ row }) => <ApiKeyCopyButton apiKey={row.original.key} revoked={row.original.revoked} />,
  },
  {
    accessorKey: 'created_at',
    header: 'Created At',
    cell: ({ row }) => {
      return <div>{format(row.original.created_at, 'yyyy-MM-dd')}</div>
    },
  },
  {
    accessorKey: 'expires_at',
    header: 'Expires At',
    cell: ({ row }) => {
      if (!row.original.expires_at) {
        return <div>Never</div>
      }
      return <div>{format(row.original.expires_at, 'yyyy-MM-dd')}</div>
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => <RowActionButton data={row.original} />,
  },
]
