import { useMutation, useQueryClient } from '@tanstack/react-query'
import { CopyIcon, MoreHorizontalIcon, OctagonXIcon } from 'lucide-react'
import { toast } from 'sonner'
import { useCopyToClipboard } from 'usehooks-ts'

import { api } from '@/lib/api'
import { newApiError } from '@/lib/error'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import type { ApiKey } from './columns'

export const RowActionButton = ({ data }: { data: ApiKey }) => {
  const [, copy] = useCopyToClipboard()

  const queryClient = useQueryClient()
  const { mutate } = useMutation({
    mutationFn: async (key: string) => {
      const { error } = await api.admin.apiKey({ key }).delete()
      if (error) throw newApiError(error)
    },
    onMutate: async (key) => {
      await queryClient.cancelQueries({ queryKey: ['apiKeys'] })
      const prevAllItems = (queryClient.getQueryData(['apiKeys', { includeRevoked: true }]) || []) as ApiKey[]
      const prevItems = (queryClient.getQueryData(['apiKeys', { includeRevoked: false }]) || []) as ApiKey[]
      queryClient.setQueryData(
        ['apiKeys', { includeRevoked: true }],
        prevAllItems.map((item) => {
          if (item.key !== key) return item
          return { ...item, revoked: true }
        }),
      )
      queryClient.setQueryData(
        ['apiKeys', { includeRevoked: false }],
        prevItems.filter((item) => item.key !== key),
      )
      return { prevAllItems, prevItems }
    },
    onError: (error, _, context) => {
      toast.error(error.message)
      if (context) {
        queryClient.setQueryData(['apiKeys', { includeRevoked: true }], context.prevAllItems)
        queryClient.setQueryData(['apiKeys', { includeRevoked: false }], context.prevItems)
      }
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ['apiKeys'] })
    },
  })

  return (
    <AlertDialog>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="size-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontalIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem
            onClick={() => {
              copy(data.key)
                .then(() => toast.success('API key copied to clipboard.'))
                .catch((err) => toast.error(`Failed to copy: ${err}`))
            }}
          >
            <CopyIcon />
            Copy API Key
          </DropdownMenuItem>
          {!data.revoked && (
            <>
              <DropdownMenuSeparator />
              <AlertDialogTrigger asChild>
                <DropdownMenuItem>
                  <OctagonXIcon />
                  Revoke
                </DropdownMenuItem>
              </AlertDialogTrigger>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This API key <span className="text-foreground font-bold">{data.comment}</span> will be revoked.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={() => mutate(data.key)}>
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
