import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import GlassCard from '../luxury/GlassCard'
import StarRating from './StarRating'

export default function FeaturedReviewsCarousel({ reviews = [] }) {
  const featured = useMemo(() => {
    const arr = Array.isArray(reviews) ? reviews : []
    return arr.slice(0, 6)
  }, [reviews])

  const [idx, setIdx] = useState(0)

  if (featured.length === 0) return null

  const current = featured[idx % featured.length]
  const name = current?.user?.name || 'User'
  const rating = current?.rating || 0
  const avatar = current?.user?.profileImage || ''
  const text = current?.comment || ''

  return (
    <div className="relative">
      <GlassCard className="rounded-[2rem] p-5 bg-white/70 border border-white/20 overflow-hidden">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-rose-500">
              Featured Reviews
            </p>
            <h3 className="mt-2 text-2xl font-black text-black">
              Client Love
            </h3>
          </div>
          <div className="flex items-center gap-2">
            {featured.slice(0, 3).map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIdx(i)}
                className={`h-2.5 w-2.5 rounded-full transition ${
                  i === idx % featured.length
                    ? 'bg-rose-500'
                    : 'bg-black/20'
                }`}
                aria-label={`Go to featured review ${i + 1}`}
              />
            ))}
          </div>
        </div>

        <div className="mt-5">
          <AnimatePresence mode="wait">
            <motion.div
              key={current?._id || idx}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35 }}
            >
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 overflow-hidden rounded-2xl bg-gray-200">
                  {avatar ? (
                    <img
                      src={avatar}
                      alt={name}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  ) : null}
                </div>
                <div>
                  <p className="font-semibold text-black ">
                    {name}
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <StarRating value={rating} />
                    <span className="text-sm text-gray-500">
                      {rating ? `${rating}/5` : ''}
                    </span>
                  </div>
                </div>
              </div>

              <p className="mt-4 text-gray-700 leading-relaxed">
                “{text}”
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-5 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => setIdx((v) => (v - 1 + featured.length) % featured.length)}
            className="rounded-2xl border border-black/10 bg-white/70 px-4 py-2 text-sm font-semibold text-black transition hover:bg-white"
            aria-label="Previous featured review"
          >
            ←
          </button>

          <button
            type="button"
            onClick={() => setIdx((v) => (v + 1) % featured.length)}
            className="rounded-2xl bg-black px-4 py-2 text-sm font-semibold text-white transition hover:opacity-95 "
            aria-label="Next featured review"
          >
            Next →
          </button>
        </div>
      </GlassCard>

      <div className="mt-4 flex justify-end">
        <p className="text-xs text-gray-500 ">
          Premium moments from our clients
        </p>
      </div>
    </div>
  )
}

