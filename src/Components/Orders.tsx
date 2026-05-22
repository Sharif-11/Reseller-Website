// Orders.tsx — BazaarHub Design System
// Design tokens: --navy: #1a1a2e  --rose: #e94560  --cream: #f7f6f3

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
import { FiAlertCircle, FiCheck, FiChevronLeft, FiChevronRight, FiX } from 'react-icons/fi'
import { useLocation } from 'react-router-dom'
import { toast } from 'react-toastify'
import { orderApi } from '../Api/order.api'
import { walletApi } from '../Api/wallet.api'
import { useAuth } from '../Hooks/useAuth'
import { formatDate } from '../utils/date.utils'
import { formatUrl } from '../utils/url.utils'

/* ── Types (unchanged) ── */
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
    | 'PENDING'
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
  finalOrderTotal: number
  totalAddOnPrice: number
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
  } | null
}
interface OrderProduct {
  orderProductId: number
  productId: number
  productName: string
  productImage: string
  productBasePrice: number
  productSellingPrice: number
  productQuantity: number
  productVariant: Record<string, string>
  selectedAddOns: Array<{ id: string; name: string; price: number }>
  totalAddOnPrice: number
  finalProductPrice: number
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

/* ── Status badge ── */
const StatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, { label: string; cls: string }> = {
    UNPAID: { label: 'আনপেইড', cls: 'bg-amber-50 text-amber-600 border-amber-200' },
    PAID: { label: 'পেইড', cls: 'bg-blue-50 text-blue-600 border-blue-200' },
    PENDING: { label: 'পেন্ডিং', cls: 'bg-gray-100 text-gray-500 border-gray-200' },
    CONFIRMED: { label: 'কনফার্মড', cls: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
    PROCESSING: { label: 'প্রসেসিং', cls: 'bg-indigo-50 text-indigo-600 border-indigo-200' },
    DELIVERED: { label: 'শিপড', cls: 'bg-purple-50 text-purple-600 border-purple-200' },
    COMPLETED: { label: 'কমপ্লিটেড', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    CANCELLED: { label: 'ক্যানসেল্ড', cls: 'bg-red-50 text-red-500 border-red-200' },
    RETURNED: { label: 'ফেরত', cls: 'bg-orange-50 text-orange-600 border-orange-200' },
    REJECTED: { label: 'রিজেক্টেড', cls: 'bg-red-50 text-red-500 border-red-200' },
    REFUNDED: { label: 'রিফান্ডেড', cls: 'bg-teal-50 text-teal-600 border-teal-200' },
    FAILED: { label: 'ফেইলড', cls: 'bg-pink-50 text-pink-600 border-pink-200' },
  }
  const { label, cls } = map[status] || {
    label: status,
    cls: 'bg-gray-100 text-gray-500 border-gray-200',
  }
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${cls}`}
    >
      {label}
    </span>
  )
}

/* ── Modal backdrop ── */
const ModalBackdrop = ({
  onClose,
  children,
}: {
  onClose: () => void
  children: React.ReactNode
}) => (
  <div
    className='fixed inset-0 z-50 flex items-end justify-center bg-[#1a1a2e]/70 backdrop-blur-sm sm:items-center sm:p-4'
    onClick={onClose}
  >
    <div onClick={e => e.stopPropagation()} className='w-full max-w-lg'>
      {children}
    </div>
  </div>
)

/* ── Main component ── */
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
  const [savedWallets, setSavedWallets] = useState<SystemWallet[]>([])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      let statusParam: string[] = []
      if (activeTab === 'pending') statusParam = ['UNPAID', 'PAID', 'FAILED', 'PENDING']
      else if (activeTab === 'confirmed') statusParam = ['CONFIRMED', 'DELIVERED']
      else if (activeTab === 'completed') statusParam = ['COMPLETED']
      else statusParam = ['CANCELLED', 'RETURNED', 'REJECTED', 'REFUNDED']
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
      } else toast.error(response.message || 'অর্ডার লোড করতে সমস্যা হয়েছে')
    } catch {
      toast.error('একটি ত্রুটি ঘটেছে')
    } finally {
      setLoading(false)
    }
  }

  const fetchSystemWallets = async () => {
    try {
      setWalletLoading(true)
      const response = await walletApi.getSystemWallets()
      if (response.success) setSystemWallets(response.data)
      else toast.error(response.message || 'ওয়ালেট লোড করতে সমস্যা হয়েছে')
    } catch {
      toast.error('ওয়ালেট লোড করতে সমস্যা হয়েছে')
    } finally {
      setWalletLoading(false)
    }
  }

  const fetchSellersWallets = async () => {
    try {
      const response = await walletApi.getWalletsOfASeller(user?.phoneNo!)
      if (response.success) setSavedWallets(response.data)
    } catch {}
  }

  useEffect(() => {
    fetchOrders()
  }, [activeTab, pagination.currentPage, pagination.pageSize, searchQuery])
  useEffect(() => {
    if (showPaymentModal) fetchSystemWallets()
  }, [showPaymentModal])
  useEffect(() => {
    reloadUser()
    fetchSellersWallets()
  }, [])
  useEffect(() => {
    reloadUser()
  }, [showPaymentModal])

  const handleConfirmOrder = async (orderId: number) => {
    try {
      setActionLoading({ type: 'confirm', id: orderId })
      const response = await orderApi.confirmOrderBySeller(orderId)
      if (response.success) {
        toast.success('অর্ডার নিশ্চিত করা হয়েছে')
        fetchOrders()
        setShowPaymentModal(false)
      } else setError(response.message || 'অর্ডার নিশ্চিত করতে ব্যর্থ হয়েছে')
    } catch {
      setError('একটি ত্রুটি ঘটেছে')
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
      } else setError(response.message || 'অর্ডার বাতিল করতে ব্যর্থ হয়েছে')
    } catch {
      setError('একটি ত্রুটি ঘটেছে')
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
      if (response.success) {
        toast.success('পেমেন্ট সফল হয়েছে')
        fetchOrders()
        setShowPaymentModal(false)
        resetPaymentForm()
      } else setError(response.message || 'পেমেন্ট করতে ব্যর্থ হয়েছে')
    } catch {
      setError('একটি ত্রুটি ঘটেছে')
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
      } else toast.error(response.message || 'পুনরায় অর্ডার করতে ব্যর্থ হয়েছে')
    } catch {
      toast.error('একটি ত্রুটি ঘটেছে')
    } finally {
      setActionLoading({ type: null, id: null })
    }
  }

  const canCancelOrder = (order: Order) =>
    ['UNPAID', 'PAID', 'PENDING'].includes(order.orderStatus) && !order.cancelled

  const tabs = [
    { id: 'pending', label: 'পেন্ডিং' },
    { id: 'confirmed', label: 'কনফার্মড' },
    { id: 'completed', label: 'কমপ্লিটেড' },
    { id: 'others', label: 'অন্যান্য' },
  ] as const

  const isConfirmLoading = (id: number) =>
    actionLoading.type === 'confirm' && actionLoading.id === id
  const isCancelLoading = (id: number) => actionLoading.type === 'cancel' && actionLoading.id === id
  const isPaymentLoading = (id: number) =>
    actionLoading.type === 'payment' && actionLoading.id === id
  const isReorderLoading = (id: number) =>
    actionLoading.type === 'reorder' && actionLoading.id === id

  const ActionBtn = ({ onClick, disabled, className, children }: any) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-semibold transition active:scale-95 disabled:opacity-50 ${className}`}
    >
      {children}
    </button>
  )

  const renderActions = (order: Order) => (
    <div className='flex flex-wrap items-center gap-1.5'>
      <ActionBtn
        onClick={() => {
          setSelectedOrder(order)
          setShowDetailModal(true)
        }}
        className='border border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
      >
        <FaEye className='h-3 w-3' /> বিস্তারিত
      </ActionBtn>

      {['UNPAID', 'PAID', 'PENDING'].includes(order.orderStatus) && !order.cancelled && (
        <>
          {order.orderStatus === 'UNPAID' && (
            <ActionBtn
              onClick={() => {
                setSelectedOrder(order)
                setShowPaymentModal(true)
              }}
              disabled={isConfirmLoading(order.orderId) || order.cancelled}
              className='bg-emerald-500 text-white hover:bg-emerald-600'
            >
              <FaMoneyBillWave className='h-3 w-3' />
              {isConfirmLoading(order.orderId)
                ? 'প্রক্রিয়াধীন...'
                : order.sellerVerified
                  ? 'কনফার্ম করুন'
                  : 'পেমেন্ট করুন'}
            </ActionBtn>
          )}
          {canCancelOrder(order) && (
            <ActionBtn
              onClick={() => {
                setSelectedOrder(order)
                setShowCancelModal(true)
              }}
              disabled={isCancelLoading(order.orderId) || order.cancelled}
              className={
                order.cancelled
                  ? 'cursor-not-allowed bg-gray-200 text-gray-400'
                  : 'bg-red-50 text-[#e94560] border border-red-200 hover:bg-red-100'
              }
            >
              {order.cancelled
                ? 'বাতিল'
                : isCancelLoading(order.orderId)
                  ? 'প্রক্রিয়াধীন...'
                  : 'বাতিল করুন'}
            </ActionBtn>
          )}
        </>
      )}

      {order.orderStatus === 'FAILED' && (
        <ActionBtn
          onClick={() => handleReorder(order.orderId)}
          disabled={isReorderLoading(order.orderId)}
          className='bg-[#1a1a2e] text-white hover:bg-[#16213e]'
        >
          <FaRedo className='h-3 w-3' />
          {isReorderLoading(order.orderId) ? 'প্রক্রিয়াধীন...' : 'পুনরায় অর্ডার'}
        </ActionBtn>
      )}
    </div>
  )

  const Spinner = () => (
    <div className='flex min-h-[40vh] items-center justify-center'>
      <div className='relative h-10 w-10'>
        <div className='absolute inset-0 rounded-full border-2 border-gray-200' />
        <div className='absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-[#e94560]' />
      </div>
    </div>
  )

  return (
    <div className='min-h-screen bg-[#f7f6f3]'>
      {/* ── Page header ── */}
      <div className='border-b border-gray-100 bg-white'>
        <div className='px-4 py-5 sm:px-6'>
          <h1 className='font-serif text-2xl font-bold text-[#1a1a2e]'>আমার অর্ডারসমূহ</h1>
          <p className='mt-0.5 text-[13px] text-gray-400'>
            {pagination.totalOrders} টি অর্ডার পাওয়া গেছে
          </p>
        </div>
      </div>

      <div className='px-4 py-5 sm:px-6'>
        {/* ── Search ── */}
        <div className='mb-4 relative'>
          <FaSearch className='absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400' />
          <input
            type='text'
            placeholder='কাস্টমারের নাম বা ফোন নম্বর দিয়ে খুঁজুন...'
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className='w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-[13px] text-[#1a1a2e] outline-none transition focus:border-[#e94560]/40 focus:ring-2 focus:ring-[#e94560]/10 placeholder:text-gray-400'
          />
        </div>

        {/* ── Tabs ── */}
        <div className='mb-4 flex gap-1 overflow-x-auto rounded-xl border border-gray-100 bg-white p-1 scrollbar-none'>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id)
                setPagination(p => ({ ...p, currentPage: 1 }))
              }}
              className={`flex-shrink-0 rounded-lg px-4 py-2 text-[12px] font-semibold transition-all ${
                activeTab === tab.id
                  ? 'bg-[#e94560] text-white shadow-[0_4px_12px_rgba(233,69,96,0.25)]'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Page size ── */}
        <div className='mb-4 flex items-center justify-end gap-2'>
          <span className='text-[12px] text-gray-400'>প্রতি পাতায়:</span>
          <select
            value={pagination.pageSize}
            onChange={e =>
              setPagination(prev => ({ ...prev, pageSize: Number(e.target.value), currentPage: 1 }))
            }
            className='rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-[12px] text-[#1a1a2e] outline-none focus:border-[#e94560]/40 focus:ring-2 focus:ring-[#e94560]/10'
          >
            <option value='5'>৫টি</option>
            <option value='10'>১০টি</option>
            <option value='20'>২০টি</option>
          </select>
        </div>

        {/* ── Content ── */}
        {loading ? (
          <Spinner />
        ) : orders.length === 0 ? (
          <div className='flex flex-col items-center justify-center rounded-3xl border border-gray-100 bg-white py-16 text-center'>
            <div className='mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-50'>
              <FaSearch className='h-6 w-6 text-gray-300' />
            </div>
            <p className='text-[14px] font-medium text-gray-500'>কোনো অর্ডার পাওয়া যায়নি</p>
          </div>
        ) : (
          <div className='overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm'>
            {/* Mobile cards */}
            <div className='divide-y divide-gray-50 md:hidden'>
              {orders.map(order => (
                <div key={order.orderId} className='p-4'>
                  <div className='mb-3 flex items-start justify-between gap-3'>
                    <div>
                      <div className='flex items-center gap-2'>
                        <span className='text-[13px] font-bold text-[#1a1a2e]'>
                          #{order.orderId}
                        </span>
                        {order.cancelled && (
                          <span className='text-[10px] font-medium text-[#e94560]'>বাতিল</span>
                        )}
                      </div>
                      <p className='mt-0.5 text-[12px] font-medium text-gray-700'>
                        {order.customerName}
                      </p>
                      <p className='text-[11px] text-gray-400'>{order.customerPhoneNo}</p>
                      <p className='mt-0.5 text-[10px] text-gray-400'>
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <StatusBadge status={order.orderStatus} />
                  </div>

                  <div className='mb-3 grid grid-cols-2 gap-2 rounded-xl bg-gray-50 p-3'>
                    {[
                      { label: 'মোট মূল্য', value: `${order.finalOrderTotal}৳` },
                      { label: 'ডেলিভারি', value: `${order.deliveryCharge}৳` },
                      { label: 'পণ্য সংখ্যা', value: `${order.totalProductQuantity} টি` },
                      {
                        label: 'কমিশন',
                        value: `${order.actualCommission || order.totalCommission}৳`,
                      },
                    ].map(({ label, value }) => (
                      <div key={label}>
                        <p className='text-[10px] text-gray-400'>{label}</p>
                        <p className='text-[12px] font-semibold text-[#1a1a2e]'>{value}</p>
                      </div>
                    ))}
                  </div>

                  {renderActions(order)}
                </div>
              ))}
            </div>

            {/* Desktop table */}
            <div className='hidden overflow-x-auto md:block'>
              <table className='w-full'>
                <thead>
                  <tr className='border-b border-gray-50 bg-gray-50/60'>
                    {['তারিখ', 'অর্ডার', 'কাস্টমার', 'মোট মূল্য', 'স্ট্যাটাস', 'অ্যাকশন'].map(h => (
                      <th
                        key={h}
                        className='px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-[0.5px] text-gray-400'
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className='divide-y divide-gray-50'>
                  {orders.map(order => (
                    <tr key={order.orderId} className='group transition hover:bg-gray-50/50'>
                      <td className='px-5 py-4 text-[12px] text-gray-400'>
                        {formatDate(order.createdAt)}
                      </td>
                      <td className='px-5 py-4'>
                        <span className='text-[13px] font-bold text-[#1a1a2e]'>
                          #{order.orderId}
                        </span>
                        {order.cancelled && (
                          <span className='ml-1.5 text-[10px] font-medium text-[#e94560]'>
                            বাতিল
                          </span>
                        )}
                      </td>
                      <td className='px-5 py-4'>
                        <p className='text-[13px] font-medium text-[#1a1a2e]'>
                          {order.customerName}
                        </p>
                        <p className='text-[11px] text-gray-400'>{order.customerPhoneNo}</p>
                      </td>
                      <td className='px-5 py-4 text-[13px] font-semibold text-[#1a1a2e]'>
                        {order.finalOrderTotal}৳
                      </td>
                      <td className='px-5 py-4'>
                        <StatusBadge status={order.orderStatus} />
                      </td>
                      <td className='px-5 py-4'>{renderActions(order)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className='flex items-center justify-between border-t border-gray-50 px-5 py-4'>
                <p className='text-[12px] text-gray-400'>
                  {(pagination.currentPage - 1) * pagination.pageSize + 1}–
                  {Math.min(pagination.currentPage * pagination.pageSize, pagination.totalOrders)} /{' '}
                  {pagination.totalOrders} টি
                </p>
                <div className='flex items-center gap-1.5'>
                  <button
                    onClick={() =>
                      setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))
                    }
                    disabled={pagination.currentPage === 1}
                    className='flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition hover:border-[#e94560]/30 hover:text-[#e94560] disabled:opacity-40'
                  >
                    <FiChevronLeft className='h-3.5 w-3.5' />
                  </button>
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    let p =
                      pagination.totalPages <= 5
                        ? i + 1
                        : pagination.currentPage <= 3
                          ? i + 1
                          : pagination.currentPage >= pagination.totalPages - 2
                            ? pagination.totalPages - 4 + i
                            : pagination.currentPage - 2 + i
                    return (
                      <button
                        key={p}
                        onClick={() => setPagination(prev => ({ ...prev, currentPage: p }))}
                        className={`flex h-8 w-8 items-center justify-center rounded-lg text-[12px] font-medium transition ${p === pagination.currentPage ? 'bg-[#e94560] text-white shadow-sm' : 'border border-gray-200 bg-white text-gray-600 hover:border-[#e94560]/30 hover:text-[#e94560]'}`}
                      >
                        {p}
                      </button>
                    )
                  })}
                  <button
                    onClick={() =>
                      setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))
                    }
                    disabled={pagination.currentPage === pagination.totalPages}
                    className='flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition hover:border-[#e94560]/30 hover:text-[#e94560] disabled:opacity-40'
                  >
                    <FiChevronRight className='h-3.5 w-3.5' />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ════ CANCEL MODAL ════ */}
      {showCancelModal && selectedOrder && (
        <ModalBackdrop
          onClose={() => {
            setShowCancelModal(false)
            setCancelReason('')
            setError('')
          }}
        >
          <div className='overflow-hidden rounded-t-3xl bg-white sm:rounded-3xl'>
            <div className='flex items-center justify-between border-b border-gray-50 px-5 py-4'>
              <h2 className='text-[15px] font-bold text-[#e94560]'>অর্ডার বাতিল করুন</h2>
              <button
                onClick={() => {
                  setShowCancelModal(false)
                  setCancelReason('')
                  setError('')
                }}
                className='flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition hover:bg-gray-200'
              >
                <FiX className='h-4 w-4' />
              </button>
            </div>
            <div className='px-5 py-4'>
              <p className='mb-3 text-[13px] text-gray-600'>
                আপনি কি নিশ্চিতভাবে অর্ডার{' '}
                <span className='font-bold text-[#1a1a2e]'>#{selectedOrder.orderId}</span> বাতিল
                করতে চান?
              </p>
              <div>
                <label className='mb-1.5 block text-[12px] font-semibold uppercase tracking-wider text-gray-400'>
                  কারণ
                </label>
                <textarea
                  rows={3}
                  placeholder='বাতিল করার কারণ লিখুন...'
                  value={cancelReason}
                  onChange={e => setCancelReason(e.target.value)}
                  className='w-full resize-none rounded-xl border border-gray-200 px-3.5 py-2.5 text-[13px] text-[#1a1a2e] outline-none transition focus:border-[#e94560]/40 focus:ring-2 focus:ring-[#e94560]/10 placeholder:text-gray-400'
                />
              </div>
              {error && (
                <div className='mt-3 flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-3.5 py-2.5'>
                  <FiAlertCircle className='h-3.5 w-3.5 shrink-0 text-red-500' />
                  <p className='text-[12px] text-red-600'>{error}</p>
                </div>
              )}
            </div>
            <div className='flex gap-3 border-t border-gray-50 px-5 py-4'>
              <button
                onClick={() => {
                  setShowCancelModal(false)
                  setCancelReason('')
                  setError('')
                }}
                className='flex-1 rounded-xl border border-gray-200 py-2.5 text-[13px] font-medium text-gray-600 transition hover:bg-gray-50'
              >
                বাদ দিন
              </button>
              <button
                onClick={handleCancelOrder}
                disabled={isCancelLoading(selectedOrder.orderId)}
                className='flex-1 rounded-xl bg-[#e94560] py-2.5 text-[13px] font-semibold text-white transition hover:bg-[#c73652] disabled:opacity-50'
              >
                {isCancelLoading(selectedOrder.orderId) ? 'প্রক্রিয়াধীন...' : 'বাতিল করুন'}
              </button>
            </div>
          </div>
        </ModalBackdrop>
      )}

      {/* ════ PAYMENT MODAL ════ */}
      {showPaymentModal && selectedOrder && (
        <div className='fixed inset-0 z-50 flex items-end justify-center bg-[#1a1a2e]/70 backdrop-blur-sm sm:items-center sm:p-4'>
          <div
            className='w-full max-w-lg overflow-hidden rounded-t-3xl bg-white sm:rounded-3xl'
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className='flex items-center justify-between border-b border-gray-50 px-5 py-4'>
              <div>
                <h2 className='text-[15px] font-bold text-[#1a1a2e]'>
                  {selectedOrder.sellerVerified ? 'অর্ডার কনফার্মেশন' : 'অর্ডার পেমেন্ট'}
                </h2>
                <p className='text-[12px] text-gray-400'>অর্ডার #{selectedOrder.orderId}</p>
              </div>
              <button
                onClick={() => {
                  setShowPaymentModal(false)
                  resetPaymentForm()
                }}
                className='flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition hover:bg-gray-200'
              >
                <FiX className='h-4 w-4' />
              </button>
            </div>

            {/* Scrollable body */}
            <div className='max-h-[70vh] space-y-4 overflow-y-auto px-5 py-4'>
              {/* Warning */}
              <div className='rounded-xl border border-amber-200 bg-amber-50 p-4'>
                <p className='mb-2 text-[11px] font-bold uppercase tracking-wider text-amber-700'>
                  নির্দেশনা
                </p>
                <ol className='space-y-1 text-[12px] text-amber-700'>
                  <li>
                    ১. ডেলিভারি চার্জ অগ্রিম পেমেন্ট করলে বিক্রয় মূল্যের সাথে চার্জ যোগ হবে না।
                  </li>
                  <li>২. না করলে ডেলিভারি চার্জ যোগ হবে।</li>
                  <li>৩. ভুল তথ্য দিলে অর্ডার রিজেক্ট ও অ্যাকাউন্ট ব্লক হবে।</li>
                </ol>
              </div>

              {selectedOrder.sellerVerified && (
                <div className='flex items-start gap-2.5 rounded-xl border border-blue-100 bg-blue-50 px-3.5 py-3'>
                  <div className='mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100'>
                    <span className='text-[10px] font-bold text-blue-600'>i</span>
                  </div>
                  <p className='text-[12px] text-blue-700'>
                    আপনি চাইলে পেমেন্ট ছাড়াই অর্ডার কনফার্ম করতে পারবেন
                  </p>
                </div>
              )}

              {/* Delivery charge */}
              <div className='flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-4 py-3.5'>
                <span className='text-[13px] font-medium text-gray-600'>ডেলিভারি চার্জ</span>
                <span className='text-xl font-bold text-emerald-600'>
                  {selectedOrder.deliveryCharge}৳
                </span>
              </div>

              {/* Quick confirm for verified */}
              {selectedOrder.sellerVerified && (
                <>
                  <button
                    onClick={() => handleConfirmOrder(selectedOrder.orderId)}
                    disabled={isConfirmLoading(selectedOrder.orderId)}
                    className='flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 text-[14px] font-semibold text-white transition hover:bg-emerald-600 disabled:opacity-50'
                  >
                    {isConfirmLoading(selectedOrder.orderId) ? (
                      <>
                        <span className='h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white' />{' '}
                        প্রক্রিয়াধীন...
                      </>
                    ) : (
                      <>
                        <FiCheck className='h-4 w-4' /> কনফার্ম করুন (পেমেন্ট ছাড়া)
                      </>
                    )}
                  </button>
                  <div className='flex items-center gap-3'>
                    <div className='h-px flex-1 bg-gray-200' />
                    <span className='text-[12px] text-gray-400'>অথবা</span>
                    <div className='h-px flex-1 bg-gray-200' />
                  </div>
                </>
              )}

              {/* Payment method */}
              <div className='space-y-2'>
                <p className='text-[12px] font-semibold uppercase tracking-wider text-gray-400'>
                  পেমেন্ট মেথড
                </p>
                {[
                  {
                    value: 'BALANCE',
                    label: 'ব্যালেন্স থেকে পেমেন্ট',
                    sub: `ব্যালেন্স: ${user?.balance || 0}৳`,
                    disabled: (user?.balance || 0) < +selectedOrder.deliveryCharge,
                  },
                  {
                    value: 'WALLET',
                    label: 'মোবাইল ওয়ালেট',
                    sub: 'bKash, Nagad',
                    disabled: false,
                  },
                ].map(({ value, label, sub, disabled }) => (
                  <label
                    key={value}
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 p-3.5 transition ${paymentMethod === value ? 'border-[#e94560] bg-[#e94560]/5' : 'border-gray-200 hover:border-gray-300'} ${disabled ? 'opacity-50' : ''}`}
                  >
                    <input
                      type='radio'
                      name='paymentMethod'
                      value={value}
                      checked={paymentMethod === value}
                      onChange={() => setPaymentMethod(value as any)}
                      disabled={disabled}
                      className='accent-[#e94560]'
                    />
                    <div>
                      <p className='text-[13px] font-medium text-[#1a1a2e]'>{label}</p>
                      <p className='text-[11px] text-gray-400'>{sub}</p>
                      {disabled && (
                        <p className='text-[11px] text-[#e94560]'>অপর্যাপ্ত ব্যালেন্স</p>
                      )}
                    </div>
                  </label>
                ))}
              </div>

              {/* Wallet details */}
              {paymentMethod === 'WALLET' && (
                <div className='space-y-3 rounded-xl border border-gray-100 bg-gray-50 p-4'>
                  <p className='text-[12px] font-semibold uppercase tracking-wider text-gray-400'>
                    পেমেন্ট বিস্তারিত
                  </p>

                  <div>
                    <label className='mb-1.5 block text-[12px] font-medium text-gray-600'>
                      সিস্টেম ওয়ালেট
                    </label>
                    <select
                      value={selectedSystemWallet?.walletId || ''}
                      onChange={e => {
                        const w = systemWallets.find(w => w.walletId === parseInt(e.target.value))
                        setSelectedSystemWallet(w || null)
                      }}
                      disabled={walletLoading}
                      className='w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-[13px] text-[#1a1a2e] outline-none focus:border-[#e94560]/40 focus:ring-2 focus:ring-[#e94560]/10'
                    >
                      <option value=''>একটি ওয়ালেট নির্বাচন করুন</option>
                      {systemWallets.map(w => (
                        <option key={w.walletId} value={w.walletId}>
                          {w.walletName} - {w.walletPhoneNo}
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedSystemWallet && (
                    <div className='rounded-xl border-2 border-dashed border-emerald-300 bg-emerald-50 p-4 text-center'>
                      <p className='text-[12px] font-medium text-emerald-700'>
                        {selectedSystemWallet.walletName} এ সেন্ড মানি করুন
                      </p>
                      <p className='mt-1 text-lg font-bold text-emerald-700'>
                        {selectedSystemWallet.walletPhoneNo}
                      </p>
                      <p className='mt-1 text-xl font-bold text-emerald-800'>
                        পরিমাণ: {selectedOrder.deliveryCharge}৳
                      </p>
                    </div>
                  )}

                  <div className='relative'>
                    <label className='mb-1.5 block text-[12px] font-medium text-gray-600'>
                      আপনার {selectedSystemWallet?.walletName || 'ওয়ালেট'} নম্বর
                    </label>
                    <input
                      type='tel'
                      placeholder='যে নম্বর থেকে পেমেন্ট করেছেন'
                      value={sellerWalletPhoneNo}
                      onChange={e => {
                        const v = e.target.value.replace(/\D/g, '').slice(0, 11)
                        setSellerWalletPhoneNo(v)
                        setShowSuggestions(v.length > 0)
                      }}
                      className='w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-[13px] outline-none focus:border-[#e94560]/40 focus:ring-2 focus:ring-[#e94560]/10'
                    />
                    {showSuggestions && savedWallets.length > 0 && (
                      <div className='absolute z-10 mt-1 max-h-32 w-full overflow-y-auto rounded-xl border border-gray-100 bg-white shadow-lg'>
                        {savedWallets
                          .filter(
                            w =>
                              w.walletPhoneNo.includes(sellerWalletPhoneNo) &&
                              w.walletName.toLowerCase() ===
                                selectedSystemWallet?.walletName?.toLowerCase()
                          )
                          .map((w, i) => (
                            <div
                              key={i}
                              onClick={() => {
                                setSellerWalletPhoneNo(w.walletPhoneNo)
                                setShowSuggestions(false)
                              }}
                              className='cursor-pointer px-4 py-2.5 text-[12px] hover:bg-gray-50'
                            >
                              {w.walletName} ({w.walletPhoneNo})
                            </div>
                          ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className='mb-1.5 block text-[12px] font-medium text-gray-600'>
                      ট্রানজেকশন আইডি
                    </label>
                    <input
                      type='text'
                      placeholder='পেমেন্ট করার পর ট্রানজেকশন আইডি লিখুন'
                      value={transactionId}
                      onChange={e => setTransactionId(e.target.value.trim())}
                      className='w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-[13px] outline-none focus:border-[#e94560]/40 focus:ring-2 focus:ring-[#e94560]/10'
                    />
                  </div>
                </div>
              )}

              {error && (
                <div className='flex items-center gap-2.5 rounded-xl border border-red-100 bg-red-50 px-3.5 py-3'>
                  <FiAlertCircle className='h-4 w-4 shrink-0 text-red-500' />
                  <p className='text-[12px] text-red-600'>{error}</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className='space-y-2 border-t border-gray-50 px-5 py-4'>
              {(!selectedOrder.sellerVerified || paymentMethod) && (
                <button
                  onClick={handlePayment}
                  disabled={isPaymentLoading(selectedOrder.orderId)}
                  className='flex w-full items-center justify-center gap-2 rounded-xl bg-[#e94560] py-3 text-[14px] font-semibold text-white transition hover:bg-[#c73652] disabled:opacity-50'
                >
                  {isPaymentLoading(selectedOrder.orderId) ? (
                    <>
                      <span className='h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white' />{' '}
                      প্রক্রিয়াধীন...
                    </>
                  ) : paymentMethod === 'BALANCE' ? (
                    'ব্যালেন্স থেকে পেমেন্ট করুন'
                  ) : paymentMethod === 'WALLET' ? (
                    'ওয়ালেট পেমেন্ট কনফার্ম করুন'
                  ) : (
                    'পেমেন্ট করুন'
                  )}
                </button>
              )}
              <button
                onClick={() => {
                  setShowPaymentModal(false)
                  resetPaymentForm()
                }}
                className='w-full rounded-xl border border-gray-200 py-2.5 text-[13px] font-medium text-gray-600 transition hover:bg-gray-50'
              >
                বাতিল করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════ DETAIL MODAL ════ */}
      {showDetailModal && selectedOrder && (
        <div className='fixed inset-0 z-50 flex items-end justify-center bg-[#1a1a2e]/70 backdrop-blur-sm sm:items-center sm:p-4'>
          <div
            className='w-full max-w-2xl overflow-hidden rounded-t-3xl bg-white sm:rounded-3xl'
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className='flex items-center justify-between border-b border-gray-50 px-5 py-4'>
              <div className='flex items-center gap-3'>
                <h2 className='font-serif text-lg font-bold text-[#1a1a2e]'>
                  অর্ডার #{selectedOrder.orderId}
                </h2>
                <StatusBadge status={selectedOrder.orderStatus} />
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className='flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition hover:bg-gray-200'
              >
                <FiX className='h-4 w-4' />
              </button>
            </div>

            {/* Scrollable content */}
            <div className='max-h-[75vh] space-y-4 overflow-y-auto px-5 py-4'>
              {/* Meta */}
              <p className='text-[11px] text-gray-400'>{formatDate(selectedOrder.createdAt)}</p>

              {/* Shop & Customer */}
              <div className='rounded-2xl border border-gray-100 bg-gray-50 p-4 space-y-3'>
                <div className='flex items-center gap-2'>
                  <div className='flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white'>
                    <FaStore className='h-3 w-3 text-gray-400' />
                  </div>
                  <p className='text-[13px] font-semibold text-[#1a1a2e]'>
                    {selectedOrder.shopName}{' '}
                    <span className='font-normal text-gray-400'>
                      — {selectedOrder.shopLocation}
                    </span>
                  </p>
                </div>
                <div className='border-t border-gray-100' />
                <div className='flex items-center gap-2'>
                  <div className='flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white'>
                    <FaUser className='h-3 w-3 text-gray-400' />
                  </div>
                  <p className='text-[13px] font-semibold text-[#1a1a2e]'>
                    {selectedOrder.customerName}{' '}
                    <span className='font-normal text-gray-400'>
                      ({selectedOrder.customerPhoneNo})
                    </span>
                  </p>
                </div>
                <div className='ml-9 space-y-1.5'>
                  <p className='text-[12px] text-gray-500'>
                    {selectedOrder.customerUpazilla}, {selectedOrder.customerZilla}
                  </p>
                  <div className='flex items-start gap-1.5'>
                    <FaMapMarkerAlt className='mt-0.5 h-3 w-3 shrink-0 text-gray-400' />
                    <p className='text-[12px] text-gray-500'>{selectedOrder.customerAddress}</p>
                  </div>
                  {selectedOrder.customerComments && (
                    <div className='flex items-start gap-1.5'>
                      <FaComment className='mt-0.5 h-3 w-3 shrink-0 text-gray-400' />
                      <p className='text-[12px] text-gray-500'>{selectedOrder.customerComments}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Tracking */}
              {selectedOrder.trackingUrl && (
                <div className='rounded-2xl border border-gray-100 bg-gray-50 p-4'>
                  <p className='mb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400'>
                    ট্র্যাকিং লিঙ্ক
                  </p>
                  <div className='flex items-center gap-2'>
                    <a
                      href={formatUrl(selectedOrder.trackingUrl)}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='flex-1 truncate rounded-lg border border-gray-200 bg-white px-3 py-2 text-[12px] text-blue-500 hover:underline'
                    >
                      {selectedOrder.trackingUrl}
                    </a>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(selectedOrder.trackingUrl || '')
                        toast.success('লিঙ্ক কপি করা হয়েছে')
                      }}
                      className='flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-[11px] font-medium text-gray-600 transition hover:bg-gray-50'
                    >
                      কপি
                    </button>
                  </div>
                </div>
              )}

              {/* Products */}
              <div className='rounded-2xl border border-gray-100 bg-gray-50 p-4'>
                <p className='mb-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400'>
                  পণ্য তালিকা
                </p>
                <div className='space-y-3'>
                  {selectedOrder.OrderProduct.map(product => (
                    <div
                      key={product.orderProductId}
                      className='flex gap-3 border-b border-gray-100 pb-3 last:border-0 last:pb-0'
                    >
                      <div className='h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-gray-200'>
                        <img
                          src={product.productImage}
                          alt={product.productName}
                          className='h-full w-full object-cover'
                        />
                      </div>
                      <div className='flex-1 min-w-0'>
                        <h4 className='text-[13px] font-semibold text-[#1a1a2e]'>
                          {product.productName}
                        </h4>
                        <p className='text-[12px] text-gray-500'>
                          {product.productSellingPrice}৳ × {product.productQuantity} টি
                        </p>
                        {Object.entries(product.productVariant || {}).length > 0 && (
                          <div className='mt-1 flex flex-wrap gap-1'>
                            {Object.entries(product.productVariant).map(([k, v]) => (
                              <span
                                key={k}
                                className='rounded-full bg-white border border-gray-100 px-2 py-0.5 text-[10px] text-gray-500'
                              >
                                {k}: {v}
                              </span>
                            ))}
                          </div>
                        )}
                        {product.selectedAddOns?.length > 0 && (
                          <div className='mt-1.5'>
                            {product.selectedAddOns.map(a => (
                              <p key={a.id} className='text-[11px] text-blue-500'>
                                • {a.name} (+৳{a.price})
                              </p>
                            ))}
                            <p className='text-[11px] font-semibold text-blue-500'>
                              মোট: +৳{product.totalAddOnPrice}
                            </p>
                          </div>
                        )}
                      </div>
                      <div className='shrink-0 text-right'>
                        <p className='text-[13px] font-bold text-[#1a1a2e]'>
                          {product.finalProductPrice}৳
                        </p>
                        <p className='text-[10px] text-gray-400'>
                          {product.productSellingPrice * product.productQuantity}৳
                          {product.totalAddOnPrice > 0 && ` +${product.totalAddOnPrice}৳`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add-ons summary */}
              {selectedOrder.totalAddOnPrice > 0 && (
                <div className='flex items-center justify-between rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3.5'>
                  <p className='text-[13px] text-blue-700'>মোট অতিরিক্ত সামগ্রী</p>
                  <p className='text-lg font-bold text-blue-700'>
                    +৳{selectedOrder.totalAddOnPrice}
                  </p>
                </div>
              )}

              {/* Payment + Summary grid */}
              <div className='grid gap-4 sm:grid-cols-2'>
                {selectedOrder.Payment && (
                  <div className='rounded-2xl border border-gray-100 bg-gray-50 p-4'>
                    <p className='mb-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400'>
                      পেমেন্ট তথ্য
                    </p>
                    <div className='space-y-2'>
                      {[
                        {
                          label: 'পেমেন্ট পদ্ধতি',
                          value:
                            selectedOrder.paymentType === 'BALANCE'
                              ? 'ব্যালেন্স'
                              : selectedOrder.paymentType === 'WALLET'
                                ? 'ওয়ালেট'
                                : 'N/A',
                        },
                        {
                          label: 'স্ট্যাটাস',
                          value:
                            selectedOrder.Payment.paymentStatus === 'PENDING'
                              ? 'পেন্ডিং'
                              : selectedOrder.Payment.paymentStatus === 'COMPLETED'
                                ? 'কমপ্লিটেড'
                                : selectedOrder.Payment.paymentStatus === 'REJECTED'
                                  ? 'রিজেক্টেড'
                                  : selectedOrder.Payment.paymentStatus,
                        },
                        ...(selectedOrder.paymentType === 'WALLET'
                          ? [
                              {
                                label: 'সিস্টেম ওয়ালেট',
                                value: `${selectedOrder.Payment.userWalletName || 'N/A'} (${selectedOrder.Payment.systemWalletPhoneNo || 'N/A'})`,
                              },
                              {
                                label: 'বিক্রেতা ওয়ালেট',
                                value: `${selectedOrder.Payment.userWalletName || 'N/A'} (${selectedOrder.Payment.userWalletPhoneNo || 'N/A'})`,
                              },
                              {
                                label: 'ট্রানজেকশন আইডি',
                                value: selectedOrder.Payment.transactionId || 'N/A',
                              },
                            ]
                          : []),
                      ].map(({ label, value }) => (
                        <div key={label} className='flex items-start justify-between gap-2'>
                          <span className='text-[11px] text-gray-400 shrink-0'>{label}</span>
                          <span className='text-[11px] font-medium text-[#1a1a2e] text-right'>
                            {value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className='rounded-2xl border border-gray-100 bg-gray-50 p-4'>
                  <p className='mb-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400'>
                    মূল্য সারাংশ
                  </p>
                  <div className='space-y-2'>
                    {[
                      {
                        label: 'পণ্যের মূল্য',
                        value: `${selectedOrder.totalProductSellingPrice}৳`,
                      },
                      ...(selectedOrder.totalAddOnPrice > 0
                        ? [
                            {
                              label: 'অতিরিক্ত সামগ্রী',
                              value: `+${selectedOrder.totalAddOnPrice}৳`,
                            },
                          ]
                        : []),
                      { label: 'ডেলিভারি চার্জ', value: `${selectedOrder.deliveryCharge}৳` },
                      ...(!selectedOrder.amountPaidByCustomer
                        ? [{ label: 'কমিশন', value: `${selectedOrder.totalCommission}৳` }]
                        : []),
                    ].map(({ label, value }) => (
                      <div key={label} className='flex justify-between'>
                        <span className='text-[11px] text-gray-400'>{label}</span>
                        <span className='text-[11px] font-medium text-[#1a1a2e]'>{value}</span>
                      </div>
                    ))}
                    {selectedOrder.cashOnAmount && (
                      <div className='flex justify-between border-t border-gray-200 pt-2'>
                        <span className='text-[12px] font-semibold text-[#1a1a2e]'>
                          ক্যাশ অন ডেলিভারি
                        </span>
                        <span className='text-[12px] font-bold text-[#1a1a2e]'>
                          {selectedOrder.cashOnAmount}৳
                        </span>
                      </div>
                    )}
                    {selectedOrder.amountPaidByCustomer && (
                      <>
                        <div className='flex justify-between'>
                          <span className='text-[11px] text-gray-400'>কাস্টমার প্রদত্ত</span>
                          <span className='text-[11px] font-medium text-[#1a1a2e]'>
                            {selectedOrder.amountPaidByCustomer}৳
                          </span>
                        </div>
                        <div className='flex justify-between border-t border-gray-200 pt-2'>
                          <span className='text-[12px] font-semibold text-[#1a1a2e]'>কমিশন</span>
                          <span className='text-[12px] font-bold text-emerald-600'>
                            {selectedOrder.actualCommission}৳
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className='border-t border-gray-50 px-5 py-4'>
              <button
                onClick={() => setShowDetailModal(false)}
                className='w-full rounded-xl bg-[#1a1a2e] py-3 text-[13px] font-semibold text-white transition hover:bg-[#16213e]'
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
