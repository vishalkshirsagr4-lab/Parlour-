import { motion, useReducedMotion } from 'framer-motion'
import PageBackground from './luxury/PageBackground'

export default function LoadingPage() {
  const prefersReduced = useReducedMotion()

  const containerAnim = prefersReduced
    ? {}
    : { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.45, ease: 'easeOut' } }

  return (
    <PageBackground>
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <motion.div
          {...containerAnim}
          role="status"
          aria-live="polite"
          aria-busy="true"
          className="relative max-w-3xl w-full rounded-2xl border border-white/30 bg-white/95 p-6 sm:p-8 shadow-xl shadow-rose-pink/8 backdrop-blur-xl"
        >
          <div className="mb-4 flex items-center gap-3 rounded-2xl bg-rose-pink/10 px-3 py-2 text-rose-pink">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-rose-pink/15 text-lg">
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M12 6v6l4 2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="12" cy="12" r="9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <div>
              <p className="text-xs uppercase tracking-[0.18em] font-semibold text-rose-pink/80">Please wait</p>
              <h1 className="text-lg sm:text-2xl font-extrabold text-slate-900">Preparing your Parlour experience</h1>
            </div>
          </div>

          <p className="mb-6 text-sm text-slate-600">Fetching latest salon data and reviews — this should only take a moment.</p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-slate-200 animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-3/4 rounded bg-slate-200 animate-pulse" />
                    <div className="h-2 w-1/2 rounded bg-slate-200 animate-pulse" />
                  </div>
                </div>
                <div className="h-32 rounded-lg bg-slate-100 sm:h-28 animate-pulse" />
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <svg className="h-6 w-6 text-slate-400 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" strokeWidth="3" stroke="currentColor" className="opacity-25" />
                <path d="M22 12a10 10 0 00-10-10" strokeWidth="3" strokeLinecap="round" stroke="currentColor" />
              </svg>
              <p className="text-sm text-slate-600">Loading content…</p>
            </div>

            <div className="text-sm text-slate-500 bg-slate-50 px-3 py-2 rounded-lg">
              <p className="font-medium text-slate-700">Tip</p>
              <p className="mt-0.5">You can explore services while we finish loading other pieces.</p>
            </div>
          </div>

          <span className="sr-only">Loading</span>
        </motion.div>
      </div>
    </PageBackground>
  )
}
