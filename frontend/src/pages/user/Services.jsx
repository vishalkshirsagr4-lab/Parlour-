import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { containerVariants } from '../../animations/variants'

import { serviceAPI } from '../../api/endpoints'
import BottomNav from '../../components/BottomNav'

export default function Services() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [searchText, setSearchText] = useState('')

  const categoryId =
    searchParams.get('category') || ''

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () =>
      serviceAPI
        .getCategories()
        .then((res) => res.data),
  })

  const {
    data: services,
    isLoading,
  } = useQuery({
    queryKey: [
      'services',
      categoryId,
      searchText,
    ],
    queryFn: () =>
      serviceAPI
        .getServices({
          categoryId,
          search: searchText,
        })
        .then((res) => res.data),
    keepPreviousData: true,
  })

  const handleCategory = (id) => {
    if (categoryId === id) {
      setSearchParams({})
      return
    }

    setSearchParams({
      category: id,
    })
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      className="min-h-screen bg-[#fafafa] pb-24"
    >
      <div className="px-4 pt-4">

        {/* HEADER */}
        <div className="mb-6">

          <h1 className="text-3xl md:text-4xl font-black text-black">
            Discover Luxury Services
          </h1>

          <p className="mt-2 text-gray-600 leading-relaxed">
            Browse curated beauty treatments and
            book premium salon experiences.
          </p>

        </div>

        {/* SEARCH */}
        <div className="mb-5">

          <input
            type="search"
            value={searchText}
            onChange={(e) =>
              setSearchText(e.target.value)
            }
            placeholder="Search bridal makeup, facial, hair spa..."
            className="
              w-full
              rounded-2xl
              border
              border-gray-200
              bg-white
              px-5
              py-4
              shadow-sm
              focus:outline-none
              focus:ring-2
              focus:ring-pink-400
              text-black
              placeholder:text-gray-400
            "
          />

        </div>

        {/* CATEGORIES */}
        <div className="mb-6 overflow-x-auto scrollbar-hide">

          <div className="flex gap-3 w-max pb-2">

            {categories?.map((category) => (

              <button
                key={category._id}
                onClick={() =>
                  handleCategory(category._id)
                }
                className={`
                  px-5
                  py-2.5
                  rounded-full
                  whitespace-nowrap
                  font-semibold
                  transition-all
                  duration-300
                  ${
                    categoryId === category._id
                      ? 'bg-black text-white shadow-lg'
                      : 'bg-white text-gray-700 border border-gray-200 hover:border-black'
                  }
                `}
              >
                {category.name}
              </button>

            ))}

          </div>

        </div>

        {/* SERVICES */}
        <div className="space-y-5">

          {(isLoading
            ? Array.from({ length: 4 })
            : services || []
          ).map((service, index) => (

            <motion.button
              key={service?._id ?? index}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.99 }}
              onClick={() =>
                service?._id &&
                navigate(
                  `/services/${service._id}`
                )
              }
              className="
                w-full
                bg-white
                rounded-[2rem]
                shadow-md
                hover:shadow-2xl
                transition-all
                duration-300
                overflow-hidden
                border
                border-gray-100
                text-left
              "
            >

              {service ? (

                <div
                  className="
                    grid
                    gap-4
                    grid-cols-1
                    sm:grid-cols-[120px_1fr]
                    md:grid-cols-[140px_1fr]
                    p-4
                  "
                >

                  {/* IMAGE */}
                  <div
                    className="
                      relative
                      overflow-hidden
                      rounded-[1.5rem]
                      bg-gray-100
                    "
                  >

                    <img
                      src={
                        service.images?.[0] ||
                        'https://via.placeholder.com/500x500?text=Salon'
                      }
                      alt={service.title}
                      className="
                        w-full
                        h-56
                        sm:h-32
                        md:h-40
                        object-cover
                        object-center
                        hover:scale-105
                        transition-transform
                        duration-500
                      "
                    />

                    {/* DISCOUNT */}
                    {service.discount > 0 && (

                      <div
                        className="
                          absolute
                          top-3
                          left-3
                          bg-black
                          text-white
                          text-xs
                          font-bold
                          px-3
                          py-1
                          rounded-full
                          shadow-lg
                        "
                      >
                        {service.discount}% OFF
                      </div>

                    )}

                  </div>

                  {/* CONTENT */}
                  <div className="min-w-0 flex flex-col justify-between">

                    <div>

                      {/* CATEGORY */}
                      <p
                        className="
                          text-xs
                          uppercase
                          tracking-[0.25em]
                          text-pink-500
                          font-bold
                        "
                      >
                        {service.category?.name ||
                          'Luxury Beauty'}
                      </p>

                      {/* TITLE */}
                      <h2
                        className="
                          mt-2
                          text-2xl
                          font-black
                          text-black
                          line-clamp-2
                        "
                      >
                        {service.title}
                      </h2>

                      {/* DESCRIPTION */}
                      <p
                        className="
                          mt-2
                          text-sm
                          text-gray-600
                          leading-relaxed
                          line-clamp-2
                        "
                      >
                        {service.description}
                      </p>

                    </div>

                    {/* FOOTER */}
                    <div
                      className="
                        mt-5
                        flex
                        flex-wrap
                        items-center
                        justify-between
                        gap-3
                      "
                    >

                      {/* PRICE */}
                      <div className="flex items-center gap-2">

                        <span
                          className="
                            text-2xl
                            font-black
                            text-black
                          "
                        >
                          ₹{service.finalPrice}
                        </span>

                        {service.price &&
                          service.discount > 0 && (

                            <span
                              className="
                                text-sm
                                text-gray-400
                                line-through
                              "
                            >
                              ₹{service.price}
                            </span>

                          )}

                      </div>

                      {/* BADGES */}
                      <div className="flex flex-wrap gap-2">

                        <span
                          className="
                            bg-pink-50
                            text-pink-600
                            text-xs
                            font-semibold
                            px-3
                            py-1
                            rounded-full
                          "
                        >
                          {service.duration} mins
                        </span>

                        <span
                          className="
                            bg-gray-100
                            text-gray-700
                            text-xs
                            font-semibold
                            px-3
                            py-1
                            rounded-full
                          "
                        >
                          Premium
                        </span>

                      </div>

                    </div>

                  </div>

                </div>

              ) : (

                <div className="p-4">

                  <div
                    className="
                      h-64
                      rounded-[2rem]
                      bg-gray-100
                      animate-pulse
                    "
                  />

                </div>

              )}

            </motion.button>

          ))}

        </div>

      </div>

      <BottomNav />

    </motion.div>
  )
}