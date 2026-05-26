import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'

import { notificationAPI, userAPI } from '../../api/endpoints'
import { containerVariants, itemVariants } from '../../animations/variants'

export default function AdminNotifications() {
  const queryClient = useQueryClient()
  const [selectedUserId, setSelectedUserId] = useState('')
  const [userQuery, setUserQuery] = useState('')
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)
  const [activeUserIndex, setActiveUserIndex] = useState(0)
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [type, setType] = useState('booking')

  const [broadcastTitle, setBroadcastTitle] = useState('')
  const [broadcastMessage, setBroadcastMessage] = useState('')
  const [broadcastType, setBroadcastType] = useState('promo')

  const [lastAction, setLastAction] = useState('')
  const [lastResult, setLastResult] = useState(null)
  const [history, setHistory] = useState([])

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const res = await userAPI.getAllUsers({ page: 1, limit: 200 })
      return res?.data || {}
    },
    staleTime: 1000 * 60,
  })

  const users = useMemo(() => {
    const arr = Array.isArray(data?.users)
      ? data.users
      : Array.isArray(data)
      ? data
      : []
    return arr
  }, [data])

  const userDropdownRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(event.target)
      ) {
        setUserDropdownOpen(false)
      }
    }

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setUserDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  const filteredUsers = useMemo(() => {
    const query = userQuery.trim().toLowerCase()
    if (!query) return users.slice(0, 10)
    return users.filter((user) => {
      const text = `${user.name || ''} ${user.email || ''}`.toLowerCase()
      return text.includes(query)
    })
  }, [users, userQuery])

  useEffect(() => {
    setActiveUserIndex(0)
  }, [filteredUsers.length])

  const createNotification = useMutation({
    mutationFn: (payload) => notificationAPI.createNotification(payload),
    onSuccess: () => {
      toast.success('Notification sent to user')
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      const record = {
        id: Date.now(),
        mode: 'Single',
        target: users.find((u) => u._id === selectedUserId)?.name || selectedUserId,
        type,
        title: title.trim(),
        message: message.trim(),
        timestamp: new Date().toISOString(),
      }
      setHistory((prev) => [record, ...prev].slice(0, 5))
      setTitle('')
      setMessage('')
      setType('booking')
      setLastAction('single')
      setLastResult({
        targetUserId: selectedUserId,
        title: record.title,
        message: record.message,
        type: record.type,
      })
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || error?.message || 'Failed to send notification')
    },
  })

  const sendBroadcast = useMutation({
    mutationFn: (payload) => notificationAPI.sendBroadcast(payload),
    onSuccess: (data) => {
      toast.success('Broadcast notification sent')
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      const record = {
        id: Date.now(),
        mode: 'Broadcast',
        target: 'All users',
        type: broadcastType,
        title: broadcastTitle.trim(),
        message: broadcastMessage.trim(),
        count: data?.count ?? 0,
        timestamp: new Date().toISOString(),
      }
      setHistory((prev) => [record, ...prev].slice(0, 5))
      setBroadcastTitle('')
      setBroadcastMessage('')
      setBroadcastType('promo')
      setLastAction('broadcast')
      setLastResult({
        count: record.count,
        title: record.title,
        message: record.message,
        type: record.type,
      })
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || error?.message || 'Failed to send broadcast')
    },
  })

  const handleSendSingle = (ev) => {
    ev.preventDefault()
    if (!selectedUserId) {
      toast.error('Select a user to notify')
      return
    }
    if (!title.trim() || !message.trim()) {
      toast.error('Title and message are required')
      return
    }

    createNotification.mutate({
      userId: selectedUserId,
      title: title.trim(),
      message: message.trim(),
      type,
    })
  }

  const handleSendBroadcast = (ev) => {
    ev.preventDefault()
    if (!broadcastTitle.trim() || !broadcastMessage.trim()) {
      toast.error('Broadcast title and message are required')
      return
    }

    sendBroadcast.mutate({
      title: broadcastTitle.trim(),
      message: broadcastMessage.trim(),
      type: broadcastType,
    })
  }

  const clearHistory = () => {
    setHistory([])
    setLastAction('')
    setLastResult(null)
    toast('Notification history cleared', { duration: 2000 })
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      className="space-y-6"
    >
      <div className="rounded-3xl border border-white/20 bg-white/90 p-6 shadow-sm ">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-rose-500">Admin Notifications</p>
            <h1 className="mt-3 text-3xl font-black text-black ">Send updates to users</h1>
            <p className="mt-2 max-w-2xl text-sm text-gray-600 ">
              Send a targeted notification to a single user or broadcast an announcement to everyone.
            </p>
          </div>
          <div className="rounded-3xl bg-rose-500/10 px-4 py-3 text-sm text-rose-700 ">
            Tip: use broadcast for promotions, and single notifications for booking updates.
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <motion.section variants={itemVariants} className="rounded-3xl border border-white/20 bg-white/90 p-6 shadow-sm ">
          <h2 className="text-xl font-bold">Notification Summary</h2>
          <p className="mt-2 text-sm text-gray-600 ">
            Quick overview of what was sent last and how many users are currently visible.
          </p>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-gray-200 bg-gray-50 p-4 ">
              <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Users loaded</p>
              <p className="mt-3 text-3xl font-black text-black ">{users.length}</p>
            </div>

            <div className="rounded-3xl border border-gray-200 bg-gray-50 p-4 ">
              <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Last action</p>
              <p className="mt-3 text-2xl font-bold text-black ">
                {lastAction === 'broadcast' ? 'Broadcast' : lastAction === 'single' ? 'Single' : 'None'}
              </p>
            </div>
          </div>

          {lastResult ? (
            <div className="mt-5 rounded-3xl border border-gray-200 bg-white p-4 ">
              {lastAction === 'broadcast' ? (
                <>
                  <p className="text-sm text-gray-500 ">Broadcasted to</p>
                  <p className="mt-2 text-xl font-bold text-black ">{lastResult.count} users</p>
                </>
              ) : (
                <>
                  <p className="text-sm text-gray-500 ">Target user</p>
                  <p className="mt-2 text-xl font-bold text-black ">
                    {users.find((user) => user._id === lastResult.targetUserId)?.name || lastResult.targetUserId}
                  </p>
                </>
              )}
              <div className="mt-4 space-y-2 text-sm text-gray-600 ">
                <p><span className="font-semibold">Title:</span> {lastResult.title}</p>
                <p><span className="font-semibold">Type:</span> {lastResult.type}</p>
                <p><span className="font-semibold">Message:</span> {lastResult.message}</p>
              </div>
            </div>
          ) : null}

          <div className="mt-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-gray-500">Recent history</p>
              <p className="mt-2 text-xs text-gray-500 ">Last 5 notifications sent</p>
            </div>
            <button
              type="button"
              onClick={clearHistory}
              className="rounded-2xl border border-gray-300 bg-gray-100 px-4 py-2 text-xs font-semibold text-black transition hover:bg-gray-200 "
            >
              Clear history
            </button>
          </div>

          {history.length > 0 ? (
            <div className="mt-4 space-y-3">
              {history.map((item) => (
                <div key={item.id} className="rounded-3xl border border-gray-200 bg-gray-50 p-4 ">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-black ">{item.mode}</p>
                    <p className="text-xs text-gray-500 ">{new Date(item.timestamp).toLocaleTimeString()}</p>
                  </div>
                  <p className="mt-2 text-sm text-gray-600 ">{item.target}</p>
                  <p className="mt-1 text-sm text-gray-600 "><span className="font-semibold">Title:</span> {item.title}</p>
                  <p className="mt-1 text-sm text-gray-600 "><span className="font-semibold">Message:</span> {item.message}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-4 rounded-3xl border border-dashed border-gray-200 bg-gray-50 p-4 text-sm text-gray-500 ">
              No notification history yet. Send one to start tracking.
            </div>
          )}
        </motion.section>
        <motion.section variants={itemVariants} className="rounded-3xl border border-white/20 bg-white/90 p-6 shadow-sm ">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold">Single Notification</h2>
              <p className="mt-2 text-sm text-gray-600 ">
                Choose a user and send a one-off notification.
              </p>
            </div>
            <span className="rounded-2xl bg-gray-100 px-3 py-1 text-xs uppercase tracking-[0.2em] text-gray-500 ">
              Targeted
            </span>
          </div>

          <form className="space-y-4" onSubmit={handleSendSingle}>
            <div ref={userDropdownRef} className="relative">
              <label className="block text-sm font-medium text-black ">User</label>
              <input
                value={userQuery}
                onChange={(e) => {
                  setUserQuery(e.target.value)
                  setUserDropdownOpen(true)
                }}
                onFocus={() => setUserDropdownOpen(true)}
                onKeyDown={(e) => {
                  if (!userDropdownOpen) return
                  if (e.key === 'ArrowDown') {
                    e.preventDefault()
                    setActiveUserIndex((prev) => Math.min(prev + 1, filteredUsers.length - 1))
                  }
                  if (e.key === 'ArrowUp') {
                    e.preventDefault()
                    setActiveUserIndex((prev) => Math.max(prev - 1, 0))
                  }
                  if (e.key === 'Enter' && filteredUsers[activeUserIndex]) {
                    e.preventDefault()
                    const selected = filteredUsers[activeUserIndex]
                    setSelectedUserId(selected._id)
                    setUserQuery(selected.name || selected.email || '')
                    setUserDropdownOpen(false)
                  }
                  if (e.key === 'Escape') {
                    setUserDropdownOpen(false)
                  }
                }}
                placeholder="Search user by name or email"
                disabled={isLoading}
                className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-500/40 "
              />
              {userDropdownOpen && (
                <div className="absolute inset-x-0 top-full z-20 mt-2 max-h-72 overflow-y-auto rounded-3xl border border-gray-200 bg-white shadow-xl ">
                  {filteredUsers.length === 0 ? (
                    <div className="p-4 text-sm text-gray-500">No users match your search.</div>
                  ) : (
                    filteredUsers.map((user, index) => (
                      <button
                        type="button"
                        key={user._id}
                        onMouseDown={(event) => {
                          event.preventDefault()
                          setSelectedUserId(user._id)
                          setUserQuery(user.name || user.email || '')
                          setUserDropdownOpen(false)
                        }}
                        className={`w-full px-4 py-3 text-left text-sm transition ${activeUserIndex === index ? 'bg-rose-pink/10 text-black ' : 'text-black hover:bg-gray-100 '}`}
                      >
                        <div className="font-semibold">{user.name || user.email || `User ${user._id}`}</div>
                        <div className="text-xs text-gray-500 ">{user.email}</div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-black ">Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-500/40 "
              >
                <option value="booking">Booking</option>
                <option value="promo">Promo</option>
                <option value="system">System</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-black ">Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Example: Booking confirmed"
                className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-500/40 "
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-black ">Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                placeholder="Write the notification message"
                className="mt-2 w-full rounded-3xl border border-gray-200 bg-white px-4 py-3 text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-500/40 "
              />
            </div>

            <button
              type="submit"
              disabled={createNotification.isPending}
              className="inline-flex items-center justify-center rounded-3xl bg-black px-6 py-3 text-sm font-semibold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {createNotification.isPending ? 'Sending...' : 'Send Notification'}
            </button>
          </form>
        </motion.section>

        <motion.section variants={itemVariants} className="rounded-3xl border border-white/20 bg-white/90 p-6 shadow-sm ">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold">Broadcast Notification</h2>
              <p className="mt-2 text-sm text-gray-600 ">
                Send the same notification to every user in the system.
              </p>
            </div>
            <span className="rounded-2xl bg-gray-100 px-3 py-1 text-xs uppercase tracking-[0.2em] text-gray-500 ">
              Broadcast
            </span>
          </div>

          <form className="space-y-4" onSubmit={handleSendBroadcast}>
            <div>
              <label className="block text-sm font-medium text-black ">Type</label>
              <select
                value={broadcastType}
                onChange={(e) => setBroadcastType(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-500/40 "
              >
                <option value="promo">Promo</option>
                <option value="system">System</option>
                <option value="booking">Booking</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-black ">Title</label>
              <input
                value={broadcastTitle}
                onChange={(e) => setBroadcastTitle(e.target.value)}
                placeholder="Example: Weekend offer"
                className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-500/40 "
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-black ">Message</label>
              <textarea
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
                rows={5}
                placeholder="Write the broadcast message"
                className="mt-2 w-full rounded-3xl border border-gray-200 bg-white px-4 py-3 text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-500/40 "
              />
            </div>

            <button
              type="submit"
              disabled={sendBroadcast.isPending}
              className="inline-flex items-center justify-center rounded-3xl bg-black px-6 py-3 text-sm font-semibold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {sendBroadcast.isPending ? 'Broadcasting...' : 'Send Broadcast'}
            </button>
          </form>
        </motion.section>
      </div>

      <motion.section variants={itemVariants} className="rounded-3xl border border-white/20 bg-white/90 p-6 shadow-sm ">
        <h2 className="text-2xl font-bold">Connected Users</h2>
        <p className="mt-2 text-sm text-gray-600 ">
          {isLoading
            ? 'Loading users...'
            : `Showing ${users.length} users. Use the dropdown above to target a specific user.`}
        </p>

        {!isLoading && users.length > 0 ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {users.slice(0, 12).map((user) => (
              <div
                key={user._id}
                className="rounded-3xl border border-gray-200 bg-gray-50 p-4 "
              >
                <p className="font-semibold text-black ">{user.name || user.email}</p>
                <p className="mt-1 text-sm text-gray-600 ">{user.email}</p>
              </div>
            ))}
          </div>
        ) : null}
      </motion.section>
    </motion.div>
  )
}
