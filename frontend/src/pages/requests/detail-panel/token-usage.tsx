import { match } from 'ts-pattern'

import { formatNumber } from '@/lib/utils'

export function TokenUsage({ tokens }: { tokens?: number }) {
  const usage = match(tokens)
    .with(undefined, () => null)
    .with(-1, () => 'No token usage data')
    .with(1, () => '1 token')
    .otherwise((tokens) => `${formatNumber(tokens)} tokens`)

  return usage && <div className="text-muted-foreground text-xs">{usage}</div>
}
