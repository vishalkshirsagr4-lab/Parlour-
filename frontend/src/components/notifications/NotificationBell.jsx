import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { FiBell } from 'react-icons/fi'
import { AnimatePresence, motion } from 'framer-motion'

import { useAuthStore } from '../../store/authStore'
import { useNotifications } from '../../hooks/notifications/useNotifications'
import { initSocket } from '../../utils/socketManager'

export default function NotificationBell() {
  const { token } = useAuthStore()
  const navigate = useNavigate()

  const [hasSeenBatch, setHasSeenBatch] = useState(false)
  const [highlightNew, setHighlightNew] = useState(false)

  const { data } = useNotifications({ limit: 20 })

  const notifications = useMemo(() => {
    const arr = Array.isArray(data?.notifications)
      ? data.notifications
      : Array.isArray(data)
        ? data
        : []
    return arr
  }, [data])

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n?.isRead).length,
    [notifications]
  )

  const previousUnread = useRef(unreadCount)

  const location = useLocation()
  const isNotificationsPage = location.pathname === '/notifications'

  useEffect(() => {
    if (unreadCount > previousUnread.current) {
      setHasSeenBatch(false)
      setHighlightNew(true)
    }
    previousUnread.current = unreadCount
  }, [unreadCount])

  useEffect(() => {
    if (isNotificationsPage) {
      setHasSeenBatch(true)
      setHighlightNew(false)
    }
  }, [isNotificationsPage])

  useEffect(() => {
    if (!token) return
    // Initialize socket once auth token exists
    // (hook is already polling, socket only enhances realtime)
    initSocket(token)
  }, [token])

  const notificationLabel = useMemo(
    () => (unreadCount > 0 ? `${unreadCount} new` : 'No new notifications'),
    [unreadCount]
  )

  return (
    <button
      type="button"
      onClick={() => navigate('/notifications')}
      aria-label={notificationLabel}
      title="Open notifications"
      className="relative inline-flex h-12 min-w-[3rem] items-center justify-center rounded-3xl border border-slate-200/80 bg-white/95 px-3 py-2 text-slate-900 shadow-[0_18px_45px_rgba(15,23,42,0.08)] transition-all duration-200 hover:-translate-y-0.5 hover:border-rose-200 hover:bg-rose-50 focus:outline-none focus:ring-2 focus:ring-rose-200/40 active:scale-95 dark:border-slate-700/80 dark:bg-slate-900/95 dark:text-white dark:hover:bg-slate-800"
    >
      <motion.span
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        animate={highlightNew ? { rotate: [0, 3, -3, 0], scale: [1, 1.03, 1] } : { scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="inline-flex items-center justify-center"
      >
        <FiBell className="h-5 w-5" />
      </motion.span>

      <AnimatePresence>
        {unreadCount > 0 && !hasSeenBatch ? (
          <motion.span
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="absolute -top-1 -right-1 flex min-h-[1.35rem] min-w-[1.35rem] items-center justify-center rounded-full bg-rose-500 px-1.5 text-[11px] font-black text-white shadow-lg shadow-rose-500/30"
          >
            <span className="absolute inset-0 rounded-full bg-rose-500/30 opacity-80 animate-ping" />
            <span className="relative z-10">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          </motion.span>
        ) : null}
      </AnimatePresence>

      <span className="sr-only">{notificationLabel}</span>
    </button>
  )
}

