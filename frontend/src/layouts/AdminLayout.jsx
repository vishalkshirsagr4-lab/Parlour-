import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'

const adminPages = [
  { path: '/admin', label: '📊 Dashboard', icon: '📊' },
  { path: '/admin/bookings', label: '📅 Bookings', icon: '📅' },
  { path: '/admin/services', label: '✨ Services', icon: '✨' },
  { path: '/admin/categories', label: '🏷️ Categories', icon: '🏷️' },
  { path: '/admin/gallery', label: '🖼️ Gallery', icon: '🖼️' },
  { path: '/admin/staff', label: '👥 Staff', icon: '👥' },
  { path: '/admin/users', label: '👤 Users', icon: '👤' },
  { path: '/admin/notifications', label: '🔔 Notifications', icon: '🔔' },
]

export default function AdminLayout({ children, title, description }) {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-50 dark:from-gray-950 dark:to-gray-900">
      {/* Header with Back Button */}
      <div className="sticky top-0 z-40 border-b border-white/10 bg-white/80 backdrop-blur-lg dark:bg-gray-900/80">
        <div className="px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center justify-center h-10 w-10 rounded-full hover:bg-rose-pink/10 transition-colors"
              title="Go back"
            >
              <span className="text-xl">←</span>
            </button>
            <div>
              <h1 className="text-2xl font-bold">{title || 'Admin Dashboard'}</h1>
              {description && <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 p-3 lg:p-4">
        {/* Sidebar Navigation */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:w-72 flex-shrink-0"
        >
          <div className="rounded-3xl border border-white/20 bg-white/90 shadow-sm dark:bg-gray-900 p-3 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 px-3 py-2">Admin Menu</p>
            {adminPages.map((page) => (
              <button
                key={page.path}
                onClick={() => navigate(page.path)}
                className={`w-full text-left px-4 py-3 rounded-2xl transition-all ${
                  location.pathname === page.path
                    ? 'bg-rose-pink/20 text-rose-pink border border-rose-pink/30'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                }`}
              >
                <span className="text-lg mr-2">{page.icon}</span>
                <span className="font-medium">{page.label.split(' ')[1]}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 min-w-0"
        >
          {children}
        </motion.div>
      </div>
    </div>
  )
}
