import type { ComponentProps, ReactNode } from 'react'
import { CheckIcon, CopyIcon, ForwardIcon, HelpCircleIcon, ReplyIcon } from 'lucide-react'
import { match, P } from 'ts-pattern'

import { cn, formatNumber } from '@/lib/utils'
import { Markdown } from '@/components/app/markdown'
import { IndicatorBadge } from '@/components/ui/indicator-badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useCopy } from '@/hooks/use-copy'

import type { ChatRequest } from '../columns'
import { useRequestDetailContext } from './index'
import { TokenUsage } from './token-usage'

type RequestMessage = ChatRequest['prompt']['messages'][number]
type ResponseMessage = ChatRequest['completion'][number]

export function MessagesPrettyView() {
  const data = useRequestDetailContext()

  return (
    <div className="flex flex-1 flex-col overflow-auto @2xl:flex-row @2xl:overflow-hidden">
      <RequestMetaInfo />
      <div className="grid flex-1 @max-2xl:border-t @2xl:overflow-auto @6xl:grid-cols-2 @6xl:overflow-hidden">
        <MessagesPrettyContainer className="@6xl:border-r">
          <MessageTitle
            icon={<ForwardIcon />}
            title="Request messages"
            length={data.prompt.messages.length}
            tokens={data.promptTokens}
          />
          <div className="flex flex-col">
            {data.prompt.messages.map((message, index) => (
              <MessageContent key={index} message={message} />
            ))}
          </div>
        </MessagesPrettyContainer>
        <MessagesPrettyContainer>
          <MessageTitle icon={<ReplyIcon />} title="Respnse messages" tokens={data.completionTokens} />
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
      <Markdown className="prose-sm prose-code:text-xs" text={getMessageText(message)} />
    </div>
  )
}

function ResponseMessageContent({ message, className }: { message: ResponseMessage; className?: string }) {
  const { content, refusal } = message

  const renderResult: ReactNode[] = []

  if (content) {
    renderResult.push(<Markdown className="prose-sm prose-code:text-xs px-4 py-3" text={content} />)
  }

  if (refusal) {
    renderResult.push(<div className="text-destructive bg-destructive/10 px-4 py-3 text-sm">{refusal}</div>)
  }

  return <div className={className}>{renderResult}</div>
}

function DurationDisplay({ duration }: { duration?: number | null }) {
  if (duration == null || duration === -1) return '-'

  return (
    <Tooltip>
      <TooltipTrigger className="tabular-nums" asChild>
        <DescriptionItemButton>{(duration / 1000).toFixed(2)}s</DescriptionItemButton>
      </TooltipTrigger>
      <TooltipContent side="right">{formatNumber(duration)}ms</TooltipContent>
    </Tooltip>
  )
}

function CopiableText({ text }: { text: string }) {
  const { copy, copied } = useCopy({ showSuccessToast: true })

  return (
    <DescriptionItemButton onClick={() => copy(text)} className="group gap-0">
      {text}
      <span className="text-muted-foreground w-0 overflow-hidden pl-0 transition-[width,padding] group-hover:w-4 group-hover:pl-1 [&_svg]:size-3">
        {copied ? <CheckIcon /> : <CopyIcon />}
      </span>
    </DescriptionItemButton>
  )
}

function RequestMetaInfo() {
  const data = useRequestDetailContext()

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
      className: 'tabular-nums',
    },
    {
      key: 'model',
      name: 'Model',
      value: <CopiableText text={data.model} />,
    },
    {
      key: 'ttft',
      name: 'TTFT',
      value: <DurationDisplay duration={data.ttft} />,
      help: 'Time to first token',
    },
    {
      key: 'duration',
      name: 'Duration',
      value: <DurationDisplay duration={data.duration} />,
      help: 'Total duration of the request',
    },
  ]

  return (
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
  )
}

function DescriptionItemButton({ className, ...props }: ComponentProps<'button'>) {
  return (
    <button
      className={cn(
        'hover:bg-accent hover:text-accent-foreground -mx-1.5 -my-1 flex items-center gap-1 rounded-md px-1.5 py-1 text-sm transition',
        className,
      )}
      {...props}
    />
  )
}

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
