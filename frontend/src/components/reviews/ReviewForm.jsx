import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

import StarRating from './StarRating'

export default function ReviewForm({
  serviceId,
  initialValue = { name: '', rating: 0, comment: '', avatar: null },
  onSubmit,
  isSubmitting,
}) {
  const [customerName, setCustomerName] = useState(initialValue?.name || '')
  const [rating, setRating] = useState(initialValue?.rating || 0)
  const [comment, setComment] = useState(initialValue?.comment || '')
  const [imageFile, setImageFile] = useState(initialValue?.avatar || null)

  const [touched, setTouched] = useState(false)

  const errors = useMemo(() => {
    const e = {}
    if (!customerName.trim()) e.name = 'Customer name is required'
    if (!rating || rating < 1) e.rating = 'Please select a star rating'
    if (!comment.trim()) e.comment = 'Review text is required'
    if (comment.trim().length < 6) e.comment = 'Please write at least 6 characters'
    return e
  }, [customerName, rating, comment])

  const canSubmit = Object.keys(errors).length === 0 && !isSubmitting

  const handleSubmit = (ev) => {
    ev.preventDefault()
    setTouched(true)

    if (!canSubmit) {
      if (Object.keys(errors).length > 0) {
        toast.error(errors[Object.keys(errors)[0]])
      }
      return
    }

    if (!serviceId) {
      toast.error('Service not found')
      return
    }

    onSubmit?.({
      serviceId,
      customerName: customerName.trim(),
      rating,
      comment: comment.trim(),
      imageFile,
    })
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="rounded-3xl border border-white/20 bg-white/70 p-5 shadow-sm backdrop-blur"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-rose-500">
            Share your experience
          </p>
          <h2 className="mt-3 text-2xl font-black text-black dark:text-royalblue">
            Leave a Review
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray">
            Your feedback helps others choose their perfect luxury service.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        {/* Name */}
        <div>
          <label className="mb-2 block text-sm font-medium text-black dark:text-[#333]">
            Customer name
          </label>
          <input
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            onBlur={() => setTouched(true)}
            placeholder="e.g., Anaya"
            className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-500/40 dark:border-gray-700 dark:bg-black/20 dark:text-white"
          />
          {touched && errors.name ? (
            <p className="mt-2 text-sm text-red-500">{errors.name}</p>
          ) : null}
        </div>

        {/* Rating */}
        <div>
          <div className="flex items-center justify-between gap-4">
            <label className="block text-sm font-medium text-black dark:text-[#333]">
              Star rating
            </label>
            <div className="text-sm font-semibold text-gray">
              {rating ? `${rating} / 5` : ''}
            </div>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-3">
            <StarRating value={rating} onChange={(v) => setRating(v)} />
          </div>
          {touched && errors.rating ? (
            <p className="mt-2 text-sm text-red-500">{errors.rating}</p>
          ) : null}
        </div>

        {/* Avatar */}
        <div>
          <label className="mb-2 block text-sm font-medium text-black dark:text-[#333]">
            Optional customer image
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0] || null
              setImageFile(file)
            }}
            className="w-full cursor-pointer rounded-2xl border border-gray-200 bg-white px-4 py-3 text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-500/40 dark:border-gray-700 dark:bg-black/20 dark:text-white"
          />

          {imageFile ? (
            <div className="mt-3">
              <div className="flex items-center gap-3">
                <div className="h-14 w-14 overflow-hidden rounded-2xl bg-gray-200">
                  <img
                    src={URL.createObjectURL(imageFile)}
                    alt="Selected avatar"
                    className="h-full w-full object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setImageFile(null)}
                  className="rounded-xl border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
                >
                  Remove
                </button>
              </div>
            </div>
          ) : null}
        </div>

        {/* Comment */}
        <div>
          <label className="mb-2 block text-sm font-medium text-black dark:text-[#333]">
            Review text
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            onBlur={() => setTouched(true)}
            rows={5}
            placeholder="Write what you loved..."
            className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-500/40 dark:border-gray-700 dark:bg-black/20 dark:text-white"
          />
          {touched && errors.comment ? (
            <p className="mt-2 text-sm text-red-500">{errors.comment}</p>
          ) : null}

          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Tip: Mention what stood out (service, staff, results).
          </p>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full rounded-2xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-black"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
          </button>

          <p className="mt-3 text-xs text-gray-500 dark:text-gray-400 text-center">
            Reviews are posted after submission confirmation.
          </p>
        </div>
      </form>
    </motion.section>
  )
}

