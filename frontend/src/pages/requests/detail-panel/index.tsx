import { createContext, useContext } from 'react'

import { Spinner } from '@/components/ui/spinner'
import { Tabs, TabsContent } from '@/components/ui/tabs'

import type { ChatRequest } from '../columns'
import { useRequestDetail } from '../request-detail-provider'
import { DetailPanelHeader } from './header'
import { MessagesPrettyView } from './pretty-view'
import { MessagesRawView } from './raw-view'

const DetailContext = createContext<ChatRequest | null>(null)
export const useRequestDetailContext = () => {
  const ctx = useContext(DetailContext)
  if (!ctx) throw new Error('useDetailContext must be used within DetailContext.Provider')
  return ctx
}

export function DetailPanel() {
  const { isSelectedRequest, selectedRequest: data } = useRequestDetail()

  if (!isSelectedRequest) return null

  return (
    <div className="bg-background 3xl:basis-3/5 @container h-full w-full min-w-0 lg:basis-[520px] lg:border-l xl:basis-[620px] 2xl:basis-1/2">
      {!data ? (
        <div className="flex flex-1 items-center justify-center">
          <Spinner className="text-muted-foreground" />
        </div>
      ) : (
        <DetailContext.Provider value={data}>
          <Tabs className="h-full gap-0" defaultValue="pretty">
            <DetailPanelHeader />
            <TabsContent value="pretty" className="flex flex-col overflow-hidden">
              <MessagesPrettyView />
            </TabsContent>
            <TabsContent value="raw" className="overflow-auto py-4">
              <MessagesRawView />
            </TabsContent>
          </Tabs>
        </DetailContext.Provider>
      )}
    </div>
  )
}
