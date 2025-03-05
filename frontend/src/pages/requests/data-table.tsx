import { useNavigate, useSearch } from '@tanstack/react-router'
import { ChevronLeftIcon, ChevronRightIcon, ChevronsLeftIcon, ChevronsRightIcon } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button, buttonVariants } from '@/components/ui/button'
import { DataTable } from '@/components/ui/data-table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

import { columns, type ChatRequest } from './columns'

const PAGE_SIZE_OPTIONS = [10, 20, 30, 50, 100]

export function RequestsDataTable({ data, total }: { data: ChatRequest[]; total: number }) {
  const { page, pageSize } = useSearch({ from: '/requests/' })
  const pageCount = Math.ceil(total / pageSize)
  const from = (page - 1) * pageSize + 1

  const navigate = useNavigate()

  return (
    <div className="@container py-4">
      <DataTable columns={columns} data={data} />
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-2 py-4">
        <div className="text-sm">
          Showing {from} to {Math.min(from + pageSize - 1, total)} of {total} requests
        </div>
        <div className="flex flex-wrap items-center gap-x-8 gap-y-2">
          <div className="flex items-center gap-2">
            <div className="text-sm">Rows</div>
            <Select
              value={PAGE_SIZE_OPTIONS.includes(pageSize) ? String(pageSize) : undefined}
              onValueChange={(v) => navigate({ to: '/requests', search: { page, pageSize: Number(v) } })}
            >
              <SelectTrigger className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'font-normal')}>
                <SelectValue placeholder={pageSize} />
              </SelectTrigger>
              <SelectContent>
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm">
              Page {page} of {pageCount}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="size-8"
                disabled={page <= 1}
                onClick={() =>
                  navigate({
                    to: '/requests',
                    search: { page: 1, pageSize },
                  })
                }
              >
                <ChevronsLeftIcon />
                <span className="sr-only">First</span>
              </Button>
              <Button
                variant="outline"
                className="size-8"
                disabled={page <= 1}
                onClick={() =>
                  navigate({
                    to: '/requests',
                    search: { page: page - 1, pageSize },
                  })
                }
              >
                <ChevronLeftIcon />
                <span className="sr-only">Previous</span>
              </Button>
              <Button
                variant="outline"
                className="size-8"
                disabled={page >= pageCount}
                onClick={() =>
                  navigate({
                    to: '/requests',
                    search: { page: page + 1, pageSize },
                  })
                }
              >
                <ChevronRightIcon />
                <span className="sr-only">Next</span>
              </Button>
              <Button
                variant="outline"
                className="size-8"
                disabled={page >= pageCount}
                onClick={() =>
                  navigate({
                    to: '/requests',
                    search: { page: pageCount, pageSize },
                  })
                }
              >
                <ChevronsRightIcon />
                <span className="sr-only">Last</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
