import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { FiBell, FiPlus, FiSave, FiTrash2, FiX } from 'react-icons/fi'
import { getAllAnnouncements, updateAnnouncements } from '../Api/announcements.api'

const AnnouncementSetting = () => {
  const [announcements, setAnnouncements] = useState<string[]>([])
  const [newAnnouncement, setNewAnnouncement] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetchAnnouncements()
  }, [])

  const fetchAnnouncements = async () => {
    try {
      setLoading(true)
      setError('')
      setSuccess('')
      const { success, data, message } = await getAllAnnouncements()
      if (!success) {
        setError(message || 'ঘোষণাগুলি লোড করতে ব্যর্থ হয়েছে')
        return
      }
      setAnnouncements(data || [])
    } catch (err) {
      setError('ঘোষণাগুলি লোড করতে ব্যর্থ হয়েছে')
    } finally {
      setLoading(false)
    }
  }

  const handleAddAnnouncement = () => {
    if (!newAnnouncement.trim()) {
      setError('ঘোষণা ফাঁকা রাখা যাবে না')
      return
    }
    setAnnouncements([...announcements, newAnnouncement])
    setNewAnnouncement('')
  }

  const handleDelete = (index: number) => {
    setAnnouncements(announcements.filter((_, i) => i !== index))
  }

  const handleSave = async () => {
    try {
      setLoading(true)
      setError('')
      setSuccess('')
      const { success, message } = await updateAnnouncements(announcements)
      if (!success) {
        setError(message || 'সংরক্ষণ ব্যর্থ হয়েছে')
        return
      }
      setSuccess('ঘোষণাগুলি সফলভাবে সংরক্ষিত হয়েছে')
    } catch (err) {
      setError('সংরক্ষণ ব্যর্থ হয়েছে')
    } finally {
      setLoading(false)
    }
  }

  const handleClearAll = () => {
    if (window.confirm('সব ঘোষণা মুছে ফেলবেন?')) {
      setAnnouncements([])
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className='bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 shadow-lg'
    >
      <div className='flex items-center mb-4'>
        <FiBell className='text-indigo-600 mr-2 text-xl' />
        <h2 className='text-xs font-bold text-gray-800'>
          বিক্রেতাদের জন্য নতুন কোন ঘোষণা থাকলে এখানে তা লিখুন। বিক্রেতারা তাদের ড্যাশবোর্ডে ঘোষণা
          দেখতে পারবে
        </h2>
      </div>

      {/* Current Announcements */}
      <div className='mb-6 space-y-2 max-h-60 overflow-y-auto pr-2'>
        <AnimatePresence>
          {announcements.map((announcement, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className='flex justify-between items-center bg-white p-3 rounded-lg shadow-sm'
            >
              <p className='text-gray-700 text-xs truncate'>{announcement}</p>
              <button
                onClick={() => handleDelete(index)}
                className='text-red-500 hover:text-red-700 p-1'
              >
                <FiX />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>

        {announcements.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className='text-center py-4 text-gray-500 text-xs'
          >
            কোন ঘোষণা নেই
          </motion.div>
        )}
      </div>

      {/* Add New */}
      <div className='mb-6 relative'>
        <div className='flex flex-col gap-2 items-stretch'>
          <textarea
            value={newAnnouncement}
            onChange={e => setNewAnnouncement(e.target.value)}
            placeholder='নতুন ঘোষণা লিখুন...'
            className='w-full h-20 px-3 py-2 pr-12 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-xs resize-y'
            rows={3}
            onKeyDown={e =>
              e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleAddAnnouncement())
            }
          />
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleAddAnnouncement}
            className='absolute bottom-3 right-3 bg-indigo-600 text-white h-8 w-8 rounded-full hover:bg-indigo-700 flex items-center justify-center shadow-md'
          >
            <FiPlus className='text-white' />
          </motion.button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className='flex flex-col sm:flex-row gap-2'>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleClearAll}
          disabled={announcements.length === 0}
          className='bg-red-100 text-red-600 px-4 py-2 rounded-lg hover:bg-red-200 disabled:opacity-50 flex items-center justify-center gap-2'
        >
          <FiTrash2 /> সব মুছুন
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSave}
          disabled={loading}
          className='bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex-1 flex items-center justify-center gap-2'
        >
          {loading ? (
            ' সেভ  হচ্ছে...'
          ) : (
            <>
              <FiSave /> সেভ করুন
            </>
          )}
        </motion.button>
      </div>

      {/* Status Messages */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className='mt-4 p-3 bg-red-100 text-red-700 rounded-lg'
          >
            {error}
          </motion.div>
        )}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className='mt-4 p-3 bg-green-100 text-green-700 rounded-lg'
          >
            {success}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
export default AnnouncementSetting
