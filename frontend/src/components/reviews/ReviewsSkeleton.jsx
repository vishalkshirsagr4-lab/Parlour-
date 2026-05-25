import { motion } from 'framer-motion'

export default function ReviewsSkeleton({ count = 4 }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0.7 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2, delay: i * 0.03 }}
          className="rounded-3xl border border-white/20 bg-white/70 p-5 shadow-sm backdrop-blur"
        >
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 animate-pulse rounded-2xl bg-gray-200 " />
            <div className="flex-1">
              <div className="h-4 w-2/3 animate-pulse rounded bg-gray-200 " />
              <div className="mt-2 h-3 w-1/3 animate-pulse rounded bg-gray-200 " />
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <div className="h-3 w-full animate-pulse rounded bg-gray-200 " />
            <div className="h-3 w-11/12 animate-pulse rounded bg-gray-200" />
            <div className="h-3 w-9/12 animate-pulse rounded bg-gray-200" />
          </div>
        </motion.div>
      ))}
    </div>
  )
}

