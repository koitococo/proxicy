import { omit } from '@/lib/utils'

import { useRequestDetailContext } from './index'
import { TokenUsage } from './token-usage'

export function MessagesRawView() {
  const data = useRequestDetailContext()

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
