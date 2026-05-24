import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { useAuthStore } from '../store/authStore'

const DISMISS_KEY = 'parlour-install-dismissed-until'
const INSTALLED_KEY = 'parlour-install-installed'
const INSTALL_CLICKS_KEY = 'parlour-install-clicks'
const DISMISS_CLICKS_KEY = 'parlour-dismiss-clicks'
const SUCCESS_CLICKS_KEY = 'parlour-install-successes'

const DISMISS_DURATION_MS = 7 * 24 * 60 * 60 * 1000

const bannerVariants = {
  hidden: { opacity: 0, y: -24 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -24 },
}

const sheetVariants = {
  hidden: { opacity: 0, y: 80 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 80 },
}

// Safe localStorage helpers
const safeLocalStorage = {
  get(key) {
    try {
      if (typeof window === 'undefined') return null
      return localStorage.getItem(key)
    } catch {
      return null
    }
  },

  set(key, value) {
    try {
      if (typeof window === 'undefined') return
      localStorage.setItem(key, value)
    } catch {
      // ignore
    }
  },
}

const incrementMetric = (key) => {
  try {
    const count = Number(safeLocalStorage.get(key) || 0)
    safeLocalStorage.set(key, String(count + 1))
  } catch {
    // ignore
  }
}

const getDismissedUntil = () => {
  try {
    const stored = safeLocalStorage.get(DISMISS_KEY)
    return stored ? new Date(stored) : null
  } catch {
    return null
  }
}

const saveDismissedUntil = () => {
  safeLocalStorage.set(
    DISMISS_KEY,
    new Date(Date.now() + DISMISS_DURATION_MS).toISOString()
  )
}

const markInstalled = () => {
  safeLocalStorage.set(INSTALLED_KEY, 'true')
  incrementMetric(SUCCESS_CLICKS_KEY)
}

export default function AppInstallPrompt() {
  // Zustand selector (safe)
  const isAuthenticated = useAuthStore(
    (state) => state.isAuthenticated
  )

  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isAndroid, setIsAndroid] = useState(false)
  const [isIos, setIsIos] = useState(false)

  const showInstallTarget = useMemo(() => {
    return isMobile ? 'bottom-sheet' : 'banner'
  }, [isMobile])

  useEffect(() => {
    if (typeof window === 'undefined') return

    if (!isAuthenticated) {
      setShowPrompt(false)
      return
    }

    const userAgent = navigator.userAgent || ''

    const mobile =
      /android|iphone|ipad|ipod|mobile/i.test(userAgent)

    const android = /android/i.test(userAgent)

    const ios =
      /iphone|ipad|ipod/i.test(userAgent)

    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator?.standalone === true

    setIsMobile(mobile)
    setIsAndroid(android)
    setIsIos(ios)

    const dismissedUntil = getDismissedUntil()

    const wasDismissed =
      dismissedUntil && dismissedUntil > new Date()

    const alreadyInstalled =
      safeLocalStorage.get(INSTALLED_KEY) === 'true'

    if (
      !isAuthenticated ||
      isStandalone ||
      alreadyInstalled ||
      wasDismissed
    ) {
      setShowPrompt(false)
      return
    }

    setShowPrompt(true)
  }, [isAuthenticated])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault()
      setDeferredPrompt(event)
    }

    const handleAppInstalled = () => {
      markInstalled()
      toast.success('App installed successfully!')
      setShowPrompt(false)
    }

    window.addEventListener(
      'beforeinstallprompt',
      handleBeforeInstallPrompt
    )

    window.addEventListener(
      'appinstalled',
      handleAppInstalled
    )

    return () => {
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt
      )

      window.removeEventListener(
        'appinstalled',
        handleAppInstalled
      )
    }
  }, [])

  const handleInstall = async () => {
    setShowPrompt(false)

    incrementMetric(INSTALL_CLICKS_KEY)

    try {
      if (deferredPrompt) {
        deferredPrompt.prompt()

        const choice =
          await deferredPrompt.userChoice

        if (choice.outcome === 'accepted') {
          markInstalled()

          toast.success(
            'Install prompt accepted!'
          )
        } else {
          toast(
            'You can install it anytime from browser menu',
            {
              icon: 'ℹ️',
            }
          )
        }

        setDeferredPrompt(null)
        return
      }

      if (isIos) {
        toast(
          'Tap Share → Add to Home Screen',
          {
            icon: '📲',
            duration: 6000,
          }
        )

        return
      }

      toast(
        'Use browser menu to install app',
        {
          icon: '📲',
          duration: 5000,
        }
      )
    } catch (error) {
      console.error(error)

      toast.error(
        'Something went wrong while installing'
      )
    }
  }

  const handleDismiss = () => {
    saveDismissedUntil()

    incrementMetric(DISMISS_CLICKS_KEY)

    setShowPrompt(false)
  }

  if (!isAuthenticated || !showPrompt) {
    return null
  }

  const installButtonLabel = deferredPrompt
    ? 'Install App'
    : isIos
    ? 'Add to Home Screen'
    : 'Install App'

  const message =
    'Install our salon app for faster booking experience and open app faster next time.'

  return (
    <AnimatePresence>
      {/* Desktop Banner */}
      {showPrompt && !isMobile && (
        <motion.div
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={bannerVariants}
          className="fixed inset-x-4 top-4 z-50 mx-auto max-w-5xl rounded-[32px] border border-white/10 bg-white/90 px-5 py-4 shadow-2xl backdrop-blur-xl dark:bg-slate-950/90"
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-3xl shadow-lg">
                <img
                  src="/icons/profile-1.jpg"
                  alt="Parlour app"
                  className="h-full w-full object-cover"
                />
              </div>

              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-rose-600">
                  Premium App Experience
                </p>

                <h2 className="mt-1 text-lg font-bold text-slate-950 dark:text-white">
                  Install our salon app for faster booking
                </h2>

                <p className="mt-1 max-w-2xl text-sm text-slate-600 dark:text-slate-300">
                  Open app faster next time and enjoy appointment reminders, offline support and native convenience.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                onClick={handleInstall}
                className="rounded-2xl bg-gradient-to-r from-fuchsia-600 to-rose-500 px-6 py-3 text-sm font-semibold text-white shadow-lg"
              >
                {installButtonLabel}
              </button>

              <button
                onClick={handleDismiss}
                className="rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              >
                Dismiss
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Mobile Bottom Sheet */}
      {showPrompt && isMobile && (
        <motion.div
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={sheetVariants}
          className="fixed inset-x-0 bottom-0 z-50 rounded-t-[32px] border border-white/10 bg-slate-950/95 px-5 py-6 shadow-2xl backdrop-blur-xl"
        >
          <div className="mx-auto flex max-w-3xl flex-col gap-5 text-white">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br from-pink-500 via-fuchsia-500 to-violet-600">
                  <span className="text-2xl">💖</span>
                </div>

                <div>
                  <p className="text-sm uppercase tracking-[0.22em] text-pink-200">
                    Open App Faster
                  </p>

                  <h3 className="text-xl font-bold">
                    Install salon app for best experience
                  </h3>
                </div>
              </div>

              <button
                onClick={handleDismiss}
                className="rounded-2xl border border-white/20 bg-white/5 px-4 py-2 text-sm font-semibold text-white/80"
              >
                Later
              </button>
            </div>

            <p className="text-sm text-slate-300">
              {message}
            </p>

            <div className="grid gap-3 sm:grid-cols-2">
              {[
                'Faster loading',
                'Easy appointment booking',
                'Notification reminders',
                'Offline support',
              ].map((benefit) => (
                <div
                  key={benefit}
                  className="rounded-3xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-slate-100"
                >
                  {benefit}
                </div>
              ))}
            </div>

            <button
              onClick={handleInstall}
              className="rounded-3xl bg-gradient-to-r from-fuchsia-500 to-rose-500 px-5 py-4 text-base font-semibold text-white shadow-xl"
            >
              {installButtonLabel}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}