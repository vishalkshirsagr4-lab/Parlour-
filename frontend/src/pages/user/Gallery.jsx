import { useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useInfiniteQuery } from '@tanstack/react-query'
import { useInView } from 'react-intersection-observer'

import { galleryAPI } from '../../api/endpoints'
import {
  containerVariants,
  itemVariants,
} from '../../animations/variants'

import BottomNav from '../../components/BottomNav'
import PageBackground from '../../components/luxury/PageBackground'

export default function Gallery() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery({
    queryKey: ['gallery'],
    initialPageParam: 1,

    queryFn: async ({ pageParam = 1 }) => {
      try {
        const res = await galleryAPI.getGallery({
          page: pageParam,
          limit: 12,
        })

        return {
          gallery: res?.data?.gallery || [],
          pagination: res?.data?.pagination || null,
        }
      } catch (error) {
        console.error('Gallery API error:', error)

        return {
          gallery: [],
          pagination: null,
        }
      }
    },

    getNextPageParam: (lastPage) => {
      const pagination = lastPage?.pagination

      if (!pagination) return undefined

      const currentPage = pagination?.currentPage || 1
      const totalPages = pagination?.pages || 1

      return currentPage < totalPages
        ? currentPage + 1
        : undefined
    },

    initialData: {
      pages: [],
      pageParams: [],
    },
  })

  const [ref, inView] = useInView()

  useEffect(() => {
    if (!inView) return
    if (!hasNextPage) return
    if (isFetchingNextPage) return

    fetchNextPage()
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage])

  // ================= SAFE FLATTEN =================
  const galleryItems = useMemo(() => {
    try {
      if (!data?.pages || !Array.isArray(data.pages)) return []

      return data.pages.flatMap((page) => {
        if (!page) return []

        if (Array.isArray(page.gallery)) return page.gallery

        if (Array.isArray(page)) return page

        return []
      })
    } catch (error) {
      console.error('Gallery flatten error:', error)
      return []
    }
  }, [data])

  // ================= ERROR STATE =================
  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-red-500 font-semibold">
        Failed to load gallery
      </div>
    )
  }

  return (
    <PageBackground>
      <motion.div
        variants={containerVariants}
        initial="initial"
        animate="animate"
        className="min-h-screen pb-32 text-black overflow-x-hidden bg-gray-50"
      >
        {/* HEADER */}
        <section className="px-4 pt-5">
          <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-black via-gray-900 to-gray-800 p-8 shadow-2xl">

            <div className="absolute top-0 right-0 w-72 h-72 bg-pink-500/20 blur-3xl rounded-full" />
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-purple-500/20 blur-3xl rounded-full" />

            <div className="relative z-10">

              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md px-4 py-2 border border-white/10">
                <div className="w-2 h-2 rounded-full bg-pink-400" />
                <span className="text-white text-xs uppercase tracking-[0.2em]">
                  Luxury Showcase
                </span>
              </div>

              <h1 className="mt-5 text-3xl sm:text-5xl font-black text-white leading-tight">
                Gallery
              </h1>

              <p className="mt-4 text-white/70 text-sm sm:text-base max-w-2xl">
                Explore premium bridal transformations, makeup looks,
                hair styling, and salon artistry.
              </p>

            </div>
          </div>
        </section>

        {/* GALLERY */}
        <section className="px-4 mt-10">

          {isLoading ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 9 }).map((_, i) => (
                <div
                  key={i}
                  className="h-[22rem] rounded-3xl bg-gray-100 animate-pulse border border-gray-200"
                />
              ))}
            </div>
          ) : galleryItems.length > 0 ? (
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-5">

              {galleryItems.map((item, idx) => (
                <motion.div
                  key={item?._id || idx}
                  variants={itemVariants}
                  whileHover={{ y: -6 }}
                  className="mb-5 break-inside-avoid overflow-hidden rounded-3xl bg-white border border-gray-200 shadow-lg"
                >

                  <div className="relative overflow-hidden">

                    <img
                      src={item?.image || item?.imageUrl}
                      alt={item?.title || 'Gallery'}
                      loading="lazy"
                      className="w-full object-cover transition duration-500 hover:scale-105"
                      onError={(e) => {
                        e.target.src = '/placeholder.jpg'
                      }}
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                    <div className="absolute bottom-0 left-0 right-0 p-5">

                      <div className="inline-flex items-center rounded-full bg-white/20 px-3 py-1 text-xs text-white">
                        {item?.category?.replace('_', ' ') || 'Luxury Beauty'}
                      </div>

                      <h2 className="mt-3 text-lg font-bold text-white">
                        {item?.title || 'Beauty Transformation'}
                      </h2>

                    </div>

                  </div>
                </motion.div>
              ))}

            </div>
          ) : (
            <div className="text-center py-24">
              <h2 className="text-2xl font-bold">No Gallery Images</h2>
              <p className="text-gray-500 mt-2">
                No content uploaded yet.
              </p>
            </div>
          )}

        </section>

        {/* LOAD MORE TRIGGER */}
        <div ref={ref} className="mt-10 flex justify-center px-4">

          {isFetchingNextPage && (
            <div className="px-6 py-3 bg-black text-white rounded-full">
              Loading more...
            </div>
          )}

          {!hasNextPage && galleryItems.length > 0 && (
            <div className="text-gray-500 text-sm pb-10">
              End of gallery
            </div>
          )}

        </div>

        <BottomNav />
      </motion.div>
    </PageBackground>
  )
    }
