import { MaximizeIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'

import type { ChatRequest } from './columns'

export function RowActionButton({ data }: { data: ChatRequest }) {
  return (
    <Button variant="ghost" className="-my-0.5 size-8 p-0">
      <span className="sr-only">Open detail</span>
      <MaximizeIcon />
    </Button>
  )
}
