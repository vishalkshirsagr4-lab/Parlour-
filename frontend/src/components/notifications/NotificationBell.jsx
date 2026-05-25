import { useEffect, useMemo, useState } from 'react'
import { FiBell } from 'react-icons/fi'
import { motion } from 'framer-motion'

import { useAuthStore } from '../../store/authStore'
import { useNotifications } from '../../hooks/notifications/useNotifications'
import { initSocket } from '../../utils/socketManager'
import { notificationAPI } from '../../api/endpoints'
import NotificationDropdownPanel from './NotificationDropdownPanel'

import {
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'

export default function NotificationBell() {
  const { user, token } = useAuthStore()
  const queryClient = useQueryClient()

  const [open, setOpen] = useState(false)

  const { data, isLoading, isError } = useNotifications({ limit: 20 })

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

  const markReadMutation = useMutation({
    mutationFn: (id) => notificationAPI.markAsRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  })

  const markAllMutation = useMutation({
    mutationFn: () => notificationAPI.markAllAsRead(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => notificationAPI.deleteNotification(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  })

  useEffect(() => {
    if (!token) return
    // Initialize socket once auth token exists
    // (hook is already polling, socket only enhances realtime)
    // eslint-disable-next-line no-unused-expressions
    initSocket(token)
  }, [token])

  // Close on escape / outside click
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className="relative">
      <motion.button
        type="button"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setOpen((v) => !v)}
        aria-label="Notifications"
        className="relative rounded-2xl bg-white/10 p-2.5 text-white/90 hover:bg-white/20"
      >
        <FiBell className="h-5 w-5" />
        {unreadCount > 0 ? (
          <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-black text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        ) : null}
      </motion.button>

      <NotificationDropdownPanel
        open={open}
        onClose={() => setOpen(false)}
        notifications={notifications}
        isLoading={isLoading}
        isError={isError}
        unreadCount={unreadCount}
        disabled={
          markReadMutation.isPending ||
          markAllMutation.isPending ||
          deleteMutation.isPending
        }
        onMarkRead={(id) => markReadMutation.mutate(id)}
        onMarkAllAsRead={() => markAllMutation.mutate()}
        onDelete={(id) => deleteMutation.mutate(id)}
      />
    </div>
  )
}

