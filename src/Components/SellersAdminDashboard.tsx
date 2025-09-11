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
} from 'react-icons/fa'
import { NavLink, useNavigate } from 'react-router-dom'
import { getAllAnnouncements } from '../Api/announcements.api'
import { useAuth } from '../Hooks/useAuth'

const SellerHomeDashboard = () => {
  const navigate = useNavigate()
  // Sample balance data (negative for demo)
  const [announcements, setAnnouncements] = useState<string[]>()
  const { user } = useAuth()
  const currentBalance = user?.balance || 0 // Example balance, replace with actual data

  const fetchAnnouncements = async () => {
    const { success, data } = await getAllAnnouncements()
    // const test = await orderApi.getAllCustomerOrdersForASeller({ page: 1, limit: 1 })

    if (success) {
      setAnnouncements(data || [])
    } else {
      console.error('Failed to fetch announcements')
    }
  }
  useEffect(() => {
    fetchAnnouncements()
  }, [])

  const quickLinks: { title: string; icon: JSX.Element; url: string; upcoming?: boolean }[] = [
    {
      title: 'সকল প্রোডাক্টস',
      icon: <FaBoxOpen className='text-3xl text-blue-600' />,
      url: '/categories',
    },
    {
      title: 'সকল ক্যাটাগরি',
      icon: <FaListAlt className='text-3xl text-blue-600' />,
      url: '/category-list',
    },
    {
      title: 'সেলস গাইডলাইন',
      icon: <FaBook className='text-3xl text-green-600' />,
      url: '/selling-guide',
    },
    {
      title: 'ব্যালেন্স স্টেটমেন্ট',
      icon: <FaMoneyBillWave className='text-3xl text-purple-600' />,
      url: '/balance-statement',
    },
    {
      title: 'সাপোর্ট সেন্টার',
      icon: <FaHeadset className='text-3xl text-red-600' />,
      url: '/support',
    },

    {
      title: 'সাধারণ প্রশ্ন',
      icon: <FaQuestionCircle className='text-3xl text-indigo-600' />,
      url: '/faq',
    },
    {
      title: 'প্যাসিভ ইনকাম',
      icon: <FaCoins className='text-3xl text-yellow-600' />,
      url: '/passive-income',
      // upcoming: true
    },
    {
      title: 'সেলার ড্যাশবোর্ড',
      icon: <FaBoxOpen className='text-3xl text-blue-600' />,
      url: '/seller-dashboard',
      // upcoming: true,
    },
    {
      title: 'ফ্রড চেকার',
      icon: <FaShieldAlt className='text-3xl text-teal-600' />,
      url: '/check-fraud',
    },
    {
      title: 'পার্সেল ট্র্যাকিং',
      icon: <FaMapMarkerAlt className='text-3xl text-pink-600' />,
      url: '/track-parcel',
      upcoming: true,
    },
    {
      title: 'সাপোর্ট টিকেট',
      icon: <FaTicketAlt className='text-3xl text-orange-600' />,
      url: '/support-tickets',
      // upcoming: true,
    },
  ]

  return (
    <div className='min-h-screen bg-gray-50 p-4 md:p-8'>
      <div className='max-w-6xl mx-auto'>
        {/* Announcement Bar with Moving Text */}
        {/* Announcement Section - Beautiful Static Display */}
        {announcements?.length! > 0 && (
          <div className='bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg mb-4 p-3 shadow-md w-full'>
            <div className='flex items-center mb-2'>
              <FaBullhorn className='text-lg mr-2 flex-shrink-0' />
              <h3 className='font-semibold text-sm'>নোটিশ বোর্ড</h3>
            </div>
            <div className='w-full max-h-40 overflow-y-auto'>
              {announcements?.map((announcement, index) => (
                <div
                  key={index}
                  className='py-2 flex items-start text-sm border-b border-indigo-400 border-opacity-30 last:border-b-0'
                >
                  <span className='w-2 h-2 bg-white rounded-full mt-2 mr-3 flex-shrink-0'></span>
                  <p className='flex-1'>{announcement}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pay Due Alert (if balance is negative) */}
        {currentBalance < 0 && (
          <div className='bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg'>
            <div className='flex items-start'>
              <div className='flex-shrink-0'>
                <FaExclamationTriangle className='h-5 w-5 text-red-600' />
              </div>
              <div className='ml-3 flex-1'>
                <div className='flex justify-between items-center'>
                  <p className='text-sm text-red-700 font-medium'>
                    আপনার অ্যাকাউন্টে {Math.abs(currentBalance)} টাকা বকেয়া রয়েছে
                  </p>
                  <NavLink
                    to='/pay-due'
                    className='px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors'
                  >
                    পেমেন্ট করুন
                  </NavLink>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Fraud Check Warning */}
        <div className='bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6 rounded-r-lg'>
          <div className='flex items-start'>
            <div className='flex-shrink-0'>
              <FaExclamationTriangle className='h-5 w-5 text-yellow-600' />
            </div>
            <div className='ml-3 flex-1'>
              <div className='flex justify-between items-center'>
                <p className='text-xs text-yellow-700 font-medium'>
                  অর্ডার প্লেস করার আগে জালিয়াতি এড়াতে অনুগ্রহ করে গ্রাহকের অর্ডার ইতিহাস যাচাই
                  করুন।
                </p>
                <button
                  onClick={() => navigate('/check-fraud')}
                  className='px-3 py-1 bg-yellow-600 text-white text-xs rounded-md hover:bg-yellow-700 transition-colors'
                >
                  ফ্রড চেক করুন
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Links Grid - Updated to show 3 columns on mobile */}
        <div className='grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-5 gap-2 md:gap-4'>
          {quickLinks.map((link, index) =>
            link.upcoming ? (
              // Upcoming feature (not clickable)
              <div
                key={index}
                className='bg-white rounded-lg shadow-sm p-2 md:p-4 flex flex-col items-center text-center border border-gray-100 relative opacity-80'
              >
                <span className='absolute top-1 right-1 bg-yellow-100 text-yellow-800 text-[8px] px-1 py-0.5 rounded-full'>
                  শীঘ্রই আসছে
                </span>
                <div className='mb-2 p-2 bg-gray-100 rounded-full'>{link.icon}</div>
                <h3 className='text-xs font-semibold text-gray-800 mb-1 line-clamp-2'>
                  {link.title}
                </h3>
                <span className='mt-1 text-gray-500 text-[10px] font-medium'>শীঘ্রই আসছে</span>
              </div>
            ) : (
              // Available feature (entire box is clickable)
              <NavLink
                key={index}
                to={link.url}
                className='bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 p-2 md:p-4 flex flex-col items-center text-center border border-gray-100 hover:border-blue-200 relative group'
              >
                <div className='mb-2 p-2 bg-blue-50 rounded-full group-hover:bg-blue-100 transition-colors'>
                  {link.icon}
                </div>
                <h3 className='text-xs font-semibold text-gray-800 mb-1 line-clamp-2'>
                  {link.title}
                </h3>
              </NavLink>
            )
          )}
        </div>

        {/* Add your other sections here if needed */}
      </div>

      {/* CSS for marquee animation */}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 20s linear infinite;
          display: inline-block;
        }
      `}</style>
    </div>
  )
}

export default SellerHomeDashboard
