import { FaEnvelope, FaFacebook, FaPhone, FaWhatsapp } from 'react-icons/fa'
import { MdSupportAgent } from 'react-icons/md'
import { NavLink } from 'react-router-dom'

const SupportCenter = () => {
  const supportChannels = [
    {
      title: 'হটলাইন নাম্বার',
      icon: <FaPhone className='text-xl md:text-2xl text-blue-600' />,
      details: '09638755704',
      action: 'কল করতে ক্লিক করুন',
      link: 'tel:09638755704',
      bgColor: 'bg-blue-50 hover:bg-blue-100',
    },
    {
      title: 'ফেসবুক পেজ',
      icon: <FaFacebook className='text-xl md:text-2xl text-[#1877F2]' />,
      details: 'আমাদের অফিসিয়াল পেজ',
      action: 'পেজ ভিজিট করুন',
      link: 'https://facebook.com/yourpage',
      bgColor: 'bg-[#1877F2]/10 hover:bg-[#1877F2]/20',
    },
    {
      title: 'ইমেইল সাপোর্ট',
      icon: <FaEnvelope className='text-xl md:text-2xl text-red-600' />,
      details: 'support@shopbdresellerjobs.shop',
      action: 'ইমেইল পাঠান',
      link: 'mailto:support@shopbdresellerjobs.shop',
      bgColor: 'bg-red-50 hover:bg-red-100',
    },
    {
      title: 'হোয়াটসঅ্যাপ গ্রুপ',
      icon: <FaWhatsapp className='text-xl md:text-2xl text-green-600' />,
      details: 'সেলার্স কমিউনিটি',
      action: 'জয়েন করুন',
      link: 'https://chat.whatsapp.com/Gs5lCd3OBDM69bnv0h8Jc0?mode=ac_t',
      bgColor: 'bg-green-50 hover:bg-green-100',
    },
  ]

  return (
    <div className='bg-gradient-to-b from-gray-50 to-white p-4 md:p-8 min-h-screen'>
      <div className='max-w-6xl mx-auto'>
        {/* Header Section with improved styling */}
        <div className='flex flex-col md:flex-row items-center gap-4 md:gap-6 mb-8 md:mb-10 p-4 bg-white rounded-lg shadow-sm'>
          <div className='p-3 bg-indigo-100 rounded-full'>
            <MdSupportAgent className='text-3xl md:text-4xl text-indigo-600' />
          </div>
          <div className='text-center md:text-left'>
            <h1 className='text-xl md:text-3xl font-bold text-gray-800 mb-1'>সাপোর্ট সেন্টার</h1>
            <p className='text-sm md:text-base text-gray-600 max-w-2xl'>
              যেকোনো সমস্যা বা প্রশ্নের জন্য আমাদের সাথে যোগাযোগ করুন নিচের মাধ্যমগুলোতে
            </p>
          </div>
        </div>

        {/* Support Channels Grid with improved responsiveness */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5'>
          {supportChannels.map((channel, index) => (
            <NavLink
              key={index}
              to={channel.link}
              target='_blank'
              rel='noopener noreferrer'
              className={`${channel.bgColor} rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-4 md:p-5 border border-gray-100 hover:border-indigo-200 group`}
            >
              <div className='flex items-start gap-3 md:gap-4'>
                <div className='p-2 md:p-3 rounded-full bg-white shadow-xs'>{channel.icon}</div>
                <div>
                  <h3 className='text-sm md:text-base font-semibold text-gray-800'>
                    {channel.title}
                  </h3>
                  <p className='text-xs md:text-sm text-gray-600 mt-1'>{channel.details}</p>
                </div>
              </div>
              <div className='mt-3 md:mt-4 flex justify-end'>
                <span className='inline-flex items-center text-indigo-600 text-xs md:text-sm font-medium group-hover:text-indigo-800 transition-colors'>
                  {channel.action}
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    className='h-3 w-3 md:h-4 md:w-4 ml-1'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M9 5l7 7-7 7'
                    />
                  </svg>
                </span>
              </div>
            </NavLink>
          ))}
        </div>

        {/* Additional Support Info */}
        <div className='mt-8 md:mt-12 bg-white rounded-lg shadow-sm p-5 md:p-6'>
          <h2 className='text-lg md:text-xl font-semibold text-gray-800 mb-3 md:mb-4'>
            সাপোর্ট সময়সূচী
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-sm md:text-base'>
            <div>
              <p className='text-gray-600'>
                <span className='font-medium text-gray-800'>সাপোর্ট সময়:</span> সকাল ৯টা - রাত ১০টা
              </p>
              <p className='text-gray-600'>
                <span className='font-medium text-gray-800'>বন্ধের দিন:</span> শুক্রবার
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SupportCenter
