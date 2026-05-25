import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { serviceAPI } from '../../api/endpoints'
import { containerVariants, itemVariants } from '../../animations/variants'
import toast from 'react-hot-toast'

export default function AdminServices() {
  const queryClient = useQueryClient()

  const initialForm = {
    title: '',
    description: '',
    category: '',
    price: '',
    discount: '',
    duration: '',
    ingredients: '',
    benefits: '',
  }

  const [form, setForm] = useState(initialForm)
  const [images, setImages] = useState([])
  const [imagePreview, setImagePreview] = useState([])
  const [editingServiceId, setEditingServiceId] = useState(null)
  const [editingService, setEditingService] = useState(null)
  const [confirmDeleteService, setConfirmDeleteService] = useState(null)

  // =========================
  // Categories Query
  // =========================
  const {
    data: categories = [],
    isLoading: categoriesLoading,
  } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await serviceAPI.getCategories()
      return Array.isArray(res.data)
        ? res.data
        : res.data?.categories || []
    },
  })

  // =========================
  // Services Query
  // =========================
  const {
    data: services = [],
    isLoading: servicesLoading,
    isError: servicesError,
  } = useQuery({
    queryKey: ['admin-services'],
    queryFn: async () => {
      const res = await serviceAPI.getServices({})

      if (Array.isArray(res.data)) {
        return res.data
      }

      return res.data?.services || []
    },
  })

  // =========================
  // Create Service
  // =========================
  const createServiceMutation = useMutation({
    mutationFn: async (payload) => {
      return await serviceAPI.createService(payload)
    },

    onSuccess: () => {
      toast.success('✨ Service added successfully!')

      queryClient.invalidateQueries({
        queryKey: ['admin-services'],
      })

      setForm(initialForm)
      setImages([])
      setImagePreview([])
    },

    onError: (error) => {
      toast.error(
        error?.response?.data?.message ||
          'Could not save service'
      )
    },
  })

  const updateServiceMutation = useMutation({
    mutationFn: async ({ id, payload }) => {
      return await serviceAPI.updateService(id, payload)
    },

    onSuccess: () => {
      toast.success('✨ Service updated successfully!')

      queryClient.invalidateQueries({
        queryKey: ['admin-services'],
      })

      setForm(initialForm)
      setImages([])
      setImagePreview([])
      setEditingServiceId(null)
      setEditingService(null)
    },

    onError: (error) => {
      toast.error(
        error?.response?.data?.message ||
          'Could not update service'
      )
    },
  })

  // =========================
  // Delete Service
  // =========================
  const deleteServiceMutation = useMutation({
    mutationFn: async (id) => {
      return await serviceAPI.deleteService(id)
    },

    onSuccess: () => {
      toast.success('🗑️ Service deleted')
      setConfirmDeleteService(null)

      queryClient.invalidateQueries({
        queryKey: ['admin-services'],
      })
    },

    onError: (error) => {
      toast.error(
        error?.response?.data?.message ||
          'Could not delete service'
      )
    },
  })

  const isSubmitting =
    createServiceMutation.isPending ||
    updateServiceMutation.isPending

  // =========================
  // Handle Image Change
  // =========================
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || [])

    setImages(files)

    const previews = files.map((file) =>
      URL.createObjectURL(file)
    )

    setImagePreview(previews)
  }

  const handleEditService = (service) => {
    setEditingServiceId(service._id)
    setEditingService(service)
    setForm({
      title: service.title || '',
      description: service.description || '',
      category: service.category?._id || service.category || '',
      price: service.price?.toString() || '',
      discount: service.discount?.toString() || '0',
      duration: service.duration?.toString() || '30',
      ingredients: Array.isArray(service.ingredients)
        ? service.ingredients.join(', ')
        : '',
      benefits: Array.isArray(service.benefits)
        ? service.benefits.join(', ')
        : '',
    })
    setImages([])
    setImagePreview([])
  }

  const handleCancelEdit = () => {
    setEditingServiceId(null)
    setEditingService(null)
    setForm(initialForm)
    setImages([])
    setImagePreview([])
  }

  // =========================
  // Handle Submit
  // =========================
  const handleSubmit = (e) => {
    e.preventDefault()
    const isEditing = Boolean(editingServiceId)

    // Comprehensive validation
    if (!form.title || form.title.trim() === '') {
      toast.error('❌ Service title is required')
      return
    }

    if (!form.category) {
      toast.error('❌ Please select a category')
      return
    }

    if (!form.price || parseFloat(form.price) <= 0) {
      toast.error('❌ Price must be greater than 0')
      return
    }

    if (!isEditing && images.length === 0) {
      toast.error('❌ At least one image is required for new services')
      return
    }

    if (form.discount && (parseFloat(form.discount) < 0 || parseFloat(form.discount) > 100)) {
      toast.error('❌ Discount must be between 0 and 100')
      return
    }

    const payload = new FormData()

    payload.append('title', form.title.trim())
    payload.append('description', form.description.trim())
    payload.append('category', form.category)
    payload.append('price', parseFloat(form.price))
    payload.append('discount', parseFloat(form.discount) || 0)
    payload.append('duration', parseInt(form.duration) || 30)

    // Parse and validate ingredients/benefits
    const ingredientsList = form.ingredients
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
    
    const benefitsList = form.benefits
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)

    payload.append('ingredients', JSON.stringify(ingredientsList))
    payload.append('benefits', JSON.stringify(benefitsList))

    // Append new images
    if (images.length > 0) {
      images.forEach((file) => {
        payload.append('images', file)
      })
    }

    if (editingServiceId) {
      updateServiceMutation.mutate({
        id: editingServiceId,
        payload,
      })
    } else {
      createServiceMutation.mutate(payload)
    }
  }

  return (
      <motion.div
        variants={containerVariants}
        initial="initial"
        animate="animate"
        className="space-y-6"
      >
        {/* ========================= */}
        {/* Add Service Form */}
        {/* ========================= */}
        <motion.form
          variants={itemVariants}
          onSubmit={handleSubmit}
          className="card-glass rounded-3xl p-6"
        >
          <h2 className="mb-6 text-2xl font-bold">
            {editingServiceId ? '✏️ Edit Service' : '➕ Add New Service'}
          </h2>

          <div className="grid gap-4 lg:grid-cols-2">
            {/* Title */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Service Title *
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
                placeholder="e.g., Bridal Makeup"
                className="w-full rounded-3xl border border-gray-200 bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose-pink dark:border-gray-700 dark:bg-gray-900"
              />
            </div>

            {/* Category */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Category *
              </label>

              <select
                required
                value={form.category}
                onChange={(e) =>
                  setForm({
                    ...form,
                    category: e.target.value,
                  })
                }
                className="w-full rounded-3xl border border-gray-200 bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose-pink dark:border-gray-700 dark:bg-gray-900"
              >
                <option value="">
                  {categoriesLoading
                    ? 'Loading categories...'
                    : 'Select category'}
                </option>

                {categories.map((category) => (
                  <option
                    key={category._id}
                    value={category._id}
                  >
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Price */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Price (₹) *
              </label>

              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={form.price}
                onChange={(e) =>
                  setForm({
                    ...form,
                    price: e.target.value,
                  })
                }
                placeholder="0.00"
                className="w-full rounded-3xl border border-gray-200 bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose-pink dark:border-gray-700 dark:bg-gray-900"
              />
            </div>

            {/* Discount */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Discount %
              </label>

              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={form.discount}
                onChange={(e) =>
                  setForm({
                    ...form,
                    discount: e.target.value,
                  })
                }
                placeholder="0"
                className="w-full rounded-3xl border border-gray-200 bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose-pink dark:border-gray-700 dark:bg-gray-900"
              />
            </div>

            {/* Duration */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Duration (minutes)
              </label>

              <input
                type="number"
                min="1"
                value={form.duration}
                onChange={(e) =>
                  setForm({
                    ...form,
                    duration: e.target.value,
                  })
                }
                placeholder="30"
                className="w-full rounded-3xl border border-gray-200 bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose-pink dark:border-gray-700 dark:bg-gray-900"
              />
            </div>

            {/* Upload Images */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Upload Images {!editingServiceId && '*'}
              </label>

              <input
                type="file"
                accept="image/*"
                multiple
                required={!editingServiceId}
                onChange={handleImageChange}
                className="w-full text-sm text-gray-500 file:mr-4 file:rounded-full file:border-0 file:bg-rose-pink file:px-4 file:py-2 file:text-white"
              />

              {editingServiceId && (
                <p className="mt-2 text-xs text-blue-600 dark:text-blue-400">
                  ℹ️ Uploading new images is optional. Existing images will be preserved if you don't upload new ones.
                </p>
              )}

              {images.length > 0 && (
                <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                  {images.length} image(s) selected
                </p>
              )}
            </div>

            {/* Image Preview */}
            {imagePreview.length > 0 && (
              <div className="lg:col-span-2">
                <label className="mb-2 block text-sm font-medium">
                  New Images Preview
                </label>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {imagePreview.map((preview, idx) => (
                    <div
                      key={idx}
                      className="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700"
                    >
                      <img
                        src={preview}
                        alt={`Preview ${idx + 1}`}
                        className="h-24 w-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Current Images (when editing) */}
            {editingService?.images && editingService.images.length > 0 && (
              <div className="lg:col-span-2">
                <label className="mb-2 block text-sm font-medium">
                  Current Service Images
                </label>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {editingService.images.map((imageUrl, idx) => (
                    <div
                      key={idx}
                      className="overflow-hidden rounded-2xl border border-gray-300 dark:border-gray-600"
                    >
                      <img
                        src={imageUrl}
                        alt={`Service image ${idx + 1}`}
                        className="h-24 w-full object-cover"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/100x100?text=Image'
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            <div className="lg:col-span-2">
              <label className="mb-2 block text-sm font-medium">
                Description
              </label>

              <textarea
                rows={4}
                value={form.description}
                onChange={(e) =>
                  setForm({
                    ...form,
                    description: e.target.value,
                  })
                }
                placeholder="Describe the service..."
                className="w-full rounded-3xl border border-gray-200 bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose-pink dark:border-gray-700 dark:bg-gray-900"
              />
            </div>

            {/* Ingredients */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Ingredients
              </label>

              <input
                type="text"
                value={form.ingredients}
                onChange={(e) =>
                  setForm({
                    ...form,
                    ingredients: e.target.value,
                  })
                }
                placeholder="Aloe Vera, Serum, SPF"
                className="w-full rounded-3xl border border-gray-200 bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose-pink dark:border-gray-700 dark:bg-gray-900"
              />
            </div>

            {/* Benefits */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Benefits
              </label>

              <input
                type="text"
                value={form.benefits}
                onChange={(e) =>
                  setForm({
                    ...form,
                    benefits: e.target.value,
                  })
                }
                placeholder="Glowing skin, Hydration"
                className="w-full rounded-3xl border border-gray-200 bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose-pink dark:border-gray-700 dark:bg-gray-900"
              />
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="submit"
              disabled={
                createServiceMutation.isPending ||
                updateServiceMutation.isPending
              }
              className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-50"
            >
              {createServiceMutation.isPending ||
              updateServiceMutation.isPending
                ? editingServiceId
                  ? 'Updating...'
                  : 'Uploading...'
                : editingServiceId
                ? '✨ Update Service'
                : '✨ Add Service'}
            </button>

            {editingServiceId ? (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="btn-secondary w-full sm:w-auto"
              >
                Cancel Edit
              </button>
            ) : null}
          </div>
        </motion.form>

        {/* ========================= */}
        {/* Services List */}
        {/* ========================= */}
        <div>
          <h2 className="mb-4 text-2xl font-bold">
            📋 All Services ({services.length})
          </h2>

          <div className="grid gap-4">
            {servicesLoading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="h-36 animate-pulse rounded-3xl bg-gray-200 dark:bg-gray-800"
                />
              ))
            ) : servicesError ? (
              <div className="rounded-3xl border border-red-300 bg-red-50 p-6 text-red-600 dark:border-red-800 dark:bg-red-950/20 dark:text-red-400">
                Could not load services
              </div>
            ) : services.length > 0 ? (
              services.map((service) => (
                <motion.div
                  key={service._id}
                  variants={itemVariants}
                  className="card-glass overflow-hidden rounded-3xl p-5"
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    {/* Left */}
                    <div className="flex flex-1 gap-4">
                      {/* Image */}
                      <div className="h-28 w-28 overflow-hidden rounded-2xl bg-gray-100 dark:bg-gray-800">
                        <img
                          src={
                            service.images?.[0] ||
                            'https://via.placeholder.com/300x300?text=Service'
                          }
                          alt={service.title}
                          className="h-full w-full object-cover"
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold">
                          {service.title}
                        </h3>

                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                          📁{' '}
                          {service.category?.name ||
                            'Uncategorized'}
                        </p>

                        {service.description && (
                          <p className="mt-2 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">
                            {service.description}
                          </p>
                        )}

                        {/* Ingredients */}
                        {service.ingredients?.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {service.ingredients
                              .slice(0, 3)
                              .map((ing, idx) => (
                                <span
                                  key={idx}
                                  className="rounded-full bg-rose-pink/10 px-3 py-1 text-xs text-rose-pink"
                                >
                                  {ing}
                                </span>
                              ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right */}
                    <div className="flex flex-wrap items-center gap-5">
                      <div className="text-center">
                        <p className="text-xs uppercase text-gray-500">
                          Price
                        </p>

                        <p className="text-lg font-bold text-rose-pink">
                          ₹
                          {service.finalPrice ||
                            service.price}
                        </p>
                      </div>

                      <div className="text-center">
                        <p className="text-xs uppercase text-gray-500">
                          Duration
                        </p>

                        <p className="text-lg font-bold">
                          {service.duration || 30} min
                        </p>
                      </div>

                      <button
                        onClick={() => handleEditService(service)}
                        className="rounded-full border border-gray-300 px-4 py-2 text-gray-700 transition hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800/60"
                      >
                        ✏️ Edit
                      </button>

                      <button
                        onClick={() =>
                          setConfirmDeleteService({
                            id: service._id,
                            title: service.title || 'service',
                          })
                        }
                        className="rounded-full border border-red-300 px-4 py-2 text-red-600 transition hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/30"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="rounded-3xl border-2 border-dashed border-gray-300 p-8 text-center dark:border-gray-700">
                <p className="text-gray-600 dark:text-gray-400">
                  No services yet. Create your first service
                  above! ✨
                </p>
              </div>
            )}
          </div>
        </div>

        {confirmDeleteService && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6">
            <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-gray-950 dark:text-white">
              <h3 className="text-xl font-bold text-black dark:text-white">
                Delete Service
              </h3>
              <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">
                Are you sure you want to delete "{confirmDeleteService.title}"? This cannot be undone.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setConfirmDeleteService(null)}
                  className="rounded-2xl border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    deleteServiceMutation.mutate(confirmDeleteService.id)
                  }}
                  disabled={deleteServiceMutation.isPending}
                  className="rounded-2xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
                >
                  {deleteServiceMutation.isPending ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </motion.div>
  )
}