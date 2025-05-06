import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { getAllTransactionHistoryForAdmin } from '../Api/admin.api'
import { formatDate } from '../utils/date.utils'

interface Transaction {
  id: number
  userId: string
  userName: string
  userPhoneNo: string
  type: 'Credit' | 'Debit'
  amount: string
  reason: string
  reference: string | null
  referralLevel: string | null
  remarks: string
  paymentMethod: string
  paymentPhoneNo: string | null
  transactionId: string | null
  createdAt: string
}

interface TransactionResponse {
  transactionList: Transaction[]
  totalTransactions: number
  currentPage: number
  pageSize: number
  totalPages: number
}

const AdminTransactionHistory = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 10,
    totalPages: 1,
    totalTransactions: 0,
  })
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [phoneNoFilter, setPhoneNoFilter] = useState('')

  const fetchTransactions = async (page: number = 1, pageSize: number = pagination.pageSize) => {
    setLoading(true)
    try {
      const response = await getAllTransactionHistoryForAdmin({
        phoneNo: phoneNoFilter || undefined,
        page,
        pageSize,
      })

      if (response.success && response.data) {
        const data = response.data as TransactionResponse
        setTransactions(data.transactionList)
        setFilteredTransactions(data.transactionList)
        setPagination({
          currentPage: data.currentPage,
          pageSize: data.pageSize,
          totalPages: data.totalPages,
          totalTransactions: data.totalTransactions,
        })
      } else {
        toast.error(response.message || 'লেনদেন লোড করতে ব্যর্থ হয়েছে')
      }
    } catch (error) {
      toast.error('লেনদেন আনতে সমস্যা হয়েছে')
      console.error('লেনদেন আনতে ত্রুটি:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      const filtered = transactions.filter(
        tx =>
          tx.transactionId?.toLowerCase().includes(term) ||
          tx.userId.toLowerCase().includes(term) ||
          tx.userName.toLowerCase().includes(term) ||
          tx.userPhoneNo.toLowerCase().includes(term) ||
          tx.paymentMethod?.toLowerCase().includes(term) ||
          tx.reason.toLowerCase().includes(term) ||
          (tx.paymentPhoneNo && tx.paymentPhoneNo.toLowerCase().includes(term)) ||
          tx.amount.toLowerCase().includes(term)
      )
      setFilteredTransactions(filtered)
    } else {
      setFilteredTransactions(transactions)
    }
  }, [searchTerm, transactions])

  useEffect(() => {
    fetchTransactions()
  }, [phoneNoFilter, pagination.pageSize])

  const getTypeBadge = (type: string) => {
    const baseClasses = 'px-2 py-1 rounded-full text-xs font-medium'

    return type === 'Credit' ? (
      <span className={`${baseClasses} bg-green-100 text-green-800`}>ক্রেডিট</span>
    ) : (
      <span className={`${baseClasses} bg-red-100 text-red-800`}>ডেবিট</span>
    )
  }

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }))
    fetchTransactions(newPage)
  }

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPageSize = parseInt(e.target.value)
    setPagination(prev => ({ ...prev, pageSize: newPageSize, currentPage: 1 }))
  }

  const showTransactionDetails = (transaction: Transaction) => {
    setSelectedTransaction(transaction)
  }

  const closeModal = () => {
    setSelectedTransaction(null)
  }

  const handlePhoneNoSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPagination(prev => ({ ...prev, currentPage: 1 }))
    fetchTransactions(1)
  }

  return (
    <div className='px-4 py-6 max-w-6xl mx-auto'>
      <h1 className='text-xl font-bold mb-4 md:text-2xl md:mb-6'>লেনদেনের ইতিহাস</h1>

      {/* সার্চ এবং ফিল্টার সেকশন */}
      <div className='bg-white rounded-lg shadow p-4 mb-6'>
        <form onSubmit={handlePhoneNoSearch} className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <div>
            <label htmlFor='phoneNo' className='block text-sm font-medium text-gray-700 mb-1'>
              ফোন নাম্বার দিয়ে ফিল্টার করুন
            </label>
            <div className='flex gap-2'>
              <input
                type='text'
                id='phoneNo'
                placeholder='ব্যবহারকারীর ফোন নাম্বার লিখুন'
                className='flex-1 px-3 py-2 border rounded-md text-sm'
                value={phoneNoFilter}
                onChange={e => setPhoneNoFilter(e.target.value)}
              />
            </div>
          </div>

          <div className='md:col-span-2'>
            <label htmlFor='search' className='block text-sm font-medium text-gray-700 mb-1'>
              ফলাফলের মধ্যে খুঁজুন
            </label>
            <div className='relative'>
              <input
                type='text'
                id='search'
                placeholder='আইডি, নাম, পরিমাণ, ইত্যাদি দিয়ে খুঁজুন'
                className='w-full pl-8 pr-3 py-2 border rounded-md text-sm'
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                disabled={loading}
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
          </div>

          <div className='flex items-end'>
            <button
              type='submit'
              className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium'
              disabled={loading}
            >
              {loading ? 'লোড হচ্ছে...' : 'ফিল্টার প্রয়োগ করুন'}
            </button>
          </div>
        </form>
      </div>

      {/* লেনদেনের ইতিহাস */}
      <div className='bg-white rounded-lg shadow overflow-hidden'>
        {/* পেজিনেশন কন্ট্রোল - উপরে */}
        <div className='p-4 border-b flex flex-col md:flex-row md:items-center md:justify-between gap-3'>
          <div className='text-sm text-gray-700'>
            {phoneNoFilter ? (
              <span>
                ফোন নাম্বার: <span className='font-medium'>{phoneNoFilter}</span>
                {filteredTransactions.length > 0 && (
                  <span> ({filteredTransactions.length} টি ফলাফল)</span>
                )}
              </span>
            ) : (
              <span>
                মোট লেনদেন: <span className='font-medium'>{pagination.totalTransactions}</span>
              </span>
            )}
          </div>

          <div className='flex items-center space-x-2'>
            <select
              value={pagination.pageSize}
              onChange={handlePageSizeChange}
              className='border rounded-md px-3 py-2 text-sm'
              disabled={loading}
            >
              <option value='5'>প্রতি পৃষ্ঠায় ৫টি</option>
              <option value='10'>প্রতি পৃষ্ঠায় ১০টি</option>
              <option value='20'>প্রতি পৃষ্ঠায় ২০টি</option>
              <option value='50'>প্রতি পৃষ্ঠায় ৫০টি</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className='flex justify-center items-center h-64'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500'></div>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className='p-6 text-center'>
            <p className='text-gray-500'>
              {searchTerm
                ? 'আপনার সার্চের সাথে মিলে এমন কোনো লেনদেন পাওয়া যায়নি'
                : phoneNoFilter
                ? 'এই ফোন নাম্বারে কোনো লেনদেন পাওয়া যায়নি'
                : 'কোনো লেনদেন পাওয়া যায়নি'}
            </p>
          </div>
        ) : (
          <>
            {/* মোবাইল ভিউ - কার্ড */}
            <div className='md:hidden space-y-3 p-3'>
              {filteredTransactions.map(tx => (
                <div
                  key={tx.id}
                  className='border rounded-lg p-3 text-sm cursor-pointer hover:bg-gray-50'
                  onClick={() => showTransactionDetails(tx)}
                >
                  <div className='flex justify-between items-start'>
                    <div>
                      <p className='text-gray-500 text-xs'>{formatDate(tx.createdAt)}</p>
                      <h3 className='font-medium'>{tx.reason}</h3>
                    </div>
                    <div>{getTypeBadge(tx.type)}</div>
                  </div>

                  <div className='mt-2 space-y-1'>
                    <div>
                      <p className='text-gray-500'>পরিমাণ:</p>
                      <p
                        className={`font-medium ${
                          tx.type === 'Credit' ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {tx.type === 'Credit' ? '+' : '-'}
                        {parseFloat(tx.amount).toFixed(2)}৳
                      </p>
                    </div>
                    <div>
                      <p className='text-gray-500'>ব্যবহারকারী:</p>
                      <p className='font-medium'>
                        {tx.userName} ({tx.userPhoneNo})
                      </p>
                    </div>
                    {tx.paymentMethod && (
                      <div>
                        <p className='text-gray-500'>পদ্ধতি:</p>
                        <p className='font-medium'>{tx.paymentMethod}</p>
                      </div>
                    )}
                    {tx.transactionId && (
                      <div>
                        <p className='text-gray-500'>লেনদেন আইডি:</p>
                        <p className='font-medium'>{tx.transactionId}</p>
                      </div>
                    )}
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
                      ব্যবহারকারী
                    </th>
                    <th className='px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider'>
                      ধরণ
                    </th>
                    <th className='px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider'>
                      পরিমাণ
                    </th>
                    <th className='px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider'>
                      কারণ
                    </th>
                    <th className='px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider'>
                      পদ্ধতি
                    </th>
                    <th className='px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider'>
                      লেনদেন আইডি
                    </th>
                    <th className='px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider'>
                      বিস্তারিত
                    </th>
                  </tr>
                </thead>
                <tbody className='bg-white divide-y divide-gray-200'>
                  {filteredTransactions.map(tx => (
                    <tr key={tx.id} className='hover:bg-gray-50'>
                      <td className='px-4 py-4 whitespace-nowrap text-gray-500'>
                        {formatDate(tx.createdAt)}
                      </td>
                      <td className='px-4 py-4 whitespace-nowrap'>
                        <div className='text-gray-900'>{tx.userName}</div>
                        <div className='text-gray-500 text-xs'>{tx.userPhoneNo}</div>
                      </td>
                      <td className='px-4 py-4 whitespace-nowrap'>{getTypeBadge(tx.type)}</td>
                      <td
                        className={`px-4 py-4 whitespace-nowrap font-medium ${
                          tx.type === 'Credit' ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {tx.type === 'Credit' ? '+' : '-'}
                        {parseFloat(tx.amount).toFixed(2)}৳
                      </td>
                      <td className='px-4 py-4 whitespace-nowrap text-gray-900'>{tx.reason}</td>
                      <td className='px-4 py-4 whitespace-nowrap text-gray-500'>
                        {tx.paymentMethod || 'N/A'}
                      </td>
                      <td className='px-4 py-4 whitespace-nowrap text-gray-500 font-mono text-xs'>
                        {tx.transactionId || 'N/A'}
                      </td>
                      <td className='px-4 py-4 whitespace-nowrap'>
                        <button
                          onClick={() => showTransactionDetails(tx)}
                          className='text-blue-600 hover:text-blue-800 text-sm font-medium'
                        >
                          দেখুন
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* পেজিনেশন */}
            {pagination.totalPages > 1 && (
              <div className='bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-200'>
                <div className='flex-1 flex justify-between sm:hidden'>
                  <button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 1 || loading}
                    className='relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50'
                  >
                    পূর্ববর্তী
                  </button>
                  <button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={pagination.currentPage === pagination.totalPages || loading}
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
                        {(pagination.currentPage - 1) * pagination.pageSize + 1}
                      </span>{' '}
                      থেকে{' '}
                      <span className='font-medium'>
                        {Math.min(
                          pagination.currentPage * pagination.pageSize,
                          pagination.totalTransactions
                        )}
                      </span>{' '}
                      এর মধ্যে <span className='font-medium'>{pagination.totalTransactions}</span>{' '}
                      টি লেনদেন
                    </p>
                  </div>
                  <div>
                    <nav className='relative z-0 inline-flex rounded-md shadow-sm -space-x-px'>
                      <button
                        onClick={() => handlePageChange(pagination.currentPage - 1)}
                        disabled={pagination.currentPage === 1 || loading}
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
                            disabled={loading}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              pageNum === pagination.currentPage
                                ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                            } ${loading ? 'opacity-50' : ''}`}
                          >
                            {pageNum}
                          </button>
                        )
                      })}
                      <button
                        onClick={() => handlePageChange(pagination.currentPage + 1)}
                        disabled={pagination.currentPage === pagination.totalPages || loading}
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
      </div>

      {/* লেনদেনের বিস্তারিত মডাল */}
      {selectedTransaction && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
          <div className='bg-white rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto'>
            <div className='p-4 border-b sticky top-0 bg-white z-10'>
              <h2 className='text-lg font-medium'>লেনদেনের বিস্তারিত</h2>
            </div>

            <div className='p-4 space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <p className='text-sm font-medium text-gray-700'>ধরণ:</p>
                  <div className='mt-1'>{getTypeBadge(selectedTransaction.type)}</div>
                </div>
                <div>
                  <p className='text-sm font-medium text-gray-700'>তারিখ:</p>
                  <p className='mt-1 text-gray-900'>{formatDate(selectedTransaction.createdAt)}</p>
                </div>
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <p className='text-sm font-medium text-gray-700'>পরিমাণ:</p>
                  <p
                    className={`mt-1 font-medium ${
                      selectedTransaction.type === 'Credit' ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {selectedTransaction.type === 'Credit' ? '+' : '-'}
                    {parseFloat(selectedTransaction.amount).toFixed(2)}৳
                  </p>
                </div>
                <div>
                  <p className='text-sm font-medium text-gray-700'>কারণ:</p>
                  <p className='mt-1 text-gray-900'>{selectedTransaction.reason}</p>
                </div>
              </div>

              <div>
                <p className='text-sm font-medium text-gray-700'>ব্যবহারকারী:</p>
                <p className='mt-1 text-gray-900'>
                  {selectedTransaction.userName} ({selectedTransaction.userPhoneNo})
                </p>
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <p className='text-sm font-medium text-gray-700'>পেমেন্ট পদ্ধতি:</p>
                  <p className='mt-1 text-gray-900'>{selectedTransaction.paymentMethod || 'N/A'}</p>
                </div>
                <div>
                  <p className='text-sm font-medium text-gray-700'>পেমেন্ট ফোন:</p>
                  <p className='mt-1 text-gray-900'>
                    {selectedTransaction.paymentPhoneNo || 'N/A'}
                  </p>
                </div>
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div>
                  <p className='text-sm font-medium text-gray-700'>লেনদেন আইডি:</p>
                  <p className='mt-1 text-gray-900 font-mono text-sm'>
                    {selectedTransaction.transactionId || 'N/A'}
                  </p>
                </div>
                <div></div>
              </div>

              {selectedTransaction.reference && (
                <div>
                  <p className='text-sm font-medium text-gray-700'>রেফারেন্স:</p>
                  <p className='mt-1 text-gray-900'>{selectedTransaction.reference}</p>
                  <p className='text-sm font-medium text-gray-700'>রেফারেল লেভেল:</p>
                  <p className='mt-1 text-gray-900'>{selectedTransaction.referralLevel || 'N/A'}</p>
                </div>
              )}

              {selectedTransaction.remarks && (
                <div>
                  <p className='text-sm font-medium text-gray-700'>মন্তব্য:</p>
                  <p className='mt-1 text-gray-900 whitespace-pre-line'>
                    {selectedTransaction.remarks}
                  </p>
                </div>
              )}
            </div>

            <div className='p-4 border-t sticky bottom-0 bg-white flex justify-end'>
              <button
                onClick={closeModal}
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

export default AdminTransactionHistory
