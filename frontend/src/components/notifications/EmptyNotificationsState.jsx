import { motion } from 'framer-motion'

export default function EmptyNotificationsState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border border-dashed border-gray-300 bg-white/70 p-10 text-center shadow-sm "
    >
      <div className="text-6xl">🔔</div>
      <h2 className="mt-4 text-2xl font-bold text-black">
        No notifications
      </h2>
      <p className="mt-2 text-gray-600 ">
        Updates about bookings, appointments & offers will appear here.
      </p>
    </motion.div>
  )
}

