import { createContext, useContext, type ComponentProps, type ReactNode } from 'react'
import { format } from 'date-fns'
import {
  ArrowLeftIcon,
  BracesIcon,
  ForwardIcon,
  HelpCircleIcon,
  PanelRightIcon,
  ReplyIcon,
  Rows2Icon,
} from 'lucide-react'
import { match, P } from 'ts-pattern'

import { cn, formatNumber, omit } from '@/lib/utils'
import { Markdown } from '@/components/app/markdown'
import { Button } from '@/components/ui/button'
import { IndicatorBadge } from '@/components/ui/indicator-badge'
import { Separator } from '@/components/ui/separator'
import { Spinner } from '@/components/ui/spinner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import type { ChatRequest } from '@/pages/requests/columns'

import { useRequestDetail } from './request-detail-provider'

const DetailContext = createContext<ChatRequest | null>(null)
const useDetailContext = () => {
  const ctx = useContext(DetailContext)
  if (!ctx) throw new Error('useDetailContext must be used within DetailContext.Provider')
  return ctx
}

export function DetailPanel() {
  const { isSelectedRequest, selectedRequest: data } = useRequestDetail()

  if (!isSelectedRequest) return null

  return (
    <div className="bg-background 3xl:basis-3/5 @container h-full w-full min-w-0 lg:basis-[520px] lg:border-l xl:basis-[620px] 2xl:basis-1/2">
      {!data ? (
        <div className="flex flex-1 items-center justify-center">
          <Spinner className="text-muted-foreground" />
        </div>
      ) : (
        <DetailContext.Provider value={data}>
          <Tabs className="h-full gap-0" defaultValue="pretty">
            <DetailPanelHeader />
            <TabsContent value="pretty" className="flex flex-col overflow-hidden">
              <MessagesPrettyView />
            </TabsContent>
            <TabsContent value="raw" className="overflow-auto py-4">
              <MessagesRawView />
            </TabsContent>
          </Tabs>
        </DetailContext.Provider>
      )}
    </div>
  )
}

function DetailPanelHeader() {
  const data = useDetailContext()

  return (
    <header className="flex items-center justify-between p-4 @2xl:border-b">
      <div className="flex items-center gap-2">
        <DetailPanelCloseButton className="-m-1.5 mr-0" />
        <Separator orientation="vertical" className="mr-2 !h-4" />
        <StatusIndicator status={data.status} />
        <h2 className="text-sm font-medium">{format(data.created_at, 'PP HH:mm:ss')}</h2>
      </div>
      <div className="-my-1.5 flex items-center gap-2">
        <TabsList className="h-8 p-0.5">
          <TabsTrigger value="pretty">
            <Rows2Icon />
            Pretty
          </TabsTrigger>
          <TabsTrigger value="raw">
            <BracesIcon />
            Raw
          </TabsTrigger>
        </TabsList>
      </div>
    </header>
  )
}

function StatusIndicator({ status }: { status: ChatRequest['status'] }) {
  return match(status)
    .with('pending', () => (
      <IndicatorBadge className="bg-neutral-500/15 text-neutral-800 dark:text-neutral-200">Pending</IndicatorBadge>
    ))
    .with('completed', () => (
      <IndicatorBadge className="bg-green-500/15 text-green-800 dark:text-green-200">Completed</IndicatorBadge>
    ))
    .with('failed', () => (
      <IndicatorBadge className="bg-red-500/15 text-red-800 dark:text-red-200">Failed</IndicatorBadge>
    ))
    .exhaustive()
}

function DetailPanelCloseButton({ className, ...props }: ComponentProps<typeof Button>) {
  const { setSelectedRequestId } = useRequestDetail()

  return (
    <Button
      variant="ghost"
      className={cn('size-8 p-0', className)}
      onClick={() => setSelectedRequestId(undefined)}
      {...props}
    >
      <ArrowLeftIcon className="lg:hidden" />
      <PanelRightIcon className="max-lg:hidden" />
      <span className="sr-only">Close panel</span>
    </Button>
  )
}

function MessagesRawView() {
  const data = useDetailContext()

  return (
    <div className="flex flex-col gap-4 px-4">
      <MessagesCodePreview
        title="Raw data"
        messages={omit(data, ['prompt', 'completion', 'prompt_tokens', 'completion_tokens'])}
      />
      <MessagesCodePreview title="Request messages" messages={data.prompt.messages} tokens={data.prompt_tokens} />
      <MessagesCodePreview title="Response messages" messages={data.completion} tokens={data.completion_tokens} />
    </div>
  )
}

function MessagesCodePreview({ title, messages, tokens }: { title?: string; messages?: unknown; tokens?: number }) {
  return (
    <div className="min-w-0">
      <div className="mb-1 flex items-center gap-2 px-2">
        <h3 className="text-sm font-medium">{title}</h3>
        <TokenUsage tokens={tokens} />
      </div>
      <pre className="bg-muted/50 overflow-auto rounded-md p-4 font-mono text-xs whitespace-pre-wrap">
        {JSON.stringify(messages, null, 2)}
      </pre>
    </div>
  )
}

function TokenUsage({ tokens }: { tokens?: number }) {
  const usage = match(tokens)
    .with(undefined, () => null)
    .with(-1, () => 'No token usage data')
    .with(1, () => '1 token')
    .otherwise((tokens) => `${formatNumber(tokens)} tokens`)

  return usage && <div className="text-muted-foreground text-xs">{usage}</div>
}

function MessagesPrettyView() {
  const data = useDetailContext()

  const descriptions: {
    key: keyof typeof data
    name: ReactNode
    value?: ReactNode
    help?: string
    className?: string
  }[] = [
    {
      key: 'id',
      name: 'Request ID',
    },
    {
      key: 'model',
      name: 'Model',
    },
    {
      key: 'ttft',
      name: 'TTFT',
      value: <DurationDisplay duration={data.ttft} />,
      help: 'Time To First Token',
    },
    {
      key: 'duration',
      name: 'Duration',
      value: <DurationDisplay duration={data.duration} />,
      help: 'Total duration of the request',
    },
  ]

  return (
    <div className="flex flex-1 flex-col overflow-auto @2xl:flex-row @2xl:overflow-hidden">
      <div className="@2xl:basis-[260px] @2xl:overflow-auto @2xl:border-r">
        <div className="px-4 pt-3 pb-2 @max-2xl:px-6">
          <h3 className="text-sm font-medium">Meta</h3>
        </div>
        <div className="rounded-lg px-2 py-0.5 @max-2xl:mx-3 @max-2xl:mb-3 @max-2xl:border">
          <TooltipProvider>
            {descriptions.map(({ key, name, value, help, className }) => (
              <dl key={key} className="flex items-center justify-between gap-2 p-2 not-last:border-b">
                <dt className="text-muted-foreground flex items-center gap-1 text-sm">
                  {name}
                  {help && (
                    <Tooltip>
                      <TooltipTrigger
                        className="text-muted-foreground hover:text-accent-foreground transition-colors"
                        asChild
                      >
                        <HelpCircleIcon className="size-3.5" />
                      </TooltipTrigger>
                      <TooltipContent>{help}</TooltipContent>
                    </Tooltip>
                  )}
                </dt>
                <dd className={cn('justify-self-end text-sm', className)}>{value ?? String(data[key])}</dd>
              </dl>
            ))}
          </TooltipProvider>
        </div>
      </div>
      <div className="grid flex-1 @max-2xl:border-t @2xl:overflow-auto @6xl:grid-cols-2 @6xl:overflow-hidden">
        <MessagesPrettyContainer className="@6xl:border-r">
          <MessageTitle
            icon={<ForwardIcon />}
            title="Request messages"
            length={data.prompt.messages.length}
            tokens={data.prompt_tokens}
          />
          <div className="flex flex-col">
            {data.prompt.messages.map((message, index) => (
              <MessageContent key={index} message={message} />
            ))}
          </div>
        </MessagesPrettyContainer>
        <MessagesPrettyContainer>
          <MessageTitle icon={<ReplyIcon />} title="Respnse messages" tokens={data.completion_tokens} />
          <div className="flex flex-col">
            {data.completion.map((message, index) => (
              <ResponseMessageContent key={index} message={message} />
            ))}
          </div>
        </MessagesPrettyContainer>
      </div>
    </div>
  )
}

function MessagesPrettyContainer({ className, ...props }: ComponentProps<'div'>) {
  return <div className={cn('min-w-0 border-b @6xl:relative @6xl:overflow-auto', className)} {...props} />
}

function MessageTitle({
  icon,
  title,
  tokens,
  length,
  className,
}: {
  icon?: ReactNode
  title: string
  tokens?: number
  length?: number
  className?: string
}) {
  return (
    <div
      className={cn(
        'bg-background sticky top-0 flex items-center gap-2 border-b px-4 py-2.5 [&_svg]:size-3.5',
        className,
      )}
    >
      {icon}
      <h3 className="text-sm font-medium">{title}</h3>
      {length != undefined && <IndicatorBadge>{length}</IndicatorBadge>}
      <TokenUsage tokens={tokens} />
    </div>
  )
}

function MessageContent({ message }: { message: RequestMessage }) {
  return (
    <div
      data-role={message.role}
      className="data-[role=user]:bg-muted/75 px-4 py-3 data-[role=system]:not-last:border-b"
    >
      <h4 className="text-muted-foreground mb-2 text-sm font-semibold">{message.role}</h4>
      <Markdown className="prose-sm prose-code:text-xs prose-code:font-mono" text={getMessageText(message)} />
    </div>
  )
}

function ResponseMessageContent({ message, className }: { message: ResponseMessage; className?: string }) {
  const { content, refusal } = message

  const renderResult: ReactNode[] = []

  if (content) {
    renderResult.push(
      <Markdown className="prose-sm prose-code:text-xs prose-code:font-mono px-4 py-3" text={content} />,
    )
  }

  if (refusal) {
    renderResult.push(<div className="text-destructive bg-destructive/10 px-4 py-3 text-sm">{refusal}</div>)
  }

  return <div className={className}>{renderResult}</div>
}

function DurationDisplay({ duration }: { duration?: number | null }) {
  if (!duration) return '-'

  return (
    <Tooltip>
      <TooltipTrigger className="text-sm" asChild>
        <span className="cursor-default">{(duration / 1000).toFixed(2)}s</span>
      </TooltipTrigger>
      <TooltipContent>{formatNumber(duration)}ms</TooltipContent>
    </Tooltip>
  )
}

type RequestMessage = ChatRequest['prompt']['messages'][number]
type ResponseMessage = ChatRequest['completion'][number]

function getMessageText(message: RequestMessage): string {
  return match(message)
    .with({ content: P.string }, (msg) => msg.content)
    .with(
      {
        role: P.union('user', 'assistant', 'system', 'developer', 'tool'),
        content: P.intersection(P.not(P.string), P.nonNullable),
      },
      (msg) =>
        msg.content
          .filter((part) => part.type === 'text')
          .map((part) => part.text)
          .join(''),
    )
    .otherwise(() => '')
}
