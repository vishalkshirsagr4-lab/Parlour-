import ReviewsSkeleton from './ReviewsSkeleton'
import EmptyReviewsState from './EmptyReviewsState'
import ErrorState from './ErrorState'
import ReviewCard from './ReviewCard'

export default function ReviewsList({
  isLoading,
  isError,
  error,
  reviews,
  onSubmitCTA,
}) {
  const arr = Array.isArray(reviews) ? reviews : []

  if (isLoading) return <ReviewsSkeleton count={4} />
  if (isError) return <ErrorState message={error?.message} />

  if (arr.length === 0) {
    return <EmptyReviewsState onSubmitCTA={onSubmitCTA} />
  }

  return (
    <div className="space-y-4">
      {arr.map((r) => (
        <ReviewCard key={r?._id || Math.random()} review={r} />
      ))}
    </div>
  )
}

