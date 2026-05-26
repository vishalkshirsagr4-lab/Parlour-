import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'

import { serviceAPI, galleryAPI, staffAPI, reviewAPI } from '../../api/endpoints'

// BottomNav is rendered by UserLayout
import PageBackground from '../../components/luxury/PageBackground'
import GlassCard from '../../components/luxury/GlassCard'
import SectionHeading from '../../components/luxury/SectionHeading'
import ReviewCard from '../../components/reviews/ReviewCard'

const heroSlides = [
  {
    title: 'Cinematic Glam',
    subtitle: 'Bridal makeup & premium styling',
    gradient:
      'bg-gradient-to-br from-pink-500 via-rose-500 to-purple-600',
  },
  {
    title: 'Glow Therapy',
    subtitle: 'Face wash, facial & skin care',
    gradient:
      'bg-gradient-to-br from-orange-400 via-pink-500 to-rose-600',
  },
  {
    title: 'Hair, Elevated',
    subtitle: 'Cutting, coloring & hair spa',
    gradient:
      'bg-gradient-to-br from-purple-500 via-indigo-500 to-blue-600',
  },
]

function clampString(s, max = 90) {
  if (!s) return ''
  return s.length > max ? `${s.slice(0, max)}…` : s
}

export default function Home() {
  const navigate = useNavigate()

  const [query, setQuery] = useState('')
  const [heroIndex, setHeroIndex] = useState(0)
  const [selectedImage, setSelectedImage] = useState(null)

  const {
    data: categories = [],
    isLoading: loadingCategories,
  } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await serviceAPI.getCategories()
      return res?.data || []
    },
  })

  const {
    data: services = [],
    isLoading: loadingServices,
  } = useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      const res = await serviceAPI.getServices()
      return res?.data || []
    },
  })

  const { data: galleryData = {} } = useQuery({
    queryKey: ['gallery'],
    queryFn: async () => {
      const res = await galleryAPI.getGallery({ limit: 12 })
      return res?.data || {}
    },
  })

  const {
    data: staffData = [],
    isLoading: loadingStaff,
  } = useQuery({
    queryKey: ['staff'],
    queryFn: async () => {
      const res = await staffAPI.getStaff()
      return res?.data || []
    },
  })

  const {
    data: recentReviewsData = [],
    isLoading: loadingReviews,
    isError: reviewsError,
  } = useQuery({
    queryKey: ['recentReviews'],
    queryFn: async () => {
      const res = await reviewAPI.getRecentReviews({ limit: 3 })
      return res?.data?.reviews || []
    },
    staleTime: 1000 * 60,
    retry: 1,
  })

  const gallery = galleryData?.gallery || []
  const staff = staffData?.staff || staffData || []
  const recentReviews = Array.isArray(recentReviewsData) ? recentReviewsData : []

  const heroImage = useMemo(() => {
    if (!gallery.length) return null

    const item = gallery[heroIndex % gallery.length]

    return item?.image || null
  }, [gallery, heroIndex])

  const filteredServices = useMemo(() => {
    const q = query.trim().toLowerCase()

    if (!q) return services

    return services.filter((s) => {
      const haystack =
        `${s?.title || ''} ${s?.description || ''}`.toLowerCase()

      return haystack.includes(q)
    })
  }, [query, services])

  useEffect(() => {
    const id = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % heroSlides.length)
    }, 4200)

    return () => clearInterval(id)
  }, [])

  return (
    <PageBackground>
      <div className="min-h-screen bg-white text-black pb-28 font-sans" style={{ paddingBottom: 'calc(7rem + env(safe-area-inset-bottom))' }}>

        {/* HERO */}
        <section className="px-4 sm:px-6">
          <GlassCard className="overflow-hidden rounded-[2rem] shadow-2xl border border-white/10">
            <div className="relative h-[34rem] sm:h-[36rem] md:h-[40rem]">

              <div
                className={`absolute inset-0 ${heroSlides[heroIndex].gradient}`}
              />

              <div className="absolute inset-0 bg-black/40" />

              {heroImage && (
                <img
                  src={heroImage}
                  alt="Hero"
                  className="absolute inset-0 w-full h-full object-cover opacity-30"
                />
              )}

              <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[18rem] h-[18rem] sm:w-[26rem] sm:h-[26rem] md:w-[30rem] md:h-[30rem] rounded-full bg-white/10 blur-3xl" />

              <div className="relative z-10 h-full flex flex-col justify-end p-6 md:p-10">

                <AnimatePresence mode="wait">
                  <motion.div
                    key={heroIndex}
                    initial={{ opacity: 0, y: 25 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.4 }}
                    className="text-white"
                  >

                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 backdrop-blur-md border border-white/20 mb-5">
                      <div className="w-2 h-2 rounded-full bg-white" />

                      <span className="text-xs md:text-sm uppercase tracking-[0.25em] font-medium">
                        Luxury Beauty
                      </span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-black leading-tight tracking-tight">
                      {heroSlides[heroIndex].title}
                    </h1>

                    <p className="mt-4 text-white/90 text-lg md:text-xl max-w-2xl leading-relaxed">
                      {heroSlides[heroIndex].subtitle}
                    </p>

                    <div className="mt-8 flex flex-wrap gap-4">

                      <button
                        onClick={() => navigate('/services')}
                        className="bg-white text-black px-7 py-3 rounded-2xl font-semibold hover:scale-105 transition duration-300 shadow-lg"
                      >
                        Explore Services
                      </button>

                      <button
                        onClick={() => navigate('/gallery')}
                        className="bg-black/40 backdrop-blur-md border border-white/20 text-white px-7 py-3 rounded-2xl font-semibold hover:bg-black/60 transition"
                      >
                        View Gallery
                      </button>

                    </div>

                    <div className="flex gap-3 mt-8">
                      {heroSlides.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setHeroIndex(i)}
                          className={`h-2 rounded-full transition-all duration-300 ${
                            heroIndex === i
                              ? 'bg-white w-10'
                              : 'bg-white/40 w-2'
                          }`}
                        />
                      ))}
                    </div>

                  </motion.div>
                </AnimatePresence>

              </div>
            </div>
          </GlassCard>
        </section>

        {/* STAFF */}
        <section className="px-4 sm:px-6 mt-14">

          <SectionHeading
            eyebrow="Team"
            title="Meet Our Artists"
            subtitle="Professional stylists and beauty experts"
          />

          <div className="grid md:grid-cols-3 gap-5 mt-6">

            {staff.map((m) => (
              <GlassCard
                key={m?._id}
                className="bg-white border border-gray-200 rounded-[2rem] shadow-lg p-5 hover:shadow-2xl transition"
              >

                <div className="flex flex-col gap-4 sm:flex-row">

                  <div className="w-28 h-28 rounded-2xl overflow-hidden bg-gray-100 flex-shrink-0">
                    {m?.image ? (
                      <button
                        type="button"
                        onClick={() => setSelectedImage(m.image)}
                        className="group relative h-full w-full overflow-hidden"
                      >
                        <img
                          src={m.image}
                          alt={m.name}
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition duration-300 group-hover:opacity-100">
                          <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-black">
                            View
                          </span>
                        </div>
                      </button>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200 text-2xl font-black text-gray-700">
                        {m?.name?.[0] || 'S'}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">

                    <div className="flex flex-col sm:flex-row justify-between items-start gap-3">

                      <div>
                        <h3 className="text-xl font-black text-gray-900">
                          {m?.name}
                        </h3>

                        <div className="text-sm text-gray-600 mt-1">
                          {Array.isArray(m?.specialization)
                            ? m.specialization.join(', ')
                            : ''}
                        </div>
                      </div>

                      <div className="w-full text-left text-sm text-gray-500 sm:w-auto sm:text-right">
                        <div>Exp: {m?.experience || 0} yrs</div>
                        <div>⭐ {m?.rating || 0}</div>
                      </div>

                    </div>

                    <p className="mt-3 text-gray-600 leading-relaxed text-sm">
                      {clampString(m?.bio, 120)}
                    </p>

                    <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">

                      <div className="text-sm text-gray-500">
                        {Array.isArray(m?.workingDays)
                          ? m.workingDays.join(', ')
                          : ''}
                      </div>

                      {m?.phone && (
                        <a
                          href={`tel:${m.phone}`}
                          className="bg-black text-white px-4 py-2 rounded-xl font-semibold hover:opacity-90 w-full text-center sm:w-auto"
                        >
                          Call
                        </a>
                      )}

                    </div>

                  </div>

                </div>

              </GlassCard>
            ))}

            {loadingStaff &&
              Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-36 rounded-2xl bg-gray-100 animate-pulse"
                />
              ))}

          </div>

          {selectedImage && (
            <div
              onClick={() => setSelectedImage(null)}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
            >
              <div
                onClick={(e) => e.stopPropagation()}
                className="relative max-h-full max-w-full overflow-hidden rounded-3xl bg-white p-4"
              >
                <button
                  type="button"
                  onClick={() => setSelectedImage(null)}
                  className="absolute right-3 top-3 z-10 rounded-full bg-white/90 px-3 py-1 text-sm font-semibold text-gray-700 shadow-sm"
                >
                  Close
                </button>
                <img
                  src={selectedImage}
                  alt="Staff profile"
                  className="max-h-[85vh] max-w-[85vw] object-contain"
                />
              </div>
            </div>
          )}

        </section>

        {/* SEARCH */}
        {/* <section className="px-4 sm:px-6 mt-6">

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">

            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search premium services..."
              className="flex-1 min-w-0 px-5 py-4 rounded-2xl border border-gray-200 bg-white text-black placeholder:text-gray-400 shadow-md focus:outline-none focus:ring-2 focus:ring-black text-base font-medium"
            />

            <button
              onClick={() =>
                navigate(
                  '/services?search=' + encodeURIComponent(query)
                )
              }
              className="bg-black text-white px-6 py-4 rounded-2xl shadow-lg font-semibold hover:opacity-90 transition w-full sm:w-auto"
            >
              Search
            </button>

          </div>

        </section> */}

        {/* CATEGORIES */}
        <section className="px-4 mt-12">

          <SectionHeading
            eyebrow="Luxury"
            title="Service Categories"
            subtitle="Explore premium beauty experiences"
          />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">

            {categories.map((cat) => (
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.98 }}
                key={cat?._id}
                onClick={() =>
                  navigate(`/services?category=${cat?._id}`)
                }
                className="bg-white border border-gray-200 shadow-md rounded-3xl p-6 hover:shadow-2xl transition text-center"
              >

                <div className="text-5xl mb-4">
                  {typeof cat?.icon === 'string'
                    ? cat.icon
                    : '✨'}
                </div>

                <div className="font-bold text-gray-900 text-lg">
                  {cat?.name}
                </div>

              </motion.button>
            ))}

            {loadingCategories &&
              Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-32 rounded-3xl bg-gray-100 animate-pulse"
                />
              ))}

          </div>

        </section>

        {/* FEATURED */}
        <section className="px-4 mt-14">

          <SectionHeading
            eyebrow="Trending"
            title="Featured Services"
            subtitle="Handpicked luxury treatments"
          />

          <div className="grid gap-5 mt-6">

            {filteredServices
              .slice(0, 6)
              .map((s) => (

                <motion.div
                  whileHover={{ y: -4 }}
                  key={s?._id}
                >

                  <GlassCard className="bg-white border border-gray-200 shadow-lg rounded-[2rem] p-5 hover:shadow-2xl transition">

                    <div className="flex gap-5">

                      <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gray-100 flex-shrink-0">

                        {s?.images?.[0] && (
                          <img
                            src={s.images[0]}
                            alt={s.title}
                            className="w-full h-full object-cover"
                          />
                        )}

                      </div>

                      <div className="flex-1 min-w-0">

                        <div className="flex justify-between gap-3">

                          <h3 className="text-xl font-black text-gray-900">
                            {s?.title}
                          </h3>

                          {s?.discount ? (
                            <div className="bg-black text-white text-xs px-3 py-1 rounded-full h-fit whitespace-nowrap">
                              {s.discount}% OFF
                            </div>
                          ) : null}

                        </div>

                        <p className="text-gray-600 mt-2 leading-relaxed">
                          {clampString(s?.description, 120)}
                        </p>

                        <div className="mt-5 flex items-center justify-between">

                          <div className="text-2xl font-black text-black">
                            ₹{s?.finalPrice || 0}
                          </div>

                          <button
                            onClick={() =>
                              navigate(`/services/${s?._id}`)
                            }
                            className="bg-black text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl test-sm sm:test-base font-semibold hover:opacity-90 transition"
                          >
                            Book Now
                          </button>

                        </div>

                      </div>

                    </div>

                  </GlassCard>

                </motion.div>
              ))}

            {loadingServices &&
              Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-32 rounded-3xl bg-gray-100 animate-pulse"
                />
              ))}

          </div>

        </section>

        {/* GALLERY */}
        <section className="px-4 mt-14">

          <div className="flex items-center justify-between mb-6">

            <SectionHeading
              eyebrow="Inspiration"
              title="Gallery Preview"
              subtitle="Latest transformations"
            />

            <button
              onClick={() => navigate('/gallery')}
              className="text-black font-bold whitespace-nowrap"
            >
              View All →
            </button>

          </div>

          <div className="columns-2 md:columns-4 gap-4">

            {gallery
              .slice(0, 8)
              .map((g) => (

                <div
                  key={g?._id}
                  className="mb-4 break-inside-avoid overflow-hidden rounded-[2rem] shadow-lg hover:shadow-2xl transition bg-white"
                >

                  <img
                    src={g?.image}
                    alt="Gallery"
                    className="w-full object-cover hover:scale-105 transition duration-300"
                  />

                </div>
              ))}

          </div>

        </section>

        {/* REVIEWS */}
        <section className="px-4 mt-14">

          <SectionHeading
            eyebrow="Reviews"
            title="Customer testimonials"
            subtitle="Latest reviews from real clients"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
            {loadingReviews ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-56 rounded-3xl bg-gray-100 animate-pulse"
                />
              ))
            ) : reviewsError ? (
              <div className="col-span-full rounded-3xl border border-red-200 bg-red-50 p-8 text-center text-red-700">
                Unable to load reviews right now. Please try again later.
              </div>
            ) : recentReviews.length > 0 ? (
              recentReviews.map((review) => (
                <ReviewCard
                  key={review?._id || review?.createdAt}
                  review={review}
                />
              ))
            ) : (
              <div className="col-span-full rounded-3xl border border-gray-300 bg-white/80 p-8 text-center text-gray-600">
                No reviews available yet. Be the first to leave your feedback.
              </div>
            )}
          </div>

        </section>

        {/* MAP */}
        <section className="px-4 mt-14">

          <GlassCard className="overflow-hidden rounded-[2rem] bg-white border border-gray-200 shadow-2xl">

            <div className="p-6">

              <h2 className="text-3xl font-black text-black">
                Visit Our Salon
              </h2>

              <p className="mt-2 text-gray-600">
                Find us easily with Google Maps directions.
              </p>

            </div>

            <div className="w-full h-[320px]">

              <iframe
                title="Salon Location"
                src="https://maps.google.com/maps?q=Mysore&t=&z=13&ie=UTF8&iwloc=&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
              />

            </div>

            <div className="p-6">

              <button
                onClick={() =>
                  window.open(
                    'https://maps.google.com/?q=Mysore',
                    '_blank'
                  )
                }
                className="w-full bg-black text-white py-4 rounded-2xl font-bold hover:opacity-90 transition"
              >
                Open In Google Maps
              </button>

            </div>

          </GlassCard>

        </section>

        {/* ABOUT */}
        <section className="px-4 mt-14 mb-16">

          <GlassCard className="bg-black text-white rounded-[2rem] p-8 shadow-2xl overflow-hidden relative">

            <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full blur-3xl" />

            <div className="relative z-10">

              <h2 className="text-4xl md:text-black font-black leading-tight text-[#333]">
                About Our Salon
              </h2>

              <p className="mt-5 text-black/80 leading-relaxed max-w-2xl text-lg">
                Experience premium beauty treatments with luxury ambiance,
                professional artists, and cinematic transformations designed
                to elevate your confidence and style.
              </p>

              <button
                onClick={() => navigate('/services')}
                className="mt-8 bg-white text-black px-7 py-3 rounded-2xl font-bold hover:bg-gray-200 transition"
              >
                Explore Service
              </button>

            </div>

          </GlassCard>

        </section>

        {/* BottomNav rendered by layout */}

      </div>
    </PageBackground>
  )
}