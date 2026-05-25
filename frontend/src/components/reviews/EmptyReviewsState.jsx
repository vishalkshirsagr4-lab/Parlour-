import { motion } from 'framer-motion'

export default function EmptyReviewsState({ onSubmitCTA }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border border-dashed border-gray-300 bg-white/70 p-10 text-center shadow-sm"
    >
      <div className="text-6xl">✨</div>
      <h2 className="mt-4 text-2xl font-bold text-black">No reviews yet</h2>
      <p className="mt-2 text-gray-600">
        Be the first to share your luxury experience.
      </p>
      {typeof onSubmitCTA === 'function' && (
        <div className="mt-6">{onSubmitCTA()}</div>
      )}
    </motion.div>
  )
}

