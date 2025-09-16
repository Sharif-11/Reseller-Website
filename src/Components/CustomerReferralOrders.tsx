import { useEffect, useState } from 'react'
import {
  FaBox,
  FaChevronLeft,
  FaChevronRight,
  FaCopy,
  FaImage,
  FaInfoCircle,
  FaMoneyBillAlt,
  FaSearch,
  FaShoppingBag,
  FaTimes,
  FaTruck,
  FaUser,
} from 'react-icons/fa'
import { toast } from 'react-toastify'
import { orderApi } from '../Api/order.api'
import { formatDate } from '../utils/date.utils'

interface CustomerOrder {
  orderId: number
  customerName: string
  customerPhoneNo: string
  actualCommission: string
  orderStatus: string
  createdAt?: string
  deliveryCharge: string
  totalProductSellingPrice: string
  cashOnAmount: string | null
  amountPaidByCustomer: string | null
  trackingUrl: string | null
  OrderProduct: Array<{
    productName: string
    productImage?: string
    productQuantity: number
  }>
}

interface PaginationState {
  currentPage: number
  totalPages: number
  totalOrders: number
  pageSize: number
}

const CustomerReferralOrders = () => {
  const [orders, setOrders] = useState<CustomerOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedOrder, setSelectedOrder] = useState<CustomerOrder | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const [pagination, setPagination] = useState<PaginationState>({
    currentPage: 1,
    totalPages: 1,
    totalOrders: 0,
    pageSize: 10,
  })

  const fetchCustomerOrders = async () => {
    try {
      setLoading(true)
      const response = await orderApi.getAllCustomerOrdersForASeller({
        page: pagination.currentPage,
        limit: pagination.pageSize,
        search: searchQuery || undefined,
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
        toast.error(response.message || 'কাস্টমার অর্ডার লোড করতে সমস্যা হয়েছে')
      }
    } catch (error) {
      toast.error('একটি ত্রুটি ঘটেছে')
      console.error('Error fetching customer orders:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCustomerOrders()
  }, [pagination.currentPage, pagination.pageSize, searchQuery])

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
    fetchCustomerOrders()
  }

  const openOrderDetails = (order: CustomerOrder) => {
    setSelectedOrder(order)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedOrder(null)
  }

  // Function to generate pagination buttons
  const renderPaginationButtons = () => {
    const buttons = []
    const maxVisibleButtons = 5

    let startPage = Math.max(1, pagination.currentPage - Math.floor(maxVisibleButtons / 2))
    let endPage = Math.min(pagination.totalPages, startPage + maxVisibleButtons - 1)

    if (endPage - startPage + 1 < maxVisibleButtons) {
      startPage = Math.max(1, endPage - maxVisibleButtons + 1)
    }

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => setPagination(prev => ({ ...prev, currentPage: i }))}
          className={`min-w-[2rem] px-2 py-1 text-sm rounded-md ${
            i === pagination.currentPage
              ? 'bg-blue-500 text-white'
              : 'bg-white text-gray-700 border border-gray-300'
          }`}
        >
          {i}
        </button>
      )
    }

    return buttons
  }

  return (
    <div className='p-4 max-w-6xl mx-auto'>
      <h1 className='text-xl font-bold mb-6'>কাস্টমার রেফারেল অর্ডারসমূহ</h1>

      {/* Search Section */}
      <div className='mb-6'>
        <form onSubmit={handleSearch} className='flex flex-col sm:flex-row gap-2'>
          <div className='relative flex-1'>
            <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
              <FaSearch className='text-gray-400' />
            </div>
            <input
              type='text'
              placeholder='কাস্টমার নাম বা ফোন নম্বর দিয়ে খুঁজুন...'
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
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4'>
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
      {!loading && orders.length === 0 && (
        <div className='bg-white rounded-lg shadow p-6 text-center'>
          <p className='text-gray-500'>কোন কাস্টমার অর্ডার পাওয়া যায়নি</p>
        </div>
      )}

      {!loading && orders.length > 0 && (
        <div className='bg-white rounded-lg shadow overflow-hidden'>
          {/* Mobile View - Always visible */}
          <div className='md:hidden space-y-3 p-3'>
            {orders.map(order => (
              <div key={order.orderId} className='border rounded-lg p-3'>
                <div className='flex justify-between items-start mb-3'>
                  <div className='flex items-center gap-2'>
                    <FaUser className='text-gray-400' />
                    <div>
                      <h3 className='font-medium text-sm'>{order.customerName}</h3>
                      <p className='text-xs text-gray-500'>{order.customerPhoneNo}</p>
                    </div>
                  </div>
                  {getStatusBadge(order.orderStatus)}
                </div>

                <div className='flex items-center gap-2 mb-3'>
                  <span className='text-xs text-gray-600'>অর্ডার #{order.orderId}</span>
                  {order.createdAt && (
                    <span className='text-xs text-gray-500'>{formatDate(order.createdAt)}</span>
                  )}
                </div>

                {/* Commission Display for Mobile */}
                <div className='flex items-center gap-2 mb-3 text-green-600'>
                  <FaMoneyBillAlt className='text-green-500' />
                  <span className='text-sm font-medium'>কমিশন: ৳{order.actualCommission}</span>
                </div>

                <div className='space-y-2'>
                  <div className='flex items-center gap-2'>
                    <FaBox className='text-gray-400' />
                    <span className='text-xs font-medium'>পণ্যসমূহ:</span>
                  </div>
                  {order.OrderProduct.map((product, index) => (
                    <div key={index} className='pl-6 flex items-center gap-2'>
                      {/* Product Image */}
                      {product.productImage ? (
                        <div className='w-8 h-8 flex-shrink-0 bg-gray-200 rounded-md overflow-hidden'>
                          <img
                            src={product.productImage}
                            alt={product.productName}
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
                        {product.productName} ({product.productQuantity} টি)
                      </p>
                    </div>
                  ))}
                </div>

                {/* Details Button for Mobile */}
                <div className='mt-3'>
                  <button
                    onClick={() => openOrderDetails(order)}
                    className='w-full flex items-center justify-center gap-2 bg-blue-50 text-blue-600 py-2 rounded-md text-sm font-medium hover:bg-blue-100'
                  >
                    <FaInfoCircle /> বিস্তারিত দেখুন
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Tablet and Desktop View */}
          <div className='hidden md:block overflow-x-auto'>
            <table className='min-w-full divide-y divide-gray-200'>
              <thead className='bg-gray-50'>
                <tr>
                  <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                    কাস্টমার
                  </th>
                  <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                    অর্ডার আইডি
                  </th>
                  <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                    পণ্য
                  </th>
                  <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                    কমিশন
                  </th>
                  <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                    স্ট্যাটাস
                  </th>
                  <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                    তারিখ
                  </th>
                  <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                    অপশন
                  </th>
                </tr>
              </thead>
              <tbody className='bg-white divide-y divide-gray-200'>
                {orders.map(order => (
                  <tr key={order.orderId} className='hover:bg-gray-50'>
                    <td className='px-4 py-3'>
                      <div className='flex items-center'>
                        <FaUser className='text-gray-400 mr-2' />
                        <div>
                          <div className='text-sm font-medium text-gray-900'>
                            {order.customerName}
                          </div>
                          <div className='text-sm text-gray-500'>{order.customerPhoneNo}</div>
                        </div>
                      </div>
                    </td>
                    <td className='px-4 py-3 text-sm text-gray-900'>#{order.orderId}</td>
                    <td className='px-4 py-3'>
                      <div className='space-y-2'>
                        {order.OrderProduct.map((product, index) => (
                          <div key={index} className='flex items-center gap-2'>
                            {/* Product Image */}
                            {product.productImage ? (
                              <div className='w-10 h-10 flex-shrink-0 bg-gray-200 rounded-md overflow-hidden'>
                                <img
                                  src={product.productImage}
                                  alt={product.productName}
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
                              <p className='text-sm text-gray-900 truncate'>
                                {product.productName}
                              </p>
                              <p className='text-xs text-gray-500'>{product.productQuantity} টি</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className='px-4 py-3'>
                      <div className='flex items-center text-green-600'>
                        <FaMoneyBillAlt className='mr-1 text-green-500' />
                        <span className='font-medium'>৳{order.actualCommission}</span>
                      </div>
                    </td>
                    <td className='px-4 py-3'>{getStatusBadge(order.orderStatus)}</td>
                    <td className='px-4 py-3 text-sm text-gray-500'>
                      {order.createdAt ? formatDate(order.createdAt) : 'N/A'}
                    </td>
                    <td className='px-4 py-3'>
                      <button
                        onClick={() => openOrderDetails(order)}
                        className='flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm'
                      >
                        <FaInfoCircle /> বিস্তারিত
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className='px-4 py-3 bg-gray-50 border-t border-gray-200'>
              {/* Mobile pagination */}
              <div className='flex flex-col items-center gap-4 sm:hidden'>
                <div className='text-sm text-gray-700'>
                  পৃষ্ঠা {pagination.currentPage} / {pagination.totalPages}
                </div>
                <div className='flex gap-2'>
                  <button
                    onClick={() =>
                      setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))
                    }
                    disabled={pagination.currentPage === 1}
                    className='p-2 rounded-md bg-white border border-gray-300 disabled:opacity-50'
                  >
                    <FaChevronLeft className='text-gray-600' />
                  </button>
                  <button
                    onClick={() =>
                      setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))
                    }
                    disabled={pagination.currentPage === pagination.totalPages}
                    className='p-2 rounded-md bg-white border border-gray-300 disabled:opacity-50'
                  >
                    <FaChevronRight className='text-gray-600' />
                  </button>
                </div>
              </div>

              {/* Desktop pagination */}
              <div className='hidden sm:flex sm:flex-1 sm:items-center sm:justify-between'>
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
                <div className='flex items-center gap-2'>
                  <button
                    onClick={() =>
                      setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))
                    }
                    disabled={pagination.currentPage === 1}
                    className='p-2 rounded-md bg-white border border-gray-300 disabled:opacity-50'
                  >
                    <FaChevronLeft className='text-gray-600' />
                  </button>

                  <div className='flex gap-1'>{renderPaginationButtons()}</div>

                  <button
                    onClick={() =>
                      setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))
                    }
                    disabled={pagination.currentPage === pagination.totalPages}
                    className='p-2 rounded-md bg-white border border-gray-300 disabled:opacity-50'
                  >
                    <FaChevronRight className='text-gray-600' />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Order Detail Modal */}
      {/* Order Detail Modal */}
      {/* Order Detail Modal */}
      {isModalOpen && selectedOrder && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center p-4 z-50 overflow-y-auto py-8'>
          <div className='bg-white rounded-lg w-full max-w-md my-8'>
            {/* Modal Header */}
            <div className='flex items-center justify-between p-4 border-b'>
              <h2 className='text-lg font-bold'>অর্ডার বিস্তারিত</h2>
              <button onClick={closeModal} className='text-gray-500 hover:text-gray-700 p-1'>
                <FaTimes />
              </button>
            </div>

            {/* Modal Body */}
            <div className='p-4 space-y-4'>
              {/* Customer Info */}
              <div className='space-y-2'>
                <h3 className='font-medium flex items-center gap-2'>
                  <FaUser className='text-blue-500' /> কাস্টমার তথ্য
                </h3>
                <div className='grid grid-cols-2 gap-2 text-sm'>
                  <div className='text-gray-600'>নাম:</div>
                  <div className='font-medium'>{selectedOrder.customerName}</div>

                  <div className='text-gray-600'>ফোন নম্বর:</div>
                  <div className='font-medium'>{selectedOrder.customerPhoneNo}</div>
                </div>
              </div>

              {/* Order Info */}
              <div className='space-y-2'>
                <h3 className='font-medium flex items-center gap-2'>
                  <FaShoppingBag className='text-blue-500' /> অর্ডার তথ্য
                </h3>
                <div className='grid grid-cols-2 gap-2 text-sm'>
                  <div className='text-gray-600'>অর্ডার আইডি:</div>
                  <div className='font-medium'>#{selectedOrder.orderId}</div>

                  <div className='text-gray-600'>স্ট্যাটাস:</div>
                  <div>{getStatusBadge(selectedOrder.orderStatus)}</div>

                  <div className='text-gray-600'>তারিখ:</div>
                  <div className='font-medium'>
                    {selectedOrder.createdAt ? formatDate(selectedOrder.createdAt) : 'N/A'}
                  </div>
                </div>
              </div>

              {/* Financial Info */}
              <div className='space-y-2'>
                <h3 className='font-medium flex items-center gap-2'>
                  <FaMoneyBillAlt className='text-blue-500' /> আর্থিক তথ্য
                </h3>
                <div className='grid grid-cols-2 gap-2 text-sm'>
                  <div className='text-gray-600'>মোট পণ্যমূল্য:</div>
                  <div className='font-medium'>৳{selectedOrder.totalProductSellingPrice}</div>

                  <div className='text-gray-600'>ডেলিভারি চার্জ:</div>
                  <div className='font-medium'>৳{selectedOrder.deliveryCharge}</div>

                  <div className='text-gray-600'>কমিশন:</div>
                  <div className='font-medium text-green-600'>
                    ৳{selectedOrder.actualCommission}
                  </div>

                  {selectedOrder.cashOnAmount && (
                    <>
                      <div className='text-gray-600'>ক্যাশ অন ডেলিভারি:</div>
                      <div className='font-medium'>৳{selectedOrder.cashOnAmount}</div>
                    </>
                  )}

                  {selectedOrder.amountPaidByCustomer && (
                    <>
                      <div className='text-gray-600'>গ্রাহক কর্তৃক প্রদত্ত:</div>
                      <div className='font-medium'>৳{selectedOrder.amountPaidByCustomer}</div>
                    </>
                  )}
                </div>
              </div>

              {/* Products */}
              <div className='space-y-2'>
                <h3 className='font-medium flex items-center gap-2'>
                  <FaBox className='text-blue-500' /> পণ্য তালিকা
                </h3>
                <div className='space-y-3'>
                  {selectedOrder.OrderProduct.map((product, index) => (
                    <div key={index} className='flex items-center gap-3 p-2 bg-gray-50 rounded-md'>
                      {product.productImage ? (
                        <div className='w-12 h-12 flex-shrink-0 bg-gray-200 rounded-md overflow-hidden'>
                          <img
                            src={product.productImage}
                            alt={product.productName}
                            className='w-full h-full object-cover'
                            onError={e => {
                              const target = e.target as HTMLImageElement
                              target.style.display = 'none'
                            }}
                          />
                        </div>
                      ) : (
                        <div className='w-12 h-12 flex-shrink-0 bg-gray-100 rounded-md flex items-center justify-center'>
                          <FaImage className='text-gray-400' />
                        </div>
                      )}
                      <div className='flex-1'>
                        <p className='text-sm font-medium'>{product.productName}</p>
                        <p className='text-xs text-gray-500'>{product.productQuantity} টি</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tracking Info */}
              {selectedOrder.trackingUrl && (
                <div className='space-y-2'>
                  <h3 className='font-medium flex items-center gap-2'>
                    <FaTruck className='text-blue-500' /> ট্র্যাকিং তথ্য
                  </h3>
                  <div className='flex items-center gap-2'>
                    <div className='flex-1 bg-gray-100 p-2 rounded text-sm break-all'>
                      {selectedOrder.trackingUrl}
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(selectedOrder.trackingUrl || '')
                        toast.success('ট্র্যাকিং লিংক কপি করা হয়েছে')
                      }}
                      className='p-2 bg-blue-500 text-white rounded hover:bg-blue-600'
                      title='কপি করুন'
                    >
                      <FaCopy />
                    </button>
                  </div>
                  <div className='text-xs text-gray-500 mt-1'>লিংকটি কপি করতে ক্লিক করুন</div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className='p-4 border-t'>
              <button
                onClick={closeModal}
                className='w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600'
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CustomerReferralOrders
