import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { fadeInUp } from '../../animations/variants'
import { authAPI } from '../../api/endpoints'
import { useAuthStore } from '../../store/authStore'

export default function OTPVerification() {
  const navigate = useNavigate()
  const location = useLocation()
  const { setAuth } = useAuthStore()
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)

  const state = location.state || {}
  const { email, name, password, isRegister, isLogin } = state

  const handleOtpChange = (index, value) => {
    const newOtp = [...otp]
    newOtp[index] = value.slice(-1)
    setOtp(newOtp)

    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`).focus()
    }
  }

  const handleVerify = async (e) => {
    e.preventDefault()
    const otpCode = otp.join('')

    if (otpCode.length !== 6) {
      toast.error('Please enter complete OTP')
      return
    }

    setLoading(true)
    try {
      let response
      if (isRegister) {
        response = await authAPI.verifyRegister({ name, email, password, otp: otpCode })
      } else if (isLogin) {
        response = await authAPI.verifyLogin({ email, otp: otpCode })
      }

      const { user, token, refreshToken } = response.data
      setAuth(user, token, refreshToken)
      toast.success('Verification successful!')
      navigate('/')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Verification failed')
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
        <h2 className="text-3xl font-bold text-center mb-2">Verify OTP</h2>
        <p className="text-center text-gray-600  mb-8">Enter the OTP sent to {email}</p>

        <form onSubmit={handleVerify} className="space-y-6">
          <div className="flex gap-2 justify-center">
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                maxLength="1"
                className="w-12 h-12 text-center text-xl font-bold rounded-lg bg-white border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-rose-pink"
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>
        </form>

        <p className="text-center text-sm mt-6 text-gray-600 ">
          Didn&apos;t receive OTP?{' '}

          <button
            type="button"
            onClick={async () => {
              setLoading(true)
              try {
                if (isRegister) {
                  await authAPI.register({ name, email, password })
                } else if (isLogin) {
                  await authAPI.login({ email })
                }
                toast.success('OTP resent to your email')
              } catch (error) {
                toast.error(error.response?.data?.message || 'Unable to resend OTP')
              } finally {
                setLoading(false)
              }
            }}
            className="text-rose-pink font-semibold hover:underline"
          >
            Resend
          </button>
        </p>
      </div>
    </motion.div>
  )
}
