import { motion } from 'framer-motion'
import { FaEnvelope, FaFacebook, FaPhone, FaWhatsapp } from 'react-icons/fa'
import { MdSupportAgent } from 'react-icons/md'
import { NavLink } from 'react-router-dom'

// Animation variants
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
}

const SupportCenter = () => {
  const supportChannels = [
    {
      title: 'হটলাইন নাম্বার',
      icon: <FaPhone className='text-xl md:text-2xl' />,
      details: '09638755704',
      action: 'কল করুন',
      link: 'tel:09638755704',
      gradient: 'from-blue-500 to-blue-600',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
    },
    {
      title: 'ফেসবুক পেজ',
      icon: <FaFacebook className='text-xl md:text-2xl' />,
      details: 'আমাদের অফিসিয়াল পেজ',
      action: 'ভিজিট করুন',
      link: 'https://www.facebook.com/profile.php?id=61578209851119&mibextid=ZbWKwL',
      gradient: 'from-[#1877F2] to-[#0d65d9]',
      iconBg: 'bg-[#1877F2]/10',
      iconColor: 'text-[#1877F2]',
    },
    {
      title: 'ইমেইল সাপোর্ট',
      icon: <FaEnvelope className='text-xl md:text-2xl' />,
      details: 'support@shopbdresellerjob.com',
      action: 'ইমেইল পাঠান',
      link: 'mailto:support@shopbdresellerjob.com',
      gradient: 'from-red-500 to-red-600',
      iconBg: 'bg-red-100',
      iconColor: 'text-red-500',
    },
    {
      title: 'হোয়াটসঅ্যাপ গ্রুপ',
      icon: <FaWhatsapp className='text-xl md:text-2xl' />,
      details: 'সেলার্স কমিউনিটি',
      action: 'জয়েন করুন',
      link: 'https://chat.whatsapp.com/Gs5lCd3OBDM69bnv0h8Jc0?mode=ac_t',
      gradient: 'from-green-500 to-green-600',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
    },
  ]

  return (
    <div className='min-h-screen bg-[#f7f6f3] py-6 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-6xl mx-auto'>
        {/* Header */}
        <motion.div initial='hidden' animate='visible' variants={staggerContainer} className='mb-8'>
          <motion.div
            variants={fadeUp}
            className='flex flex-col sm:flex-row items-center gap-4 sm:gap-6'
          >
            <div className='h-16 w-16 rounded-2xl bg-gradient-to-br from-rose-500 to-rose-600 flex items-center justify-center shadow-lg'>
              <MdSupportAgent className='text-3xl text-white' />
            </div>
            <div className='text-center sm:text-left'>
              <h1 className='text-2xl md:text-3xl font-bold text-[#1a1a2e]'>সাপোর্ট সেন্টার</h1>
              <p className='text-gray-500 text-sm mt-1 max-w-2xl'>
                যেকোনো সমস্যা বা প্রশ্নের জন্য আমাদের সাথে যোগাযোগ করুন নিচের মাধ্যমগুলোতে
              </p>
            </div>
          </motion.div>
        </motion.div>

        {/* Support Channels Grid */}
        <motion.div
          variants={staggerContainer}
          initial='hidden'
          animate='visible'
          className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8'
        >
          {supportChannels.map((channel, index) => (
            <motion.div
              key={index}
              variants={fadeUp}
              whileHover={{ y: -4 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            >
              <NavLink
                to={channel.link}
                target='_blank'
                rel='noopener noreferrer'
                className='block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300 group'
              >
                <div className={`bg-gradient-to-r ${channel.gradient} px-4 py-3`}>
                  <div className='flex items-center gap-2'>
                    <div className='h-8 w-8 rounded-xl bg-white/20 flex items-center justify-center'>
                      {channel.icon}
                    </div>
                    <h3 className='text-white font-semibold text-sm'>{channel.title}</h3>
                  </div>
                </div>
                <div className='p-4'>
                  <p className='text-gray-600 text-sm mb-3'>{channel.details}</p>
                  <div className='flex items-center justify-between'>
                    <span className='text-xs text-gray-400'>সরাসরি যোগাযোগ</span>
                    <span className='inline-flex items-center text-rose-500 text-sm font-medium group-hover:text-rose-600 transition-colors'>
                      {channel.action}
                      <svg
                        className='h-3.5 w-3.5 ml-1 group-hover:translate-x-0.5 transition-transform'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
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
                </div>
              </NavLink>
            </motion.div>
          ))}
        </motion.div>

        {/* Support Schedule Card */}
        <motion.div
          variants={fadeUp}
          initial='hidden'
          animate='visible'
          className='bg-white rounded-2xl shadow-sm border border-gray-100 p-5'
        >
          <div className='flex items-center gap-3 mb-4'>
            <div className='h-10 w-10 rounded-xl bg-rose-100 flex items-center justify-center'>
              <svg
                className='h-5 w-5 text-rose-500'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
                />
              </svg>
            </div>
            <h2 className='text-lg font-semibold text-[#1a1a2e]'>সাপোর্ট সময়সূচী</h2>
          </div>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm'>
            <div className='flex justify-between py-2 border-b border-gray-100'>
              <span className='text-gray-500'>সাপোর্ট সময়</span>
              <span className='font-medium text-gray-800'>সকাল ৯টা - রাত ১০টা</span>
            </div>
            <div className='flex justify-between py-2 border-b border-gray-100'>
              <span className='text-gray-500'>বন্ধের দিন</span>
              <span className='font-medium text-gray-800'>শুক্রবার</span>
            </div>
            <div className='flex justify-between py-2'>
              <span className='text-gray-500'>রেসপন্স টাইম</span>
              <span className='font-medium text-emerald-600'>সর্বোচ্চ ২ ঘণ্টা</span>
            </div>
          </div>
        </motion.div>

        {/* Footer Note */}
        <motion.div
          variants={fadeUp}
          initial='hidden'
          animate='visible'
          className='mt-6 text-center'
        >
          <p className='text-xs text-gray-400'>
            জরুরি প্রয়োজনে হটলাইনে কল করুন। আমাদের টিম ২৪/৭ আপনার জন্য প্রস্তুত
          </p>
        </motion.div>
      </div>
    </div>
  )
}

export default SupportCenter
