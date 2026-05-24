import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import SplashScreen from '../pages/SplashScreen'

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { isAuthenticated, user, isLoading } = useAuthStore()

  // Prevent refresh-crash/blank screens while auth state is rehydrating
  if (isLoading) {
    return <SplashScreen />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (adminOnly && user?.role !== 'admin' && user?.role !== 'super_admin') {
    return <Navigate to="/" replace />
  }

  return children
}

