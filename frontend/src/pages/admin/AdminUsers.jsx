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
              users.map((user) => (
                <motion.div
                  key={user._id}
                  variants={itemVariants}
                  className={`card-glass flex flex-col gap-4 rounded-3xl p-5 transition sm:flex-row sm:items-center sm:justify-between ${
                    user.isBlocked
                      ? 'opacity-70'
                      : ''
                  }`}
                >
                  {/* USER INFO */}
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-semibold">
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

                    <p className="mt-2 text-sm text-gray-600 ">
                      📧 {user.email}
                    </p>

                    {user.phone && (
                      <p className="mt-1 text-sm text-gray-600 ">
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

                  {/* ACTION BUTTON */}
                  <div className="flex flex-wrap gap-3">
                    {user.isBlocked ? (
                      <button
                        onClick={() =>
                          unblockMutation.mutate(
                            user._id
                          )
                        }
                        disabled={
                          unblockMutation.isPending
                        }
                        className="rounded-full border border-green-600 px-5 py-2 font-medium text-green-600 transition hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-60 "
                      >
                        ✅ Unblock
                      </button>
                    ) : (
                      <button
                        onClick={() =>
                          blockMutation.mutate(
                            user._id
                          )
                        }
                        disabled={
                          blockMutation.isPending
                        }
                        className="rounded-full border border-rose-500 px-5 py-2 font-medium text-rose-500 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60 "
                      >
                        🚫 Block
                      </button>
                    )}
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="rounded-3xl border-2 border-dashed border-gray-300 p-10 text-center">
                <p className="text-gray-600 ">
                  No users found.
                </p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
  )
}