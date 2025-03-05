import { createContext, useContext, type ComponentProps } from 'react'
import { format } from 'date-fns'
import { BracesIcon, Rows2Icon, XIcon } from 'lucide-react'
import { match } from 'ts-pattern'

import { cn, formatNumber, omit } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { IndicatorBadge } from '@/components/ui/indicator-badge'
import { Spinner } from '@/components/ui/spinner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
    <div className="bg-background h-full min-w-0 lg:basis-[520px] lg:border-l xl:basis-[620px] 2xl:basis-1/2">
      {!data ? (
        <div className="flex flex-1 items-center justify-center">
          <Spinner className="text-muted-foreground" />
        </div>
      ) : (
        <DetailContext.Provider value={data}>
          <Tabs className="h-full gap-0" defaultValue="raw">
            <DetailPanelHeader />
            <TabsContent value="pretty" className="flex-1 overflow-auto pb-4">
              TODO
            </TabsContent>
            <TabsContent value="raw" className="flex-1 overflow-auto pb-4">
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
    <header className="flex items-center justify-between p-4">
      <div className="flex items-center gap-2">
        {match(data.status)
          .with('pending', () => (
            <IndicatorBadge className="bg-neutral-500/15 text-neutral-800 dark:text-neutral-200">
              Pending
            </IndicatorBadge>
          ))
          .with('completed', () => (
            <IndicatorBadge className="bg-green-500/15 text-green-800 dark:text-green-200">Completed</IndicatorBadge>
          ))
          .with('failed', () => (
            <IndicatorBadge className="bg-red-500/15 text-red-800 dark:text-red-200">Failed</IndicatorBadge>
          ))
          .exhaustive()}
        <h2 className="text-sm font-medium">{format(data.created_at, 'PP HH:mm:ss')}</h2>
      </div>
      <div className="-m-1 flex items-center gap-2">
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
        <DetailPanelCloseButton />
      </div>
    </header>
  )
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
      <XIcon />
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
  const tokenUsage = match(tokens)
    .with(undefined, () => null)
    .with(-1, () => 'No token usage data')
    .with(1, () => '1 token')
    .otherwise((tokens) => `${formatNumber(tokens)} tokens`)

  return (
    <div className="min-w-0">
      <div className="mb-1 flex items-center gap-2 px-2">
        <h3 className="text-sm font-medium">{title}</h3>
        {tokenUsage && <div className="text-muted-foreground text-xs">{tokenUsage}</div>}
      </div>
      <pre className="bg-muted/50 overflow-auto rounded-md p-4 font-mono text-xs whitespace-pre-wrap">
        {JSON.stringify(messages, null, 2)}
      </pre>
    </div>
  )
}
