import { useEffect, useState } from 'react'
import { FaBox, FaImage, FaSearch, FaStore, FaUser } from 'react-icons/fa'
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
    const baseClasses = 'px-2 py-1 rounded-full text-xs font-medium'

    switch (level) {
      case 1:
        return <span className={`${baseClasses} bg-blue-100 text-blue-800`}>লেভেল ১</span>
      case 2:
        return <span className={`${baseClasses} bg-green-100 text-green-800`}>লেভেল ২</span>
      default:
        return <span className={`${baseClasses} bg-gray-100 text-gray-800`}>লেভেল {level}</span>
    }
  }

  const getStatusBadge = (status: string) => {
    const baseClasses = 'px-2 py-1 rounded-full text-xs font-medium'

    switch (status) {
      case 'UNPAID':
        return <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>আনপেইড</span>
      case 'PAID':
        return <span className={`${baseClasses} bg-blue-100 text-blue-800`}>পেইড</span>
      case 'CONFIRMED':
        return <span className={`${baseClasses} bg-green-100 text-green-800`}>কনফার্মড</span>
      case 'PROCESSING':
        return <span className={`${baseClasses} bg-indigo-100 text-indigo-800`}>প্রসেসিং</span>
      case 'DELIVERED':
        return <span className={`${baseClasses} bg-purple-100 text-purple-800`}>ডেলিভারড</span>
      case 'COMPLETED':
        return <span className={`${baseClasses} bg-green-100 text-green-800`}>কমপ্লিটেড</span>
      case 'CANCELLED':
        return <span className={`${baseClasses} bg-red-100 text-red-800`}>বাতিল</span>
      case 'RETURNED':
        return <span className={`${baseClasses} bg-orange-100 text-orange-800`}>ফেরত</span>
      case 'REJECTED':
        return <span className={`${baseClasses} bg-red-100 text-red-800`}>রিজেক্টেড</span>
      case 'REFUNDED':
        return <span className={`${baseClasses} bg-teal-100 text-teal-800`}>রিফান্ডেড</span>
      case 'FAILED':
        return <span className={`${baseClasses} bg-pink-100 text-pink-800`}>ফেইলড</span>
      default:
        return <span className={`${baseClasses} bg-gray-100 text-gray-800`}>{status}</span>
    }
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

  return (
    <div className='p-4 max-w-6xl mx-auto'>
      <h1 className='text-xl font-bold mb-6'>রেফারেল অর্ডারসমূহ</h1>

      {/* Search Section - Mobile First */}
      <div className='mb-6'>
        <form onSubmit={handleSearch} className='flex flex-col sm:flex-row gap-2'>
          <div className='relative flex-1'>
            <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
              <FaSearch className='text-gray-400' />
            </div>
            <input
              type='text'
              placeholder='সেলার নাম বা ফোন নম্বর দিয়ে খুঁজুন...'
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className='w-full border border-gray-300 rounded-md pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs'
            />
          </div>
          <button
            type='submit'
            className='bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500'
          >
            খুঁজুন
          </button>
        </form>
      </div>

      {/* Page Size Selector and Total Orders */}
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2'>
        <p className='text-sm text-gray-600'>মোট অর্ডার: {pagination.totalOrders}</p>
        <div className='flex items-center gap-2'>
          <label htmlFor='pageSize' className='text-sm text-gray-600 whitespace-nowrap'>
            প্রতি পৃষ্ঠায়:
          </label>
          <select
            id='pageSize'
            value={pagination.pageSize}
            onChange={e =>
              setPagination(prev => ({ ...prev, pageSize: Number(e.target.value), currentPage: 1 }))
            }
            className='border border-gray-300 rounded-md px-2 py-1 text-sm bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500'
          >
            <option value='5'>৫</option>
            <option value='10'>১০</option>
            <option value='20'>২০</option>
          </select>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className='flex justify-center items-center h-64'>
          <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500'></div>
        </div>
      )}

      {/* Orders List */}
      {!loading && filteredOrders.length === 0 && (
        <div className='bg-white rounded-lg shadow p-6 text-center'>
          <p className='text-gray-500'>কোন রেফারেল অর্ডার পাওয়া যায়নি</p>
        </div>
      )}

      {!loading && filteredOrders.length > 0 && (
        <div className='bg-white rounded-lg shadow overflow-hidden'>
          {/* Mobile View - Always visible */}
          <div className='md:hidden space-y-3 p-3'>
            {filteredOrders.map(order => (
              <div key={order.orderId} className='border rounded-lg p-3'>
                <div className='flex justify-between items-start mb-3'>
                  <div className='flex items-center gap-2'>
                    <FaUser className='text-gray-400' />
                    <div>
                      <h3 className='font-medium text-sm'>{order.sellerName}</h3>
                      <p className='text-xs text-gray-500'>{order.sellerPhoneNo}</p>
                    </div>
                  </div>
                  {getLevelBadge(order.sellerLevel)}
                </div>

                <div className='flex items-center gap-2 mb-3'>
                  <FaStore className='text-gray-400' />
                  <span className='text-xs text-gray-600'>অর্ডার #{order.orderId}</span>
                  {order.createdAt && (
                    <span className='text-xs text-gray-500'>{formatDate(order.createdAt)}</span>
                  )}
                </div>

                {/* Status Display for Mobile */}
                <div className='mb-3'>{getStatusBadge(order.orderStatus)}</div>

                {/* Commission Display for Mobile */}

                <div className='space-y-2'>
                  <div className='flex items-center gap-2'>
                    <FaBox className='text-gray-400' />
                    <span className='text-xs font-medium'>পণ্যসমূহ:</span>
                  </div>
                  {order.products.map((product, index) => (
                    <div key={index} className='pl-6 flex items-center gap-2'>
                      {/* Product Image */}
                      {product.image ? (
                        <div className='w-8 h-8 flex-shrink-0 bg-gray-200 rounded-md overflow-hidden'>
                          <img
                            src={product.image}
                            alt={product.name}
                            className='w-full h-full object-cover'
                            onError={e => {
                              const target = e.target as HTMLImageElement
                              target.style.display = 'none'
                            }}
                          />
                        </div>
                      ) : (
                        <div className='w-8 h-8 flex-shrink-0 bg-gray-100 rounded-md flex items-center justify-center'>
                          <FaImage className='text-gray-400 text-xs' />
                        </div>
                      )}
                      <p className='text-xs text-gray-700'>
                        {product.name} ({product.quantity} টি)
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Tablet View (md) */}
          <div className='hidden md:block lg:hidden'>
            {filteredOrders.map(order => (
              <div key={order.orderId} className='border-b p-4 last:border-b-0'>
                <div className='grid grid-cols-2 gap-4 mb-3'>
                  <div>
                    <div className='flex items-center gap-2 mb-1'>
                      <FaUser className='text-gray-400' />
                      <span className='font-medium'>{order.sellerName}</span>
                    </div>
                    <div className='text-sm text-gray-500 pl-6'>{order.sellerPhoneNo}</div>
                  </div>

                  <div className='flex justify-between items-start'>
                    <div>
                      <div className='text-sm mb-1'>অর্ডার #{order.orderId}</div>
                      {order.createdAt && (
                        <div className='text-xs text-gray-500'>{formatDate(order.createdAt)}</div>
                      )}
                    </div>
                    {getLevelBadge(order.sellerLevel)}
                  </div>
                </div>

                <div className='mb-2 text-sm font-medium flex items-center gap-2'>
                  <FaBox className='text-gray-400' />
                  <span>পণ্যসমূহ:</span>
                </div>

                <div className='space-y-2'>
                  {order.products.map((product, index) => (
                    <div key={index} className='flex items-center gap-2 pl-4'>
                      {product.image ? (
                        <div className='w-10 h-10 flex-shrink-0 bg-gray-200 rounded-md overflow-hidden'>
                          <img
                            src={product.image}
                            alt={product.name}
                            className='w-full h-full object-cover'
                            onError={e => {
                              const target = e.target as HTMLImageElement
                              target.style.display = 'none'
                            }}
                          />
                        </div>
                      ) : (
                        <div className='w-10 h-10 flex-shrink-0 bg-gray-100 rounded-md flex items-center justify-center'>
                          <FaImage className='text-gray-400' />
                        </div>
                      )}
                      <div className='flex-1 min-w-0'>
                        <p className='text-sm text-gray-900 truncate'>{product.name}</p>
                        <p className='text-xs text-gray-500'>{product.quantity} টি</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Desktop View (lg+) */}
          <table className='hidden lg:table min-w-full divide-y divide-gray-200'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                  সেলার
                </th>
                <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                  লেভেল
                </th>
                <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                  অর্ডার আইডি
                </th>
                <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                  পণ্য
                </th>

                <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                  স্ট্যাটাস
                </th>
                <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                  তারিখ
                </th>
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-gray-200'>
              {filteredOrders.map(order => (
                <tr key={order.orderId} className='hover:bg-gray-50'>
                  <td className='px-4 py-3'>
                    <div className='flex items-center'>
                      <FaUser className='text-gray-400 mr-2' />
                      <div>
                        <div className='text-sm font-medium text-gray-900'>{order.sellerName}</div>
                        <div className='text-sm text-gray-500'>{order.sellerPhoneNo}</div>
                      </div>
                    </div>
                  </td>
                  <td className='px-4 py-3'>{getLevelBadge(order.sellerLevel)}</td>
                  <td className='px-4 py-3 text-sm text-gray-900'>#{order.orderId}</td>
                  <td className='px-4 py-3'>
                    <div className='space-y-2'>
                      {order.products.map((product, index) => (
                        <div key={index} className='flex items-center gap-2'>
                          {/* Product Image */}
                          {product.image ? (
                            <div className='w-10 h-10 flex-shrink-0 bg-gray-200 rounded-md overflow-hidden'>
                              <img
                                src={product.image}
                                alt={product.name}
                                className='w-full h-full object-cover'
                                onError={e => {
                                  const target = e.target as HTMLImageElement
                                  target.style.display = 'none'
                                }}
                              />
                            </div>
                          ) : (
                            <div className='w-10 h-10 flex-shrink-0 bg-gray-100 rounded-md flex items-center justify-center'>
                              <FaImage className='text-gray-400' />
                            </div>
                          )}
                          <div className='flex-1 min-w-0'>
                            <p className='text-sm text-gray-900 truncate'>{product.name}</p>
                            <p className='text-xs text-gray-500'>{product.quantity} টি</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </td>

                  <td className='px-4 py-3'>{getStatusBadge(order.orderStatus)}</td>
                  <td className='px-4 py-3 text-sm text-gray-500'>
                    {order.createdAt ? formatDate(order.createdAt) : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination - Responsive */}
          {pagination.totalPages > 1 && (
            <div className='px-4 py-3 bg-gray-50 flex items-center justify-between border-t border-gray-200'>
              <div className='flex flex-col xs:flex-row xs:justify-between w-full sm:hidden gap-2'>
                <button
                  onClick={() =>
                    setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))
                  }
                  disabled={pagination.currentPage === 1}
                  className='relative inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  পূর্ববর্তী
                </button>
                <div className='text-center text-sm text-gray-700'>
                  পৃষ্ঠা {pagination.currentPage} / {pagination.totalPages}
                </div>
                <button
                  onClick={() =>
                    setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))
                  }
                  disabled={pagination.currentPage === pagination.totalPages}
                  className='relative inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  পরবর্তী
                </button>
              </div>

              <div className='hidden sm:flex-1 sm:flex sm:items-center sm:justify-between'>
                <div>
                  <p className='text-sm text-gray-700'>
                    দেখানো হচ্ছে{' '}
                    <span className='font-medium'>
                      {(pagination.currentPage - 1) * pagination.pageSize + 1}
                    </span>{' '}
                    থেকে{' '}
                    <span className='font-medium'>
                      {Math.min(
                        pagination.currentPage * pagination.pageSize,
                        pagination.totalOrders
                      )}
                    </span>{' '}
                    এর মধ্যে <span className='font-medium'>{pagination.totalOrders}</span> টি অর্ডার
                  </p>
                </div>
                <div>
                  <nav
                    className='relative z-0 inline-flex rounded-md shadow-sm -space-x-px'
                    aria-label='Pagination'
                  >
                    <button
                      onClick={() =>
                        setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))
                      }
                      disabled={pagination.currentPage === 1}
                      className='relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
                    >
                      <span className='sr-only'>পূর্ববর্তী</span>
                      <svg
                        className='h-5 w-5'
                        xmlns='http://www.w3.org/2000/svg'
                        viewBox='0 0 20 20'
                        fill='currentColor'
                        aria-hidden='true'
                      >
                        <path
                          fillRule='evenodd'
                          d='M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z'
                          clipRule='evenodd'
                        />
                      </svg>
                    </button>
                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                      let pageNum
                      if (pagination.totalPages <= 5) {
                        pageNum = i + 1
                      } else if (pagination.currentPage <= 3) {
                        pageNum = i + 1
                      } else if (pagination.currentPage >= pagination.totalPages - 2) {
                        pageNum = pagination.totalPages - 4 + i
                      } else {
                        pageNum = pagination.currentPage - 2 + i
                      }
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPagination(prev => ({ ...prev, currentPage: pageNum }))}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            pageNum === pagination.currentPage
                              ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      )
                    })}
                    <button
                      onClick={() =>
                        setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))
                      }
                      disabled={pagination.currentPage === pagination.totalPages}
                      className='relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
                    >
                      <span className='sr-only'>পরবর্তী</span>
                      <svg
                        className='h-5 w-5'
                        xmlns='http://www.w3.org/2000/svg'
                        viewBox='0 0 20 20'
                        fill='currentColor'
                        aria-hidden='true'
                      >
                        <path
                          fillRule='evenodd'
                          d='M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z'
                          clipRule='evenodd'
                        />
                      </svg>
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default ReferralOrders
