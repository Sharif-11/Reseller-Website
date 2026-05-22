import { motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { FaArrowLeft, FaImage, FaPaperPlane, FaTimes } from 'react-icons/fa'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import supportTicketApi, { SupportTicket, TicketMessage } from '../Api/support-ticket.api'
import { FilePreview, TicketPriorityBadge, TicketStatusBadge } from './SupportTicketBadges'

// Animation variants
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

const messageAnimation = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
}

interface TicketWithMessages extends SupportTicket {
  messages: TicketMessage[]
}

const formatDateTime = (dateString: string | Date) => {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString
  return date.toLocaleString('bn-BD', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const AttachmentPreviewModal = ({
  attachmentUrl,
  onClose,
}: {
  attachmentUrl: string
  onClose: () => void
}) => {
  return (
    <div
      className='fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50'
      onClick={onClose}
    >
      <div className='relative max-w-4xl max-h-[90vh]' onClick={e => e.stopPropagation()}>
        <button
          onClick={onClose}
          className='absolute -top-10 right-0 text-white hover:text-gray-300 transition-colors'
        >
          <FaTimes className='h-6 w-6' />
        </button>
        <img
          src={attachmentUrl}
          alt='Attachment preview'
          className='max-w-full max-h-[85vh] object-contain rounded-lg'
        />
      </div>
    </div>
  )
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
  const [previewAttachment, setPreviewAttachment] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        setLoading(true)
        const response = await supportTicketApi.getTicketDetails(ticketId!)

        if (response.success && response.data) {
          setTicket(response.data)
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
      toast.success(location.state.successMessage)
      navigate(location.pathname, { replace: true, state: {} })
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

      setError('')

      if (attachments.length + newFiles.length > 1) {
        setError('সর্বোচ্চ ১টি ছবি আপলোড করতে পারবেন')
        return
      }

      const validFiles: File[] = []
      for (const file of newFiles) {
        if (!file.type.match('image.*')) {
          setError('শুধুমাত্র ছবি আপলোড করা যাবে (JPEG, JPG, PNG, GIF)')
          continue
        }

        if (file.size > 1 * 1024 * 1024) {
          setError(`"${file.name}" ফাইলের সাইজ ১MB এর বেশি`)
          continue
        }

        validFiles.push(file)
      }

      if (validFiles.length > 0) {
        setAttachments(prev => [...prev, ...validFiles])
      }
    }
  }

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index))
    setError('')
  }

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!replyMessage.trim() && attachments.length === 0) {
      setError('মেসেজ লিখুন অথবা একটি ছবি সংযুক্ত করুন')
      return
    }

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

        if (attachments.length > 0) {
          toast.success('ছবি সহ রিপ্লাই সফলভাবে পাঠানো হয়েছে')
        }
      } else {
        setError(response.message || 'রিপ্লাই পাঠাতে ব্যর্থ হয়েছে')
      }
    } catch (err: any) {
      if (err.response?.data?.error) {
        setError(err.response.data.error)
      } else if (err.message) {
        setError(err.message)
      } else {
        setError('একটি ত্রুটি ঘটেছে, পরে আবার চেষ্টা করুন')
      }
      console.error('Error sending reply:', err)
    } finally {
      setReplying(false)
    }
  }

  if (loading) {
    return (
      <div className='min-h-screen bg-[#f7f6f3] flex items-center justify-center'>
        <div className='animate-spin rounded-full h-8 w-8 border-2 border-rose-500 border-t-transparent' />
      </div>
    )
  }

  if (!ticket) {
    return (
      <div className='min-h-screen bg-[#f7f6f3] py-6 px-4'>
        <div className='max-w-2xl mx-auto text-center'>
          <div className='bg-white rounded-2xl p-8 shadow-sm'>
            <p className='text-rose-500 mb-4'>{error || 'টিকেট পাওয়া যায়নি'}</p>
            <button
              onClick={() => navigate('/support-tickets')}
              className='px-5 py-2.5 bg-rose-500 text-white rounded-xl hover:bg-rose-600 transition-all'
            >
              টিকেট লিস্টে ফিরুন
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-[#f7f6f3] py-6 px-4 sm:px-6 lg:px-8'>
      {previewAttachment && (
        <AttachmentPreviewModal
          attachmentUrl={previewAttachment}
          onClose={() => setPreviewAttachment(null)}
        />
      )}

      <div className='max-w-4xl mx-auto'>
        {/* Back Button */}
        <motion.button
          initial='hidden'
          animate='visible'
          variants={fadeUp}
          onClick={() => navigate('/support-tickets')}
          className='flex items-center gap-2 text-gray-500 hover:text-rose-500 transition-colors mb-4 group'
        >
          <FaArrowLeft className='h-4 w-4 group-hover:-translate-x-0.5 transition-transform' />
          <span className='text-sm'>সব টিকেট</span>
        </motion.button>

        {/* Ticket Header Card */}
        <motion.div
          initial='hidden'
          animate='visible'
          variants={fadeUp}
          className='bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6'
        >
          <div className='bg-gradient-to-r from-[#1a1a2e] to-[#16213e] px-5 py-4'>
            <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3'>
              <div>
                <p className='text-white/50 text-xs mb-1'>টিকেট #{ticket.ticketId.slice(0, 8)}</p>
                <h2 className='text-white font-semibold text-lg'>{ticket.subject}</h2>
              </div>
              <div className='flex gap-2'>
                <TicketStatusBadge status={ticket.status} />
                <TicketPriorityBadge priority={ticket.priority} />
              </div>
            </div>
          </div>
          <div className='p-5'>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm'>
              <div className='flex items-center gap-2'>
                <span className='text-gray-400'>তারিখ:</span>
                <span className='text-gray-700'>{formatDateTime(ticket.createdAt)}</span>
              </div>
              {ticket.orderId && (
                <div className='flex items-center gap-2'>
                  <span className='text-gray-400'>অর্ডার আইডি:</span>
                  <span className='text-gray-700'>#{ticket.orderId}</span>
                </div>
              )}
              {ticket.shopName && (
                <div className='flex items-center gap-2'>
                  <span className='text-gray-400'>দোকান:</span>
                  <span className='text-gray-700'>{ticket.shopName}</span>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Messages Section */}
        <div className='bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6'>
          <div className='p-5 border-b border-gray-100'>
            <h3 className='font-semibold text-[#1a1a2e]'>বার্তা</h3>
          </div>

          <div className='p-5 space-y-4 max-h-[50vh] overflow-y-auto'>
            {ticket.messages.map((message, idx) => {
              const isSeller = message.senderType === 'SELLER'
              const isSystem = message.senderType === 'SYSTEM'
              return (
                <motion.div
                  key={message.messageId}
                  initial='hidden'
                  animate='visible'
                  variants={messageAnimation}
                  transition={{ delay: idx * 0.05 }}
                  className={`flex ${isSeller ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] sm:max-w-[70%] rounded-2xl p-4 ${
                      isSeller
                        ? 'bg-rose-500 text-white rounded-br-none'
                        : isSystem
                          ? 'bg-gray-100 text-gray-800 rounded-bl-none'
                          : 'bg-blue-50 text-gray-800 rounded-bl-none'
                    }`}
                  >
                    <div className='flex items-center gap-2 mb-2 text-xs'>
                      <span className='font-medium'>{isSeller ? 'আপনি' : message.senderName}</span>
                      {isSystem && (
                        <span className='bg-blue-200 text-blue-700 px-1.5 py-0.5 rounded-full text-[10px]'>
                          অ্যাডমিন
                        </span>
                      )}
                      <span className={isSeller ? 'text-white/50' : 'text-gray-400'}>
                        {formatDateTime(message.createdAt)}
                      </span>
                    </div>
                    <p className='text-sm whitespace-pre-line break-words'>{message.content}</p>

                    {message.attachments.length > 0 && (
                      <div className='mt-3 flex flex-wrap gap-2'>
                        {message.attachments.map((url, idx) => (
                          <button
                            key={idx}
                            onClick={() => setPreviewAttachment(url)}
                            className='relative group'
                          >
                            <img
                              src={url}
                              alt='Attachment'
                              className='h-14 w-14 object-cover rounded-lg border border-white/20 hover:opacity-90 transition-opacity'
                            />
                            <div className='absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 rounded-lg flex items-center justify-center transition-opacity'>
                              <FaImage className='h-4 w-4 text-white' />
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )
            })}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Reply Form */}
        {ticket.status !== 'CLOSED' && (
          <motion.div
            initial='hidden'
            animate='visible'
            variants={fadeUp}
            className='bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden'
          >
            <div className='p-5 border-b border-gray-100'>
              <h3 className='font-semibold text-[#1a1a2e]'>জবাব দিন</h3>
            </div>

            <form onSubmit={handleReplySubmit} className='p-5 space-y-4'>
              <textarea
                rows={3}
                value={replyMessage}
                onChange={e => setReplyMessage(e.target.value)}
                className='w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400 transition-all resize-none'
                placeholder='আপনার বার্তা লিখুন...'
              />

              {/* Attachment Section */}
              <div>
                <div className='flex items-center gap-3'>
                  <button
                    type='button'
                    onClick={() => fileInputRef.current?.click()}
                    className='inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-gray-600 text-sm hover:bg-gray-50 transition-colors'
                  >
                    <FaImage className='h-4 w-4' />
                    ছবি সংযুক্ত করুন
                  </button>
                  <input
                    ref={fileInputRef}
                    type='file'
                    multiple
                    onChange={handleFileChange}
                    className='hidden'
                    accept='image/*'
                  />
                  <span className='text-xs text-gray-400'>{attachments.length} / 1টি ছবি</span>
                </div>

                {attachments.length > 0 && (
                  <div className='mt-3 grid grid-cols-2 sm:grid-cols-3 gap-3'>
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
                <div className='p-3 bg-rose-50 rounded-xl border border-rose-100'>
                  <p className='text-rose-600 text-sm'>{error}</p>
                </div>
              )}

              <div className='flex justify-end'>
                <button
                  type='submit'
                  disabled={replying || (!replyMessage.trim() && attachments.length === 0)}
                  className='inline-flex items-center gap-2 px-5 py-2.5 bg-rose-500 text-white rounded-xl font-medium hover:bg-rose-600 transition-all disabled:opacity-50 shadow-lg shadow-rose-500/20'
                >
                  {replying ? (
                    <>
                      <div className='animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent' />
                      পাঠানো হচ্ছে...
                    </>
                  ) : (
                    <>
                      <FaPaperPlane className='h-4 w-4' />
                      জবাব পাঠান
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {ticket.status === 'CLOSED' && (
          <motion.div
            initial='hidden'
            animate='visible'
            variants={fadeUp}
            className='bg-gray-50 rounded-2xl p-5 text-center border border-gray-100'
          >
            <p className='text-gray-500 text-sm'>
              এই টিকেটটি বন্ধ করে দেওয়া হয়েছে। আপনি জবাব দিতে পারবেন না।
            </p>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default SupportTicketDetailPage
