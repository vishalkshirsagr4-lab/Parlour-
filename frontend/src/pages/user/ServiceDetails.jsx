import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import { format } from 'date-fns'

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

// BottomNav is rendered by UserLayout

import toast from 'react-hot-toast'

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

  const bookingMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await bookingAPI.createBooking(payload)
      return res?.data
    },
    onSuccess: () => {
      toast.success('Appointment request submitted')
      navigate('/bookings')
    },
    onError: () => {
      toast.error('Booking failed')
    },
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
      queryClient.invalidateQueries(['serviceReviews', id])
    },
    onError: () => {
      toast.error('Unable to submit review')
    },
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

  const handleChat = () => {
    const stylistId = selectedStaffId || staff?.[0]?._id
    if (!stylistId) return toast.error('No stylist available')

    navigate(`/chat/${stylistId}`)
  }

  // ================= LOADING =================
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 text-gray-700">
        Loading...
      </div>
    )
  }

  // ================= ERROR =================
  if (isError || !service?._id) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="rounded-2xl bg-white p-6 text-center shadow-md border">
          <p className="text-lg font-semibold text-red-500">
            Service not found
          </p>

          <button
            onClick={() => navigate('/services')}
            className="mt-4 rounded-xl bg-black px-5 py-2 text-white"
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

        {/* MAIN CARD */}
        <motion.div
          variants={itemVariants}
          className="rounded-3xl bg-white p-4 shadow-md border border-gray-100 md:grid md:grid-cols-3 md:gap-6"
        >

          <div className="md:col-span-2">
            {/* IMAGE */}
            <img
              src={service?.images?.[0] || 'https://via.placeholder.com/600x400'}
              alt={service?.title}
              className="w-full rounded-2xl object-cover h-64 md:h-96"
            />

            {/* TITLE */}
            <h1 className="mt-5 text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
              {service?.title}
            </h1>

            {/* DESCRIPTION */}
            <p className="mt-3 text-sm sm:text-base text-gray-700 leading-relaxed">
              {service?.description}
            </p>

            {/* PRICE */}
            <div className="mt-4 text-2xl sm:text-3xl font-bold text-pink-600">
              ₹{service?.finalPrice || 0}
            </div>
          </div>

          {/* BOOKING (RIGHT) */}
          <div className="mt-6 md:mt-0 md:col-span-1">
            <div className="sticky top-24 rounded-2xl border border-gray-100 p-5 bg-white">

              <h2 className="text-lg font-semibold text-gray-900">Book Appointment</h2>

              <div className="mt-4 space-y-4">

                <input
                  type="date"
                  min={format(new Date(), 'yyyy-MM-dd')}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-pink-300"
                />

                <select
                  value={selectedSlot}
                  onChange={(e) => setSelectedSlot(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-pink-300"
                >
                  {slots.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedStaffId}
                  onChange={(e) => setSelectedStaffId(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-pink-300"
                >
                  <option value="">Any stylist</option>
                  {staff.map((member) => (
                    <option key={member._id} value={member._id}>
                      {member.name}
                    </option>
                  ))}
                </select>

                <textarea
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes..."
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-pink-300"
                />

                <button
                  onClick={handleChat}
                  className="w-full rounded-xl border border-pink-500 bg-pink-50 py-3 font-semibold text-pink-600 active:scale-[0.99]"
                >
                  Chat with stylist
                </button>

                <button
                  onClick={handleBooking}
                  className="w-full rounded-xl bg-black py-3 font-semibold text-white active:scale-[0.99]"
                >
                  Request Appointment
                </button>

              </div>
            </div>
          </div>
        </motion.div>

        {/* REVIEWS */}
        <motion.div
          variants={itemVariants}
          className="mt-10 rounded-2xl border border-gray-100 bg-white p-5"
        >

            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Customer Reviews
                </h2>
                <p className="text-sm text-gray-500">
                  Real feedback from clients
                </p>
              </div>

              <RatingsSummary stats={reviewStats} />
            </div>

            <div className="mt-6">
              <ReviewForm
                serviceId={id}
                isSubmitting={createReviewMutation.isLoading}
                onSubmit={(data) => createReviewMutation.mutate(data)}
              />
            </div>

            <div className="mt-6">
              <ReviewsList
                reviews={reviews}
                isLoading={isReviewsLoading}
              />
            </div>

            <div className="mt-6">
              <FeaturedReviewsCarousel reviews={reviews} />
            </div>
        </motion.div>
      </div>

      {/* BottomNav is rendered by UserLayout */}
    </motion.div>
  )
}
