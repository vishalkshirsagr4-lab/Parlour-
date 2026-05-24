import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useInfiniteQuery } from '@tanstack/react-query'
import { useInView } from 'react-intersection-observer'

import { galleryAPI } from '../../api/endpoints'
import { containerVariants, itemVariants } from '../../animations/variants'

import BottomNav from '../../components/BottomNav'
import PageBackground from '../../components/luxury/PageBackground'


export default function Gallery() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ['gallery'],

    initialPageParam: 1,

    queryFn: async ({ pageParam = 1 }) => {
      const res = await galleryAPI.getGallery({
        page: pageParam,
        limit: 12,
      })

      return res.data
    },

    getNextPageParam: (lastPage) => {
      if (!lastPage?.pagination) return undefined

      const currentPage = lastPage.pagination.currentPage || 1
      const totalPages = lastPage.pagination.pages || 1

      return currentPage < totalPages
        ? currentPage + 1
        : undefined
    },
  })

  const [ref, inView] = useInView()

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage])

  const galleryItems =
    data?.pages?.flatMap((page) =>
      Array.isArray(page)
        ? page
        : page?.gallery || []
    ) || []

  return (
    <PageBackground>
      <motion.div
        variants={containerVariants}
        initial="initial"
        animate="animate"
        className="min-h-screen pb-28 text-black"
      >
        {/* HEADER */}
        <section className="px-4 pt-5">
          <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-black via-gray-900 to-gray-800 p-8 shadow-2xl">

            <div className="absolute top-0 right-0 w-72 h-72 bg-pink-500/20 blur-3xl rounded-full" />
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-purple-500/20 blur-3xl rounded-full" />

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md px-4 py-2 border border-white/10">
                <div className="w-2 h-2 rounded-full bg-pink-400" />
                <span className="text-white text-xs tracking-[0.2em] uppercase">
                  Luxury Showcase
                </span>
              </div>

              <h1 className="mt-5 text-4xl md:text-6xl font-black text-white leading-tight">
                Gallery
              </h1>

              <p className="mt-4 text-white/70 max-w-2xl text-sm md:text-base leading-relaxed">
                Explore premium bridal transformations,
                cinematic makeup looks, luxury hair styling,
                glowing skin treatments, and salon artistry.
              </p>
            </div>
          </div>
        </section>

        {/* GALLERY */}
        <section className="px-4 mt-10">

          {isLoading ? (

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 9 }).map((_, index) => (
                <div
                  key={index}
                  className="h-[22rem] rounded-[2rem] bg-white/70 backdrop-blur-md animate-pulse border border-gray-200 shadow-lg"
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
                  className="mb-5 break-inside-avoid overflow-hidden rounded-[2rem] bg-white/90 backdrop-blur-xl border border-gray-200 shadow-xl hover:shadow-2xl transition-all duration-300"
                >

                  <div className="relative overflow-hidden">

                    <img
                      src={item?.image || item?.imageUrl || '/placeholder.jpg'}
                      alt={item?.title || 'Gallery'}
                      className="w-full object-cover transition duration-500 hover:scale-105"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-90" />

                    <div className="absolute bottom-0 left-0 right-0 p-5">

                      <div className="inline-flex items-center rounded-full bg-white/20 backdrop-blur-md px-3 py-1 text-xs text-white border border-white/10 capitalize">
                        {item?.category?.replace?.('_', ' ') || 'Luxury Beauty'}
                      </div>

                      <h2 className="mt-3 text-xl font-bold text-white leading-tight">
                        {item?.title || 'Beauty Transformation'}
                      </h2>

                    </div>

                  </div>

                </motion.div>
              ))}

            </div>

          ) : (

            <div className="flex flex-col items-center justify-center py-24">

              <div className="w-32 h-32 rounded-full bg-white shadow-xl border border-gray-200 flex items-center justify-center text-6xl">
                📸
              </div>

              <h2 className="mt-8 text-3xl font-black text-black">
                No Gallery Images Yet
              </h2>

              <p className="mt-4 text-center text-gray-500 max-w-md leading-relaxed">
                Admin has not uploaded bridal transformations,
                salon interiors, beauty moments, or styling
                showcases yet.
              </p>

              <button
                onClick={() => window.location.reload()}
                className="mt-8 bg-black text-white px-8 py-4 rounded-2xl font-semibold hover:scale-105 transition duration-300 shadow-xl"
              >
                Refresh Gallery
              </button>

            </div>

          )}

        </section>

        {/* LOAD MORE */}
        <div
          ref={ref}
          className="mt-12 flex justify-center px-4"
        >

          {isFetchingNextPage && (
            <div className="rounded-full bg-black px-8 py-4 text-white font-semibold shadow-xl">
              Loading more...
            </div>
          )}

          {!hasNextPage &&
            !isLoading &&
            galleryItems.length > 0 && (
              <div className="text-gray-500 text-sm pb-10">
                You have reached the end of the gallery.
              </div>
            )}

        </div>

        <BottomNav />

      </motion.div>
    </PageBackground>
  )
}