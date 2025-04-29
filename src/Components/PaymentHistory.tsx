import { useEffect, useState } from 'react'
import 'react-datepicker/dist/react-datepicker.css'
import { toast } from 'react-toastify'
import { getPaymentHistory } from '../Api/seller.api'
import { formatDate } from '../utils/date.utils'

interface Payment {
  paymentId: number
  paymentDate: string
  processedAt: string | null
  orderId: number | null
  withdrawId: string | null
  paymentStatus: 'pending' | 'verified' | 'rejected'
  paymentType: 'DuePayment' | 'OrderPayment' | 'WithdrawPayment'
  sender: 'Seller' | 'Admin'
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
}

interface PaginationState {
  currentPage: number
  totalPages: number
  totalPayments: number
  pageSize: number
}

interface SearchFilters {
  phoneNo: string
  transactionId: string
  walletType: '' | 'bKash' | 'Nagad'
  paymentType: '' | 'DuePayment' | 'OrderPayment' | 'WithdrawPayment'
  startDate: Date | null
  endDate: Date | null
}

const PaymentHistory = () => {
  const [allPayments, setAllPayments] = useState<Payment[]>([])
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState<Record<string, PaginationState>>({
    all: { currentPage: 1, totalPages: 1, totalPayments: 0, pageSize: 10 },
    pending: { currentPage: 1, totalPages: 1, totalPayments: 0, pageSize: 10 },
    verified: { currentPage: 1, totalPages: 1, totalPayments: 0, pageSize: 10 },
    rejected: { currentPage: 1, totalPages: 1, totalPayments: 0, pageSize: 10 },
  })
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'verified' | 'rejected'>('all')
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    phoneNo: '',
    transactionId: '',
    walletType: '',
    paymentType: '',
    startDate: null,
    endDate: null,
  })
  const [showFilters, setShowFilters] = useState(false)

  const fetchPaymentHistory = async (page = 1, pageSize = pagination[activeTab].pageSize) => {
    try {
      setLoading(true)
      const response = await getPaymentHistory({
        status: activeTab === 'all' ? undefined : activeTab,
        page,
        pageSize,
      })

      if (response.success && response.data) {
        setAllPayments(response.data.payments)
        setFilteredPayments(response.data.payments)
        setPagination(prev => ({
          ...prev,
          [activeTab]: {
            currentPage: response.data.currentPage,
            totalPages: response.data.totalPages,
            totalPayments: response.data.totalPayments,
            pageSize: response.data.pageSize,
          },
        }))
      } else {
        toast.error(response.message || 'Failed to load payment history')
      }
    } catch (error) {
      toast.error('An error occurred while fetching payment history')
      console.error('Error fetching payment history:', error)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...allPayments]

    if (searchFilters.phoneNo) {
      filtered = filtered.filter(
        payment =>
          payment.sellerWalletPhoneNo.includes(searchFilters.phoneNo) ||
          payment.adminWalletPhoneNo.includes(searchFilters.phoneNo)
      )
    }

    if (searchFilters.transactionId) {
      filtered = filtered.filter(payment =>
        payment.transactionId?.includes(searchFilters.transactionId)
      )
    }

    if (searchFilters.walletType) {
      filtered = filtered.filter(
        payment =>
          payment.sellerWalletName === searchFilters.walletType ||
          payment.adminWalletName === searchFilters.walletType
      )
    }

    if (searchFilters.paymentType) {
      filtered = filtered.filter(payment => payment.paymentType === searchFilters.paymentType)
    }

    if (searchFilters.startDate) {
      filtered = filtered.filter(
        payment => new Date(payment.paymentDate) >= searchFilters.startDate!
      )
    }

    if (searchFilters.endDate) {
      filtered = filtered.filter(payment => new Date(payment.paymentDate) <= searchFilters.endDate!)
    }

    setFilteredPayments(filtered)
  }

  const resetFilters = () => {
    setSearchFilters({
      phoneNo: '',
      transactionId: '',
      walletType: '',
      paymentType: '',
      startDate: null,
      endDate: null,
    })
    setFilteredPayments(allPayments)
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
    fetchPaymentHistory(1, newPageSize)
  }

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setSearchFilters(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('কপি করা হয়েছে')
  }

  useEffect(() => {
    fetchPaymentHistory()
  }, [activeTab, pagination[activeTab].pageSize])

  useEffect(() => {
    applyFilters()
  }, [searchFilters, allPayments])

  const getStatusBadge = (status: string) => {
    const baseClasses = 'px-2 py-1 rounded-full text-xs font-medium'

    switch (status) {
      case 'verified':
        return <span className={`${baseClasses} bg-green-100 text-green-800`}> কমপ্লিটেড</span>
      case 'rejected':
        return <span className={`${baseClasses} bg-red-100 text-red-800`}> রিজেক্টেড</span>
      default:
        return <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>পেন্ডিং</span>
    }
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

  const showDetailsModal = (payment: Payment) => {
    setSelectedPayment(payment)
  }

  const closeDetailsModal = () => {
    setSelectedPayment(null)
  }

  const currentPagination = pagination[activeTab]

  return (
    <div className='px-4 py-6 max-w-6xl mx-auto'>
      <h1 className='text-xl font-bold mb-4 md:text-2xl md:mb-6'>পেমেন্টের ইতিহাস</h1>

      {/* ফিল্টার এবং সার্চ সেকশন */}
      <div className='mb-4 flex flex-col gap-4'>
        <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-3'>
          <div className='flex border-b'>
            <button
              className={`px-3 py-2 text-xs md:text-sm ${
                activeTab === 'all' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'
              }`}
              onClick={() => setActiveTab('all')}
            >
              সব
            </button>
            <button
              className={`px-3 py-2 text-xs md:text-sm ${
                activeTab === 'pending'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500'
              }`}
              onClick={() => setActiveTab('pending')}
            >
              পেন্ডিং
            </button>
            <button
              className={`px-3 py-2 text-xs md:text-sm ${
                activeTab === 'verified'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500'
              }`}
              onClick={() => setActiveTab('verified')}
            >
              কমপ্লিটেড
            </button>
            <button
              className={`px-3 py-2 text-xs md:text-sm ${
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
            <button
              onClick={() => setShowFilters(!showFilters)}
              className='px-3 py-1.5 border rounded-md text-xs md:text-sm bg-gray-100 hover:bg-gray-200'
            >
              {showFilters ? 'ফিল্টার লুকান' : 'ফিল্টার দেখুন'}
            </button>

            <select
              value={currentPagination.pageSize}
              onChange={handlePageSizeChange}
              className='border rounded-md px-2 py-1.5 text-xs md:text-sm'
            >
              <option value='5'>প্রতি পৃষ্ঠায় ৫টি</option>
              <option value='10'>প্রতি পৃষ্ঠায় ১০টি</option>
              <option value='20'>প্রতি পৃষ্ঠায় ২০টি</option>
              <option value='50'>প্রতি পৃষ্ঠায় ৫০টি</option>
            </select>
          </div>
        </div>

        {showFilters && (
          <div className='bg-white p-4 rounded-lg shadow border'>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>ফোন নম্বর</label>
                <input
                  type='text'
                  name='phoneNo'
                  value={searchFilters.phoneNo}
                  onChange={handleFilterChange}
                  placeholder='ফোন নম্বর দিয়ে খুঁজুন'
                  className='w-full px-3 py-1.5 border rounded-md text-sm'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>লেনদেন আইডি</label>
                <input
                  type='text'
                  name='transactionId'
                  value={searchFilters.transactionId}
                  onChange={handleFilterChange}
                  placeholder='লেনদেন আইডি দিয়ে খুঁজুন'
                  className='w-full px-3 py-1.5 border rounded-md text-sm'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>ওয়ালেট ধরণ</label>
                <select
                  name='walletType'
                  value={searchFilters.walletType}
                  onChange={handleFilterChange}
                  className='w-full px-3 py-1.5 border rounded-md text-sm'
                >
                  <option value=''>সব ধরণ</option>
                  <option value='bKash'>bKash</option>
                  <option value='Nagad'>Nagad</option>
                </select>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>পেমেন্ট ধরণ</label>
                <select
                  name='paymentType'
                  value={searchFilters.paymentType}
                  onChange={handleFilterChange}
                  className='w-full px-3 py-1.5 border rounded-md text-sm'
                >
                  <option value=''>সব ধরণ</option>
                  <option value='DuePayment'>বকেয়া পেমেন্ট</option>
                  <option value='OrderPayment'>অর্ডার পেমেন্ট</option>
                  <option value='WithdrawPayment'>উত্তোলন পেমেন্ট</option>
                </select>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>শুরুর তারিখ</label>
                <input
                  type='date'
                  name='startDate'
                  value={searchFilters.startDate?.toISOString().split('T')[0] || ''}
                  onChange={e =>
                    setSearchFilters({
                      ...searchFilters,
                      startDate: e.target.value ? new Date(e.target.value) : null,
                    })
                  }
                  className='w-full px-3 py-1.5 border rounded-md text-sm'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>শেষ তারিখ</label>
                <input
                  type='date'
                  name='endDate'
                  value={searchFilters.endDate?.toISOString().split('T')[0] || ''}
                  onChange={e =>
                    setSearchFilters({
                      ...searchFilters,
                      endDate: e.target.value ? new Date(e.target.value) : null,
                    })
                  }
                  className='w-full px-3 py-1.5 border rounded-md text-sm'
                />
              </div>
            </div>

            <div className='flex justify-end gap-2 mt-4'>
              <button
                onClick={resetFilters}
                className='px-4 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200'
              >
                রিসেট
              </button>
              <button
                onClick={applyFilters}
                className='px-4 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700'
              >
                ফিল্টার প্রয়োগ করুন
              </button>
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className='flex justify-center items-center h-64'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500'></div>
        </div>
      ) : filteredPayments.length === 0 ? (
        <div className='bg-white rounded-lg shadow p-6 text-center'>
          <p className='text-gray-500'>
            কোন{' '}
            {activeTab === 'all'
              ? 'পেমেন্ট'
              : activeTab === 'pending'
              ? 'পেন্ডিং'
              : activeTab === 'verified'
              ? ' কমপ্লিটেড'
              : ' রিজেক্টেড'}{' '}
            পেমেন্ট পাওয়া যায়নি
          </p>
        </div>
      ) : (
        <div className='bg-white rounded-lg shadow overflow-hidden'>
          {/* মোবাইল ভিউ - কার্ড */}
          <div className='md:hidden space-y-3 p-3'>
            {filteredPayments.map(payment => (
              <div key={payment.paymentId} className='border rounded-lg p-3 text-xs'>
                <div className='flex justify-between items-start'>
                  <div>
                    <p className='text-gray-500'>{formatDate(payment.paymentDate)}</p>
                    <h3 className='font-medium'>{getPaymentTypeText(payment.paymentType)}</h3>
                  </div>
                  <div>{getStatusBadge(payment.paymentStatus)}</div>
                </div>

                <div className='mt-2 space-y-1'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='text-gray-500'>পরিমাণ:</p>
                      <p className='font-medium'>{parseFloat(payment.amount).toFixed(2)}৳</p>
                    </div>
                    {payment.paymentType === 'WithdrawPayment' && payment.transactionFee && (
                      <div>
                        <p className='text-gray-500'>ফি:</p>
                        <p className='font-medium'>
                          {parseFloat(payment.transactionFee).toFixed(2)}৳
                        </p>
                      </div>
                    )}
                  </div>

                  <div>
                    <p className='text-gray-500'>প্রাপ্ত অর্থ:</p>
                    <p className='font-medium'>{parseFloat(payment.actualAmount).toFixed(2)}৳</p>
                  </div>

                  <div className='flex items-center gap-1'>
                    <p className='text-gray-500'>লেনদেন আইডি:</p>
                    {payment.transactionId ? (
                      <button
                        onClick={() => copyToClipboard(payment.transactionId!)}
                        className='font-medium text-blue-600 flex items-center gap-1'
                      >
                        {payment.transactionId}
                        <svg
                          xmlns='http://www.w3.org/2000/svg'
                          className='h-3 w-3'
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

                  <div className='flex items-center gap-2 mt-2'>
                    <div className='flex-1'>
                      <p className='text-gray-500 text-xs'>প্রেরক:</p>
                      <p className='text-xs'>
                        {payment.sender === 'Seller' ? (
                          <>
                            {payment.sellerWalletName} - {payment.sellerWalletPhoneNo}
                          </>
                        ) : (
                          <>
                            {payment.adminWalletName} - {payment.adminWalletPhoneNo}
                          </>
                        )}
                      </p>
                    </div>
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      className='h-4 w-4 text-gray-400'
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
                    <div className='flex-1'>
                      <p className='text-gray-500 text-xs'>প্রাপক:</p>
                      <p className='text-xs'>
                        {payment.sender === 'Seller' ? (
                          <>
                            {payment.adminWalletName} - {payment.adminWalletPhoneNo}
                          </>
                        ) : (
                          <>
                            {payment.sellerWalletName} - {payment.sellerWalletPhoneNo}
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                <div className='mt-3'>
                  <button
                    onClick={() => showDetailsModal(payment)}
                    className='w-full py-1 px-2 border border-gray-300 rounded text-gray-700 font-medium'
                  >
                    বিস্তারিত দেখুন
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* ডেস্কটপ ভিউ - টেবিল */}
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
                    পরিমাণ
                  </th>
                  {activeTab === 'all' || activeTab === 'verified' ? (
                    <th className='px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider'>
                      ফি
                    </th>
                  ) : null}
                  <th className='px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider'>
                    প্রাপ্ত অর্থ
                  </th>
                  <th className='px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider'>
                    লেনদেন আইডি
                  </th>
                  <th className='px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider'>
                    প্রেরক → প্রাপক
                  </th>
                  <th className='px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider'>
                    স্ট্যাটাস
                  </th>
                  <th className='px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider'>
                    অ্যাকশন
                  </th>
                </tr>
              </thead>
              <tbody className='bg-white divide-y divide-gray-200'>
                {filteredPayments.map(payment => (
                  <tr key={payment.paymentId}>
                    <td className='px-4 py-4 whitespace-nowrap text-gray-500'>
                      {formatDate(payment.paymentDate)}
                    </td>
                    <td className='px-4 py-4 whitespace-nowrap'>
                      <div className='font-medium text-gray-900'>
                        {getPaymentTypeText(payment.paymentType)}
                      </div>
                    </td>
                    <td className='px-4 py-4 whitespace-nowrap text-gray-900'>
                      {parseFloat(payment.amount).toFixed(2)}৳
                    </td>
                    {activeTab === 'all' || activeTab === 'verified' ? (
                      <td className='px-4 py-4 whitespace-nowrap text-gray-500'>
                        {payment.paymentType === 'WithdrawPayment' && payment.transactionFee
                          ? `${parseFloat(payment.transactionFee).toFixed(2)}৳`
                          : 'N/A'}
                      </td>
                    ) : null}
                    <td className='px-4 py-4 whitespace-nowrap text-gray-900 font-medium'>
                      {parseFloat(payment.actualAmount).toFixed(2)}৳
                    </td>
                    <td className='px-4 py-4 whitespace-nowrap text-gray-500'>
                      {payment.transactionId ? (
                        <button
                          onClick={() => copyToClipboard(payment.transactionId!)}
                          className='flex items-center gap-1 text-blue-600 hover:text-blue-800'
                        >
                          {payment.transactionId}
                          <svg
                            xmlns='http://www.w3.org/2000/svg'
                            className='h-4 w-4'
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
                    <td className='px-4 py-4 whitespace-nowrap'>
                      <div className='flex items-center gap-2'>
                        <div className='text-right'>
                          <p className='text-xs font-medium'>
                            {payment.sender === 'Seller'
                              ? payment.sellerWalletName
                              : payment.adminWalletName}
                          </p>
                          <p className='text-xs text-gray-500'>
                            {payment.sender === 'Seller'
                              ? payment.sellerWalletPhoneNo
                              : payment.adminWalletPhoneNo}
                          </p>
                        </div>
                        <svg
                          xmlns='http://www.w3.org/2000/svg'
                          className='h-4 w-4 text-gray-400'
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
                        <div className='text-left'>
                          <p className='text-xs font-medium'>
                            {payment.sender === 'Seller'
                              ? payment.adminWalletName
                              : payment.sellerWalletName}
                          </p>
                          <p className='text-xs text-gray-500'>
                            {payment.sender === 'Seller'
                              ? payment.adminWalletPhoneNo
                              : payment.sellerWalletPhoneNo}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className='px-4 py-4 whitespace-nowrap'>
                      {getStatusBadge(payment.paymentStatus)}
                    </td>
                    <td className='px-4 py-4 whitespace-nowrap font-medium'>
                      <button
                        onClick={() => showDetailsModal(payment)}
                        className='text-blue-600 hover:text-blue-800'
                      >
                        বিস্তারিত
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* পেজিনেশন */}
          {currentPagination.totalPages > 1 && (
            <div className='bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-200'>
              <div className='flex-1 flex justify-between sm:hidden'>
                <button
                  onClick={() => fetchPaymentHistory(currentPagination.currentPage - 1)}
                  disabled={currentPagination.currentPage === 1}
                  className='relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50'
                >
                  পূর্ববর্তী
                </button>
                <button
                  onClick={() => fetchPaymentHistory(currentPagination.currentPage + 1)}
                  disabled={currentPagination.currentPage === currentPagination.totalPages}
                  className='ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50'
                >
                  পরবর্তী
                </button>
              </div>

              <div className='hidden sm:flex-1 sm:flex sm:items-center sm:justify-between'>
                <div>
                  <p className='text-sm text-gray-700'>
                    দেখানো হচ্ছে{' '}
                    <span className='font-medium'>
                      {(currentPagination.currentPage - 1) * currentPagination.pageSize + 1}
                    </span>{' '}
                    থেকে{' '}
                    <span className='font-medium'>
                      {Math.min(
                        currentPagination.currentPage * currentPagination.pageSize,
                        currentPagination.totalPayments
                      )}
                    </span>{' '}
                    এর মধ্যে <span className='font-medium'>{currentPagination.totalPayments}</span>{' '}
                    টি পেমেন্ট
                  </p>
                </div>
                <div>
                  <nav className='relative z-0 inline-flex rounded-md shadow-sm -space-x-px'>
                    <button
                      onClick={() => fetchPaymentHistory(currentPagination.currentPage - 1)}
                      disabled={currentPagination.currentPage === 1}
                      className='relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50'
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
                          onClick={() => fetchPaymentHistory(pageNum)}
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
                      onClick={() => fetchPaymentHistory(currentPagination.currentPage + 1)}
                      disabled={currentPagination.currentPage === currentPagination.totalPages}
                      className='relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50'
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

      {/* বিস্তারিত মোডাল */}
      {selectedPayment && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
          <div className='bg-white rounded-lg shadow-lg w-full max-w-md'>
            <div className='p-4 border-b'>
              <h2 className='text-lg font-medium'>পেমেন্টের বিস্তারিত</h2>
            </div>

            <div className='p-4 space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <p className='text-sm font-medium text-gray-700'>স্ট্যাটাস:</p>
                  <div className='mt-1'>{getStatusBadge(selectedPayment.paymentStatus)}</div>
                </div>
                <div>
                  <p className='text-sm font-medium text-gray-700'>পেমেন্ট ধরণ:</p>
                  <p className='mt-1 text-gray-900'>
                    {getPaymentTypeText(selectedPayment.paymentType)}
                  </p>
                </div>
              </div>

              <div className='grid grid-cols-3 gap-2'>
                <div>
                  <p className='text-sm font-medium text-gray-700'>পরিমাণ:</p>
                  <p className='mt-1 text-gray-900'>
                    {parseFloat(selectedPayment.amount).toFixed(2)}৳
                  </p>
                </div>
                {selectedPayment.paymentType === 'WithdrawPayment' && (
                  <div>
                    <p className='text-sm font-medium text-gray-700'>ফি:</p>
                    <p className='mt-1 text-gray-900'>
                      {selectedPayment.transactionFee
                        ? `${parseFloat(selectedPayment.transactionFee).toFixed(2)}৳`
                        : 'N/A'}
                    </p>
                  </div>
                )}
                <div>
                  <p className='text-sm font-medium text-gray-700'>প্রাপ্ত অর্থ:</p>
                  <p className='mt-1 text-gray-900 font-medium'>
                    {parseFloat(selectedPayment.actualAmount).toFixed(2)}৳
                  </p>
                </div>
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <p className='text-sm font-medium text-gray-700'>অনুরোধের তারিখ:</p>
                  <p className='mt-1 text-gray-900'>{formatDate(selectedPayment.paymentDate)}</p>
                </div>
                <div>
                  <p className='text-sm font-medium text-gray-700'>প্রক্রিয়াকরণের তারিখ:</p>
                  <p className='mt-1 text-gray-900'>
                    {selectedPayment.processedAt ? formatDate(selectedPayment.processedAt) : 'N/A'}
                  </p>
                </div>
              </div>

              <div>
                <p className='text-sm font-medium text-gray-700'>প্রেরক:</p>
                <p className='mt-1 text-gray-900'>
                  {selectedPayment.sender === 'Seller' ? (
                    <>
                      বিক্রেতা: {selectedPayment.sellerWalletName} -{' '}
                      {selectedPayment.sellerWalletPhoneNo}
                    </>
                  ) : (
                    <>
                      অ্যাডমিন: {selectedPayment.adminWalletName} -{' '}
                      {selectedPayment.adminWalletPhoneNo}
                    </>
                  )}
                </p>
              </div>

              <div>
                <p className='text-sm font-medium text-gray-700'>প্রাপক:</p>
                <p className='mt-1 text-gray-900'>
                  {selectedPayment.sender === 'Seller' ? (
                    <>
                      অ্যাডমিন: {selectedPayment.adminWalletName} -{' '}
                      {selectedPayment.adminWalletPhoneNo}
                    </>
                  ) : (
                    <>
                      বিক্রেতা: {selectedPayment.sellerWalletName} -{' '}
                      {selectedPayment.sellerWalletPhoneNo}
                    </>
                  )}
                </p>
              </div>

              <div>
                <p className='text-sm font-medium text-gray-700'>লেনদেন আইডি:</p>
                <div className='mt-1 flex items-center gap-2'>
                  {selectedPayment.transactionId ? (
                    <>
                      <p className='text-gray-900'>{selectedPayment.transactionId}</p>
                      <button
                        onClick={() => copyToClipboard(selectedPayment.transactionId!)}
                        className='text-blue-600 hover:text-blue-800'
                      >
                        <svg
                          xmlns='http://www.w3.org/2000/svg'
                          className='h-4 w-4'
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
                    </>
                  ) : (
                    <p className='text-gray-500'>N/A</p>
                  )}
                </div>
              </div>

              {selectedPayment.remarks && (
                <div>
                  <p className='text-sm font-medium text-gray-700'>মন্তব্য:</p>
                  <p className='mt-1 text-gray-900 whitespace-pre-line'>
                    {selectedPayment.remarks}
                  </p>
                </div>
              )}
            </div>

            <div className='p-4 border-t flex justify-end'>
              <button
                onClick={closeDetailsModal}
                className='px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200'
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

export default PaymentHistory
