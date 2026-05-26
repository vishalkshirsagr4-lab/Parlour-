import { motion } from 'framer-motion'

export default function NotificationCard({ notification, onMarkRead, onDelete, disabled }) {
  const type = notification?.type || 'Notification'
  const title = notification?.title || 'New Update'
  const message = notification?.message || 'No message available'
  const isRead = !!notification?.isRead

  const ts = notification?.createdAt || notification?.timestamp || notification?.date
  const formatted = ts
    ? new Date(ts).toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      })
    : ''

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className={`rounded-3xl border p-4 shadow-sm backdrop-blur transition ${
        isRead
          ? 'border-gray-200 bg-white/70'
          : 'border-pink-200 bg-pink-50'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-black/5 px-3 py-1 text-xs font-bold uppercase tracking-wide text-black ">
              {type}
            </span>
            {!isRead ? (
              <span className="inline-flex h-2 w-2 rounded-full bg-rose-500" aria-label="Unread" />
            ) : null}
          </div>

          <h3 className="mt-3 text-base font-black text-black">
            {title}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-gray-700">
            {message}
          </p>

          {formatted ? (
            <p className="mt-3 text-xs text-gray-500">{formatted}</p>
          ) : null}
        </div>

        <div className="flex flex-col gap-2 items-end">
          {!isRead ? (
            <button
              type="button"
              disabled={disabled}
              onClick={() => onMarkRead?.(notification?._id)}
              className="rounded-2xl bg-black px-3 py-2 text-xs font-semibold text-white transition hover:opacity-95 disabled:opacity-50"
            >
              Mark read
            </button>
          ) : null}

          <button
            type="button"
            disabled={disabled}
            onClick={() => onDelete?.(notification?._id)}
            className="rounded-2xl border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
          >
            Delete
          </button>
        </div>
      </div>
    </motion.div>
  )
}

