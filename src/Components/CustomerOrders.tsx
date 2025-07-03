import { useEffect, useState } from 'react'
import { FaComment, FaEye, FaMapMarkerAlt, FaMoneyBillWave, FaStore, FaUser } from 'react-icons/fa'
import { toast } from 'react-toastify'
import { orderApi } from '../Api/order.api'
import { walletApi } from '../Api/wallet.api'
import { formatDate } from '../utils/date.utils'

interface Order {
  orderId: number
  orderStatus:
    | 'UNPAID'
    | 'PAID'
    | 'CONFIRMED'
    | 'PROCESSING'
    | 'SHIPPED'
    | 'COMPLETED'
    | 'CANCELLED'
    | 'RETURNED'
    | 'REJECTED'
    | 'REFUNDED'
    | 'FAILED'
  createdAt: string
  updatedAt: string
  cancelled: boolean
  cancelledAt: string | null
  cancelledReason: string | null
  customerName: string
  customerPhoneNo: string
  customerZilla: string
  customerUpazilla: string
  customerAddress: string
  customerComments: string | null
  shopName: string
  shopLocation: string
  deliveryCharge: number
  sellerId: string
  sellerName: string
  sellerPhoneNo: string
  sellerVerified: boolean
  sellerShopName: string
  totalProductQuantity: number
  totalProductSellingPrice: number
  totalCommission: number
  actualCommission: number
  amountPaidByCustomer: number | null
  OrderProduct: OrderProduct[]
  paymentType?: string
  paymentVerified: boolean
  cashOnAmount: number | null
  trackingUrl: string | null
  Payment: {
    paymentId: string
    paymentDate: string
    paymentStatus: string
    processedAt: string | null
    userWalletName: string | null
    userWalletPhoneNo: string | null
    systemWalletName: string | null
    systemWalletPhoneNo: string | null
    amount: string | null
    transactionId: string | null
    transactionFee: string | null
    actualAmount: string | null
    userName: string | null
    userPhoneNo: string | null
    remarks: string | null
    orderId: number | null
  }
}

interface OrderProduct {
  orderProductId: number
  productId: number
  productName: string
  productImage: string
  productSellingPrice: number
  productQuantity: number
  productVariant: Record<string, string>
}

interface SystemWallet {
  walletName: string
  walletPhoneNo: string
  walletId: number
}

interface PaginationState {
  currentPage: number
  totalPages: number
  totalOrders: number
  pageSize: number
}

const CustomerOrders = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<{
    type: 'cancel' | 'payment' | null
    id: number | null
  }>({ type: null, id: null })
  const [searchQuery] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [showPhoneInput, setShowPhoneInput] = useState(true)
  const [systemWallets, setSystemWallets] = useState<SystemWallet[]>([])
  const [, setWalletLoading] = useState(false)

  const [pagination, setPagination] = useState<PaginationState>({
    currentPage: 1,
    totalPages: 1,
    totalOrders: 0,
    pageSize: 10,
  })

  const [activeTab, setActiveTab] = useState<'pending' | 'confirmed' | 'completed' | 'others'>(
    'pending'
  )
  const [selectedSystemWallet, setSelectedSystemWallet] = useState<SystemWallet | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [, setPaymentMethod] = useState<'BALANCE' | 'WALLET'>('BALANCE')
  const [customerWalletPhoneNo, setCustomerWalletPhoneNo] = useState('')
  const [transactionId, setTransactionId] = useState('')
  const [cancelReason, setCancelReason] = useState('')
  const [error, setError] = useState('')

  const fetchOrders = async () => {
    if (!phoneNumber) return
    setError('')

    try {
      setLoading(true)
      let statusParam = []

      if (activeTab === 'pending') {
        statusParam = ['UNPAID', 'PAID', 'FAILED']
      } else if (activeTab === 'confirmed') {
        statusParam = ['CONFIRMED', 'DELIVERED']
      } else if (activeTab === 'completed') {
        statusParam = ['COMPLETED']
      } else {
        statusParam = ['CANCELLED', 'RETURNED', 'REJECTED', 'REFUNDED']
      }

      const response = await orderApi.getCustomerOrders({
        phoneNo: phoneNumber,
        page: pagination.currentPage,
        limit: pagination.pageSize,
        search: searchQuery,
        orderStatus: statusParam,
      })

      if (response.success) {
        setOrders(response.data.orders)
        setPagination({
          currentPage: response.data.currentPage,
          totalPages: response.data.totalPages,
          totalOrders: response.data.totalOrders,
          pageSize: response.data.pageSize,
        })
        setShowPhoneInput(false)
      } else {
        toast.error(response.message || 'অর্ডার লোড করতে সমস্যা হয়েছে')
        setError(response.message || 'অর্ডার লোড করতে সমস্যা হয়েছে')
      }
    } catch (error) {
      toast.error('একটি ত্রুটি ঘটেছে')
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSystemWallets = async () => {
    try {
      setWalletLoading(true)
      const response = await walletApi.getSystemWallets()
      if (response.success) {
        setSystemWallets(response.data)
      } else {
        toast.error(response.message || 'ওয়ালেট লোড করতে সমস্যা হয়েছে')
      }
    } catch (error) {
      toast.error('ওয়ালেট লোড করতে সমস্যা হয়েছে')
      console.error('Error fetching system wallets:', error)
    } finally {
      setWalletLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [activeTab, pagination.currentPage, pagination.pageSize, searchQuery])

  useEffect(() => {
    if (showPaymentModal) {
      fetchSystemWallets()
    }
  }, [showPaymentModal])

  const handleCancelOrder = async () => {
    if (!selectedOrder || !cancelReason) return

    try {
      setActionLoading({ type: 'cancel', id: selectedOrder.orderId })
      setError('')
      const response = await orderApi.cancelOrderByCustomer({
        phoneNo: phoneNumber,
        orderId: selectedOrder.orderId,
        reason: cancelReason,
      })
      if (response.success) {
        toast.success('অর্ডার বাতিল করা হয়েছে')
        fetchOrders()
        setShowCancelModal(false)
        setCancelReason('')
      } else {
        setError(response.message || 'অর্ডার বাতিল করতে ব্যর্থ হয়েছে')
      }
    } catch (error) {
      setError('একটি ত্রুটি ঘটেছে')
      console.error('Error cancelling order:', error)
    } finally {
      setActionLoading({ type: null, id: null })
    }
  }

  const handlePayment = async () => {
    if (!selectedOrder) return
    if (!selectedSystemWallet) {
      setError('সিস্টেম ওয়ালেট নির্বাচন করুন')
      return
    }
    if (!customerWalletPhoneNo) {
      setError('গ্রাহক ওয়ালেট ফোন নম্বর দিন')
      return
    }
    if (!transactionId) {
      setError('ট্রানজেকশন আইডি দিন')
      return
    }

    try {
      setActionLoading({ type: 'payment', id: selectedOrder.orderId })
      setError('')

      const paymentData = {
        orderId: selectedOrder.orderId,
        customerWalletPhoneNo,
        systemWalletPhoneNo: selectedSystemWallet?.walletPhoneNo,
        transactionId,
        customerWalletName: selectedSystemWallet?.walletName || '',
        amount: selectedOrder.deliveryCharge,
      }

      const response = await orderApi.orderPaymentByCustomer(paymentData)

      if (response.success) {
        toast.success('পেমেন্ট সফল হয়েছে')
        fetchOrders()
        setShowPaymentModal(false)
        resetPaymentForm()
      } else {
        setError(response.message || 'পেমেন্ট করতে ব্যর্থ হয়েছে')
      }
    } catch (error) {
      setError('একটি ত্রুটি ঘটেছে')
      console.error('Error processing payment:', error)
    } finally {
      setActionLoading({ type: null, id: null })
    }
  }

  const resetPaymentForm = () => {
    setPaymentMethod('BALANCE')
    setSelectedSystemWallet(null)
    setCustomerWalletPhoneNo('')
    setTransactionId('')
    setError('')
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
      case 'SHIPPED':
        return <span className={`${baseClasses} bg-purple-100 text-purple-800`}>শিপড</span>
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

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!phoneNumber) {
      toast.error('ফোন নম্বর দিন')
      return
    }
    fetchOrders()
  }

  const renderActionButtons = (order: Order) => {
    return (
      <div className='flex gap-2'>
        <button
          onClick={() => {
            setSelectedOrder(order)
            setShowDetailModal(true)
          }}
          className='px-3 py-1 bg-gray-200 text-gray-800 rounded text-xs flex items-center gap-1'
        >
          <FaEye size={10} />
          বিস্তারিত
        </button>

        {['UNPAID', 'PAID', 'CONFIRMED'].includes(order.orderStatus) && !order.cancelled && (
          <>
            {order.orderStatus === 'UNPAID' && (
              <button
                onClick={() => {
                  setSelectedOrder(order)
                  setShowPaymentModal(true)
                }}
                disabled={actionLoading.type === 'payment' && actionLoading.id === order.orderId}
                className='px-3 py-1 bg-green-600 text-white rounded text-xs flex items-center gap-1'
              >
                {actionLoading.type === 'payment' && actionLoading.id === order.orderId ? (
                  'প্রক্রিয়াধীন...'
                ) : (
                  <>
                    <FaMoneyBillWave size={10} />
                    পেমেন্ট করুন
                  </>
                )}
              </button>
            )}
            <button
              onClick={() => {
                setSelectedOrder(order)
                setShowCancelModal(true)
              }}
              disabled={
                (actionLoading.type === 'cancel' && actionLoading.id === order.orderId) ||
                order.cancelled
              }
              className={`px-3 py-1 rounded text-xs ${
                order.cancelled
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-red-600 text-white hover:bg-red-700'
              }`}
            >
              {order.cancelled
                ? 'বাতিল করা হয়েছে'
                : actionLoading.type === 'cancel' && actionLoading.id === order.orderId
                ? 'প্রক্রিয়াধীন...'
                : 'বাতিল করুন'}
            </button>
          </>
        )}
      </div>
    )
  }

  return (
    <div className='p-4 max-w-6xl mx-auto'>
      <h1 className='text-xl font-bold mb-6'>আমার অর্ডারসমূহ</h1>

      {/* Phone Number Input */}
      {showPhoneInput && (
        <div className='bg-white rounded-lg shadow p-6 mb-6'>
          <form onSubmit={handlePhoneSubmit} className='space-y-4'>
            <div>
              <label htmlFor='phone' className='block text-sm font-medium text-gray-700 mb-1'>
                আপনার ফোন নম্বর দিন
              </label>
              <input
                type='tel'
                id='phone'
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500'
                placeholder='01XXXXXXXXX'
                value={phoneNumber}
                onChange={e => setPhoneNumber(e.target.value)}
                required
              />
            </div>
            <button
              type='submit'
              className='w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700'
            >
              অর্ডার খুঁজুন
            </button>
            {error && <p className='text-red-500 text-sm mt-2'>{error}</p>}
          </form>
        </div>
      )}

      {!showPhoneInput && (
        <>
          {/* Search Section */}

          {/* Tabs Section */}
          <div className='mb-4 sm:mb-6'>
            <div className='flex border-b overflow-x-auto scrollbar-hide'>
              <button
                className={`px-3 sm:px-4 py-2 text-xs sm:text-sm whitespace-nowrap transition-colors flex-shrink-0 ${
                  activeTab === 'pending'
                    ? 'text-blue-600 border-b-2 border-blue-600 font-medium'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('pending')}
              >
                পেন্ডিং (
                {orders.filter(o => ['UNPAID', 'PAID', 'FAILED'].includes(o.orderStatus)).length})
              </button>
              <button
                className={`px-3 sm:px-4 py-2 text-xs sm:text-sm whitespace-nowrap transition-colors flex-shrink-0 ${
                  activeTab === 'confirmed'
                    ? 'text-blue-600 border-b-2 border-blue-600 font-medium'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('confirmed')}
              >
                কনফার্মড
              </button>
              <button
                className={`px-3 sm:px-4 py-2 text-xs sm:text-sm whitespace-nowrap transition-colors flex-shrink-0 ${
                  activeTab === 'completed'
                    ? 'text-blue-600 border-b-2 border-blue-600 font-medium'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('completed')}
              >
                কমপ্লিটেড
              </button>
              <button
                className={`px-3 sm:px-4 py-2 text-xs sm:text-sm whitespace-nowrap transition-colors flex-shrink-0 ${
                  activeTab === 'others'
                    ? 'text-blue-600 border-b-2 border-blue-600 font-medium'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('others')}
              >
                অন্যান্য
              </button>
            </div>
          </div>

          {/* Page Size Selector */}
          <div className='flex justify-end mb-4'>
            <select
              value={pagination.pageSize}
              onChange={e =>
                setPagination(prev => ({
                  ...prev,
                  pageSize: Number(e.target.value),
                  currentPage: 1,
                }))
              }
              className='border border-gray-300 rounded-md px-2 py-1 text-sm bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500'
            >
              <option value='5'>৫টি অর্ডার</option>
              <option value='10'>১০টি অর্ডার</option>
              <option value='20'>২০টি অর্ডার</option>
            </select>
          </div>

          {/* Loading State */}
          {loading && (
            <div className='flex justify-center items-center h-64'>
              <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500'></div>
            </div>
          )}

          {/* Order List */}
          {!loading && orders.length === 0 && (
            <div className='bg-white rounded-lg shadow p-6 text-center'>
              <p className='text-gray-500'>কোন অর্ডার পাওয়া যায়নি</p>
            </div>
          )}

          {!loading && orders.length > 0 && (
            <div className='bg-white rounded-lg shadow overflow-hidden'>
              {/* Mobile View */}
              <div className='md:hidden space-y-3 p-3'>
                {orders.map(order => (
                  <div key={order.orderId} className='border rounded-lg p-3'>
                    <div className='flex justify-between items-start'>
                      <div>
                        <p className='text-xs text-gray-500'>{formatDate(order.createdAt)}</p>
                        <h3 className='font-medium'>অর্ডার #{order.orderId}</h3>
                        <p className='text-sm text-gray-600'>{order.sellerShopName}</p>
                      </div>
                      <div>{getStatusBadge(order.orderStatus)}</div>
                    </div>

                    <div className='mt-3 grid grid-cols-2 gap-2 text-sm'>
                      <div>
                        <p className='text-gray-500'>মোট মূল্য:</p>
                        <p className='font-medium'>{order.totalProductSellingPrice}৳</p>
                      </div>
                      <div>
                        <p className='text-gray-500'>ডেলিভারি চার্জ:</p>
                        <p className='font-medium'>{order.deliveryCharge}৳</p>
                      </div>
                    </div>

                    <div className='mt-3 flex justify-end'>{renderActionButtons(order)}</div>
                  </div>
                ))}
              </div>

              {/* Desktop View */}
              <table className='hidden md:table min-w-full divide-y divide-gray-200 overflow-x-scroll'>
                <thead className='bg-gray-50'>
                  <tr>
                    <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                      তারিখ
                    </th>
                    <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                      অর্ডার আইডি
                    </th>
                    <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                      দোকান
                    </th>
                    <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                      মোট মূল্য
                    </th>
                    <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                      স্ট্যাটাস
                    </th>
                    <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                      অ্যাকশন
                    </th>
                  </tr>
                </thead>
                <tbody className='bg-white divide-y divide-gray-200'>
                  {orders.map(order => (
                    <tr key={order.orderId} className='hover:bg-gray-50'>
                      <td className='px-4 py-3 whitespace-nowrap text-sm text-gray-500'>
                        {formatDate(order.createdAt)}
                      </td>
                      <td className='px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900'>
                        #{order.orderId}
                      </td>
                      <td className='px-4 py-3 whitespace-nowrap text-sm text-gray-900'>
                        <div>{order.sellerShopName}</div>
                        <div className='text-gray-500'>{order.shopLocation}</div>
                      </td>
                      <td className='px-4 py-3 whitespace-nowrap text-sm text-gray-900'>
                        {order.totalProductSellingPrice}৳
                      </td>
                      <td className='px-4 py-3 whitespace-nowrap'>
                        {getStatusBadge(order.orderStatus)}
                      </td>
                      <td className='px-4 py-3 whitespace-nowrap text-sm font-medium'>
                        {renderActionButtons(order)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className='px-4 py-3 bg-gray-50 flex items-center justify-between border-t border-gray-200'>
                  <div className='flex-1 flex justify-between sm:hidden'>
                    <button
                      onClick={() =>
                        setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))
                      }
                      disabled={pagination.currentPage === 1}
                      className='relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50'
                    >
                      পূর্ববর্তী
                    </button>
                    <button
                      onClick={() =>
                        setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))
                      }
                      disabled={pagination.currentPage === pagination.totalPages}
                      className='ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50'
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
                        এর মধ্যে <span className='font-medium'>{pagination.totalOrders}</span> টি
                        অর্ডার
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
                          className='relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50'
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
                              onClick={() =>
                                setPagination(prev => ({ ...prev, currentPage: pageNum }))
                              }
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
                          className='relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50'
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
        </>
      )}

      {/* Cancel Order Modal */}
      {showCancelModal && selectedOrder && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
          <div className='bg-white rounded-lg shadow-lg w-full max-w-md'>
            <div className='p-4 border-b'>
              <h2 className='text-lg font-medium text-red-600'>অর্ডার বাতিল করুন</h2>
            </div>
            <div className='p-4'>
              <p className='mb-4'>
                আপনি কি নিশ্চিতভাবে অর্ডার #{selectedOrder.orderId} বাতিল করতে চান?
              </p>
              <div className='mb-4'>
                <label className='block text-sm font-medium text-gray-700 mb-1'>কারণ</label>
                <textarea
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500'
                  rows={3}
                  placeholder='বাতিল করার কারণ লিখুন...'
                  value={cancelReason}
                  onChange={e => setCancelReason(e.target.value)}
                  required
                ></textarea>
              </div>
              {error && <p className='text-red-500 text-sm mt-2'>{error}</p>}
            </div>
            <div className='p-4 border-t flex justify-end gap-3'>
              <button
                onClick={() => {
                  setShowCancelModal(false)
                  setCancelReason('')
                  setError('')
                }}
                className='px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200'
              >
                বাদ দিন
              </button>
              <button
                onClick={handleCancelOrder}
                disabled={
                  actionLoading.type === 'cancel' && actionLoading.id === selectedOrder.orderId
                }
                className='px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50'
              >
                {actionLoading.type === 'cancel' && actionLoading.id === selectedOrder.orderId
                  ? 'প্রক্রিয়াধীন...'
                  : 'বাতিল করুন'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {/* Payment Modal - Delivery Charge Only */}
      {/* Payment Modal - Mobile First Responsive */}
      {showPaymentModal && selectedOrder && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50'>
          <div className='bg-white rounded-lg shadow-xl w-full max-w-md mx-2 sm:mx-auto'>
            {/* Header */}
            <div className='p-3 sm:p-4 border-b'>
              <h2 className='text-base sm:text-lg font-medium text-center'>
                ডেলিভারি চার্জ পেমেন্ট <br className='sm:hidden' />
                (অর্ডার #{selectedOrder.orderId})
              </h2>
            </div>

            {/* Content */}
            <div className='p-3 sm:p-4 space-y-3 sm:space-y-4'>
              {/* Payment Notice */}
              <div className='bg-blue-50 border-l-4 border-blue-400 p-2 sm:p-3'>
                <div className='flex items-start'>
                  <div className='flex-shrink-0 pt-0.5'>
                    <span className='text-blue-500 text-sm sm:text-base'>!</span>
                  </div>
                  <div className='ml-2'>
                    <p className='text-xs sm:text-sm text-blue-700'>
                      দয়া করে নিচের ওয়ালেটে ডেলিভারি চার্জ পাঠান এবং ট্রানজেকশন আইডি দিন
                    </p>
                  </div>
                </div>
              </div>

              {/* Delivery Charge Info */}
              <div className='bg-gray-50 p-3 sm:p-4 rounded-lg'>
                <div className='flex justify-between items-center'>
                  <div>
                    <p className='text-sm sm:text-base font-medium'>ডেলিভারি চার্জ</p>
                    <p className='text-xs sm:text-sm text-gray-500'>
                      অর্ডার গ্রহণের জন্য প্রয়োজনীয়
                    </p>
                  </div>
                  <p className='text-base sm:text-lg font-bold text-green-600'>
                    {selectedOrder.deliveryCharge}৳
                  </p>
                </div>
              </div>

              {/* System Wallet Selection */}
              <div>
                <label className='block text-xs sm:text-sm font-medium text-gray-700 mb-1'>
                  সিস্টেম ওয়ালেট
                </label>
                <select
                  className='w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500'
                  value={selectedSystemWallet?.walletId || ''}
                  onChange={e => {
                    const walletId = parseInt(e.target.value)
                    const wallet = systemWallets.find(w => w.walletId === walletId)
                    setSelectedSystemWallet(wallet || null)
                  }}
                  required
                >
                  <option value=''>ওয়ালেট সিলেক্ট করুন</option>
                  {systemWallets.map(wallet => (
                    <option key={wallet.walletId} value={wallet.walletId}>
                      {wallet.walletName} ({wallet.walletPhoneNo})
                    </option>
                  ))}
                </select>
              </div>

              {/* Customer Wallet Number */}
              <div>
                <label className='block text-xs sm:text-sm font-medium text-gray-700 mb-1'>
                  আপনার {selectedSystemWallet?.walletName || 'ওয়ালেট'} নম্বর
                </label>
                <input
                  type='text'
                  className='w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500'
                  placeholder='ওয়ালেট ফোন নম্বর'
                  value={customerWalletPhoneNo}
                  onChange={e => setCustomerWalletPhoneNo(e.target.value)}
                  required
                />
              </div>

              {/* Transaction ID */}
              <div>
                <label className='block text-xs sm:text-sm font-medium text-gray-700 mb-1'>
                  ট্রানজেকশন আইডি
                </label>
                <input
                  type='text'
                  className='w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500'
                  placeholder='ট্রানজেকশন আইডি'
                  value={transactionId}
                  onChange={e => setTransactionId(e.target.value)}
                  required
                />
              </div>

              {error && (
                <div className='p-2 text-xs sm:text-sm bg-red-50 text-red-600 rounded'>{error}</div>
              )}
            </div>

            {/* Footer - Mobile responsive buttons */}
            <div className='p-3 sm:p-4 border-t flex flex-col sm:flex-row justify-between gap-2 sm:gap-3'>
              <button
                onClick={() => {
                  setShowPaymentModal(false)
                  resetPaymentForm()
                }}
                className='px-4 py-2 text-xs sm:text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200'
              >
                বাতিল করুন
              </button>
              <button
                onClick={handlePayment}
                disabled={
                  actionLoading.type === 'payment' && actionLoading.id === selectedOrder.orderId
                }
                className='px-4 py-2 text-xs sm:text-sm bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50'
              >
                {actionLoading.type === 'payment' && actionLoading.id === selectedOrder.orderId
                  ? 'প্রক্রিয়াধীন...'
                  : 'পেমেন্ট সম্পন্ন করুন'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      {showDetailModal && selectedOrder && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center p-2 sm:p-4 pt-[100px] md:p-8 z-50 overflow-y-auto'>
          <div className='bg-white rounded-lg shadow-lg w-full max-w-full sm:max-w-2xl md:max-w-4xl max-h-[90vh] md:max-h-[95vh] overflow-y-auto'>
            {/* Header - Sticky */}
            <div className='p-3 sm:p-4 border-b sticky top-0 bg-white z-10'>
              <div className='flex justify-between items-start gap-2'>
                <div>
                  <h2 className='text-lg sm:text-xl font-bold'>
                    অর্ডার #{selectedOrder.orderId}
                    {selectedOrder.cancelled && (
                      <span className='text-red-500 ml-1 sm:ml-2 text-xs block sm:inline-block mt-1 sm:mt-0'>
                        এই অর্ডারটি বাতিল হয়েছে
                      </span>
                    )}
                  </h2>
                </div>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className='text-gray-500 hover:text-gray-700 mt-1'
                >
                  <svg
                    className='h-5 w-5 sm:h-6 sm:w-6'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M6 18L18 6M6 6l12 12'
                    />
                  </svg>
                </button>
              </div>
              <div className='mt-2 flex items-center gap-2 flex-wrap'>
                {getStatusBadge(selectedOrder.orderStatus)}
                <span className='text-xs sm:text-sm text-gray-500'>
                  {formatDate(selectedOrder.createdAt)}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className='p-3 sm:p-4 space-y-3 sm:space-y-4'>
              {/* Customer and Shop Info */}
              <div className='bg-gray-50 p-3 sm:p-4 rounded-lg space-y-2'>
                <div className='flex items-center gap-2'>
                  <FaUser className='text-gray-600 text-sm sm:text-base' />
                  <p className='font-medium text-sm sm:text-base'>
                    {selectedOrder.customerName} ({selectedOrder.customerPhoneNo})
                  </p>
                </div>

                <p className='text-gray-600 text-xs sm:text-sm ml-6'>
                  {selectedOrder.customerUpazilla}, {selectedOrder.customerZilla}
                </p>

                <div className='flex items-start gap-2 ml-6'>
                  <FaMapMarkerAlt className='text-gray-400 mt-0.5 sm:mt-1 flex-shrink-0 text-xs sm:text-sm' />
                  <p className='text-xs sm:text-sm'>{selectedOrder.customerAddress}</p>
                </div>

                {selectedOrder.customerComments && (
                  <div className='flex items-start gap-2 ml-6'>
                    <FaComment className='text-gray-400 mt-0.5 sm:mt-1 flex-shrink-0 text-xs sm:text-sm' />
                    <p className='text-gray-600 text-xs sm:text-sm'>
                      {selectedOrder.customerComments}
                    </p>
                  </div>
                )}

                <div className='border-t pt-2'></div>

                <div className='flex items-center gap-2'>
                  <FaStore className='text-gray-600 text-sm sm:text-base' />
                  <p className='font-medium text-sm sm:text-base'>
                    {selectedOrder.shopName}
                    <span className='text-gray-600 ml-1 sm:ml-2'>{selectedOrder.shopLocation}</span>
                  </p>
                </div>
              </div>

              {/* Tracking URL */}
              {selectedOrder.trackingUrl && (
                <div className='bg-gray-50 p-3 sm:p-4 rounded-lg'>
                  <h3 className='font-medium text-base sm:text-lg mb-2 sm:mb-3'>ট্র্যাকিং লিঙ্ক</h3>
                  <div className='flex flex-col sm:flex-row gap-2 items-start sm:items-center'>
                    <div className='flex-1 bg-white p-1 sm:p-2 rounded border border-gray-200 overflow-hidden'>
                      <p className='text-xs sm:text-sm text-blue-600 truncate'>
                        <a
                          href={selectedOrder.trackingUrl}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='hover:underline break-all'
                        >
                          {selectedOrder.trackingUrl}
                        </a>
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(selectedOrder.trackingUrl || '')
                        toast.success('লিঙ্ক কপি করা হয়েছে')
                      }}
                      className='px-2 sm:px-3 py-1 sm:py-1.5 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 text-xs sm:text-sm flex items-center gap-1 whitespace-nowrap'
                    >
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        className='h-3 w-3 sm:h-4 sm:w-4'
                        fill='none'
                        viewBox='0 0 24 24'
                        stroke='currentColor'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3'
                        />
                      </svg>
                      কপি করুন
                    </button>
                  </div>
                </div>
              )}

              {/* Product Information */}
              <div className='bg-gray-50 p-3 sm:p-4 rounded-lg'>
                <h3 className='font-medium text-base sm:text-lg mb-2 sm:mb-3'>পণ্য তালিকা</h3>
                <div className='space-y-3 sm:space-y-4'>
                  {selectedOrder.OrderProduct.map(product => (
                    <div
                      key={product.orderProductId}
                      className='border-b pb-3 sm:pb-4 last:border-0'
                    >
                      <div className='flex gap-3 sm:gap-4'>
                        <div className='w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 rounded-md overflow-hidden'>
                          <img
                            src={product.productImage}
                            alt={product.productName}
                            className='w-full h-full object-cover'
                          />
                        </div>
                        <div className='flex-1'>
                          <h4 className='font-medium text-sm sm:text-base'>
                            {product.productName}
                          </h4>
                          <p className='text-xs sm:text-sm text-gray-600'>
                            {product.productSellingPrice}৳ × {product.productQuantity} টি
                          </p>
                          {product.productVariant &&
                            Object.entries(product.productVariant).length > 0 && (
                              <div className='mt-1'>
                                {Object.entries(product.productVariant).map(([key, value]) => (
                                  <p key={key} className='text-2xs sm:text-xs text-gray-500'>
                                    {key}: {value}
                                  </p>
                                ))}
                              </div>
                            )}
                        </div>
                        <div className='text-right'>
                          <p className='font-medium text-sm sm:text-base'>
                            {product.productSellingPrice * product.productQuantity}৳
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment and Summary */}
              <div className='grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4'>
                {/* Payment Information */}
                {selectedOrder.Payment && (
                  <div className='bg-gray-50 p-3 sm:p-4 rounded-lg'>
                    <h3 className='font-medium text-base sm:text-lg mb-2 sm:mb-3'>পেমেন্ট তথ্য</h3>
                    <div className='space-y-2 sm:space-y-3'>
                      <div className='flex justify-between text-xs sm:text-sm'>
                        <p className='text-gray-600'>পেমেন্ট পদ্ধতি</p>
                        <p className='font-medium'>
                          {selectedOrder.paymentType === 'BALANCE'
                            ? 'ব্যালেন্স'
                            : selectedOrder.paymentType === 'WALLET'
                            ? 'ওয়ালেট'
                            : 'N/A'}
                        </p>
                      </div>

                      <div className='flex justify-between text-xs sm:text-sm'>
                        <p className='text-gray-600'>স্ট্যাটাস</p>
                        <p
                          className={`font-medium ${
                            selectedOrder.Payment.paymentStatus === 'PENDING'
                              ? 'text-yellow-600'
                              : selectedOrder.Payment.paymentStatus === 'COMPLETED'
                              ? 'text-green-600'
                              : selectedOrder.Payment.paymentStatus === 'REJECTED'
                              ? 'text-red-600'
                              : ''
                          }`}
                        >
                          {selectedOrder.Payment.paymentStatus === 'PENDING'
                            ? 'পেন্ডিং'
                            : selectedOrder.Payment.paymentStatus === 'COMPLETED'
                            ? 'কমপ্লিটেড'
                            : selectedOrder.Payment.paymentStatus === 'REJECTED'
                            ? 'রিজেক্টেড'
                            : selectedOrder.Payment.paymentStatus}
                        </p>
                      </div>

                      {selectedOrder.paymentType === 'WALLET' && (
                        <>
                          <div className='flex justify-between text-xs sm:text-sm'>
                            <p className='text-gray-600'>সিস্টেম ওয়ালেট</p>
                            <p className='font-medium'>
                              {selectedOrder.Payment.systemWalletName || 'N/A'} (
                              {selectedOrder.Payment.systemWalletPhoneNo || 'N/A'})
                            </p>
                          </div>
                          <div className='flex justify-between text-xs sm:text-sm'>
                            <p className='text-gray-600'>আপনার ওয়ালেট</p>
                            <p className='font-medium'>
                              {selectedOrder.Payment.userWalletName || 'N/A'} (
                              {selectedOrder.Payment.userWalletPhoneNo || 'N/A'})
                            </p>
                          </div>
                          <div className='flex justify-between text-xs sm:text-sm'>
                            <p className='text-gray-600'>ট্রানজেকশন আইডি</p>
                            <p className='font-medium'>
                              {selectedOrder.Payment.transactionId || 'N/A'}
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Summary */}
                <div className='bg-gray-50 p-3 sm:p-4 rounded-lg'>
                  <div className='space-y-1 sm:space-y-2'>
                    <div className='flex justify-between text-xs sm:text-sm'>
                      <p className='text-gray-600'>পণ্যের মূল্য</p>
                      <p className='font-medium'>{selectedOrder.totalProductSellingPrice}৳</p>
                    </div>
                    <div className='flex justify-between text-xs sm:text-sm'>
                      <p className='text-gray-600'>ডেলিভারি চার্জ</p>
                      <p className='font-medium'>{selectedOrder.deliveryCharge}৳</p>
                    </div>
                    {selectedOrder.cashOnAmount && (
                      <div className='border-t pt-1 sm:pt-2 mt-1 sm:mt-2 flex justify-between font-bold text-xs sm:text-sm'>
                        <p>ক্যাশ অন ডেলিভারি অ্যামাউন্ট</p>
                        <p>{selectedOrder.cashOnAmount}৳</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className='p-3 sm:p-4 border-t flex justify-end'>
              <button
                onClick={() => setShowDetailModal(false)}
                className='px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-xs sm:text-sm'
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

export default CustomerOrders
