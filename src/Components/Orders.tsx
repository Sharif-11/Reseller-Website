import { useEffect, useState } from 'react'
import {
  FaComment,
  FaEye,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaRedo,
  FaSearch,
  FaStore,
  FaUser,
} from 'react-icons/fa'
import { useLocation } from 'react-router-dom'
import { toast } from 'react-toastify'
import { orderApi } from '../Api/order.api'
import { walletApi } from '../Api/wallet.api'
import { useAuth } from '../Hooks/useAuth'
import { formatDate } from '../utils/date.utils'
import { formatUrl } from '../utils/url.utils'

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
  sellerBalance: string
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

const Orders = () => {
  const { user, reloadUser } = useAuth()
  const location = useLocation()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<{
    type: 'cancel' | 'confirm' | 'reorder' | 'payment' | null
    id: number | null
  }>({ type: null, id: null })
  const [searchQuery, setSearchQuery] = useState('')
  const [systemWallets, setSystemWallets] = useState<SystemWallet[]>([])
  const [walletLoading, setWalletLoading] = useState(false)

  const [pagination, setPagination] = useState<PaginationState>({
    currentPage: 1,
    totalPages: 1,
    totalOrders: 0,
    pageSize: 10,
  })

  const [activeTab, setActiveTab] = useState<'pending' | 'confirmed' | 'completed' | 'others'>(
    location?.state?.tab || 'pending'
  )
  const [selectedSystemWallet, setSelectedSystemWallet] = useState<SystemWallet | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'BALANCE' | 'WALLET'>('BALANCE')
  const [sellerWalletPhoneNo, setSellerWalletPhoneNo] = useState('')
  const [transactionId, setTransactionId] = useState('')
  const [cancelReason, setCancelReason] = useState('')
  const [error, setError] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [savedWallets, setSavedWallets] = useState<SystemWallet[]>([
    // These would come from your backend or local storage
    // ... other saved wallets
  ])

  const fetchOrders = async () => {
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

      const response = await orderApi.getSellerOrders({
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
      } else {
        toast.error(response.message || 'অর্ডার লোড করতে সমস্যা হয়েছে')
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
  const fetchSellersWallets = async () => {
    try {
      setWalletLoading(true)
      const response = await walletApi.getWalletsOfASeller(user?.phoneNo!)
      if (response.success) {
        setSavedWallets(response.data)
      } else {
        toast.error(response.message || 'ওয়ালেট লোড করতে সমস্যা হয়েছে')
      }
    } catch (error) {
      toast.error('ওয়ালেট লোড করতে সমস্যা হয়েছে')
      console.error('Error fetching sellers wallets:', error)
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
  useEffect(() => {
    reloadUser()
    fetchSellersWallets()
  }, [])

  const handleConfirmOrder = async (orderId: number) => {
    try {
      setActionLoading({ type: 'confirm', id: orderId })

      const response = await orderApi.confirmOrderBySeller(orderId)
      if (response.success) {
        toast.success('অর্ডার নিশ্চিত করা হয়েছে')
        fetchOrders()
        setShowPaymentModal(false)
      } else {
        setError(response.message || 'অর্ডার নিশ্চিত করতে ব্যর্থ হয়েছে')
      }
    } catch (error) {
      setError('একটি ত্রুটি ঘটেছে')
      console.error('Error confirming order:', error)
    } finally {
      setActionLoading({ type: null, id: null })
    }
  }

  const handleCancelOrder = async () => {
    if (!selectedOrder || !cancelReason) return

    try {
      setActionLoading({ type: 'cancel', id: selectedOrder.orderId })
      setError('')
      const response = await orderApi.cancelOrderBySeller({
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

    try {
      setActionLoading({ type: 'payment', id: selectedOrder.orderId })
      setError('')

      const paymentData = {
        orderId: selectedOrder.orderId,
        paymentMethod,
        ...(paymentMethod === 'WALLET' && {
          sellerWalletPhoneNo,
          systemWalletPhoneNo: selectedSystemWallet?.walletPhoneNo,
          transactionId,
          sellerWalletName: selectedSystemWallet?.walletName || '',
          amount: selectedOrder.deliveryCharge || 0,
        }),
      }

      const response = await orderApi.orderPaymentBySeller(paymentData)
      // await reloadUser() // Reload user data after payment

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
    setSellerWalletPhoneNo('')
    setTransactionId('')
    setError('')
  }

  const handleReorder = async (orderId: number) => {
    try {
      setActionLoading({ type: 'reorder', id: orderId })
      const response = await orderApi.reorderFailedOrderBySeller(orderId)
      if (response.success) {
        toast.success('পুনরায় অর্ডার করা হয়েছে')
        fetchOrders()
      } else {
        toast.error(response.message || 'পুনরায় অর্ডার করতে ব্যর্থ হয়েছে')
      }
    } catch (error) {
      toast.error('একটি ত্রুটি ঘটেছে')
      console.error('Error reordering:', error)
    } finally {
      setActionLoading({ type: null, id: null })
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

        {['UNPAID', 'PAID'].includes(order.orderStatus) && !order.cancelled && (
          <>
            {order.orderStatus === 'UNPAID' && (
              <button
                onClick={() => {
                  setSelectedOrder(order)
                  setShowPaymentModal(true)
                }}
                disabled={
                  (actionLoading.type === 'confirm' && actionLoading.id === order.orderId) ||
                  order.cancelled
                }
                className='px-3 py-1 bg-green-600 text-white rounded text-xs flex items-center gap-1'
              >
                {actionLoading.type === 'confirm' && actionLoading.id === order.orderId ? (
                  'প্রক্রিয়াধীন...'
                ) : (
                  <>
                    <FaMoneyBillWave size={10} />
                    {order.sellerVerified ? 'কনফার্ম করুন' : 'পেমেন্ট করুন'}
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

        {order.orderStatus === 'FAILED' && (
          <button
            onClick={() => handleReorder(order.orderId)}
            disabled={actionLoading.type === 'reorder' && actionLoading.id === order.orderId}
            className='px-3 py-1 bg-blue-600 text-white rounded text-xs flex items-center gap-1'
          >
            <FaRedo size={10} />
            {actionLoading.type === 'reorder' && actionLoading.id === order.orderId
              ? 'প্রক্রিয়াধীন...'
              : 'পুনরায় অর্ডার করুন'}
          </button>
        )}
      </div>
    )
  }

  useEffect(() => {
    reloadUser()
  }, [showPaymentModal])

  return (
    <div className='p-4 max-w-6xl mx-auto'>
      <h1 className='text-xl font-bold mb-6'>আমার অর্ডারসমূহ</h1>

      {/* সার্চ বার */}
      {/* Search Section */}
      <div className='mb-4 sm:mb-6'>
        <div className='relative'>
          <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
            <FaSearch className='text-gray-400 h-4 w-4' />
          </div>
          <input
            type='text'
            placeholder='কাস্টমারের নাম বা ফোন নম্বর দিয়ে খুঁজুন...'
            className='block w-full pl-10 pr-3 py-3 sm:py-2 border border-gray-300 rounded-lg sm:rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-xs md:text-sm'
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Tabs Section - Responsive */}
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
            setPagination(prev => ({ ...prev, pageSize: Number(e.target.value), currentPage: 1 }))
          }
          className='border border-gray-300 rounded-md px-2 py-1 text-sm bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500'
        >
          <option value='5'>৫টি অর্ডার</option>
          <option value='10'>১০টি অর্ডার</option>
          <option value='20'>২০টি অর্ডার</option>
        </select>
      </div>

      {/* লোডিং স্টেট */}
      {loading && (
        <div className='flex justify-center items-center h-64'>
          <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500'></div>
        </div>
      )}

      {/* অর্ডার লিস্ট */}
      {!loading && orders.length === 0 && (
        <div className='bg-white rounded-lg shadow p-6 text-center'>
          <p className='text-gray-500'>কোন অর্ডার পাওয়া যায়নি</p>
        </div>
      )}

      {!loading && orders.length > 0 && (
        <div className='bg-white rounded-lg shadow overflow-hidden'>
          {/* মোবাইল ভিউ */}
          <div className='md:hidden space-y-3 p-3'>
            {orders.map(order => (
              <div key={order.orderId} className='border rounded-lg p-3'>
                <div className='flex justify-between items-start'>
                  <div>
                    <p className='text-xs text-gray-500'>{formatDate(order.createdAt)}</p>
                    <h3 className='font-medium'>অর্ডার #{order.orderId}</h3>
                    <p className='text-sm text-gray-600'>{order.customerName}</p>
                    <p className='text-xs text-gray-500'>{order.customerPhoneNo}</p>
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
                  <div>
                    <p className='text-gray-500'>পণ্য সংখ্যা:</p>
                    <p className='font-medium'>{order.totalProductQuantity} টি</p>
                  </div>
                  <div>
                    <p className='text-gray-500'>কমিশন:</p>
                    <p className='font-medium'>{order.totalCommission}৳</p>
                  </div>
                </div>

                <div className='mt-3 flex justify-end'>{renderActionButtons(order)}</div>
              </div>
            ))}
          </div>

          {/* ডেস্কটপ ভিউ */}
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
                  কাস্টমার
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
                    <div>{order.customerName}</div>
                    <div className='text-gray-500'>{order.customerPhoneNo}</div>
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

          {/* পেজিনেশন */}
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

      {/* বাতিল করার মোডাল */}
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

      {/* পেমেন্ট মোডাল */}
      {showPaymentModal && selectedOrder && (
        <div className='fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto mt-8'>
          <div className='min-h-screen py-4 px-4 mt-4 flex items-start justify-center'>
            <div className='bg-white rounded-lg shadow-xl w-full max-w-md my-4 flex flex-col'>
              {/* Header */}
              <div className='p-4 border-b flex-shrink-0 bg-gradient-to-r from-green-50 to-blue-50'>
                <div className='flex items-center justify-between'>
                  <div>
                    <h2 className='text-lg font-medium text-green-600'>
                      {selectedOrder.sellerVerified ? 'অর্ডার কনফার্মেশন' : 'অর্ডার পেমেন্ট'}
                    </h2>
                    <p className='text-sm text-gray-600'>অর্ডার #{selectedOrder.orderId}</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowPaymentModal(false)
                      resetPaymentForm()
                    }}
                    className='p-2 hover:bg-white/50 rounded-full transition-colors'
                  >
                    <svg
                      className='w-5 h-5 text-gray-500'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
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
              </div>

              {/* Scrollable Content */}
              <div className='p-4 space-y-4'>
                {/* Verified Seller Notice */}
                {selectedOrder.sellerVerified ? (
                  <div className='bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg'>
                    <div className='flex items-start'>
                      <div className='ml-3'>
                        <p className='text-sm text-blue-700 mt-1'>
                          আপনি একজন ভেরিফাইড বিক্রেতা, পেমেন্ট ছাড়াই অর্ডার কনফার্ম করতে পারেন
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className='bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg'>
                    <div className='flex items-start'>
                      <div className='flex-shrink-0'>
                        <svg
                          className='w-5 h-5 text-yellow-400'
                          fill='currentColor'
                          viewBox='0 0 20 20'
                        >
                          <path
                            fillRule='evenodd'
                            d='M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z'
                            clipRule='evenodd'
                          />
                        </svg>
                      </div>
                      <div className='ml-3'>
                        <h4 className='text-sm font-medium text-yellow-800'>সতর্কতা</h4>
                        <p className='text-sm text-yellow-700 mt-1'>
                          ভুল পেমেন্ট তথ্য দিলে অর্ডার রিজেক্ট করা হবে এবং আপনাকে ব্লক করা হবে।
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Delivery Charge */}
                <div className='bg-gradient-to-r from-gray-50 to-green-50 p-4 rounded-lg border'>
                  <div className='flex justify-between items-center'>
                    <div className='flex items-center gap-2'>
                      <span className='text-base font-medium'>ডেলিভারি চার্জ:</span>
                      <div className='group relative'>
                        <span className='text-gray-400 cursor-help text-sm'>ℹ</span>
                        <div className='absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 p-2 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none'>
                          অর্ডার ডেলিভারির জন্য প্রয়োজনীয় চার্জ
                        </div>
                      </div>
                    </div>
                    <span className='text-xl font-bold text-green-600'>
                      {selectedOrder.deliveryCharge}৳
                    </span>
                  </div>
                </div>

                {/* Quick Confirm for Verified Sellers */}
                {selectedOrder.sellerVerified && (
                  <div className='space-y-3'>
                    <button
                      onClick={() => handleConfirmOrder(selectedOrder.orderId)}
                      disabled={
                        actionLoading.type === 'confirm' &&
                        actionLoading.id === selectedOrder.orderId
                      }
                      className='w-full px-4 py-3 text-base bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center justify-center'
                    >
                      {actionLoading.type === 'confirm' &&
                      actionLoading.id === selectedOrder.orderId ? (
                        <>
                          <div className='animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2'></div>
                          প্রক্রিয়াধীন...
                        </>
                      ) : (
                        <>
                          <svg
                            className='w-5 h-5 mr-2'
                            fill='none'
                            stroke='currentColor'
                            viewBox='0 0 24 24'
                          >
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth={2}
                              d='M5 13l4 4L19 7'
                            />
                          </svg>
                          কনফার্ম করুন (পেমেন্ট ছাড়া)
                        </>
                      )}
                    </button>
                    <div className='relative flex items-center'>
                      <div className='flex-grow border-t border-gray-300'></div>
                      <span className='flex-shrink mx-4 text-gray-500 text-sm bg-white px-2'>
                        অথবা
                      </span>
                      <div className='flex-grow border-t border-gray-300'></div>
                    </div>
                  </div>
                )}

                {/* Payment Methods */}
                <div className='space-y-3'>
                  <h3 className='font-medium text-base text-gray-800'>
                    পেমেন্ট মেথড নির্বাচন করুন
                  </h3>
                  <div className='space-y-3'>
                    {/* Balance Payment */}
                    <label
                      className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                        paymentMethod === 'BALANCE'
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300'
                      } ${user?.balance! < +selectedOrder.deliveryCharge ? 'opacity-60' : ''}`}
                    >
                      <input
                        type='radio'
                        className='text-green-600 focus:ring-green-500 flex-shrink-0'
                        name='paymentMethod'
                        value='BALANCE'
                        checked={paymentMethod === 'BALANCE'}
                        onChange={() => setPaymentMethod('BALANCE')}
                        disabled={user?.balance! < +selectedOrder.deliveryCharge}
                      />
                      <div className='ml-3 flex-1'>
                        <div className='flex items-center justify-between'>
                          <span className='text-sm font-medium'>ব্যালেন্স থেকে পেমেন্ট</span>
                          <span className='text-xs text-gray-500'>
                            ব্যালেন্স: {user?.balance || 0}৳
                          </span>
                        </div>
                        {user?.balance! < +selectedOrder.deliveryCharge && (
                          <div className='text-red-500 text-xs mt-1 flex items-center'>
                            <svg className='w-3 h-3 mr-1' fill='currentColor' viewBox='0 0 20 20'>
                              <path
                                fillRule='evenodd'
                                d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z'
                                clipRule='evenodd'
                              />
                            </svg>
                            অপর্যাপ্ত ব্যালেন্স
                          </div>
                        )}
                      </div>
                    </label>

                    {/* Wallet Payment */}
                    <label
                      className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                        paymentMethod === 'WALLET'
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type='radio'
                        className='text-green-600 focus:ring-green-500 flex-shrink-0'
                        name='paymentMethod'
                        value='WALLET'
                        checked={paymentMethod === 'WALLET'}
                        onChange={() => setPaymentMethod('WALLET')}
                      />
                      <div className='ml-3'>
                        <span className='text-sm font-medium'>মোবাইল ওয়ালেট পেমেন্ট</span>
                        <p className='text-xs text-gray-500 mt-1'>bKash, Nagad</p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Wallet Payment Details */}
                {paymentMethod === 'WALLET' && (
                  <div className='space-y-4 border-t pt-4 bg-blue-50/30 p-4 rounded-lg'>
                    <h4 className='font-medium text-sm text-gray-800'>পেমেন্ট বিস্তারিত</h4>

                    {/* System Wallet Selection */}
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        সিস্টেম ওয়ালেট নির্বাচন করুন *
                      </label>
                      <select
                        className='w-full px-3 py-3 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white'
                        value={selectedSystemWallet?.walletId || ''}
                        onChange={e => {
                          const walletId = parseInt(e.target.value)
                          const wallet = systemWallets.find(w => w.walletId === walletId)
                          setSelectedSystemWallet(wallet || null)
                        }}
                        required
                        disabled={walletLoading}
                      >
                        <option value=''>একটি ওয়ালেট নির্বাচন করুন</option>
                        {systemWallets.map(wallet => (
                          <option key={wallet.walletId} value={wallet.walletId}>
                            {wallet.walletName} - {wallet.walletPhoneNo}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Payment Instruction */}
                    {selectedSystemWallet && (
                      <div className='p-4 border-2 border-dashed border-green-300 bg-green-50 rounded-lg'>
                        <div className='text-center'>
                          <p className='text-sm text-green-800 font-medium mb-1'>
                            {selectedSystemWallet.walletName} এ সেন্ড মানি করুন
                          </p>
                          <p className='text-lg font-bold text-green-700'>
                            {selectedSystemWallet.walletPhoneNo}
                          </p>
                          <p className='text-xl font-bold text-green-800 mt-2'>
                            পরিমাণ: {selectedOrder.deliveryCharge}৳
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Sender Wallet Number */}
                    <div className='relative'>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        আপনার {selectedSystemWallet?.walletName || 'ওয়ালেট'} নম্বর *
                      </label>
                      <input
                        type='tel'
                        className='w-full px-3 py-3 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent'
                        placeholder='যে নম্বর থেকে পেমেন্ট করেছেন সেটি লিখুন'
                        value={sellerWalletPhoneNo}
                        onChange={e => {
                          const value = e.target.value.replace(/\D/g, '').slice(0, 11)
                          setSellerWalletPhoneNo(value)
                          setShowSuggestions(value.length > 0)
                        }}
                        maxLength={11}
                        required
                      />
                      {/* Saved Wallets Suggestions */}
                      {showSuggestions && savedWallets.length > 0 && (
                        <div className='absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md py-1 max-h-32 overflow-y-auto border'>
                          {savedWallets
                            .filter(
                              wallet =>
                                wallet.walletPhoneNo.includes(sellerWalletPhoneNo) &&
                                wallet.walletName.toLowerCase() ===
                                  selectedSystemWallet?.walletName?.toLowerCase()
                            )
                            .map((wallet, index) => (
                              <div
                                key={index}
                                className='px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm'
                                onClick={() => {
                                  setSellerWalletPhoneNo(wallet.walletPhoneNo)
                                  setShowSuggestions(false)
                                }}
                              >
                                {wallet.walletName} ({wallet.walletPhoneNo})
                              </div>
                            ))}
                        </div>
                      )}
                    </div>

                    {/* Transaction ID */}
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        ট্রানজেকশন আইডি *
                      </label>
                      <input
                        type='text'
                        className='w-full px-3 py-3 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-xs'
                        placeholder='পেমেন্ট করার পর ট্রানজেকশন আইডি লিখুন'
                        value={transactionId}
                        onChange={e => setTransactionId(e.target.value.trim())}
                        required
                      />
                    </div>
                  </div>
                )}

                {/* Error Display */}
                {error && (
                  <div className='p-4 bg-red-50 border border-red-200 rounded-lg'>
                    <div className='flex  items-center'>
                      <svg
                        className='w-5 h-5 text-red-400 flex-shrink-0'
                        fill='currentColor'
                        viewBox='0 0 20 20'
                      >
                        <path
                          fillRule='evenodd'
                          d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'
                          clipRule='evenodd'
                        />
                      </svg>

                      <p className='text-sm text-red-700 pl-2'>{error}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer Actions */}
              <div className='p-4 bg-gray-50 rounded-b-lg'>
                <div className='space-y-3'>
                  {(!selectedOrder.sellerVerified || paymentMethod) && (
                    <button
                      onClick={handlePayment}
                      disabled={
                        actionLoading.type === 'payment' &&
                        actionLoading.id === selectedOrder.orderId
                      }
                      className='w-full px-4 py-3 text-base bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 transition-all duration-200 flex items-center justify-center'
                    >
                      {actionLoading.type === 'payment' &&
                      actionLoading.id === selectedOrder.orderId ? (
                        <>
                          <div className='animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2'></div>
                          প্রক্রিয়াধীন...
                        </>
                      ) : (
                        <>
                          <svg
                            className='w-5 h-5 mr-2'
                            fill='none'
                            stroke='currentColor'
                            viewBox='0 0 24 24'
                          >
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth={2}
                              d='M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1'
                            />
                          </svg>
                          {paymentMethod === 'BALANCE'
                            ? 'ব্যালেন্স থেকে পেমেন্ট করুন'
                            : paymentMethod === 'WALLET'
                            ? 'ওয়ালেট পেমেন্ট কনফার্ম করুন'
                            : 'পেমেন্ট করুন'}
                        </>
                      )}
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setShowPaymentModal(false)
                      resetPaymentForm()
                    }}
                    className='w-full px-4 py-2 text-base bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors'
                  >
                    বাতিল করুন
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* অর্ডার ডিটেইল মোডাল */}
      {showDetailModal && selectedOrder && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center pt-[120px] sm:p-8 z-50 overflow-y-auto'>
          <div className='bg-white rounded-lg shadow-lg w-full max-w-full sm:max-w-4xl max-h-[90vh] overflow-y-auto'>
            {/* Header */}
            <div className='p-3 sm:p-4 border-b sticky top-0 bg-white z-10'>
              <div className='flex justify-between items-center'>
                <h2 className='text-lg sm:text-xl font-bold'>অর্ডার #{selectedOrder.orderId}</h2>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className='text-gray-500 hover:text-gray-700'
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
              <div className='mt-1 sm:mt-2 flex items-center gap-2'>
                {getStatusBadge(selectedOrder.orderStatus)}
                <span className='text-xs sm:text-sm text-gray-500'>
                  {formatDate(selectedOrder.createdAt)}
                </span>
              </div>
            </div>

            <div className='p-3 sm:p-4 space-y-3 sm:space-y-4'>
              {/* Compact Shop and Customer Info */}
              <div className='bg-gray-50 p-3 sm:p-4 rounded-lg space-y-2'>
                <div className='flex items-center gap-2'>
                  <FaStore className='text-gray-600 text-sm sm:text-base' />
                  <p className='font-medium text-sm sm:text-base'>
                    {selectedOrder.shopName}
                    <span className='text-gray-600 ml-1 sm:ml-2'>{selectedOrder.shopLocation}</span>
                  </p>
                </div>

                <div className='border-t pt-2'></div>

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
              </div>

              {/* Tracking URL Section */}
              {selectedOrder.trackingUrl && (
                <div className='bg-gray-50 p-3 sm:p-4 rounded-lg'>
                  <h3 className='font-medium text-base sm:text-lg mb-2 sm:mb-3'>ট্র্যাকিং লিঙ্ক</h3>
                  <div className='flex flex-col sm:flex-row gap-2 items-start sm:items-center'>
                    <div className='flex-1 bg-white p-1 sm:p-2 rounded border border-gray-200 overflow-hidden'>
                      <p className='text-xs sm:text-sm text-blue-600 truncate'>
                        <a
                          href={formatUrl(selectedOrder.trackingUrl!)}
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
                      className='px-2 sm:px-3 py-1 sm:py-1.5 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 text-xs sm:text-sm flex items-center gap-1 whitespace-nowrap ml-2'
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

              {/* Product List */}
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

              {selectedOrder.paymentType === 'BALANCE' && (
                <div className='flex gap-2 text-xs sm:text-sm'>
                  <p className='text-gray-600'>ব্যালেন্স থেকে কাটা হয়েছে</p>
                  <p className='font-medium'>{selectedOrder.deliveryCharge}৳</p>
                </div>
              )}

              {/* Payment and Summary */}
              <div className='grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4'>
                {/* Payment Info */}
                {selectedOrder.Payment && (
                  <div className='bg-gray-50 p-3 sm:p-4 rounded-lg'>
                    <h3 className='font-medium text-base sm:text-lg mb-2 sm:mb-3'>পেমেন্ট তথ্য</h3>
                    <div className='space-y-2 sm:space-y-3'>
                      {/* Payment Method */}
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

                      {/* Payment Status */}
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

                      {/* Wallet Payment Details */}
                      {selectedOrder.paymentType === 'WALLET' && (
                        <>
                          <div className='flex justify-between text-xs sm:text-sm'>
                            <p className='text-gray-600'>সিস্টেম ওয়ালেট</p>
                            <p className='font-medium'>
                              {selectedOrder.Payment.userWalletName || 'N/A'} (
                              {selectedOrder.Payment.systemWalletPhoneNo || 'N/A'})
                            </p>
                          </div>
                          <div className='flex justify-between text-xs sm:text-sm'>
                            <p className='text-gray-600'>বিক্রেতা ওয়ালেট</p>
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
                    {!selectedOrder.amountPaidByCustomer && (
                      <div className='flex justify-between text-xs sm:text-sm'>
                        <p className='text-gray-600'>কমিশন</p>
                        <p className='font-medium'>{selectedOrder.totalCommission}৳</p>
                      </div>
                    )}
                    {selectedOrder.cashOnAmount && (
                      <div className='border-t pt-1 sm:pt-2 mt-1 sm:mt-2 flex justify-between font-bold text-xs sm:text-sm'>
                        <p>ক্যাশ অন ডেলিভারি অ্যামাউন্ট</p>
                        <p>{selectedOrder.cashOnAmount}৳</p>
                      </div>
                    )}
                  </div>
                  {selectedOrder.amountPaidByCustomer && (
                    <>
                      <div className='pt-1 sm:pt-2 mt-1 sm:mt-2 flex justify-between font-[400] text-xs sm:text-sm'>
                        <p>কাস্টমার প্রদত্ত অ্যামাউন্ট</p>
                        <p>{selectedOrder.amountPaidByCustomer}৳</p>
                      </div>
                      <div className='border-t pt-1 sm:pt-2 mt-1 sm:mt-2 flex justify-between font-bold text-xs sm:text-sm'>
                        <p>কমিশন</p>
                        <p>{selectedOrder.actualCommission}৳</p>
                      </div>
                    </>
                  )}
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

export default Orders
