import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useGoogleLogin } from '@react-oauth/google'
import toast from 'react-hot-toast'
import { fadeInUp } from '../../animations/variants'
import { authAPI } from '../../api/endpoints'
import { useAuthStore } from '../../store/authStore'

export default function Register() {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!form.name || !form.email || !form.password) {
      toast.error('Please fill all fields')
      return
    }

    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    setLoading(true)
    try {
      await authAPI.register(form)
      toast.success('OTP sent to your email')
      navigate('/otp-verification', { state: { ...form, isRegister: true } })
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const googleLogin = useGoogleLogin({
    onSuccess: async (googleResponse) => {
      try {
        const payload = googleResponse.code
          ? { code: googleResponse.code }
          : { token: googleResponse.credential || googleResponse.access_token }

        const response = await authAPI.googleAuth(payload)
        const { user, token, refreshToken } = response.data
        setAuth(user, token, refreshToken)
        toast.success('Google registration successful')
        navigate('/')
      } catch (error) {
        toast.error(error.response?.data?.message || 'Google registration failed')
      }
    },
    flow: 'auth-code',
    scope: 'openid profile email',
    onError: (error) => {
      toast.error(error?.error || 'Google registration failed')
    },
  })

  return (
    <motion.div
      variants={fadeInUp}
      initial="initial"
      animate="animate"
      className="min-h-screen bg-gradient-to-br from-rose-pink/10 via-purple-400/10 to-rose-gold/10 flex items-center justify-center p-4"
    >
      <div className="w-full max-w-md glass-effect rounded-3xl p-8">
        <h2 className="text-3xl font-bold text-center mb-2">Create Account</h2>
        <p className="text-center text-gray-600 mb-8">Join our premium salon community</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Full Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-rose-pink"
              placeholder="Your name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Email Address</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-rose-pink"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-rose-pink"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <div className="my-6 flex items-center gap-4">
          <div className="flex-1 h-px bg-gray-300" />
          <span className="text-sm text-gray-600">or</span>
          <div className="flex-1 h-px bg-gray-300" />
        </div>

        <button
          onClick={() => googleLogin()}
          className="btn-secondary w-full flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Continue with Google
        </button>

        <p className="text-center text-sm mt-6">
          Already have an account?{' '}
          <button
            onClick={() => navigate('/login')}
            className="text-rose-pink font-semibold hover:underline"
          >
            Login here
          </button>
        </p>
      </div>
    </motion.div>
  )
}
