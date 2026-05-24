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

import BottomNav from '../../components/BottomNav'

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

  const [selectedSlot, setSelectedSlot] =
    useState(slots[0])

  const [selectedStaffId, setSelectedStaffId] =
    useState('')

  const [notes, setNotes] = useState('')

  // =========================
  // SERVICE QUERY
  // =========================
  const {
    data: serviceData,
    isLoading: isServiceLoading,
    isError: isServiceError,
  } = useQuery({
    queryKey: ['service', id],

    queryFn: async () => {
      try {

        const res =
          await serviceAPI.getServiceById(id)

        return res?.data || {}

      } catch (error) {

        console.error(error)

        throw error
      }
    },

    enabled: !!id,
    retry: false,
  })

  // =========================
  // STAFF QUERY
  // =========================
  const {
    data: staffData,
  } = useQuery({
    queryKey: ['staff'],

    queryFn: async () => {
      try {

        const res =
          await staffAPI.getStaff()

        return res?.data || []

      } catch (error) {

        console.error(error)

        return []
      }
    },

    retry: false,
  })

  // =========================
  // REVIEWS QUERY
  // =========================
  const {
    data: reviewsData,
    isLoading: isReviewsLoading,
  } = useQuery({
    queryKey: ['serviceReviews', id],

    queryFn: async () => {

      try {

        const res =
          await reviewAPI.getServiceReviews(id)

        return res?.data || {}

      } catch (error) {

        console.error(error)

        return {
          reviews: [],
        }
      }
    },

    enabled: !!id,
    retry: false,
  })

  // =========================
  // SAFE DATA
  // =========================
  const service =
    serviceData?.service ||
    serviceData ||
    {}

  const staff =
    Array.isArray(staffData)
      ? staffData
      : staffData?.staff || []

  const reviews =
    reviewsData?.reviews ||
    reviewsData?.data ||
    []

  const reviewStats =
    reviewsData?.stats || {
      averageRating: 0,
      totalReviews: reviews.length,
    }

  const selectedStaff =
    staff.find(
      (member) =>
        member._id === selectedStaffId
    ) ||
    staff[0] ||
    null

  // =========================
  // REVIEW MUTATION
  // =========================
  const createReviewMutation = useMutation({

    mutationFn: async ({
      customerName,
      rating,
      comment,
      imageFile,
    }) => {

      try {

        const formData = new FormData()

        formData.append(
          'customerName',
          customerName || ''
        )

        formData.append(
          'rating',
          String(rating || 0)
        )

        formData.append(
          'comment',
          comment || ''
        )

        if (imageFile instanceof File) {
          formData.append('image', imageFile)
        }

        formData.append('serviceId', id)

        const res = await reviewAPI.createReview(
          formData,
          {
            headers: {
              'Content-Type':
                'multipart/form-data',
            },
          }
        )

        return res?.data

      } catch (error) {

        console.error(error)

        throw error
      }
    },

    onSuccess: () => {

      toast.success(
        'Review submitted successfully'
      )

      queryClient.invalidateQueries({
        queryKey: ['serviceReviews', id],
      })
    },

    onError: (error) => {

      console.error(error)

      toast.error(
        error?.response?.data?.message ||
        error?.message ||
        'Failed to submit review'
      )
    },
  })

  // =========================
  // BOOKING
  // =========================
  const bookingMutation = useMutation({

    mutationFn: async (payload) => {

      const res =
        await bookingAPI.createBooking(
          payload
        )

      return res?.data
    },

    onSuccess: () => {

      toast.success(
        'Appointment request submitted'
      )

      navigate('/bookings')
    },

    onError: (error) => {

      toast.error(
        error?.response?.data?.message ||
        'Booking failed'
      )
    },
  })

  // =========================
  // HANDLERS
  // =========================
  const handleBooking = () => {

    if (!service?._id) {

      toast.error('Service not found')

      return
    }

    bookingMutation.mutate({
      serviceId: service._id,
      date: selectedDate,
      timeSlot: selectedSlot,
      staffId:
        selectedStaffId ||
        staff?.[0]?._id,
      notes,
    })
  }

  const handleChat = () => {

    const stylistId =
      selectedStaffId ||
      staff?.[0]?._id

    if (!stylistId) {

      toast.error(
        'No stylist available'
      )

      return
    }

    navigate(`/chat/${stylistId}`)
  }

  // =========================
  // LOADING
  // =========================
  if (isServiceLoading) {

    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading...
      </div>
    )
  }

  // =========================
  // ERROR
  // =========================
  if (
    isServiceError ||
    !service?._id
  ) {

    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="rounded-3xl bg-red-50 p-8">

          <p className="font-bold">
            Service not found
          </p>

          <button
            onClick={() =>
              navigate('/services')
            }
            className="mt-4 rounded-xl bg-black px-4 py-2 text-white"
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
      className="min-h-screen pb-24"
    >

      <div className="px-4 pt-4">

        {/* BACK */}
        <button
          onClick={() => navigate(-1)}
          className="mb-4 text-pink-500"
        >
          ← Back
        </button>

        {/* MAIN */}
        <motion.div
          variants={itemVariants}
          className="rounded-3xl bg-white p-4 shadow-xl"
        >

          <img
            src={
              service?.images?.[0] ||
              'https://via.placeholder.com/600x400'
            }
            alt={service?.title}
            className="h-72 w-full rounded-3xl object-cover"
          />

          <h1 className="mt-6 text-4xl font-bold">
            {service?.title}
          </h1>

          <p className="mt-4 text-gray-600">
            {service?.description}
          </p>

          <div className="mt-6 text-3xl font-bold text-pink-500">
            ₹{service?.finalPrice || 0}
          </div>

          {/* BOOKING */}
          <div className="mt-8 rounded-3xl border p-5">

            <h2 className="text-xl font-bold">
              Book Appointment
            </h2>

            <div className="mt-4 space-y-4">

              <input
                type="date"
                min={format(
                  new Date(),
                  'yyyy-MM-dd'
                )}
                value={selectedDate}
                onChange={(e) =>
                  setSelectedDate(
                    e.target.value
                  )
                }
                className="w-full rounded-2xl border px-4 py-3"
              />

              <select
                value={selectedSlot}
                onChange={(e) =>
                  setSelectedSlot(
                    e.target.value
                  )
                }
                className="w-full rounded-2xl border px-4 py-3"
              >
                {slots.map((slot) => (
                  <option
                    key={slot}
                    value={slot}
                  >
                    {slot}
                  </option>
                ))}
              </select>

              <select
                value={selectedStaffId}
                onChange={(e) =>
                  setSelectedStaffId(
                    e.target.value
                  )
                }
                className="w-full rounded-2xl border px-4 py-3"
              >
                <option value="">
                  Any stylist
                </option>

                {staff.map((member) => (
                  <option
                    key={member._id}
                    value={member._id}
                  >
                    {member.name}
                  </option>
                ))}
              </select>

              <textarea
                rows={4}
                value={notes}
                onChange={(e) =>
                  setNotes(
                    e.target.value
                  )
                }
                placeholder="Notes..."
                className="w-full rounded-2xl border px-4 py-3"
              />

              <button
                onClick={handleChat}
                className="w-full rounded-2xl border border-pink-500 bg-pink-50 py-3 font-semibold text-pink-500"
              >
                Chat with stylist
              </button>

              <button
                onClick={handleBooking}
                className="w-full rounded-2xl bg-black py-3 font-semibold text-white"
              >
                Request Appointment
              </button>

            </div>
          </div>

          {/* REVIEWS */}
          <div className="mt-10 rounded-3xl border p-6">

            <div className="mt-8">

              <ReviewForm
                serviceId={id}
                isSubmitting={
                  createReviewMutation.isPending
                }
                onSubmit={(data) => {
                  createReviewMutation.mutate(
                    data
                  )
                }}
              />

            </div>

            <div className="mt-8">

              <ReviewsList
                reviews={reviews}
                isLoading={
                  isReviewsLoading
                }
              />

            </div>

            <div className="flex items-center justify-between">

              <div>

                <h2 className="text-2xl font-bold">
                  Customer Reviews
                </h2>

                <p className="mt-2 text-sm text-gray-500">
                  Real reviews from clients
                </p>

              </div>

              <RatingsSummary
                stats={reviewStats}
              />

            </div>

            <div className="mt-6">

              <FeaturedReviewsCarousel
                reviews={reviews}
              />

            </div>

          </div>

        </motion.div>

      </div>

      <BottomNav />

    </motion.div>
  )
}