import { useMutation, useQueryClient } from '@tanstack/react-query'
import { MoreHorizontalIcon, Trash2Icon } from 'lucide-react'
import { toast } from 'sonner'

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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

import type { Upstream } from './columns'

export function RowActionButton({ data }: { data: Upstream }) {
  const queryClient = useQueryClient()
  const { mutate } = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await api.admin.upstream({ id }).delete()
      if (error) throw newApiError(error)
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['upstreams'] })
      const prevItems = (queryClient.getQueryData(['upstreams']) || []) as Upstream[]
      queryClient.setQueryData(
        ['upstreams'],
        prevItems.filter((item) => item.id !== id),
      )
      return { prevItems }
    },
    onError: (error, _, context) => {
      toast.error(error.message)
      if (context) queryClient.setQueryData(['upstreams'], context.prevItems)
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ['upstreams'] })
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
          <AlertDialogTrigger asChild>
            <DropdownMenuItem>
              <Trash2Icon />
              Delete
            </DropdownMenuItem>
          </AlertDialogTrigger>
        </DropdownMenuContent>
      </DropdownMenu>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This provider <span className="text-foreground font-bold">{data.name}</span> will be deleted.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={() => mutate(data.id)}>
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
