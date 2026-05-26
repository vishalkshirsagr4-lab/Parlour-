import { motion } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { bookingAPI } from '../../api/endpoints'
import { containerVariants, itemVariants } from '../../animations/variants'
import toast from 'react-hot-toast'

const statusLabels = [
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
]

export default function AdminBookings() {
  const queryClient = useQueryClient()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-bookings'],
    queryFn: async () => {
      const res = await bookingAPI.getAllBookings()
      return res.data
    },
  })

  const bookings = Array.isArray(data) ? data : data?.bookings || []

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) =>
      bookingAPI.updateBookingStatus(id, { status }),

    onSuccess: () => {
      toast.success('Booking status updated')
      queryClient.invalidateQueries({ queryKey: ['admin-bookings'] })
    },

    onError: () => {
      toast.error('Could not update status')
    },
  })

  // Group bookings by status
  const groupedBookings = statusLabels.reduce((acc, status) => {
    acc[status.value] = bookings.filter(
      (b) => b.status === status.value
    )
    return acc
  }, {})

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-32 animate-pulse rounded-3xl bg-gray-200"
          />
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <div className="rounded-3xl bg-red-100 p-6 text-red-600">
        Failed to load bookings
      </div>
    )
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      className="space-y-6"
    >
      {/* Summary */}
      <div className="rounded-3xl border bg-white p-4">
        <div className="flex items-center gap-2 text-sm">
          <span>📊 Total Bookings:</span>
          <span className="font-bold text-rose-pink">
            {bookings.length}
          </span>
        </div>
      </div>

      {/* Grouped Sections */}
      {statusLabels.map((statusGroup) => {
        const groupBookings = groupedBookings[statusGroup.value]

        return (
          <div key={statusGroup.value} className="space-y-3">
            {/* Section Title */}
            <div className="flex items-center justify-between mt-6">
              <h2 className="text-lg font-bold">
                {statusGroup.label}
              </h2>

              <span className="text-sm text-gray-500">
                {groupBookings.length}
              </span>
            </div>

            {/* Bookings List */}
            {groupBookings.length > 0 ? (
              groupBookings.map((booking) => (
                <motion.div
                  key={booking._id}
                  variants={itemVariants}
                  className="card-glass rounded-3xl p-5"
                >
                  {/* Info */}
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <h2 className="text-xl font-semibold">
                        {booking.service?.title || 'Service'}
                      </h2>

                      <p className="mt-2 text-sm text-gray-600">
                        👤 {booking.user?.name || 'Unknown User'} • 💅{' '}
                        {booking.staff?.name || 'Stylist TBD'}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                      <span>
                        📅{' '}
                        {booking.date
                          ? new Date(booking.date).toLocaleDateString()
                          : 'No date'}
                      </span>

                      <span>🕐 {booking.timeSlot || 'No time'}</span>
                    </div>
                  </div>

                  {/* Actions (only other statuses) */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {statusLabels
                      .filter(
                        (s) => s.value !== booking.status
                      )
                      .map((status) => (
                        <button
                          key={status.value}
                          onClick={() =>
                            statusMutation.mutate({
                              id: booking._id,
                              status: status.value,
                            })
                          }
                          disabled={statusMutation.isPending}
                          className="rounded-full border px-4 py-2 text-sm hover:bg-gray-100 transition"
                        >
                          Mark {status.label}
                        </button>
                      ))}
                  </div>
                </motion.div>
              ))
            ) : (
              <p className="text-sm text-gray-400 ml-1">
                No {statusGroup.label.toLowerCase()} bookings
              </p>
            )}
          </div>
        )
      })}
    </motion.div>
  )
}