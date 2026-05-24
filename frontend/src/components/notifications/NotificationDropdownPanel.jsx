import { AnimatePresence, motion } from 'framer-motion'

import NotificationCard from './NotificationCard'
import EmptyNotificationsState from './EmptyNotificationsState'

export default function NotificationDropdownPanel({
  open,
  notifications,
  onClose,
  onMarkRead,
  onMarkAllAsRead,
  onDelete,
  isLoading,
  isError,
  unreadCount,
  disabled,
}) {
  const list = Array.isArray(notifications) ? notifications : []

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.98 }}
          transition={{ duration: 0.18 }}
          className="absolute right-0 top-full z-50 mt-3 w-[92vw] max-w-[420px]"
          role="dialog"
          aria-label="Notifications"
        >
          <div className="relative overflow-hidden rounded-[2rem] border border-white/20 bg-black/70 backdrop-blur-xl shadow-2xl">
            <div className="p-4 border-b border-white/10 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-[0.25em] text-rose-300">
                  Notifications
                </p>
                <p className="mt-1 text-sm font-semibold text-white/90">
                  {unreadCount > 0
                    ? `${unreadCount} unread`
                    : 'All caught up'}
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="rounded-2xl bg-white/10 px-3 py-2 text-xs font-semibold text-white/90 hover:bg-white/20"
              >
                Close
              </button>
            </div>

            <div className="p-4">
              {isLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-28 animate-pulse rounded-3xl bg-white/10"
                    />
                  ))}
                </div>
              ) : null}

              {isError && !isLoading ? (
                <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-4 text-center">
                  <p className="text-sm font-semibold text-red-100">
                    Failed to load notifications.
                  </p>
                </div>
              ) : null}

              {!isLoading && !isError && list.length === 0 ? (
                <div className="-mx-2">
                  <EmptyNotificationsState />
                </div>
              ) : null}

              {!isLoading && !isError && list.length > 0 ? (
                <div className="space-y-3">
                  <div className="flex gap-2 justify-end">
                    {unreadCount > 0 ? (
                      <button
                        type="button"
                        disabled={disabled}
                        onClick={onMarkAllAsRead}
                        className="rounded-2xl bg-white/10 px-3 py-2 text-xs font-semibold text-white/90 hover:bg-white/20 disabled:opacity-50"
                      >
                        Mark all read
                      </button>
                    ) : null}
                  </div>

                  {list.slice(0, 10).map((n) => (
                    <NotificationCard
                      key={n?._id}
                      notification={n}
                      disabled={disabled}
                      onMarkRead={onMarkRead}
                      onDelete={onDelete}
                    />
                  ))}

                  {list.length > 10 ? (
                    <p className="text-center text-xs text-white/60 pt-2">
                      Showing latest 10 notifications.
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}

