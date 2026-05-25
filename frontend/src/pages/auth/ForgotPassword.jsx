import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { fadeInUp } from '../../animations/variants'
import { authAPI } from '../../api/endpoints'

export default function ForgotPassword() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!email) {
      toast.error('Please enter your email')
      return
    }

    setLoading(true)
    try {
      await authAPI.forgotPassword({ email })
      toast.success('OTP sent to your email')
      navigate('/reset-password', { state: { email } })
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      variants={fadeInUp}
      initial="initial"
      animate="animate"
      className="min-h-screen bg-gradient-to-br from-rose-pink/10 via-purple-400/10 to-rose-gold/10 flex items-center justify-center p-4"
    >
      <div className="w-full max-w-md glass-effect rounded-3xl p-8">
        <h2 className="text-3xl font-bold text-center mb-2">Forgot Password</h2>
        <p className="text-center text-gray-600  mb-8">Enter your email to reset password</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-rose-pink"
              placeholder="you@example.com"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? 'Sending OTP...' : 'Send OTP'}
          </button>
        </form>

        <p className="text-center text-sm mt-6">
          <button
            onClick={() => navigate('/login')}
            className="text-rose-pink font-semibold hover:underline"
          >
            Back to Login
          </button>
        </p>
      </div>
    </motion.div>
  )
}
