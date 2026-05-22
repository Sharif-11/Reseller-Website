// ReferredCustomers.tsx — BazaarHub design system
// Tokens: navy #1a1a2e · rose #e94560 · cream #f7f6f3
import { useEffect, useState } from 'react'
import { FiChevronLeft, FiChevronRight, FiPhone, FiSearch, FiUsers, FiX } from 'react-icons/fi'
import { userApi } from '../Api/user.api'

export interface Customer {
  customerId: string
  customerPhoneNo: string
  customerName: string | null
  createdAt: string
}

/* ─── Pagination ─── */
const Pagination = ({
  current,
  total,
  onChange,
}: {
  current: number
  total: number
  onChange: (p: number) => void
}) => {
  if (total <= 1) return null

  const maxVisible = 3
  let start = Math.max(1, current - 1)
  let end = Math.min(total, start + maxVisible - 1)
  if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1)

  const pages: number[] = []
  for (let i = start; i <= end; i++) pages.push(i)

  const btnBase =
    'flex h-8 w-8 items-center justify-center rounded-lg text-[13px] font-medium transition'

  return (
    <div className='flex items-center justify-center gap-1.5 px-4 py-3'>
      <button
        onClick={() => onChange(current - 1)}
        disabled={current === 1}
        className={`${btnBase} border border-gray-100 bg-white text-gray-500 hover:border-gray-200 disabled:opacity-30`}
      >
        <FiChevronLeft className='h-3.5 w-3.5' />
      </button>

      {start > 1 && (
        <>
          <button
            onClick={() => onChange(1)}
            className={`${btnBase} border border-gray-100 bg-white text-gray-600 hover:border-gray-200`}
          >
            1
          </button>
          {start > 2 && <span className='px-1 text-[12px] text-gray-300'>···</span>}
        </>
      )}

      {pages.map(p => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={`${btnBase} ${p === current ? 'bg-[#e94560] text-white shadow-sm' : 'border border-gray-100 bg-white text-gray-600 hover:border-gray-200'}`}
        >
          {p}
        </button>
      ))}

      {end < total && (
        <>
          {end < total - 1 && <span className='px-1 text-[12px] text-gray-300'>···</span>}
          <button
            onClick={() => onChange(total)}
            className={`${btnBase} border border-gray-100 bg-white text-gray-600 hover:border-gray-200`}
          >
            {total}
          </button>
        </>
      )}

      <button
        onClick={() => onChange(current + 1)}
        disabled={current === total}
        className={`${btnBase} border border-gray-100 bg-white text-gray-500 hover:border-gray-200 disabled:opacity-30`}
      >
        <FiChevronRight className='h-3.5 w-3.5' />
      </button>
    </div>
  )
}

/* ════════════════════════════════════════════ */
const ReferredCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const limit = 5

  const fetchReferredCustomers = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await userApi.getReferredCustomersBySeller({
        page: currentPage,
        limit,
        search: searchTerm,
      })
      if (response.data) {
        setCustomers(response.data.customers)
        setTotalPages(response.data.totalPages)
        setTotalCount(response.data.totalCount)
      }
    } catch {
      setError('ডেটা লোড করতে সমস্যা হয়েছে')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReferredCustomers()
  }, [currentPage])

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

  return (
    <div className='min-h-screen bg-[#f7f6f3] px-4 py-6 sm:px-6'>
      <div className='mx-auto max-w-2xl'>
        {/* ── Page header ── */}
        <div className='mb-5 flex items-center justify-between'>
          <div>
            <h1 className='font-serif text-[22px] font-bold text-[#1a1a2e]'>রেফার্ড কাস্টমার</h1>
            <p className='mt-0.5 text-[13px] text-gray-400'>
              {loading ? 'লোড হচ্ছে...' : `মোট ${totalCount} জন কাস্টমার`}
            </p>
          </div>
          <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-[#1a1a2e]'>
            <FiUsers className='h-4 w-4 text-white' />
          </div>
        </div>

        {/* ── Search ── */}
        <form onSubmit={handleSearch} className='mb-4'>
          <div className='flex items-center gap-2 rounded-2xl border border-gray-100 bg-white px-4 py-2.5 shadow-sm transition focus-within:border-[#e94560]/30 focus-within:ring-2 focus-within:ring-[#e94560]/10'>
            <FiSearch className='h-4 w-4 shrink-0 text-gray-300' />
            <input
              type='text'
              placeholder='ফোন নম্বর বা নাম খুঁজুন...'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className='flex-1 bg-transparent text-[13px] text-[#1a1a2e] outline-none placeholder:text-gray-300'
            />
            {searchTerm && (
              <button
                type='button'
                onClick={() => {
                  setSearchTerm('')
                  setCurrentPage(1)
                }}
                className='text-gray-300 transition hover:text-gray-500'
              >
                <FiX className='h-3.5 w-3.5' />
              </button>
            )}
            <button
              type='submit'
              className='shrink-0 rounded-xl bg-[#e94560] px-4 py-1.5 text-[12px] font-semibold text-white transition hover:bg-[#c73652]'
            >
              খুঁজুন
            </button>
          </div>
        </form>

        {/* ── Error ── */}
        {error && (
          <div className='mb-4 flex items-center gap-3 rounded-2xl border border-[#e94560]/20 bg-[#e94560]/8 px-4 py-3'>
            <div className='flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#e94560]'>
              <span className='text-[9px] font-bold text-white'>!</span>
            </div>
            <p className='text-[13px] text-[#e94560]'>{error}</p>
          </div>
        )}

        {/* ── Loading ── */}
        {loading ? (
          <div className='flex flex-col items-center justify-center rounded-2xl border border-gray-100 bg-white py-16'>
            <div className='relative h-10 w-10'>
              <div className='absolute inset-0 rounded-full border-2 border-[#1a1a2e]/10' />
              <div className='absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-[#e94560]' />
            </div>
            <p className='mt-3 text-[12px] text-gray-400'>লোড হচ্ছে...</p>
          </div>
        ) : customers.length === 0 ? (
          /* ── Empty ── */
          <div className='flex flex-col items-center justify-center rounded-2xl border border-gray-100 bg-white py-14 text-center'>
            <div className='mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1a1a2e]/5'>
              <FiUsers className='h-6 w-6 text-[#1a1a2e]/25' />
            </div>
            <h3 className='mb-1 text-[15px] font-semibold text-[#1a1a2e]'>
              কোন কাস্টমার পাওয়া যায়নি
            </h3>
            <p className='text-[13px] text-gray-400'>
              {searchTerm ? 'অনুসন্ধানের সাথে কিছু মেলেনি' : 'কোন কাস্টমার রেফার করেননি'}
            </p>
          </div>
        ) : (
          /* ── List ── */
          <div className='overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm'>
            <div className='divide-y divide-gray-50'>
              {customers.map((customer, idx) => (
                <div
                  key={customer.customerId}
                  className='flex items-center gap-4 px-5 py-4 transition hover:bg-[#f7f6f3]'
                >
                  {/* Avatar */}
                  <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#1a1a2e] to-[#2d2d4e]'>
                    <span className='font-serif text-[15px] font-bold text-white'>
                      {(customer.customerName || customer.customerPhoneNo).charAt(0).toUpperCase()}
                    </span>
                  </div>

                  {/* Info */}
                  <div className='flex-1 min-w-0'>
                    {customer.customerName && (
                      <p className='truncate text-[14px] font-semibold text-[#1a1a2e]'>
                        {customer.customerName}
                      </p>
                    )}
                    <div className='flex items-center gap-1.5'>
                      <FiPhone className='h-3 w-3 shrink-0 text-gray-300' />
                      <p className='text-[12px] text-gray-500'>{customer.customerPhoneNo}</p>
                    </div>
                  </div>

                  {/* Date */}
                  <div className='shrink-0 text-right'>
                    <p className='text-[10px] text-gray-400'>যোগদান</p>
                    <p className='text-[12px] font-medium text-gray-600'>
                      {new Date(customer.createdAt).toLocaleDateString('bn-BD')}
                    </p>
                  </div>

                  {/* Index badge */}
                  <div className='hidden shrink-0 sm:flex h-7 w-7 items-center justify-center rounded-lg bg-[#f7f6f3]'>
                    <span className='text-[11px] font-bold text-gray-400'>
                      {(currentPage - 1) * limit + idx + 1}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className='border-t border-gray-50'>
                <Pagination current={currentPage} total={totalPages} onChange={handlePageChange} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default ReferredCustomers
