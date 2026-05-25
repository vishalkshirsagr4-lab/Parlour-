import { motion } from 'framer-motion'
import StarRating from './StarRating'

export default function ReviewCard({ review }) {
  const userName =
    review?.user?.name ||
    review?.customerName ||
    'User'
  const avatar =
    review?.user?.profileImage ||
    review?.avatar ||
    ''
  const rating = review?.rating ?? 0
  const comment = review?.comment || ''
  const date = review?.createdAt || review?.date || null
  const reviewImage = review?.images?.[0] || ''

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-3xl border border-white/20 bg-white/70 p-5 shadow-sm backdrop-blur transition hover:shadow-xl"
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 overflow-hidden rounded-2xl bg-gray-200 ">
            {avatar ? (
              <img
                src={avatar}
                alt={userName}
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
            ) : null}
          </div>
          <div>
            <p className="font-semibold text-black">
              {userName}
            </p>
            <div className="mt-1 flex items-center gap-2">
              <StarRating value={rating} />
              <span className="text-sm text-gray-500 ">
                {rating ? `${rating}/5` : 'New'}
              </span>
            </div>
          </div>
        </div>

        {date ? (
          <p className="text-right text-sm text-gray-500">
            {new Date(date).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'short',
              day: '2-digit',
            })}
          </p>
        ) : (
          <div />
        )}
      </div>

      <p className="mt-4 text-gray-700">
        {comment}
      </p>

      {reviewImage ? (
        <div className="mt-4 overflow-hidden rounded-3xl bg-gray-100">
          <img
            src={reviewImage}
            alt={`Review image by ${userName}`}
            className="h-[260px] w-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
            }}
          />
        </div>
      ) : null}
    </motion.article>
  )
}

