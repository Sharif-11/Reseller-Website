import { useEffect, useState } from 'react'
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

  // Fetch payments from API
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
      toast.error('Failed to load payments')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  // Handle pagination change
  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, currentPage: page }))
  }

  // Handle items per page change
  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPagination(prev => ({
      ...prev,
      itemsPerPage: Number(e.target.value),
      currentPage: 1,
    }))
  }

  // Copy text to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard')
  }

  // Format amount with currency
  const formatAmount = (amount: string | null) => {
    return amount ? `${parseFloat(amount).toFixed(2)}৳` : 'N/A'
  }

  // Get payment type display text
  const getPaymentTypeText = (type: PaymentType) => {
    switch (type) {
      case 'DUE_PAYMENT':
        return 'Due Payment'
      case 'ORDER_PAYMENT':
        return 'Order Payment'
      case 'WITHDRAW_PAYMENT':
        return 'Withdraw Payment'
      default:
        return type
    }
  }

  // Get status badge
  const getStatusBadge = (status: PaymentStatus) => {
    const baseClasses = 'px-2 py-1 rounded-full text-xs font-medium'

    switch (status) {
      case 'COMPLETED':
        return <span className={`${baseClasses} bg-green-100 text-green-800`}>Completed</span>
      case 'REJECTED':
        return <span className={`${baseClasses} bg-red-100 text-red-800`}>Rejected</span>
      default:
        return <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>Pending</span>
    }
  }

  useEffect(() => {
    fetchPayments()
  }, [activeTab, pagination.currentPage, pagination.itemsPerPage, searchQuery])

  return (
    <div className='container mx-auto px-4 py-6'>
      <h1 className='text-2xl font-bold mb-6'>Payment History</h1>

      {/* Tabs and Search */}
      <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6'>
        <div className='flex border-b'>
          {['all', 'PENDING', 'COMPLETED', 'REJECTED'].map(tab => (
            <button
              key={tab}
              className={`px-4 py-2 font-medium ${
                activeTab === tab ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'
              }`}
              onClick={() => setActiveTab(tab as any)}
            >
              {tab === 'all' ? 'All' : tab.charAt(0) + tab.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        <div className='relative'>
          <input
            type='text'
            placeholder='Search by transaction ID, phone, name...'
            className='w-full md:w-64 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className='absolute right-3 top-2.5 text-gray-400 hover:text-gray-600'
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Items per page selector */}
      <div className='flex justify-end mb-4'>
        <div className='flex items-center space-x-2'>
          <span className='text-sm'>Items per page:</span>
          <select
            value={pagination.itemsPerPage}
            onChange={handleItemsPerPageChange}
            className='border rounded px-2 py-1 text-sm'
          >
            {[5, 10, 20, 50].map(num => (
              <option key={num} value={num}>
                {num}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Payment List */}
      {loading ? (
        <div className='flex justify-center items-center h-64'>
          <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500'></div>
        </div>
      ) : payments.length === 0 ? (
        <div className='bg-white rounded-lg shadow p-8 text-center'>
          <p className='text-gray-500'>No payments found</p>
        </div>
      ) : (
        <>
          {/* Mobile View - Card List */}
          <div className='md:hidden space-y-4'>
            {payments.map(payment => (
              <div key={payment.paymentId} className='bg-white rounded-lg shadow p-4'>
                <div className='flex justify-between items-start mb-2'>
                  <div>
                    <h3 className='font-medium'>{getPaymentTypeText(payment.paymentType)}</h3>
                    <p className='text-sm text-gray-500'>{formatDate(payment.paymentDate)}</p>
                  </div>
                  {getStatusBadge(payment.paymentStatus)}
                </div>

                <div className='space-y-2'>
                  <div className='flex justify-between'>
                    <span className='text-sm text-gray-500'>Amount:</span>
                    <span className='font-medium'>{formatAmount(payment.amount)}</span>
                  </div>

                  <div className='flex justify-between'>
                    <span className='text-sm text-gray-500'>Transaction ID:</span>
                    {payment.transactionId ? (
                      <button
                        onClick={() => copyToClipboard(payment.transactionId || '')}
                        className='text-blue-600 hover:text-blue-800 flex items-center'
                      >
                        {payment.transactionId.substring(0, 6)}...
                        <svg
                          xmlns='http://www.w3.org/2000/svg'
                          className='h-4 w-4 ml-1'
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
                      </button>
                    ) : (
                      <span className='text-gray-500'>N/A</span>
                    )}
                  </div>

                  <div className='flex items-center justify-between border-t pt-2'>
                    <div>
                      <p className='text-sm text-gray-500'>From:</p>
                      <p className='text-sm'>
                        {payment.sender === 'SELLER' ? (
                          <>
                            {payment.userWalletName} ({payment.userWalletPhoneNo})
                          </>
                        ) : (
                          <>
                            {payment.systemWalletName || 'System'} ({payment.systemWalletPhoneNo})
                          </>
                        )}
                      </p>
                    </div>
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      className='h-5 w-5 text-gray-400 mx-2'
                      fill='none'
                      viewBox='0 0 24 24'
                      stroke='currentColor'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M14 5l7 7m0 0l-7 7m7-7H3'
                      />
                    </svg>
                    <div>
                      <p className='text-sm text-gray-500'>To:</p>
                      <p className='text-sm'>
                        {payment.sender === 'SELLER' ? (
                          <>
                            {payment.systemWalletName || 'System'} ({payment.systemWalletPhoneNo})
                          </>
                        ) : (
                          <>
                            {payment.userWalletName} ({payment.userWalletPhoneNo})
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedPayment(payment)}
                  className='w-full mt-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-sm'
                >
                  View Details
                </button>
              </div>
            ))}
          </div>

          {/* Desktop View - Table */}
          <div className='hidden md:block overflow-x-auto bg-white rounded-lg shadow'>
            <table className='min-w-full divide-y divide-gray-200'>
              <thead className='bg-gray-50'>
                <tr>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Date
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Type
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Amount
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Transaction ID
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Sender → Receiver
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Status
                  </th>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className='bg-white divide-y divide-gray-200'>
                {payments.map(payment => (
                  <tr key={payment.paymentId} className='hover:bg-gray-50'>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                      {formatDate(payment.paymentDate)}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                      {getPaymentTypeText(payment.paymentType)}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                      {formatAmount(payment.amount)}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                      {payment.transactionId ? (
                        <button
                          onClick={() => copyToClipboard(payment.transactionId || '')}
                          className='text-blue-600 hover:text-blue-800 flex items-center'
                        >
                          {payment.transactionId}
                          <svg
                            xmlns='http://www.w3.org/2000/svg'
                            className='h-4 w-4 ml-1'
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
                        </button>
                      ) : (
                        'N/A'
                      )}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                      <div className='flex items-center'>
                        <div className='mr-2'>
                          <div className='font-medium'>
                            {payment.sender === 'SELLER'
                              ? payment.userWalletName
                              : payment.systemWalletName || 'System'}
                          </div>
                          <div className='text-xs'>
                            {payment.sender === 'SELLER'
                              ? payment.userWalletPhoneNo
                              : payment.systemWalletPhoneNo}
                          </div>
                        </div>
                        <svg
                          xmlns='http://www.w3.org/2000/svg'
                          className='h-4 w-4 mx-1 text-gray-400'
                          fill='none'
                          viewBox='0 0 24 24'
                          stroke='currentColor'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M14 5l7 7m0 0l-7 7m7-7H3'
                          />
                        </svg>
                        <div className='ml-2'>
                          <div className='font-medium'>
                            {payment.sender === 'SELLER'
                              ? payment.systemWalletName || 'System'
                              : payment.userWalletName}
                          </div>
                          <div className='text-xs'>
                            {payment.sender === 'SELLER'
                              ? payment.systemWalletPhoneNo
                              : payment.userWalletPhoneNo}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      {getStatusBadge(payment.paymentStatus)}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                      <button
                        onClick={() => setSelectedPayment(payment)}
                        className='text-blue-600 hover:text-blue-900'
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className='flex items-center justify-between mt-4'>
            <div className='text-sm text-gray-700'>
              Showing{' '}
              <span className='font-medium'>
                {(pagination.currentPage - 1) * pagination.itemsPerPage + 1}
              </span>{' '}
              to{' '}
              <span className='font-medium'>
                {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)}
              </span>{' '}
              of <span className='font-medium'>{pagination.totalItems}</span> results
            </div>
            <div className='flex space-x-2'>
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className='px-3 py-1 border rounded disabled:opacity-50'
              >
                Previous
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
                    className={`px-3 py-1 border rounded ${
                      pagination.currentPage === pageNum ? 'bg-blue-600 text-white' : ''
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              })}
              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
                className='px-3 py-1 border rounded disabled:opacity-50'
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}

      {/* Payment Details Modal */}
      {selectedPayment && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
          <div className='bg-white rounded-lg shadow-xl w-full max-w-md'>
            <div className='px-6 py-4 border-b'>
              <h2 className='text-xl font-semibold'>Payment Details</h2>
            </div>
            <div className='p-6 space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <p className='text-sm text-gray-500'>Status</p>
                  <p className='font-medium'>{getStatusBadge(selectedPayment.paymentStatus)}</p>
                </div>
                <div>
                  <p className='text-sm text-gray-500'>Type</p>
                  <p className='font-medium'>{getPaymentTypeText(selectedPayment.paymentType)}</p>
                </div>
                <div>
                  <p className='text-sm text-gray-500'>Date</p>
                  <p className='font-medium'>{formatDate(selectedPayment.paymentDate)}</p>
                </div>
                <div>
                  <p className='text-sm text-gray-500'>Processed At</p>
                  <p className='font-medium'>
                    {selectedPayment.processedAt ? formatDate(selectedPayment.processedAt) : 'N/A'}
                  </p>
                </div>
              </div>

              <div className='border-t pt-4'>
                <h3 className='font-medium mb-2'>Amount Details</h3>
                <div className='grid grid-cols-3 gap-2'>
                  <div>
                    <p className='text-sm text-gray-500'>Amount</p>
                    <p className='font-medium'>{formatAmount(selectedPayment.amount)}</p>
                  </div>
                  {selectedPayment.transactionFee && (
                    <div>
                      <p className='text-sm text-gray-500'>Fee</p>
                      <p className='font-medium'>{formatAmount(selectedPayment.transactionFee)}</p>
                    </div>
                  )}
                  <div>
                    <p className='text-sm text-gray-500'>Received</p>
                    <p className='font-medium'>{formatAmount(selectedPayment.actualAmount)}</p>
                  </div>
                </div>
              </div>

              <div className='border-t pt-4'>
                <h3 className='font-medium mb-2'>Transaction Details</h3>
                <div className='space-y-2'>
                  <div>
                    <p className='text-sm text-gray-500'>Transaction ID</p>
                    {selectedPayment.transactionId ? (
                      <button
                        onClick={() => copyToClipboard(selectedPayment.transactionId || '')}
                        className='font-medium text-blue-600 flex items-center'
                      >
                        {selectedPayment.transactionId}
                        <svg
                          xmlns='http://www.w3.org/2000/svg'
                          className='h-4 w-4 ml-1'
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
                      </button>
                    ) : (
                      <p className='font-medium'>N/A</p>
                    )}
                  </div>
                  <div>
                    <p className='text-sm text-gray-500'>Sender</p>
                    <p className='font-medium'>
                      {selectedPayment.sender === 'SELLER' ? (
                        <>
                          {selectedPayment.userWalletName} ({selectedPayment.userWalletPhoneNo})
                        </>
                      ) : (
                        <>
                          {selectedPayment.systemWalletName || 'System'} (
                          {selectedPayment.systemWalletPhoneNo})
                        </>
                      )}
                    </p>
                  </div>
                  <div>
                    <p className='text-sm text-gray-500'>Receiver</p>
                    <p className='font-medium'>
                      {selectedPayment.sender === 'SELLER' ? (
                        <>
                          {selectedPayment.systemWalletName || 'System'} (
                          {selectedPayment.systemWalletPhoneNo})
                        </>
                      ) : (
                        <>
                          {selectedPayment.userWalletName} ({selectedPayment.userWalletPhoneNo})
                        </>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {selectedPayment.remarks && (
                <div className='border-t pt-4'>
                  <h3 className='font-medium mb-2'>Remarks</h3>
                  <p className='text-sm'>{selectedPayment.remarks}</p>
                </div>
              )}
            </div>
            <div className='px-6 py-4 border-t flex justify-end'>
              <button
                onClick={() => setSelectedPayment(null)}
                className='px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md'
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PaymentHistory
