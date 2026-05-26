import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

import { notificationAPI } from '../../api/endpoints'
import { containerVariants, itemVariants } from '../../animations/variants'

import BottomNav from '../../components/BottomNav'
import PageBackground from '../../components/luxury/PageBackground'

export default function Notifications() {
  const queryClient = useQueryClient()

  // FIXED QUERY
  const {
    data,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await notificationAPI.getNotifications({
        page: 1,
        limit: 20,
      })

      return res?.data || {}
    },
  })

  // FIXED REACT QUERY v5 MUTATION
  const markReadMutation = useMutation({
    mutationFn: (id) => notificationAPI.markAsRead(id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['notifications'],
      })
    },

    onError: () => {
      toast.error('Could not mark as read')
    },
  })

  const markAllMutation = useMutation({
    mutationFn: () => notificationAPI.markAllAsRead(),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['notifications'],
      })
    },

    onError: () => {
      toast.error('Could not mark all as read')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => notificationAPI.deleteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      toast.success('Notification deleted')
    },
    onError: () => toast.error('Could not delete notification'),
  })

  const deleteMultipleMutation = useMutation({
    mutationFn: async (ids) => {
      await Promise.all(ids.map((id) => notificationAPI.deleteNotification(id)))
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      toast.success('Selected notifications deleted')
    },
    onError: () => toast.error('Could not delete selected notifications'),
  })

  const [selectedIds, setSelectedIds] = useState([])

  const toggleSelect = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) return
    if (!window.confirm(`Delete ${selectedIds.length} selected notifications?`)) return
    deleteMultipleMutation.mutate(selectedIds)
    setSelectedIds([])
  }

  const handleClearAll = () => {
    if (!window.confirm('Delete ALL notifications? This cannot be undone.')) return
    const allIds = notifications.map((n) => n._id)
    deleteMultipleMutation.mutate(allIds)
    setSelectedIds([])
  }

  // SAFE DATA
  const notifications = Array.isArray(data?.notifications)
    ? data.notifications
    : Array.isArray(data)
    ? data
    : []

  return (
    <PageBackground>
      <motion.div
        variants={containerVariants}
        initial="initial"
        animate="animate"
        className="min-h-screen pb-28"
      >
        <div className="px-4 pt-5">

          {/* HEADER */}
          <div className="mb-7 flex items-center justify-between gap-4">

            <div>
              <h1 className="text-3xl md:text-4xl font-black text-black ">
                Notifications
              </h1>

              <p className="mt-2 text-gray-600 ">
                Booking updates, offers and announcements
              </p>
            </div>

            {notifications.length > 0 && (
              <div className="flex gap-2">
                <button
                  onClick={() => markAllMutation.mutate()}
                  className="rounded-2xl bg-black px-4 py-2 text-sm font-semibold text-white transition hover:scale-105 "
                >
                  Mark all
                </button>

                <button
                  onClick={() => handleClearAll()}
                  className="rounded-2xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                >
                  Clear all
                </button>

                <button
                  onClick={() => handleDeleteSelected()}
                  disabled={selectedIds.length === 0}
                  className="rounded-2xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition disabled:opacity-50"
                >
                  Delete selected
                </button>
              </div>
            )}

          </div>

          {/* LOADING */}
          {isLoading && (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  className="h-28 animate-pulse rounded-3xl bg-gray-200 "
                />
              ))}
            </div>
          )}

          {/* ERROR */}
          {isError && (
            <div className="rounded-3xl border border-red-200 bg-red-50 p-6 ">

              <h2 className="text-xl font-bold text-red-600 ">
                Failed to load notifications
              </h2>

              <p className="mt-2 text-red-500 ">
                Please refresh the page.
              </p>

            </div>
          )}

          {/* EMPTY */}
          {!isLoading && !isError && notifications.length === 0 && (
            <div className="rounded-3xl border border-dashed border-gray-300 bg-white/70 p-10 text-center shadow-sm ">

              <div className="text-6xl">
                🔔
              </div>

              <h2 className="mt-4 text-2xl font-bold text-black ">
                No notifications yet
              </h2>

              <p className="mt-2 text-gray-600 ">
                All updates will appear here.
              </p>

            </div>
          )}

          {/* NOTIFICATIONS */}
          {!isLoading && !isError && notifications.length > 0 && (
            <div className="space-y-4">

              {notifications.map((notification) => (
                <motion.div
                  key={notification._id}
                  variants={itemVariants}
                  whileHover={{ y: -2 }}
                  className={`rounded-3xl border p-5 shadow-sm transition-all duration-300 ${
                    notification.isRead
                      ? 'border-gray-200 bg-white '
                      : 'border-pink-200 bg-pink-50 '
                  }`}
                >

                  <div className="flex items-start justify-between gap-4">

                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(notification._id)}
                        onChange={() => toggleSelect(notification._id)}
                        className="mt-2 h-4 w-4 rounded border-gray-300"
                      />

                      <div className="flex-1">

                        <div className="mb-2 inline-flex rounded-full bg-black px-3 py-1 text-xs font-bold uppercase tracking-wide text-white ">

                          {notification.type || 'Notification'}

                        </div>

                        <h2 className="text-xl font-bold text-black ">
                          {notification.title || 'New Update'}
                        </h2>

                        <p className="mt-3 leading-relaxed text-gray-700 ">
                          {notification.message || 'No message available'}
                        </p>

                      </div>
                    </div>

                    <div className="flex flex-col gap-2 items-end">
                      {!notification.isRead && (
                        <button
                          onClick={() =>
                            markReadMutation.mutate(notification._id)
                          }
                          className="rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white transition hover:scale-105 "
                        >
                          Read
                        </button>
                      )}

                      <button
                        onClick={() => deleteMutation.mutate(notification._id)}
                        className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                      >
                        Delete
                      </button>
                    </div>

                  </div>

                </motion.div>
              ))}

            </div>
          )}

        </div>

        <BottomNav />
      </motion.div>
    </PageBackground>
  )
}