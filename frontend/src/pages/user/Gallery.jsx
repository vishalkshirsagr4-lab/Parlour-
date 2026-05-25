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
    queryFn: async () => {
      try {
        const res = await galleryAPI.getGallery({ page: 1, limit: 24 })

        // Support both API shapes: { gallery: [...] } and direct array []
        const galleryFromBody =
          res?.data?.gallery ?? res?.data ?? []

        return { gallery: Array.isArray(galleryFromBody) ? galleryFromBody : [] }
      } catch (error) {
        console.error('Gallery API error:', error)
        return { gallery: [] }
      }
    },
  })

  const galleryItems = useMemo(() => data?.gallery || [], [data])

  useEffect(() => {
    if (!data?.gallery) return
    console.log('Gallery fetched:', data.gallery.length, 'items')
    console.log(
      'Sample images:',
      data.gallery.slice(0, 5).map((it) => it.image || it.imageUrl)
    )
  }, [data])

  // Get column count based on screen
  const getColumnCount = () => {
    if (typeof window === 'undefined') return 2
    const width = window.innerWidth
    if (width < 640) return 2 // mobile
    if (width < 1024) return 2 // tablet
    return 3 // desktop
  }

  // Distribute items into columns for Pinterest masonry
  const distributeIntoColumns = (items, columns) => {
    const cols = Array.from({ length: columns }, () => [])
    items.forEach((item, idx) => {
      cols[idx % columns].push(item)
    })
    return cols
  }

  const columns = getColumnCount()
  const columnItems = distributeIntoColumns(galleryItems, columns)

  if (isError) {
    return (
      <PageBackground>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black text-red-400 font-semibold">
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
        {/* Header */}
        {/* <section className="px-3 sm:px-4 pt-4 sm:pt-5 sticky top-0 z-30 bg-gradient-to-b from-gray-50 to-gray-50/80 dark:from-gray-900 dark:to-gray-900/80 backdrop-blur-sm">
          <div className="relative overflow-hidden rounded-2xl sm:rounded-[2rem] bg-gradient-to-br from-black via-gray-900 to-gray-800 p-5 sm:p-8 shadow-2xl">
            <div className="absolute top-0 right-0 w-48 sm:w-72 h-48 sm:h-72 bg-pink-500/20 blur-3xl rounded-full" />
            <div className="absolute bottom-0 left-0 w-48 sm:w-72 h-48 sm:h-72 bg-purple-500/20 blur-3xl rounded-full" />

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md px-3 py-1.5 sm:px-4 sm:py-2 border border-white/10">
                <div className="w-2 h-2 rounded-full bg-pink-400" />
                <span className="text-white text-xs uppercase tracking-[0.2em]">
                  Salon Gallery
                </span>
              </div>

              <h1 className="mt-4 sm:mt-5 text-2xl sm:text-5xl font-black text-white leading-tight">
                ✨ Gallery
              </h1>

              <p className="mt-3 sm:mt-4 text-white/70 text-xs sm:text-base max-w-2xl line-clamp-2">
                Explore premium bridal looks, makeup transformations & salon artistry
              </p>
            </div>
          </div>
        </section> */}

        {/* Gallery Grid - Pinterest Masonry */}
        <section className="px-2 sm:px-4 mt-6 sm:mt-10">
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-2xl bg-gray-200 animate-pulse h-64 sm:h-80"
                />
              ))}
            </div>
          ) : galleryItems.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4 auto-rows-max">
              {galleryItems.map((item, idx) => (
                <motion.div
                  key={item?._id || idx}
                  variants={itemVariants}
                  whileHover={{ y: -3 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedImage(item)}
                  className="group relative overflow-hidden rounded-2xl cursor-pointer shadow-md hover:shadow-xl transition-all duration-300 bg-white"
                >
                  <div className="relative overflow-hidden bg-gray-200 ">
                    <img
                      src={imageError[item?._id] ? '/placeholder.jpg' : (item?.image || item?.imageUrl)}
                      alt={item?.title || 'Gallery'}
                      loading="lazy"
                      className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-110"
                      onError={() => {
                        setImageError(prev => ({ ...prev, [item?._id]: true }))
                      }}
                    />

                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-start p-3 sm:p-4">
                      <div className="w-full">
                        <div className="inline-flex items-center rounded-full bg-white/30 backdrop-blur-sm px-2 py-1 text-xs text-white mb-2">
                          {item?.category?.replace(/_/g, ' ') || 'Beauty'}
                        </div>
                        <h3 className="text-sm sm:text-base font-bold text-white line-clamp-2">
                          {item?.title || 'Beauty Look'}
                        </h3>
                      </div>
                    </div>

                    {/* Tap indicator for mobile */}
                    <div className="absolute top-2 right-2 sm:hidden bg-black/60 backdrop-blur-sm rounded-full w-8 h-8 flex items-center justify-center text-white text-sm">
                      👁️
                    </div>
                  </div>
                </motion.div>
              ))}
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

      {/* Full Screen Image Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex flex-col items-center justify-center p-3 sm:p-6"
            onClick={() => setSelectedImage(null)}
          >
            {/* Close button */}
            <motion.button
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 sm:top-6 sm:right-6 z-10 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-white transition-all duration-200 active:scale-90"
            >
              <span className="text-xl sm:text-2xl">✕</span>
            </motion.button>

            {/* Main image container */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="w-full h-full flex flex-col items-center justify-center max-w-4xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Image */}
              <img
                src={imageError[selectedImage?._id] ? '/placeholder.jpg' : (selectedImage?.image || selectedImage?.imageUrl)}
                alt={selectedImage?.title || 'Gallery'}
                className="max-w-full max-h-[70vh] sm:max-h-[80vh] object-contain rounded-xl shadow-2xl"
                onError={() => {
                  setImageError(prev => ({ ...prev, [selectedImage?._id]: true }))
                }}
              />

              {/* Image Info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-4 sm:mt-6 w-full text-center text-white px-4"
              >
                <div className="inline-flex items-center gap-2 rounded-full bg-white/20 backdrop-blur-md px-4 py-2 border border-white/30 mb-3 text-sm">
                  <span className="text-base">📁</span>
                  {selectedImage?.category?.replace(/_/g, ' ') || 'Salon'}
                </div>

                <h2 className="text-xl sm:text-3xl font-bold text-white mb-2 line-clamp-3">
                  {selectedImage?.title || 'Beauty Transformation'}
                </h2>

                {selectedImage?.description && (
                  <p className="text-sm sm:text-base text-white/80 max-w-2xl mx-auto line-clamp-3 mb-4">
                    {selectedImage.description}
                  </p>
                )}

                <div className="flex items-center justify-center gap-4 sm:gap-6 text-white/70 text-xs sm:text-sm">
                  {selectedImage?.likes && (
                    <div className="flex items-center gap-1">
                      <span>❤️</span>
                      <span>{selectedImage.likes}</span>
                    </div>
                  )}
                  {selectedImage?.saves?.length && (
                    <div className="flex items-center gap-1">
                      <span>💾</span>
                      <span>{selectedImage.saves.length}</span>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Hint text */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="absolute bottom-4 sm:bottom-6 text-white/50 text-xs sm:text-sm text-center"
              >
                Tap to close
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <BottomNav />
    </PageBackground>
  )
}
