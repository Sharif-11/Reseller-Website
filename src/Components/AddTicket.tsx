// NewSupportTicketPage.tsx
import { ChangeEvent, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import supportTicketApi from '../Api/support-ticket.api'

const NewSupportTicketPage = () => {
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [formData, setFormData] = useState({
    subject: '',
    category: 'ACCOUNT',
    priority: 'MEDIUM',
    message: '',
    orderId: '',
    paymentId: '',
    productId: '',
  })
  const [attachments, setAttachments] = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)
      if (attachments.length + newFiles.length > 2) {
        setError('আপনি সর্বোচ্চ ২টি ফাইল আপলোড করতে পারবেন')
        return
      }

      // Check each file size (max 1MB)
      for (const file of newFiles) {
        if (file.size > 1 * 1024 * 1024) {
          setError('প্রতিটি ফাইলের আকার ১MB এর কম হতে হবে')
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { success, message, data } = await supportTicketApi.createTicket(
        {
          subject: formData.subject,
          category: formData.category,
          priority: formData.priority,
          message: formData.message,
          orderId: formData.orderId || undefined,
          paymentId: formData.paymentId || undefined,
          productId: formData.productId || undefined,
        },
        attachments
      )

      if (success) {
        setFormData({
          subject: '',
          category: 'ACCOUNT',
          priority: 'MEDIUM',
          message: '',
          orderId: '',
          paymentId: '',
          productId: '',
        })
        setAttachments([])
        navigate(`/support-tickets/${data?.ticketId}`)
      } else {
        setError(message || 'টিকিট তৈরি করতে সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।')
      }
    } catch (err) {
      setError('টিকিট তৈরি করতে সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const ImagePreview = ({ file, onRemove }: { file: File; onRemove: () => void }) => {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)

    const reader = new FileReader()
    reader.onload = () => {
      setPreviewUrl(reader.result as string)
    }
    reader.onerror = () => {
      setError('ফাইল প্রিভিউ করতে সমস্যা হয়েছে।')
    }
    reader.readAsDataURL(file)

    return (
      <div className='relative group'>
        {previewUrl ? (
          <div className='relative'>
            <img
              src={previewUrl}
              alt={file.name}
              className='w-full h-24 sm:h-32 object-cover rounded-md border border-gray-200'
            />
            <button
              type='button'
              onClick={onRemove}
              className='absolute top-1 right-1 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs transition-colors duration-200 opacity-80 group-hover:opacity-100 sm:opacity-0 sm:group-hover:opacity-100'
              aria-label='ফাইল মুছে ফেলুন'
            >
              <svg
                xmlns='http://www.w3.org/2000/svg'
                className='h-4 w-4'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M6 18L18 6M6 6l12 12'
                />
              </svg>
            </button>
            <div className='absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 rounded-b-md truncate'>
              {file.name}
            </div>
          </div>
        ) : (
          <div className='flex items-center justify-center w-full h-24 sm:h-32 border border-gray-200 rounded-md'>
            {error ? (
              <p className='text-red-500 text-xs text-center px-2'>{error}</p>
            ) : (
              <p className='text-gray-400 text-xs text-center px-2'>ফাইল প্রিভিউ লোড হচ্ছে...</p>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='container mx-auto px-4 py-4 sm:py-6 max-w-4xl'>
        <div className='flex justify-between items-center mb-4 sm:mb-6'>
          <h1 className='text-xl sm:text-2xl font-bold text-gray-800'>নতুন সাপোর্ট টিকিট</h1>
          <button
            onClick={() => navigate('/support-tickets')}
            className='text-gray-600 hover:text-gray-800 p-2 rounded-md hover:bg-gray-100'
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='h-5 w-5 sm:h-6 sm:w-6'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M6 18L18 6M6 6l12 12'
              />
            </svg>
          </button>
        </div>

        <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6'>
          {error && (
            <div className='mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm'>{error}</div>
          )}

          <form onSubmit={handleSubmit} className='space-y-4 sm:space-y-6'>
            <div>
              <label htmlFor='subject' className='block text-sm font-medium text-gray-700 mb-1'>
                বিষয় <span className='text-red-500'>*</span>
              </label>
              <input
                type='text'
                id='subject'
                name='subject'
                value={formData.subject}
                onChange={handleChange}
                required
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm'
                placeholder='আপনার সমস্যার সংক্ষিপ্ত বিবরণ দিন'
              />
            </div>

            <div className='space-y-4 sm:space-y-0 sm:grid sm:grid-cols-3 sm:gap-4'>
              <div>
                <label htmlFor='category' className='block text-sm font-medium text-gray-700 mb-1'>
                  বিভাগ <span className='text-red-500'>*</span>
                </label>
                <select
                  id='category'
                  name='category'
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm'
                >
                  <option value='ACCOUNT'>অ্যাকাউন্ট</option>
                  <option value='PAYMENT'>পেমেন্ট</option>
                  <option value='ORDER'>অর্ডার</option>
                  <option value='PRODUCT'>প্রোডাক্ট</option>
                  <option value='WITHDRAWAL'>উত্তোলন</option>
                  <option value='TECHNICAL'>টেকনিক্যাল</option>
                  <option value='OTHER'>অন্যান্য</option>
                </select>
              </div>

              <div>
                <label htmlFor='priority' className='block text-sm font-medium text-gray-700 mb-1'>
                  গুরুত্ব
                </label>
                <select
                  id='priority'
                  name='priority'
                  value={formData.priority}
                  onChange={handleChange}
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm'
                >
                  <option value='LOW'>নিম্ন</option>
                  <option value='MEDIUM'>মধ্যম</option>
                  <option value='HIGH'>উচ্চ</option>
                  <option value='CRITICAL'>জরুরী</option>
                </select>
              </div>

              <div>
                <label htmlFor='orderId' className='block text-sm font-medium text-gray-700 mb-1'>
                  অর্ডার আইডি (যদি থাকে)
                </label>
                <input
                  type='text'
                  id='orderId'
                  name='orderId'
                  value={formData.orderId}
                  onChange={handleChange}
                  className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm'
                  placeholder='ORD-123456'
                />
              </div>
            </div>

            <div>
              <label htmlFor='message' className='block text-sm font-medium text-gray-700 mb-1'>
                বিস্তারিত বিবরণ <span className='text-red-500'>*</span>
              </label>
              <textarea
                id='message'
                name='message'
                value={formData.message}
                onChange={handleChange}
                required
                rows={4}
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm resize-none'
                placeholder='আপনার সমস্যা সম্পর্কে বিস্তারিত লিখুন...'
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                সংযুক্তি (সর্বোচ্চ ২টি, প্রতিটি ১ MB পর্যন্ত)
              </label>

              <div className='flex flex-col sm:flex-row sm:items-center gap-2'>
                <button
                  type='button'
                  onClick={() => fileInputRef.current?.click()}
                  className='inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200'
                >
                  <svg
                    className='-ml-1 mr-2 h-4 w-4 text-gray-500'
                    xmlns='http://www.w3.org/2000/svg'
                    viewBox='0 0 20 20'
                    fill='currentColor'
                    aria-hidden='true'
                  >
                    <path
                      fillRule='evenodd'
                      d='M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z'
                      clipRule='evenodd'
                    />
                  </svg>
                  ফাইল নির্বাচন করুন
                </button>

                <input
                  ref={fileInputRef}
                  type='file'
                  multiple
                  onChange={handleFileChange}
                  className='hidden'
                  accept='image/*,.pdf,.doc,.docx,.xls,.xlsx'
                />

                <p className='text-sm text-gray-500'>{attachments.length} / 2 ফাইল নির্বাচিত</p>
              </div>

              {attachments.length > 0 && (
                <div className='mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3'>
                  {attachments.map((file, index) => (
                    <ImagePreview
                      key={index}
                      file={file}
                      onRemove={() => removeAttachment(index)}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className='flex flex-col sm:flex-row sm:justify-end gap-3 pt-4 border-t border-gray-200'>
              <button
                type='button'
                onClick={() => navigate('/support-tickets')}
                className='w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200'
              >
                বাতিল করুন
              </button>

              <button
                type='submit'
                disabled={loading}
                className='w-full sm:w-auto px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed transition-colors duration-200'
              >
                {loading ? (
                  <div className='flex items-center justify-center'>
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
                      />
                      <path
                        className='opacity-75'
                        fill='currentColor'
                        d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                      />
                    </svg>
                    প্রক্রিয়াধীন...
                  </div>
                ) : (
                  'টিকিট তৈরি করুন'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default NewSupportTicketPage
