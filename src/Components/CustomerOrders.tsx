import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import {
  FaChevronLeft,
  FaChevronRight,
  FaComment,
  FaCopy,
  FaEye,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaStore,
  FaTimes,
  FaUser,
} from 'react-icons/fa'
import { useLocation } from 'react-router-dom'
import { toast } from 'react-toastify'
import { orderApi } from '../Api/order.api'
import { walletApi } from '../Api/wallet.api'
import { formatDate } from '../utils/date.utils'
import { formatUrl } from '../utils/url.utils'

// ==================== INTERFACES (unchanged) ====================
interface Order {
  orderId: number
  orderType: string
  orderStatus:
    | 'UNPAID'
    | 'PAID'
    | 'CONFIRMED'
    | 'PROCESSING'
    | 'DELIVERED'
    | 'COMPLETED'
    | 'CANCELLED'
    | 'RETURNED'
    | 'REJECTED'
    | 'REFUNDED'
    | 'FAILED'
    | 'PENDING'
  createdAt: string
  updatedAt: string
  cancelled: boolean
  cancelledAt: string | null
  cancelledBy: string | null
  cancelledReason: string | null
  customerName: string
  customerPhoneNo: string
  customerAddress: string
  customerZilla: string
  customerUpazilla: string
  customerComments: string
  shopId: number
  shopName: string
  shopLocation: string
  deliveryCharge: string
  sellerId: string
  sellerName: string
  sellerPhoneNo: string
  sellerVerified: boolean
  sellerShopName: string | null
  sellerBalance: string
  courierName: string | null
  trackingUrl: string | null
  isDeliveryChargePaid: boolean
  deliveryChargePaidAt: string | null
  paymentType: string
  paymentVerified: boolean
  totalProductQuantity: number
  totalProductSellingPrice: string
  totalProductBasePrice: string
  totalCommission: string
  amountPaidByCustomer: string
  actualCommission: string
  cashOnAmount: string
  totalAddOnPrice: string
  finalOrderTotal: string
  OrderProduct: OrderProduct[]
  Payment: {
    paymentId: string
    paymentDate: string
    paymentStatus: string
    paymentType: string
    processedAt: string | null
    sender: string
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
  orderId: number
  productId: number
  productName: string
  productImage: string
  productBasePrice: string
  productSellingPrice: string
  productQuantity: number
  productVariant: Record<string, string>
  totalProductBasePrice: string
  totalProductSellingPrice: string
  totalProductQuantity: number
  selectedAddOns: Array<{
    id: string
    name: string
    price: number
  }>
  totalAddOnPrice: string
  finalProductPrice: string
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

// ==================== COMPONENT ====================
const CustomerOrders = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const location = useLocation()
  const { phoneNo } = location.state || { phoneNo: '' }
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<{
    type: 'cancel' | 'payment' | 'reorder' | null
    id: number | null
  }>({ type: null, id: null })
  const [searchQuery] = useState('')
  const [phoneNumber, setPhoneNumber] = useState(phoneNo)
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
  const [showReorderModal, setShowReorderModal] = useState(false)

  // ==================== API FUNCTIONS (unchanged) ====================
  const fetchOrders = async () => {
    if (!phoneNumber) return
    setError('')

    try {
      setLoading(true)
      let statusParam = []

      if (activeTab === 'pending') {
        statusParam = ['UNPAID', 'PAID', 'FAILED', 'PENDING']
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
        amount: parseFloat(selectedOrder.deliveryCharge),
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

  const handleReorder = async (order: Order) => {
    try {
      setActionLoading({ type: 'reorder', id: order.orderId })
      setError('')

      const response = await orderApi.reorderFailedOrderByCustomer({
        orderId: order.orderId,
        phoneNo: phoneNumber,
      })

      if (response.success) {
        toast.success('অর্ডারটি পুনরায় দেওয়া হয়েছে')
        fetchOrders()
      } else {
        setError(response.message || 'অর্ডার পুনরায় দিতে ব্যর্থ হয়েছে')
        toast.error(response.message || 'অর্ডার পুনরায় দিতে ব্যর্থ হয়েছে')
      }
    } catch (error) {
      setError('একটি ত্রুটি ঘটেছে')
      toast.error('একটি ত্রুটি ঘটেছে')
      console.error('Error reordering:', error)
    } finally {
      setActionLoading({ type: null, id: null })
      setShowReorderModal(false)
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
      case 'PENDING':
        return <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>পেন্ডিং</span>
      case 'PAID':
        return <span className={`${baseClasses} bg-blue-100 text-blue-800`}>পেইড</span>
      case 'CONFIRMED':
        return <span className={`${baseClasses} bg-green-100 text-green-800`}>কনফার্মড</span>
      case 'PROCESSING':
        return <span className={`${baseClasses} bg-indigo-100 text-indigo-800`}>প্রসেসিং</span>
      case 'DELIVERED':
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

        {['UNPAID', 'PAID', 'PENDING'].includes(order.orderStatus) && !order.cancelled && (
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

        {order.orderStatus === 'FAILED' && (
          <button
            onClick={() => {
              setSelectedOrder(order)
              setShowReorderModal(true)
            }}
            disabled={actionLoading.type === 'reorder' && actionLoading.id === order.orderId}
            className='px-3 py-1 bg-blue-600 text-white rounded text-xs flex items-center gap-1 hover:bg-blue-700'
          >
            {actionLoading.type === 'reorder' && actionLoading.id === order.orderId ? (
              'প্রক্রিয়াধীন...'
            ) : (
              <>
                <svg className='w-3 h-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15'
                  />
                </svg>
                পুনরায় অর্ডার করুন
              </>
            )}
          </button>
        )}
      </div>
    )
  }

  // ==================== RENDER (redesigned) ====================
  return (
    <div className='min-h-screen bg-[#f7f6f3]'>
      <div className='mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8'>
        {/* Page Header */}
        <div className='mb-6'>
          <h1 className='font-serif text-2xl font-bold text-[#1a1a2e]'>আমার অর্ডারসমূহ</h1>
          <p className='mt-1 text-sm text-gray-500'>আপনার সব অর্ডার এখানে দেখুন</p>
        </div>

        {/* Phone Number Input */}
        {showPhoneInput && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className='rounded-xl border border-gray-200 bg-white p-6 shadow-sm'
          >
            <form onSubmit={handlePhoneSubmit} className='space-y-4'>
              <div>
                <label htmlFor='phone' className='mb-1.5 block text-sm font-medium text-gray-700'>
                  আপনার ফোন নম্বর দিন
                </label>
                <input
                  type='tel'
                  id='phone'
                  className='w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-800 placeholder:text-gray-400 focus:border-[#e94560] focus:outline-none focus:ring-1 focus:ring-[#e94560]'
                  placeholder='01XXXXXXXXX'
                  value={phoneNumber}
                  onChange={e => setPhoneNumber(e.target.value)}
                  required
                />
              </div>
              <button
                type='submit'
                className='w-full rounded-lg bg-[#e94560] px-4 py-2.5 font-semibold text-white transition hover:bg-[#c73652] focus:outline-none focus:ring-2 focus:ring-[#e94560]/50'
              >
                অর্ডার খুঁজুন
              </button>
              {error && <p className='text-sm text-red-500'>{error}</p>}
            </form>
          </motion.div>
        )}

        {!showPhoneInput && (
          <>
            {/* Tabs */}
            <div className='mb-6 border-b border-gray-200'>
              <div className='flex gap-1 overflow-x-auto'>
                {[
                  { key: 'pending', label: 'পেন্ডিং' },
                  { key: 'confirmed', label: 'কনফার্মড' },
                  { key: 'completed', label: 'কমপ্লিটেড' },
                  { key: 'others', label: 'অন্যান্য' },
                ].map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as any)}
                    className={`whitespace-nowrap px-4 py-2 text-sm font-medium transition-all ${
                      activeTab === tab.key
                        ? 'border-b-2 border-[#e94560] text-[#e94560]'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab.label}{' '}
                    <span className='ml-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs'>
                      {tab.key === 'pending'
                        ? orders.filter(o =>
                            ['UNPAID', 'PAID', 'FAILED', 'PENDING'].includes(o.orderStatus)
                          ).length
                        : tab.key === 'confirmed'
                          ? orders.filter(o => ['CONFIRMED', 'DELIVERED'].includes(o.orderStatus))
                              .length
                          : tab.key === 'completed'
                            ? orders.filter(o => o.orderStatus === 'COMPLETED').length
                            : orders.filter(o =>
                                ['CANCELLED', 'RETURNED', 'REJECTED', 'REFUNDED'].includes(
                                  o.orderStatus
                                )
                              ).length}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Page Size Selector */}
            <div className='mb-4 flex justify-end'>
              <select
                value={pagination.pageSize}
                onChange={e =>
                  setPagination(prev => ({
                    ...prev,
                    pageSize: Number(e.target.value),
                    currentPage: 1,
                  }))
                }
                className='rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 focus:border-[#e94560] focus:outline-none focus:ring-1 focus:ring-[#e94560]'
              >
                <option value='5'>৫টি অর্ডার</option>
                <option value='10'>১০টি অর্ডার</option>
                <option value='20'>২০টি অর্ডার</option>
              </select>
            </div>

            {/* Loading State */}
            {loading && (
              <div className='flex h-64 items-center justify-center'>
                <div className='h-8 w-8 animate-spin rounded-full border-2 border-[#e94560] border-t-transparent' />
              </div>
            )}

            {/* Empty State */}
            {!loading && orders.length === 0 && (
              <div className='rounded-xl border border-gray-200 bg-white p-8 text-center'>
                <p className='text-gray-500'>কোন অর্ডার পাওয়া যায়নি</p>
              </div>
            )}

            {/* Order List */}
            {!loading && orders.length > 0 && (
              <div className='overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm'>
                {/* Mobile Card View */}
                <div className='divide-y divide-gray-100 md:hidden'>
                  {orders.map(order => (
                    <div key={order.orderId} className='p-4'>
                      <div className='flex items-start justify-between'>
                        <div>
                          <p className='text-xs text-gray-500'>{formatDate(order.createdAt)}</p>
                          <h3 className='font-medium text-gray-900'>
                            অর্ডার #{order.orderId}
                            {order.cancelled && (
                              <span className='ml-1 text-xs text-red-500'>(বাতিল)</span>
                            )}
                          </h3>
                          <p className='text-sm text-gray-600'>
                            {order.sellerShopName || order.shopName}
                          </p>
                        </div>
                        <div>{getStatusBadge(order.orderStatus)}</div>
                      </div>
                      <div className='mt-3 grid grid-cols-2 gap-2 text-sm'>
                        <div>
                          <p className='text-gray-500'>মোট মূল্য:</p>
                          <p className='font-medium'>{order.finalOrderTotal}৳</p>
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

                {/* Desktop Table View */}
                <div className='hidden overflow-x-auto md:block'>
                  <table className='min-w-full divide-y divide-gray-200'>
                    <thead className='bg-gray-50'>
                      <tr>
                        <th className='px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                          তারিখ
                        </th>
                        <th className='px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                          অর্ডার আইডি
                        </th>
                        <th className='px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                          দোকান
                        </th>
                        <th className='px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                          মোট মূল্য
                        </th>
                        <th className='px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                          স্ট্যাটাস
                        </th>
                        <th className='px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500'>
                          অ্যাকশন
                        </th>
                      </tr>
                    </thead>
                    <tbody className='divide-y divide-gray-200 bg-white'>
                      {orders.map(order => (
                        <tr key={order.orderId} className='hover:bg-gray-50'>
                          <td className='whitespace-nowrap px-4 py-3 text-sm text-gray-500'>
                            {formatDate(order.createdAt)}
                          </td>
                          <td className='whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900'>
                            #{order.orderId}
                            {order.cancelled && (
                              <span className='ml-1 text-xs text-red-500'>(বাতিল)</span>
                            )}
                          </td>
                          <td className='px-4 py-3 text-sm text-gray-900'>
                            <div>{order.sellerShopName || order.shopName}</div>
                            <div className='text-xs text-gray-500'>{order.shopLocation}</div>
                          </td>
                          <td className='whitespace-nowrap px-4 py-3 text-sm text-gray-900'>
                            {order.finalOrderTotal}৳
                          </td>
                          <td className='whitespace-nowrap px-4 py-3'>
                            {getStatusBadge(order.orderStatus)}
                          </td>
                          <td className='whitespace-nowrap px-4 py-3 text-sm'>
                            {renderActionButtons(order)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className='flex items-center justify-between border-t border-gray-200 bg-gray-50 px-4 py-3'>
                    <div className='flex flex-1 justify-between sm:hidden'>
                      <button
                        onClick={() =>
                          setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))
                        }
                        disabled={pagination.currentPage === 1}
                        className='relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50'
                      >
                        পূর্ববর্তী
                      </button>
                      <button
                        onClick={() =>
                          setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))
                        }
                        disabled={pagination.currentPage === pagination.totalPages}
                        className='relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50'
                      >
                        পরবর্তী
                      </button>
                    </div>
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
                          এর মধ্যে <span className='font-medium'>{pagination.totalOrders}</span> টি
                          অর্ডার
                        </p>
                      </div>
                      <div>
                        <nav
                          className='relative z-0 inline-flex -space-x-px rounded-md shadow-sm'
                          aria-label='Pagination'
                        >
                          <button
                            onClick={() =>
                              setPagination(prev => ({
                                ...prev,
                                currentPage: prev.currentPage - 1,
                              }))
                            }
                            disabled={pagination.currentPage === 1}
                            className='relative inline-flex items-center rounded-l-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50'
                          >
                            <FaChevronLeft className='h-4 w-4' />
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
                                className={`relative inline-flex items-center border px-4 py-2 text-sm font-medium ${
                                  pageNum === pagination.currentPage
                                    ? 'z-10 border-[#e94560] bg-[#e94560] text-white'
                                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                                }`}
                              >
                                {pageNum}
                              </button>
                            )
                          })}
                          <button
                            onClick={() =>
                              setPagination(prev => ({
                                ...prev,
                                currentPage: prev.currentPage + 1,
                              }))
                            }
                            disabled={pagination.currentPage === pagination.totalPages}
                            className='relative inline-flex items-center rounded-r-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50'
                          >
                            <FaChevronRight className='h-4 w-4' />
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
      </div>

      {/* ==================== MODALS (redesigned) ==================== */}

      {/* Cancel Order Modal */}
      <AnimatePresence>
        {showCancelModal && selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className='w-full max-w-md rounded-xl bg-white shadow-xl'
            >
              <div className='flex items-center justify-between border-b p-4'>
                <h2 className='text-lg font-semibold text-red-600'>অর্ডার বাতিল করুন</h2>
                <button
                  onClick={() => {
                    setShowCancelModal(false)
                    setCancelReason('')
                    setError('')
                  }}
                  className='rounded-full p-1 hover:bg-gray-100'
                >
                  <FaTimes className='h-5 w-5 text-gray-500' />
                </button>
              </div>
              <div className='p-4'>
                <p className='mb-4 text-gray-700'>
                  আপনি কি নিশ্চিতভাবে অর্ডার #{selectedOrder.orderId} বাতিল করতে চান?
                </p>
                <div>
                  <label className='mb-1 block text-sm font-medium text-gray-700'>কারণ</label>
                  <textarea
                    className='w-full rounded-lg border border-gray-300 p-2 focus:border-[#e94560] focus:outline-none focus:ring-1 focus:ring-[#e94560]'
                    rows={3}
                    placeholder='বাতিল করার কারণ লিখুন...'
                    value={cancelReason}
                    onChange={e => setCancelReason(e.target.value)}
                    required
                  />
                </div>
                {error && <p className='mt-2 text-sm text-red-500'>{error}</p>}
              </div>
              <div className='flex justify-end gap-3 border-t p-4'>
                <button
                  onClick={() => {
                    setShowCancelModal(false)
                    setCancelReason('')
                    setError('')
                  }}
                  className='rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50'
                >
                  বাদ দিন
                </button>
                <button
                  onClick={handleCancelOrder}
                  disabled={actionLoading.type === 'cancel'}
                  className='rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:opacity-50'
                >
                  {actionLoading.type === 'cancel' ? 'প্রক্রিয়াধীন...' : 'বাতিল করুন'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Payment Modal */}
      <AnimatePresence>
        {showPaymentModal && selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 pt-16 sm:items-center sm:pt-4'
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className='w-full max-w-md rounded-xl bg-white shadow-xl'
            >
              <div className='flex items-center justify-between border-b bg-rose-50 p-4'>
                <h2 className='text-lg font-semibold text-[#e94560]'>পেমেন্ট সম্পূর্ণ করুন</h2>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className='rounded-full p-1 hover:bg-rose-100'
                >
                  <FaTimes className='h-5 w-5 text-gray-500' />
                </button>
              </div>
              <div className='max-h-[70vh] overflow-y-auto p-4'>
                {/* Warning */}
                <div className='mb-4 rounded-lg border-l-4 border-yellow-400 bg-yellow-50 p-3'>
                  <p className='text-sm font-medium text-yellow-700'>সতর্কতা</p>
                  <p className='text-sm text-yellow-600'>
                    ভুল পেমেন্ট তথ্য দিলে অর্ডার রিজেক্ট করা হবে।
                  </p>
                </div>
                {/* Amount */}
                <div className='mb-4 rounded-lg bg-gradient-to-r from-rose-50 to-orange-50 p-4'>
                  <div className='flex justify-between'>
                    <span className='font-medium text-gray-700'>পেমেন্ট পরিমাণ:</span>
                    <span className='text-xl font-bold text-[#e94560]'>
                      ৳{parseFloat(selectedOrder.deliveryCharge).toLocaleString('bn-BD')}
                    </span>
                  </div>
                </div>
                {/* System Wallet Select */}
                <div className='mb-4'>
                  <label className='mb-1 block text-sm font-medium text-gray-700'>
                    পেমেন্ট মাধ্যম নির্বাচন করুন *
                  </label>
                  <select
                    className='w-full rounded-lg border border-gray-300 p-2 focus:border-[#e94560] focus:outline-none focus:ring-1 focus:ring-[#e94560]'
                    value={selectedSystemWallet?.walletId || ''}
                    onChange={e => {
                      const walletId = parseInt(e.target.value)
                      const wallet = systemWallets.find(w => w.walletId === walletId)
                      setSelectedSystemWallet(wallet || null)
                    }}
                    required
                  >
                    <option value=''>একটি ওয়ালেট নির্বাচন করুন</option>
                    {systemWallets.map(wallet => (
                      <option key={wallet.walletId} value={wallet.walletId}>
                        {wallet.walletName} - {wallet.walletPhoneNo}
                      </option>
                    ))}
                  </select>
                </div>
                {/* Selected Wallet Info */}
                {selectedSystemWallet && (
                  <div className='mb-4 rounded-lg bg-blue-50 p-3'>
                    <p className='text-sm font-medium text-blue-800'>নির্বাচিত ওয়ালেট:</p>
                    <p className='text-blue-700'>{selectedSystemWallet.walletName}</p>
                    <p className='text-sm text-blue-600'>{selectedSystemWallet.walletPhoneNo}</p>
                  </div>
                )}
                {/* Customer Wallet */}
                <div className='mb-4'>
                  <label className='mb-1 block text-sm font-medium text-gray-700'>
                    আপনার ওয়ালেট নম্বর *
                  </label>
                  <input
                    type='tel'
                    className='w-full rounded-lg border border-gray-300 p-2 focus:border-[#e94560] focus:outline-none focus:ring-1 focus:ring-[#e94560]'
                    placeholder='যে নম্বর থেকে পেমেন্ট করেছেন'
                    value={customerWalletPhoneNo}
                    onChange={e =>
                      setCustomerWalletPhoneNo(e.target.value.replace(/\D/g, '').slice(0, 11))
                    }
                    maxLength={11}
                  />
                </div>
                {/* Transaction ID */}
                <div className='mb-4'>
                  <label className='mb-1 block text-sm font-medium text-gray-700'>
                    ট্রানজেকশন আইডি *
                  </label>
                  <input
                    type='text'
                    className='w-full rounded-lg border border-gray-300 p-2 focus:border-[#e94560] focus:outline-none focus:ring-1 focus:ring-[#e94560]'
                    placeholder='ট্রানজেকশন আইডি লিখুন'
                    value={transactionId}
                    onChange={e => setTransactionId(e.target.value.trim())}
                  />
                </div>
                {/* Instructions */}
                <div className='mb-4 rounded-lg bg-blue-50 p-3'>
                  <h4 className='mb-2 font-medium text-blue-800'>পেমেন্ট নির্দেশনা</h4>
                  <ol className='list-decimal space-y-1 pl-5 text-sm text-blue-700'>
                    <li>
                      উপরের নির্বাচিত ওয়ালেট নম্বরে ৳{selectedOrder.deliveryCharge} সেন্ড মানি করুন
                    </li>
                    <li>পেমেন্ট সম্পূর্ণ হওয়ার পর ট্রানজেকশন আইডি সংগ্রহ করুন</li>
                    <li>সকল তথ্য সঠিকভাবে পূরণ করে নিচের বাটনে ক্লিক করুন</li>
                  </ol>
                </div>
                {error && (
                  <div className='mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600'>{error}</div>
                )}
              </div>
              <div className='flex gap-3 border-t p-4'>
                <button
                  onClick={handlePayment}
                  disabled={
                    !selectedSystemWallet ||
                    !customerWalletPhoneNo ||
                    !transactionId ||
                    customerWalletPhoneNo.length !== 11
                  }
                  className='flex-1 rounded-lg bg-[#e94560] py-2 font-semibold text-white hover:bg-[#c73652] disabled:opacity-50'
                >
                  পেমেন্ট কনফার্ম করুন
                </button>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className='rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50'
                >
                  বাতিল
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Order Detail Modal */}
      <AnimatePresence>
        {showDetailModal && selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='fixed inset-0 z-50 overflow-y-auto bg-black/50 p-4 pt-16'
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className='mx-auto max-w-4xl rounded-xl bg-white shadow-xl'
            >
              <div className='sticky top-0 flex items-center justify-between border-b bg-white p-4'>
                <div>
                  <h2 className='text-xl font-bold'>অর্ডার #{selectedOrder.orderId}</h2>
                  <div className='mt-1 flex items-center gap-2'>
                    {getStatusBadge(selectedOrder.orderStatus)}
                    <span className='text-xs text-gray-500'>
                      {formatDate(selectedOrder.createdAt)}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className='rounded-full p-1 hover:bg-gray-100'
                >
                  <FaTimes className='h-5 w-5 text-gray-500' />
                </button>
              </div>
              <div className='p-4'>
                {/* Customer & Shop Info */}
                <div className='mb-4 rounded-lg bg-gray-50 p-4'>
                  <div className='flex items-center gap-2'>
                    <FaUser className='text-gray-600' />
                    <p className='font-medium'>
                      {selectedOrder.customerName} ({selectedOrder.customerPhoneNo})
                    </p>
                  </div>
                  <p className='ml-6 text-sm text-gray-600'>
                    {selectedOrder.customerUpazilla}, {selectedOrder.customerZilla}
                  </p>
                  <div className='ml-6 flex items-start gap-2'>
                    <FaMapMarkerAlt className='mt-0.5 text-gray-400' />
                    <p className='text-sm'>{selectedOrder.customerAddress}</p>
                  </div>
                  {selectedOrder.customerComments && (
                    <div className='ml-6 flex items-start gap-2'>
                      <FaComment className='mt-0.5 text-gray-400' />
                      <p className='text-sm text-gray-600'>{selectedOrder.customerComments}</p>
                    </div>
                  )}
                  <div className='mt-2 border-t pt-2' />
                  <div className='flex items-center gap-2'>
                    <FaStore className='text-gray-600' />
                    <p className='font-medium'>
                      {selectedOrder.sellerShopName || selectedOrder.shopName}
                      <span className='ml-2 text-sm text-gray-600'>
                        {selectedOrder.shopLocation}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Tracking URL */}
                {selectedOrder.trackingUrl && (
                  <div className='mb-4 rounded-lg bg-gray-50 p-4'>
                    <h3 className='mb-2 font-medium'>ট্র্যাকিং লিঙ্ক</h3>
                    <div className='flex flex-col gap-2 sm:flex-row'>
                      <div className='flex-1 truncate rounded border bg-white p-2 text-sm text-blue-600'>
                        <a
                          href={formatUrl(selectedOrder.trackingUrl)}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='break-all'
                        >
                          {selectedOrder.trackingUrl}
                        </a>
                      </div>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(selectedOrder.trackingUrl || '')
                          toast.success('লিঙ্ক কপি করা হয়েছে')
                        }}
                        className='flex items-center justify-center gap-1 rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-600 hover:bg-blue-100'
                      >
                        <FaCopy /> কপি করুন
                      </button>
                    </div>
                  </div>
                )}

                {/* Products */}
                <div className='mb-4 rounded-lg bg-gray-50 p-4'>
                  <h3 className='mb-3 font-medium'>পণ্য তালিকা</h3>
                  <div className='space-y-3'>
                    {selectedOrder.OrderProduct.map(product => (
                      <div key={product.orderProductId} className='border-b pb-3 last:border-0'>
                        <div className='flex gap-3'>
                          <div className='h-16 w-16 flex-shrink-0 overflow-hidden rounded-md bg-gray-200'>
                            <img
                              src={product.productImage}
                              alt={product.productName}
                              className='h-full w-full object-cover'
                            />
                          </div>
                          <div className='flex-1'>
                            <h4 className='font-medium'>{product.productName}</h4>
                            <p className='text-sm text-gray-600'>
                              {product.productSellingPrice}৳ × {product.productQuantity} টি
                            </p>
                            {product.productVariant &&
                              Object.entries(product.productVariant).map(([key, value]) => (
                                <p key={key} className='text-xs text-gray-500'>
                                  {key}: {value}
                                </p>
                              ))}
                            {product.selectedAddOns && product.selectedAddOns.length > 0 && (
                              <div className='mt-1'>
                                <p className='text-xs text-blue-600'>অতিরিক্ত সামগ্রী:</p>
                                {product.selectedAddOns.map(addOn => (
                                  <p key={addOn.id} className='text-xs text-blue-600'>
                                    • {addOn.name} (+৳{addOn.price})
                                  </p>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className='text-right'>
                            <p className='font-medium'>{product.finalProductPrice}৳</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Add-ons summary */}
                {parseFloat(selectedOrder.totalAddOnPrice) > 0 && (
                  <div className='mb-4 rounded-lg bg-blue-50 p-4'>
                    <div className='flex justify-between'>
                      <span className='font-medium text-blue-800'>মোট অতিরিক্ত সামগ্রীর মূল্য</span>
                      <span className='font-bold text-blue-800'>
                        +৳{selectedOrder.totalAddOnPrice}
                      </span>
                    </div>
                  </div>
                )}

                {/* Payment & Summary */}
                <div className='grid gap-4 md:grid-cols-2'>
                  {selectedOrder.Payment && (
                    <div className='rounded-lg bg-gray-50 p-4'>
                      <h3 className='mb-2 font-medium'>পেমেন্ট তথ্য</h3>
                      <div className='space-y-2 text-sm'>
                        <div className='flex justify-between'>
                          <span className='text-gray-600'>পদ্ধতি</span>
                          <span>
                            {selectedOrder.paymentType === 'BALANCE'
                              ? 'ব্যালেন্স'
                              : selectedOrder.paymentType === 'WALLET'
                                ? 'ওয়ালেট'
                                : 'N/A'}
                          </span>
                        </div>
                        <div className='flex justify-between'>
                          <span className='text-gray-600'>স্ট্যাটাস</span>
                          <span
                            className={`font-medium ${
                              selectedOrder.Payment.paymentStatus === 'PENDING'
                                ? 'text-yellow-600'
                                : selectedOrder.Payment.paymentStatus === 'COMPLETED'
                                  ? 'text-green-600'
                                  : 'text-red-600'
                            }`}
                          >
                            {selectedOrder.Payment.paymentStatus === 'PENDING'
                              ? 'পেন্ডিং'
                              : selectedOrder.Payment.paymentStatus === 'COMPLETED'
                                ? 'কমপ্লিটেড'
                                : 'রিজেক্টেড'}
                          </span>
                        </div>
                        {selectedOrder.paymentType === 'WALLET' && (
                          <>
                            <div className='flex justify-between'>
                              <span className='text-gray-600'>সিস্টেম ওয়ালেট</span>
                              <span>
                                {selectedOrder.Payment.systemWalletName} (
                                {selectedOrder.Payment.systemWalletPhoneNo})
                              </span>
                            </div>
                            <div className='flex justify-between'>
                              <span className='text-gray-600'>আপনার ওয়ালেট</span>
                              <span>
                                {selectedOrder.Payment.userWalletName} (
                                {selectedOrder.Payment.userWalletPhoneNo})
                              </span>
                            </div>
                            <div className='flex justify-between'>
                              <span className='text-gray-600'>ট্রানজেকশন আইডি</span>
                              <span>{selectedOrder.Payment.transactionId}</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                  <div className='rounded-lg bg-gray-50 p-4'>
                    <h3 className='mb-2 font-medium'>সারাংশ</h3>
                    <div className='space-y-2 text-sm'>
                      <div className='flex justify-between'>
                        <span className='text-gray-600'>পণ্যের মূল্য</span>
                        <span>{selectedOrder.totalProductSellingPrice}৳</span>
                      </div>
                      {parseFloat(selectedOrder.totalAddOnPrice) > 0 && (
                        <div className='flex justify-between'>
                          <span className='text-gray-600'>অতিরিক্ত সামগ্রী</span>
                          <span className='text-blue-600'>+{selectedOrder.totalAddOnPrice}৳</span>
                        </div>
                      )}
                      <div className='flex justify-between'>
                        <span className='text-gray-600'>ডেলিভারি চার্জ</span>
                        <span>{selectedOrder.deliveryCharge}৳</span>
                      </div>
                      <div className='border-t pt-2 font-bold'>
                        <div className='flex justify-between'>
                          <span>মোট অ্যামাউন্ট</span>
                          <span>{selectedOrder.finalOrderTotal}৳</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className='flex justify-end border-t p-4'>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className='rounded-lg bg-[#e94560] px-4 py-2 text-white hover:bg-[#c73652]'
                >
                  বন্ধ করুন
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reorder Modal */}
      <AnimatePresence>
        {showReorderModal && selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className='w-full max-w-md rounded-xl bg-white shadow-xl'
            >
              <div className='border-b p-4'>
                <h2 className='text-lg font-semibold text-blue-600'>পুনরায় অর্ডার করুন</h2>
              </div>
              <div className='p-4'>
                <p>আপনি কি নিশ্চিতভাবে অর্ডার #{selectedOrder.orderId} পুনরায় দিতে চান?</p>
                {error && <p className='mt-2 text-sm text-red-500'>{error}</p>}
              </div>
              <div className='flex justify-end gap-3 border-t p-4'>
                <button
                  onClick={() => {
                    setShowReorderModal(false)
                    setError('')
                  }}
                  className='rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50'
                >
                  বাদ দিন
                </button>
                <button
                  onClick={() => handleReorder(selectedOrder)}
                  disabled={actionLoading.type === 'reorder'}
                  className='rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50'
                >
                  {actionLoading.type === 'reorder' ? 'প্রক্রিয়াধীন...' : 'পুনরায় অর্ডার করুন'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default CustomerOrders
