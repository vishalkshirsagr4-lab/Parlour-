import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { bookingAPI } from '../../api/endpoints'
import { containerVariants } from '../../animations/variants'

import BottomNav from '../../components/BottomNav'


const statusStyles = {
  pending: 'bg-amber-100 text-amber-800',
  confirmed: 'bg-emerald-100 text-emerald-800',
  in_progress: 'bg-blue-100 text-blue-800',
  completed: 'bg-gray-100 text-gray-800',
  cancelled: 'bg-rose-100 text-rose-800',
}

export default function Bookings() {
  const navigate = useNavigate()
  const { data: bookings, isLoading } = useQuery({
    queryKey: ['bookings'],
    queryFn: () => bookingAPI.getBookings().then((res) => res.data),
  })

  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      className="min-h-screen pb-24"
    >
      <div className="px-4 pt-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Your Appointments</h1>
          <p className="mt-2 text-gray-600 ">Track appointment requests and upcoming salon experiences.</p>
        </div>

        <div className="space-y-4">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-32 animate-pulse rounded-3xl bg-gray-200 " />
            ))
          ) : bookings?.length ? (
            bookings.map((booking) => (
              <motion.button
                key={booking._id}
                whileHover={{ scale: 1.01 }}
                onClick={() => navigate(`/bookings/${booking._id}`)}
                className="card-glass w-full rounded-3xl p-5 text-left"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-xl font-semibold">{booking.service?.title || 'Luxury service'}</h2>
                    <p className="mt-2 text-sm text-gray-600 ">{booking.staff?.name || 'Assigned stylist'} • {format(new Date(booking.date), 'MMM dd, yyyy')}</p>
                  </div>
                  <span className={`rounded-full px-4 py-2 text-sm text-center font-semibold ${statusStyles[booking.status] || 'bg-gray-100 text-center text-gray-800'}`}>{booking.status.replace('_', ' ')}</span>
                </div>

                <div className="mt-4 flex flex-wrap gap-3 text-sm text-gray-500 ">
                  <span>{booking.timeSlot}</span>
                  <span>₹{booking.totalAmount}</span>
                </div>
              </motion.button>
            ))
          ) : (
            <div className="rounded-3xl border border-dashed border-gray-300 p-8 text-center text-gray-600 ">
              <h2 className="text-xl font-semibold">No bookings yet</h2>
              <p className="mt-2">Browse services and request your first premium appointment.</p>
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </motion.div>
  )
}
