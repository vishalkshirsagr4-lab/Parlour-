import { useLocation, useNavigate } from 'react-router-dom'
import {
  FiHome,
  FiShoppingBag,
  FiImage,
  FiCalendar,
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
    <nav className="fixed bottom-0 left-0 right-0 z-[100] w-full bg-white/95 backdrop-blur-xl border-t border-gray-200 shadow-lg overflow-x-hidden">
      
      {/* MOBILE */}
      <div className="sm:hidden flex items-center justify-between h-20 px-2 safe-area-pb">
        {navItems.slice(0, 5).map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center flex-1 min-w-0 py-2 rounded-xl transition ${
                isActive ? 'bg-black text-white' : 'text-gray-500'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] mt-1 truncate w-full text-center">
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
    </nav>
  )
    }
