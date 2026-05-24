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
              <h1 className="text-3xl md:text-4xl font-black text-black dark:text-white">
                Notifications
              </h1>

              <p className="mt-2 text-gray-600 dark:text-gray-300">
                Booking updates, offers and announcements
              </p>
            </div>

            {notifications.length > 0 && (
              <button
                onClick={() => markAllMutation.mutate()}
                className="rounded-2xl bg-black px-4 py-2 text-sm font-semibold text-white transition hover:scale-105 dark:bg-white dark:text-black"
              >
                Mark all
              </button>
            )}

          </div>

          {/* LOADING */}
          {isLoading && (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  className="h-28 animate-pulse rounded-3xl bg-gray-200 dark:bg-gray-800"
                />
              ))}
            </div>
          )}

          {/* ERROR */}
          {isError && (
            <div className="rounded-3xl border border-red-200 bg-red-50 p-6 dark:border-red-900 dark:bg-red-950/40">

              <h2 className="text-xl font-bold text-red-600 dark:text-red-400">
                Failed to load notifications
              </h2>

              <p className="mt-2 text-red-500 dark:text-red-300">
                Please refresh the page.
              </p>

            </div>
          )}

          {/* EMPTY */}
          {!isLoading && !isError && notifications.length === 0 && (
            <div className="rounded-3xl border border-dashed border-gray-300 bg-white/70 p-10 text-center shadow-sm dark:border-gray-700 dark:bg-gray-900/60">

              <div className="text-6xl">
                🔔
              </div>

              <h2 className="mt-4 text-2xl font-bold text-black dark:text-white">
                No notifications yet
              </h2>

              <p className="mt-2 text-gray-600 dark:text-gray-400">
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
                      ? 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900'
                      : 'border-pink-200 bg-pink-50 dark:border-pink-900 dark:bg-pink-950/30'
                  }`}
                >

                  <div className="flex items-start justify-between gap-4">

                    <div className="flex-1">

                      <div className="mb-2 inline-flex rounded-full bg-black px-3 py-1 text-xs font-bold uppercase tracking-wide text-white dark:bg-white dark:text-black">

                        {notification.type || 'Notification'}

                      </div>

                      <h2 className="text-xl font-bold text-black dark:text-white">
                        {notification.title || 'New Update'}
                      </h2>

                      <p className="mt-3 leading-relaxed text-gray-700 dark:text-gray-300">
                        {notification.message || 'No message available'}
                      </p>

                    </div>

                    {!notification.isRead && (
                      <button
                        onClick={() =>
                          markReadMutation.mutate(notification._id)
                        }
                        className="rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white transition hover:scale-105 dark:bg-white dark:text-black"
                      >
                        Read
                      </button>
                    )}

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