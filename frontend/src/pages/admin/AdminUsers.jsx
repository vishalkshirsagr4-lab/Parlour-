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
      <h2 className="text-xl font-bold">👥 Users</h2>

      {/* USERS */}
      <div className="space-y-4">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-2xl bg-gray-200"
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
                className={`rounded-2xl border bg-white p-4 shadow-sm ${
                  user.isBlocked ? 'opacity-70' : ''
                }`}
              >
                {/* TOP SECTION (mobile stacked) */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">

                  {/* Avatar */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setSelectedImage(userImage)}
                      className="relative h-14 w-14 overflow-hidden rounded-full border"
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

                    {/* NAME + STATUS */}
                    <div className="min-w-0">
                      <p className="truncate font-semibold">
                        {user.name || 'Unnamed User'}
                      </p>

                      <div className="flex flex-wrap gap-2 mt-1">
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            user.isBlocked
                              ? 'bg-red-100 text-red-600'
                              : 'bg-green-100 text-green-600'
                          }`}
                        >
                          {user.isBlocked ? 'Blocked' : 'Active'}
                        </span>

                        <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-600">
                          {user.role || 'user'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* INFO */}
                  <div className="text-xs text-gray-500 sm:ml-auto">
                    <p className="truncate">📧 {user.email}</p>
                    {user.phone && <p>📱 {user.phone}</p>}
                  </div>
                </div>

                {/* ACTION BUTTONS (mobile full width) */}
                <div className="mt-4">
                  {user.isBlocked ? (
                    <button
                      onClick={() =>
                        unblockMutation.mutate(user._id)
                      }
                      className="w-full rounded-xl border border-green-600 py-2 text-green-600 font-medium active:scale-95"
                    >
                      ✅ Unblock User
                    </button>
                  ) : (
                    <button
                      onClick={() =>
                        blockMutation.mutate(user._id)
                      }
                      className="w-full rounded-xl border border-red-500 py-2 text-red-500 font-medium active:scale-95"
                    >
                      🚫 Block User
                    </button>
                  )}
                </div>
              </motion.div>
            )
          })
        ) : (
          <div className="rounded-2xl border border-dashed p-8 text-center text-gray-500">
            No users found
          </div>
        )}
      </div>

      {/* IMAGE MODAL */}
      {selectedImage && (
        <div
          onClick={() => setSelectedImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-[90vw] rounded-2xl bg-white p-3"
          >
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute right-2 top-2 rounded-full bg-white px-3 py-1 text-xs shadow"
            >
              Close
            </button>

            <img
              src={selectedImage}
              className="max-h-[80vh] w-auto object-contain rounded-xl"
            />
          </div>
        </div>
      )}
    </motion.div>
  )
}