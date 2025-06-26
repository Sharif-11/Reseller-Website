import { useEffect, useState } from 'react'
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

const WithdrawHistory = () => {
  const [allRequests, setAllRequests] = useState<WithdrawRequest[]>([])
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
        toast.error(response.message || 'Failed to load withdrawal history')
      }
    } catch (error) {
      toast.error('An error occurred while fetching withdrawal history')
      console.error('Error fetching withdrawal history:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPageSize = parseInt(e.target.value)
    setPagination(prev => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab],
        pageSize: newPageSize,
      },
    }))
    fetchWithdrawHistory(1, newPageSize)
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
        toast.success('Withdrawal request cancelled successfully')
        fetchWithdrawHistory(pagination[activeTab].currentPage)
      } else {
        throw new Error(response.message || 'Failed to cancel request')
      }
    } catch (error) {
      toast.error((error as Error).message || 'Error cancelling withdrawal request')
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
  }

  const getStatusBadge = (status: string) => {
    const baseClasses = 'px-2 py-1 rounded-full text-xs font-medium'

    switch (status) {
      case 'COMPLETED':
        return <span className={`${baseClasses} bg-green-100 text-green-800`}>Completed</span>
      case 'REJECTED':
        return <span className={`${baseClasses} bg-red-100 text-red-800`}>Rejected</span>
      case 'CANCELLED':
        return <span className={`${baseClasses} bg-gray-100 text-gray-800`}>Cancelled</span>
      default:
        return <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>Pending</span>
    }
  }

  const showDetailsModal = (request: WithdrawRequest) => {
    setSelectedRequest(request)
  }

  const closeDetailsModal = () => {
    setSelectedRequest(null)
  }

  const currentPagination = pagination[activeTab]

  return (
    <div className='px-4 py-6 max-w-6xl mx-auto'>
      <h1 className='text-xl font-bold mb-4 md:text-2xl md:mb-6'>Withdrawal History</h1>

      {/* Search and filter section */}
      <div className='mb-4'>
        <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-3'>
          <div className='flex border-b'>
            <button
              className={`px-3 py-2 text-xs md:text-sm ${
                activeTab === 'PENDING'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500'
              }`}
              onClick={() => setActiveTab('PENDING')}
            >
              Pending
            </button>
            <button
              className={`px-3 py-2 text-xs md:text-sm ${
                activeTab === 'COMPLETED'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500'
              }`}
              onClick={() => setActiveTab('COMPLETED')}
            >
              Completed
            </button>
            <button
              className={`px-3 py-2 text-xs md:text-sm ${
                activeTab === 'REJECTED'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500'
              }`}
              onClick={() => setActiveTab('REJECTED')}
            >
              Rejected
            </button>
          </div>

          <form onSubmit={handleSearch} className='flex items-center gap-2'>
            <input
              type='text'
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder='Search by phone, name, or transaction ID'
              className='w-full md:w-64 px-3 py-1.5 border rounded-md text-sm'
            />
            <button
              type='submit'
              className='px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700'
            >
              Search
            </button>
          </form>

          <select
            value={currentPagination.pageSize}
            onChange={handlePageSizeChange}
            className='border rounded-md px-2 py-1.5 text-sm'
          >
            <option value='5'>5 per page</option>
            <option value='10'>10 per page</option>
            <option value='20'>20 per page</option>
            <option value='50'>50 per page</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className='flex justify-center items-center h-64'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500'></div>
        </div>
      ) : allRequests.length === 0 ? (
        <div className='bg-white rounded-lg shadow p-6 text-center'>
          <p className='text-gray-500'>No {activeTab.toLowerCase()} withdrawal requests found</p>
        </div>
      ) : (
        <>
          {/* Desktop view - table (hidden on mobile) */}
          <div className='hidden md:block bg-white rounded-lg shadow overflow-hidden'>
            <div className='overflow-x-auto'>
              <table className='min-w-full divide-y divide-gray-200 text-sm'>
                <thead className='bg-gray-50'>
                  <tr>
                    <th className='px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider'>
                      Date
                    </th>
                    <th className='px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider'>
                      Wallet
                    </th>
                    <th className='px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider'>
                      Amount
                    </th>
                    <th className='px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider'>
                      Fee
                    </th>
                    <th className='px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider'>
                      Received
                    </th>
                    <th className='px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider'>
                      Status
                    </th>
                    <th className='px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider'>
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className='bg-white divide-y divide-gray-200'>
                  {allRequests.map(request => (
                    <tr key={request.withdrawId}>
                      <td className='px-4 py-4 whitespace-nowrap text-gray-500'>
                        {formatDate(request.requestedAt)}
                      </td>
                      <td className='px-4 py-4 whitespace-nowrap'>
                        <div className='font-medium text-gray-900'>{request.walletName}</div>
                        <div className='text-gray-500'>{request.walletPhoneNo}</div>
                      </td>
                      <td className='px-4 py-4 whitespace-nowrap text-gray-900'>
                        {parseFloat(request.amount).toFixed(2)}৳
                      </td>
                      <td className='px-4 py-4 whitespace-nowrap text-gray-500'>
                        {parseFloat(request.transactionFee).toFixed(2)}৳
                      </td>
                      <td className='px-4 py-4 whitespace-nowrap text-gray-900 font-medium'>
                        {parseFloat(request.actualAmount).toFixed(2)}৳
                      </td>
                      <td className='px-4 py-4 whitespace-nowrap'>
                        <div className='flex items-center space-x-2'>
                          {getStatusBadge(request.withdrawStatus)}
                          {(request.withdrawStatus === 'COMPLETED' ||
                            request.withdrawStatus === 'REJECTED') && (
                            <button
                              onClick={() => showDetailsModal(request)}
                              className='text-blue-600 hover:text-blue-800'
                            >
                              Details
                            </button>
                          )}
                        </div>
                      </td>
                      <td className='px-4 py-4 whitespace-nowrap font-medium'>
                        {request.withdrawStatus === 'PENDING' ? (
                          <button
                            onClick={() => openCancelConfirmation(request)}
                            disabled={cancellingId === request.withdrawId}
                            className='text-red-600 hover:text-red-900 disabled:opacity-50'
                          >
                            {cancellingId === request.withdrawId ? 'Cancelling...' : 'Cancel'}
                          </button>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile view - list (hidden on desktop) */}
          <div className='md:hidden space-y-4'>
            {allRequests.map(request => (
              <div key={request.withdrawId} className='bg-white rounded-lg shadow p-4'>
                <div className='flex justify-between items-start'>
                  <div>
                    <p className='text-sm text-gray-500'>{formatDate(request.requestedAt)}</p>
                    <h3 className='font-medium text-gray-900 mt-1'>{request.walletName}</h3>
                    <p className='text-sm text-gray-500'>{request.walletPhoneNo}</p>
                  </div>
                  <div className='text-right'>
                    <div className='font-medium text-gray-900'>
                      {parseFloat(request.amount).toFixed(2)}৳
                    </div>
                    <div className='text-xs text-gray-500'>
                      Fee: {parseFloat(request.transactionFee).toFixed(2)}৳
                    </div>
                    <div className='text-sm font-medium text-green-600'>
                      {parseFloat(request.actualAmount).toFixed(2)}৳
                    </div>
                  </div>
                </div>

                <div className='mt-3 flex justify-between items-center'>
                  <div>{getStatusBadge(request.withdrawStatus)}</div>
                  <div className='flex space-x-2'>
                    {(request.withdrawStatus === 'COMPLETED' ||
                      request.withdrawStatus === 'REJECTED') && (
                      <button
                        onClick={() => showDetailsModal(request)}
                        className='text-blue-600 hover:text-blue-800 text-sm'
                      >
                        Details
                      </button>
                    )}
                    {request.withdrawStatus === 'PENDING' && (
                      <button
                        onClick={() => openCancelConfirmation(request)}
                        disabled={cancellingId === request.withdrawId}
                        className='text-red-600 hover:text-red-900 text-sm disabled:opacity-50'
                      >
                        {cancellingId === request.withdrawId ? 'Cancelling...' : 'Cancel'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {currentPagination.totalPages > 1 && (
            <div className='bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-200 mt-4'>
              <div className='flex-1 flex justify-between sm:hidden'>
                <button
                  onClick={() => fetchWithdrawHistory(currentPagination.currentPage - 1)}
                  disabled={currentPagination.currentPage === 1}
                  className='relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50'
                >
                  Previous
                </button>
                <button
                  onClick={() => fetchWithdrawHistory(currentPagination.currentPage + 1)}
                  disabled={currentPagination.currentPage === currentPagination.totalPages}
                  className='ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50'
                >
                  Next
                </button>
              </div>

              <div className='hidden sm:flex-1 sm:flex sm:items-center sm:justify-between'>
                <div>
                  <p className='text-sm text-gray-700'>
                    Showing{' '}
                    <span className='font-medium'>
                      {(currentPagination.currentPage - 1) * currentPagination.pageSize + 1}
                    </span>{' '}
                    to{' '}
                    <span className='font-medium'>
                      {Math.min(
                        currentPagination.currentPage * currentPagination.pageSize,
                        currentPagination.totalRequests
                      )}
                    </span>{' '}
                    of <span className='font-medium'>{currentPagination.totalRequests}</span>{' '}
                    requests
                  </p>
                </div>
                <div>
                  <nav className='relative z-0 inline-flex rounded-md shadow-sm -space-x-px'>
                    <button
                      onClick={() => fetchWithdrawHistory(currentPagination.currentPage - 1)}
                      disabled={currentPagination.currentPage === 1}
                      className='relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50'
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
                    {Array.from({ length: Math.min(5, currentPagination.totalPages) }, (_, i) => {
                      let pageNum
                      if (currentPagination.totalPages <= 5) {
                        pageNum = i + 1
                      } else if (currentPagination.currentPage <= 3) {
                        pageNum = i + 1
                      } else if (
                        currentPagination.currentPage >=
                        currentPagination.totalPages - 2
                      ) {
                        pageNum = currentPagination.totalPages - 4 + i
                      } else {
                        pageNum = currentPagination.currentPage - 2 + i
                      }
                      return (
                        <button
                          key={pageNum}
                          onClick={() => fetchWithdrawHistory(pageNum)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            pageNum === currentPagination.currentPage
                              ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      )
                    })}
                    <button
                      onClick={() => fetchWithdrawHistory(currentPagination.currentPage + 1)}
                      disabled={currentPagination.currentPage === currentPagination.totalPages}
                      className='relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50'
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
        </>
      )}

      {/* Details Modal */}
      {selectedRequest && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
          <div className='bg-white rounded-lg shadow-lg w-full max-w-md'>
            <div className='p-4 border-b'>
              <h2 className='text-lg font-medium'>Withdrawal Request Details</h2>
            </div>

            <div className='p-4 space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <p className='text-sm font-medium text-gray-700'>Status:</p>
                  <div className='mt-1'>{getStatusBadge(selectedRequest.withdrawStatus)}</div>
                </div>
                <div>
                  <p className='text-sm font-medium text-gray-700'>Request Date:</p>
                  <p className='mt-1 text-gray-900'>{formatDate(selectedRequest.requestedAt)}</p>
                </div>
              </div>

              <div className='grid grid-cols-3 gap-2'>
                <div>
                  <p className='text-sm font-medium text-gray-700'>Amount:</p>
                  <p className='mt-1 text-gray-900'>
                    {parseFloat(selectedRequest.amount).toFixed(2)}৳
                  </p>
                </div>
                <div>
                  <p className='text-sm font-medium text-gray-700'>Fee:</p>
                  <p className='mt-1 text-gray-900'>
                    {parseFloat(selectedRequest.transactionFee).toFixed(2)}৳
                  </p>
                </div>
                <div>
                  <p className='text-sm font-medium text-gray-700'>Received:</p>
                  <p className='mt-1 text-gray-900 font-medium'>
                    {parseFloat(selectedRequest.actualAmount).toFixed(2)}৳
                  </p>
                </div>
              </div>

              <div>
                <p className='text-sm font-medium text-gray-700'>Wallet:</p>
                <p className='mt-1 text-gray-900'>
                  {selectedRequest.walletName} - {selectedRequest.walletPhoneNo}
                </p>
              </div>

              {selectedRequest.withdrawStatus !== 'PENDING' && (
                <>
                  <div className='grid grid-cols-2 gap-4'>
                    <div>
                      <p className='text-sm font-medium text-gray-700'>Transaction ID:</p>
                      <p className='mt-1 text-gray-900'>{selectedRequest.transactionId || 'N/A'}</p>
                    </div>
                    <div>
                      <p className='text-sm font-medium text-gray-700'>Processed Date:</p>
                      <p className='mt-1 text-gray-900'>
                        {selectedRequest.processedAt
                          ? formatDate(selectedRequest.processedAt)
                          : 'N/A'}
                      </p>
                    </div>
                  </div>
                </>
              )}

              {selectedRequest.remarks && (
                <div>
                  <p className='text-sm font-medium text-gray-700'>Remarks:</p>
                  <p className='mt-1 text-gray-900 whitespace-pre-line'>
                    {selectedRequest.remarks}
                  </p>
                </div>
              )}
            </div>

            <div className='p-4 border-t flex justify-end'>
              <button
                onClick={closeDetailsModal}
                className='px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200'
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelConfirmation && requestToCancel && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
          <div className='bg-white rounded-lg shadow-lg w-full max-w-md'>
            <div className='p-4 border-b'>
              <h2 className='text-lg font-medium text-red-600'>Cancel Withdrawal Request</h2>
            </div>

            <div className='p-4 space-y-4'>
              <p className='text-gray-700'>
                Are you sure you want to cancel this withdrawal request?
              </p>

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
                      Amount: {parseFloat(requestToCancel.amount).toFixed(2)}৳
                    </h3>
                    <div className='mt-2 text-sm text-red-700'>
                      <p>
                        Wallet: {requestToCancel.walletName} - {requestToCancel.walletPhoneNo}
                      </p>
                      <p className='mt-1'>Date: {formatDate(requestToCancel.requestedAt)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className='p-4 border-t flex justify-end gap-3'>
              <button
                onClick={closeCancelConfirmation}
                className='px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200'
              >
                Cancel
              </button>
              <button
                onClick={() => handleCancelRequest(requestToCancel.withdrawId)}
                disabled={cancellingId === requestToCancel.withdrawId}
                className='px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50'
              >
                {cancellingId === requestToCancel.withdrawId ? 'Cancelling...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default WithdrawHistory
