import { useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'

import { notificationAPI } from '../../api/endpoints'
import { getSocket, socketEvents } from '../../utils/socketManager'

export function useNotifications({ limit = 20, pollingMs = 30000 } = {}) {
  const queryClient = useQueryClient()

  const q = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await notificationAPI.getNotifications({ page: 1, limit })
      return res?.data || {}
    },
    staleTime: 1000 * 10,
    refetchInterval: pollingMs,
    retry: 1,
  })

  useEffect(() => {
    // Socket optional. If socket isn't initialized, no hard fail.
    const socket = getSocket()
    if (!socket) return

    const onReceive = (notification) => {
      // Avoid duplicates by _id.
      queryClient.setQueryData(['notifications'], (old) => {
        const prev = old?.notifications || old?.data?.notifications || []
        const arr = Array.isArray(prev) ? prev : []
        const incoming = notification || null
        if (!incoming?._id) return old

        const exists = arr.some((n) => n?._id === incoming._id)
        const next = exists ? arr : [incoming, ...arr]
        return {
          ...(old || {}),
          notifications: next,
        }
      })

      // toast support for new notifications
      if (!notification?.isRead) {
        toast(() => (
          <span>
            <span className="font-bold">{notification?.title || 'New update'}</span>
            <span className="block text-xs opacity-70">{notification?.message || ''}</span>
          </span>
        ), { id: `notif-${notification?._id}`, duration: 3500 })
      }
    }

    socket.on(socketEvents.RECEIVE_NOTIFICATION, onReceive)

    return () => {
      socket.off(socketEvents.RECEIVE_NOTIFICATION, onReceive)
    }
  }, [queryClient, limit])

  return q
}

