import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

import PageBackground from '../components/luxury/PageBackground'
import { useAuthStore } from '../store/authStore'

export default function SplashScreen() {
  const navigate = useNavigate()
  useEffect(() => {
    const t = setTimeout(() => {
      try {
        const isAuthenticated = useAuthStore.getState().isAuthenticated
        navigate(isAuthenticated ? '/' : '/login', { replace: true })
      } catch {
        toast.error('Auth state unavailable')
        navigate('/login', { replace: true })
      }
    }, 1400)

    return () => clearTimeout(t)
  }, [navigate])


  return (
    <PageBackground>
      <motion.div
        className="w-full h-screen flex items-center justify-center relative overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.35 }}
      >
        <motion.div
          className="absolute -top-32 left-1/2 w-[32rem] h-[32rem] -translate-x-1/2 rounded-full bg-rose-pink/15 blur-3xl"
          animate={{ scale: [0.95, 1.05, 1] }}
          transition={{ duration: 1.8, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -bottom-40 -right-24 w-[28rem] h-[28rem] rounded-full bg-purple-400/15 blur-3xl"
          animate={{ scale: [1.05, 0.98, 1] }}
          transition={{ duration: 1.7, ease: 'easeInOut', delay: 0.1 }}
        />

        <motion.div
          className="relative text-center bg-white/90 border border-black/5 rounded-[2.2rem] px-7 py-8 mx-4 shadow-md"
          initial={{ opacity: 0, y: 18, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <motion.div
            className="mx-auto mb-5 w-16 h-16 rounded-3xl bg-gradient-to-br from-rose-pink via-purple-400 to-rose-gold flex items-center justify-center shadow-luxury"
            animate={{ rotate: [0, 8, 0], scale: [1, 1.06, 1] }}
            transition={{ duration: 1.6, ease: 'easeInOut' }}
          >
            <span className="text-2xl font-bold text-white tracking-wide">P</span>
          </motion.div>

          <motion.h1
            className="text-5xl font-extrabold text-black tracking-widest"
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
          >
            PARLOUR
          </motion.h1>
          <motion.p
            className="mt-3 text-black/70 text-sm md:text-base"
            initial={{ y: 8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.35, delay: 0.15 }}
          >
            Premium Salon Experience
          </motion.p>

          <motion.div
            className="mt-8 flex items-center justify-center gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="w-2.5 h-2.5 rounded-full bg-black"
                animate={{ scale: [1, 1.8, 1], opacity: [0.4, 1, 0.6] }}
                transition={{ duration: 1.35, delay: i * 0.15, repeat: Infinity, ease: 'easeInOut' }}
              />
            ))}
          </motion.div>
        </motion.div>

        <motion.div
          className="absolute bottom-8 left-1/2 w-[70%] max-w-md h-1.5 rounded-full bg-black/5 -translate-x-1/2 overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
        >
          <motion.div
            className="h-full w-1/2 bg-black/20 rounded-full"
            animate={{ x: ['-50%', '200%'] }}
            transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>
      </motion.div>
    </PageBackground>
  )
}

