import type { ColumnDef } from '@tanstack/react-table'
import { format } from 'date-fns'
import { HelpCircleIcon } from 'lucide-react'
import type { ChatCompletionMessage, ChatCompletionMessageParam } from 'openai/resources/chat/completions/completions'
import { match } from 'ts-pattern'

import type { api } from '@/lib/api'
import { formatNumber } from '@/lib/utils'
import { IndicatorBadge, MiniIndicatorBadge } from '@/components/ui/indicator-badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

export type ChatRequest = Exclude<Awaited<ReturnType<typeof api.admin.completions.get>>['data'], null>['data'][number]

export const columns: ColumnDef<ChatRequest>[] = [
  {
    accessorKey: 'created_at',
    header: () => <div className="pl-4">Created At</div>,
    cell: ({ row }) => {
      const status = row.original.status
      const indicator = match(status)
        .with('pending', () => <MiniIndicatorBadge className="bg-neutral-500">Pending</MiniIndicatorBadge>)
        .with('completed', () => <MiniIndicatorBadge className="bg-green-500">Completed</MiniIndicatorBadge>)
        .with('failed', () => <MiniIndicatorBadge className="bg-destructive">Failed</MiniIndicatorBadge>)
        .exhaustive()
      return (
        <div className="flex items-center gap-2.5">
          {indicator}
          <span className="tabular-nums">{format(row.original.created_at, 'MM-dd HH:mm:ss')}</span>
        </div>
      )
    },
  },
  {
    accessorKey: 'model',
    header: 'Model',
    cell: ({ row }) => {
      return <IndicatorBadge className="text-foreground bg-background border">{row.original.model}</IndicatorBadge>
    },
  },
  {
    accessorKey: 'ttft',
    header: () => (
      <TooltipProvider>
        <div className="flex items-center justify-end gap-1 [&_svg]:size-3.5">
          TTFT
          <Tooltip>
            <TooltipTrigger className="text-muted-foreground hover:text-accent-foreground transition-colors">
              <HelpCircleIcon />
            </TooltipTrigger>
            <TooltipContent>Time To First Token</TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    ),
    cell: ({ row }) => {
      if (row.original.ttft == null) return <div>-</div>
      return <div className="text-right tabular-nums">{(row.original.ttft / 1000).toFixed(2)}s</div>
    },
  },
  {
    accessorKey: 'duration',
    header: () => <div className="text-right">Duration</div>,
    cell: ({ row }) => {
      if (row.original.duration == null) return <div>-</div>
      return <div className="text-right tabular-nums">{(row.original.duration / 1000).toFixed(2)}s</div>
    },
  },
  {
    accessorKey: 'prompt',
    header: 'Request',
    cell: ({ row }) => {
      const messages = row.original.prompt.messages as ChatCompletionMessageParam[]
      const messageString = getLastUserMessage(messages)
      return (
        <div className="flex items-center gap-1">
          <MessageString message={messageString} />
          {messages.length > 1 && <IndicatorBadge className="shrink-0">+{messages.length - 1}</IndicatorBadge>}
          <TokensString tokens={row.original.prompt_tokens} />
        </div>
      )
    },
  },
  {
    accessorKey: 'completion',
    header: 'Response',
    cell: ({ row }) => {
      const messages = row.original.completion as ChatCompletionMessage[]
      const messageString = getAssistantMessage(messages)
      return (
        <div className="flex items-center gap-1">
          <MessageString message={messageString} />
          <TokensString tokens={row.original.completion_tokens} />
        </div>
      )
    },
  },
]

function MessageString({ message }: { message: string }) {
  return (
    <div
      className="max-w-[120px] min-w-0 truncate @5xl:max-w-[200px] @7xl:max-w-xs @min-[100rem]:max-w-md"
      title={message}
    >
      {message}
    </div>
  )
}

function TokensString({ tokens }: { tokens: number }) {
  const tokenString = match(tokens)
    .with(-1, () => '')
    .with(1, () => '1 token')
    .otherwise((tokens) => `${formatNumber(tokens)} tokens`)

  return tokenString && <div className="text-muted-foreground text-xs">{tokenString}</div>
}

function getLastUserMessage(messages: ChatCompletionMessageParam[]): string {
  if (!messages.length) return ''
  const lastUserMessage = messages.findLast((message) => message.role === 'user')
  if (lastUserMessage == null) return ''
  const { content } = lastUserMessage
  if (typeof content === 'string') return content
  return content.filter((part) => part.type === 'text').join('')
}

function getAssistantMessage(messages: ChatCompletionMessage[]): string {
  if (!messages.length) return ''
  return messages.map((message) => message.content || '').join('')
}
