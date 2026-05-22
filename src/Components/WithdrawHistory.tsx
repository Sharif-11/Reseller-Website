import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import {
  FaCheckCircle,
  FaClock,
  FaCreditCard,
  FaExclamationTriangle,
  FaMobileAlt,
  FaSearch,
  FaTimesCircle,
  FaTrash,
  FaWallet,
} from 'react-icons/fa'
import { toast } from 'react-toastify'
import withdrawApi from '../Api/withdraw.api'
import { formatDate } from '../utils/date.utils'

interface WithdrawRequest {
  withdrawId: string
  userId: string
  userPhoneNo: string
  userName: string
  amount: string
  transactionFee: string
  actualAmount: string
  walletName: string
  walletPhoneNo: string
  systemWalletPhoneNo: string | null
  transactionId: string | null
  paymentId: string | null
  remarks: string | null
  requestedAt: string
  processedAt: string | null
  withdrawStatus: 'PENDING' | 'COMPLETED' | 'REJECTED' | 'CANCELLED'
}

interface PaginationState {
  currentPage: number
  totalPages: number
  totalRequests: number
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

const WithdrawHistory = () => {
  const [allRequests, setAllRequests] = useState<WithdrawRequest[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [cancellingId, setCancellingId] = useState<string | null>(null)
  const [pagination, setPagination] = useState<Record<string, PaginationState>>({
    PENDING: { currentPage: 1, totalPages: 1, totalRequests: 0, pageSize: 10 },
    COMPLETED: { currentPage: 1, totalPages: 1, totalRequests: 0, pageSize: 10 },
    REJECTED: { currentPage: 1, totalPages: 1, totalRequests: 0, pageSize: 10 },
  })
  const [selectedRequest, setSelectedRequest] = useState<WithdrawRequest | null>(null)
  const [activeTab, setActiveTab] = useState<'PENDING' | 'COMPLETED' | 'REJECTED'>('PENDING')
  const [searchQuery, setSearchQuery] = useState('')
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false)
  const [requestToCancel, setRequestToCancel] = useState<WithdrawRequest | null>(null)

  const fetchWithdrawHistory = async (page = 1, pageSize = pagination[activeTab].pageSize) => {
    try {
      setLoading(true)
      const response = await withdrawApi.getMyWithdraws({
        status: activeTab,
        page,
        limit: pageSize,
        search: searchQuery.trim() || undefined,
      })

      if (response.success && response.data) {
        setAllRequests(response.data.withdraws)
        setPagination(prev => ({
          ...prev,
          [activeTab]: {
            currentPage: response.data.currentPage,
            totalPages: response.data.totalPages,
            totalRequests: response.data.totalWithdraws,
            pageSize: response.data.pageSize,
          },
        }))
      } else {
        toast.error(response.message || 'হিস্ট্রি লোড করতে ব্যর্থ হয়েছে')
      }
    } catch (error) {
      toast.error('হিস্ট্রি লোড করতে সমস্যা হয়েছে')
      console.error('Error fetching withdrawal history:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchWithdrawHistory()
  }

  useEffect(() => {
    fetchWithdrawHistory()
  }, [activeTab, pagination[activeTab].pageSize, searchQuery])

  const handleCancelRequest = async (withdrawId: string) => {
    try {
      setCancellingId(withdrawId)
      const response = await withdrawApi.cancelWithdraw(withdrawId)

      if (response.success) {
        toast.success('উইথড্র রিকোয়েস্ট বাতিল করা হয়েছে')
        fetchWithdrawHistory(pagination[activeTab].currentPage)
      } else {
        setError(response.message || 'রিকোয়েস্ট বাতিল করতে ব্যর্থ হয়েছে')
      }
    } catch (error) {
      toast.error((error as Error).message || 'রিকোয়েস্ট বাতিল করতে সমস্যা হয়েছে')
    } finally {
      setCancellingId(null)
      setShowCancelConfirmation(false)
      setRequestToCancel(null)
    }
  }

  const openCancelConfirmation = (request: WithdrawRequest) => {
    setRequestToCancel(request)
    setShowCancelConfirmation(true)
  }

  const closeCancelConfirmation = () => {
    setShowCancelConfirmation(false)
    setRequestToCancel(null)
    setError(null)
  }

  const getStatusBadge = (status: string) => {
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
            <FaExclamationTriangle className='h-3 w-3' />
            বাতিল
          </span>
        )
      case 'CANCELLED':
        return (
          <span className='inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700'>
            <FaTimesCircle className='h-3 w-3' />
            নাকচ
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

  const getWalletIcon = (type: string) => {
    if (type === 'bKash') {
      return <FaMobileAlt className='text-green-500' />
    }
    return <FaCreditCard className='text-purple-500' />
  }

  const showDetailsModal = (request: WithdrawRequest) => {
    setSelectedRequest(request)
  }

  const closeDetailsModal = () => {
    setSelectedRequest(null)
  }

  const currentPagination = pagination[activeTab]

  const tabs = [
    { id: 'PENDING', label: 'প্রক্রিয়াধীন', count: pagination.PENDING.totalRequests },
    { id: 'COMPLETED', label: 'সম্পন্ন', count: pagination.COMPLETED.totalRequests },
    { id: 'REJECTED', label: 'বাতিল', count: pagination.REJECTED.totalRequests },
  ] as const

  return (
    <div className='min-h-screen bg-[#f7f6f3] py-6 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-6xl mx-auto'>
        {/* Header */}
        <motion.div initial='hidden' animate='visible' variants={staggerContainer} className='mb-6'>
          <motion.div variants={fadeUp}>
            <h1 className='text-2xl md:text-3xl font-bold text-[#1a1a2e]'>উইথড্র হিস্ট্রি</h1>
            <p className='text-gray-500 text-sm mt-1'>আপনার সকল উত্তোলনের ইতিহাস</p>
          </motion.div>
        </motion.div>

        {/* Search and Tabs Section */}
        <motion.div
          variants={fadeUp}
          className='bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6'
        >
          {/* Tabs */}
          <div className='border-b border-gray-100'>
            <div className='flex overflow-x-auto scrollbar-hide'>
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-5 py-3 text-sm font-medium whitespace-nowrap transition-all relative ${
                    activeTab === tab.id ? 'text-rose-500' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <span
                      className={`ml-2 px-1.5 py-0.5 rounded-full text-xs ${
                        activeTab === tab.id
                          ? 'bg-rose-100 text-rose-600'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
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

          {/* Search Bar */}
          <div className='p-4'>
            <form onSubmit={handleSearch} className='flex gap-2'>
              <div className='flex-1 relative'>
                <FaSearch className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4' />
                <input
                  type='text'
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder='ফোন, নাম বা ট্রানজেকশন আইডি দিয়ে খুঁজুন...'
                  className='w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400 transition-all'
                />
              </div>
              <button
                type='submit'
                className='px-5 py-2 bg-rose-500 text-white rounded-xl text-sm font-medium hover:bg-rose-600 transition-all'
              >
                খুঁজুন
              </button>
            </form>
          </div>
        </motion.div>

        {/* Loading State */}
        {loading ? (
          <div className='flex justify-center py-12'>
            <div className='animate-spin rounded-full h-8 w-8 border-2 border-rose-500 border-t-transparent' />
          </div>
        ) : allRequests.length === 0 ? (
          <motion.div
            variants={fadeUp}
            className='bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center'
          >
            <div className='w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4'>
              <FaWallet className='h-7 w-7 text-gray-400' />
            </div>
            <p className='text-gray-500'>কোন উইথড্র রিকোয়েস্ট পাওয়া যায়নি</p>
            <p className='text-xs text-gray-400 mt-1'>
              {activeTab === 'PENDING'
                ? 'আপনার কোনো প্রক্রিয়াধীন রিকোয়েস্ট নেই'
                : activeTab === 'COMPLETED'
                  ? 'আপনার কোনো সম্পন্ন রিকোয়েস্ট নেই'
                  : 'আপনার কোনো বাতিল রিকোয়েস্ট নেই'}
            </p>
          </motion.div>
        ) : (
          <>
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
                        ওয়ালেট
                      </th>
                      <th className='px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        পরিমাণ
                      </th>
                      <th className='px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        ফি
                      </th>
                      <th className='px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        প্রাপ্ত
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
                    {allRequests.map(request => (
                      <motion.tr
                        key={request.withdrawId}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className='hover:bg-gray-50/50 transition-colors'
                      >
                        <td className='px-5 py-4 text-sm text-gray-500 whitespace-nowrap'>
                          {formatDate(request.requestedAt)}
                        </td>
                        <td className='px-5 py-4'>
                          <div className='flex items-center gap-2'>
                            {getWalletIcon(request.walletName)}
                            <div>
                              <p className='text-sm font-medium text-gray-800'>
                                {request.walletName}
                              </p>
                              <p className='text-xs text-gray-400'>{request.walletPhoneNo}</p>
                            </div>
                          </div>
                        </td>
                        <td className='px-5 py-4 text-sm font-medium text-gray-800'>
                          ৳{parseFloat(request.amount).toFixed(2)}
                        </td>
                        <td className='px-5 py-4 text-sm text-rose-500'>
                          - ৳{parseFloat(request.transactionFee).toFixed(2)}
                        </td>
                        <td className='px-5 py-4 text-sm font-semibold text-emerald-600'>
                          ৳{parseFloat(request.actualAmount).toFixed(2)}
                        </td>
                        <td className='px-5 py-4'>{getStatusBadge(request.withdrawStatus)}</td>
                        <td className='px-5 py-4'>
                          <div className='flex items-center gap-2'>
                            {(request.withdrawStatus === 'COMPLETED' ||
                              request.withdrawStatus === 'REJECTED') && (
                              <button
                                onClick={() => showDetailsModal(request)}
                                className='text-rose-500 hover:text-rose-600 text-sm font-medium'
                              >
                                বিস্তারিত
                              </button>
                            )}
                            {request.withdrawStatus === 'PENDING' && (
                              <button
                                onClick={() => openCancelConfirmation(request)}
                                disabled={cancellingId === request.withdrawId}
                                className='text-red-500 hover:text-red-600 text-sm font-medium disabled:opacity-50 flex items-center gap-1'
                              >
                                <FaTrash className='h-3 w-3' />
                                বাতিল
                              </button>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Card View */}
            <div className='md:hidden space-y-3'>
              {allRequests.map(request => (
                <motion.div
                  key={request.withdrawId}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className='bg-white rounded-xl border border-gray-100 p-4 shadow-sm'
                >
                  <div className='flex justify-between items-start mb-3'>
                    <div className='flex items-center gap-2'>
                      {getWalletIcon(request.walletName)}
                      <div>
                        <p className='font-medium text-gray-800'>{request.walletName}</p>
                        <p className='text-xs text-gray-400'>{request.walletPhoneNo}</p>
                      </div>
                    </div>
                    {getStatusBadge(request.withdrawStatus)}
                  </div>

                  <div className='grid grid-cols-2 gap-2 mb-3 text-sm'>
                    <div>
                      <p className='text-gray-400 text-xs'>তারিখ</p>
                      <p className='text-gray-700'>{formatDate(request.requestedAt)}</p>
                    </div>
                    <div className='text-right'>
                      <p className='text-gray-400 text-xs'>প্রাপ্ত অর্থ</p>
                      <p className='font-semibold text-emerald-600'>
                        ৳{parseFloat(request.actualAmount).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className='flex justify-between items-center pt-2 border-t border-gray-100'>
                    <div>
                      <p className='text-xs text-gray-400'>উইথড্র পরিমাণ</p>
                      <p className='text-sm font-medium'>
                        ৳{parseFloat(request.amount).toFixed(2)}
                      </p>
                      <p className='text-xs text-rose-500'>
                        - ৳{parseFloat(request.transactionFee).toFixed(2)} ফি
                      </p>
                    </div>
                    {(request.withdrawStatus === 'COMPLETED' ||
                      request.withdrawStatus === 'REJECTED') && (
                      <button
                        onClick={() => showDetailsModal(request)}
                        className='px-3 py-1.5 bg-rose-50 text-rose-500 rounded-lg text-xs font-medium'
                      >
                        বিস্তারিত
                      </button>
                    )}
                    {request.withdrawStatus === 'PENDING' && (
                      <button
                        onClick={() => openCancelConfirmation(request)}
                        disabled={cancellingId === request.withdrawId}
                        className='px-3 py-1.5 bg-red-50 text-red-500 rounded-lg text-xs font-medium disabled:opacity-50'
                      >
                        বাতিল
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            {currentPagination.totalPages > 1 && (
              <div className='mt-6 flex justify-center'>
                <div className='flex gap-1'>
                  <button
                    onClick={() => fetchWithdrawHistory(currentPagination.currentPage - 1)}
                    disabled={currentPagination.currentPage === 1}
                    className='px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all'
                  >
                    পূর্ববর্তী
                  </button>
                  {Array.from({ length: Math.min(5, currentPagination.totalPages) }, (_, i) => {
                    let pageNum
                    if (currentPagination.totalPages <= 5) {
                      pageNum = i + 1
                    } else if (currentPagination.currentPage <= 3) {
                      pageNum = i + 1
                    } else if (currentPagination.currentPage >= currentPagination.totalPages - 2) {
                      pageNum = currentPagination.totalPages - 4 + i
                    } else {
                      pageNum = currentPagination.currentPage - 2 + i
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => fetchWithdrawHistory(pageNum)}
                        className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                          pageNum === currentPagination.currentPage
                            ? 'bg-rose-500 text-white'
                            : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  })}
                  <button
                    onClick={() => fetchWithdrawHistory(currentPagination.currentPage + 1)}
                    disabled={currentPagination.currentPage === currentPagination.totalPages}
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

      {/* Details Modal */}
      {selectedRequest && (
        <div className='fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50'>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className='bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-hidden'
          >
            <div className='bg-gradient-to-r from-[#1a1a2e] to-[#16213e] px-5 py-4'>
              <div className='flex justify-between items-center'>
                <h2 className='text-white font-semibold text-lg'>উইথড্র বিস্তারিত</h2>
                <button
                  onClick={closeDetailsModal}
                  className='text-white/50 hover:text-white transition-colors'
                >
                  <FaTimesCircle className='h-5 w-5' />
                </button>
              </div>
            </div>

            <div className='p-5 space-y-4 overflow-y-auto max-h-[calc(90vh-80px)]'>
              <div className='flex justify-between items-center pb-2 border-b border-gray-100'>
                <span className='text-gray-500 text-sm'>স্ট্যাটাস</span>
                {getStatusBadge(selectedRequest.withdrawStatus)}
              </div>

              <div className='flex justify-between'>
                <span className='text-gray-500 text-sm'>রিকোয়েস্ট তারিখ</span>
                <span className='text-gray-800 text-sm'>
                  {formatDate(selectedRequest.requestedAt)}
                </span>
              </div>

              <div className='bg-gray-50 rounded-xl p-3 space-y-2'>
                <div className='flex justify-between'>
                  <span className='text-gray-500 text-sm'>উইথড্র পরিমাণ</span>
                  <span className='font-medium'>
                    ৳{parseFloat(selectedRequest.amount).toFixed(2)}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-500 text-sm'>লেনদেন ফি</span>
                  <span className='text-rose-500'>
                    - ৳{parseFloat(selectedRequest.transactionFee).toFixed(2)}
                  </span>
                </div>
                <div className='flex justify-between pt-2 border-t border-gray-200'>
                  <span className='font-semibold'>প্রাপ্ত অর্থ</span>
                  <span className='font-bold text-emerald-600'>
                    ৳{parseFloat(selectedRequest.actualAmount).toFixed(2)}
                  </span>
                </div>
              </div>

              <div>
                <p className='text-gray-500 text-sm mb-1'>ওয়ালেট</p>
                <div className='flex items-center gap-2'>
                  {getWalletIcon(selectedRequest.walletName)}
                  <div>
                    <p className='font-medium'>{selectedRequest.walletName}</p>
                    <p className='text-xs text-gray-400'>{selectedRequest.walletPhoneNo}</p>
                  </div>
                </div>
              </div>

              {selectedRequest.transactionId && (
                <div>
                  <p className='text-gray-500 text-sm mb-1'>ট্রানজেকশন আইডি</p>
                  <p className='text-sm font-mono bg-gray-50 p-2 rounded-lg break-all'>
                    {selectedRequest.transactionId}
                  </p>
                </div>
              )}

              {selectedRequest.processedAt && (
                <div className='flex justify-between'>
                  <span className='text-gray-500 text-sm'>প্রসেসিং তারিখ</span>
                  <span className='text-gray-800 text-sm'>
                    {formatDate(selectedRequest.processedAt)}
                  </span>
                </div>
              )}

              {selectedRequest.remarks && (
                <div>
                  <p className='text-gray-500 text-sm mb-1'>মন্তব্য</p>
                  <p className='text-sm text-gray-700 bg-gray-50 p-3 rounded-lg'>
                    {selectedRequest.remarks}
                  </p>
                </div>
              )}
            </div>

            <div className='px-5 py-4 border-t border-gray-100'>
              <button
                onClick={closeDetailsModal}
                className='w-full px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors'
              >
                বন্ধ করুন
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelConfirmation && requestToCancel && (
        <div className='fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50'>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className='bg-white rounded-2xl shadow-xl w-full max-w-md'
          >
            <div className='bg-gradient-to-r from-rose-500 to-rose-600 px-5 py-4 rounded-t-2xl'>
              <h2 className='text-white font-semibold text-lg'>রিকোয়েস্ট বাতিল করুন</h2>
            </div>

            <div className='p-5'>
              {error && (
                <div className='mb-4 p-3 bg-rose-50 rounded-xl border border-rose-100'>
                  <p className='text-rose-600 text-sm'>{error}</p>
                </div>
              )}

              <p className='text-gray-700 mb-4'>আপনি কি এই উইথড্র রিকোয়েস্ট বাতিল করতে চান?</p>

              <div className='bg-amber-50 rounded-xl p-3 mb-4'>
                <div className='flex justify-between text-sm'>
                  <span className='text-gray-600'>পরিমাণ</span>
                  <span className='font-semibold'>
                    ৳{parseFloat(requestToCancel.amount).toFixed(2)}
                  </span>
                </div>
                <div className='flex justify-between text-sm mt-1'>
                  <span className='text-gray-600'>ওয়ালেট</span>
                  <span>
                    {requestToCancel.walletName} - {requestToCancel.walletPhoneNo}
                  </span>
                </div>
              </div>

              <div className='flex gap-3'>
                <button
                  onClick={closeCancelConfirmation}
                  className='flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-gray-600 font-medium hover:bg-gray-50 transition-colors'
                >
                  না, বাতিল করবেন না
                </button>
                <button
                  onClick={() => handleCancelRequest(requestToCancel.withdrawId)}
                  disabled={cancellingId === requestToCancel.withdrawId}
                  className='flex-1 px-4 py-2.5 bg-rose-500 text-white rounded-xl font-medium hover:bg-rose-600 transition-colors disabled:opacity-50'
                >
                  {cancellingId === requestToCancel.withdrawId
                    ? 'বাতিল হচ্ছে...'
                    : 'হ্যাঁ, বাতিল করুন'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default WithdrawHistory
