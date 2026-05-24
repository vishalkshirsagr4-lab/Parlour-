import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '../../store/authStore'
import { messageAPI } from '../../api/endpoints'
import { containerVariants, itemVariants } from '../../animations/variants'
import BottomNav from '../../components/BottomNav'
import toast from 'react-hot-toast'

export default function Chat() {
  const { userId } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user } = useAuthStore()

  const [messageText, setMessageText] = useState('')
  const messagesEndRef = useRef(null)

  // =========================
  // Fetch Messages
  // =========================
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['messages', userId],
    queryFn: async () => {
      const res = await messageAPI.getMessages(userId, {
        page: 1,
        limit: 50,
      })

      return res.data
    },
    enabled: Boolean(userId),
    refetchInterval: 5000,
  })

  // =========================
  // Send Message Mutation
  // =========================
  const sendMessageMutation = useMutation({
    mutationFn: (payload) => messageAPI.sendMessage(payload),

    onSuccess: () => {
      setMessageText('')

      queryClient.invalidateQueries({
        queryKey: ['messages', userId],
      })

      refetch()
    },

    onError: (error) => {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          'Unable to send message'
      )
    },
  })

  // =========================
  // Auto Scroll
  // =========================
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
    })
  }, [data])

  // =========================
  // Handle Send
  // =========================
  const handleSendMessage = (e) => {
    e.preventDefault()

    if (!messageText.trim()) {
      return toast.error('Please type a message')
    }

    sendMessageMutation.mutate({
      receiverId: userId,
      message: messageText.trim(),
    })
  }

  // =========================
  // Loading State
  // =========================
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="rounded-3xl border border-white/20 bg-white/90 dark:bg-gray-900 p-8 shadow-sm">
          <p className="text-center text-lg font-semibold text-rose-pink">
            Loading chat...
          </p>
        </div>
      </div>
    )
  }

  // =========================
  // Error State
  // =========================
  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="rounded-3xl border border-red-300 bg-red-50 dark:bg-red-950/10 p-8 text-center shadow-sm">
          <p className="text-lg font-semibold text-red-600">
            Failed to load messages
          </p>

          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {error?.message || 'Something went wrong'}
          </p>

          <button
            onClick={() => refetch()}
            className="mt-4 rounded-full border border-rose-pink px-5 py-2 text-rose-pink hover:bg-rose-pink/10 transition"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  const messages = Array.isArray(data?.messages)
    ? data.messages
    : Array.isArray(data)
    ? data
    : []

  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      className="min-h-screen bg-gradient-to-b from-rose-50 to-white dark:from-gray-950 dark:to-black pb-24"
    >
      <div className="px-4 pt-4">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-4 text-sm font-semibold text-rose-pink hover:opacity-80 transition"
        >
          ← Back
        </button>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Salon Chat</h1>

          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Message your salon concierge in real time.
          </p>
        </div>

        {/* Chat Card */}
        <motion.div
          variants={itemVariants}
          className="card-glass rounded-3xl p-4"
        >
          {/* Messages */}
          <div className="h-[60vh] overflow-y-auto rounded-3xl border border-gray-200 bg-white/90 dark:bg-gray-900 dark:border-gray-700 p-4">
            {messages.length > 0 ? (
              <div className="space-y-4">
                {messages.map((message) => {
                  const isOwnMessage =
                    message?.sender?._id === user?._id ||
                    message?.sender?._id === user?.id

                  return (
                    <div
                      key={message._id}
                      className={`flex ${
                        isOwnMessage
                          ? 'justify-end'
                          : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-[80%] rounded-3xl px-4 py-3 shadow-sm ${
                          isOwnMessage
                            ? 'bg-rose-pink text-white'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100'
                        }`}
                      >
                        <p className="text-sm leading-relaxed break-words">
                          {message.message}
                        </p>

                        <p
                          className={`mt-2 text-[11px] ${
                            isOwnMessage
                              ? 'text-white/80'
                              : 'text-gray-500 dark:text-gray-400'
                          }`}
                        >
                          {message.createdAt
                            ? new Date(
                                message.createdAt
                              ).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : ''}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-center">
                <div>
                  <p className="text-lg font-semibold text-gray-700 dark:text-gray-200">
                    No messages yet
                  </p>

                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Start the conversation with your salon.
                  </p>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={handleSendMessage}
            className="mt-4 flex items-center gap-3"
          >
            <input
              type="text"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-5 py-3 focus:outline-none focus:ring-2 focus:ring-rose-pink"
            />

            <button
              type="submit"
              disabled={sendMessageMutation.isPending}
              className="btn-primary rounded-full px-6 py-3 disabled:opacity-60"
            >
              {sendMessageMutation.isPending
                ? 'Sending...'
                : 'Send'}
            </button>
          </form>
        </motion.div>
      </div>

      <BottomNav />
    </motion.div>
  )
}