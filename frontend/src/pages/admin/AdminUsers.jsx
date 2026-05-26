import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'

import { userAPI } from '../../api/endpoints'
import {
  containerVariants,
  itemVariants,
} from '../../animations/variants'
import toast from 'react-hot-toast'

export default function AdminUsers() {
  const queryClient = useQueryClient()
  const [selectedImage, setSelectedImage] = useState(null)
  const [query, setQuery] = useState('')

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const res = await userAPI.getAllUsers({
        page: 1,
        limit: 50,
      })
      return res.data?.users || []
    },
  })

  const blockMutation = useMutation({
    mutationFn: (id) => userAPI.blockUser(id),
    onSuccess: () => {
      toast.success('🚫 User blocked')
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
    },
  })

  const unblockMutation = useMutation({
    mutationFn: (id) => userAPI.unblockUser(id),
    onSuccess: () => {
      toast.success('✅ User unblocked')
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
    },
  })

  const blockedCount = users.filter((u) => u.isBlocked).length
  const activeCount = users.filter((u) => !u.isBlocked).length

  const normalizedQuery = query.trim().toLowerCase()
  const filtered = normalizedQuery
    ? users.filter((u) => {
        const name = (u.name || '').toLowerCase()
        const email = (u.email || '').toLowerCase()
        return name.includes(normalizedQuery) || email.includes(normalizedQuery)
      })
    : users

  const activeUsers = filtered.filter((u) => !u.isBlocked)
  const blockedUsers = filtered.filter((u) => u.isBlocked)
  const [viewMode, setViewMode] = useState('active')

  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      className="space-y-5 px-3 sm:px-0"
    >
      {/* STATS (mobile friendly) */}
      <div className="grid grid-cols-2 gap-3">
        <motion.div
          variants={itemVariants}
          className="rounded-2xl bg-white p-4 shadow-sm border"
        >
          <p className="text-xs text-gray-500">Total</p>
          <p className="text-2xl font-bold text-rose-500">
            {users.length}
          </p>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="rounded-2xl bg-white p-4 shadow-sm border"
        >
          <p className="text-xs text-gray-500">Active / Blocked</p>
          <p className="text-lg font-bold">
            <span className="text-green-600">{activeCount}</span>
            <span className="mx-1 text-gray-400">/</span>
            <span className="text-red-600">{blockedCount}</span>
          </p>
        </motion.div>
      </div>

      {/* TITLE */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <h2 className="text-xl font-bold">👥 Users</h2>

        <div className="sm:ml-auto flex w-full max-w-md items-center gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full rounded-3xl border border-gray-200 bg-white px-4 py-2 text-sm outline-none"
          />

          <div className="text-sm text-gray-500">
            <span className="font-semibold">{activeUsers.length}</span>
            <span className="mx-1">/</span>
            <span className="text-red-600">{blockedUsers.length}</span>
          </div>
        </div>
      </div>

      {/* USERS */}
      <div className="space-y-6">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-2xl bg-gray-200"
            />
          ))
        ) : (
          <>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('active')}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  viewMode === 'active'
                    ? 'bg-rose-pink text-white shadow-md'
                    : 'border border-gray-200 hover:bg-gray-100'
                }`}
              >
                Active ({activeUsers.length})
              </button>

              <button
                onClick={() => setViewMode('blocked')}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  viewMode === 'blocked'
                    ? 'bg-rose-pink text-white shadow-md'
                    : 'border border-gray-200 hover:bg-gray-100'
                }`}
              >
                Blocked ({blockedUsers.length})
              </button>
            </div>

            {/* Render the selected list */}
            {viewMode === 'active' && (
              <div>
                <h3 className="mb-3 text-lg font-semibold">Active Users ({activeUsers.length})</h3>

                <div className="space-y-4">
                  {activeUsers.length === 0 ? (
                    <div className="rounded-2xl border border-dashed p-6 text-center text-gray-500">
                      No active users
                    </div>
                  ) : (
                    activeUsers.map((user) => {
                      const userImage =
                        user.profileImage ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          user.name || 'User'
                        )}&background=F3F4F6&color=7C3AED&size=128`

                      return (
                        <motion.div
                          key={user._id}
                          variants={itemVariants}
                          className={`rounded-2xl border bg-white p-4 shadow-sm`}
                        >
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                onClick={() => setSelectedImage(userImage)}
                                className="relative h-14 w-14 overflow-hidden rounded-full border transition hover:scale-105 hover:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-300"
                                aria-label="View user profile image"
                              >
                                <img
                                  src={userImage}
                                  alt={user.name}
                                  className="h-full w-full object-cover"
                                  onError={(e) =>
                                    (e.currentTarget.src =
                                      'https://ui-avatars.com/api/?name=User')
                                  }
                                />
                              </button>

                              <div className="min-w-0">
                                <p className="truncate font-semibold">
                                  {user.name || 'Unnamed User'}
                                </p>

                                <div className="flex flex-wrap gap-2 mt-1">
                                  <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-600">Active</span>
                                  <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-600">{user.role || 'user'}</span>
                                </div>
                              </div>
                            </div>

                            <div className="text-xs text-gray-500 sm:ml-auto">
                              <p className="truncate">📧 {user.email}</p>
                              {user.phone && <p>📱 {user.phone}</p>}
                            </div>
                          </div>

                          <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
                            <button
                              type="button"
                              onClick={() => setSelectedImage(userImage)}
                              className="rounded-xl border border-slate-300 bg-slate-50 py-2 text-slate-700 font-medium transition hover:bg-slate-100 active:scale-95"
                            >
                              👁️ View Profile
                            </button>

                            <button
                              type="button"
                              onClick={() => blockMutation.mutate(user._id)}
                              className="rounded-xl border border-red-500 bg-white py-2 text-red-500 font-medium transition hover:bg-red-50 active:scale-95"
                            >
                              🚫 Block
                            </button>
                          </div>
                        </motion.div>
                      )
                    })
                  )}
                </div>
              </div>
            )}

            {viewMode === 'blocked' && (
              <div>
                <h3 className="mb-3 text-lg font-semibold">Blocked Users ({blockedUsers.length})</h3>

                <div className="space-y-4">
                  {blockedUsers.length === 0 ? (
                    <div className="rounded-2xl border border-dashed p-6 text-center text-gray-500">
                      No blocked users
                    </div>
                  ) : (
                    blockedUsers.map((user) => {
                      const userImage =
                        user.profileImage ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          user.name || 'User'
                        )}&background=F3F4F6&color=7C3AED&size=128`

                      return (
                        <motion.div
                          key={user._id}
                          variants={itemVariants}
                          className={`rounded-2xl border bg-white p-4 shadow-sm opacity-70`}
                        >
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                onClick={() => setSelectedImage(userImage)}
                                className="relative h-14 w-14 overflow-hidden rounded-full border transition hover:scale-105 hover:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-300"
                                aria-label="View user profile image"
                              >
                                <img
                                  src={userImage}
                                  alt={user.name}
                                  className="h-full w-full object-cover"
                                  onError={(e) =>
                                    (e.currentTarget.src =
                                      'https://ui-avatars.com/api/?name=User')
                                  }
                                />
                              </button>

                              <div className="min-w-0">
                                <p className="truncate font-semibold">
                                  {user.name || 'Unnamed User'}
                                </p>

                                <div className="flex flex-wrap gap-2 mt-1">
                                  <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-600">Blocked</span>
                                  <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-600">{user.role || 'user'}</span>
                                </div>
                              </div>
                            </div>

                            <div className="text-xs text-gray-500 sm:ml-auto">
                              <p className="truncate">📧 {user.email}</p>
                              {user.phone && <p>📱 {user.phone}</p>}
                            </div>
                          </div>

                          <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
                            <button
                              type="button"
                              onClick={() => setSelectedImage(userImage)}
                              className="rounded-xl border border-slate-300 bg-slate-50 py-2 text-slate-700 font-medium transition hover:bg-slate-100 active:scale-95"
                            >
                              👁️ View Profile
                            </button>

                            <button
                              type="button"
                              onClick={() => unblockMutation.mutate(user._id)}
                              className="rounded-xl border border-green-600 bg-white py-2 text-green-600 font-medium transition hover:bg-emerald-50 active:scale-95"
                            >
                              ✅ Unblock
                            </button>
                          </div>
                        </motion.div>
                      )
                    })
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* IMAGE MODAL */}
      {selectedImage && (
        <div
          onClick={() => setSelectedImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative flex max-h-[calc(100vh-2rem)] w-full max-w-[calc(100vw-2rem)] items-center justify-center overflow-hidden rounded-3xl bg-white p-4 shadow-2xl"
          >
            <button
              type="button"
              onClick={() => setSelectedImage(null)}
              className="absolute right-3 top-3 rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow ring-1 ring-slate-200 transition hover:bg-slate-100"
            >
              Close
            </button>

            <img
              src={selectedImage}
              alt="User profile enlarged"
              className="max-h-[85vh] max-w-[90vw] w-full rounded-3xl object-contain shadow-lg"
            />
          </div>
        </div>
      )}
    </motion.div>
  )
}