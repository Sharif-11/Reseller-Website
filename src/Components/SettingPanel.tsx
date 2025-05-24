import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { FiBell, FiServer, FiSettings, FiUsers, FiX } from 'react-icons/fi'
import AnnouncementSetting from './AdminAnnouncement'
import CommissionTable from './CommisionTable'

// 1. Announcement Component

// 2. Main Settings Panel
const SettingsPanel = () => {
  const [activeSetting, setActiveSetting] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const settings = [
    { id: 'announcement', name: 'ঘোষণা', icon: <FiBell /> },
    { id: 'commission', name: 'কমিশন', icon: <FiSettings /> },
    { id: 'user', name: 'ব্যবহারকারী', icon: <FiUsers /> },
    { id: 'system', name: 'সিস্টেম', icon: <FiServer /> },
  ]

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Mobile Header */}
      <div className='md:hidden bg-white shadow-sm p-4 flex justify-between items-center'>
        <div className='flex items-center'>
          <FiSettings className='text-indigo-600 mr-2 text-xl' />
          <h1 className='text-xl font-bold text-gray-800'>সেটিংস</h1>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className='p-2 rounded-lg bg-gray-100 hover:bg-gray-200'
        >
          {mobileMenuOpen ? <FiX /> : <FiSettings />}
        </button>
      </div>

      <div className='flex flex-col md:flex-row'>
        {/* Sidebar - Mobile */}
        <AnimatePresence>
          {(mobileMenuOpen || !mobileMenuOpen) && (
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: mobileMenuOpen ? 0 : -300 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className='fixed md:hidden z-10 w-64 h-full bg-white shadow-lg'
            >
              <div className='p-4 border-b'>
                <h2 className='text-lg font-semibold'>সেটিংস মেনু</h2>
              </div>
              <nav className='p-2 space-y-1'>
                {settings.map(setting => (
                  <button
                    key={setting.id}
                    onClick={() => {
                      setActiveSetting(setting.id)
                      setMobileMenuOpen(false)
                    }}
                    className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-2 ${
                      activeSetting === setting.id
                        ? 'bg-indigo-50 text-indigo-600'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    {setting.icon} {setting.name}
                  </button>
                ))}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sidebar - Desktop */}
        <div className='hidden md:block w-64 bg-white shadow-md p-4 h-screen sticky top-0'>
          <div className='mb-6'>
            <h1 className='text-xl font-bold text-gray-800 flex items-center gap-2'>
              <FiSettings className='text-indigo-600' /> সেটিংস প্যানেল
            </h1>
          </div>
          <nav className='space-y-1'>
            {settings.map(setting => (
              <button
                key={setting.id}
                onClick={() => setActiveSetting(setting.id)}
                className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-2 transition-colors ${
                  activeSetting === setting.id
                    ? 'bg-indigo-50 text-indigo-600 font-medium'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <span className='text-lg'>{setting.icon}</span>
                {setting.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <main className='flex-1 p-4 md:p-6'>
          {activeSetting === 'announcement' ? (
            <AnnouncementSetting />
          ) : activeSetting === 'commission' ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className='bg-white rounded-xl shadow-sm p-6 text-center'
            >
              <CommissionTable />
            </motion.div>
          ) : activeSetting === 'user' ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className='bg-white rounded-xl shadow-sm p-6 text-center'
            >
              <div className='text-gray-400 mb-4 text-5xl'>
                {settings.find(s => s.id === activeSetting)?.icon}
              </div>
              <h3 className='text-xl font-medium text-gray-700 mb-2'>
                {settings.find(s => s.id === activeSetting)?.name} সেটিংস
              </h3>
              <p className='text-gray-500'>ব্যবহারকারী সেটিংস কনটেন্ট এখানে আসবে</p>
            </motion.div>
          ) : activeSetting === 'system' ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className='bg-white rounded-xl shadow-sm p-6 text-center'
            >
              <div className='text-gray-400 mb-4 text-5xl'>
                {settings.find(s => s.id === activeSetting)?.icon}
              </div>
              <h3 className='text-xl font-medium text-gray-700 mb-2'>
                {settings.find(s => s.id === activeSetting)?.name} সেটিংস
              </h3>
              <p className='text-gray-500'>সিস্টেম সেটিংস কনটেন্ট এখানে আসবে</p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className='bg-white rounded-xl shadow-sm p-6 text-center'
            >
              <FiSettings className='mx-auto text-5xl text-gray-300 mb-4' />
              <h3 className='text-xl font-medium text-gray-700'>সেটিংস প্যানেল</h3>
              <p className='text-gray-500'>বাম থেকে একটি সেটিংস নির্বাচন করুন</p>
            </motion.div>
          )}
        </main>
      </div>
    </div>
  )
}

export default SettingsPanel
