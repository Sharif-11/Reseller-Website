import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { FaChevronLeft, FaChevronRight, FaSearch, FaWallet } from 'react-icons/fa'
import { toast } from 'react-toastify'
import { transactionApi } from '../Api/transaction.api'
import { useAuth } from '../Hooks/useAuth'
import { formatDate } from '../utils/date.utils'

interface TransactionBase {
  id: string
  createdAt: string
  userId: string
  userName: string
  userPhoneNo: string
  reason: string
  reference?: any | null
  totalCredit: number
  totalDebit: number
  balance: number
}
interface BackendTransaction extends TransactionBase {
  amount: string
}
interface Transaction extends TransactionBase {
  amount: number
}
interface TransactionResponse {
  transactions: BackendTransaction[]
  totalCount: number
  currentPage: number
  pageSize: number
}
interface Account {
  balance: number
  totalCredit: number
  totalDebit: number
  totalTransactions: number
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

const BalanceStatement = () => {
  const { reloadUser } = useAuth()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [account, setAccount] = useState<Account>({
    balance: 0,
    totalCredit: 0,
    totalDebit: 0,
    totalTransactions: 0,
  })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 10,
    totalCount: 0,
  })
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)

  const fetchTransactions = async (
    page: number = pagination.currentPage,
    pageSize: number = pagination.pageSize
  ) => {
    setLoading(true)
    try {
      const response = await transactionApi.getTransactions({
        page,
        limit: pageSize,
        search: searchTerm,
      })

      if (response.success && response.data) {
        const data = response.data as TransactionResponse
        setAccount({
          balance: response.data.balance,
          totalCredit: response.data.totalCredit,
          totalDebit: response.data.totalDebit,
          totalTransactions: response.data.totalCount,
        })
        const formattedTransactions: Transaction[] = data.transactions.map(tx => ({
          ...tx,
          amount: parseFloat(tx.amount),
        }))
        setTransactions(formattedTransactions)
        setFilteredTransactions(formattedTransactions)
        setPagination({
          currentPage: data.currentPage,
          pageSize: data.pageSize,
          totalCount: data.totalCount,
        })
      } else {
        toast.error(response.message || 'লেনদেন লোড করতে ব্যর্থ হয়েছে')
      }
    } catch (error) {
      toast.error('লেনদেন লোড করতে সমস্যা হয়েছে')
      console.error('Transactions fetch error:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (searchTerm) {
      const filtered = transactions.filter(
        tx =>
          tx.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          tx.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
          tx.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          tx.userPhoneNo.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredTransactions(filtered)
    } else {
      setFilteredTransactions(transactions)
    }
  }, [searchTerm, transactions])

  useEffect(() => {
    reloadUser()
    fetchTransactions()
  }, [])

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }))
    fetchTransactions(newPage)
  }

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPageSize = parseInt(e.target.value)
    setPagination(prev => ({ ...prev, pageSize: newPageSize, currentPage: 1 }))
    fetchTransactions(1, newPageSize)
  }

  const showTransactionDetails = (transaction: Transaction) => {
    setSelectedTransaction(transaction)
  }

  const closeModal = () => {
    setSelectedTransaction(null)
  }

  const renderReferenceInfo = (reference: any) => {
    if (!reference) return 'N/A'

    if (typeof reference === 'object') {
      return (
        <div className='space-y-1'>
          {reference.seller && (
            <p className='text-gray-700 text-sm'>
              <span className='font-medium'>সেলার:</span> {reference.seller}
            </p>
          )}
          {reference.level && (
            <p className='text-gray-700 text-sm'>
              <span className='font-medium'>রেফারেল লেভেল:</span> {reference.level}
            </p>
          )}
        </div>
      )
    }

    return <p className='text-gray-700 text-sm'>{reference}</p>
  }

  const totalPages = Math.ceil(pagination.totalCount / pagination.pageSize)

  return (
    <div className='min-h-screen bg-[#f7f6f3] py-6 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-6xl mx-auto'>
        {/* Header */}
        <motion.div initial='hidden' animate='visible' variants={staggerContainer} className='mb-6'>
          <motion.div variants={fadeUp}>
            <h1 className='text-2xl md:text-3xl font-bold text-[#1a1a2e]'>ব্যালেন্স স্টেটমেন্ট</h1>
            <p className='text-gray-500 text-sm mt-1'>আপনার সকল লেনদেনের ইতিহাস</p>
          </motion.div>
        </motion.div>

        {/* Balance Summary Cards */}
        <motion.div
          variants={staggerContainer}
          initial='hidden'
          animate='visible'
          className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6'
        >
          <motion.div
            variants={fadeUp}
            className='bg-white rounded-2xl shadow-sm border border-gray-100 p-5'
          >
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-gray-500 text-sm'>বর্তমান ব্যালেন্স</p>
                <p className='text-2xl font-bold text-[#1a1a2e] mt-1'>
                  ৳{account.balance.toLocaleString('bn-BD')}
                </p>
              </div>
              <div className='h-10 w-10 rounded-xl bg-rose-100 flex items-center justify-center'>
                <FaWallet className='h-5 w-5 text-rose-500' />
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={fadeUp}
            className='bg-white rounded-2xl shadow-sm border border-gray-100 p-5'
          >
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-gray-500 text-sm'>মোট ক্রেডিট</p>
                <p className='text-2xl font-bold text-emerald-600 mt-1'>
                  ৳{account.totalCredit.toLocaleString('bn-BD')}
                </p>
              </div>
              <div className='h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center'>
                <svg
                  className='h-5 w-5 text-emerald-500'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M12 4v16m8-8H4'
                  />
                </svg>
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={fadeUp}
            className='bg-white rounded-2xl shadow-sm border border-gray-100 p-5'
          >
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-gray-500 text-sm'>মোট ডেবিট</p>
                <p className='text-2xl font-bold text-rose-600 mt-1'>
                  ৳{account.totalDebit.toLocaleString('bn-BD')}
                </p>
              </div>
              <div className='h-10 w-10 rounded-xl bg-rose-100 flex items-center justify-center'>
                <svg
                  className='h-5 w-5 text-rose-500'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M20 12H4' />
                </svg>
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={fadeUp}
            className='bg-white rounded-2xl shadow-sm border border-gray-100 p-5'
          >
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-gray-500 text-sm'>মোট লেনদেন</p>
                <p className='text-2xl font-bold text-blue-600 mt-1'>
                  {account.totalTransactions.toLocaleString('bn-BD')}
                </p>
              </div>
              <div className='h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center'>
                <svg
                  className='h-5 w-5 text-blue-500'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'
                  />
                </svg>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Transactions Card */}
        <motion.div
          variants={fadeUp}
          initial='hidden'
          animate='visible'
          className='bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden'
        >
          {/* Search and Filter Header */}
          <div className='p-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3'>
            <div className='relative flex-1 max-w-sm'>
              <FaSearch className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400' />
              <input
                type='text'
                placeholder='কারণ, আইডি বা নাম দিয়ে খুঁজুন...'
                className='w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400 transition-all'
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <div className='flex items-center gap-2'>
              <span className='text-xs text-gray-400'>প্রতি পৃষ্ঠা:</span>
              <select
                value={pagination.pageSize}
                onChange={handlePageSizeChange}
                className='px-2 py-1.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400'
              >
                <option value='5'>৫</option>
                <option value='10'>১০</option>
                <option value='20'>২০</option>
                <option value='50'>৫০</option>
              </select>
            </div>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className='flex justify-center items-center py-12'>
              <div className='animate-spin rounded-full h-8 w-8 border-2 border-rose-500 border-t-transparent' />
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className='text-center py-12'>
              <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                <svg
                  className='h-6 w-6 text-gray-400'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                  />
                </svg>
              </div>
              <p className='text-gray-500 text-sm'>
                {searchTerm
                  ? 'আপনার সার্চের সাথে মিলে কোনো লেনদেন পাওয়া যায়নি'
                  : 'কোনো লেনদেন পাওয়া যায়নি'}
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className='hidden md:block overflow-x-auto'>
                <table className='w-full'>
                  <thead className='bg-gray-50 border-b border-gray-100'>
                    <tr>
                      <th className='px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        তারিখ
                      </th>
                      <th className='px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        কারণ
                      </th>
                      <th className='px-5 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        পরিমাণ
                      </th>
                      <th className='px-5 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        বিস্তারিত
                      </th>
                    </tr>
                  </thead>
                  <tbody className='divide-y divide-gray-100'>
                    {filteredTransactions.map((tx, idx) => (
                      <motion.tr
                        key={tx.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: idx * 0.02 }}
                        className='hover:bg-gray-50/50 transition-colors'
                      >
                        <td className='px-5 py-4 text-sm text-gray-500 whitespace-nowrap'>
                          {formatDate(tx.createdAt)}
                        </td>
                        <td className='px-5 py-4 text-sm text-gray-800 max-w-xs truncate'>
                          {tx.reason}
                        </td>
                        <td
                          className={`px-5 py-4 text-sm font-semibold text-right whitespace-nowrap ${
                            tx.amount > 0 ? 'text-emerald-600' : 'text-rose-600'
                          }`}
                        >
                          {tx.amount > 0 ? '+' : ''}
                          {tx.amount.toLocaleString('bn-BD')}৳
                        </td>
                        <td className='px-5 py-4 text-center'>
                          <button
                            onClick={() => showTransactionDetails(tx)}
                            className='text-rose-500 hover:text-rose-600 text-sm font-medium transition-colors'
                          >
                            বিস্তারিত
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className='md:hidden divide-y divide-gray-100'>
                {filteredTransactions.map((tx, idx) => (
                  <motion.div
                    key={tx.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.02 }}
                    className='p-4 hover:bg-gray-50/50 cursor-pointer'
                    onClick={() => showTransactionDetails(tx)}
                  >
                    <div className='flex justify-between items-start mb-2'>
                      <div>
                        <p className='text-xs text-gray-400'>{formatDate(tx.createdAt)}</p>
                        <p className='text-sm font-medium text-gray-800 mt-0.5'>{tx.reason}</p>
                      </div>
                      <p
                        className={`text-base font-bold ${
                          tx.amount > 0 ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {tx.amount > 0 ? '+' : ''}
                        {tx.amount.toLocaleString('bn-BD')}৳
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className='px-5 py-4 border-t border-gray-100 flex items-center justify-between'>
                  <div className='text-xs text-gray-400'>
                    {(pagination.currentPage - 1) * pagination.pageSize + 1} -{' '}
                    {Math.min(pagination.currentPage * pagination.pageSize, pagination.totalCount)}{' '}
                    / {pagination.totalCount}
                  </div>
                  <div className='flex gap-1'>
                    <button
                      onClick={() => handlePageChange(pagination.currentPage - 1)}
                      disabled={pagination.currentPage === 1}
                      className='p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
                    >
                      <FaChevronLeft className='h-3.5 w-3.5' />
                    </button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum
                      if (totalPages <= 5) {
                        pageNum = i + 1
                      } else if (pagination.currentPage <= 3) {
                        pageNum = i + 1
                      } else if (pagination.currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i
                      } else {
                        pageNum = pagination.currentPage - 2 + i
                      }
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`px-3 py-1 rounded-lg text-sm transition-all ${
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
                      disabled={pagination.currentPage === totalPages}
                      className='p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
                    >
                      <FaChevronRight className='h-3.5 w-3.5' />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </motion.div>
      </div>

      {/* Transaction Details Modal */}
      {selectedTransaction && (
        <div className='fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50'>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className='bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-hidden'
          >
            <div className='bg-gradient-to-r from-[#1a1a2e] to-[#16213e] px-5 py-4'>
              <div className='flex justify-between items-center'>
                <h2 className='text-white font-semibold text-lg'>লেনদেনের বিস্তারিত</h2>
                <button
                  onClick={closeModal}
                  className='text-white/50 hover:text-white transition-colors'
                >
                  <svg className='h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M6 18L18 6M6 6l12 12'
                    />
                  </svg>
                </button>
              </div>
            </div>

            <div className='p-5 space-y-4 overflow-y-auto max-h-[calc(90vh-80px)]'>
              <div className='flex justify-between items-center pb-2 border-b border-gray-100'>
                <span className='text-gray-500 text-sm'>তারিখ</span>
                <span className='text-gray-800 text-sm'>
                  {formatDate(selectedTransaction.createdAt)}
                </span>
              </div>

              <div className='flex justify-between items-center pb-2 border-b border-gray-100'>
                <span className='text-gray-500 text-sm'>কারণ</span>
                <span className='text-gray-800 text-sm font-medium'>
                  {selectedTransaction.reason}
                </span>
              </div>

              <div className='flex justify-between items-center pb-2 border-b border-gray-100'>
                <span className='text-gray-500 text-sm'>পরিমাণ</span>
                <span
                  className={`text-lg font-bold ${
                    selectedTransaction.amount > 0 ? 'text-emerald-600' : 'text-rose-600'
                  }`}
                >
                  {selectedTransaction.amount > 0 ? '+' : ''}
                  {selectedTransaction.amount.toLocaleString('bn-BD')}৳
                </span>
              </div>

              {selectedTransaction.reference && (
                <div className='bg-gray-50 rounded-xl p-3'>
                  <p className='text-xs font-medium text-gray-500 mb-2'>রেফারেন্স তথ্য</p>
                  {renderReferenceInfo(selectedTransaction.reference)}
                </div>
              )}
            </div>

            <div className='px-5 py-4 border-t border-gray-100'>
              <button
                onClick={closeModal}
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

export default BalanceStatement
