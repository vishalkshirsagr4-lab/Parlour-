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

  // =========================
  // FETCH USERS
  // =========================
  const {
    data: users = [],
    isLoading,
  } = useQuery({
    queryKey: ['admin-users'],

    queryFn: async () => {
      const res = await userAPI.getAllUsers({
        page: 1,
        limit: 50,
      })

      return res.data?.users || []
    },
  })

  // =========================
  // BLOCK USER
  // =========================
  const blockMutation = useMutation({
    mutationFn: async (id) => {
      return await userAPI.blockUser(id)
    },

    onSuccess: () => {
      toast.success('🚫 User blocked')

      queryClient.invalidateQueries({
        queryKey: ['admin-users'],
      })
    },

    onError: () => {
      toast.error('Could not block user')
    },
  })

  // =========================
  // UNBLOCK USER
  // =========================
  const unblockMutation = useMutation({
    mutationFn: async (id) => {
      return await userAPI.unblockUser(id)
    },

    onSuccess: () => {
      toast.success('✅ User unblocked')

      queryClient.invalidateQueries({
        queryKey: ['admin-users'],
      })
    },

    onError: () => {
      toast.error('Could not unblock user')
    },
  })

  // =========================
  // STATS
  // =========================
  const blockedCount = users.filter(
    (user) => user.isBlocked
  ).length

  const activeCount = users.filter(
    (user) => !user.isBlocked
  ).length

  return (
      <motion.div
        variants={containerVariants}
        initial="initial"
        animate="animate"
        className="space-y-6"
      >
        {/* ========================= */}
        {/* STATS */}
        {/* ========================= */}
        <div className="grid gap-4 sm:grid-cols-2">
          <motion.div
            variants={itemVariants}
            className="rounded-3xl border border-white/20 bg-white/90 p-6 shadow-sm "
          >
            <p className="text-sm uppercase tracking-[0.3em] text-gray-500">
              Total Users
            </p>

            <p className="mt-4 text-4xl font-bold text-rose-500">
              {users.length}
            </p>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="rounded-3xl border border-white/20 bg-white/90 p-6 shadow-sm "
          >
            <p className="text-sm uppercase tracking-[0.3em] text-gray-500">
              Active / Blocked
            </p>

            <div className="mt-4 flex items-center text-2xl font-bold">
              <span className="text-green-600">
                {activeCount}
              </span>

              <span className="mx-3 text-gray-400">
                /
              </span>

              <span className="text-red-600">
                {blockedCount}
              </span>
            </div>
          </motion.div>
        </div>

        {/* ========================= */}
        {/* USERS LIST */}
        {/* ========================= */}
        <div>
          <h2 className="mb-4 text-2xl font-bold">
            👥 All Users
          </h2>

          <div className="space-y-4">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  className="h-28 animate-pulse rounded-3xl bg-gray-200 "
                />
              ))
            ) : users.length > 0 ? (
              users.map((user) => {
                const userImage =
                  user.profileImage ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    user.name || 'User'
                  )}&background=F3F4F6&color=7C3AED&size=128`

                return (
                  <motion.div
                    key={user._id}
                    variants={itemVariants}
                    className={`card-glass flex flex-col gap-4 rounded-3xl p-5 transition sm:flex-row sm:items-center sm:justify-between ${
                      user.isBlocked ? 'opacity-70' : ''
                    }`}
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
                      <button
                        type="button"
                        onClick={() => setSelectedImage(userImage)}
                        className="group shrink-0 overflow-hidden rounded-3xl border border-gray-200 bg-white p-1 shadow-sm transition hover:shadow-lg sm:w-28 sm:h-28"
                      >
                        <img
                          src={userImage}
                          alt={user.name || 'User profile'}
                          onError={(e) => {
                            e.currentTarget.src =
                              'https://ui-avatars.com/api/?name=User&background=F3F4F6&color=7C3AED&size=128'
                          }}
                          className="h-24 w-24 rounded-3xl object-cover sm:h-28 sm:w-28"
                        />
                        <span className="pointer-events-none absolute inset-x-0 bottom-0 hidden rounded-b-3xl bg-black/40 px-2 py-1 text-xs text-white group-hover:block">
                          View
                        </span>
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-semibold truncate">
                            {user.name || 'Unnamed User'}
                          </h3>

                          <span
                            className={`rounded-full px-3 py-1 text-xs font-medium ${
                              user.isBlocked
                                ? 'bg-red-100 text-red-700 '
                                : 'bg-green-100 text-green-700 '
                            }`}
                          >
                            {user.isBlocked
                              ? '🚫 Blocked'
                              : '✅ Active'}
                          </span>

                          <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 ">
                            {user.role || 'user'}
                          </span>
                        </div>

                        <p className="mt-2 truncate text-sm text-gray-600">
                          📧 {user.email}
                        </p>

                        {user.phone && (
                          <p className="mt-1 truncate text-sm text-gray-600">
                            📱 {user.phone}
                          </p>
                        )}

                        {user.createdAt && (
                          <p className="mt-1 text-xs text-gray-500">
                            Joined:{' '}
                            {new Date(
                              user.createdAt
                            ).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3 sm:justify-end">
                      {user.isBlocked ? (
                        <button
                          onClick={() =>
                            unblockMutation.mutate(user._id)
                          }
                          disabled={unblockMutation.isPending}
                          className="rounded-full border border-green-600 px-5 py-2 font-medium text-green-600 transition hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-60 "
                        >
                          ✅ Unblock
                        </button>
                      ) : (
                        <button
                          onClick={() =>
                            blockMutation.mutate(user._id)
                          }
                          disabled={blockMutation.isPending}
                          className="rounded-full border border-rose-500 px-5 py-2 font-medium text-rose-500 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60 "
                        >
                          🚫 Block
                        </button>
                      )}
                    </div>
                  </motion.div>
                )
              })
            ) : (
              <div className="rounded-3xl border-2 border-dashed border-gray-300 p-10 text-center">
                <p className="text-gray-600 ">
                  No users found.
                </p>
              </div>
            )}
          </div>
        </div>

        {selectedImage && (
          <div
            onClick={() => setSelectedImage(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative max-h-full max-w-full overflow-hidden rounded-3xl border border-white/20 bg-white/10"
            >
              <button
                type="button"
                onClick={() => setSelectedImage(null)}
                className="absolute right-3 top-3 z-10 rounded-full bg-white/90 px-3 py-1 text-sm font-semibold text-gray-700 shadow-sm"
              >
                Close
              </button>
              <img
                src={selectedImage}
                alt="User profile"
                className="max-h-[90vh] w-auto max-w-[90vw] object-contain"
              />
            </div>
          </div>
        )}
      </motion.div>
  )
}