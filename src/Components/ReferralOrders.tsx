import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import {
  FaBox,
  FaChevronLeft,
  FaChevronRight,
  FaImage,
  FaSearch,
  FaStore,
  FaUser,
  FaUsers,
} from 'react-icons/fa'
import { toast } from 'react-toastify'
import { orderApi } from '../Api/order.api'
import { formatDate } from '../utils/date.utils'

interface ReferralOrder {
  orderId: number
  sellerName: string
  sellerPhoneNo: string
  sellerLevel: number
  commission: number
  orderStatus: string
  products: Array<{
    name: string
    quantity: number
    image?: string
  }>
  createdAt?: string
}

interface PaginationState {
  currentPage: number
  totalPages: number
  totalOrders: number
  pageSize: number
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

const ReferralOrders = () => {
  const [orders, setOrders] = useState<ReferralOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [pagination, setPagination] = useState<PaginationState>({
    currentPage: 1,
    totalPages: 1,
    totalOrders: 0,
    pageSize: 10,
  })

  const fetchReferralOrders = async () => {
    try {
      setLoading(true)
      const response = await orderApi.getAllReferredOrdersForASeller({
        page: pagination.currentPage,
        limit: pagination.pageSize,
      })

      if (response.success) {
        setOrders(response.data.orders)
        setPagination({
          currentPage: response.data.currentPage,
          totalPages: response.data.totalPages,
          totalOrders: response.data.totalOrders,
          pageSize: response.data.pageSize,
        })
      } else {
        toast.error(response.message || 'রেফারেল অর্ডার লোড করতে সমস্যা হয়েছে')
      }
    } catch (error) {
      toast.error('একটি ত্রুটি ঘটেছে')
      console.error('Error fetching referral orders:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReferralOrders()
  }, [pagination.currentPage, pagination.pageSize])

  const getLevelBadge = (level: number) => {
    const baseClasses = 'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium'
    switch (level) {
      case 1:
        return <span className={`${baseClasses} bg-blue-100 text-blue-700`}>লেভেল ১</span>
      case 2:
        return <span className={`${baseClasses} bg-emerald-100 text-emerald-700`}>লেভেল ২</span>
      default:
        return <span className={`${baseClasses} bg-gray-100 text-gray-700`}>লেভেল {level}</span>
    }
  }

  const getStatusBadge = (status: string) => {
    const baseClasses = 'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium'
    const statusMap: Record<string, { label: string; color: string; bg: string }> = {
      UNPAID: { label: 'আনপেইড', color: 'text-amber-700', bg: 'bg-amber-100' },
      PAID: { label: 'পেইড', color: 'text-blue-700', bg: 'bg-blue-100' },
      CONFIRMED: { label: 'কনফার্মড', color: 'text-emerald-700', bg: 'bg-emerald-100' },
      PROCESSING: { label: 'প্রসেসিং', color: 'text-indigo-700', bg: 'bg-indigo-100' },
      DELIVERED: { label: 'ডেলিভারড', color: 'text-purple-700', bg: 'bg-purple-100' },
      COMPLETED: { label: 'কমপ্লিটেড', color: 'text-emerald-700', bg: 'bg-emerald-100' },
      CANCELLED: { label: 'বাতিল', color: 'text-rose-700', bg: 'bg-rose-100' },
      RETURNED: { label: 'ফেরত', color: 'text-orange-700', bg: 'bg-orange-100' },
      REJECTED: { label: 'রিজেক্টেড', color: 'text-rose-700', bg: 'bg-rose-100' },
      REFUNDED: { label: 'রিফান্ডেড', color: 'text-teal-700', bg: 'bg-teal-100' },
      FAILED: { label: 'ফেইলড', color: 'text-pink-700', bg: 'bg-pink-100' },
    }
    const config = statusMap[status] || { label: status, color: 'text-gray-700', bg: 'bg-gray-100' }
    return <span className={`${baseClasses} ${config.bg} ${config.color}`}>{config.label}</span>
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPagination(prev => ({ ...prev, currentPage: 1 }))
    fetchReferralOrders()
  }

  const filteredOrders = orders.filter(
    order =>
      order.sellerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.sellerPhoneNo.includes(searchQuery)
  )

  const renderPagination = () => {
    if (pagination.totalPages <= 1) return null

    const pages = []
    const maxVisible = 5
    let startPage = Math.max(1, pagination.currentPage - 2)
    let endPage = Math.min(pagination.totalPages, startPage + maxVisible - 1)

    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1)
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => setPagination(prev => ({ ...prev, currentPage: i }))}
          className={`w-8 h-8 text-sm rounded-lg transition-all ${
            pagination.currentPage === i
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
          onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
          disabled={pagination.currentPage === 1}
          className='p-2 text-gray-600 disabled:opacity-40 hover:bg-gray-100 rounded-lg transition-colors'
        >
          <FaChevronLeft className='h-4 w-4' />
        </button>
        <div className='flex gap-1'>
          {startPage > 1 && (
            <>
              <button
                onClick={() => setPagination(prev => ({ ...prev, currentPage: 1 }))}
                className='w-8 h-8 text-sm rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200'
              >
                1
              </button>
              {startPage > 2 && <span className='px-1 text-gray-400 text-sm'>...</span>}
            </>
          )}
          {pages}
          {endPage < pagination.totalPages && (
            <>
              {endPage < pagination.totalPages - 1 && (
                <span className='px-1 text-gray-400 text-sm'>...</span>
              )}
              <button
                onClick={() =>
                  setPagination(prev => ({ ...prev, currentPage: pagination.totalPages }))
                }
                className='w-8 h-8 text-sm rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200'
              >
                {pagination.totalPages}
              </button>
            </>
          )}
        </div>
        <button
          onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
          disabled={pagination.currentPage === pagination.totalPages}
          className='p-2 text-gray-600 disabled:opacity-40 hover:bg-gray-100 rounded-lg transition-colors'
        >
          <FaChevronRight className='h-4 w-4' />
        </button>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-[#f7f6f3] py-6 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-7xl mx-auto'>
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
              রেফারেল অর্ডারসমূহ
            </h1>
            <p className='text-gray-500 text-sm mt-1'>আপনার রেফারেল করা সেলারদের অর্ডার তালিকা</p>
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
                <h2 className='text-white font-semibold text-lg'>অর্ডার পরিসংখ্যান</h2>
                <p className='text-white/40 text-xs'>মোট রেফারেল অর্ডার</p>
              </div>
              <div className='h-12 w-12 rounded-xl bg-rose-500/20 flex items-center justify-center'>
                <span className='text-white text-xl font-bold'>{pagination.totalOrders}</span>
              </div>
            </div>
          </div>
          <div className='p-4 border-b border-gray-100'>
            <form onSubmit={handleSearch} className='flex gap-2'>
              <div className='relative flex-1'>
                <FaSearch className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400' />
                <input
                  type='text'
                  placeholder='সেলার নাম বা ফোন নম্বর দিয়ে খুঁজুন...'
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
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
          <div className='px-4 py-2 bg-gray-50/50 flex justify-between items-center text-xs text-gray-500'>
            <span>প্রতি পৃষ্ঠায়:</span>
            <select
              value={pagination.pageSize}
              onChange={e =>
                setPagination(prev => ({
                  ...prev,
                  pageSize: Number(e.target.value),
                  currentPage: 1,
                }))
              }
              className='border border-gray-200 rounded-lg px-2 py-1 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20'
            >
              <option value='5'>৫</option>
              <option value='10'>১০</option>
              <option value='20'>২০</option>
            </select>
          </div>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className='flex justify-center py-12'>
            <div className='animate-spin rounded-full h-8 w-8 border-2 border-rose-500 border-t-transparent' />
          </div>
        )}

        {/* No Data */}
        {!loading && filteredOrders.length === 0 && (
          <motion.div
            variants={fadeUp}
            className='bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center'
          >
            <div className='w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4'>
              <FaBox className='h-7 w-7 text-gray-400' />
            </div>
            <h3 className='text-lg font-semibold text-gray-800 mb-1'>কোন অর্ডার পাওয়া যায়নি</h3>
            <p className='text-sm text-gray-500'>
              {searchQuery
                ? 'আপনার অনুসন্ধানের সাথে মিলে এমন কোনো অর্ডার নেই'
                : 'এখনো কোনো রেফারেল অর্ডার নেই'}
            </p>
          </motion.div>
        )}

        {/* Orders List */}
        {!loading && filteredOrders.length > 0 && (
          <motion.div
            variants={staggerContainer}
            initial='hidden'
            animate='visible'
            className='space-y-4'
          >
            {/* Mobile Card View */}
            <div className='md:hidden space-y-3'>
              {filteredOrders.map(order => (
                <motion.div
                  key={order.orderId}
                  variants={fadeUp}
                  whileHover={{ y: -2 }}
                  className='bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-all'
                >
                  <div className='flex justify-between items-start mb-3'>
                    <div className='flex items-center gap-2'>
                      <div className='h-8 w-8 rounded-lg bg-rose-100 flex items-center justify-center'>
                        <FaUser className='h-4 w-4 text-rose-500' />
                      </div>
                      <div>
                        <h3 className='font-semibold text-gray-800 text-sm'>{order.sellerName}</h3>
                        <p className='text-xs text-gray-500'>{order.sellerPhoneNo}</p>
                      </div>
                    </div>
                    {getLevelBadge(order.sellerLevel)}
                  </div>

                  <div className='flex items-center gap-2 mb-2 text-xs text-gray-500'>
                    <FaStore className='h-3 w-3' />
                    <span>অর্ডার #{order.orderId}</span>
                    {order.createdAt && (
                      <>
                        <span className='w-px h-3 bg-gray-200' />
                        <span>{formatDate(order.createdAt)}</span>
                      </>
                    )}
                  </div>

                  <div className='mb-3'>{getStatusBadge(order.orderStatus)}</div>

                  <div className='space-y-2'>
                    <div className='flex items-center gap-2 text-xs font-medium text-gray-700'>
                      <FaBox className='h-3 w-3' />
                      <span>পণ্যসমূহ:</span>
                    </div>
                    {order.products.map((product, idx) => (
                      <div key={idx} className='flex items-center gap-2 pl-4'>
                        <div className='w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0'>
                          {product.image ? (
                            <img
                              src={product.image}
                              alt=''
                              className='w-full h-full object-cover'
                            />
                          ) : (
                            <FaImage className='h-3 w-3 text-gray-400' />
                          )}
                        </div>
                        <span className='text-xs text-gray-700'>
                          {product.name} ({product.quantity} টি)
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className='hidden md:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden'>
              <div className='overflow-x-auto'>
                <table className='w-full'>
                  <thead className='bg-gray-50 border-b border-gray-100'>
                    <tr>
                      <th className='px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        সেলার
                      </th>
                      <th className='px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        লেভেল
                      </th>
                      <th className='px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        অর্ডার আইডি
                      </th>
                      <th className='px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        পণ্য
                      </th>
                      <th className='px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        স্ট্যাটাস
                      </th>
                      <th className='px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        তারিখ
                      </th>
                    </tr>
                  </thead>
                  <tbody className='divide-y divide-gray-100'>
                    {filteredOrders.map(order => (
                      <tr key={order.orderId} className='hover:bg-gray-50/50 transition-colors'>
                        <td className='px-5 py-4'>
                          <div className='flex items-center gap-2'>
                            <div className='h-8 w-8 rounded-lg bg-rose-100 flex items-center justify-center'>
                              <FaUser className='h-4 w-4 text-rose-500' />
                            </div>
                            <div>
                              <div className='text-sm font-medium text-gray-800'>
                                {order.sellerName}
                              </div>
                              <div className='text-xs text-gray-400'>{order.sellerPhoneNo}</div>
                            </div>
                          </div>
                        </td>
                        <td className='px-5 py-4'>{getLevelBadge(order.sellerLevel)}</td>
                        <td className='px-5 py-4 text-sm text-gray-700'>#{order.orderId}</td>
                        <td className='px-5 py-4'>
                          <div className='flex flex-wrap gap-2'>
                            {order.products.map((product, idx) => (
                              <div
                                key={idx}
                                className='flex items-center gap-1 text-xs bg-gray-100 px-2 py-1 rounded-full'
                              >
                                {product.image ? (
                                  <img
                                    src={product.image}
                                    alt=''
                                    className='w-4 h-4 rounded object-cover'
                                  />
                                ) : (
                                  <FaImage className='h-3 w-3 text-gray-400' />
                                )}
                                <span className='text-gray-700'>
                                  {product.name} ({product.quantity})
                                </span>
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className='px-5 py-4'>{getStatusBadge(order.orderStatus)}</td>
                        <td className='px-5 py-4 text-sm text-gray-500'>
                          {order.createdAt ? formatDate(order.createdAt) : 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {renderPagination()}
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default ReferralOrders
