import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

import {
  serviceAPI,
  staffAPI,
  reviewAPI,
  bookingAPI,
} from '../../api/endpoints'

import {
  containerVariants,
  itemVariants,
} from '../../animations/variants'

import ReviewsList from '../../components/reviews/ReviewsList'
import ReviewForm from '../../components/reviews/ReviewForm'
import RatingsSummary from '../../components/reviews/RatingsSummary'
import FeaturedReviewsCarousel from '../../components/reviews/FeaturedReviewsCarousel'

const slots = [
  '10:00 AM',
  '11:30 AM',
  '01:00 PM',
  '03:00 PM',
  '04:30 PM',
  '06:00 PM',
]

export default function ServiceDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [selectedDate, setSelectedDate] = useState(
    format(new Date(), 'yyyy-MM-dd')
  )
  const [selectedSlot, setSelectedSlot] = useState(slots[0])
  const [selectedStaffId, setSelectedStaffId] = useState('')
  const [notes, setNotes] = useState('')

  // ================= SERVICE =================
  const { data: serviceData, isLoading, isError } = useQuery({
    queryKey: ['service', id],
    queryFn: async () => {
      const res = await serviceAPI.getServiceById(id)
      return res?.data || {}
    },
    enabled: !!id,
  })

  // ================= STAFF =================
  const { data: staffData } = useQuery({
    queryKey: ['staff'],
    queryFn: async () => {
      const res = await staffAPI.getStaff()
      return res?.data || []
    },
  })

  // ================= REVIEWS =================
  const { data: reviewsData, isLoading: isReviewsLoading } = useQuery({
    queryKey: ['serviceReviews', id],
    queryFn: async () => {
      const res = await reviewAPI.getServiceReviews(id)
      return res?.data || { reviews: [] }
    },
    enabled: !!id,
  })

  const service = serviceData?.service || serviceData || {}

  const staff = Array.isArray(staffData)
    ? staffData
    : staffData?.staff || []

  const reviews = reviewsData?.reviews || []

  const reviewStats = reviewsData?.stats || {
    averageRating: 0,
    totalReviews: reviews.length,
  }

  // ================= MUTATIONS =================
  const queryClientRef = queryClient

  const bookingMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await bookingAPI.createBooking(payload)
      return res?.data
    },
    onSuccess: () => {
      toast.success('Appointment request submitted')
      navigate('/bookings')
    },
    onError: () => toast.error('Booking failed'),
  })

  const createReviewMutation = useMutation({
    mutationFn: async (payload) => {
      const formData = new FormData()
      formData.append('serviceId', payload.serviceId)
      formData.append('customerName', payload.customerName)
      formData.append('rating', payload.rating)
      formData.append('comment', payload.comment)
      if (payload.imageFile) formData.append('image', payload.imageFile)

      const res = await reviewAPI.createReview(formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return res?.data
    },
    onSuccess: () => {
      toast.success('Review submitted')
      queryClientRef.invalidateQueries(['serviceReviews', id])
    },
    onError: () => toast.error('Unable to submit review'),
  })

  const handleBooking = () => {
    if (!service?._id) return toast.error('Service not found')

    bookingMutation.mutate({
      serviceId: service._id,
      date: selectedDate,
      timeSlot: selectedSlot,
      staffId: selectedStaffId || staff?.[0]?._id,
      notes,
    })
  }

  // ================= LOADING =================
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        Loading...
      </div>
    )
  }

  // ================= ERROR =================
  if (isError || !service?._id) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-500 font-semibold">Service not found</p>
          <button
            onClick={() => navigate('/services')}
            className="mt-4 px-4 py-2 bg-black text-white rounded-xl"
          >
            Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      className="min-h-screen bg-gray-50 pb-32"
    >
      <div className="px-4 pt-4">

        {/* BACK */}
        <button
          onClick={() => navigate(-1)}
          className="mb-4 text-pink-600 font-medium"
        >
          ← Back
        </button>

        {/* MAIN */}
        <motion.div
          variants={itemVariants}
          className="rounded-3xl bg-white p-4 shadow-md md:grid md:grid-cols-3 md:gap-6"
        >
          {/* LEFT */}
          <div className="md:col-span-2">
            <img
              src={service?.images?.[0] || 'https://via.placeholder.com/600x400'}
              className="w-full h-64 md:h-96 object-cover rounded-2xl"
              alt={service?.title}
            />

            <h1 className="mt-5 text-2xl font-bold">{service?.title}</h1>

            <p className="mt-2 text-gray-600">{service?.description}</p>

            <div className="mt-4 text-3xl font-bold text-pink-600">
              ₹{service?.finalPrice || 0}
            </div>

            {/* ================= INGREDIENTS ================= */}
            <div className="mt-6">
              <h2 className="text-lg font-semibold">Ingredients</h2>

              {service?.ingredients?.length > 0 ? (
                <div className="mt-2 flex flex-wrap gap-2">
                  {service.ingredients.map((item, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 mt-2">
                  No ingredients listed
                </p>
              )}
            </div>

            {/* ================= BENEFITS ================= */}
            <div className="mt-6">
              <h2 className="text-lg font-semibold">Benefits</h2>

              {service?.benefits?.length > 0 ? (
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {service.benefits.map((item, i) => (
                    <div
                      key={i}
                      className="p-3 border rounded-xl bg-pink-50 text-pink-700 text-sm"
                    >
                      ✨ {item}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 mt-2">
                  No benefits listed
                </p>
              )}
            </div>
          </div>

          {/* RIGHT BOOKING */}
          <div className="mt-6 md:mt-0">
            <div className="sticky top-24 border rounded-2xl p-5 bg-white">
              <h2 className="text-lg font-semibold">Book Appointment</h2>

              <div className="mt-4 space-y-3">

                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full border rounded-xl p-3"
                />

                <select
                  value={selectedSlot}
                  onChange={(e) => setSelectedSlot(e.target.value)}
                  className="w-full border rounded-xl p-3"
                >
                  {slots.map((slot) => (
                    <option key={slot}>{slot}</option>
                  ))}
                </select>

                <textarea
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Notes..."
                  className="w-full border rounded-xl p-3"
                />

                <button
                  onClick={handleBooking}
                  className="w-full bg-black text-white py-3 rounded-xl"
                >
                  Request Appointment
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ================= REVIEWS ================= */}
        <div className="mt-10 bg-white p-5 rounded-2xl border">
          <div className="flex justify-between">
            <div>
              <h2 className="text-xl font-bold">Customer Reviews</h2>
              <p className="text-sm text-gray-500">Real feedback</p>
            </div>

            <RatingsSummary stats={reviewStats} />
          </div>

          <div className="mt-5">
            <ReviewForm
              serviceId={id}
              isSubmitting={createReviewMutation.isLoading}
              onSubmit={(data) => createReviewMutation.mutate(data)}
            />
          </div>

          <div className="mt-6">
            <ReviewsList reviews={reviews} isLoading={isReviewsLoading} />
          </div>

          <div className="mt-6">
            <FeaturedReviewsCarousel reviews={reviews} />
          </div>
        </div>
      </div>
    </motion.div>
  )
    }
