import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import { format } from 'date-fns'
import { bookingAPI } from '../../api/endpoints'
import {
  containerVariants,
  itemVariants,
} from '../../animations/variants'
import BottomNav from '../../components/BottomNav'
import toast from 'react-hot-toast'

export default function BookingDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  // =========================
  // GET BOOKING
  // =========================
  const {
    data: bookingData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['booking', id],

    queryFn: async () => {
      const res = await bookingAPI.getBookingById(id)
      return res.data
    },

    enabled: !!id,
  })

  // =========================
  // SAFE BOOKING OBJECT
  // =========================
  const booking =
    bookingData?.booking || bookingData || {}

  // =========================
  // CANCEL MUTATION
  // =========================
  const cancelMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await bookingAPI.cancelBooking(
        id,
        payload
      )

      return res.data
    },

    onSuccess: () => {
      toast.success('Appointment cancelled')

      queryClient.invalidateQueries({
        queryKey: ['bookings'],
      })

      queryClient.invalidateQueries({
        queryKey: ['booking', id],
      })
    },

    onError: (error) => {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          'Cancel failed'
      )
    },
  })

  // =========================
  // CANCEL HANDLER
  // =========================
  const handleCancel = () => {
    cancelMutation.mutate({
      reason: 'Cancelled by user',
    })
  }

  // =========================
  // LOADING
  // =========================
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="rounded-3xl border border-white/20 bg-white/90 p-8 shadow-sm dark:bg-gray-900">
          <p className="text-lg font-semibold text-rose-pink">
            Loading booking...
          </p>
        </div>
      </div>
    )
  }

  // =========================
  // ERROR
  // =========================
  if (isError || !booking?._id) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="rounded-3xl border border-red-300 bg-red-50 p-8 text-center shadow-sm dark:bg-red-950/10 dark:text-red-200">
          <p className="text-lg font-semibold">
            Unable to load booking
          </p>

          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {error?.message || 'Please try again later.'}
          </p>

          <button
            onClick={() => navigate('/bookings')}
            className="mt-4 rounded-full border border-rose-pink px-5 py-2 text-rose-pink transition hover:bg-rose-pink/10"
          >
            Back to Bookings
          </button>
        </div>
      </div>
    )
  }

  // =========================
  // STATUS COLORS
  // =========================
  const statusStyles = {
    pending:
      'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',

    confirmed:
      'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',

    completed:
      'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',

    cancelled:
      'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      className="min-h-screen pb-24"
    >
      <div className="px-4 pt-4">
        {/* BACK BUTTON */}
        <button
          onClick={() => navigate(-1)}
          className="mb-4 text-sm font-semibold text-rose-pink"
        >
          ← Back
        </button>

        {/* MAIN CARD */}
        <motion.div
          variants={itemVariants}
          className="card-glass rounded-3xl p-6"
        >
          {/* HEADER */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold">
              {booking?.service?.title ||
                'Booking Details'}
            </h1>

            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Review your appointment request and
              timeline.
            </p>
          </div>

          {/* GRID */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* LEFT SIDE */}
            <div className="space-y-4">
              {/* SERVICE */}
              <div className="rounded-3xl border border-gray-200 p-5 dark:border-gray-700">
                <h2 className="text-lg font-semibold">
                  Service
                </h2>

                <p className="mt-3 text-gray-700 dark:text-gray-200">
                  {booking?.service?.title ||
                    'Luxury Salon Service'}
                </p>

                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  {booking?.service?.description ||
                    'No description available'}
                </p>

                {booking?.service?.price && (
                  <p className="mt-3 text-lg font-semibold text-rose-pink">
                    ₹{booking.service.price}
                  </p>
                )}
              </div>

              {/* APPOINTMENT */}
              <div className="rounded-3xl border border-gray-200 p-5 dark:border-gray-700">
                <h2 className="text-lg font-semibold">
                  Appointment
                </h2>

                <p className="mt-3 text-gray-700 dark:text-gray-200">
                  {booking?.date
                    ? format(
                        new Date(booking.date),
                        'EEEE, MMMM do yyyy'
                      )
                    : 'Date unavailable'}
                </p>

                <p className="mt-1 text-gray-500 dark:text-gray-400">
                  {booking?.timeSlot ||
                    'Time not selected'}
                </p>

                <p className="mt-3 text-gray-700 dark:text-gray-200">
                  Stylist:{' '}
                  {booking?.staff?.name ||
                    'Any available stylist'}
                </p>
              </div>
            </div>

            {/* RIGHT SIDE */}
            <div className="space-y-4">
              {/* STATUS */}
              <div className="rounded-3xl border border-gray-200 p-5 dark:border-gray-700">
                <h2 className="text-lg font-semibold">
                  Status
                </h2>

                <span
                  className={`mt-3 inline-block rounded-full px-4 py-2 text-sm font-semibold capitalize ${
                    statusStyles[
                      booking?.status
                    ] ||
                    'bg-gray-100 text-gray-700'
                  }`}
                >
                  {booking?.status
                    ?.replace('_', ' ') || 'pending'}
                </span>
              </div>

              {/* NOTES */}
              <div className="rounded-3xl border border-gray-200 p-5 dark:border-gray-700">
                <h2 className="text-lg font-semibold">
                  Notes
                </h2>

                <p className="mt-3 text-gray-700 dark:text-gray-200">
                  {booking?.notes ||
                    'No additional notes.'}
                </p>
              </div>

              {/* BOOKING INFO */}
              <div className="rounded-3xl border border-gray-200 p-5 dark:border-gray-700">
                <h2 className="text-lg font-semibold">
                  Booking Info
                </h2>

                <div className="mt-3 space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <p>
                    Booking ID:{' '}
                    <span className="font-medium">
                      {booking?._id}
                    </span>
                  </p>

                  {booking?.createdAt && (
                    <p>
                      Requested:{' '}
                      {format(
                        new Date(booking.createdAt),
                        'PPP p'
                      )}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ACTIONS */}
          <div className="mt-6 flex flex-wrap gap-3">
            {booking?.status !== 'cancelled' &&
              booking?.status !== 'completed' && (
                <button
                  onClick={handleCancel}
                  disabled={cancelMutation.isPending}
                  className="rounded-full border border-red-500 px-5 py-3 font-medium text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 dark:hover:bg-red-950"
                >
                  {cancelMutation.isPending
                    ? 'Cancelling...'
                    : 'Cancel Appointment'}
                </button>
              )}

            <button
              onClick={() => navigate('/bookings')}
              className="rounded-full border border-gray-300 px-5 py-3 font-medium transition hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
            >
              View All Bookings
            </button>
          </div>
        </motion.div>
      </div>

      <BottomNav />
    </motion.div>
  )
}