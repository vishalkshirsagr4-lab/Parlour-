import { useNavigate } from 'react-router-dom'
import { FiBell, FiUser } from 'react-icons/fi'

export default function UserTopBar() {
  const navigate = useNavigate()

  return (
    <header className="w-full border-b bg-white/60 backdrop-blur sticky top-0 z-40">
      <div className="mx-auto max-w-6xl flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-bold">Parlour</h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/notifications')}
            className="rounded-lg p-2 hover:bg-gray-100"
            aria-label="Notifications"
          >
            <FiBell className="w-5 h-5" />
          </button>

          <button
            onClick={() => navigate('/profile')}
            className="rounded-lg p-2 hover:bg-gray-100"
            aria-label="Profile"
          >
            <FiUser className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  )
}
