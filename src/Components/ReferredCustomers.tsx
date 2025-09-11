import { useEffect, useState } from 'react'
import { userApi } from '../Api/user.api'

export interface Customer {
  customerId: string
  customerPhoneNo: string
  customerName: string | null
  createdAt: string
}

export interface ReferredCustomersResponse {
  customers: Customer[]
  totalCount: number
  totalPages: number
  currentPage: number
}

const ReferredCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const limit = 5

  useEffect(() => {
    fetchReferredCustomers()
  }, [currentPage])

  const fetchReferredCustomers = async () => {
    try {
      setLoading(true)
      const response = await userApi.getReferredCustomersBySeller({
        page: currentPage,
        limit,
        search: searchTerm,
      })

      if (response.data) {
        setCustomers(response.data.customers)
        setTotalPages(response.data.totalPages)
      }
    } catch (err) {
      setError('ডেটা লোড করতে সমস্যা হয়েছে')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchReferredCustomers()
  }

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const renderCompactPagination = () => {
    const pages = []
    const maxVisible = 3

    let startPage = Math.max(1, currentPage - 1)
    let endPage = Math.min(totalPages, startPage + maxVisible - 1)

    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1)
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`w-8 h-8 text-sm rounded-lg transition-all ${
            currentPage === i
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {i}
        </button>
      )
    }

    return (
      <div className='flex items-center justify-center space-x-2 mt-4 px-4'>
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className='p-2 text-gray-600 disabled:opacity-40 hover:bg-gray-100 rounded-lg transition-colors'
        >
          <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M15 19l-7-7 7-7'
            />
          </svg>
        </button>

        <div className='flex space-x-1'>
          {startPage > 1 && (
            <>
              <button
                onClick={() => handlePageChange(1)}
                className='w-8 h-8 text-sm rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200'
              >
                1
              </button>
              {startPage > 2 && <span className='px-1 text-gray-400 text-sm'>...</span>}
            </>
          )}

          {pages}

          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && <span className='px-1 text-gray-400 text-sm'>...</span>}
              <button
                onClick={() => handlePageChange(totalPages)}
                className='w-8 h-8 text-sm rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200'
              >
                {totalPages}
              </button>
            </>
          )}
        </div>

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className='p-2 text-gray-600 disabled:opacity-40 hover:bg-gray-100 rounded-lg transition-colors'
        >
          <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5l7 7-7 7' />
          </svg>
        </button>
      </div>
    )
  }

  if (loading) {
    return (
      <div className='flex justify-center items-center h-40 px-4'>
        <div className='animate-spin rounded-full h-8 w-8 border-2 border-indigo-600 border-t-transparent'></div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-gray-50 p-3 sm:p-4'>
      <div className='max-w-4xl mx-auto'>
        {/* Header Section */}
        <div className='bg-white rounded-2xl shadow-sm p-4 mb-4'>
          <div className='flex flex-col space-y-4'>
            {/* Title & Count */}
            <div className='flex items-center justify-between'>
              <div>
                <h1 className='text-xl font-bold text-gray-900'>রেফার্ড কাস্টমার</h1>
                <p className='text-sm text-gray-500'>মোট {customers.length} জন</p>
              </div>
            </div>

            {/* Search Control */}
            <div className='flex flex-col sm:flex-row gap-3'>
              <form onSubmit={handleSearch} className='flex flex-1'>
                <input
                  type='text'
                  placeholder='ফোন নম্বর খুঁজুন...'
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className='flex-1 px-3 py-2.5 text-sm border border-gray-200 rounded-l-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
                />
                <button
                  type='submit'
                  className='bg-indigo-600 text-white px-4 py-2.5 rounded-r-xl hover:bg-indigo-700 transition-colors flex items-center justify-center'
                >
                  <svg className='h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
                    />
                  </svg>
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 flex items-center text-sm'>
            <svg
              className='h-4 w-4 mr-2 flex-shrink-0'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
              />
            </svg>
            {error}
          </div>
        )}

        {/* Content */}
        {customers.length === 0 ? (
          <div className='bg-white rounded-2xl shadow-sm p-8 text-center'>
            <div className='w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center'>
              <svg
                className='w-8 h-8 text-gray-400'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z'
                />
              </svg>
            </div>
            <h3 className='text-lg font-medium text-gray-900 mb-2'>কোন কাস্টমার পাওয়া যায়নি</h3>
            <p className='text-gray-500 text-sm mb-4'>
              {searchTerm ? 'অনুসন্ধানের সাথে কিছু মেলেনি' : 'কোন কাস্টমার রেফার করেননি'}
            </p>
          </div>
        ) : (
          <div className='space-y-3'>
            {/* Customers List */}
            {customers.map(customer => (
              <div
                key={customer.customerId}
                className='bg-white rounded-xl shadow-sm p-4 transition-all hover:shadow-md'
              >
                <div className='flex items-start space-x-3'>
                  {/* Avatar */}
                  <div className='w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0'>
                    <span className='text-white font-semibold text-sm'>
                      {customer.customerName
                        ? customer.customerName.charAt(0).toUpperCase()
                        : customer.customerPhoneNo.charAt(0)}
                    </span>
                  </div>

                  {/* Content */}
                  <div className='flex-1 min-w-0'>
                    <div className='flex items-start justify-between mb-2'>
                      <div className='flex-1 min-w-0'>
                        {customer.customerName && (
                          <h3 className='font-semibold text-gray-900 text-sm truncate'>
                            {customer.customerName || 'নাম উল্লেখ নেই'}
                          </h3>
                        )}
                        <p className='text-xs text-gray-600'>{customer.customerPhoneNo}</p>
                      </div>
                    </div>

                    {/* Date */}
                    <div className='flex items-center text-xs text-gray-400'>
                      <svg
                        className='w-3 h-3 mr-1.5 flex-shrink-0'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
                        />
                      </svg>
                      <span>
                        যোগদান: {new Date(customer.createdAt).toLocaleDateString('bn-BD')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className='bg-white rounded-2xl shadow-sm py-3'>{renderCompactPagination()}</div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default ReferredCustomers
