import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

import { notificationAPI } from '../../api/endpoints'
import {
  containerVariants,
  itemVariants,
} from '../../animations/variants'

import BottomNav from '../../components/BottomNav'
import PageBackground from '../../components/luxury/PageBackground'

export default function Notifications() {
  const queryClient = useQueryClient()

  const [selectedIds, setSelectedIds] = useState([])

  // =========================
  // FETCH
  // =========================
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

  // =========================
  // MUTATIONS
  // =========================
  const markReadMutation = useMutation({
    mutationFn: (id) =>
      notificationAPI.markAsRead(id),

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
    mutationFn: () =>
      notificationAPI.markAllAsRead(),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['notifications'],
      })

      toast.success('All notifications marked as read')
    },

    onError: () => {
      toast.error('Could not mark all as read')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id) =>
      notificationAPI.deleteNotification(id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['notifications'],
      })

      toast.success('Notification deleted')
    },

    onError: () => {
      toast.error('Could not delete notification')
    },
  })

  const deleteMultipleMutation = useMutation({
    mutationFn: async (ids) => {
      await Promise.all(
        ids.map((id) =>
          notificationAPI.deleteNotification(id)
        )
      )
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['notifications'],
      })

      toast.success('Selected notifications deleted')
    },

    onError: () => {
      toast.error('Could not delete selected')
    },
  })

  // =========================
  // SAFE DATA
  // =========================
  const notifications = Array.isArray(
    data?.notifications
  )
    ? data.notifications
    : Array.isArray(data)
    ? data
    : []

  // =========================
  // HELPERS
  // =========================
  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    )
  }

  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) return

    if (
      !window.confirm(
        `Delete ${selectedIds.length} selected notifications?`
      )
    )
      return

    deleteMultipleMutation.mutate(selectedIds)

    setSelectedIds([])
  }

  const handleClearAll = () => {
    if (
      !window.confirm(
        'Delete all notifications?'
      )
    )
      return

    const allIds = notifications.map(
      (n) => n._id
    )

    deleteMultipleMutation.mutate(allIds)

    setSelectedIds([])
  }

  return (
    <PageBackground>
      <motion.div
        variants={containerVariants}
        initial="initial"
        animate="animate"
        className="min-h-screen pb-32"
      >
        <div className="px-3 sm:px-5 pt-4">

          {/* HEADER */}
          <div className="mb-6">

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

              <div>
                <h1 className="text-3xl sm:text-4xl font-black text-black leading-tight">
                  Notifications
                </h1>

                <p className="mt-2 text-sm sm:text-base text-gray-600">
                  Booking updates, offers & announcements
                </p>
              </div>

              {notifications.length > 0 && (
                <div className="flex flex-wrap gap-2">

                  <button
                    onClick={() =>
                      markAllMutation.mutate()
                    }
                    className="rounded-2xl bg-black px-4 py-2 text-sm font-semibold text-white active:scale-95"
                  >
                    Mark all
                  </button>

                  <button
                    onClick={handleClearAll}
                    className="rounded-2xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 active:scale-95"
                  >
                    Clear all
                  </button>

                  <button
                    onClick={handleDeleteSelected}
                    disabled={
                      selectedIds.length === 0
                    }
                    className="rounded-2xl bg-red-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 active:scale-95"
                  >
                    Delete ({selectedIds.length})
                  </button>

                </div>
              )}

            </div>

          </div>

          {/* LOADING */}
          {isLoading && (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map(
                (_, index) => (
                  <div
                    key={index}
                    className="h-28 animate-pulse rounded-3xl bg-gray-200"
                  />
                )
              )}
            </div>
          )}

          {/* ERROR */}
          {isError && (
            <div className="rounded-3xl border border-red-200 bg-red-50 p-6">

              <h2 className="text-lg font-bold text-red-600">
                Failed to load notifications
              </h2>

              <p className="mt-2 text-sm text-red-500">
                Please refresh the page.
              </p>

            </div>
          )}

          {/* EMPTY */}
          {!isLoading &&
            !isError &&
            notifications.length === 0 && (
              <div className="rounded-[2rem] border border-dashed border-gray-300 bg-white p-10 text-center shadow-sm">

                <div className="text-6xl">
                  🔔
                </div>

                <h2 className="mt-4 text-2xl font-black text-black">
                  No notifications
                </h2>

                <p className="mt-2 text-gray-500">
                  Updates will appear here
                </p>

              </div>
            )}

          {/* NOTIFICATIONS */}
          {!isLoading &&
            !isError &&
            notifications.length > 0 && (
              <div className="space-y-4">

                <AnimatePresence>

                  {notifications.map(
                    (notification) => (
                      <motion.div
                        key={notification._id}
                        variants={itemVariants}
                        initial={{
                          opacity: 0,
                          y: 10,
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                        }}
                        exit={{
                          opacity: 0,
                          scale: 0.95,
                        }}
                        whileHover={{
                          y: -2,
                        }}
                        className={`relative overflow-hidden rounded-[2rem] border p-4 sm:p-5 shadow-sm transition-all duration-300 ${
                          notification.isRead
                            ? 'border-gray-200 bg-white'
                            : 'border-pink-200 bg-gradient-to-br from-pink-50 to-rose-50'
                        }`}
                      >

                        {/* unread glow */}
                        {!notification.isRead && (
                          <div className="absolute top-0 left-0 h-full w-1 bg-pink-500" />
                        )}

                        <div className="flex gap-3">

                          {/* CHECKBOX */}
                          <div className="pt-1">
                            <input
                              type="checkbox"
                              checked={selectedIds.includes(
                                notification._id
                              )}
                              onChange={() =>
                                toggleSelect(
                                  notification._id
                                )
                              }
                              className="h-4 w-4 rounded border-gray-300"
                            />
                          </div>

                          {/* CONTENT */}
                          <div className="flex-1 min-w-0">

                            {/* TYPE */}
                            <div className="mb-3 flex items-center justify-between gap-3 flex-wrap">

                              <div className="inline-flex rounded-full bg-black px-3 py-1 text-[10px] sm:text-xs font-bold uppercase tracking-wide text-white">
                                {notification.type ||
                                  'Notification'}
                              </div>

                              {!notification.isRead && (
                                <div className="rounded-full bg-pink-500 px-2 py-1 text-[10px] font-bold text-white">
                                  NEW
                                </div>
                              )}

                            </div>

                            {/* TITLE */}
                            <h2 className="text-lg sm:text-xl font-bold text-black break-words">
                              {notification.title ||
                                'New Update'}
                            </h2>

                            {/* MESSAGE */}
                            <p className="mt-2 text-sm sm:text-base leading-relaxed text-gray-700 break-words">
                              {notification.message ||
                                'No message available'}
                            </p>

                            {/* ACTIONS */}
                            <div className="mt-5 flex flex-wrap gap-2">

                              {!notification.isRead && (
                                <button
                                  onClick={() =>
                                    markReadMutation.mutate(
                                      notification._id
                                    )
                                  }
                                  className="rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white active:scale-95"
                                >
                                  Mark Read
                                </button>
                              )}

                              <button
                                onClick={() =>
                                  deleteMutation.mutate(
                                    notification._id
                                  )
                                }
                                className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 active:scale-95"
                              >
                                Delete
                              </button>

                            </div>

                          </div>

                        </div>

                      </motion.div>
                    )
                  )}

                </AnimatePresence>

              </div>
            )}

        </div>

        <BottomNav />
      </motion.div>
    </PageBackground>
  )
}