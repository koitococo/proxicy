import { useCallback, useState } from 'react'
import { toast } from 'sonner'
import { useCopyToClipboard } from 'usehooks-ts'

export interface UseCopyOptions {
  timeout?: number
  showSuccessToast?: boolean
  successToastMessage?: string
  showErrorToast?: boolean
}

export interface UseCopyReturn {
  copy: (text: string) => Promise<boolean>
  copied: boolean
}

export function useCopy(opts: UseCopyOptions = {}): UseCopyReturn {
  const { timeout = 2000, successToastMessage = 'Copied!', showSuccessToast = false, showErrorToast = true } = opts

  const [copied, setCopied] = useState(false)
  const [, _copy] = useCopyToClipboard()

  const copy = useCallback(
    async (text: string) => {
      return await _copy(text)
        .then((res) => {
          setCopied(true)
          if (showSuccessToast) toast.success(successToastMessage)
          setTimeout(() => setCopied(false), timeout)
          return res
        })
        .catch((err) => {
          if (showErrorToast) toast.error(`Failed to copy: ${err}`)
          return false
        })
    },
    [_copy, showErrorToast, showSuccessToast, successToastMessage, timeout],
  )

  return { copy, copied }
}
