import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { FiChevronLeft, FiChevronRight, FiMessageSquare, FiSearch } from 'react-icons/fi'
import { getAllUsers, sendDirectMessageToSeller } from '../Api/admin.api'

interface User {
  userId: string
  name: string
  phoneNo: string
  email?: string
  shopName?: string
  upazilla: string
  zilla: string
  address?: string
  isVerified: boolean
  createdAt: string
  nomineePhone?: string
  balance: number
}

const UserSettings = () => {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [nameFilter, setNameFilter] = useState('')
  const [phoneFilter, setPhoneFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [pageSize] = useState(10)
  const [tableLoading, setTableLoading] = useState(false)
  const [totalUsers, setTotalUsers] = useState(0)
  const [messageModal, setMessageModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [messageContent, setMessageContent] = useState('')
  const [messageStatus, setMessageStatus] = useState<{
    type: 'success' | 'error' | null
    message: string
  }>({ type: null, message: '' })
  const [sendingMessage, setSendingMessage] = useState(false)

  // Fetch users data
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setTableLoading(true)
        const response = await getAllUsers({
          page: currentPage,
          pageSize,
          phoneNo: phoneFilter,
          name: nameFilter,
        })

        if (response.success) {
          setUsers(response.data.users)
          setTotalPages(Math.ceil(response.data.totalPages / pageSize))
          setTotalUsers(response.data.totalUsers)
        }
      } catch (error) {
        console.error('Error loading users:', error)
      } finally {
        setLoading(false)
        setTableLoading(false)
      }
    }

    fetchUsers()
  }, [currentPage, phoneFilter, nameFilter])

  const handleNameFilter = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNameFilter(e.target.value)
    setCurrentPage(1)
  }

  const handlePhoneFilter = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhoneFilter(e.target.value)
    setCurrentPage(1)
  }

  const formatBalance = (balance: number) => {
    return new Intl.NumberFormat('bn-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 2,
    }).format(balance)
  }

  const openMessageModal = (user: User) => {
    setSelectedUser(user)
    setMessageModal(true)
    setMessageStatus({ type: null, message: '' }) // Reset status when opening modal
  }

  const closeMessageModal = () => {
    setMessageModal(false)
    setSelectedUser(null)
    setMessageContent('')
    setMessageStatus({ type: null, message: '' })
    setSendingMessage(false)
  }

  const sendMessage = async () => {
    if (!messageContent.trim()) {
      setMessageStatus({
        type: 'error',
        message: 'Message cannot be empty',
      })
      return
    }

    setSendingMessage(true)
    setMessageStatus({ type: null, message: '' })

    try {
      const { success, message } = await sendDirectMessageToSeller({
        phoneNo: selectedUser?.phoneNo || '',
        message: messageContent,
      })

      if (success) {
        setMessageStatus({
          type: 'success',
          message: 'Message sent successfully!',
        })
        setMessageContent('')
        // Auto-close after 2 seconds if successful
        setTimeout(() => {
          closeMessageModal()
        }, 2000)
      } else {
        setMessageStatus({
          type: 'error',
          message: message || 'Failed to send message. Please try again.',
        })
      }
    } catch (error) {
      setMessageStatus({
        type: 'error',
        message: 'An unexpected error occurred. Please try again.',
      })
    } finally {
      setSendingMessage(false)
    }
  }

  if (loading && !users.length) {
    return (
      <div className='flex justify-center items-center h-64'>
        <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500'></div>
        <span className='ml-3 text-gray-600'>ডেটা লোড হচ্ছে...</span>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className='bg-white rounded-lg shadow-sm p-3 md:p-6'
    >
      {/* Message Modal */}
      {messageModal && selectedUser && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-lg p-6 w-full max-w-md'>
            <h3 className='text-lg font-medium mb-4'>Send message to {selectedUser.name}</h3>

            {/* Status Message */}
            {messageStatus.type && (
              <div
                className={`mb-4 p-3 rounded-md ${
                  messageStatus.type === 'success'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {messageStatus.message}
              </div>
            )}

            <textarea
              className='w-full border border-gray-300 rounded-lg p-3 mb-4'
              rows={5}
              placeholder='Type your message here...'
              value={messageContent}
              onChange={e => setMessageContent(e.target.value)}
              disabled={sendingMessage}
            />

            <div className='flex justify-end space-x-3'>
              <button
                onClick={closeMessageModal}
                className='px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50'
                disabled={sendingMessage}
              >
                Cancel
              </button>
              <button
                onClick={sendMessage}
                className='px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center justify-center min-w-24'
                disabled={sendingMessage}
              >
                {sendingMessage ? (
                  <>
                    <svg
                      className='animate-spin -ml-1 mr-2 h-4 w-4 text-white'
                      xmlns='http://www.w3.org/2000/svg'
                      fill='none'
                      viewBox='0 0 24 24'
                    >
                      <circle
                        className='opacity-25'
                        cx='12'
                        cy='12'
                        r='10'
                        stroke='currentColor'
                        strokeWidth='4'
                      ></circle>
                      <path
                        className='opacity-75'
                        fill='currentColor'
                        d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                      ></path>
                    </svg>
                    Sending...
                  </>
                ) : (
                  'Send Message'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rest of the component remains the same */}
      <div className='flex flex-col gap-3 mb-4 md:mb-6'>
        <h2 className='text-lg md:text-xl font-semibold text-gray-800'>ইউজার ম্যানেজমেন্ট</h2>

        {/* User statistics section */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-3 mb-4'>
          <div className='bg-indigo-50 p-3 rounded-lg border border-indigo-100'>
            <p className='text-sm text-indigo-700'>মোট ইউজার</p>
            <p className='text-xl font-bold text-indigo-900'>{totalUsers}</p>
          </div>

          <div className='bg-green-50 p-3 rounded-lg border border-green-100'>
            <p className='text-sm text-green-700'>ভেরিফাইড ইউজার</p>
            <p className='text-xl font-bold text-green-900'>
              {users.filter(u => u.isVerified).length}
            </p>
          </div>

          <div className='bg-amber-50 p-3 rounded-lg border border-amber-100'>
            <p className='text-sm text-amber-700'>আনভেরিফাইড ইউজার</p>
            <p className='text-xl font-bold text-amber-900'>
              {users.filter(u => !u.isVerified).length}
            </p>
          </div>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
          <div className='relative'>
            <div className='absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none'>
              <FiSearch className='text-gray-400' />
            </div>
            <input
              type='text'
              placeholder='নাম দিয়ে খুঁজুন...'
              value={nameFilter}
              onChange={handleNameFilter}
              className='block w-full pr-10 pl-3 py-2 text-sm border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500'
            />
          </div>

          <div className='relative'>
            <div className='absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none'>
              <FiSearch className='text-gray-400' />
            </div>
            <input
              type='text'
              placeholder='ফোন নম্বর দিয়ে খুঁজুন...'
              value={phoneFilter}
              onChange={handlePhoneFilter}
              className='block w-full pr-10 pl-3 py-2 text-sm border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500'
            />
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className='overflow-x-auto'>
        {tableLoading ? (
          <div className='flex justify-center items-center h-32'>
            <div className='animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500'></div>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <table className='min-w-full divide-y divide-gray-200 hidden md:table'>
              <thead className='bg-gray-50'>
                <tr>
                  <th className='px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    ব্যবহারকারীর তথ্য
                  </th>
                  <th className='px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    দোকানের বিবরণ
                  </th>
                  <th className='px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    ব্যালেন্স
                  </th>
                  <th className='px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    অবস্থা
                  </th>
                  <th className='px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className='bg-white divide-y divide-gray-200'>
                {users.length > 0 ? (
                  users.map(user => (
                    <tr key={user.userId}>
                      <td className='px-4 py-3'>
                        <div className='flex flex-col items-end'>
                          <div className='font-medium text-gray-900'>{user.name}</div>
                          <div className='text-sm text-gray-500'>{user.phoneNo}</div>
                          {user.email && <div className='text-sm text-gray-500'>{user.email}</div>}
                          {user.nomineePhone && (
                            <div className='text-sm text-gray-800'>
                              Nominee Phone: {user.nomineePhone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className='px-4 py-3'>
                        <div className='flex flex-col items-end'>
                          {user.shopName && (
                            <div className='font-medium text-gray-900'>{user.shopName}</div>
                          )}
                          <div className='text-sm text-gray-500'>
                            {user.upazilla}, {user.zilla}
                          </div>
                          {user.address && (
                            <div className='text-sm text-gray-500'>{user.address}</div>
                          )}
                        </div>
                      </td>
                      <td className='px-4 py-3 text-right'>
                        <span
                          className={`text-sm font-medium ${
                            user.balance >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {formatBalance(user.balance)}
                        </span>
                      </td>
                      <td className='px-4 py-3'>
                        <div className='flex flex-col space-y-2 items-end'>
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              user.isVerified
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {user.isVerified ? 'ভেরিফাইড' : 'আনভেরিফাইড'}
                          </span>
                          <span className='text-xs text-gray-500'>
                            যোগদান: {new Date(user.createdAt).toLocaleDateString('bn-BD')}
                          </span>
                        </div>
                      </td>
                      <td className='px-4 py-3 text-right'>
                        <button
                          onClick={() => openMessageModal(user)}
                          className='text-indigo-600 hover:text-indigo-900 flex items-center justify-end gap-1'
                        >
                          <FiMessageSquare className='h-4 w-4' />
                          <span className='text-xs'>Message</span>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className='px-6 py-4 text-center text-sm text-gray-500'>
                      কোন ব্যবহারকারী পাওয়া যায়নি
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Mobile Card View */}
            <div className='md:hidden space-y-3'>
              {users.length > 0 ? (
                users.map(user => (
                  <div
                    key={user.userId}
                    className='bg-white p-3 rounded-lg shadow border border-gray-100'
                  >
                    <div className='flex justify-between items-start'>
                      <div>
                        <h3 className='font-medium text-gray-900 text-sm'>{user.name}</h3>
                        <p className='text-xs text-gray-500'>{user.phoneNo}</p>
                      </div>
                      <span
                        className={`text-xs font-medium ${
                          user.balance >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {formatBalance(user.balance)}
                      </span>
                    </div>

                    {user.email && (
                      <p className='text-[10px] truncate text-gray-500 mt-1'>{user.email}</p>
                    )}

                    {user.nomineePhone && (
                      <p className='text-xs text-gray-800 mt-1'>
                        Nominee Phone: {user.nomineePhone}
                      </p>
                    )}

                    {user.shopName && (
                      <div className='mt-2'>
                        <h4 className='text-xs font-medium text-gray-700'>দোকান</h4>
                        <p className='text-xs text-gray-900'>{user.shopName}</p>
                        <p className='text-xs text-gray-500'>
                          {user.upazilla}, {user.zilla}
                        </p>
                      </div>
                    )}

                    <div className='flex justify-between items-center mt-2'>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          user.isVerified
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {user.isVerified ? 'ভেরিফাইড' : 'আনভেরিফাইড'}
                      </span>
                      <span className='text-xs text-gray-500'>
                        {new Date(user.createdAt).toLocaleDateString('bn-BD')}
                      </span>
                    </div>

                    <div className='mt-3 flex justify-end'>
                      <button
                        onClick={() => openMessageModal(user)}
                        className='text-indigo-600 hover:text-indigo-900 flex items-center gap-1 text-xs'
                      >
                        <FiMessageSquare className='h-3 w-3' />
                        <span>Message</span>
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className='text-center py-4 text-sm text-gray-500'>
                  কোন ব্যবহারকারী পাওয়া যায়নি
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className='flex items-center justify-between mt-4 px-2 py-3 bg-white border-t border-gray-200'>
          <div className='flex-1 flex justify-between sm:hidden'>
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className='relative inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50'
            >
              পূর্ববর্তী
            </button>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className='ml-3 relative inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50'
            >
              পরবর্তী
            </button>
          </div>
          <div className='hidden sm:flex-1 sm:flex sm:items-center sm:justify-between'>
            <div>
              <p className='text-xs md:text-sm text-gray-700'>
                দেখানো হচ্ছে <span className='font-medium'>{(currentPage - 1) * pageSize + 1}</span>{' '}
                থেকে{' '}
                <span className='font-medium'>{Math.min(currentPage * pageSize, totalUsers)}</span>{' '}
                এর মধ্যে, মোট <span className='font-medium'>{totalUsers}</span> ব্যবহারকারী
              </p>
            </div>
            <div>
              <nav className='relative z-0 inline-flex rounded-md shadow-sm -space-x-px'>
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className='relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50'
                >
                  <span className='sr-only'>পূর্ববর্তী</span>
                  <FiChevronLeft className='h-4 w-4 md:h-5 md:w-5' />
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum
                  if (totalPages <= 5) {
                    pageNum = i + 1
                  } else if (currentPage <= 3) {
                    pageNum = i + 1
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i
                  } else {
                    pageNum = currentPage - 2 + i
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`relative inline-flex items-center px-3 py-1 border text-xs md:text-sm font-medium ${
                        currentPage === pageNum
                          ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  )
                })}
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className='relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50'
                >
                  <span className='sr-only'>পরবর্তী</span>
                  <FiChevronRight className='h-4 w-4 md:h-5 md:w-5' />
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  )
}

export default UserSettings
