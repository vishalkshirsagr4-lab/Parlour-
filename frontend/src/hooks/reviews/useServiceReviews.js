import { useQuery } from '@tanstack/react-query'
import { reviewAPI } from '../../api/endpoints'

export function useServiceReviews(serviceId, { page = 1, limit = 8 } = {}) {
  return useQuery({
    queryKey: ['serviceReviews', serviceId, page, limit],
    queryFn: async () => {
      if (!serviceId) return { reviews: [], stats: {} }
      const res = await reviewAPI.getServiceReviews(serviceId, { page, limit })
      return res?.data || { reviews: [] }
    },
    enabled: !!serviceId,
    staleTime: 1000 * 60,
    retry: 1,
  })
}

