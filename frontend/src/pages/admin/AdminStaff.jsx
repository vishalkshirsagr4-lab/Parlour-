import { useEffect, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { staffAPI } from '../../api/endpoints'
import { containerVariants, itemVariants } from '../../animations/variants'
import toast from 'react-hot-toast'

const initialForm = {
  name: '',
  email: '',
  phone: '',
  specialization: '',
  experience: '',
  bio: '',
}

export default function AdminStaff() {
  const queryClient = useQueryClient()

  const [form, setForm] = useState(initialForm)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)

  const {
    data: staff = [],
    isLoading,
  } = useQuery({
    queryKey: ['admin-staff'],
    queryFn: async () => {
      const res = await staffAPI.getStaff()
      return res.data?.staff || res.data || []
    },
  })

  const createMutation = useMutation({
    mutationFn: async (payload) => {
      return await staffAPI.createStaff(payload, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
    },

    onSuccess: () => {
      toast.success('✨ Stylist added successfully!')

      queryClient.invalidateQueries({
        queryKey: ['admin-staff'],
      })

      resetForm()
    },

    onError: (error) => {
      toast.error(
        error?.response?.data?.message || 'Could not add stylist'
      )
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      return await staffAPI.deleteStaff(id)
    },

    onSuccess: () => {
      toast.success('🗑️ Stylist removed')

      queryClient.invalidateQueries({
        queryKey: ['admin-staff'],
      })
    },

    onError: () => {
      toast.error('Could not remove stylist')
    },
  })

  const resetForm = () => {
    setForm(initialForm)
    setImageFile(null)

    if (imagePreview) {
      URL.revokeObjectURL(imagePreview)
    }

    setImagePreview(null)
  }

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview)
      }
    }
  }, [imagePreview])

  const handleChange = (e) => {
    const { name, value } = e.target

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]

    if (!file) return

    if (imagePreview) {
      URL.revokeObjectURL(imagePreview)
    }

    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!form.name || !form.email || !form.phone) {
      toast.error('Please fill all required fields')
      return
    }

    const payload = new FormData()

    payload.append('name', form.name.trim())
    payload.append('email', form.email.trim())
    payload.append('phone', form.phone.trim())

    payload.append(
      'specialization',
      JSON.stringify(
        form.specialization
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean)
      )
    )

    payload.append(
      'experience',
      Number(form.experience || 0)
    )

    payload.append('bio', form.bio.trim())

    if (imageFile) {
      payload.append('image', imageFile)
    }

    createMutation.mutate(payload)
  }

  return (
      <motion.div
        variants={containerVariants}
        initial="initial"
        animate="animate"
        className="space-y-6"
      >
        {/* FORM */}
        <motion.form
          variants={itemVariants}
          onSubmit={handleSubmit}
          className="card-glass rounded-3xl p-6"
        >
          <h2 className="mb-6 text-2xl font-bold">
            👥 Add New Stylist
          </h2>

          <div className="grid gap-4 lg:grid-cols-2">
            {/* NAME */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Name *
              </label>

              <input
                type="text"
                name="name"
                required
                value={form.name}
                onChange={handleChange}
                placeholder="e.g., Priya Sharma"
                className="w-full rounded-3xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-rose-400 dark:border-gray-700 dark:bg-gray-900"
              />
            </div>

            {/* EMAIL */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Email *
              </label>

              <input
                type="email"
                name="email"
                required
                value={form.email}
                onChange={handleChange}
                placeholder="priya@salon.com"
                className="w-full rounded-3xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-rose-400 dark:border-gray-700 dark:bg-gray-900"
              />
            </div>

            {/* PHONE */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Phone *
              </label>

              <input
                type="tel"
                name="phone"
                required
                value={form.phone}
                onChange={handleChange}
                placeholder="+91 XXXXX XXXXX"
                className="w-full rounded-3xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-rose-400 dark:border-gray-700 dark:bg-gray-900"
              />
            </div>

            {/* EXPERIENCE */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Experience (Years)
              </label>

              <input
                type="number"
                name="experience"
                min="0"
                value={form.experience}
                onChange={handleChange}
                placeholder="5"
                className="w-full rounded-3xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-rose-400 dark:border-gray-700 dark:bg-gray-900"
              />
            </div>

            {/* SPECIALIZATION */}
            <div className="lg:col-span-2">
              <label className="mb-2 block text-sm font-medium">
                Specializations
              </label>

              <input
                type="text"
                name="specialization"
                value={form.specialization}
                onChange={handleChange}
                placeholder="Bridal Makeup, Hair Styling, Nail Art"
                className="w-full rounded-3xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-rose-400 dark:border-gray-700 dark:bg-gray-900"
              />
            </div>

            {/* BIO */}
            <div className="lg:col-span-2">
              <label className="mb-2 block text-sm font-medium">
                Bio
              </label>

              <textarea
                rows={4}
                name="bio"
                value={form.bio}
                onChange={handleChange}
                placeholder="Tell us about this stylist..."
                className="w-full rounded-3xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-rose-400 dark:border-gray-700 dark:bg-gray-900"
              />
            </div>

            {/* IMAGE */}
            <div className="lg:col-span-2">
              <label className="mb-2 block text-sm font-medium">
                Profile Photo
              </label>

              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full text-sm text-gray-500 file:mr-4 file:rounded-full file:border-0 file:bg-rose-500 file:px-4 file:py-2 file:text-white hover:file:bg-rose-600"
              />
            </div>

            {/* PREVIEW */}
            {imagePreview && (
              <div className="lg:col-span-2">
                <label className="mb-2 block text-sm font-medium">
                  Preview
                </label>

                <img
                  src={imagePreview}
                  alt="Preview"
                  className="h-32 w-32 rounded-full border-4 border-rose-200 object-cover"
                />
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={createMutation.isPending}
            className="btn-primary mt-6 w-full disabled:cursor-not-allowed disabled:opacity-60"
          >
            {createMutation.isPending
              ? 'Adding Stylist...'
              : '➕ Add Stylist'}
          </button>
        </motion.form>

        {/* STAFF LIST */}
        <div>
          <h2 className="mb-4 text-2xl font-bold">
            💇 All Stylists ({staff.length})
          </h2>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="h-64 animate-pulse rounded-3xl bg-gray-200 dark:bg-gray-800"
                />
              ))
            ) : staff.length > 0 ? (
              staff.map((member) => (
                <motion.div
                  key={member._id}
                  variants={itemVariants}
                  className="card-glass overflow-hidden rounded-3xl p-5 text-center"
                >
                  <div className="mb-4">
                    <img
                      src={
                        member.image ||
                        'https://via.placeholder.com/150'
                      }
                      alt={member.name}
                      className="mx-auto h-32 w-32 rounded-full border-4 border-rose-200 object-cover"
                    />
                  </div>

                  <h3 className="text-xl font-semibold">
                    {member.name}
                  </h3>

                  {member.experience ? (
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      ⭐ {member.experience} years experience
                    </p>
                  ) : null}

                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    📧 {member.email}
                  </p>

                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    📱 {member.phone}
                  </p>

                  {Array.isArray(member.specialization) &&
                    member.specialization.length > 0 && (
                      <div className="mt-3 flex flex-wrap justify-center gap-2">
                        {member.specialization
                          .slice(0, 3)
                          .map((spec, idx) => (
                            <span
                              key={idx}
                              className="rounded-full bg-rose-100 px-3 py-1 text-xs text-rose-600 dark:bg-rose-900/30"
                            >
                              {spec}
                            </span>
                          ))}

                        {member.specialization.length > 3 && (
                          <span className="text-xs text-gray-500">
                            +{member.specialization.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                  {member.bio && (
                    <p className="mt-3 line-clamp-2 text-xs text-gray-600 dark:text-gray-400">
                      {member.bio}
                    </p>
                  )}

                  <button
                    onClick={() =>
                      deleteMutation.mutate(member._id)
                    }
                    disabled={deleteMutation.isPending}
                    className="mt-4 w-full rounded-full border border-red-300 px-4 py-2 text-red-600 transition hover:bg-red-50 dark:hover:bg-red-950"
                  >
                    🗑️ Remove
                  </button>
                </motion.div>
              ))
            ) : (
              <div className="lg:col-span-3 rounded-3xl border-2 border-dashed border-gray-300 p-12 text-center">
                <p className="text-gray-600 dark:text-gray-400">
                  No stylists added yet. Add your first stylist above! 👑
                </p>
              </div>
            )}
          </div>
        </div>
      </motion.div>

  )
}