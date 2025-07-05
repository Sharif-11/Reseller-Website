import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import supportTicketApi, { SupportTicket } from '../Api/support-ticket.api'
import { useAuth } from '../Hooks/useAuth'

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

  const TicketStatusBadge = ({ status }: { status: string }) => {
    const statusClasses: Record<string, string> = {
      OPEN: 'bg-blue-100 text-blue-800',
      IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
      WAITING_RESPONSE: 'bg-purple-100 text-purple-800',
      RESOLVED: 'bg-green-100 text-green-800',
      CLOSED: 'bg-gray-100 text-gray-800',
    }
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-semibold ${
          statusClasses[status] || 'bg-gray-200 text-gray-700'
        }`}
      >
        {status.replace('_', ' ').toLowerCase()}
      </span>
    )
  }

  const TicketPriorityBadge = ({ priority }: { priority: string }) => {
    const priorityClasses: Record<string, string> = {
      LOW: 'bg-green-100 text-green-800',
      MEDIUM: 'bg-yellow-100 text-yellow-800',
      HIGH: 'bg-red-100 text-red-800',
      CRITICAL: 'bg-purple-100 text-purple-800',
    }
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-semibold ${
          priorityClasses[priority] || 'bg-gray-200 text-gray-700'
        }`}
      >
        {priority.toLowerCase()}
      </span>
    )
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className='container mx-auto px-4 py-6'>
      <div className='flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4'>
        <h1 className='text-2xl font-bold text-gray-800'>Support Tickets</h1>
        <Link
          to='/support-tickets/new'
          className='bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg shadow-sm transition-colors text-sm md:text-base'
        >
          Create New Ticket
        </Link>
      </div>

      <div className='bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden'>
        <div className='p-4 border-b border-gray-200'>
          <div className='flex flex-col gap-4'>
            <div className='relative w-full'>
              <input
                type='text'
                placeholder='Search tickets...'
                className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-sm md:text-base'
                value={filters.search}
                onChange={handleSearch}
              />
              <div className='absolute left-3 top-2.5 text-gray-400'>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-5 w-5'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
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

            <div className='flex flex-wrap gap-2 overflow-x-auto pb-2'>
              <button
                onClick={() => handleStatusFilter('')}
                className={`px-3 py-1 rounded-full text-xs md:text-sm ${
                  filters.status === ''
                    ? 'bg-indigo-100 text-indigo-800'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => handleStatusFilter('OPEN')}
                className={`px-3 py-1 rounded-full text-xs md:text-sm ${
                  filters.status === 'OPEN'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                Open
              </button>
              <button
                onClick={() => handleStatusFilter('IN_PROGRESS')}
                className={`px-3 py-1 rounded-full text-xs md:text-sm ${
                  filters.status === 'IN_PROGRESS'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                In Progress
              </button>
              <button
                onClick={() => handleStatusFilter('WAITING_RESPONSE')}
                className={`px-3 py-1 rounded-full text-xs md:text-sm ${
                  filters.status === 'WAITING_RESPONSE'
                    ? 'bg-purple-100 text-purple-800'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                Waiting
              </button>
              <button
                onClick={() => handleStatusFilter('RESOLVED')}
                className={`px-3 py-1 rounded-full text-xs md:text-sm ${
                  filters.status === 'RESOLVED'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                Resolved
              </button>
              <button
                onClick={() => handleStatusFilter('CLOSED')}
                className={`px-3 py-1 rounded-full text-xs md:text-sm ${
                  filters.status === 'CLOSED'
                    ? 'bg-gray-100 text-gray-800'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                Closed
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className='p-8 text-center'>
            <div className='inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600'></div>
            <p className='mt-2 text-gray-600'>Loading tickets...</p>
          </div>
        ) : error ? (
          <div className='p-8 text-center text-red-600'>{error}</div>
        ) : tickets?.length === 0 ? (
          <div className='p-8 text-center text-gray-600'>
            No tickets found. Create a new ticket to get started.
          </div>
        ) : (
          <>
            {/* Mobile view - Cards */}
            <div className='md:hidden'>
              {tickets.map(ticket => (
                <div key={ticket.ticketId} className='p-4 border-b border-gray-200'>
                  <div className='flex justify-between items-start'>
                    <div>
                      <Link
                        to={`/support-tickets/${ticket.ticketId}`}
                        className='text-indigo-600 hover:text-indigo-900 font-medium'
                      >
                        #{ticket.ticketId.slice(0, 8)}
                      </Link>
                      <h3 className='text-sm font-medium text-gray-900 mt-1'>{ticket.subject}</h3>
                    </div>
                    <TicketStatusBadge status={ticket.status} />
                  </div>

                  <div className='mt-2 flex items-center gap-2 text-sm'>
                    <TicketPriorityBadge priority={ticket.priority} />
                    <span className='text-gray-500'>{formatDate(ticket.createdAt)}</span>
                  </div>

                  <div className='mt-3'>
                    <Link
                      to={`/support-tickets/${ticket.ticketId}`}
                      className='text-indigo-600 hover:text-indigo-900 text-sm'
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop view - Table */}
            <div className='hidden md:block overflow-x-auto'>
              <table className='min-w-full divide-y divide-gray-200'>
                <thead className='bg-gray-50'>
                  <tr>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Ticket ID
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Subject
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Status
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Priority
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Date
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className='bg-white divide-y divide-gray-200'>
                  {tickets.map(ticket => (
                    <tr key={ticket.ticketId} className='hover:bg-gray-50'>
                      <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                        #{ticket.ticketId.slice(0, 8)}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                        <Link
                          to={`/support-tickets/${ticket.ticketId}`}
                          className='text-indigo-600 hover:text-indigo-900 hover:underline'
                        >
                          {ticket.subject}
                        </Link>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <TicketStatusBadge status={ticket.status} />
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <TicketPriorityBadge priority={ticket.priority} />
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                        {formatDate(ticket.createdAt)}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                        <Link
                          to={`/support-tickets/${ticket.ticketId}`}
                          className='text-indigo-600 hover:text-indigo-900'
                        >
                          Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className='px-4 md:px-6 py-4 border-t border-gray-200 flex flex-col md:flex-row items-center justify-between gap-4'>
              <div className='text-sm text-gray-700'>
                Showing{' '}
                <span className='font-medium'>{(pagination.page - 1) * pagination.limit + 1}</span>{' '}
                to{' '}
                <span className='font-medium'>
                  {Math.min(pagination.page * pagination.limit, pagination.total)}
                </span>{' '}
                of <span className='font-medium'>{pagination.total}</span> tickets
              </div>
              <div className='flex gap-2'>
                <button
                  onClick={() =>
                    setPagination(prev => ({
                      ...prev,
                      page: Math.max(1, prev.page - 1),
                    }))
                  }
                  disabled={pagination.page === 1}
                  className={`px-3 py-1 rounded-md text-sm ${
                    pagination.page === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Previous
                </button>
                <button
                  onClick={() =>
                    setPagination(prev => ({
                      ...prev,
                      page: Math.min(pagination.totalPages, prev.page + 1),
                    }))
                  }
                  disabled={pagination.page === pagination.totalPages}
                  className={`px-3 py-1 rounded-md text-sm ${
                    pagination.page === pagination.totalPages
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default SupportTicketsPage
