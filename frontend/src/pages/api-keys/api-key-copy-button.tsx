import { CheckIcon, CopyIcon } from 'lucide-react'
import { match, P } from 'ts-pattern'

import { Button } from '@/components/ui/button'
import { useCopy } from '@/hooks/use-copy'

export const ApiKeyCopyButton = ({ apiKey, revoked }: { apiKey: string; revoked?: boolean }) => {
  const maskedValue = getMaskedValue(apiKey)
  const { copy, copied } = useCopy()

  const Icon = copied ? CheckIcon : CopyIcon

  return revoked ? (
    <div className="flex items-center gap-1.5">
      <span className="tabular-nums line-through opacity-50">{maskedValue}</span>
    </div>
  ) : (
    <Button
      variant="ghost"
      size="sm"
      className="group -mx-2 !px-2 font-normal"
      title="click to copy"
      onClick={() => copy(apiKey)}
    >
      <span className="tabular-nums">{maskedValue}</span>
      <span className="sr-only">Copy API key</span>
      <Icon
        data-copied={copied ? '' : undefined}
        className="size-3.5 opacity-0 group-hover:opacity-80 data-copied:opacity-100"
      />
    </Button>
  )
}

function getMaskedValue(key: string) {
  const length = key.length
  const [start, end] = match(length)
    .with(P.number.gt(20), () => [7, 4])
    .with(P.number.gt(6), () => [2, 2])
    .with(P.number.gt(2), () => [1, 0])
    .otherwise(() => [0, 0])
  return key.slice(0, start) + '*'.repeat(length - start - end) + key.slice(length - end)
}
