import { motion } from 'framer-motion'

export default function ErrorState({ message, onRetry }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border border-red-200 bg-red-50 p-6 text-center shadow-sm"
    >
      <h2 className="text-xl font-bold text-red-600 ">
        Failed to load reviews
      </h2>
      <p className="mt-2 text-sm text-red-500">
        {message || 'Please try again later.'}
      </p>
      {typeof onRetry === 'function' && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 rounded-full border border-red-200 bg-white px-5 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
        >
          Retry
        </button>
      )}
    </motion.div>
  )
}

