import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import {
  FaChevronLeft,
  FaChevronRight,
  FaMapMarkerAlt,
  FaPhone,
  FaSearch,
  FaUser,
  FaUsers,
} from 'react-icons/fa'
import { userApi } from '../Api/user.api'

export interface Seller {
  userId: string
  name: string
  phoneNo: string
  zilla: string | null
  upazilla: string | null
  address: string | null
  level: number
  createdAt: string
  referrerName: string
}

export interface ReferredSellersResponse {
  sellers: Seller[]
  totalCount: number
  totalPages: number
  currentPage: number
  levelCount: Record<number, number>
}

// Animation variants
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.1 },
  },
}

const ReferredSellers = () => {
  const [sellers, setSellers] = useState<Seller[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [levelCounts, setLevelCounts] = useState<Record<number, number>>({})
  const level = 2

  const limit = 10

  useEffect(() => {
    fetchReferredSellers()
  }, [currentPage])

  const fetchReferredSellers = async () => {
    try {
      setLoading(true)
      const response = await userApi.getReferredSellersByLevel({
        level,
        page: currentPage,
        limit,
        search: searchTerm,
      })

      if (response.data) {
        setSellers(response.data.sellers)
        setTotalPages(response.data.totalPages)
        setLevelCounts(response.data.levelCount || {})
        setTotalCount(response.data.totalCount)
      }
    } catch (err) {
      setError('ডেটা লোড করতে সমস্যা হয়েছে')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchReferredSellers()
  }

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('bn-BD', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const renderLevelCounts = () => {
    if (Object.keys(levelCounts).length === 0) return null

    return (
      <div className='flex flex-wrap gap-2 mt-2'>
        {Object.entries(levelCounts).map(([lvl, count]) => (
          <div key={lvl} className='bg-rose-50 px-3 py-1.5 rounded-full flex items-center gap-1.5'>
            <FaUsers className='h-3 w-3 text-rose-500' />
            <span className='text-xs font-medium text-rose-700'>
              লেভেল {lvl}: {count} জন
            </span>
          </div>
        ))}
      </div>
    )
  }

  const renderPagination = () => {
    if (totalPages <= 1) return null

    const pages = []
    const maxVisible = 5
    let startPage = Math.max(1, currentPage - 2)
    let endPage = Math.min(totalPages, startPage + maxVisible - 1)

    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1)
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`w-8 h-8 text-sm rounded-lg transition-all ${
            currentPage === i
              ? 'bg-rose-500 text-white shadow-sm'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {i}
        </button>
      )
    }

    return (
      <div className='flex items-center justify-center gap-2 mt-6'>
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className='p-2 text-gray-600 disabled:opacity-40 hover:bg-gray-100 rounded-lg transition-colors'
        >
          <FaChevronLeft className='h-4 w-4' />
        </button>
        <div className='flex gap-1'>
          {startPage > 1 && (
            <>
              <button
                onClick={() => handlePageChange(1)}
                className='w-8 h-8 text-sm rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200'
              >
                1
              </button>
              {startPage > 2 && <span className='px-1 text-gray-400 text-sm'>...</span>}
            </>
          )}
          {pages}
          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && <span className='px-1 text-gray-400 text-sm'>...</span>}
              <button
                onClick={() => handlePageChange(totalPages)}
                className='w-8 h-8 text-sm rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200'
              >
                {totalPages}
              </button>
            </>
          )}
        </div>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className='p-2 text-gray-600 disabled:opacity-40 hover:bg-gray-100 rounded-lg transition-colors'
        >
          <FaChevronRight className='h-4 w-4' />
        </button>
      </div>
    )
  }

  if (loading && sellers.length === 0) {
    return (
      <div className='min-h-screen bg-[#f7f6f3] flex justify-center items-center py-12'>
        <div className='animate-spin rounded-full h-8 w-8 border-2 border-rose-500 border-t-transparent' />
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-[#f7f6f3] py-6 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-4xl mx-auto'>
        {/* Header */}
        <motion.div initial='hidden' animate='visible' variants={staggerContainer} className='mb-6'>
          <motion.div variants={fadeUp}>
            <div className='flex items-center gap-2 mb-1'>
              <div className='h-8 w-1 rounded-full bg-rose-500' />
              <span className='text-rose-500 text-sm font-semibold uppercase tracking-wider'>
                রেফারেল
              </span>
            </div>
            <h1 className='text-2xl md:text-3xl font-bold text-[#1a1a2e] flex items-center gap-2'>
              <FaUsers className='text-rose-500 h-6 w-6 md:h-7 md:w-7' />
              রেফার্ড সেলার
            </h1>
            <p className='text-gray-500 text-sm mt-1'>আপনার রেফারেল করা সেলারদের তালিকা</p>
          </motion.div>
        </motion.div>

        {/* Stats & Search Card */}
        <motion.div
          variants={fadeUp}
          className='bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6'
        >
          <div className='bg-gradient-to-r from-[#1a1a2e] to-[#16213e] px-5 py-4'>
            <div className='flex items-center justify-between'>
              <div>
                <h2 className='text-white font-semibold text-lg'>রেফারেল পরিসংখ্যান</h2>
                <p className='text-white/40 text-xs'>মোট রেফার্ড সেলার</p>
              </div>
              <div className='h-12 w-12 rounded-xl bg-rose-500/20 flex items-center justify-center'>
                <span className='text-white text-xl font-bold'>{totalCount}</span>
              </div>
            </div>
          </div>
          <div className='p-4 border-b border-gray-100'>{renderLevelCounts()}</div>
          <div className='p-4'>
            <form onSubmit={handleSearch} className='flex gap-2'>
              <div className='relative flex-1'>
                <FaSearch className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400' />
                <input
                  type='text'
                  placeholder='নাম বা ফোন নম্বর দিয়ে খুঁজুন...'
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className='w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400 transition-all'
                />
              </div>
              <button
                type='submit'
                className='px-5 py-2.5 bg-rose-500 text-white rounded-xl text-sm font-medium hover:bg-rose-600 transition-all shadow-sm'
              >
                খুঁজুন
              </button>
            </form>
          </div>
        </motion.div>

        {/* Error Alert */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className='mb-5 p-4 bg-rose-50 rounded-xl border border-rose-100'
          >
            <p className='text-rose-600 text-sm'>{error}</p>
          </motion.div>
        )}

        {/* Sellers List */}
        {sellers.length === 0 && !loading ? (
          <motion.div
            variants={fadeUp}
            className='bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center'
          >
            <div className='w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4'>
              <FaUsers className='h-7 w-7 text-gray-400' />
            </div>
            <h3 className='text-lg font-semibold text-gray-800 mb-1'>কোন সেলার পাওয়া যায়নি</h3>
            <p className='text-sm text-gray-500'>
              {searchTerm
                ? 'আপনার অনুসন্ধানের সাথে মিলে এমন কোনো সেলার নেই'
                : 'এখনো কোনো রেফার্ড সেলার নেই'}
            </p>
          </motion.div>
        ) : (
          <motion.div
            variants={staggerContainer}
            initial='hidden'
            animate='visible'
            className='space-y-3'
          >
            {sellers.map(seller => (
              <motion.div
                key={seller.userId}
                variants={fadeUp}
                whileHover={{ y: -2 }}
                className='bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-all'
              >
                <div className='flex items-start gap-3'>
                  {/* Avatar */}
                  <div className='h-10 w-10 rounded-xl bg-gradient-to-br from-rose-500 to-rose-600 flex items-center justify-center flex-shrink-0 shadow-sm'>
                    <span className='text-white font-semibold text-sm'>
                      {seller.name?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>

                  {/* Details */}
                  <div className='flex-1 min-w-0'>
                    <div className='flex flex-wrap items-start justify-between gap-2 mb-1'>
                      <h3 className='font-semibold text-gray-800 text-sm truncate'>
                        {seller.name}
                      </h3>
                      <span className='inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-700'>
                        <FaUser className='h-2.5 w-2.5' />
                        লেভেল {seller.level}
                      </span>
                    </div>

                    {/* Phone */}
                    <div className='flex items-center gap-1 text-xs text-gray-500 mb-1'>
                      <FaPhone className='h-3 w-3 text-gray-400' />
                      <span>{seller.phoneNo}</span>
                    </div>

                    {/* Referrer Info */}
                    {seller.referrerName && seller.level > 1 && (
                      <p className='text-xs text-gray-400 mb-1'>
                        রেফার্ড বাই: {seller.referrerName}
                      </p>
                    )}

                    {/* Location */}
                    {(seller.zilla || seller.upazilla) && (
                      <div className='flex items-center gap-1 text-xs text-gray-400 mt-1'>
                        <FaMapMarkerAlt className='h-3 w-3' />
                        <span className='truncate'>
                          {[seller.zilla, seller.upazilla].filter(Boolean).join(', ')}
                        </span>
                      </div>
                    )}

                    {/* Address (optional) */}
                    {seller.address && (
                      <p className='text-xs text-gray-400 mt-0.5 line-clamp-1'>{seller.address}</p>
                    )}

                    {/* Date */}
                    <p className='text-xs text-gray-400 mt-1'>
                      যোগদান: {formatDate(seller.createdAt)}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Pagination */}
            {totalPages > 1 && <div className='mt-4 pt-2'>{renderPagination()}</div>}
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default ReferredSellers
