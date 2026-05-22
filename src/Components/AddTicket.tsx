import { motion } from 'framer-motion'
import { ChangeEvent, useRef, useState } from 'react'
import { FaArrowLeft, FaPaperPlane, FaTimes, FaUpload } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import supportTicketApi from '../Api/support-ticket.api'

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

  const categories = [
    { value: 'ACCOUNT', label: 'অ্যাকাউন্ট' },
    { value: 'PAYMENT', label: 'পেমেন্ট' },
    { value: 'ORDER', label: 'অর্ডার' },
    { value: 'PRODUCT', label: 'প্রোডাক্ট' },
    { value: 'WITHDRAWAL', label: 'উত্তোলন' },
    { value: 'TECHNICAL', label: 'টেকনিক্যাল' },
    { value: 'OTHER', label: 'অন্যান্য' },
  ]

  const priorities = [
    { value: 'LOW', label: 'নিম্ন', color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { value: 'MEDIUM', label: 'মধ্যম', color: 'text-blue-600', bg: 'bg-blue-100' },
    { value: 'HIGH', label: 'উচ্চ', color: 'text-amber-600', bg: 'bg-amber-100' },
    { value: 'CRITICAL', label: 'জরুরি', color: 'text-rose-600', bg: 'bg-rose-100' },
  ]

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
        setError('সর্বোচ্চ ২টি ফাইল আপলোড করতে পারবেন')
        return
      }

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
        toast.success('টিকেট সফলভাবে তৈরি হয়েছে')
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

  const getPriorityBadge = (priority: string) => {
    const p = priorities.find(p => p.value === priority) || priorities[1]
    return (
      <span
        className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${p.bg} ${p.color}`}
      >
        {p.label}
      </span>
    )
  }

  const ImagePreview = ({ file, onRemove }: { file: File; onRemove: () => void }) => {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)

    const reader = new FileReader()
    reader.onload = () => {
      setPreviewUrl(reader.result as string)
    }
    reader.readAsDataURL(file)

    return (
      <div className='relative group'>
        {previewUrl ? (
          <div className='relative rounded-xl overflow-hidden border border-gray-100 shadow-sm'>
            <img src={previewUrl} alt={file.name} className='w-full h-24 object-cover' />
            <button
              type='button'
              onClick={onRemove}
              className='absolute top-1 right-1 bg-rose-500 text-white rounded-full p-1 hover:bg-rose-600 transition-colors opacity-80 group-hover:opacity-100'
            >
              <FaTimes className='h-3 w-3' />
            </button>
            <div className='absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-1 truncate'>
              {file.name}
            </div>
          </div>
        ) : (
          <div className='flex items-center justify-center h-24 border border-gray-200 rounded-xl bg-gray-50'>
            <div className='animate-pulse text-gray-400 text-xs'>লোড হচ্ছে...</div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-[#f7f6f3] py-6 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-3xl mx-auto'>
        {/* Header */}
        <motion.div initial='hidden' animate='visible' variants={staggerContainer} className='mb-6'>
          <motion.div variants={fadeUp}>
            <button
              onClick={() => navigate('/support-tickets')}
              className='flex items-center gap-2 text-gray-500 hover:text-rose-500 transition-colors mb-4 group'
            >
              <FaArrowLeft className='h-4 w-4 group-hover:-translate-x-0.5 transition-transform' />
              <span className='text-sm'>সব টিকেট</span>
            </button>
            <div>
              <h1 className='text-2xl md:text-3xl font-bold text-[#1a1a2e]'>নতুন সাপোর্ট টিকেট</h1>
              <p className='text-gray-500 text-sm mt-1'>আপনার সমস্যা সম্পর্কে বিস্তারিত জানান</p>
            </div>
          </motion.div>
        </motion.div>

        {/* Form Card */}
        <motion.div
          variants={fadeUp}
          initial='hidden'
          animate='visible'
          className='bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden'
        >
          <div className='bg-gradient-to-r from-[#1a1a2e] to-[#16213e] px-5 py-4'>
            <h2 className='text-white font-semibold text-lg'>টিকেট তথ্য</h2>
          </div>

          <form onSubmit={handleSubmit} className='p-5 space-y-5'>
            {error && (
              <div className='p-3 bg-rose-50 rounded-xl border border-rose-100'>
                <p className='text-rose-600 text-sm'>{error}</p>
              </div>
            )}

            {/* Subject */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1.5'>
                বিষয় <span className='text-rose-500'>*</span>
              </label>
              <input
                type='text'
                name='subject'
                value={formData.subject}
                onChange={handleChange}
                required
                className='w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400 transition-all'
                placeholder='আপনার সমস্যার সংক্ষিপ্ত বিবরণ দিন'
              />
            </div>

            {/* Category & Priority Row */}
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1.5'>
                  বিভাগ <span className='text-rose-500'>*</span>
                </label>
                <select
                  name='category'
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className='w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400 transition-all'
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1.5'>গুরুত্ব</label>
                <select
                  name='priority'
                  value={formData.priority}
                  onChange={handleChange}
                  className='w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400 transition-all'
                >
                  {priorities.map(p => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
                <div className='mt-1.5 flex justify-end'>{getPriorityBadge(formData.priority)}</div>
              </div>
            </div>

            {/* Order ID (optional) */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1.5'>
                অর্ডার আইডি (যদি থাকে)
              </label>
              <input
                type='text'
                name='orderId'
                value={formData.orderId}
                onChange={handleChange}
                className='w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400 transition-all'
                placeholder='যেমন: ORD-123456'
              />
            </div>

            {/* Message */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1.5'>
                বিস্তারিত বিবরণ <span className='text-rose-500'>*</span>
              </label>
              <textarea
                name='message'
                value={formData.message}
                onChange={handleChange}
                required
                rows={5}
                className='w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400 transition-all resize-none'
                placeholder='আপনার সমস্যা সম্পর্কে বিস্তারিত লিখুন...'
              />
            </div>

            {/* Attachments */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1.5'>
                সংযুক্তি (সর্বোচ্চ ২টি, প্রতিটি ১ MB পর্যন্ত)
              </label>
              <div className='flex flex-col sm:flex-row sm:items-center gap-3'>
                <button
                  type='button'
                  onClick={() => fileInputRef.current?.click()}
                  className='inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm hover:bg-gray-50 transition-colors'
                >
                  <FaUpload className='h-4 w-4' />
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
                <span className='text-xs text-gray-400'>
                  {attachments.length} / ২টি ফাইল নির্বাচিত
                </span>
              </div>

              {attachments.length > 0 && (
                <div className='mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3'>
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

            {/* Actions */}
            <div className='flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-gray-100'>
              <button
                type='button'
                onClick={() => navigate('/support-tickets')}
                className='px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors'
              >
                বাতিল করুন
              </button>
              <button
                type='submit'
                disabled={loading}
                className='inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-rose-500 text-white rounded-xl font-medium hover:bg-rose-600 transition-all disabled:opacity-50 shadow-lg shadow-rose-500/20'
              >
                {loading ? (
                  <>
                    <div className='animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent' />
                    প্রক্রিয়াধীন...
                  </>
                ) : (
                  <>
                    <FaPaperPlane className='h-4 w-4' />
                    টিকেট তৈরি করুন
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  )
}

export default NewSupportTicketPage
