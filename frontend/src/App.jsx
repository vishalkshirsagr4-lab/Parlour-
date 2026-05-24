import { useEffect, lazy, Suspense } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

// Store
import { useAuthStore } from './store/authStore'

// Layouts
import AdminLayout from './layouts/AdminLayout'

// Pages
import SplashScreen from './pages/SplashScreen'
import LoadingPage from './components/LoadingPage'
import NotFound from './pages/NotFound'
const Login = lazy(() => import('./pages/auth/Login'))
const Register = lazy(() => import('./pages/auth/Register'))
const OTPVerification = lazy(() => import('./pages/auth/OTPVerification'))
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'))
const ResetPassword = lazy(() => import('./pages/auth/ResetPassword'))
const Logout = lazy(() => import('./pages/auth/Logout'))
const Home = lazy(() => import('./pages/user/Home'))
const Services = lazy(() => import('./pages/user/Services'))
const ServiceDetails = lazy(() => import('./pages/user/ServiceDetails'))
const Gallery = lazy(() => import('./pages/user/Gallery'))
const Bookings = lazy(() => import('./pages/user/Bookings'))
const BookingDetails = lazy(() => import('./pages/user/BookingDetails'))
const Notifications = lazy(() => import('./pages/user/Notifications'))
const Profile = lazy(() => import('./pages/user/Profile'))
const Chat = lazy(() => import('./pages/user/Chat'))
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
const AdminCategories = lazy(() => import('./pages/admin/AdminCategories'))
const AdminServices = lazy(() => import('./pages/admin/AdminServices'))
const AdminGallery = lazy(() => import('./pages/admin/AdminGallery'))
const AdminBookings = lazy(() => import('./pages/admin/AdminBookings'))
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'))
const AdminStaff = lazy(() => import('./pages/admin/AdminStaff'))
const AdminNotifications = lazy(() => import('./pages/admin/AdminNotifications'))

// Protected Route
import ProtectedRoute from './components/ProtectedRoute'
import { AppInstallWrapper, SocialShareWrapper } from './components/LazyLoaders'

const queryClient = new QueryClient()

export default function App() {
  const { isLoading, setLoading } = useAuthStore()

  useEffect(() => {
    if (isLoading) setLoading(false)
  }, [])

  if (isLoading) {
    return (
      <QueryClientProvider client={queryClient}>
        <Router>
          <SplashScreen />
        </Router>
        <Toaster position="top-center" />
      </QueryClientProvider>
    )
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AppInstallWrapper />
        <SocialShareWrapper />
        <Suspense fallback={<LoadingPage />}>
          <Routes>
            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/otp-verification" element={<OTPVerification />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/logout" element={<Logout />} />

            {/* User Routes */}
            <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="/services" element={<ProtectedRoute><Services /></ProtectedRoute>} />
            <Route path="/services/:id" element={<ProtectedRoute><ServiceDetails /></ProtectedRoute>} />
            <Route path="/gallery" element={<ProtectedRoute><Gallery /></ProtectedRoute>} />
            <Route path="/bookings" element={<ProtectedRoute><Bookings /></ProtectedRoute>} />
            <Route path="/bookings/:id" element={<ProtectedRoute><BookingDetails /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/chat/:userId" element={<ProtectedRoute><Chat /></ProtectedRoute>} />

            {/* Admin Routes */}
            <Route path="/admin" element={<ProtectedRoute adminOnly><AdminLayout><Outlet /></AdminLayout></ProtectedRoute>}>
              <Route index element={<AdminDashboard />} />
              <Route path="categories" element={<AdminCategories />} />
              <Route path="services" element={<AdminServices />} />
              <Route path="gallery" element={<AdminGallery />} />
              <Route path="bookings" element={<AdminBookings />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="staff" element={<AdminStaff />} />
              <Route path="notifications" element={<AdminNotifications />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </Router>
      <Toaster position="top-center" />
    </QueryClientProvider>
  )
}
