import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import {
  FaBook,
  FaBoxOpen,
  FaBullhorn,
  FaCoins,
  FaExclamationTriangle,
  FaHeadset,
  FaListAlt,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaQuestionCircle,
  FaShieldAlt,
  FaTicketAlt,
  FaWallet,
} from 'react-icons/fa'
import { NavLink, useNavigate } from 'react-router-dom'
import { getAllAnnouncements } from '../Api/announcements.api'
import { useAuth } from '../Hooks/useAuth'

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

const SellerHomeDashboard = () => {
  const navigate = useNavigate()
  const [announcements, setAnnouncements] = useState<string[]>([])
  const { user } = useAuth()
  const currentBalance = user?.balance || 0

  const fetchAnnouncements = async () => {
    const { success, data } = await getAllAnnouncements()
    if (success) {
      setAnnouncements(data || [])
    } else {
      console.error('Failed to fetch announcements')
    }
  }

  useEffect(() => {
    fetchAnnouncements()
  }, [])

  // All links blended together – no separation between active and upcoming
  const quickLinks: { title: string; icon: JSX.Element; url: string; upcoming?: boolean }[] = [
    {
      title: 'সকল প্রোডাক্টস',
      icon: <FaBoxOpen />,
      url: '/products#products',
    },
    {
      title: 'সকল ক্যাটাগরি',
      icon: <FaListAlt />,
      url: '/categories',
    },
    {
      title: 'সেলস গাইডলাইন',
      icon: <FaBook />,
      url: '/selling-guide',
    },
    {
      title: 'ব্যালেন্স স্টেটমেন্ট',
      icon: <FaMoneyBillWave />,
      url: '/balance-statement',
    },
    {
      title: 'সাপোর্ট সেন্টার',
      icon: <FaHeadset />,
      url: '/support',
    },
    {
      title: 'সাধারণ প্রশ্ন',
      icon: <FaQuestionCircle />,
      url: '/faq',
    },
    {
      title: 'প্যাসিভ ইনকাম',
      icon: <FaCoins />,
      url: '/passive-income',
      upcoming: true,
    },
    {
      title: 'সেলার ইনকাম',
      icon: <FaBoxOpen />,
      url: '/seller-income',
      upcoming: true,
    },
    {
      title: 'ফ্রড চেকার',
      icon: <FaShieldAlt />,
      url: '/check-fraud',
    },
    {
      title: 'পার্সেল ট্র্যাকিং',
      icon: <FaMapMarkerAlt />,
      url: '/track-parcel',
      upcoming: true,
    },
    {
      title: 'সাপোর্ট টিকেট',
      icon: <FaTicketAlt />,
      url: '/support-tickets',
    },
  ]

  return (
    <div className='min-h-screen bg-[#f7f6f3]'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8'>
        {/* Welcome Section with Balance Card */}
        <motion.div initial='hidden' animate='visible' variants={staggerContainer} className='mb-8'>
          <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4'>
            <motion.div variants={fadeUp}>
              <h1 className='text-2xl md:text-3xl font-bold text-[#1a1a2e]'>
                স্বাগতম, {user?.name?.split(' ')[0] || 'সেলার'}!
              </h1>
              <p className='text-gray-500 text-sm mt-1'>
                আপনার ড্যাশবোর্ডে স্বাগতম। আজকের আপডেট ও কার্যক্রম দেখুন।
              </p>
            </motion.div>

            {/* Balance Card */}
            <motion.div
              variants={fadeUp}
              className='bg-gradient-to-r from-[#1a1a2e] to-[#16213e] rounded-2xl p-4 shadow-lg'
            >
              <div className='flex items-center gap-3'>
                <div className='h-10 w-10 rounded-xl bg-rose-500/20 flex items-center justify-center'>
                  <FaWallet className='h-5 w-5 text-rose-400' />
                </div>
                <div>
                  <p className='text-white/50 text-xs uppercase tracking-wider'>
                    বর্তমান ব্যালেন্স
                  </p>
                  <p className='text-white text-xl font-bold'>
                    ৳{currentBalance.toLocaleString('bn-BD')}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Announcements Section */}
        {announcements.length > 0 && (
          <motion.div initial='hidden' animate='visible' variants={fadeUp} className='mb-8'>
            <div className='bg-gradient-to-r from-rose-50 to-amber-50 rounded-2xl border border-rose-100 overflow-hidden shadow-sm'>
              <div className='px-5 py-3 border-b border-rose-100 bg-white/50 flex items-center gap-2'>
                <FaBullhorn className='h-4 w-4 text-rose-500' />
                <h3 className='font-semibold text-[#1a1a2e] text-sm uppercase tracking-wider'>
                  নোটিশ বোর্ড
                </h3>
              </div>
              <div className='max-h-48 overflow-y-auto divide-y divide-rose-100'>
                {announcements.map((announcement, index) => (
                  <div key={index} className='px-5 py-3 hover:bg-white/50 transition-colors'>
                    <div className='flex items-start gap-3'>
                      <div className='h-1.5 w-1.5 rounded-full bg-rose-400 mt-2 flex-shrink-0' />
                      <p className='text-sm text-gray-700 flex-1'>{announcement}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Alerts Section */}
        <motion.div
          initial='hidden'
          animate='visible'
          variants={staggerContainer}
          className='space-y-4 mb-8'
        >
          {/* Due Payment Alert */}
          {currentBalance < 0 && (
            <motion.div
              variants={fadeUp}
              className='bg-red-50 border-l-4 border-red-500 rounded-r-xl p-4 shadow-sm'
            >
              <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3'>
                <div className='flex items-start gap-3'>
                  <FaExclamationTriangle className='h-5 w-5 text-red-500 flex-shrink-0 mt-0.5' />
                  <div>
                    <p className='text-sm font-semibold text-red-700'>
                      আপনার অ্যাকাউন্টে বকেয়া রয়েছে
                    </p>
                    <p className='text-xs text-red-600 mt-0.5'>
                      পরিমাণ: ৳{Math.abs(currentBalance).toLocaleString('bn-BD')}
                    </p>
                  </div>
                </div>
                <NavLink
                  to='/pay-due'
                  className='px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-xl hover:bg-red-600 transition-all text-center shadow-sm'
                >
                  পেমেন্ট করুন
                </NavLink>
              </div>
            </motion.div>
          )}

          {/* Fraud Check Warning */}
          <motion.div
            variants={fadeUp}
            className='bg-amber-50 border-l-4 border-amber-500 rounded-r-xl p-4 shadow-sm'
          >
            <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3'>
              <div className='flex items-start gap-3'>
                <FaShieldAlt className='h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5' />
                <div>
                  <p className='text-sm font-semibold text-amber-700'>
                    জালিয়াতি এড়াতে সতর্ক থাকুন
                  </p>
                  <p className='text-xs text-amber-600 mt-0.5'>
                    অর্ডার প্লেস করার আগে গ্রাহকের অর্ডার ইতিহাস যাচাই করুন
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate('/check-fraud')}
                className='px-4 py-2 bg-amber-500 text-white text-sm font-medium rounded-xl hover:bg-amber-600 transition-all text-center shadow-sm'
              >
                ফ্রড চেক করুন
              </button>
            </div>
          </motion.div>
        </motion.div>

        {/* Quick Links Grid – No heading, all links blended */}
        <motion.div
          initial='hidden'
          animate='visible'
          variants={staggerContainer}
          className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4'
        >
          {quickLinks.map((link, index) => (
            <motion.div
              key={index}
              variants={fadeUp}
              whileHover={{ y: -4 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              className='relative'
            >
              {link.upcoming ? (
                // Upcoming link – non-clickable, with badge
                <div className='bg-white/70 rounded-2xl p-4 text-center border border-gray-100 opacity-80 cursor-default'>
                  <span className='absolute -top-2 -right-2 bg-amber-100 text-amber-700 text-[10px] font-semibold px-2 py-0.5 rounded-full shadow-sm'>
                    শীঘ্রই
                  </span>
                  <div className='flex justify-center mb-3'>
                    <div className='h-12 w-12 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400'>
                      {link.icon}
                    </div>
                  </div>
                  <h3 className='text-xs font-medium text-gray-500'>{link.title}</h3>
                </div>
              ) : (
                // Active link – clickable
                <NavLink
                  to={link.url}
                  className='group block bg-white rounded-2xl p-4 text-center border border-gray-100 hover:border-rose-200 hover:shadow-lg transition-all duration-300'
                >
                  <div className='flex justify-center mb-3'>
                    <div className='h-12 w-12 rounded-xl bg-gradient-to-br from-rose-50 to-rose-100 flex items-center justify-center text-rose-500 group-hover:scale-110 transition-transform duration-300'>
                      {link.icon}
                    </div>
                  </div>
                  <h3 className='text-xs font-medium text-gray-800 group-hover:text-rose-600 transition-colors'>
                    {link.title}
                  </h3>
                </NavLink>
              )}
            </motion.div>
          ))}
        </motion.div>

        {/* Additional Info Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className='mt-10 pt-6 border-t border-gray-200 text-center'
        >
          <p className='text-xs text-gray-400'>
            কোনো সমস্যা হলে আমাদের{' '}
            <NavLink to='/support-tickets' className='text-rose-500 hover:underline'>
              সাপোর্ট সেন্টার
            </NavLink>{' '}
            এ যোগাযোগ করুন
          </p>
        </motion.div>
      </div>
    </div>
  )
}

export default SellerHomeDashboard
