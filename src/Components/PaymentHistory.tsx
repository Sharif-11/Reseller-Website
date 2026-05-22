import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import {
  FaCheckCircle,
  FaClock,
  FaCopy,
  FaSearch,
  FaTimes,
  FaTimesCircle,
  FaWallet,
} from 'react-icons/fa'
import { toast } from 'react-toastify'
import { paymentApi } from '../Api/payment.api'
import { useAuth } from '../Hooks/useAuth'
import { formatDate } from '../utils/date.utils'

type PaymentStatus = 'PENDING' | 'COMPLETED' | 'REJECTED'
type PaymentType = 'ORDER_PAYMENT' | 'WITHDRAW_PAYMENT' | 'DUE_PAYMENT'
type SenderType = 'SELLER' | 'ADMIN'

interface Payment {
  paymentId: string
  paymentDate: string
  processedAt: string | null
  paymentStatus: PaymentStatus
  paymentType: PaymentType
  sender: SenderType
  userWalletName: string
  userWalletPhoneNo: string
  systemWalletName: string | null
  systemWalletPhoneNo: string | null
  amount: string
  transactionId: string | null
  transactionFee: string | null
  actualAmount: string | null
  userName: string
  userPhoneNo: string
  remarks: string | null
  orderId: string | null
}

interface PaginationState {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
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

const PaymentHistory = () => {
  const { user } = useAuth()
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [activeTab, setActiveTab] = useState<'all' | PaymentStatus>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [pagination, setPagination] = useState<PaginationState>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  })

  const fetchPayments = async () => {
    try {
      setLoading(true)
      const status = activeTab === 'all' ? undefined : activeTab
      const response = await paymentApi.getPaymentsOfUser(user?.phoneNo!, {
        paymentStatus: status,
        page: pagination.currentPage,
        limit: pagination.itemsPerPage,
        search: searchQuery || undefined,
      })

      if (response.success && response.data) {
        setPayments(response.data.payments)
        setPagination({
          currentPage: response.data.currentPage,
          totalPages: response.data.totalPages,
          totalItems: response.data.totalCount,
          itemsPerPage: pagination.itemsPerPage,
        })
      }
    } catch (error) {
      toast.error('পেমেন্ট লোড করতে ব্যর্থ হয়েছে')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, currentPage: page }))
  }

  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPagination(prev => ({
      ...prev,
      itemsPerPage: Number(e.target.value),
      currentPage: 1,
    }))
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('কপি করা হয়েছে')
  }

  const formatAmount = (amount: string | null) => {
    return amount ? `${parseFloat(amount).toFixed(2)}৳` : 'N/A'
  }

  const getPaymentTypeText = (type: PaymentType) => {
    switch (type) {
      case 'DUE_PAYMENT':
        return 'বকেয়া পেমেন্ট'
      case 'ORDER_PAYMENT':
        return 'অর্ডার পেমেন্ট'
      case 'WITHDRAW_PAYMENT':
        return 'উইথড্র পেমেন্ট'
      default:
        return type
    }
  }

  const getStatusBadge = (status: PaymentStatus) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <span className='inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700'>
            <FaCheckCircle className='h-3 w-3' />
            সম্পন্ন
          </span>
        )
      case 'REJECTED':
        return (
          <span className='inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-rose-100 text-rose-700'>
            <FaTimesCircle className='h-3 w-3' />
            বাতিল
          </span>
        )
      default:
        return (
          <span className='inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700'>
            <FaClock className='h-3 w-3' />
            প্রক্রিয়াধীন
          </span>
        )
    }
  }

  useEffect(() => {
    fetchPayments()
  }, [activeTab, pagination.currentPage, pagination.itemsPerPage, searchQuery])

  const tabs = [
    { id: 'all', label: 'সব' },
    { id: 'PENDING', label: 'প্রক্রিয়াধীন' },
    { id: 'COMPLETED', label: 'সম্পন্ন' },
    { id: 'REJECTED', label: 'বাতিল' },
  ]

  return (
    <div className='min-h-screen bg-[#f7f6f3] py-6 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-7xl mx-auto'>
        {/* Header */}
        <motion.div initial='hidden' animate='visible' variants={staggerContainer} className='mb-6'>
          <motion.div variants={fadeUp}>
            <h1 className='text-2xl md:text-3xl font-bold text-[#1a1a2e]'>পেমেন্ট হিস্ট্রি</h1>
            <p className='text-gray-500 text-sm mt-1'>আপনার সকল লেনদেনের ইতিহাস</p>
          </motion.div>
        </motion.div>

        {/* Tabs and Search Card */}
        <motion.div
          variants={fadeUp}
          className='bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6'
        >
          {/* Tabs */}
          <div className='border-b border-gray-100 overflow-x-auto'>
            <div className='flex'>
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-5 py-3 text-sm font-medium whitespace-nowrap transition-all relative ${
                    activeTab === tab.id ? 'text-rose-500' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId='activeTab'
                      className='absolute bottom-0 left-0 right-0 h-0.5 bg-rose-500'
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Search and Items Per Page */}
          <div className='p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3'>
            <div className='relative flex-1 max-w-sm'>
              <FaSearch className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400' />
              <input
                type='text'
                placeholder='ট্রানজেকশন আইডি, ফোন বা নাম দিয়ে খুঁজুন...'
                className='w-full pl-9 pr-8 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400 transition-all'
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600'
                >
                  <FaTimes className='h-3 w-3' />
                </button>
              )}
            </div>
            <div className='flex items-center gap-2'>
              <span className='text-xs text-gray-500'>প্রতি পৃষ্ঠা:</span>
              <select
                value={pagination.itemsPerPage}
                onChange={handleItemsPerPageChange}
                className='px-2 py-1.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20'
              >
                {[5, 10, 20, 50].map(num => (
                  <option key={num} value={num}>
                    {num}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>

        {/* Payment List */}
        {loading ? (
          <div className='flex justify-center py-12'>
            <div className='animate-spin rounded-full h-8 w-8 border-2 border-rose-500 border-t-transparent' />
          </div>
        ) : payments.length === 0 ? (
          <motion.div
            variants={fadeUp}
            className='bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center'
          >
            <div className='w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4'>
              <FaWallet className='h-7 w-7 text-gray-400' />
            </div>
            <p className='text-gray-500'>কোন পেমেন্ট পাওয়া যায়নি</p>
          </motion.div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className='md:hidden space-y-3'>
              {payments.map(payment => (
                <motion.div
                  key={payment.paymentId}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className='bg-white rounded-xl border border-gray-100 p-4 shadow-sm'
                >
                  <div className='flex justify-between items-start mb-3'>
                    <div>
                      <p className='text-xs text-gray-400'>{formatDate(payment.paymentDate)}</p>
                      <h3 className='font-semibold text-gray-800 mt-0.5'>
                        {getPaymentTypeText(payment.paymentType)}
                      </h3>
                    </div>
                    {getStatusBadge(payment.paymentStatus)}
                  </div>

                  <div className='space-y-2'>
                    <div className='flex justify-between text-sm'>
                      <span className='text-gray-500'>পরিমাণ:</span>
                      <span className='font-medium'>{formatAmount(payment.amount)}</span>
                    </div>
                    {payment.transactionId && (
                      <div className='flex justify-between items-center text-sm'>
                        <span className='text-gray-500'>ট্রানজেকশন আইডি:</span>
                        <button
                          onClick={() => copyToClipboard(payment.transactionId!)}
                          className='text-rose-500 hover:text-rose-600 flex items-center gap-1 text-xs'
                        >
                          {payment.transactionId.slice(0, 8)}...
                          <FaCopy className='h-3 w-3' />
                        </button>
                      </div>
                    )}
                    <div className='flex items-center justify-between pt-2 border-t border-gray-100'>
                      <div className='text-xs'>
                        <p className='text-gray-400'>প্রেরক</p>
                        <p className='font-medium'>
                          {payment.sender === 'SELLER'
                            ? `${payment.userWalletName} (${payment.userWalletPhoneNo})`
                            : payment.systemWalletName || 'System'}
                        </p>
                      </div>
                      <FaArrowRight className='text-gray-300 h-3 w-3' />
                      <div className='text-xs text-right'>
                        <p className='text-gray-400'>প্রাপক</p>
                        <p className='font-medium'>
                          {payment.sender === 'SELLER'
                            ? payment.systemWalletName || 'System'
                            : `${payment.userWalletName} (${payment.userWalletPhoneNo})`}
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedPayment(payment)}
                    className='w-full mt-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-rose-500 text-sm font-medium transition-colors'
                  >
                    বিস্তারিত দেখুন
                  </button>
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
                        তারিখ
                      </th>
                      <th className='px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        ধরণ
                      </th>
                      <th className='px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        পরিমাণ
                      </th>
                      <th className='px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        ট্রানজেকশন আইডি
                      </th>
                      <th className='px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        প্রেরক → প্রাপক
                      </th>
                      <th className='px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        স্ট্যাটাস
                      </th>
                      <th className='px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        অ্যাকশন
                      </th>
                    </tr>
                  </thead>
                  <tbody className='divide-y divide-gray-100'>
                    {payments.map(payment => (
                      <tr key={payment.paymentId} className='hover:bg-gray-50/50 transition-colors'>
                        <td className='px-5 py-4 text-sm text-gray-500 whitespace-nowrap'>
                          {formatDate(payment.paymentDate)}
                        </td>
                        <td className='px-5 py-4 text-sm font-medium text-gray-800'>
                          {getPaymentTypeText(payment.paymentType)}
                        </td>
                        <td className='px-5 py-4 text-sm font-medium text-gray-800'>
                          {formatAmount(payment.amount)}
                        </td>
                        <td className='px-5 py-4 text-sm'>
                          {payment.transactionId ? (
                            <button
                              onClick={() => copyToClipboard(payment.transactionId!)}
                              className='text-rose-500 hover:text-rose-600 flex items-center gap-1'
                            >
                              {payment.transactionId.slice(0, 12)}...
                              <FaCopy className='h-3 w-3' />
                            </button>
                          ) : (
                            <span className='text-gray-400'>N/A</span>
                          )}
                        </td>
                        <td className='px-5 py-4 text-sm'>
                          <div className='flex items-center gap-2'>
                            <div className='text-right'>
                              <div className='font-medium text-gray-800'>
                                {payment.sender === 'SELLER'
                                  ? payment.userWalletName
                                  : payment.systemWalletName || 'System'}
                              </div>
                              <div className='text-xs text-gray-400'>
                                {payment.sender === 'SELLER'
                                  ? payment.userWalletPhoneNo
                                  : payment.systemWalletPhoneNo}
                              </div>
                            </div>
                            <FaArrowRight className='text-gray-300 h-3 w-3' />
                            <div>
                              <div className='font-medium text-gray-800'>
                                {payment.sender === 'SELLER'
                                  ? payment.systemWalletName || 'System'
                                  : payment.userWalletName}
                              </div>
                              <div className='text-xs text-gray-400'>
                                {payment.sender === 'SELLER'
                                  ? payment.systemWalletPhoneNo
                                  : payment.userWalletPhoneNo}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className='px-5 py-4'>{getStatusBadge(payment.paymentStatus)}</td>
                        <td className='px-5 py-4'>
                          <button
                            onClick={() => setSelectedPayment(payment)}
                            className='text-rose-500 hover:text-rose-600 text-sm font-medium'
                          >
                            বিস্তারিত
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className='mt-6 flex justify-center'>
                <div className='flex gap-1'>
                  <button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 1}
                    className='px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all'
                  >
                    পূর্ববর্তী
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
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                          pageNum === pagination.currentPage
                            ? 'bg-rose-500 text-white'
                            : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  })}
                  <button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={pagination.currentPage === pagination.totalPages}
                    className='px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all'
                  >
                    পরবর্তী
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Payment Details Modal */}
      {selectedPayment && (
        <div className='fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50'>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className='bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-hidden'
          >
            <div className='bg-gradient-to-r from-[#1a1a2e] to-[#16213e] px-5 py-4'>
              <div className='flex justify-between items-center'>
                <h2 className='text-white font-semibold text-lg'>পেমেন্ট বিস্তারিত</h2>
                <button
                  onClick={() => setSelectedPayment(null)}
                  className='text-white/50 hover:text-white transition-colors'
                >
                  <FaTimesCircle className='h-5 w-5' />
                </button>
              </div>
            </div>

            <div className='p-5 space-y-4 overflow-y-auto max-h-[calc(90vh-80px)]'>
              <div className='flex justify-between items-center pb-2 border-b border-gray-100'>
                <span className='text-gray-500 text-sm'>স্ট্যাটাস</span>
                {getStatusBadge(selectedPayment.paymentStatus)}
              </div>

              <div className='grid grid-cols-2 gap-3 text-sm'>
                <div>
                  <p className='text-gray-400 text-xs'>ধরণ</p>
                  <p className='font-medium'>{getPaymentTypeText(selectedPayment.paymentType)}</p>
                </div>
                <div>
                  <p className='text-gray-400 text-xs'>তারিখ</p>
                  <p className='font-medium'>{formatDate(selectedPayment.paymentDate)}</p>
                </div>
                {selectedPayment.processedAt && (
                  <div>
                    <p className='text-gray-400 text-xs'>প্রক্রিয়াকরণ তারিখ</p>
                    <p className='font-medium'>{formatDate(selectedPayment.processedAt)}</p>
                  </div>
                )}
              </div>

              <div className='bg-gray-50 rounded-xl p-3 space-y-2'>
                <div className='flex justify-between'>
                  <span className='text-gray-500 text-sm'>পেমেন্ট পরিমাণ</span>
                  <span className='font-medium'>{formatAmount(selectedPayment.amount)}</span>
                </div>
                {selectedPayment.transactionFee && (
                  <div className='flex justify-between'>
                    <span className='text-gray-500 text-sm'>লেনদেন ফি</span>
                    <span className='text-rose-500'>
                      {formatAmount(selectedPayment.transactionFee)}
                    </span>
                  </div>
                )}
                <div className='flex justify-between pt-2 border-t border-gray-200'>
                  <span className='font-semibold'>প্রাপ্ত অর্থ</span>
                  <span className='font-bold text-emerald-600'>
                    {formatAmount(selectedPayment.actualAmount)}
                  </span>
                </div>
              </div>

              {selectedPayment.transactionId && (
                <div>
                  <p className='text-gray-400 text-xs mb-1'>ট্রানজেকশন আইডি</p>
                  <div className='flex items-center gap-2'>
                    <code className='text-sm bg-gray-100 px-2 py-1 rounded break-all'>
                      {selectedPayment.transactionId}
                    </code>
                    <button
                      onClick={() => copyToClipboard(selectedPayment.transactionId!)}
                      className='text-rose-500 hover:text-rose-600'
                    >
                      <FaCopy className='h-4 w-4' />
                    </button>
                  </div>
                </div>
              )}

              <div className='border-t pt-3'>
                <p className='text-gray-400 text-xs mb-2'>লেনদেনের পক্ষ</p>
                <div className='space-y-2'>
                  <div className='bg-gray-50 rounded-lg p-2'>
                    <p className='text-xs text-gray-500'>প্রেরক</p>
                    <p className='text-sm font-medium'>
                      {selectedPayment.sender === 'SELLER'
                        ? `${selectedPayment.userWalletName} (${selectedPayment.userWalletPhoneNo})`
                        : selectedPayment.systemWalletName || 'System'}
                    </p>
                  </div>
                  <div className='flex justify-center'>
                    <FaArrowRight className='text-gray-300 h-4 w-4' />
                  </div>
                  <div className='bg-gray-50 rounded-lg p-2'>
                    <p className='text-xs text-gray-500'>প্রাপক</p>
                    <p className='text-sm font-medium'>
                      {selectedPayment.sender === 'SELLER'
                        ? selectedPayment.systemWalletName || 'System'
                        : `${selectedPayment.userWalletName} (${selectedPayment.userWalletPhoneNo})`}
                    </p>
                  </div>
                </div>
              </div>

              {selectedPayment.remarks && (
                <div className='border-t pt-3'>
                  <p className='text-gray-400 text-xs mb-1'>মন্তব্য</p>
                  <p className='text-sm text-gray-700 bg-gray-50 p-2 rounded-lg'>
                    {selectedPayment.remarks}
                  </p>
                </div>
              )}
            </div>

            <div className='px-5 py-4 border-t border-gray-100'>
              <button
                onClick={() => setSelectedPayment(null)}
                className='w-full px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors'
              >
                বন্ধ করুন
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

// Missing import
import { FaArrowRight } from 'react-icons/fa'

export default PaymentHistory
