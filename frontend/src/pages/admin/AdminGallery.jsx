import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { galleryAPI } from '../../api/endpoints'
import { containerVariants, itemVariants } from '../../animations/variants'
import toast from 'react-hot-toast'

const categories = [
  { value: 'salon_interior', label: '🏨 Salon Interior' },
  { value: 'bridal_makeup', label: '👰 Bridal Makeup' },
  { value: 'hair_styling', label: '💇 Hair Styling' },
  { value: 'nail_art', label: '💅 Nail Art' },
  { value: 'facial', label: '💆 Facial' },
  { value: 'transformation', label: '✨ Transformation' },
]

export default function AdminGallery() {
  const queryClient = useQueryClient()

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: categories[0].value,
  })

  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  // =========================
  // GET GALLERY
  // =========================
  const {
    data,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['admin-gallery'],
    queryFn: async () => {
      const res = await galleryAPI.getGallery({
        page: 1,
        limit: 20,
      })

      return res?.data
    },
  })

  // =========================
  // FIXED GALLERY ARRAY
  // =========================
  const galleryItems = Array.isArray(data)
    ? data
    : data?.gallery || []

  // =========================
  // UPLOAD IMAGE
  // =========================
  const uploadMutation = useMutation({
    mutationFn: async (payload) => {
      return await galleryAPI.uploadImage(payload, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
    },

    onSuccess: () => {
      toast.success('Gallery image uploaded successfully')

      queryClient.invalidateQueries({
        queryKey: ['admin-gallery'],
      })

      queryClient.invalidateQueries({
        queryKey: ['gallery'],
      })

      setForm({
        title: '',
        description: '',
        category: categories[0].value,
      })

      setImageFile(null)
      setImagePreview(null)
    },

    onError: (error) => {
      toast.error(
        error?.response?.data?.message ||
          'Failed to upload image'
      )
    },
  })

  // =========================
  // DELETE IMAGE
  // =========================
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      return await galleryAPI.deleteImage(id)
    },

    onSuccess: () => {
      toast.success('Image deleted')
      setDeleteTarget(null)

      queryClient.invalidateQueries({
        queryKey: ['admin-gallery'],
      })

      queryClient.invalidateQueries({
        queryKey: ['gallery'],
      })
    },

    onError: () => {
      toast.error('Failed to delete image')
    },
  })

  // =========================
  // IMAGE CHANGE
  // =========================
  const handleImageChange = (e) => {
    const file = e.target.files?.[0]

    if (!file) return

    setImageFile(file)

    const previewUrl = URL.createObjectURL(file)
    setImagePreview(previewUrl)
  }

  // =========================
  // SUBMIT
  // =========================
  const handleSubmit = (e) => {
    e.preventDefault()

    if (!form.title.trim()) {
      toast.error('Title is required')
      return
    }

    if (!imageFile) {
      toast.error('Please select image')
      return
    }

    const payload = new FormData()

    payload.append('title', form.title)
    payload.append('description', form.description)
    payload.append('category', form.category)

    // IMPORTANT
    // Backend field name must match multer upload field
    payload.append('image', imageFile)

    uploadMutation.mutate(payload)
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      className="space-y-6"
    >
        {/* ========================= */}
        {/* UPLOAD FORM */}
        {/* ========================= */}

        <motion.form
          variants={itemVariants}
          onSubmit={handleSubmit}
          className="card-glass rounded-3xl p-6"
        >
          <h2 className="mb-6 text-2xl font-bold">
            🖼️ Upload Gallery Image
          </h2>

          <div className="grid gap-4 lg:grid-cols-2">
            {/* TITLE */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Title *
              </label>

              <input
                type="text"
                required
                value={form.title}
                onChange={(e) =>
                  setForm({
                    ...form,
                    title: e.target.value,
                  })
                }
                placeholder="Bridal Makeup Look"
                className="w-full rounded-3xl border border-gray-200 bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose-pink text-[#333]"
              />
            </div>

            {/* CATEGORY */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Category
              </label>

              <select
                value={form.category}
                onChange={(e) =>
                  setForm({
                    ...form,
                    category: e.target.value,
                  })
                }
                className="w-full rounded-3xl border border-gray-200 bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose-pink text-[#333]"
              >
                {categories.map((item) => (
                  <option
                    key={item.value}
                    value={item.value}
                  >
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

            {/* DESCRIPTION */}
            <div className="lg:col-span-2">
              <label className="mb-2 block text-sm font-medium">
                Description
              </label>

              <textarea
                rows={3}
                value={form.description}
                onChange={(e) =>
                  setForm({
                    ...form,
                    description: e.target.value,
                  })
                }
                placeholder="Describe this gallery image..."
                className="w-full rounded-3xl border border-gray-200 bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose-pink text-[#333]"
              />
            </div>

            {/* FILE */}
            <div className="lg:col-span-2">
              <label className="mb-2 block text-sm font-medium">
                Upload Image *
              </label>

              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full text-sm text-gray-500 file:mr-4 file:rounded-full file:border-0 file:bg-rose-pink file:px-4 file:py-2 file:text-white"
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
                  className="h-60 w-full rounded-3xl object-cover"
                />
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={uploadMutation.isPending}
            className="btn-primary mt-6 w-full"
          >
            {uploadMutation.isPending
              ? 'Uploading...'
              : '🖼️ Upload Image'}
          </button>
        </motion.form>

        {/* ========================= */}
        {/* GALLERY GRID */}
        {/* ========================= */}

        <div>
          <h2 className="mb-4 text-2xl font-bold">
            📷 All Gallery Items ({galleryItems.length})
          </h2>

          {isError && (
            <div className="rounded-3xl bg-red-100 p-4 text-red-600">
              Failed to load gallery
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* LOADING */}
            {isLoading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="h-72 animate-pulse rounded-3xl bg-gray-200 dark:bg-gray-800"
                />
              ))
            ) : galleryItems.length > 0 ? (
              galleryItems.map((item) => (
                <motion.div
                  key={item._id}
                  variants={itemVariants}
                  className="overflow-hidden rounded-3xl bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl dark:bg-gray-900"
                >
                  {/* IMAGE */}
                  <div className="h-60 overflow-hidden bg-gray-100">
                    <img
                      src={
                        item.image ||
                        item.imageUrl ||
                        '/placeholder.jpg'
                      }
                      alt={item.title || 'Gallery'}
                      className="h-full w-full object-cover transition duration-300 hover:scale-105"
                    />
                  </div>

                  {/* CONTENT */}
                  <div className="p-4">
                    <p className="text-sm text-gray-500">
                      {categories.find(
                        (c) => c.value === item.category
                      )?.label || item.category}
                    </p>

                    <h3 className="mt-2 text-lg font-semibold">
                      {item.title || 'Gallery Item'}
                    </h3>

                    {item.description && (
                      <p className="mt-2 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
                        {item.description}
                      </p>
                    )}

                    <button
                      onClick={() => setDeleteTarget({
                        id: item._id,
                        title: item.title || 'gallery image',
                      })}
                      className="mt-4 w-full rounded-full border border-red-300 px-4 py-2 text-red-600 transition hover:bg-red-50 dark:hover:bg-red-950"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full rounded-3xl border-2 border-dashed border-gray-300 p-12 text-center">
                <p className="text-gray-600 dark:text-gray-400">
                  No gallery items found
                </p>
              </div>
            )}
          </div>
        </div>

        {deleteTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6">
            <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-gray-950 dark:text-white">
              <h3 className="text-xl font-bold text-black dark:text-white">
                Delete Gallery Image
              </h3>
              <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">
                Are you sure you want to delete "{deleteTarget.title}"? This action cannot be undone.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setDeleteTarget(null)}
                  className="rounded-2xl border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    deleteMutation.mutate(deleteTarget.id)
                  }}
                  disabled={deleteMutation.isPending}
                  className="rounded-2xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
                >
                  {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </motion.div>

  )
}