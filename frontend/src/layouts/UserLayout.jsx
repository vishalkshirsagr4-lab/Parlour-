import { Outlet } from 'react-router-dom'
import UserTopBar from '../components/UserTopBar'
import BottomNav from '../components/BottomNav'

export default function UserLayout() {
  return (
    <div className="min-h-screen bg-slate-50">
      <UserTopBar />

      <main className="mx-auto max-w-6xl px-3 py-4 sm:px-4 lg:px-6">
        <Outlet />
      </main>

      <BottomNav />
    </div>
  )
}
