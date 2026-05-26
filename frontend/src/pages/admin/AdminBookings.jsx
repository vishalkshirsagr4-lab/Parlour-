import { useState } from 'react'
import { motion } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { bookingAPI } from '../../api/endpoints'
import { containerVariants, itemVariants } from '../../animations/variants'
import toast from 'react-hot-toast'

const statusLabels = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
]

export default function AdminBookings() {
  const queryClient = useQueryClient()
  const [selectedStatus, setSelectedStatus] = useState('all')

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

  // Filter bookings based on selected tab
  const filteredBookings =
    selectedStatus === 'all'
      ? bookings
      : bookings.filter((b) => b.status === selectedStatus)

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
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
      className="space-y-5"
    >
      {/* Top Status Filter Buttons */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {statusLabels.map((status) => (
          <button
            key={status.value}
            onClick={() => setSelectedStatus(status.value)}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition ${
              selectedStatus === status.value
                ? 'bg-rose-pink text-white shadow-md'
                : 'border border-gray-200 hover:bg-gray-100'
            }`}
          >
            {status.label}
          </button>
        ))}
      </div>

      {/* Total */}
      <div className="rounded-3xl border bg-white p-4">
        <div className="flex items-center gap-2 text-sm">
          <span>📊 Showing:</span>
          <span className="font-bold text-rose-pink">
            {filteredBookings.length}
          </span>
        </div>
      </div>

      {/* Bookings */}
      {filteredBookings.length > 0 ? (
        filteredBookings.map((booking) => (
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

            {/* Status Change Buttons */}
            <div className="mt-4 flex flex-wrap gap-2">
              {statusLabels
                .filter(
                  (s) => s.value !== 'all' && s.value !== booking.status
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
        <div className="rounded-3xl border-2 border-dashed border-gray-300 p-8 text-center">
          <p className="text-gray-600">
            No bookings found for this status.
          </p>
        </div>
      )}
    </motion.div>
  )
}