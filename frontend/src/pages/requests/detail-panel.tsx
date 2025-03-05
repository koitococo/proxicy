import { useRequestDetail } from '@/pages/requests/request-detail-provider'

export function DetailPanel() {
  const { isSelectedRequest } = useRequestDetail()
  return (
    isSelectedRequest && (
      <div className="bg-background lg:basis-[520px] lg:border-l xl:basis-[620px] 2xl:basis-1/2"></div>
    )
  )
}
