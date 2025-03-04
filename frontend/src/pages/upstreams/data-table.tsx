import { DataTable } from '@/components/ui/data-table'

import { AddButton } from './add-button'
import { columns, type Upstream } from './columns'

export function UpstreamsDataTable({ data }: { data: Upstream[] }) {
  return (
    <div className="py-4">
      <div className="flex items-center pb-4">
        <AddButton size="sm" />
      </div>
      <DataTable columns={columns} data={data} />
    </div>
  )
}
