import { CheckIcon, CopyIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useCopy } from '@/hooks/use-copy'

export const ApiKeyCopyButton = ({ apiKey, revoked }: { apiKey: string; revoked?: boolean }) => {
  const hiddenValue = apiKey.replace(/(.{7})(.*)(.{4})/, '$1******$3')
  const { copy, copied } = useCopy()

  const Icon = copied ? CheckIcon : CopyIcon

  return revoked ? (
    <div className="flex items-center gap-1.5">
      <span className="tabular-nums line-through opacity-50">{hiddenValue}</span>
    </div>
  ) : (
    <Button
      variant="ghost"
      size="sm"
      className="group -mx-2 !px-2 font-normal"
      title="click to copy"
      onClick={() => copy(apiKey)}
    >
      <span className="tabular-nums">{hiddenValue}</span>
      <span className="sr-only">Copy API key</span>
      <Icon
        data-copied={copied ? '' : undefined}
        className="size-3.5 opacity-0 group-hover:opacity-80 data-copied:opacity-100"
      />
    </Button>
  )
}
