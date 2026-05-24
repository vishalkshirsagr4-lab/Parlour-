import { motion, AnimatePresence } from 'framer-motion'
import { useMemo } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'

import PageBackground from '../../components/luxury/PageBackground'
import BottomNav from '../../components/BottomNav'
import GlassCard from '../../components/luxury/GlassCard'
import SectionHeading from '../../components/luxury/SectionHeading'

import ReviewsSkeleton from '../../components/reviews/ReviewsSkeleton'
import ErrorState from '../../components/reviews/ErrorState'
import EmptyReviewsState from '../../components/reviews/EmptyReviewsState'
import ReviewCard from '../../components/reviews/ReviewCard'

import { reviewAPI } from '../../api/endpoints'
import { containerVariants, itemVariants } from '../../animations/variants'

export default function Reviews() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { serviceId: serviceIdParam } = useParams()
  const [sp] = useSearchParams()

  const serviceId = useMemo(() => {
    return serviceIdParam || sp.get('serviceId') || ''
  }, [serviceIdParam, sp])

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['serviceReviews', serviceId, 1, 20, 'page'],
    enabled: !!serviceId,
    staleTime: 1000 * 60,
    retry: 1,
    queryFn: async () => {
      const res = await reviewAPI.getServiceReviews(serviceId, { page: 1, limit: 20 })
      return res?.data || { reviews: [] }
    },
  })

  const reviews = Array.isArray(data?.reviews) ? data.reviews : []

  if (!serviceId) {
    return (
      <PageBackground>
        <div className="min-h-screen pb-28 px-4 pt-6">
          <GlassCard className="p-5 bg-white/70 rounded-[2rem]">
            <SectionHeading
              eyebrow="Reviews"
              title="No service selected"
              subtitle="Pick a service to view customer reviews."
            />
            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => navigate('/services')}
                className="rounded-2xl bg-black px-5 py-3 text-sm font-semibold text-white hover:opacity-95"
              >
                Browse services
              </button>
            </div>
          </GlassCard>
          <BottomNav />
        </div>
      </PageBackground>
    )
  }

  return (
    <PageBackground>
      <motion.div
        variants={containerVariants}
        initial="initial"
        animate="animate"
        className="min-h-screen pb-28"
      >
        <div className="px-4 pt-5">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-black dark:text-white">
                Reviews
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                Luxury feedback from our clients.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate(-1)}
              className="rounded-2xl border border-rose-pink px-4 py-2 text-sm font-semibold text-rose-pink transition hover:bg-rose-pink/10 dark:border-rose-400/30 dark:text-rose-300"
            >
              ← Back
            </button>
          </div>

          <GlassCard className="p-5 bg-white/70 rounded-[2rem] border-white/20">
            <SectionHeading eyebrow="Client Love" title="All reviews" subtitle="Verified luxury experiences" />

            <div className="mt-5">
              {isLoading ? (
                <ReviewsSkeleton count={5} />
              ) : isError ? (
                <ErrorState
                  message={error?.message}
                  onRetry={() => queryClient.invalidateQueries({ queryKey: ['serviceReviews', serviceId, 1, 20, 'page'] })}
                />
              ) : reviews.length === 0 ? (
                <EmptyReviewsState />
              ) : (
                <AnimatePresence>
                  <div className="space-y-4">
                    {reviews.map((r) => (
                      <motion.div key={r?._id || Math.random()} variants={itemVariants}>
                        <ReviewCard review={r} />
                      </motion.div>
                    ))}
                  </div>
                </AnimatePresence>
              )}
            </div>
          </GlassCard>
        </div>

        <BottomNav />
      </motion.div>
    </PageBackground>
  )
}

