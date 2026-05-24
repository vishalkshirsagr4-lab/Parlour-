import { motion } from 'framer-motion'
import StarRating from './StarRating'

export default function RatingsSummary({ stats }) {
  const average = Number.isFinite(stats?.averageRating)
    ? stats.averageRating
    : stats?.average || 0
  const total = Number.isFinite(stats?.totalReviews)
    ? stats.totalReviews
    : stats?.count || 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border border-white/20 bg-black/5 p-5 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5"
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-rose-500">
            Ratings Summary
          </p>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-4xl font-black text-black dark:text-white">
              {average.toFixed(1)}
            </span>
            <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">
              /5 average
            </span>
          </div>
          <div className="mt-2">
            <StarRating value={Math.round(average)} size="lg" />
          </div>
        </div>

        <div className="text-right">
          <p className="text-xs uppercase tracking-[0.25em] text-gray-500 dark:text-gray-400">
            Total
          </p>
          <p className="mt-3 text-4xl font-black text-black dark:text-white">
            {total}
          </p>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
            reviews
          </p>
        </div>
      </div>
    </motion.div>
  )
}

