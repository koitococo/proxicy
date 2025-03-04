import { useNavigate } from '@tanstack/react-router'
import { Settings2Icon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/data-table'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import { AddButton } from './add-button'
import { columns, type ApiKey } from './columns'

export function ApiKeysDataTable({ data, includeRevoked }: { data: ApiKey[]; includeRevoked: boolean }) {
  return (
    <div className="py-4">
      <div className="flex items-center pb-4">
        <AddButton size="sm" />
        <ApiKeysViewOptions includeRevoked={includeRevoked} />
      </div>
      <DataTable columns={columns} data={data} />
    </div>
  )
}

function ApiKeysViewOptions({ includeRevoked }: { includeRevoked: boolean }) {
  const navigate = useNavigate()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="ml-auto">
          <Settings2Icon />
          View
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuCheckboxItem
          checked={includeRevoked}
          onCheckedChange={(v) => {
            navigate({
              to: '/api-keys',
              search: { includeRevoked: v },
            })
          }}
        >
          Show revoked
        </DropdownMenuCheckboxItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
