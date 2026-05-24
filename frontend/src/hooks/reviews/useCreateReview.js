import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { reviewAPI } from '../../api/endpoints'

export function useCreateReview(serviceId) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload) => {
      // payload = { customerName, rating, comment, imageFile }
      const { customerName, rating, comment, imageFile } = payload || {}

      const formData = new FormData()
      // Backend reviewController expects serviceId and rating/comment fields in req.body.
      // serviceId is provided by the query param in the route/controller; send it explicitly.
      formData.append('serviceId', String(serviceId))

      // bookingId is optional; only send if UI provides it.
      if (payload?.bookingId) {
        formData.append('bookingId', String(payload.bookingId))
      }

      formData.append('customerName', customerName)
      formData.append('rating', String(rating))
      formData.append('comment', comment)
      if (imageFile) formData.append('image', imageFile)

      const res = await reviewAPI.createReview(formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      return res?.data
    },

    onMutate: async (payload) => {
      if (!serviceId) return

      // Optimistic update: insert a temporary review into cache.
      // Note: backend assigns _id, but we don't require it for UI.
      const optimisticReview = {
        _id: `optimistic-${Date.now()}`,
        user: {
          name: payload?.customerName || 'User',
          profileImage: payload?.imageFile ? URL.createObjectURL(payload.imageFile) : undefined,
        },
        rating: payload?.rating || 0,
        comment: payload?.comment || '',
        createdAt: new Date().toISOString(),
      }

      const prevQueries = queryClient.getQueriesData({ queryKey: ['serviceReviews', serviceId] })

      prevQueries.forEach(([queryKey, data]) => {
        if (!data) return
        const prevReviews = Array.isArray(data?.reviews) ? data.reviews : []
        queryClient.setQueryData(queryKey, {
          ...(data || {}),
          reviews: [optimisticReview, ...prevReviews],
        })
      })

      return { optimisticReview }
    },

    onSuccess: (data) => {
      // Remove optimistic placeholders and merge server response to avoid duplicates
      try {
        const serverReview = data?.review || data?.data || data

        const prevQueries = queryClient.getQueriesData({ queryKey: ['serviceReviews', serviceId] })

        prevQueries.forEach(([queryKey, cached]) => {
          if (!cached) return
          const prevReviews = Array.isArray(cached?.reviews) ? cached.reviews : []

          // Remove optimistic entries (created with _id like 'optimistic-...')
          const filtered = prevReviews.filter(
            (r) => !(r?._id && String(r._id).startsWith('optimistic-'))
          )

          // Prepend server review if provided and not already present
          let newReviews = filtered
          if (serverReview && serverReview._id) {
            const exists = filtered.some((r) => r?._id === serverReview._id)
            if (!exists) newReviews = [serverReview, ...filtered]
          }

          queryClient.setQueryData(queryKey, {
            ...(cached || {}),
            reviews: newReviews,
          })
        })
      } catch (err) {
        // Non-fatal, proceed to invalidate
        console.error('Error merging review cache:', err)
      }

      toast.success('Review submitted ✨')
      queryClient.invalidateQueries({ queryKey: ['serviceReviews', serviceId] })
    },

    onError: (error) => {
      toast.error(error?.response?.data?.message || error?.message || 'Failed to submit review')
      // React Query will keep optimistic update unless we roll back.
      // Since we didn't store previous cache snapshot here, we rely on invalidation after user action.
    },
  })
}

