import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'

import { galleryAPI } from '../../api/endpoints'
import {
  containerVariants,
  itemVariants,
} from '../../animations/variants'

import PageBackground from '../../components/luxury/PageBackground'
import BottomNav from '../../components/BottomNav'

export default function Gallery() {
  const [selectedImage, setSelectedImage] = useState(null)
  const [imageError, setImageError] = useState({})

  const { data, isLoading, isError } = useQuery({
    queryKey: ['gallery'],
    staleTime: 1000 * 60 * 5,
    retry: 1,

    queryFn: async () => {
      try {
        const res = await galleryAPI.getGallery({
          page: 1,
          limit: 24,
        })

        const galleryFromBody =
          res?.data?.gallery ?? res?.data ?? []

        return {
          gallery: Array.isArray(galleryFromBody)
            ? galleryFromBody
            : [],
        }
      } catch (error) {
        console.error('Gallery API error:', error)

        return {
          gallery: [],
        }
      }
    },
  })

  const galleryItems = useMemo(() => {
    return data?.gallery || []
  }, [data])

  useEffect(() => {
    console.log('Gallery mounted')
  }, [])

  if (isError) {
    return (
      <PageBackground>
        <div className="min-h-screen flex items-center justify-center text-red-500">
          Failed to load gallery
        </div>

        <BottomNav />
      </PageBackground>
    )
  }

  return (
    <PageBackground>
      <motion.div
        variants={containerVariants}
        initial="initial"
        animate="animate"
        className="min-h-screen pb-32 bg-gradient-to-br from-gray-50 to-gray-100"
      >
        <section className="px-2 sm:px-4 mt-6 sm:mt-10">
          {isLoading ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-square rounded-2xl bg-gray-200 animate-pulse"
                />
              ))}
            </div>
          ) : galleryItems.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
              {galleryItems.map((item, idx) => {
                const imageSrc =
                  imageError[item?._id]
                    ? '/placeholder.jpg'
                    : item?.image || item?.imageUrl

                return (
                  <motion.div
                    key={item?._id || idx}
                    variants={itemVariants}
                    whileHover={{ y: -3 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedImage(item)}
                    className="group relative aspect-square overflow-hidden rounded-2xl cursor-pointer shadow-md hover:shadow-xl transition-all duration-300 bg-white"
                  >
                    <img
                      src={imageSrc}
                      alt={item?.title || 'Gallery'}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      onError={() => {
                        setImageError((prev) => ({
                          ...prev,
                          [item?._id]: true,
                        }))
                      }}
                    />

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3 sm:p-4">
                      <div className="w-full">
                        <div className="inline-flex items-center rounded-full bg-white/30 backdrop-blur-sm px-2 py-1 text-xs text-white mb-2">
                          {item?.category?.replace(/_/g, ' ') ||
                            'Beauty'}
                        </div>

                        <h3 className="text-sm sm:text-base font-bold text-white line-clamp-2">
                          {item?.title || 'Beauty Look'}
                        </h3>
                      </div>
                    </div>

                    {/* Mobile eye */}
                    <div className="absolute top-2 right-2 sm:hidden bg-black/60 backdrop-blur-sm rounded-full w-8 h-8 flex items-center justify-center text-white text-sm">
                      👁️
                    </div>
                  </motion.div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-24 px-4">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                📷 No Images Yet
              </h2>

              <p className="text-gray-500 mt-2 text-sm sm:text-base">
                Gallery coming soon!
              </p>
            </div>
          )}
        </section>
      </motion.div>

      {/* IMAGE MODAL */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex flex-col items-center justify-center p-3 sm:p-6"
            onClick={() => setSelectedImage(null)}
          >
            {/* Close */}
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 z-10 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full w-10 h-10 flex items-center justify-center text-white"
            >
              ✕
            </button>

            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="w-full h-full flex flex-col items-center justify-center max-w-4xl"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={
                  imageError[selectedImage?._id]
                    ? '/placeholder.jpg'
                    : selectedImage?.image ||
                      selectedImage?.imageUrl
                }
                alt={selectedImage?.title || 'Gallery'}
                className="max-w-full max-h-[75vh] object-contain rounded-xl shadow-2xl"
              />

              <div className="mt-4 text-center text-white px-4">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/20 backdrop-blur-md px-4 py-2 border border-white/30 mb-3 text-sm">
                  📁{' '}
                  {selectedImage?.category?.replace(/_/g, ' ') ||
                    'Salon'}
                </div>

                <h2 className="text-xl sm:text-3xl font-bold mb-2">
                  {selectedImage?.title ||
                    'Beauty Transformation'}
                </h2>

                {selectedImage?.description && (
                  <p className="text-sm sm:text-base text-white/80 max-w-2xl mx-auto">
                    {selectedImage.description}
                  </p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <BottomNav />
    </PageBackground>
  )
       }
