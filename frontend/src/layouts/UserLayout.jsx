import { Outlet } from 'react-router-dom'
import UserTopBar from '../components/UserTopBar'
import BottomNav from '../components/BottomNav'

export default function UserLayout() {
  return (
    <div className="min-h-screen bg-slate-50">
      <UserTopBar />

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>

      <BottomNav />
    </div>
  )
}
