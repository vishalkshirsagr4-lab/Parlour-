import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

import { userAPI } from '../../api/endpoints'
import { containerVariants, itemVariants } from '../../animations/variants'

import BottomNav from '../../components/BottomNav'
import PageBackground from '../../components/luxury/PageBackground'

export default function Profile() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [imageFile, setImageFile] = useState(null)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  const [form, setForm] = useState({
    name: '',
    phone: '',
    bio: '',
    instagram: '',
  })

  // FIXED QUERY
  const {
    data: profile,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['profile'],

    queryFn: async () => {
      const res = await userAPI.getProfile()
      return res?.data || {}
    },
  })

  // AUTO FILL FORM
  useEffect(() => {
    if (profile) {
      setForm({
        name: profile?.name || '',
        phone: profile?.phone || '',
        bio: profile?.bio || '',
        instagram: profile?.socialLinks?.instagram || '',
      })
    }
  }, [profile])

  // FIXED MUTATION FOR REACT QUERY v5
  const updateMutation = useMutation({
    mutationFn: async (payload) => {
      return userAPI.updateProfile(payload)
    },

    onSuccess: async () => {
      toast.success('Profile updated successfully')

      await queryClient.invalidateQueries({
        queryKey: ['profile'],
      })
    },

    onError: (error) => {
      toast.error(
        error?.response?.data?.message ||
          'Failed to update profile'
      )
    },
  })

  const handleChange = (e) => {
    const { name, value } = e.target

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    const formData = new FormData()

    formData.append('name', form.name)
    formData.append('phone', form.phone)
    formData.append('bio', form.bio)

    formData.append(
      'socialLinks',
      JSON.stringify({
        instagram: form.instagram,
      })
    )

    if (imageFile) {
      formData.append('profileImage', imageFile)
    }

    updateMutation.mutate(formData)
  }

  // LOADING
  if (isLoading) {
    return (
      <PageBackground>
        <div className="min-h-screen px-4 pt-5 pb-28">

          <div className="animate-pulse">

            <div className="h-10 w-40 rounded-xl bg-gray-200 dark:bg-gray-800" />

            <div className="mt-8 rounded-3xl bg-gray-200 p-6 dark:bg-gray-800">

              <div className="mx-auto h-32 w-32 rounded-3xl bg-gray-300 dark:bg-gray-700" />

              <div className="mt-6 space-y-4">

                <div className="h-14 rounded-2xl bg-gray-300 dark:bg-gray-700" />
                <div className="h-14 rounded-2xl bg-gray-300 dark:bg-gray-700" />
                <div className="h-32 rounded-2xl bg-gray-300 dark:bg-gray-700" />

              </div>

            </div>

          </div>

          <BottomNav />
        </div>
      </PageBackground>
    )
  }

  // ERROR
  if (isError) {
    return (
      <PageBackground>
        <div className="min-h-screen px-4 pt-5 pb-28">

          <div className="rounded-3xl border border-red-200 bg-red-50 p-6 dark:border-red-900 dark:bg-red-950/30">

            <h2 className="text-2xl font-bold text-red-600 dark:text-red-400">
              Failed to load profile
            </h2>

            <p className="mt-2 text-red-500 dark:text-red-300">
              Please refresh the page.
            </p>

          </div>

          <BottomNav />
        </div>
      </PageBackground>
    )
  }

  return (
    <PageBackground>
      <motion.div
        variants={containerVariants}
        initial="initial"
        animate="animate"
        className="min-h-screen pb-28"
      >
        <div className="px-4 pt-5 space-y-6">

          {/* HEADER */}
          <div>

            <h1 className="text-3xl md:text-4xl font-black text-black dark:text-white">
              My Profile
            </h1>

            <p className="mt-2 text-gray-600 dark:text-gray-300">
              Manage your salon account and personal information
            </p>

          </div>

          {/* ADMIN PANEL */}
          {['admin', 'super_admin'].includes(profile?.role) && (
            <motion.div
              variants={itemVariants}
              className="rounded-3xl bg-black p-6 text-white shadow-xl"
            >

              <p className="text-sm uppercase tracking-[0.3em] text-pink-300">
                Admin Access
              </p>

              <h2 className="mt-2 text-3xl font-black">
                Salon Management
              </h2>

              <div className="mt-6 grid gap-4 md:grid-cols-2">

                <button
                  type="button"
                  onClick={() => navigate('/admin')}
                  className="rounded-3xl bg-white/10 p-5 text-left transition hover:bg-white/20"
                >

                  <h3 className="text-xl font-bold">
                    Dashboard
                  </h3>

                  <p className="mt-2 text-white/70">
                    Manage bookings, services, gallery and users
                  </p>

                </button>

                <button
                  type="button"
                  onClick={() => navigate('/admin/bookings')}
                  className="rounded-3xl bg-white/10 p-5 text-left transition hover:bg-white/20"
                >

                  <h3 className="text-xl font-bold">
                    Booking Control
                  </h3>

                  <p className="mt-2 text-white/70">
                    Review and manage appointment requests
                  </p>

                </button>

              </div>

            </motion.div>
          )}

          {/* PROFILE CARD */}
          <motion.div
            variants={itemVariants}
            className="rounded-3xl bg-white p-6 shadow-xl dark:bg-gray-900"
          >

            <div className="grid gap-8 lg:grid-cols-[180px_1fr]">

              {/* LEFT */}
              <div className="text-center">

                <div className="mx-auto h-40 w-40 overflow-hidden rounded-[2rem] bg-gray-200 shadow-lg dark:bg-gray-800">

                  <img
                    src={
                      profile?.profileImage ||
                      'https://via.placeholder.com/300x300?text=Profile'
                    }
                    alt={profile?.name || 'Profile'}
                    className="h-full w-full object-cover"
                  />

                </div>

                <h2 className="mt-5 text-2xl font-black text-black dark:text-white">
                  {profile?.name || 'User'}
                </h2>

                <p className="mt-1 text-gray-500 dark:text-gray-400">
                  {profile?.role || 'Customer'}
                </p>

              </div>

              {/* FORM */}
              <form
                onSubmit={handleSubmit}
                className="space-y-5"
              >

                {/* NAME */}
                <div>

                  <label className="mb-2 block text-sm font-bold text-black dark:text-white">
                    Full Name
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Enter your name"
                    className="w-full rounded-2xl border border-gray-200 bg-white px-5 py-4 text-black outline-none transition focus:border-black dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                  />

                </div>

                {/* EMAIL */}
                <div>

                  <label className="mb-2 block text-sm font-bold text-black dark:text-white">
                    Email Address
                  </label>

                  <input
                    type="email"
                    value={profile?.email || ''}
                    disabled
                    className="w-full rounded-2xl border border-gray-200 bg-gray-100 px-5 py-4 text-gray-500 outline-none dark:border-gray-700 dark:bg-gray-800"
                  />

                </div>

                {/* PHONE */}
                <div>

                  <label className="mb-2 block text-sm font-bold text-black dark:text-white">
                    Phone Number
                  </label>

                  <input
                    type="text"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="Enter phone number"
                    className="w-full rounded-2xl border border-gray-200 bg-white px-5 py-4 text-black outline-none transition focus:border-black dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                  />

                </div>

                {/* BIO */}
                <div>

                  <label className="mb-2 block text-sm font-bold text-black dark:text-white">
                    About You
                  </label>

                  <textarea
                    rows={5}
                    name="bio"
                    value={form.bio}
                    onChange={handleChange}
                    placeholder="Write something about yourself"
                    className="w-full rounded-2xl border border-gray-200 bg-white px-5 py-4 text-black outline-none transition focus:border-black dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                  />

                </div>

                {/* INSTAGRAM */}
                <div>

                  <label className="mb-2 block text-sm font-bold text-black dark:text-white">
                    Instagram
                  </label>

                  <input
                    type="text"
                    name="instagram"
                    value={form.instagram}
                    onChange={handleChange}
                    placeholder="@username"
                    className="w-full rounded-2xl border border-gray-200 bg-white px-5 py-4 text-black outline-none transition focus:border-black dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                  />

                </div>

                {/* IMAGE */}
                <div>

                  <label className="mb-2 block text-sm font-bold text-black dark:text-white">
                    Profile Photo
                  </label>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      setImageFile(
                        e.target.files?.[0] || null
                      )
                    }
                    className="w-full text-sm text-gray-500 file:mr-4 file:rounded-full file:border-0 file:bg-black file:px-5 file:py-3 file:text-white hover:file:opacity-90 dark:file:bg-white dark:file:text-black"
                  />

                </div>

                {/* UPDATE BUTTON */}
                <button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="w-full rounded-2xl bg-black px-5 py-4 text-lg font-bold text-white transition hover:scale-[1.01] disabled:opacity-50 dark:bg-white dark:text-black"
                >
                  {updateMutation.isPending
                    ? 'Updating...'
                    : 'Update Profile'}
                </button>

                {/* LOGOUT */}
                <button
                  type="button"
                  onClick={() => setShowLogoutConfirm(true)}
                  className="w-full rounded-2xl border border-red-300 bg-red-50 px-5 py-4 text-lg font-bold text-red-600 transition hover:bg-red-100 dark:border-red-800 dark:bg-red-950/20 dark:text-red-400"
                >
                  🚪 Logout
                </button>

                {showLogoutConfirm && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6">
                    <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-gray-950 dark:text-white">
                      <h3 className="text-xl font-bold text-black dark:text-white">
                        Confirm Logout
                      </h3>
                      <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">
                        Are you sure you want to logout? You will need to login again to continue.
                      </p>
                      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
                        <button
                          type="button"
                          onClick={() => setShowLogoutConfirm(false)}
                          className="rounded-2xl border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowLogoutConfirm(false)
                            navigate('/logout')
                          }}
                          className="rounded-2xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
                        >
                          Logout
                        </button>
                      </div>
                    </div>
                  </div>
                )}

              </form>

            </div>

          </motion.div>

        </div>

        <BottomNav />
      </motion.div>
    </PageBackground>
  )
}