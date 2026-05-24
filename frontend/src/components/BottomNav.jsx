import {
  useLocation,
  useNavigate,
} from 'react-router-dom'

import {
  FiHome,
  FiShoppingBag,
  FiImage,
  FiCalendar,
  FiBell,
  FiUser,
  FiShield,
} from 'react-icons/fi'

import { useAuthStore } from '../store/authStore'

export default function BottomNav() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuthStore()

  const isAdmin =
    user?.role === 'admin' || user?.role === 'super_admin'

  const navItems = [
    { icon: FiHome, label: 'Home', path: '/' },
    { icon: FiShoppingBag, label: 'Services', path: '/services' },
    { icon: FiImage, label: 'Gallery', path: '/gallery' },
    { icon: FiCalendar, label: 'Bookings', path: '/bookings' },
    { icon: FiUser, label: 'Profile', path: '/profile' },
  ]

  if (isAdmin) {
    navItems.push({
      icon: FiShield,
      label: 'Admin',
      path: '/admin',
    })
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[100] bg-white/95 backdrop-blur-xl border-t border-gray-200 shadow-lg">
      {/* MOBILE (always 5 items -> prevents admin overflow/overlap) */}
      <div className="flex justify-between items-center h-[4.75rem] px-[max(0.25rem,env(safe-area-inset-left,0px))] pr-[max(0.25rem,env(safe-area-inset-right,0px))] sm:hidden">
        {navItems.slice(0, 5).map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center flex-1 py-2 rounded-xl transition min-w-0 ${
                isActive ? 'bg-black text-white' : 'text-gray-500'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] mt-1 leading-tight whitespace-nowrap overflow-hidden text-ellipsis max-w-[4.25rem]">
                {item.label}
              </span>
            </button>
          )
        })}
      </div>

      {/* DESKTOP */}
      <div className="hidden sm:flex justify-center gap-3 py-3 px-4">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl ${
                isActive
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              <Icon />
              {item.label}
            </button>
          )
        })}
      </div>

      {/* Admin quick access on mobile without breaking layout */}
      {isAdmin && (
        <div className="sm:hidden absolute bottom-0 right-0 z-[101] pr-[env(safe-area-inset-right,0px)]">
          <button
            onClick={() => navigate('/admin')}
            aria-label="Admin"
            className="m-2 h-12 w-12 rounded-2xl bg-black text-white flex items-center justify-center shadow-lg border border-white/10"
          >
            <FiShield className="h-5 w-5" />
          </button>
        </div>
      )}
    </nav>
  )
}