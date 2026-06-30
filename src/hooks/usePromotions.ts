import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/apiClient'

type Promotion = {
  id: string
  code: string
  description: string
  discount: number
  discountType: 'percentage' | 'fixed'
  minPurchase: number
  maxDiscount: number | null
  usageLimit: number | null
  usedCount: number
  startDate: string
  endDate: string | null
  status: 'active' | 'inactive' | 'expired'
  applicableTo: string | null
  metadata: Record<string, unknown> | null
  createdAt: string
  updatedAt: string
}

interface PromotionsResponse {
  page: number
  limit: number
  total: number
  items: Promotion[]
}

interface QueryParams {
  page?: number
  limit?: number
}

export function usePromotions(params: QueryParams = {}) {
  const qs = new URLSearchParams({
    page: String(params.page ?? 1),
    limit: String(params.limit ?? 10),
  }).toString()

  return useQuery<PromotionsResponse>({
    queryKey: ['promotions', params],
    queryFn: async () => {
      const response = await apiClient.get<PromotionsResponse>(`/promotions?${qs}`)
      return response
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
