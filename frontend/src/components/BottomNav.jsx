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

  const navItems = [
    {
      icon: FiHome,
      label: 'Home',
      path: '/',
    },
    {
      icon: FiShoppingBag,
      label: 'Services',
      path: '/services',
    },
    {
      icon: FiImage,
      label: 'Gallery',
      path: '/gallery',
    },
    {
      icon: FiCalendar,
      label: 'Bookings',
      path: '/bookings',
    },
    {
      icon: FiBell,
      label: 'Alerts',
      path: '/notifications',
    },
    {
      icon: FiUser,
      label: 'Profile',
      path: '/profile',
    },
  ]

  // ONLY SHOW ADMIN ON LARGE DEVICES
  const isAdmin =
    user?.role === 'admin' ||
    user?.role === 'super_admin'

  if (isAdmin) {
    navItems.push({
      icon: FiShield,
      label: 'Admin',
      path: '/admin',
    })
  }

  return (
    <nav
      role="navigation"
      aria-label="Bottom Navigation"
      className="
        fixed
        bottom-0
        left-0
        right-0
        z-50
        bg-white/95
        backdrop-blur-2xl
        border-t
        border-gray-200
        shadow-[0_-8px_30px_rgba(0,0,0,0.08)]
        overflow-x-auto
      "
      style={{
        paddingBottom:
          'env(safe-area-inset-bottom)',
      }}
    >

      {/* MOBILE */}
      <div className="sm:hidden">

        <div
          className="
            grid
            grid-cols-5
            items-center
            px-2
            py-2
          "
        >

          {navItems
            .slice(0, 5)
            .map((item) => {
              const Icon = item.icon

              const isActive =
                location.pathname ===
                item.path

              return (
                <button
                  key={item.path}
                  onClick={() =>
                    navigate(item.path)
                  }
                  className={`
                    flex
                    flex-col
                    items-center
                    justify-center
                    py-2
                    rounded-2xl
                    transition-all
                    duration-300
                    active:scale-95
                    ${
                      isActive
                        ? `
                          bg-black
                          text-white
                          shadow-lg
                        `
                        : `
                          text-gray-500
                        `
                    }
                  `}
                >

                  <Icon
                    className={`
                      ${
                        isActive
                          ? 'w-6 h-6'
                          : 'w-5 h-5'
                      }
                    `}
                  />

                  <span
                    className="
                      mt-1
                      text-[10px]
                      font-bold
                      tracking-wide
                    "
                  >
                    {item.label}
                  </span>

                </button>
              )
            })}

        </div>

      </div>

      {/* TABLET + DESKTOP */}
      <div className="hidden sm:block">

        <div
          className="
            max-w-5xl
            mx-auto
            flex
            items-center
            justify-center
            gap-3
            px-4
            py-3
          "
        >

          {navItems.map((item) => {
            const Icon = item.icon

            const isActive =
              location.pathname ===
              item.path

            return (
              <button
                key={item.path}
                onClick={() =>
                  navigate(item.path)
                }
                className={`
                  flex
                  items-center
                  gap-2
                  px-5
                  py-3
                  rounded-2xl
                  font-semibold
                  transition-all
                  duration-300
                  ${
                    isActive
                      ? `
                        bg-black
                        text-white
                        shadow-xl
                      `
                      : `
                        bg-gray-100
                        text-gray-700
                        hover:bg-gray-200
                      `
                  }
                `}
              >

                <Icon className="w-5 h-5" />

                <span className="text-sm">
                  {item.label}
                </span>

              </button>
            )
          })}

        </div>

      </div>

    </nav>
  )
}