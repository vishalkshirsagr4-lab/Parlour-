import { useNavigate } from 'react-router-dom'
import { FiArrowLeft, FiHome } from 'react-icons/fi'
import { motion } from 'framer-motion'
import PageBackground from '../components/luxury/PageBackground'

export default function NotFound() {
  const navigate = useNavigate()

  return (
    <PageBackground>
      <div className="min-h-screen flex items-center justify-center px-4 py-16">
        <motion.div
          className="relative w-full max-w-3xl rounded-[2rem] border border-white/30 bg-white/90 p-8 shadow-2xl shadow-rose-pink/10 backdrop-blur-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
        >
          <div className="absolute inset-x-10 top-0 h-24 rounded-b-[2rem] bg-gradient-to-r from-rose-pink to-purple-400 blur-2xl opacity-40" />
          <div className="relative flex flex-col gap-6 text-center">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-rose-pink/10 text-4xl font-black text-rose-pink shadow-lg shadow-rose-pink/10">
              404
            </div>
            <div>
              <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">Page not found</h1>
              <p className="mt-3 text-sm text-slate-600 sm:text-base">
                The page you’re looking for might have moved, been renamed, or is temporarily unavailable.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="inline-flex items-center justify-center gap-2 rounded-3xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-rose-pink hover:text-rose-pink focus:outline-none focus:ring-2 focus:ring-rose-pink/30"
              >
                <FiArrowLeft className="h-4 w-4" />
                Go back
              </button>
              <button
                type="button"
                onClick={() => navigate('/')}
                className="inline-flex items-center justify-center gap-2 rounded-3xl bg-rose-pink px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-rose-pink/20 transition hover:bg-rose-pink/90 focus:outline-none focus:ring-2 focus:ring-rose-pink/40"
              >
                <FiHome className="h-4 w-4" />
                Return home
              </button>
            </div>

            <div className="rounded-[1.6rem] border border-slate-200 bg-slate-50 p-5 text-left text-sm text-slate-600">
              <p className="font-semibold text-slate-900">Need help?</p>
              <p className="mt-2">If this page should exist, double-check the URL or visit the home page to continue.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </PageBackground>
  )
}
