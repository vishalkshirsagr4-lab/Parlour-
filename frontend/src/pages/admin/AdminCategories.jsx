import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { serviceAPI } from '../../api/endpoints'
import { containerVariants, itemVariants } from '../../animations/variants'
import toast from 'react-hot-toast'

export default function AdminCategories() {
  const queryClient = useQueryClient()

  const [form, setForm] = useState({
    name: '',
    description: '',
    icon: '',
    displayOrder: '',
  })

  const [imageFile, setImageFile] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState(null)

  const {
    data,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['categories'],

    queryFn: async () => {
      const res = await serviceAPI.getCategories()

      return res.data
    },
  })

  const categories = Array.isArray(data)
    ? data
    : data?.categories || []

  const manageCategory = useMutation({
    mutationFn: async ({ id, payload, isUpdate }) => {
      if (isUpdate) {
        return serviceAPI.updateCategory(
          id,
          payload,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        )
      }

      return serviceAPI.createCategory(
        payload,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      )
    },

    onSuccess: () => {
      toast.success(
        selectedCategory
          ? 'Category updated'
          : 'Category created'
      )

      queryClient.invalidateQueries({
        queryKey: ['categories'],
      })

      setForm({
        name: '',
        description: '',
        icon: '',
        displayOrder: '',
      })

      setImageFile(null)
      setSelectedCategory(null)
    },

    onError: (error) => {
      toast.error(
        error?.response?.data?.message ||
        'Could not save category'
      )
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => serviceAPI.deleteCategory(id),

    onSuccess: () => {
      toast.success('Category deleted')

      queryClient.invalidateQueries({
        queryKey: ['categories'],
      })
    },

    onError: () => {
      toast.error('Could not delete category')
    },
  })

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!form.name.trim()) {
      toast.error('Category name is required')
      return
    }

    const payload = new FormData()

    payload.append('name', form.name)
    payload.append('description', form.description)
    payload.append('icon', form.icon)
    payload.append('displayOrder', form.displayOrder || 0)

    if (imageFile) {
      payload.append('image', imageFile)
    }

    manageCategory.mutate({
      id: selectedCategory?._id,
      payload,
      isUpdate: Boolean(selectedCategory),
    })
  }

  const handleEdit = (category) => {
    setSelectedCategory(category)

    setForm({
      name: category.name || '',
      description: category.description || '',
      icon: category.icon || '',
      displayOrder: category.displayOrder || '',
    })
  }

  const handleCancel = () => {
    setSelectedCategory(null)

    setForm({
      name: '',
      description: '',
      icon: '',
      displayOrder: '',
    })

    setImageFile(null)
  }

  if (isError) {
    return (
      <div className="min-h-screen pb-24 px-4 pt-4">
        <div className="rounded-3xl bg-red-100 p-6 text-red-600">
          Failed to load categories
        </div>
      </div>
    )
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
            {selectedCategory
              ? '✏️ Edit Category'
              : '➕ Add New Category'}
          </h2>

          <div className="grid gap-4 lg:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">
                Category Name *
              </label>

              <input
                type="text"
                required
                value={form.name}
                onChange={(e) =>
                  setForm({
                    ...form,
                    name: e.target.value,
                  })
                }
                placeholder="Bridal Makeup"
                className="w-full rounded-3xl border border-gray-200 bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose-pink text-[#333]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Icon
              </label>

              <input
                type="text"
                value={form.icon}
                onChange={(e) =>
                  setForm({
                    ...form,
                    icon: e.target.value,
                  })
                }
                placeholder="💇‍♀️"
                className="w-full rounded-3xl border border-gray-200 bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose-pink"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Display Order
              </label>

              <input
                type="number"
                value={form.displayOrder}
                onChange={(e) =>
                  setForm({
                    ...form,
                    displayOrder: e.target.value,
                  })
                }
                placeholder="0"
                className="w-full rounded-3xl border border-gray-200 bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose-pink text-[#333]"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Category Image
              </label>

              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setImageFile(
                    e.target.files?.[0] || null
                  )
                }
                className="w-full text-sm text-gray-500 file:mr-4 file:rounded-full file:border-0 file:bg-rose-pink file:px-4 file:py-2 file:text-white"
              />
            </div>

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
                placeholder="Describe this category..."
                className="w-full rounded-3xl border border-gray-200 bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose-pink text-[#333]"
              />
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              type="submit"
              disabled={manageCategory.isPending}
              className="btn-primary flex-1"
            >
              {manageCategory.isPending
                ? 'Saving...'
                : selectedCategory
                ? '✏️ Update Category'
                : '➕ Create Category'}
            </button>

            {selectedCategory && (
              <button
                type="button"
                onClick={handleCancel}
                className="rounded-3xl border border-gray-300 px-6 py-3 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
            )}
          </div>
        </motion.form>

        {/* LIST */}

        <div>
          <h2 className="mb-4 text-2xl font-bold">
            📋 All Categories ({categories.length})
          </h2>

          <div className="grid gap-4">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="h-28 animate-pulse rounded-3xl bg-gray-200 dark:bg-gray-800"
                />
              ))
            ) : categories.length > 0 ? (
              categories.map((category) => (
                <motion.div
                  key={category._id}
                  variants={itemVariants}
                  className="card-glass flex flex-col gap-4 rounded-3xl p-5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">
                      {category.icon || '✨'}
                    </span>

                    <div>
                      <h3 className="text-xl font-semibold">
                        {category.name}
                      </h3>

                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {category.description ||
                          'Premium category'}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => handleEdit(category)}
                      className="rounded-full border border-rose-pink px-4 py-2 text-rose-pink transition hover:bg-rose-pink/10"
                    >
                      ✏️ Edit
                    </button>

                    <button
                      onClick={() =>
                        deleteMutation.mutate(category._id)
                      }
                      disabled={deleteMutation.isPending}
                      className="rounded-full border border-red-300 px-4 py-2 text-red-600 transition hover:bg-red-50 dark:hover:bg-red-950"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="rounded-3xl border-2 border-dashed border-gray-300 p-8 text-center">
                <p className="text-gray-600 dark:text-gray-400">
                  No categories yet.
                </p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
  )
}