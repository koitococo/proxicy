import type { ComponentProps } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { format } from 'date-fns'
import { HelpCircleIcon } from 'lucide-react'
import type { ChatCompletionMessage, ChatCompletionMessageParam } from 'openai/resources/chat/completions/completions'
import { match } from 'ts-pattern'

import type { api } from '@/lib/api'
import { cn, formatNumber } from '@/lib/utils'
import { IndicatorBadge, MiniIndicatorBadge } from '@/components/ui/indicator-badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

export type ChatRequest = Omit<
  Exclude<Awaited<ReturnType<typeof api.admin.completions.get>>['data'], null>['data'][number],
  'prompt' | 'completion'
> & {
  prompt: { messages: ChatCompletionMessageParam[] }
  completion: ChatCompletionMessage[]
}

export const columns: ColumnDef<ChatRequest>[] = [
  {
    accessorKey: 'createdAt',
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
          <span className="tabular-nums">{format(row.original.createdAt, 'MM-dd HH:mm:ss')}</span>
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
    cell: ({ row }) => <DurationDisplay duration={row.original.ttft} />,
  },
  {
    accessorKey: 'duration',
    header: () => <div className="text-right">Duration</div>,
    cell: ({ row }) => <DurationDisplay duration={row.original.duration} />,
  },
  {
    accessorKey: 'prompt',
    header: 'Request',
    cell: ({ row }) => {
      const messages = row.original.prompt.messages
      const messageString = getLastUserMessage(messages)
      return (
        <MessageContainer>
          <MessageString message={messageString} />
          {messages.length > 1 && <IndicatorBadge className="shrink-0">+{messages.length - 1}</IndicatorBadge>}
          <TokensString tokens={row.original.promptTokens} />
        </MessageContainer>
      )
    },
  },
  {
    accessorKey: 'completion',
    header: 'Response',
    cell: ({ row }) => {
      const messages = row.original.completion
      const messageString = getAssistantMessage(messages)
      return (
        <MessageContainer>
          <MessageString message={messageString} />
          <TokensString tokens={row.original.completionTokens} />
        </MessageContainer>
      )
    },
  },
]

function MessageContainer({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'flex max-w-[200px] items-center gap-1 @5xl:max-w-[280px] @7xl:max-w-sm @min-[94rem]:max-w-lg @min-[102rem]:max-w-xl @min-[114rem]:max-w-2xl @min-[128rem]:max-w-3xl @min-[142rem]:max-w-4xl',
        className,
      )}
      {...props}
    />
  )
}

function MessageString({ message }: { message: string }) {
  return (
    <div className="truncate" title={message}>
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

function DurationDisplay({ duration }: { duration: number | null }) {
  if (duration == null || duration === -1) return <div className="text-right">-</div>

  return <div className="text-right tabular-nums">{(duration / 1000).toFixed(2)}s</div>
}

function getLastUserMessage(messages: ChatCompletionMessageParam[]): string {
  if (!messages.length) return ''
  const lastUserMessage = messages.findLast((message) => message.role === 'user')
  if (lastUserMessage == null) return ''
  const { content } = lastUserMessage
  if (typeof content === 'string') return content
  return content
    .filter((part) => part.type === 'text')
    .map((part) => part.text)
    .join('')
}

function getAssistantMessage(messages: ChatCompletionMessage[]): string {
  if (!messages.length) return ''
  return messages.map((message) => message.content || '').join('')
}
