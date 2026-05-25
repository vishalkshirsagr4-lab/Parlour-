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

  const {
    data,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['admin-bookings'],
    queryFn: async () => {
      const res = await bookingAPI.getAllBookings()

      return res.data
    },
  })

  const bookings = Array.isArray(data)
    ? data
    : data?.bookings || []

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) =>
      bookingAPI.updateBookingStatus(id, { status }),

    onSuccess: () => {
      toast.success('Booking status updated')

      queryClient.invalidateQueries({
        queryKey: ['admin-bookings'],
      })
    },

    onError: () => {
      toast.error('Could not update status')
    },
  })

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
        className="space-y-4"
      >
        <div className="rounded-3xl border bg-white p-4">
          <div className="flex items-center gap-2 text-sm">
            <span>📊 Total Bookings:</span>

            <span className="font-bold text-rose-pink">
              {bookings.length}
            </span>
          </div>
        </div>

        {bookings.length > 0 ? (
          bookings.map((booking) => (
            <motion.div
              key={booking._id}
              variants={itemVariants}
              className="card-glass rounded-3xl p-5"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-xl font-semibold">
                    {booking.service?.title || 'Service'}
                  </h2>

                  <p className="mt-2 text-sm text-gray-600">
                    👤 {booking.user?.name || 'Unknown User'}
                    {' • '}
                    💅 {booking.staff?.name || 'Stylist TBD'}
                  </p>
                </div>

                <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                  <span>
                    📅{' '}
                    {booking.date
                      ? new Date(booking.date).toLocaleDateString()
                      : 'No date'}
                  </span>

                  <span>
                    🕐 {booking.timeSlot || 'No time'}
                  </span>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {statusLabels.map((status) => (
                  <button
                    key={status.value}
                    onClick={() =>
                      statusMutation.mutate({
                        id: booking._id,
                        status: status.value,
                      })
                    }
                    disabled={statusMutation.isPending}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                      booking.status === status.value
                        ? 'bg-rose-pink text-white shadow-lg'
                        : 'border border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {status.label}
                  </button>
                ))}
              </div>
            </motion.div>
          ))
        ) : (
          <div className="rounded-3xl border-2 border-dashed border-gray-300 p-8 text-center">
            <p className="text-gray-600 ">
              No bookings found.
            </p>
          </div>
        )}
      </motion.div>

  )
}