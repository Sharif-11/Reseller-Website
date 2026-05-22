import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { FaPlus, FaSearch, FaTicketAlt } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import supportTicketApi, { SupportTicket } from '../Api/support-ticket.api'
import { useAuth } from '../Hooks/useAuth'
import { TicketPriorityBadge, TicketStatusBadge } from './SupportTicketBadges'

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

const SupportTicketsPage = () => {
  const { user } = useAuth()
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  })
  const [filters, setFilters] = useState({
    status: '',
    search: '',
  })

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoading(true)
        const params = {
          page: pagination.page,
          limit: pagination.limit,
          status: filters.status || undefined,
          search: filters.search || undefined,
        }
        const { success, data, message } = await supportTicketApi.getUserTickets(params)
        if (success) {
          setTickets(data?.tickets || [])
          setPagination({
            page: data?.page || 1,
            limit: data?.limit || 10,
            total: data?.total || 0,
            totalPages: data?.totalPages || 1,
          })
        } else {
          setError(message || 'Failed to fetch tickets.')
        }
      } catch (err) {
        setError('Failed to fetch tickets. Please try again later.')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchTickets()
    }
  }, [user, pagination.page, filters])

  const handleStatusFilter = (status: string) => {
    setFilters(prev => ({ ...prev, status }))
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, search: e.target.value }))
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const statusFilters = [
    { value: '', label: 'সব', color: 'gray' },
    { value: 'OPEN', label: 'খোলা', color: 'blue' },
    { value: 'IN_PROGRESS', label: 'প্রক্রিয়াধীন', color: 'yellow' },
    { value: 'WAITING_RESPONSE', label: 'অপেক্ষমান', color: 'purple' },
    { value: 'RESOLVED', label: 'সমাধানকৃত', color: 'green' },
    { value: 'CLOSED', label: 'বন্ধ', color: 'gray' },
  ]

  return (
    <div className='min-h-screen bg-[#f7f6f3] py-6 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-6xl mx-auto'>
        {/* Header */}
        <motion.div initial='hidden' animate='visible' variants={staggerContainer} className='mb-6'>
          <motion.div
            variants={fadeUp}
            className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'
          >
            <div>
              <div className='flex items-center gap-2 mb-1'>
                <div className='h-8 w-1 rounded-full bg-rose-500' />
                <span className='text-rose-500 text-sm font-semibold uppercase tracking-wider'>
                  সাপোর্ট
                </span>
              </div>
              <h1 className='text-2xl md:text-3xl font-bold text-[#1a1a2e] flex items-center gap-2'>
                <FaTicketAlt className='text-rose-500 h-6 w-6 md:h-7 md:w-7' />
                সাপোর্ট টিকেট
              </h1>
              <p className='text-gray-500 text-sm mt-1'>আপনার সকল টিকেট এখানে দেখুন</p>
            </div>
            <Link
              to='/support-tickets/new'
              className='inline-flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-rose-500/20 font-medium text-sm'
            >
              <FaPlus className='h-3.5 w-3.5' />
              নতুন টিকেট তৈরি করুন
            </Link>
          </motion.div>
        </motion.div>

        {/* Main Card */}
        <motion.div
          variants={fadeUp}
          initial='hidden'
          animate='visible'
          className='bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden'
        >
          {/* Search and Filter Header */}
          <div className='p-5 border-b border-gray-100'>
            <div className='flex flex-col lg:flex-row lg:items-center gap-4'>
              <div className='relative flex-1'>
                <FaSearch className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400' />
                <input
                  type='text'
                  placeholder='টিকেট আইডি বা বিষয় দিয়ে খুঁজুন...'
                  className='w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400 transition-all'
                  value={filters.search}
                  onChange={handleSearch}
                />
              </div>
            </div>

            {/* Status Filters */}
            <div className='flex flex-wrap gap-2 mt-4'>
              {statusFilters.map(filter => (
                <button
                  key={filter.value}
                  onClick={() => handleStatusFilter(filter.value)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    filters.status === filter.value
                      ? 'bg-rose-500 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className='flex justify-center items-center py-12'>
              <div className='animate-spin rounded-full h-8 w-8 border-2 border-rose-500 border-t-transparent' />
            </div>
          ) : error ? (
            <div className='p-8 text-center text-rose-500'>{error}</div>
          ) : tickets.length === 0 ? (
            <div className='text-center py-12'>
              <div className='w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4'>
                <FaTicketAlt className='h-7 w-7 text-gray-400' />
              </div>
              <p className='text-gray-500 text-sm'>কোনো টিকেট পাওয়া যায়নি</p>
              <p className='text-xs text-gray-400 mt-1'>একটি নতুন টিকেট তৈরি করে শুরু করুন</p>
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className='md:hidden divide-y divide-gray-100'>
                {tickets.map(ticket => (
                  <div key={ticket.ticketId} className='p-4 hover:bg-gray-50/50 transition-colors'>
                    <div className='flex justify-between items-start mb-2'>
                      <Link
                        to={`/support-tickets/${ticket.ticketId}`}
                        className='text-rose-500 font-medium text-sm hover:text-rose-600'
                      >
                        #{ticket.ticketId.slice(0, 8)}
                      </Link>
                      <TicketStatusBadge status={ticket.status} />
                    </div>
                    <h3 className='font-semibold text-gray-800 text-sm mb-2'>{ticket.subject}</h3>
                    <div className='flex flex-wrap items-center gap-2 text-xs'>
                      <TicketPriorityBadge priority={ticket.priority} />
                      <span className='text-gray-400'>{formatDate(ticket.createdAt)}</span>
                    </div>
                    <div className='mt-3'>
                      <Link
                        to={`/support-tickets/${ticket.ticketId}`}
                        className='text-rose-500 text-sm font-medium hover:text-rose-600'
                      >
                        বিস্তারিত দেখুন →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className='hidden md:block overflow-x-auto'>
                <table className='w-full'>
                  <thead className='bg-gray-50 border-b border-gray-100'>
                    <tr>
                      <th className='px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        টিকেট আইডি
                      </th>
                      <th className='px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        বিষয়
                      </th>
                      <th className='px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        স্ট্যাটাস
                      </th>
                      <th className='px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        প্রায়োরিটি
                      </th>
                      <th className='px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        তারিখ
                      </th>
                      <th className='px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        অ্যাকশন
                      </th>
                    </tr>
                  </thead>
                  <tbody className='divide-y divide-gray-100'>
                    {tickets.map(ticket => (
                      <tr key={ticket.ticketId} className='hover:bg-gray-50/50 transition-colors'>
                        <td className='px-5 py-3 text-sm font-medium text-gray-700'>
                          #{ticket.ticketId.slice(0, 8)}
                        </td>
                        <td className='px-5 py-3 text-sm text-gray-800 max-w-xs truncate'>
                          <Link
                            to={`/support-tickets/${ticket.ticketId}`}
                            className='hover:text-rose-500 transition-colors'
                          >
                            {ticket.subject}
                          </Link>
                        </td>
                        <td className='px-5 py-3'>
                          <TicketStatusBadge status={ticket.status} />
                        </td>
                        <td className='px-5 py-3'>
                          <TicketPriorityBadge priority={ticket.priority} />
                        </td>
                        <td className='px-5 py-3 text-sm text-gray-500 whitespace-nowrap'>
                          {formatDate(ticket.createdAt)}
                        </td>
                        <td className='px-5 py-3'>
                          <Link
                            to={`/support-tickets/${ticket.ticketId}`}
                            className='text-rose-500 hover:text-rose-600 text-sm font-medium'
                          >
                            বিস্তারিত
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className='px-5 py-4 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3'>
                  <div className='text-xs text-gray-400'>
                    {(pagination.page - 1) * pagination.limit + 1} -{' '}
                    {Math.min(pagination.page * pagination.limit, pagination.total)} /{' '}
                    {pagination.total} টি টিকেট
                  </div>
                  <div className='flex gap-1'>
                    <button
                      onClick={() =>
                        setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))
                      }
                      disabled={pagination.page === 1}
                      className='px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all'
                    >
                      পূর্ববর্তী
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
                          onClick={() => setPagination(prev => ({ ...prev, page: pageNum }))}
                          className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                            pageNum === pagination.page
                              ? 'bg-rose-500 text-white'
                              : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      )
                    })}
                    <button
                      onClick={() =>
                        setPagination(prev => ({
                          ...prev,
                          page: Math.min(pagination.totalPages, prev.page + 1),
                        }))
                      }
                      disabled={pagination.page === pagination.totalPages}
                      className='px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all'
                    >
                      পরবর্তী
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </motion.div>
      </div>
    </div>
  )
}

export default SupportTicketsPage
