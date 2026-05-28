import { useEffect, lazy, Suspense } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
BrowserRouter as Router,
Routes,
Route,
Outlet,
} from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import useProtection from './hooks/useProtection'

// Push Notifications
import { initPushNotifications } from './utils/pushNotifications'

// Store
import { useAuthStore } from './store/authStore'

// Layouts
import AdminLayout from './layouts/AdminLayout'
import UserLayout from './layouts/UserLayout'

// Components
import ProtectedRoute from './components/ProtectedRoute'
import LoadingPage from './components/LoadingPage'
import {
AppInstallWrapper,
SocialShareWrapper,
} from './components/LazyLoaders'

import NotificationPermissionBanner from './components/notifications/NotificationPermission'

// Pages
import SplashScreen from './pages/SplashScreen'
import NotFound from './pages/NotFound'

// ================= AUTH PAGES =================

const Login = lazy(() => import('./pages/auth/Login'))
const Register = lazy(() => import('./pages/auth/Register'))
const OTPVerification = lazy(() =>
import('./pages/auth/OTPVerification')
)
const ForgotPassword = lazy(() =>
import('./pages/auth/ForgotPassword')
)
const ResetPassword = lazy(() =>
import('./pages/auth/ResetPassword')
)
const Logout = lazy(() =>
import('./pages/auth/Logout')
)

// ================= USER PAGES =================

const Home = lazy(() => import('./pages/user/Home'))
const Services = lazy(() =>
import('./pages/user/Services')
)
const ServiceDetails = lazy(() =>
import('./pages/user/ServiceDetails')
)
const Gallery = lazy(() =>
import('./pages/user/Gallery')
)
const Bookings = lazy(() =>
import('./pages/user/Bookings')
)
const BookingDetails = lazy(() =>
import('./pages/user/BookingDetails')
)
const Notifications = lazy(() =>
import('./pages/user/Notifications')
)
const Profile = lazy(() =>
import('./pages/user/Profile')
)
const Chat = lazy(() =>
import('./pages/user/Chat')
)

// ================= ADMIN PAGES =================

const AdminDashboard = lazy(() =>
import('./pages/admin/AdminDashboard')
)
const AdminCategories = lazy(() =>
import('./pages/admin/AdminCategories')
)
const AdminServices = lazy(() =>
import('./pages/admin/AdminServices')
)
const AdminGallery = lazy(() =>
import('./pages/admin/AdminGallery')
)
const AdminBookings = lazy(() =>
import('./pages/admin/AdminBookings')
)
const AdminUsers = lazy(() =>
import('./pages/admin/AdminUsers')
)
const AdminStaff = lazy(() =>
import('./pages/admin/AdminStaff')
)
const AdminNotifications = lazy(() =>
import('./pages/admin/AdminNotifications')
)

// ================= REACT QUERY =================

const queryClient = new QueryClient()

export default function App() {
// Zustand selectors
const isLoading = useAuthStore(
(state) => state.isLoading
)

const setLoading = useAuthStore(
(state) => state.setLoading
)

// Handle persisted state hydration
useEffect(() => {
const timer = setTimeout(() => {
setLoading(false)
}, 300)

return () => clearTimeout(timer)

}, [setLoading])

// Restore push notifications automatically
useEffect(() => {
const restorePushSubscription = async () => {
try {
// Only auto-init if user already allowed notifications
if (Notification.permission === 'granted') {
console.log(
'[Push] Restoring push subscription'
)

      await initPushNotifications()

      console.log(
        '[Push] Push subscription restored'
      )
    }
  } catch (error) {
    console.error(
      '[Push] Failed restoring subscription:',
      error
    )
  }
}

restorePushSubscription()

}, [])

// Enable lightweight protections
useProtection({ enabled: true })

// Splash screen while loading
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
{/* PWA Install Banner */}
<AppInstallWrapper />

    {/* Social Share System */}
    <SocialShareWrapper />

    {/* Notification Permission Banner */}
    <NotificationPermissionBanner />

    <Suspense fallback={<LoadingPage />}>
      <Routes>

        {/* ================= AUTH ROUTES ================= */}

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/otp-verification"
          element={<OTPVerification />}
        />

        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />

        <Route
          path="/reset-password"
          element={<ResetPassword />}
        />

        <Route
          path="/logout"
          element={<Logout />}
        />


        {/* ================= USER ROUTES ================= */}

        <Route
          element={
            <ProtectedRoute>
              <UserLayout>
                <Outlet />
              </UserLayout>
            </ProtectedRoute>
          }
        >
          <Route
            index
            element={<Home />}
          />

          <Route
            path="services"
            element={<Services />}
          />

          <Route
            path="services/:id"
            element={<ServiceDetails />}
          />

          <Route
            path="gallery"
            element={<Gallery />}
          />

          <Route
            path="bookings"
            element={<Bookings />}
          />

          <Route
            path="bookings/:id"
            element={<BookingDetails />}
          />

          <Route
            path="notifications"
            element={<Notifications />}
          />

          <Route
            path="profile"
            element={<Profile />}
          />

          <Route
            path="chat/:userId"
            element={<Chat />}
          />
        </Route>


        {/* ================= ADMIN ROUTES ================= */}

        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly>
              <AdminLayout>
                <Outlet />
              </AdminLayout>
            </ProtectedRoute>
          }
        >
          <Route
            index
            element={<AdminDashboard />}
          />

          <Route
            path="categories"
            element={<AdminCategories />}
          />

          <Route
            path="services"
            element={<AdminServices />}
          />

          <Route
            path="gallery"
            element={<AdminGallery />}
          />

          <Route
            path="bookings"
            element={<AdminBookings />}
          />

          <Route
            path="users"
            element={<AdminUsers />}
          />

          <Route
            path="staff"
            element={<AdminStaff />}
          />

          <Route
            path="notifications"
            element={<AdminNotifications />}
          />
        </Route>


        {/* ================= 404 ================= */}

        <Route
          path="*"
          element={<NotFound />}
        />

      </Routes>
    </Suspense>
  </Router>

  <Toaster position="top-center" />
</QueryClientProvider>

)
  }
