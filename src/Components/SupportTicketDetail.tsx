import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import supportTicketApi, { SupportTicket, TicketMessage } from '../Api/support-ticket.api'
import { FilePreview, TicketPriorityBadge, TicketStatusBadge } from './SupportTicketBadges'

interface TicketWithMessages extends SupportTicket {
  messages: TicketMessage[]
}

const formatDateTime = (dateString: string | Date) => {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const SupportTicketDetailPage = () => {
  const { ticketId } = useParams<{ ticketId: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const [ticket, setTicket] = useState<TicketWithMessages | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [replyMessage, setReplyMessage] = useState('')
  const [attachments, setAttachments] = useState<File[]>([])
  const [replying, setReplying] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        setLoading(true)
        const response = await supportTicketApi.getTicketDetails(ticketId!)

        if (response.success && response.data) {
          setTicket(response.data)

          // Mark messages as read if they're from admin/system
          const unreadMessages = response.data.messages.filter(
            (msg: TicketMessage) => msg.senderType !== 'SELLER' && !msg.isRead
          )

          if (unreadMessages.length > 0) {
            // You would typically have an API endpoint to mark messages as read
            // await supportTicketApi.markMessagesAsRead(unreadMessages.map(m => m.messageId))
          }
        } else {
          setError(response.error || 'Failed to fetch ticket details')
        }
      } catch (err) {
        setError('Failed to fetch ticket details. Please try again later.')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    if (ticketId) {
      fetchTicket()
    }
  }, [ticketId])

  useEffect(() => {
    if (location.state?.successMessage) {
      const timer = setTimeout(() => {
        navigate(location.pathname, { replace: true, state: {} })
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [location, navigate])

  useEffect(() => {
    scrollToBottom()
  }, [ticket?.messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      if (attachments.length + newFiles.length > 5) {
        setError('You can upload a maximum of 5 files')
        return
      }

      // Check each file size (max 2MB)
      for (const file of newFiles) {
        if (file.size > 2 * 1024 * 1024) {
          setError('Each file must be smaller than 2MB')
          return
        }
      }

      setAttachments(prev => [...prev, ...newFiles])
      setError('')
    }
  }

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index))
  }

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!replyMessage.trim() && attachments.length === 0) return

    try {
      setReplying(true)
      const response = await supportTicketApi.replyToTicket(
        ticketId!,
        replyMessage,
        attachments,
        false
      )

      if (response.success && response.data && ticket) {
        const newMessage: TicketMessage = {
          messageId: response.data.messageId || Date.now().toString(),
          ticketId: ticketId!,
          senderId: response.data.senderId || ticket.userId,
          senderType: 'SELLER',
          senderName: ticket.userName,
          senderEmail: ticket.userEmail,
          content: replyMessage,
          attachments: response.data.attachments || [],
          isRead: false,
          createdAt: new Date(),
          parentId: undefined,
        }

        setTicket({
          ...ticket,
          messages: [...ticket.messages, newMessage],
          updatedAt: new Date(),
        })
        setReplyMessage('')
        setAttachments([])
        setError('')
      } else {
        setError(response.error || 'Failed to send reply')
      }
    } catch (err) {
      setError('Failed to send reply. Please try again.')
      console.error(err)
    } finally {
      setReplying(false)
    }
  }

  if (loading) {
    return (
      <div className='container mx-auto px-4 py-8 text-center'>
        <div className='inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600'></div>
        <p className='mt-2 text-gray-600'>Loading ticket details...</p>
      </div>
    )
  }

  if (error || !ticket) {
    return (
      <div className='container mx-auto px-4 py-8 text-center text-red-600'>
        {error || 'Ticket not found'}
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='container mx-auto px-3 sm:px-4 py-4 sm:py-6'>
        {location.state?.successMessage && (
          <div className='mb-4 p-3 bg-green-100 text-green-700 rounded-md text-sm'>
            {location.state.successMessage}
          </div>
        )}

        {/* Mobile-first back button */}
        <div className='mb-4 sm:mb-6'>
          <button
            onClick={() => navigate('/support-tickets')}
            className='flex items-center text-gray-600 hover:text-gray-800 text-sm sm:text-base'
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='h-4 w-4 sm:h-5 sm:w-5 mr-1'
              viewBox='0 0 20 20'
              fill='currentColor'
            >
              <path
                fillRule='evenodd'
                d='M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z'
                clipRule='evenodd'
              />
            </svg>
            Back to all tickets
          </button>
        </div>

        <div className='bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden'>
          {/* Ticket Header - Mobile responsive */}
          <div className='p-4 sm:p-6 border-b border-gray-200'>
            <div className='space-y-3 sm:space-y-0 sm:flex sm:justify-between sm:items-start'>
              <div className='flex-1 min-w-0'>
                <h2 className='text-lg sm:text-xl font-bold text-gray-800 break-words'>
                  {ticket.subject}
                </h2>
                <div className='mt-2 space-y-1 sm:space-y-0 sm:flex sm:flex-wrap sm:items-center sm:gap-x-4 sm:gap-y-1'>
                  <span className='block sm:inline text-xs sm:text-sm text-gray-500'>
                    Ticket #: {ticket.ticketId}
                  </span>
                  <span className='block sm:inline text-xs sm:text-sm text-gray-500'>
                    Created: {formatDateTime(ticket.createdAt)}
                  </span>
                  {ticket.orderId && (
                    <span className='block sm:inline text-xs sm:text-sm text-gray-500'>
                      Order #: {ticket.orderId}
                    </span>
                  )}
                  {ticket.shopName && (
                    <span className='block sm:inline text-xs sm:text-sm text-gray-500'>
                      Shop: {ticket.shopName}
                    </span>
                  )}
                </div>
              </div>
              <div className='flex flex-wrap gap-2 sm:ml-4'>
                <TicketStatusBadge status={ticket.status} />
                <TicketPriorityBadge priority={ticket.priority} />
              </div>
            </div>
          </div>

          {/* Messages - Mobile responsive */}
          <div className='p-4 sm:p-6 space-y-4 sm:space-y-6 max-h-[50vh] sm:max-h-[calc(100vh-300px)] overflow-y-auto'>
            {ticket.messages.map(message => (
              <div
                key={message.messageId}
                className={`flex ${
                  message.senderType === 'SELLER' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[90%] sm:max-w-[75%] rounded-lg p-3 sm:p-4 ${
                    message.senderType === 'SELLER'
                      ? 'bg-indigo-100 rounded-tr-none'
                      : message.senderType === 'SYSTEM'
                      ? 'bg-gray-100 rounded-tl-none'
                      : 'bg-yellow-100 rounded-tl-none'
                  }`}
                >
                  <div className='flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2 gap-1'>
                    <div className='flex items-center flex-wrap gap-1'>
                      <span className='font-medium text-sm sm:text-base'>
                        {message.senderType === 'SELLER' ? 'You' : message.senderName}
                      </span>
                      {message.senderType === 'SYSTEM' && (
                        <span className='text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full'>
                          Admin
                        </span>
                      )}
                    </div>
                    <span className='text-xs text-gray-500 whitespace-nowrap'>
                      {formatDateTime(message.createdAt)}
                    </span>
                  </div>
                  <p className='whitespace-pre-line text-sm sm:text-base break-words'>
                    {message.content}
                  </p>

                  {message.attachments.length > 0 && (
                    <div className='mt-3 grid grid-cols-1 gap-2'>
                      {message.attachments.map((url, idx) => (
                        <a
                          key={idx}
                          href={url}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='border border-gray-200 rounded p-2 hover:bg-gray-50'
                        >
                          <div className='flex items-center'>
                            {url.match(/\.(jpeg|jpg|gif|png)$/i) ? (
                              <img
                                src={url}
                                alt={`Attachment ${idx + 1}`}
                                className='h-10 w-10 sm:h-12 sm:w-12 object-cover rounded'
                              />
                            ) : (
                              <div className='h-10 w-10 sm:h-12 sm:w-12 bg-gray-100 rounded flex items-center justify-center'>
                                <svg
                                  className='h-5 w-5 sm:h-6 sm:w-6 text-gray-400'
                                  fill='none'
                                  stroke='currentColor'
                                  viewBox='0 0 24 24'
                                >
                                  <path
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                    strokeWidth={2}
                                    d='M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z'
                                  />
                                </svg>
                              </div>
                            )}
                            <div className='ml-2 flex-1 min-w-0'>
                              <p className='text-xs sm:text-sm text-gray-500 truncate'>
                                {url.split('/').pop() || 'File'}
                              </p>
                              <p className='text-xs text-gray-400'>
                                {url.match(/\.(jpeg|jpg|gif|png)$/i) ? 'Image' : 'File'}
                              </p>
                            </div>
                          </div>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Reply Form - Mobile responsive */}
          {ticket.status !== 'CLOSED' && (
            <div className='p-4 sm:p-6 border-t border-gray-200'>
              <form onSubmit={handleReplySubmit} className='space-y-4'>
                <div>
                  <label htmlFor='reply' className='block text-sm font-medium text-gray-700 mb-2'>
                    Your Reply
                  </label>
                  <textarea
                    id='reply'
                    rows={3}
                    value={replyMessage}
                    onChange={e => setReplyMessage(e.target.value)}
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base'
                    placeholder='Type your reply here...'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Attachments (max 5 files, 2MB each)
                  </label>
                  <div className='flex flex-col sm:flex-row sm:items-center gap-2'>
                    <button
                      type='button'
                      onClick={() => fileInputRef.current?.click()}
                      className='inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                    >
                      <svg
                        className='-ml-1 mr-2 h-4 w-4 sm:h-5 sm:w-5 text-gray-500'
                        xmlns='http://www.w3.org/2000/svg'
                        viewBox='0 0 20 20'
                        fill='currentColor'
                      >
                        <path
                          fillRule='evenodd'
                          d='M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z'
                          clipRule='evenodd'
                        />
                      </svg>
                      Select Files
                    </button>
                    <input
                      ref={fileInputRef}
                      type='file'
                      multiple
                      onChange={handleFileChange}
                      className='hidden'
                      accept='image/*,.pdf,.doc,.docx,.xls,.xlsx'
                    />
                    <p className='text-sm text-gray-500'>{attachments.length} / 5 files selected</p>
                  </div>

                  {attachments.length > 0 && (
                    <div className='mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3'>
                      {attachments.map((file, index) => (
                        <FilePreview
                          key={index}
                          file={file}
                          onRemove={() => removeAttachment(index)}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {error && (
                  <div className='p-3 bg-red-100 text-red-700 rounded-md text-sm'>{error}</div>
                )}

                <div className='flex justify-end'>
                  <button
                    type='submit'
                    disabled={replying || (!replyMessage.trim() && attachments.length === 0)}
                    className='w-full sm:w-auto px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed'
                  >
                    {replying ? (
                      <>
                        <svg
                          className='animate-spin -ml-1 mr-2 h-4 w-4 text-white inline'
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
                          />
                          <path
                            className='opacity-75'
                            fill='currentColor'
                            d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                          />
                        </svg>
                        Sending...
                      </>
                    ) : (
                      'Send'
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SupportTicketDetailPage
