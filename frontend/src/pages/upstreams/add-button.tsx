import { useState, type ComponentProps } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { PlusIcon } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { api } from '@/lib/api'
import { newApiError } from '@/lib/error'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'

const addUpstreamSchema = z.object({
  name: z.string(),
  model: z.string(),
  url: z.string(),
  apiKey: z.string().optional(),
})

type AddUpstreamSchema = z.infer<typeof addUpstreamSchema>

export function AddButton({ ...props }: ComponentProps<typeof Button>) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button {...props}>
          <PlusIcon />
          New Provider
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a new provider</DialogTitle>
          <DialogDescription>Add a new provider for LLM requests.</DialogDescription>
        </DialogHeader>
        <AddUpstreamForm onSubmitSuccessful={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}

function AddUpstreamForm({ onSubmitSuccessful }: { onSubmitSuccessful: () => void }) {
  const queryClient = useQueryClient()
  const { mutate, isPending, isError, error } = useMutation({
    mutationFn: async (values: AddUpstreamSchema) => {
      const { error } = await api.admin.upstream.post(values)
      if (error) throw newApiError(error)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['upstreams'] })
      toast.success('Provider added.')
      onSubmitSuccessful()
    },
  })

  const form = useForm<AddUpstreamSchema>({
    resolver: zodResolver(addUpstreamSchema),
  })

  return (
    <Form {...form}>
      <form className="grid gap-4" onSubmit={form.handleSubmit((v) => mutate(v))}>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="DeepSeek" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="model"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Model</FormLabel>
              <FormControl>
                <Input placeholder="deepseek-reasoner" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL</FormLabel>
              <FormControl>
                <Input placeholder="https://api.deepseek.com" {...field} />
              </FormControl>
              <FormDescription>API endpoint URL of the provider.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="apiKey"
          render={({ field }) => (
            <FormItem>
              <FormLabel>API Key</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {isError && <p className="text-destructive">{error.message}</p>}
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button type="submit">
            {isPending && <Spinner />}
            Save
          </Button>
        </DialogFooter>
      </form>
    </Form>
  )
}
