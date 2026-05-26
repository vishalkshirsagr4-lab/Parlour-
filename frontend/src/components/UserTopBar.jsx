import { useNavigate, useLocation } from 'react-router-dom'
import { FiUser } from 'react-icons/fi'

import NotificationBell from './notifications/NotificationBell'

export default function UserTopBar() {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <header className="w-full border-b bg-white/60 backdrop-blur sticky top-0 z-40">
      <div className="mx-auto max-w-6xl flex items-center justify-between px-3 py-2">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-bold text-[#333]">Parlour</h1>
          {location.pathname === '/notifications' ? (
            <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-rose-600 shadow-sm shadow-rose-100">
              Notifications
            </span>
          ) : null}
        </div>

        <div className="flex items-center gap-3">
          <NotificationBell />

          <button
            onClick={() => navigate('/profile')}
            className="inline-flex items-center justify-center rounded-2xl p-2 transition-colors duration-200 hover:bg-gray-100 text-[#333] focus:outline-none focus:ring-2 focus:ring-rose-200/50"
            aria-label="Profile"
          >
            <FiUser className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  )
}
