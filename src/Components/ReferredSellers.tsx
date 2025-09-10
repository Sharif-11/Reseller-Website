import { useEffect, useState } from 'react'
import { userApi } from '../Api/user.api'

export interface Seller {
  userId: string
  name: string
  phoneNo: string
  zilla: string | null
  upazilla: string | null
  address: string | null
  level: number
  createdAt: string
}

export interface ReferredSellersResponse {
  sellers: Seller[]
  totalCount: number
  totalPages: number
  currentPage: number
}

const ReferredSellers = () => {
  const [sellers, setSellers] = useState<Seller[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [level, setLevel] = useState(1)

  const limit = 5

  useEffect(() => {
    fetchReferredSellers()
  }, [currentPage, level])

  const fetchReferredSellers = async () => {
    try {
      setLoading(true)
      const response = await userApi.getReferredSellersByLevel({
        level,
        page: currentPage,
        limit,
        search: searchTerm,
      })

      if (response.data) {
        setSellers(response.data.sellers)
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
    fetchReferredSellers()
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
                <h1 className='text-xl font-bold text-gray-900'>রেফার্ড সেলার</h1>
                <p className='text-sm text-gray-500'>মোট {sellers.length} জন</p>
              </div>
              {/* <div className='bg-indigo-50 px-3 py-1 rounded-full'>
                <span className='text-xs font-medium text-indigo-700'>লেভেল {level}</span>
              </div> */}
            </div>

            {/* Controls */}
            <div className='flex flex-col sm:flex-row gap-3'>
              <div className='relative flex-shrink-0'>
                <select
                  value={level}
                  onChange={e => {
                    setLevel(parseInt(e.target.value))
                    setCurrentPage(1)
                  }}
                  className='w-full sm:w-32 px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white appearance-none pr-8'
                >
                  <option value={1}>লেভেল ১</option>
                  <option value={2}>লেভেল ২</option>
                  <option value={3}>লেভেল ৩</option>
                  <option value={4}>লেভেল ৪</option>
                </select>
                <div className='pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400'>
                  <svg className='h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M19 9l-7 7-7-7'
                    />
                  </svg>
                </div>
              </div>

              <form onSubmit={handleSearch} className='flex flex-1'>
                <input
                  type='text'
                  placeholder='নাম বা ফোন খুঁজুন...'
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
        {sellers.length === 0 ? (
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
            <h3 className='text-lg font-medium text-gray-900 mb-2'>কোন সেলার পাওয়া যায়নি</h3>
            <p className='text-gray-500 text-sm mb-4'>
              {searchTerm ? 'অনুসন্ধানের সাথে কিছু মেলেনি' : `লেভেল ${level} এ কোন সেলার নেই`}
            </p>
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm('')
                  setCurrentPage(1)
                  fetchReferredSellers()
                }}
                className='inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors'
              >
                সব দেখুন
              </button>
            )}
          </div>
        ) : (
          <div className='space-y-3'>
            {/* Sellers List */}
            {sellers.map(seller => (
              <div
                key={seller.userId}
                className='bg-white rounded-xl shadow-sm p-4 transition-all hover:shadow-md'
              >
                <div className='flex items-start space-x-3'>
                  {/* Avatar */}
                  <div className='w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0'>
                    <span className='text-white font-semibold text-sm'>
                      {seller.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>

                  {/* Content */}
                  <div className='flex-1 min-w-0'>
                    <div className='flex items-start justify-between mb-2'>
                      <div className='flex-1 min-w-0'>
                        <h3 className='font-semibold text-gray-900 text-sm truncate'>
                          {seller.name}
                        </h3>
                        <p className='text-xs text-gray-600'>{seller.phoneNo}</p>
                      </div>
                      <span className='ml-2 px-2 py-1 text-xs font-medium rounded-lg bg-indigo-50 text-indigo-700 whitespace-nowrap'>
                        লেভেল {seller.level}
                      </span>
                    </div>

                    {/* Location & Date */}
                    <div className='space-y-1'>
                      {(seller.zilla || seller.upazilla) && (
                        <div className='flex items-center text-xs text-gray-500'>
                          <svg
                            className='w-3 h-3 mr-1.5 text-gray-400 flex-shrink-0'
                            fill='none'
                            stroke='currentColor'
                            viewBox='0 0 24 24'
                          >
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth={2}
                              d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z'
                            />
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth={2}
                              d='M15 11a3 3 0 11-6 0 3 3 0 016 0z'
                            />
                          </svg>
                          <span className='truncate'>
                            {[seller.zilla, seller.upazilla].filter(Boolean).join(', ')}
                          </span>
                        </div>
                      )}

                      {seller.address && (
                        <div className='flex items-start text-xs text-gray-500'>
                          <svg
                            className='w-3 h-3 mr-1.5 text-gray-400 flex-shrink-0 mt-0.5'
                            fill='none'
                            stroke='currentColor'
                            viewBox='0 0 24 24'
                          >
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth={2}
                              d='M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6'
                            />
                          </svg>
                          <span className='line-clamp-2 leading-4'>{seller.address}</span>
                        </div>
                      )}

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
                        <span>{new Date(seller.createdAt).toLocaleDateString('bn-BD')}</span>
                      </div>
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

export default ReferredSellers
