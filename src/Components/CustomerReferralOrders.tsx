// CustomerReferralOrders.tsx — BazaarHub design system
// Tokens: navy #1a1a2e · rose #e94560 · cream #f7f6f3
import { useEffect, useState } from 'react'
import {
  FiBox,
  FiChevronLeft,
  FiChevronRight,
  FiCopy,
  FiImage,
  FiPhone,
  FiSearch,
  FiShoppingBag,
  FiTruck,
  FiUser,
  FiX,
} from 'react-icons/fi'
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
  finalOrderTotal: number
  cashOnAmount: string | null
  amountPaidByCustomer: string | null
  trackingUrl: string | null
  OrderProduct: Array<{ productName: string; productImage?: string; productQuantity: number }>
}

interface PaginationState {
  currentPage: number
  totalPages: number
  totalOrders: number
  pageSize: number
}

/* ─── Status badge ─── */
const STATUS_MAP: Record<string, { label: string; bg: string; text: string }> = {
  UNPAID: { label: 'আনপেইড', bg: 'bg-amber-50', text: 'text-amber-700' },
  PAID: { label: 'পেইড', bg: 'bg-blue-50', text: 'text-blue-700' },
  CONFIRMED: { label: 'কনফার্মড', bg: 'bg-emerald-50', text: 'text-emerald-700' },
  PROCESSING: { label: 'প্রসেসিং', bg: 'bg-indigo-50', text: 'text-indigo-700' },
  DELIVERED: { label: 'ডেলিভারড', bg: 'bg-violet-50', text: 'text-violet-700' },
  COMPLETED: { label: 'কমপ্লিটেড', bg: 'bg-emerald-50', text: 'text-emerald-700' },
  CANCELLED: { label: 'বাতিল', bg: 'bg-[#e94560]/8', text: 'text-[#e94560]' },
  RETURNED: { label: 'ফেরত', bg: 'bg-orange-50', text: 'text-orange-700' },
  REJECTED: { label: 'রিজেক্টেড', bg: 'bg-[#e94560]/8', text: 'text-[#e94560]' },
  REFUNDED: { label: 'রিফান্ডেড', bg: 'bg-teal-50', text: 'text-teal-700' },
  FAILED: { label: 'ফেইলড', bg: 'bg-gray-100', text: 'text-gray-600' },
}

const StatusBadge = ({ status }: { status: string }) => {
  const s = STATUS_MAP[status] || { label: status, bg: 'bg-gray-100', text: 'text-gray-600' }
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${s.bg} ${s.text}`}
    >
      {s.label}
    </span>
  )
}

/* ─── Pagination ─── */
const Pagination = ({
  current,
  total,
  onChange,
}: {
  current: number
  total: number
  onChange: (p: number) => void
}) => {
  if (total <= 1) return null
  const maxV = 5
  let start = Math.max(1, current - Math.floor(maxV / 2))
  let end = Math.min(total, start + maxV - 1)
  if (end - start + 1 < maxV) start = Math.max(1, end - maxV + 1)
  const pages: number[] = []
  for (let i = start; i <= end; i++) pages.push(i)
  const btn =
    'flex h-8 w-8 items-center justify-center rounded-lg text-[13px] font-medium transition'
  return (
    <div className='flex items-center gap-1.5'>
      <button
        onClick={() => onChange(current - 1)}
        disabled={current === 1}
        className={`${btn} border border-gray-100 bg-white text-gray-500 hover:border-gray-200 disabled:opacity-30`}
      >
        <FiChevronLeft className='h-3.5 w-3.5' />
      </button>
      {start > 1 && (
        <>
          <button
            onClick={() => onChange(1)}
            className={`${btn} border border-gray-100 bg-white text-gray-600`}
          >
            1
          </button>
          {start > 2 && <span className='text-[12px] text-gray-300'>···</span>}
        </>
      )}
      {pages.map(p => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={`${btn} ${p === current ? 'bg-[#e94560] text-white' : 'border border-gray-100 bg-white text-gray-600 hover:border-gray-200'}`}
        >
          {p}
        </button>
      ))}
      {end < total && (
        <>
          {end < total - 1 && <span className='text-[12px] text-gray-300'>···</span>}
          <button
            onClick={() => onChange(total)}
            className={`${btn} border border-gray-100 bg-white text-gray-600`}
          >
            {total}
          </button>
        </>
      )}
      <button
        onClick={() => onChange(current + 1)}
        disabled={current === total}
        className={`${btn} border border-gray-100 bg-white text-gray-500 hover:border-gray-200 disabled:opacity-30`}
      >
        <FiChevronRight className='h-3.5 w-3.5' />
      </button>
    </div>
  )
}

/* ─── Order Detail Modal ─── */
const OrderModal = ({ order, onClose }: { order: CustomerOrder; onClose: () => void }) => {
  const Section = ({
    icon: Icon,
    title,
    children,
  }: {
    icon: React.ElementType
    title: string
    children: React.ReactNode
  }) => (
    <div className='rounded-2xl border border-gray-100 bg-[#f7f6f3] p-4'>
      <div className='mb-3 flex items-center gap-2'>
        <div className='flex h-7 w-7 items-center justify-center rounded-lg bg-[#1a1a2e]'>
          <Icon className='h-3.5 w-3.5 text-white' />
        </div>
        <h3 className='text-[13px] font-semibold text-[#1a1a2e]'>{title}</h3>
      </div>
      {children}
    </div>
  )

  const Row = ({
    label,
    value,
    highlight,
  }: {
    label: string
    value: React.ReactNode
    highlight?: boolean
  }) => (
    <div className='flex items-start justify-between gap-4 py-1.5'>
      <span className='text-[12px] text-gray-400'>{label}</span>
      <span
        className={`text-right text-[13px] font-medium ${highlight ? 'text-emerald-600' : 'text-[#1a1a2e]'}`}
      >
        {value}
      </span>
    </div>
  )

  return (
    <div className='fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[#1a1a2e]/80 p-4 backdrop-blur-sm py-8'>
      <div className='relative w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-white shadow-2xl'>
        {/* Header */}
        <div className='relative overflow-hidden bg-[#1a1a2e] px-5 py-4'>
          <div className='absolute left-0 right-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#e94560]/60 to-transparent' />
          <div className='flex items-center justify-between'>
            <div>
              <h2 className='font-serif text-[17px] font-bold text-white'>অর্ডার বিস্তারিত</h2>
              <p className='text-[12px] text-white/35'>অর্ডার #{order.orderId}</p>
            </div>
            <button
              onClick={onClose}
              className='flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/50 transition hover:text-white'
            >
              <FiX className='h-3.5 w-3.5' />
            </button>
          </div>
        </div>

        <div className='space-y-3 p-4'>
          {/* Customer */}
          <Section icon={FiUser} title='কাস্টমার তথ্য'>
            <Row label='নাম' value={order.customerName} />
            <Row label='ফোন নম্বর' value={order.customerPhoneNo} />
          </Section>

          {/* Order */}
          <Section icon={FiShoppingBag} title='অর্ডার তথ্য'>
            <Row label='অর্ডার আইডি' value={`#${order.orderId}`} />
            <Row label='স্ট্যাটাস' value={<StatusBadge status={order.orderStatus} />} />
            <Row label='তারিখ' value={order.createdAt ? formatDate(order.createdAt) : 'N/A'} />
          </Section>

          {/* Financial */}
          <Section icon={FiBox} title='আর্থিক তথ্য'>
            <Row label='মোট পণ্যমূল্য' value={`৳${order.finalOrderTotal}`} />
            <Row label='ডেলিভারি চার্জ' value={`৳${order.deliveryCharge}`} />
            <Row label='কমিশন' value={`৳${order.actualCommission}`} highlight />
            {order.cashOnAmount && (
              <Row label='ক্যাশ অন ডেলিভারি' value={`৳${order.cashOnAmount}`} />
            )}
            {order.amountPaidByCustomer && (
              <Row label='গ্রাহক প্রদত্ত' value={`৳${order.amountPaidByCustomer}`} />
            )}
          </Section>

          {/* Products */}
          <Section icon={FiBox} title='পণ্য তালিকা'>
            <div className='space-y-2'>
              {order.OrderProduct.map((p, i) => (
                <div
                  key={i}
                  className='flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-3'
                >
                  <div className='h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-gray-100'>
                    {p.productImage ? (
                      <img
                        src={p.productImage}
                        alt={p.productName}
                        className='h-full w-full object-cover'
                        onError={e => {
                          ;(e.target as HTMLImageElement).style.display = 'none'
                        }}
                      />
                    ) : (
                      <div className='flex h-full w-full items-center justify-center'>
                        <FiImage className='h-4 w-4 text-gray-300' />
                      </div>
                    )}
                  </div>
                  <div className='flex-1 min-w-0'>
                    <p className='truncate text-[13px] font-medium text-[#1a1a2e]'>
                      {p.productName}
                    </p>
                    <p className='text-[11px] text-gray-400'>{p.productQuantity} টি</p>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* Tracking */}
          {order.trackingUrl && (
            <Section icon={FiTruck} title='ট্র্যাকিং তথ্য'>
              <div className='flex items-center gap-2 rounded-xl border border-gray-100 bg-white p-3'>
                <p className='flex-1 truncate text-[12px] text-gray-600'>{order.trackingUrl}</p>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(order.trackingUrl || '')
                    toast.success('ট্র্যাকিং লিংক কপি করা হয়েছে')
                  }}
                  className='flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#1a1a2e] text-white transition hover:bg-[#e94560]'
                >
                  <FiCopy className='h-3 w-3' />
                </button>
              </div>
            </Section>
          )}
        </div>

        <div className='border-t border-gray-100 p-4'>
          <button
            onClick={onClose}
            className='w-full rounded-xl bg-[#1a1a2e] py-3 text-[13px] font-semibold text-white transition hover:bg-[#2d2d4e]'
          >
            বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  )
}

/* ════════════════════════════════════════════ */
const CustomerReferralOrders = () => {
  const [orders, setOrders] = useState<CustomerOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedOrder, setSelectedOrder] = useState<CustomerOrder | null>(null)
  const [pagination, setPagination] = useState<PaginationState>({
    currentPage: 1,
    totalPages: 1,
    totalOrders: 0,
    pageSize: 10,
  })

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const res = await orderApi.getAllCustomerOrdersForASeller({
        page: pagination.currentPage,
        limit: pagination.pageSize,
        search: searchQuery || undefined,
      })
      if (res.success) {
        setOrders(res.data.orders)
        setPagination({
          currentPage: res.data.currentPage,
          totalPages: res.data.totalPages,
          totalOrders: res.data.totalOrders,
          pageSize: res.data.pageSize,
        })
      } else {
        toast.error(res.message || 'লোড করতে সমস্যা হয়েছে')
      }
    } catch {
      toast.error('একটি ত্রুটি ঘটেছে')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [pagination.currentPage, pagination.pageSize, searchQuery])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPagination(p => ({ ...p, currentPage: 1 }))
    fetchOrders()
  }

  return (
    <div className='min-h-screen bg-[#f7f6f3] px-4 py-6 sm:px-6 lg:px-8'>
      <div className='mx-auto max-w-screen-xl'>
        {selectedOrder && (
          <OrderModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
        )}

        {/* ── Header ── */}
        <div className='mb-5 flex items-center justify-between'>
          <div>
            <h1 className='font-serif text-[22px] font-bold text-[#1a1a2e]'>
              কাস্টমার রেফারেল অর্ডার
            </h1>
            <p className='mt-0.5 text-[13px] text-gray-400'>
              {loading ? 'লোড হচ্ছে...' : `মোট ${pagination.totalOrders} টি অর্ডার`}
            </p>
          </div>
          {/* Page size */}
          <div className='flex items-center gap-2'>
            <span className='text-[12px] text-gray-400'>প্রতি পৃষ্ঠায়:</span>
            <select
              value={pagination.pageSize}
              onChange={e =>
                setPagination(p => ({ ...p, pageSize: Number(e.target.value), currentPage: 1 }))
              }
              className='rounded-xl border border-gray-200 bg-white px-2.5 py-1.5 text-[13px] text-[#1a1a2e] outline-none focus:border-[#e94560]/40 focus:ring-2 focus:ring-[#e94560]/10'
            >
              {[5, 10, 20].map(n => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* ── Search ── */}
        <form onSubmit={handleSearch} className='mb-5'>
          <div className='flex items-center gap-2 rounded-2xl border border-gray-100 bg-white px-4 py-2.5 shadow-sm transition focus-within:border-[#e94560]/30 focus-within:ring-2 focus-within:ring-[#e94560]/10'>
            <FiSearch className='h-4 w-4 shrink-0 text-gray-300' />
            <input
              type='text'
              placeholder='কাস্টমার নাম বা ফোন নম্বর দিয়ে খুঁজুন...'
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className='flex-1 bg-transparent text-[13px] text-[#1a1a2e] outline-none placeholder:text-gray-300'
            />
            {searchQuery && (
              <button
                type='button'
                onClick={() => setSearchQuery('')}
                className='text-gray-300 hover:text-gray-500'
              >
                <FiX className='h-3.5 w-3.5' />
              </button>
            )}
            <button
              type='submit'
              className='shrink-0 rounded-xl bg-[#e94560] px-4 py-1.5 text-[12px] font-semibold text-white transition hover:bg-[#c73652]'
            >
              খুঁজুন
            </button>
          </div>
        </form>

        {/* ── Loading ── */}
        {loading ? (
          <div className='flex flex-col items-center justify-center rounded-2xl border border-gray-100 bg-white py-16'>
            <div className='relative h-10 w-10'>
              <div className='absolute inset-0 rounded-full border-2 border-[#1a1a2e]/10' />
              <div className='absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-[#e94560]' />
            </div>
            <p className='mt-3 text-[12px] text-gray-400'>লোড হচ্ছে...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className='flex flex-col items-center justify-center rounded-2xl border border-gray-100 bg-white py-14'>
            <div className='mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1a1a2e]/5'>
              <FiShoppingBag className='h-6 w-6 text-[#1a1a2e]/20' />
            </div>
            <p className='text-[14px] font-medium text-gray-600'>কোন অর্ডার পাওয়া যায়নি</p>
            <p className='mt-0.5 text-[12px] text-gray-400'>
              {searchQuery ? 'অন্য কীওয়ার্ড দিয়ে চেষ্টা করুন' : 'এখনো কোন কাস্টমার অর্ডার দেননি'}
            </p>
          </div>
        ) : (
          <div className='overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm'>
            {/* ── Mobile cards ── */}
            <div className='divide-y divide-gray-50 lg:hidden'>
              {orders.map(order => (
                <div key={order.orderId} className='p-4 transition hover:bg-[#f7f6f3]'>
                  {/* Top row */}
                  <div className='mb-3 flex items-start justify-between gap-2'>
                    <div className='flex items-center gap-2.5'>
                      <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#1a1a2e]'>
                        <span className='font-serif text-[13px] font-bold text-white'>
                          {order.customerName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className='text-[14px] font-semibold text-[#1a1a2e]'>
                          {order.customerName}
                        </p>
                        <div className='flex items-center gap-1'>
                          <FiPhone className='h-2.5 w-2.5 text-gray-400' />
                          <p className='text-[11px] text-gray-400'>{order.customerPhoneNo}</p>
                        </div>
                      </div>
                    </div>
                    <StatusBadge status={order.orderStatus} />
                  </div>

                  {/* Meta row */}
                  <div className='mb-3 flex items-center gap-3 text-[11px] text-gray-400'>
                    <span className='font-semibold text-[#1a1a2e]/50'>#{order.orderId}</span>
                    {order.createdAt && <span>{formatDate(order.createdAt)}</span>}
                  </div>

                  {/* Commission + products */}
                  <div className='mb-3 flex items-center justify-between'>
                    <div className='flex items-center gap-1.5 rounded-xl bg-emerald-50 px-2.5 py-1'>
                      <span className='text-[11px] font-semibold text-emerald-600'>
                        কমিশন ৳{order.actualCommission}
                      </span>
                    </div>
                    <span className='text-[11px] text-gray-400'>
                      {order.OrderProduct.length} টি পণ্য
                    </span>
                  </div>

                  {/* Products preview */}
                  <div className='mb-3 flex gap-1.5'>
                    {order.OrderProduct.slice(0, 3).map((p, i) => (
                      <div
                        key={i}
                        className='h-9 w-9 overflow-hidden rounded-xl border border-gray-100 bg-gray-50'
                      >
                        {p.productImage ? (
                          <img
                            src={p.productImage}
                            alt=''
                            className='h-full w-full object-cover'
                            onError={e => {
                              ;(e.target as HTMLImageElement).style.display = 'none'
                            }}
                          />
                        ) : (
                          <div className='flex h-full w-full items-center justify-center'>
                            <FiImage className='h-3.5 w-3.5 text-gray-300' />
                          </div>
                        )}
                      </div>
                    ))}
                    {order.OrderProduct.length > 3 && (
                      <div className='flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 text-[10px] font-semibold text-gray-500'>
                        +{order.OrderProduct.length - 3}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => setSelectedOrder(order)}
                    className='w-full rounded-xl border border-[#1a1a2e]/10 py-2 text-[12px] font-semibold text-[#1a1a2e] transition hover:bg-[#1a1a2e] hover:text-white'
                  >
                    বিস্তারিত দেখুন
                  </button>
                </div>
              ))}
            </div>

            {/* ── Desktop table ── */}
            <div className='hidden lg:block overflow-x-auto'>
              <table className='w-full'>
                <thead>
                  <tr className='border-b border-gray-50 bg-[#f7f6f3]'>
                    {['কাস্টমার', 'অর্ডার আইডি', 'পণ্য', 'কমিশন', 'স্ট্যাটাস', 'তারিখ', ''].map(
                      (h, i) => (
                        <th
                          key={i}
                          className='px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.5px] text-gray-400'
                        >
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody className='divide-y divide-gray-50'>
                  {orders.map(order => (
                    <tr key={order.orderId} className='transition hover:bg-[#f7f6f3]'>
                      {/* Customer */}
                      <td className='px-5 py-4'>
                        <div className='flex items-center gap-3'>
                          <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#1a1a2e]'>
                            <span className='font-serif text-[13px] font-bold text-white'>
                              {order.customerName.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className='text-[13px] font-semibold text-[#1a1a2e]'>
                              {order.customerName}
                            </p>
                            <div className='flex items-center gap-1'>
                              <FiPhone className='h-2.5 w-2.5 text-gray-300' />
                              <p className='text-[11px] text-gray-400'>{order.customerPhoneNo}</p>
                            </div>
                          </div>
                        </div>
                      </td>
                      {/* Order ID */}
                      <td className='px-5 py-4'>
                        <span className='text-[13px] font-semibold text-[#1a1a2e]/50'>
                          #{order.orderId}
                        </span>
                      </td>
                      {/* Products */}
                      <td className='px-5 py-4'>
                        <div className='flex items-center gap-1.5'>
                          {order.OrderProduct.slice(0, 2).map((p, i) => (
                            <div
                              key={i}
                              className='h-9 w-9 overflow-hidden rounded-xl border border-gray-100 bg-gray-50'
                            >
                              {p.productImage ? (
                                <img
                                  src={p.productImage}
                                  alt=''
                                  className='h-full w-full object-cover'
                                  onError={e => {
                                    ;(e.target as HTMLImageElement).style.display = 'none'
                                  }}
                                />
                              ) : (
                                <div className='flex h-full w-full items-center justify-center'>
                                  <FiImage className='h-3 w-3 text-gray-300' />
                                </div>
                              )}
                            </div>
                          ))}
                          {order.OrderProduct.length > 2 && (
                            <div className='flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 text-[10px] font-semibold text-gray-500'>
                              +{order.OrderProduct.length - 2}
                            </div>
                          )}
                        </div>
                      </td>
                      {/* Commission */}
                      <td className='px-5 py-4'>
                        <span className='rounded-xl bg-emerald-50 px-2.5 py-1 text-[12px] font-bold text-emerald-600'>
                          ৳{order.actualCommission}
                        </span>
                      </td>
                      {/* Status */}
                      <td className='px-5 py-4'>
                        <StatusBadge status={order.orderStatus} />
                      </td>
                      {/* Date */}
                      <td className='px-5 py-4'>
                        <p className='text-[12px] text-gray-500'>
                          {order.createdAt ? formatDate(order.createdAt) : '—'}
                        </p>
                      </td>
                      {/* Action */}
                      <td className='px-5 py-4'>
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className='rounded-xl border border-[#1a1a2e]/10 px-3 py-1.5 text-[12px] font-semibold text-[#1a1a2e] transition hover:bg-[#1a1a2e] hover:text-white'
                        >
                          বিস্তারিত
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ── Pagination footer ── */}
            {pagination.totalPages > 1 && (
              <div className='flex flex-col items-center justify-between gap-3 border-t border-gray-50 px-5 py-3 sm:flex-row'>
                <p className='text-[12px] text-gray-400'>
                  দেখানো হচ্ছে{' '}
                  <span className='font-semibold text-[#1a1a2e]'>
                    {(pagination.currentPage - 1) * pagination.pageSize + 1}–
                    {Math.min(pagination.currentPage * pagination.pageSize, pagination.totalOrders)}
                  </span>{' '}
                  / {pagination.totalOrders} টি
                </p>
                <Pagination
                  current={pagination.currentPage}
                  total={pagination.totalPages}
                  onChange={p => setPagination(prev => ({ ...prev, currentPage: p }))}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default CustomerReferralOrders
