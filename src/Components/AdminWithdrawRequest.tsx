import { useEffect, useState } from 'react'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import {
  approveWithdrawRequestForAdmin,
  getAllWithdrawRequestForAdmin,
  rejectWithdrawRequestForAdmin,
} from '../Api/admin.api'
import { formatDate } from '../utils/date.utils'

interface WithdrawRequest {
  withdrawId: string
  userId: string
  userPhoneNo: string
  userName: string
  amount: string
  actualAmount: string
  transactionFee: string
  walletName: 'bKash' | 'Nagad'
  walletPhoneNo: string
  transactionId: string | null
  transactionPhoneNo: string | null
  remarks: string | null
  requestedAt: string
  processedAt: string | null
  status: 'pending' | 'completed' | 'rejected'
}

interface PaginationState {
  currentPage: number
  totalPages: number
  totalRequests: number
  pageSize: number
}

const AdminWithdrawRequests = () => {
  const [requests, setRequests] = useState<WithdrawRequest[]>([])
  const [filteredRequests, setFilteredRequests] = useState<WithdrawRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState<Record<string, PaginationState>>({
    pending: { currentPage: 1, totalPages: 1, totalRequests: 0, pageSize: 10 },
    completed: { currentPage: 1, totalPages: 1, totalRequests: 0, pageSize: 10 },
    rejected: { currentPage: 1, totalPages: 1, totalRequests: 0, pageSize: 10 },
  })
  const [selectedRequest, setSelectedRequest] = useState<WithdrawRequest | null>(null)
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null)
  const [formData, setFormData] = useState({
    transactionId: '',
    transactionPhoneNo: '',
    remarks: '',
  })
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'pending' | 'completed' | 'rejected'>('pending')
  const [copied, setCopied] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  const calculateActualAmount = (amount: string, fee: string) => {
    return (parseFloat(amount) - parseFloat(fee)).toFixed(2)
  }

  const fetchRequests = async (page = 1, pageSize = pagination[activeTab].pageSize) => {
    try {
      setLoading(true)
      setError(null)
      const response = await getAllWithdrawRequestForAdmin({
        status: activeTab,
        page,
        pageSize,
      })

      if (response.success && response.data) {
        setRequests(response.data.requests)
        setPagination(prev => ({
          ...prev,
          [activeTab]: {
            currentPage: response.data.currentPage,
            totalPages: response.data.totalPages,
            totalRequests: response.data.totalRequests,
            pageSize: response.data.pageSize,
          },
        }))
      } else {
        setError(response.message || 'উইথড্রো রিকোয়েস্ট লোড করতে ব্যর্থ হয়েছে')
      }
    } catch (err) {
      setError('উইথড্রো রিকোয়েস্ট আনতে সমস্যা হয়েছে')
      console.error('উইথড্রো রিকোয়েস্ট আনতে ত্রুটি:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleReload = () => {
    fetchRequests(pagination[activeTab].currentPage)
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
    fetchRequests(1, newPageSize)
  }

  useEffect(() => {
    fetchRequests()
  }, [activeTab])

  useEffect(() => {
    let filtered = requests

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        request =>
          request.userPhoneNo.toLowerCase().includes(term) ||
          request.walletPhoneNo.toLowerCase().includes(term) ||
          (request.transactionId && request.transactionId.toLowerCase().includes(term))
      )
    }

    setFilteredRequests(filtered)
  }, [requests, searchTerm])

  const handleActionClick = (request: WithdrawRequest, type: 'approve' | 'reject') => {
    setSelectedRequest(request)
    setActionType(type)
    setFormData({
      transactionId: '',
      transactionPhoneNo: '',
      remarks: '',
    })
  }

  const closeModal = () => {
    setSelectedRequest(null)
    setActionType(null)
    setError(null)
  }

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleApprove = async () => {
    if (!selectedRequest) return

    try {
      setProcessing(true)
      setError(null)

      if (!formData.transactionId) {
        setError('ট্রানজেকশন আইডি প্রয়োজন')
        return
      }

      const response = await approveWithdrawRequestForAdmin({
        id: selectedRequest.withdrawId,
        transactionId: formData.transactionId,
        transactionPhoneNo:
          formData.transactionPhoneNo.trim().length > 0 ? formData.transactionPhoneNo : undefined,
        remarks: formData.remarks,
      })

      if (response.success) {
        closeModal()
        await fetchRequests(pagination[activeTab].currentPage)
      } else {
        setError(response.message || 'রিকোয়েস্ট  অ্যাপ্রুভ করতে ব্যর্থ হয়েছে')
      }
    } catch (err) {
      setError('উইথড্রো রিকোয়েস্ট  অ্যাপ্রুভে ত্রুটি')
      console.error('উইথড্রো রিকোয়েস্ট  অ্যাপ্রুভে ত্রুটি:', err)
    } finally {
      setProcessing(false)
    }
  }

  const handleReject = async () => {
    if (!selectedRequest) return

    try {
      setProcessing(true)
      setError(null)
      const response = await rejectWithdrawRequestForAdmin({
        id: selectedRequest.withdrawId,
        remarks: formData.remarks,
      })

      if (response.success) {
        closeModal()
        await fetchRequests(pagination[activeTab].currentPage)
      } else {
        setError(response.message || 'রিকোয়েস্ট রিজেক্ট করতে ব্যর্থ হয়েছে')
      }
    } catch (err) {
      setError('উইথড্রো রিকোয়েস্ট রিজেক্টে ত্রুটি')
      console.error('উইথড্রো রিকোয়েস্ট রিজেক্টে ত্রুটি:', err)
    } finally {
      setProcessing(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const baseClasses = 'px-2 py-1 rounded-full text-xs font-medium'

    switch (status) {
      case 'completed':
        return <span className={`${baseClasses} bg-green-100 text-green-800`}>কমপ্লিটেড</span>
      case 'rejected':
        return <span className={`${baseClasses} bg-red-100 text-red-800`}>রিজেক্টেড</span>
      default:
        return <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>পেন্ডিং</span>
    }
  }

  const handleCopy = (_text: string, field: string) => {
    setCopied(field)
    setTimeout(() => setCopied(null), 2000)
  }

  const currentPagination = pagination[activeTab]

  return (
    <div className='px-4 py-6 max-w-6xl mx-auto'>
      <div className='flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-4'>
        <h1 className='text-xl font-bold md:text-2xl text-center md:text-left'>
          উইথড্রো রিকোয়েস্ট
        </h1>
        <div className='flex items-center justify-center gap-3'>
          <button
            onClick={handleReload}
            className='flex items-center text-sm bg-blue-50 text-blue-600 px-3 py-1 rounded hover:bg-blue-100'
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='h-4 w-4 mr-1'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15'
              />
            </svg>
            রিলোড
          </button>
        </div>
      </div>

      {/* সার্চ এবং ফিল্টার সেকশন */}
      <div className='mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3'>
        <div className='flex border-b'>
          <button
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === 'pending' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'
            }`}
            onClick={() => setActiveTab('pending')}
          >
            পেন্ডিং
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === 'completed'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500'
            }`}
            onClick={() => setActiveTab('completed')}
          >
            কমপ্লিটেড
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm ${
              activeTab === 'rejected'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500'
            }`}
            onClick={() => setActiveTab('rejected')}
          >
            রিজেক্টেড
          </button>
        </div>

        <div className='flex items-center gap-2'>
          <div className='relative'>
            <input
              type='text'
              placeholder='ফোন বা ট্রানজেকশন আইডি দিয়ে খুঁজুন'
              className='pl-8 pr-4 py-2 border rounded-md text-xs w-full md:w-64'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            <svg
              className='absolute left-2.5 top-2.5 h-4 w-4 text-gray-400'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
              xmlns='http://www.w3.org/2000/svg'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
              />
            </svg>
          </div>

          <select
            value={currentPagination.pageSize}
            onChange={handlePageSizeChange}
            className='border rounded-md px-2 py-2 text-sm'
          >
            <option value='5'>প্রতি পৃষ্ঠায় ৫টি</option>
            <option value='10'>প্রতি পৃষ্ঠায় ১০টি</option>
            <option value='20'>প্রতি পৃষ্ঠায় ২০টি</option>
            <option value='50'>প্রতি পৃষ্ঠায় ৫০টি</option>
          </select>
        </div>
      </div>

      {error && <div className='mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm'>{error}</div>}

      {loading ? (
        <div className='flex justify-center items-center h-64'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500'></div>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className='bg-white rounded-lg shadow p-6 text-center'>
          <p className='text-gray-500'>
            কোনো{' '}
            {activeTab === 'pending'
              ? 'পেন্ডিং'
              : activeTab === 'completed'
              ? 'কমপ্লিটেড'
              : 'রিজেক্টেড'}{' '}
            উইথড্রো রিকোয়েস্ট পাওয়া যায়নি
          </p>
        </div>
      ) : (
        <>
          {/* মোবাইল ভিউ - কার্ড */}
          <div className='md:hidden space-y-3'>
            {filteredRequests.map(request => (
              <div key={request.withdrawId} className='border rounded-lg p-3 bg-white'>
                <div className='flex justify-between items-start'>
                  <div>
                    <p className='text-xs text-gray-500'>{formatDate(request.requestedAt)}</p>
                    <h3 className='text-sm font-medium'>{request.userName}</h3>
                    <p className='text-xs text-gray-500'>{request.userPhoneNo}</p>
                  </div>
                  <div>{getStatusBadge(request.status)}</div>
                </div>

                <div className='mt-2'>
                  <div className='flex items-center'>
                    <p className='text-xs text-gray-500 mr-1'>ওয়ালেট:</p>
                    <p className='text-xs font-medium'>{request.walletName}</p>
                  </div>
                  <CopyToClipboard
                    text={request.walletPhoneNo}
                    onCopy={() => handleCopy(request.walletPhoneNo, 'wallet')}
                  >
                    <div className='flex items-center mt-1'>
                      <p className='text-xs text-gray-500 mr-1'>ফোন:</p>
                      <p className='text-xs font-medium'>{request.walletPhoneNo}</p>
                      <span className='ml-1 text-xs text-blue-500 cursor-pointer'>
                        {copied === 'wallet' ? 'কপি হয়েছে!' : 'কপি করুন'}
                      </span>
                    </div>
                  </CopyToClipboard>
                </div>

                <div className='mt-2 space-y-1'>
                  <div className='flex justify-between'>
                    <p className='text-xs text-gray-500'>পরিমাণ:</p>
                    <p className='text-xs font-medium'>{parseFloat(request.amount).toFixed(2)}৳</p>
                  </div>
                  <div className='flex justify-between'>
                    <p className='text-xs text-gray-500'>ফি:</p>
                    <p className='text-xs font-medium'>
                      {parseFloat(request.transactionFee).toFixed(2)}৳
                    </p>
                  </div>
                  <div className='flex justify-between'>
                    <p className='text-xs text-gray-500'>প্রাপ্ত অর্থ:</p>
                    <CopyToClipboard
                      text={calculateActualAmount(request.amount, request.transactionFee)}
                      onCopy={() =>
                        handleCopy(
                          calculateActualAmount(request.amount, request.transactionFee),
                          'actual'
                        )
                      }
                    >
                      <div className='flex items-center'>
                        <p className='text-xs font-medium'>
                          {calculateActualAmount(request.amount, request.transactionFee)}৳
                        </p>
                        <span className='ml-1 text-xs text-blue-500 cursor-pointer'>
                          {copied === 'actual' ? 'কপি হয়েছে!' : 'কপি করুন'}
                        </span>
                      </div>
                    </CopyToClipboard>
                  </div>
                </div>

                {request.status === 'pending' ? (
                  <div className='mt-3 grid grid-cols-2 gap-2'>
                    <button
                      onClick={() => handleActionClick(request, 'approve')}
                      className='w-full py-1 px-2 bg-green-50 text-green-600 rounded text-xs font-medium'
                    >
                      অ্যাপ্রুভ করুন
                    </button>
                    <button
                      onClick={() => handleActionClick(request, 'reject')}
                      className='w-full py-1 px-2 bg-red-50 text-red-600 rounded text-xs font-medium'
                    >
                      রিজেক্ট করুন
                    </button>
                  </div>
                ) : (
                  <div className='mt-2'>
                    <div className='text-xs text-gray-500'>
                      প্রক্রিয়াকরণ: {request.processedAt ? formatDate(request.processedAt) : 'N/A'}
                    </div>
                    {request.transactionId && (
                      <div className='mt-1 flex items-center'>
                        <p className='text-xs text-gray-500 mr-1'>ট্রানজেকশন আইডি:</p>
                        <p className='text-xs font-medium'>{request.transactionId}</p>
                      </div>
                    )}
                    {request.transactionPhoneNo && (
                      <div className='mt-1 flex items-center'>
                        <p className='text-xs text-gray-500 mr-1'>ট্রানজেকশন ফোন:</p>
                        <p className='text-xs font-medium'>{request.transactionPhoneNo}</p>
                      </div>
                    )}
                    {request.remarks && (
                      <div className='mt-1'>
                        <p className='text-xs text-gray-500'>মন্তব্য:</p>
                        <p className='text-xs font-medium'>{request.remarks}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* ডেস্কটপ ভিউ - টেবিল */}
          <div className='hidden md:block bg-white rounded-lg shadow overflow-hidden'>
            <table className='min-w-full divide-y divide-gray-200'>
              <thead className='bg-gray-50'>
                <tr>
                  <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    তারিখ
                  </th>
                  <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    ব্যবহারকারী
                  </th>
                  <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    ওয়ালেট
                  </th>
                  <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    পরিমাণ
                  </th>
                  <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    ফি
                  </th>
                  <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    প্রাপ্ত অর্থ
                  </th>
                  <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    স্ট্যাটাস
                  </th>
                  <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    প্রক্রিয়াকরণ
                  </th>
                  <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    অ্যাকশন
                  </th>
                </tr>
              </thead>
              <tbody className='bg-white divide-y divide-gray-200'>
                {filteredRequests.map(request => (
                  <tr key={request.withdrawId}>
                    <td className='px-4 py-4 whitespace-nowrap text-sm text-gray-500'>
                      {formatDate(request.requestedAt)}
                    </td>
                    <td className='px-4 py-4 whitespace-nowrap'>
                      <div className='text-sm font-medium text-gray-900'>{request.userName}</div>
                      <div className='text-sm text-gray-500'>{request.userPhoneNo}</div>
                    </td>
                    <td className='px-4 py-4 whitespace-nowrap'>
                      <div className='text-sm font-medium text-gray-900'>{request.walletName}</div>
                      <CopyToClipboard
                        text={request.walletPhoneNo}
                        onCopy={() => handleCopy(request.walletPhoneNo, 'wallet')}
                      >
                        <div className='flex items-center'>
                          <div className='text-sm text-gray-500'>{request.walletPhoneNo}</div>
                          <span className='ml-1 text-xs text-blue-500 cursor-pointer'>
                            {copied === 'wallet' ? 'কপি হয়েছে!' : 'কপি করুন'}
                          </span>
                        </div>
                      </CopyToClipboard>
                    </td>
                    <td className='px-4 py-4 whitespace-nowrap text-sm text-gray-900'>
                      {parseFloat(request.amount).toFixed(2)}৳
                    </td>
                    <td className='px-4 py-4 whitespace-nowrap text-sm text-gray-500'>
                      {parseFloat(request.transactionFee).toFixed(2)}৳
                    </td>
                    <td className='px-4 py-4 whitespace-nowrap text-sm text-gray-900 font-medium'>
                      <CopyToClipboard
                        text={calculateActualAmount(request.amount, request.transactionFee)}
                        onCopy={() =>
                          handleCopy(
                            calculateActualAmount(request.amount, request.transactionFee),
                            'actual'
                          )
                        }
                      >
                        <div className='flex items-center'>
                          {calculateActualAmount(request.amount, request.transactionFee)}৳
                          <span className='ml-1 text-xs text-blue-500 cursor-pointer'>
                            {copied === 'actual' ? 'কপি হয়েছে!' : 'কপি করুন'}
                          </span>
                        </div>
                      </CopyToClipboard>
                    </td>
                    <td className='px-4 py-4 whitespace-nowrap'>
                      {getStatusBadge(request.status)}
                    </td>
                    <td className='px-4 py-4 whitespace-nowrap text-sm text-gray-500'>
                      {request.processedAt ? formatDate(request.processedAt) : 'N/A'}
                    </td>
                    <td className='px-4 py-4 whitespace-nowrap text-sm font-medium'>
                      {request.status === 'pending' ? (
                        <div className='flex space-x-2'>
                          <button
                            onClick={() => handleActionClick(request, 'approve')}
                            className='text-green-600 hover:text-green-900'
                          >
                            অ্যাপ্রুভ করুন
                          </button>
                          <button
                            onClick={() => handleActionClick(request, 'reject')}
                            className='text-red-600 hover:text-red-900'
                          >
                            রিজেক্ট করুন
                          </button>
                        </div>
                      ) : (
                        <div className='space-y-1'>
                          {request.transactionId && (
                            <div className='text-xs'>
                              <span className='text-gray-500'>ট্রানজেকশন আইডি: </span>
                              {request.transactionId}
                            </div>
                          )}
                          {request.transactionPhoneNo && (
                            <div className='text-xs'>
                              <span className='text-gray-500'>ট্রানজেকশন ফোন: </span>
                              {request.transactionPhoneNo}
                            </div>
                          )}
                          {request.remarks && (
                            <div className='text-xs'>
                              <span className='text-gray-500'>মন্তব্য: </span>
                              {request.remarks}
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* পেজিনেশন */}
          {currentPagination.totalPages > 1 && (
            <div className='mt-4 flex flex-col sm:flex-row justify-between items-center gap-3'>
              <div className='text-sm text-gray-500'>
                দেখানো হচ্ছে {(currentPagination.currentPage - 1) * currentPagination.pageSize + 1}{' '}
                থেকে{' '}
                {Math.min(
                  currentPagination.currentPage * currentPagination.pageSize,
                  currentPagination.totalRequests
                )}{' '}
                এর মধ্যে {currentPagination.totalRequests} টি রিকোয়েস্ট
              </div>

              <div className='flex items-center gap-2'>
                <button
                  onClick={() => fetchRequests(currentPagination.currentPage - 1)}
                  disabled={currentPagination.currentPage === 1}
                  className='px-3 py-1 border rounded text-sm disabled:opacity-50'
                >
                  পূর্ববর্তী
                </button>
                <span className='text-sm'>
                  পৃষ্ঠা {currentPagination.currentPage} / {currentPagination.totalPages}
                </span>
                <button
                  onClick={() => fetchRequests(currentPagination.currentPage + 1)}
                  disabled={currentPagination.currentPage === currentPagination.totalPages}
                  className='px-3 py-1 border rounded text-sm disabled:opacity-50'
                >
                  পরবর্তী
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* অ্যাকশন মডাল */}
      {actionType && selectedRequest && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
          <div className='bg-white rounded-lg shadow-lg w-full max-w-md'>
            <div className='p-4 border-b'>
              <h2 className='text-lg font-medium'>
                {actionType === 'approve' ? 'উইথড্রো  অ্যাপ্রুভ করুন' : 'উইথড্রো রিজেক্ট করুন'}
              </h2>
            </div>

            <div className='p-4 space-y-4'>
              {error && (
                <div className='p-2 bg-red-100 text-red-700 rounded-md text-sm'>{error}</div>
              )}

              {actionType === 'approve' && (
                <>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      ট্রানজেকশন আইডি *
                    </label>
                    <input
                      type='text'
                      name='transactionId'
                      value={formData.transactionId}
                      onChange={handleFormChange}
                      className='w-full px-3 py-2 border rounded-md text-sm'
                      required
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      ট্রানজেকশন ফোন নম্বর (ঐচ্ছিক)
                    </label>
                    <input
                      type='text'
                      name='transactionPhoneNo'
                      value={formData.transactionPhoneNo}
                      onChange={handleFormChange}
                      className='w-full px-3 py-2 border rounded-md text-sm'
                    />
                  </div>
                </>
              )}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  মন্তব্য {actionType === 'approve' ? '(ঐচ্ছিক)' : ''}
                </label>
                <textarea
                  name='remarks'
                  value={formData.remarks}
                  onChange={handleFormChange}
                  className='w-full px-3 py-2 border rounded-md text-sm'
                  rows={3}
                />
              </div>
            </div>

            <div className='p-4 border-t flex justify-end space-x-2'>
              <button
                onClick={closeModal}
                className='px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200'
                disabled={processing}
              >
                বাতিল
              </button>
              <button
                onClick={actionType === 'approve' ? handleApprove : handleReject}
                className='px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50'
                disabled={processing}
              >
                {processing
                  ? 'প্রসেসিং...'
                  : actionType === 'approve'
                  ? ' অ্যাপ্রুভ করুন'
                  : 'রিজেক্ট করুন'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminWithdrawRequests
