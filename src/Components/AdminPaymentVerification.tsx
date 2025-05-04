import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { getAllPaymentsForAdmin, rejectPayment, verifyPayment } from '../Api/admin.api'
import { formatDate } from '../utils/date.utils'

interface Payment {
  paymentId: number
  paymentDate: string
  processedAt: string | null
  paymentStatus: 'pending' | 'verified' | 'rejected'
  paymentType: 'DuePayment' | 'OrderPayment' | 'WithdrawPayment'
  sender: 'Seller' | 'Admin'
  adminWalletId: number | null
  adminWalletName: string
  adminWalletPhoneNo: string
  sellerWalletName: string
  sellerWalletPhoneNo: string
  sellerName: string
  sellerPhoneNo: string
  sellerId: string
  transactionId: string | null
  amount: string
  transactionFee: string | null
  actualAmount: string
  remarks: string | null
  orderId: string | null
  withdrawId: string | null
}

type PaymentStatus = 'all' | 'pending' | 'verified' | 'rejected'

const AdminPaymentVerification = () => {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [actionType, setActionType] = useState<'verify' | 'reject' | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [verificationData, setVerificationData] = useState({
    transactionId: '',
    amount: '',
    remarks: '',
  })
  const [processing, setProcessing] = useState(false)
  const [activeTab, setActiveTab] = useState<PaymentStatus>('pending')
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  })

  const fetchPayments = async () => {
    try {
      setLoading(true)
      const response = await getAllPaymentsForAdmin({
        status: activeTab === 'all' ? undefined : activeTab,
        page: pagination.page,
        limit: pagination.limit,
      })

      if (response.success && response.data) {
        setPayments(response.data.payments)
        setPagination(prev => ({
          ...prev,
          total: response.data.totalPayments,
          totalPages: response.data.totalPages,
        }))
      } else {
        toast.error(response.message || 'পেমেন্ট লোড করতে ব্যর্থ হয়েছে')
      }
    } catch (error) {
      toast.error('পেমেন্ট ফেট্চ করার সময় একটি ত্রুটি ঘটেছে')
      console.error('Error fetching payments:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPayments()
  }, [activeTab, pagination.page])

  const handleVerifyClick = (payment: Payment) => {
    setSelectedPayment(payment)
    setError(null)
    setActionType('verify')
    setVerificationData({
      transactionId: '',
      amount: payment.amount,
      remarks: '',
    })
  }

  const handleRejectClick = (payment: Payment) => {
    setSelectedPayment(payment)
    setError(null)
    setActionType('reject')
    setVerificationData({
      transactionId: '',
      amount: '',
      remarks: '',
    })
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setVerificationData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async () => {
    if (!selectedPayment) return

    try {
      setProcessing(true)
      setError(null)

      if (actionType === 'verify') {
        if (!verificationData.transactionId) {
          setError('লেনদেন আইডি প্রয়োজন')
          return
        }

        const response = await verifyPayment({
          paymentId: selectedPayment.paymentId,
          transactionId: verificationData.transactionId,
          amount: verificationData.amount,
          paymentType: selectedPayment.paymentType,
        })

        if (response?.success) {
          toast.success('পেমেন্ট সফলভাবে যাচাই করা হয়েছে')
          fetchPayments()
          closeModal()
        } else {
          throw new Error(response?.message || 'Failed to verify payment')
        }
      } else if (actionType === 'reject') {
        const response = await rejectPayment({
          remarks: verificationData.remarks,
          paymentId: selectedPayment.paymentId,
        })

        if (response.success) {
          toast.success('পেমেন্ট সফলভাবে প্রত্যাখ্যান করা হয়েছে')
          fetchPayments()
          closeModal()
        } else {
          throw new Error(response.message || 'Failed to reject payment')
        }
      }
    } catch (error) {
      setError((error as Error).message || 'একটি ত্রুটি ঘটেছে')
    } finally {
      setProcessing(false)
    }
  }

  const closeModal = () => {
    setSelectedPayment(null)
    setActionType(null)
    setVerificationData({
      transactionId: '',
      amount: '',
      remarks: '',
    })
  }

  const getPaymentTypeText = (type: string) => {
    switch (type) {
      case 'DuePayment':
        return 'বকেয়া পেমেন্ট'
      case 'OrderPayment':
        return 'অর্ডার পেমেন্ট'
      case 'WithdrawPayment':
        return 'উত্তোলন পেমেন্ট'
      default:
        return type
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className='px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800'>
            পেন্ডিং
          </span>
        )
      case 'verified':
        return (
          <span className='px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800'>
            যাচাইকৃত
          </span>
        )
      case 'rejected':
        return (
          <span className='px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800'>
            প্রত্যাখ্যাত
          </span>
        )
      default:
        return (
          <span className='px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800'>
            {status}
          </span>
        )
    }
  }

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }))
  }

  const renderWalletFlow = (payment: Payment) => {
    const senderWallet =
      payment.sender === 'Seller'
        ? `${payment.sellerWalletName} (${payment.sellerWalletPhoneNo})`
        : `${payment.adminWalletName} (${payment.adminWalletPhoneNo})`

    const receiverWallet =
      payment.sender === 'Seller'
        ? `${payment.adminWalletName} (${payment.adminWalletPhoneNo})`
        : `${payment.sellerWalletName} (${payment.sellerWalletPhoneNo})`

    return (
      <div className='flex items-center text-xs'>
        <div className='text-xs font-medium text-gray-700'>{senderWallet}</div>
        <div className='mx-1 flex items-center'>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            className='h-4 w-4 text-gray-500 text-xs'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M13 5l7 7-7 7M5 5l7 7-7 7'
            />
          </svg>
        </div>
        <div className='text-xs font-medium text-gray-700'>{receiverWallet}</div>
      </div>
    )
  }

  return (
    <div className='px-4 py-6 max-w-6xl mx-auto'>
      <h1 className='text-xl font-bold mb-4 md:text-2xl md:mb-6'>পেমেন্ট ব্যবস্থাপনা</h1>

      {/* Tabs and Filters */}
      <div className='mb-6'>
        <div className='border-b border-gray-200 mb-4'>
          <nav className='-mb-px flex space-x-4'>
            <button
              onClick={() => {
                setActiveTab('all')
                setPagination(prev => ({ ...prev, page: 1 }))
              }}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'all'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              সব পেমেন্ট
            </button>
            <button
              onClick={() => {
                setActiveTab('pending')
                setPagination(prev => ({ ...prev, page: 1 }))
              }}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'pending'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              পেন্ডিং
            </button>
            <button
              onClick={() => {
                setActiveTab('verified')
                setPagination(prev => ({ ...prev, page: 1 }))
              }}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'verified'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              যাচাইকৃত
            </button>
            <button
              onClick={() => {
                setActiveTab('rejected')
                setPagination(prev => ({ ...prev, page: 1 }))
              }}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'rejected'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              প্রত্যাখ্যাত
            </button>
          </nav>
        </div>

        <div className='flex justify-between items-center'>
          <div className='text-sm text-gray-500'>মোট পেমেন্ট: {pagination.total}</div>
          <div className='flex items-center space-x-2'>
            <label htmlFor='limit' className='text-sm text-gray-500'>
              প্রতি পৃষ্ঠায়:
            </label>
            <select
              id='limit'
              value={pagination.limit}
              onChange={e => {
                setPagination(prev => ({
                  ...prev,
                  limit: Number(e.target.value),
                  page: 1,
                }))
              }}
              className='border rounded-md px-2 py-1 text-sm'
            >
              <option value='10'>10</option>
              <option value='25'>25</option>
              <option value='50'>50</option>
              <option value='100'>100</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className='flex justify-center items-center h-64'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500'></div>
        </div>
      ) : payments.length === 0 ? (
        <div className='bg-white rounded-lg shadow p-6 text-center'>
          <p className='text-gray-500'>কোন পেমেন্ট পাওয়া যায়নি</p>
        </div>
      ) : (
        <div className='bg-white rounded-lg shadow overflow-hidden'>
          {/* Desktop View - Table */}
          <div className='hidden md:block overflow-x-auto'>
            <table className='min-w-full divide-y divide-gray-200 text-sm'>
              <thead className='bg-gray-50'>
                <tr>
                  <th className='px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider'>
                    তারিখ
                  </th>
                  <th className='px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider'>
                    ধরণ
                  </th>
                  <th className='px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider'>
                    ওয়ালেট লেনদেন
                  </th>
                  <th className='px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider'>
                    পরিমাণ
                  </th>
                  <th className='px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider'>
                    স্ট্যাটাস
                  </th>
                  {activeTab === 'pending' && (
                    <th className='px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider'>
                      অ্যাকশন
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className='bg-white divide-y divide-gray-200'>
                {payments.map(payment => (
                  <tr key={payment.paymentId}>
                    <td className='px-4 py-4 whitespace-nowrap text-gray-500'>
                      {formatDate(payment.paymentDate)}
                    </td>
                    <td className='px-4 py-4 whitespace-nowrap'>
                      <div className='font-medium text-gray-900'>
                        {getPaymentTypeText(payment.paymentType)}
                      </div>
                      <div className='text-gray-500 text-xs mt-1'>
                        {payment.sender === 'Seller'
                          ? 'বিক্রেতা থেকে অ্যাডমিন'
                          : 'অ্যাডমিন থেকে বিক্রেতা'}
                      </div>
                    </td>
                    <td className='px-4 py-4'>{renderWalletFlow(payment)}</td>
                    <td className='px-4 py-4 whitespace-nowrap text-gray-900'>
                      <div className='font-medium'>{parseFloat(payment.amount).toFixed(2)}৳</div>
                      {payment.transactionFee && (
                        <div className='text-xs text-gray-500'>
                          ফি: {parseFloat(payment.transactionFee).toFixed(2)}৳
                        </div>
                      )}
                    </td>
                    <td className='px-4 py-4 whitespace-nowrap'>
                      {getStatusBadge(payment.paymentStatus)}
                      {payment.processedAt && (
                        <div className='text-xs text-gray-500 mt-1'>
                          {formatDate(payment.processedAt)}
                        </div>
                      )}
                    </td>
                    {payment.paymentStatus === 'pending' && (
                      <td className='px-4 py-4 whitespace-nowrap font-medium'>
                        <div className='flex gap-2'>
                          <button
                            onClick={() => handleVerifyClick(payment)}
                            className='text-green-600 hover:text-green-800'
                          >
                            যাচাই করুন
                          </button>
                          <button
                            onClick={() => handleRejectClick(payment)}
                            className='text-red-600 hover:text-red-800'
                          >
                            প্রত্যাখ্যান করুন
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile View - Cards */}
          <div className='md:hidden space-y-3 p-3'>
            {payments.map(payment => (
              <div key={payment.paymentId} className='border rounded-lg p-3 text-xs'>
                <div className='flex justify-between items-start'>
                  <div>
                    <p className='text-gray-500'>{formatDate(payment.paymentDate)}</p>
                    <h3 className='font-medium'>{getPaymentTypeText(payment.paymentType)}</h3>
                    <p className='text-gray-500 text-xs mt-1'>
                      {payment.sender === 'Seller'
                        ? 'বিক্রেতা থেকে অ্যাডমিন'
                        : 'অ্যাডমিন থেকে বিক্রেতা'}
                    </p>
                  </div>
                  {getStatusBadge(payment.paymentStatus)}
                </div>

                <div className='mt-3'>{renderWalletFlow(payment)}</div>

                <div className='mt-2 grid grid-cols-2 gap-2'>
                  <div>
                    <p className='text-gray-500'>পরিমাণ:</p>
                    <p className='font-medium'>{parseFloat(payment.amount).toFixed(2)}৳</p>
                    {payment.transactionFee && (
                      <p className='text-gray-500 text-xs'>
                        ফি: {parseFloat(payment.transactionFee).toFixed(2)}৳
                      </p>
                    )}
                  </div>
                  <div>
                    <p className='text-gray-500'>প্রক্রিয়াকরণ:</p>
                    <p className='text-gray-500'>
                      {payment.processedAt ? formatDate(payment.processedAt) : 'প্রক্রিয়াধীন'}
                    </p>
                  </div>
                </div>

                {payment.paymentStatus === 'pending' && (
                  <div className='mt-3 grid grid-cols-2 gap-2'>
                    <button
                      onClick={() => handleVerifyClick(payment)}
                      className='py-1 px-2 bg-green-50 text-green-600 rounded font-medium'
                    >
                      যাচাই করুন
                    </button>
                    <button
                      onClick={() => handleRejectClick(payment)}
                      className='py-1 px-2 bg-red-50 text-red-600 rounded font-medium'
                    >
                      প্রত্যাখ্যান করুন
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className='px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6'>
              <div className='flex-1 flex justify-between sm:hidden'>
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className='relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  পূর্ববর্তী
                </button>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                  className='ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  পরবর্তী
                </button>
              </div>
              <div className='hidden sm:flex-1 sm:flex sm:items-center sm:justify-between'>
                <div>
                  <p className='text-sm text-gray-700'>
                    দেখানো হচ্ছে{' '}
                    <span className='font-medium'>
                      {(pagination.page - 1) * pagination.limit + 1}
                    </span>{' '}
                    থেকে{' '}
                    <span className='font-medium'>
                      {Math.min(pagination.page * pagination.limit, pagination.total)}
                    </span>{' '}
                    টি পেমেন্টের <span className='font-medium'>{pagination.total}</span> টির মধ্যে
                  </p>
                </div>
                <div>
                  <nav
                    className='relative z-0 inline-flex rounded-md shadow-sm -space-x-px'
                    aria-label='Pagination'
                  >
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className='relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
                    >
                      <span className='sr-only'>Previous</span>
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
                      } else if (pagination.page <= 3) {
                        pageNum = i + 1
                      } else if (pagination.page >= pagination.totalPages - 2) {
                        pageNum = pagination.totalPages - 4 + i
                      } else {
                        pageNum = pagination.page - 2 + i
                      }
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            pagination.page === pageNum
                              ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      )
                    })}
                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page >= pagination.totalPages}
                      className='relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
                    >
                      <span className='sr-only'>Next</span>
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

      {/* Verification Modal */}
      {selectedPayment && actionType === 'verify' && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
          <div className='bg-white rounded-lg shadow-lg w-full max-w-md'>
            <div className='p-4 border-b'>
              <h2 className='text-lg font-medium'>পেমেন্ট যাচাই করুন</h2>
            </div>

            <div className='p-4 space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <p className='text-sm font-medium text-gray-700'>বিক্রেতা:</p>
                  <p className='mt-1 text-gray-900'>
                    {selectedPayment.sellerName} ({selectedPayment.sellerPhoneNo})
                  </p>
                </div>
                <div>
                  <p className='text-sm font-medium text-gray-700'>ধরণ:</p>
                  <p className='mt-1 text-gray-900'>
                    {getPaymentTypeText(selectedPayment.paymentType)}
                  </p>
                </div>
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <p className='text-sm font-medium text-gray-700'>ওয়ালেট লেনদেন:</p>
                  <div className='mt-1'>{renderWalletFlow(selectedPayment)}</div>
                </div>
                <div>
                  <p className='text-sm font-medium text-gray-700'>অনুরোধকৃত পরিমাণ:</p>
                  <p className='mt-1 text-gray-900'>
                    {parseFloat(selectedPayment.amount).toFixed(2)}৳
                  </p>
                </div>
              </div>
              {error && (
                <div className='bg-red-50 p-3 rounded-md text-red-800 text-sm font-medium'>
                  {error}
                </div>
              )}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  লেনদেন আইডি *
                </label>
                <input
                  type='text'
                  name='transactionId'
                  value={verificationData.transactionId}
                  onChange={handleInputChange}
                  placeholder='লেনদেন আইডি লিখুন'
                  className='w-full px-3 py-1.5 border rounded-md text-sm'
                  required
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>পরিমাণ *</label>
                <input
                  type='number'
                  name='amount'
                  value={verificationData.amount}
                  onChange={handleInputChange}
                  placeholder='পরিমাণ লিখুন'
                  className='w-full px-3 py-1.5 border rounded-md text-sm'
                  required
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  মন্তব্য (ঐচ্ছিক)
                </label>
                <textarea
                  name='remarks'
                  value={verificationData.remarks}
                  onChange={handleInputChange}
                  placeholder='মন্তব্য লিখুন'
                  rows={3}
                  className='w-full px-3 py-1.5 border rounded-md text-sm'
                />
              </div>
            </div>

            <div className='p-4 border-t flex justify-end gap-3'>
              <button
                onClick={closeModal}
                disabled={processing}
                className='px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50'
              >
                বাতিল করুন
              </button>
              <button
                onClick={handleSubmit}
                disabled={processing || !verificationData.transactionId || !verificationData.amount}
                className='px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50'
              >
                {processing ? 'প্রসেসিং...' : 'যাচাই করুন'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {selectedPayment && actionType === 'reject' && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
          <div className='bg-white rounded-lg shadow-lg w-full max-w-md'>
            <div className='p-4 border-b'>
              <h2 className='text-lg font-medium text-red-600'>পেমেন্ট প্রত্যাখ্যান করুন</h2>
            </div>

            <div className='p-4 space-y-4'>
              <div className='bg-red-50 p-3 rounded-md'>
                <div className='flex items-start'>
                  <div className='flex-shrink-0'>
                    <svg
                      className='h-5 w-5 text-red-400'
                      xmlns='http://www.w3.org/2000/svg'
                      viewBox='0 0 20 20'
                      fill='currentColor'
                    >
                      <path
                        fillRule='evenodd'
                        d='M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z'
                        clipRule='evenodd'
                      />
                    </svg>
                  </div>
                  <div className='ml-3'>
                    <h3 className='text-sm font-medium text-red-800'>
                      আপনি এই পেমেন্টটি প্রত্যাখ্যান করতে চলেছেন
                    </h3>
                    <div className='mt-2 text-sm text-red-700'>
                      <p>
                        বিক্রেতা: {selectedPayment.sellerName} ({selectedPayment.sellerPhoneNo})
                      </p>
                      <p className='mt-1'>
                        পরিমাণ: {parseFloat(selectedPayment.amount).toFixed(2)}৳
                      </p>
                      <p className='mt-1'>ধরণ: {getPaymentTypeText(selectedPayment.paymentType)}</p>
                    </div>
                  </div>
                </div>
              </div>
              {error && (
                <div className='bg-red-50 p-3 rounded-md text-red-800 text-sm font-medium'>
                  {error}
                </div>
              )}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  কারণ (ঐচ্ছিক)
                </label>
                <textarea
                  name='remarks'
                  value={verificationData.remarks}
                  onChange={handleInputChange}
                  placeholder='প্রত্যাখ্যানের কারণ লিখুন'
                  rows={3}
                  className='w-full px-3 py-1.5 border rounded-md text-sm'
                />
              </div>
            </div>

            <div className='p-4 border-t flex justify-end gap-3'>
              <button
                onClick={closeModal}
                disabled={processing}
                className='px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50'
              >
                বাতিল করুন
              </button>
              <button
                onClick={handleSubmit}
                disabled={processing}
                className='px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50'
              >
                {processing ? 'প্রসেসিং...' : 'প্রত্যাখ্যান করুন'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminPaymentVerification
