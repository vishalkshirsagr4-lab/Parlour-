import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { bookingAPI, serviceAPI, galleryAPI, userAPI, staffAPI } from '../../api/endpoints'
import { containerVariants, itemVariants } from '../../animations/variants'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const { data, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: async () => {
      const [bookingsRes, servicesRes, categoriesRes, galleryRes, usersRes, staffRes] = await Promise.all([
        bookingAPI.getAllBookings(),
        serviceAPI.getServices({}),
        serviceAPI.getCategories(),
        galleryAPI.getGallery({ page: 1, limit: 1 }),
        userAPI.getAllUsers({ page: 1, limit: 1 }),
        staffAPI.getStaff(),
      ])
      return {
        bookings: bookingsRes.data?.bookings ?? bookingsRes.data,
        services: servicesRes.data?.services ?? servicesRes.data,
        categories: categoriesRes.data?.categories ?? categoriesRes.data,
        gallery: galleryRes.data?.gallery ?? galleryRes.data,
        users: usersRes.data?.users ?? usersRes.data,
        staff: staffRes.data?.staff ?? staffRes.data,
      }
    },
  })

  const stats = [
    { label: 'Bookings', value: data?.bookings?.length ?? 0, color: 'rose-pink' },
    { label: 'Services', value: data?.services?.length ?? 0, color: 'blue-500' },
    { label: 'Categories', value: data?.categories?.length ?? 0, color: 'purple-500' },
    { label: 'Gallery Items', value: data?.gallery?.length ?? 0, color: 'indigo-500' },
    { label: 'Users', value: data?.users?.length ?? 0, color: 'amber-500' },
    { label: 'Stylists', value: data?.staff?.length ?? 0, color: 'teal-500' },
  ]

  const quickActions = [
    { path: '/admin/bookings', label: '📅 Manage Bookings', desc: 'Review and update booking statuses' },
    { path: '/admin/services', label: '✨ Add Services', desc: 'Create new salon treatments' },
    { path: '/admin/categories', label: '🏷️ Categories', desc: 'Manage service categories' },
    { path: '/admin/gallery', label: '🖼️ Gallery', desc: 'Upload salon images' },
    { path: '/admin/staff', label: '👥 Staff', desc: 'Add and manage stylists' },
    { path: '/admin/users', label: '👤 Users', desc: 'Manage customer accounts' },
    { path: '/admin/notifications', label: '🔔 Notifications', desc: 'Send targeted or broadcast alerts' },
  ]

  return (
    <motion.div variants={containerVariants} initial="initial" animate="animate" className="space-y-6">
        {/* Stats Grid */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Performance Overview</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="h-32 animate-pulse rounded-3xl bg-gray-200 dark:bg-gray-800" />
              ))
            ) : (
              stats.map((item) => (
                <motion.div
                  key={item.label}
                  variants={itemVariants}
                  className="rounded-3xl border border-white/20 bg-white/90 p-6 shadow-sm dark:bg-gray-900 hover:shadow-lg transition-shadow"
                >
                  <p className="text-sm uppercase tracking-[0.3em] text-gray-500">{item.label}</p>
                  <p className="mt-4 text-4xl font-bold text-rose-pink">{item.value}</p>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {quickActions.map((action) => (
              <motion.button
                key={action.path}
                variants={itemVariants}
                onClick={() => navigate(action.path)}
                className="rounded-3xl border border-white/20 bg-white/90 p-5 text-left shadow-sm hover:shadow-lg dark:bg-gray-900 transition-all hover:border-rose-pink/50 hover:bg-rose-pink/5"
              >
                <p className="font-semibold text-lg">{action.label}</p>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{action.desc}</p>
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>
  )
}
