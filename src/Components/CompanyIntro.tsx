import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { FaBullhorn, FaGift, FaRocket, FaShieldAlt, FaStore, FaUsers } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import { getAllAnnouncements } from '../Api/announcements.api'

const HomeIntroduction = () => {
  const [announcements, setAnnouncements] = useState<string[]>([
    'সাময়িক সময়ের জন্য ধামাকা অফার! নতুন একাউন্ট রেজিস্ট্রেশন করলেই পাচ্ছেন ২০৳ welcome বোনাস',
  ])
  const navigate = useNavigate()

  const fetchAnnouncements = async () => {
    try {
      const { success, message, data } = await getAllAnnouncements()
      if (success && data) {
        // setAnnouncements(data)
      } else {
        console.log(message)
      }
    } catch (error) {
      console.error('Error fetching announcements:', error)
    }
  }

  useEffect(() => {
    fetchAnnouncements()
  }, [])

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  }

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  }

  const scrollingText = {
    animate: {
      x: ['5%', '-100%'],
      transition: {
        x: {
          repeat: Infinity,
          repeatType: 'loop' as const,
          duration: 10,
          ease: 'linear' as const,
        },
      },
    },
  }

  return (
    <section className='py-10 md:py-16 bg-gradient-to-b from-blue-50 via-white to-white relative overflow-hidden'>
      {/* Decorative elements */}
      <div className='absolute top-0 left-0 w-full h-72 bg-gradient-to-r from-blue-100/20 to-indigo-100/20 -skew-y-3 -translate-y-16 -z-10'></div>
      <div className='absolute bottom-20 right-0 w-64 h-64 bg-blue-200/10 rounded-full -translate-x-20 translate-y-20 -z-10'></div>

      <div className='container mx-auto px-4 sm:px-6'>
        <motion.div
          initial='hidden'
          animate='visible'
          variants={staggerContainer}
          className='max-w-6xl mx-auto text-center'
        >
          {/* Announcements Section - Fixed height and spacing */}
          {announcements.length > 0 && (
            <motion.div
              variants={fadeIn}
              className='mb-4 sm:mb-6 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl overflow-hidden shadow-lg border border-orange-300'
            >
              <div className='flex items-center bg-black bg-opacity-10 px-3 py-2'>
                <div className='flex items-center'>
                  <FaBullhorn className='text-white text-sm mr-2 flex-shrink-0' />
                  <span className='text-white text-xs sm:text-sm font-semibold'>ঘোষণা</span>
                </div>
                <div className='ml-2 h-3 w-3 rounded-full bg-white/20 animate-pulse'></div>
              </div>
              <div className='relative h-8 sm:h-10 overflow-hidden bg-white bg-opacity-10'>
                <motion.div
                  variants={scrollingText}
                  animate='animate'
                  className='absolute top-0 left-0 h-full flex items-center whitespace-nowrap'
                >
                  <span className='text-white text-xs sm:text-sm font-medium px-4 flex items-center'>
                    {announcements.map((announcement, index) => (
                      <span key={index} className='flex items-center mx-4'>
                        <span className='mr-2'>🎯</span>
                        {announcement}
                      </span>
                    ))}
                  </span>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* Main Heading */}
          <motion.div variants={fadeIn} className='mb-6 sm:mb-8'>
            <h1 className='text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-4 sm:mb-5 leading-tight'>
              <span className='bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 block'>
                শপ বিডি রিসেলার জবস
              </span>
            </h1>
            <div className='w-24 h-2 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full mx-auto mb-4'></div>
            <p className='text-lg sm:text-xl md:text-2xl font-semibold text-gray-700 max-w-3xl mx-auto leading-relaxed'>
              ইনভেস্টমেন্ট ছাড়াই অনলাইন আয়ের <span className='text-blue-600'>সেরা সুযোগ!</span>
            </p>
          </motion.div>

          {/* Stats Section */}
          <motion.div
            variants={fadeIn}
            className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-10 sm:mb-12 max-w-2xl mx-auto'
          >
            {[
              { value: '১,০০০+', label: 'সক্রিয় রিসেলার' },
              { value: '৫০০+', label: 'মাসিক অর্ডার' },
              { value: '৯৯%', label: 'সন্তুষ্ট ক্লায়েন্ট' },
              { value: '২৪/৭', label: 'সাপোর্ট' },
            ].map((stat, index) => (
              <div key={index} className='bg-white p-3 rounded-lg shadow-sm border border-gray-100'>
                <p className='text-lg font-bold text-blue-600'>{stat.value}</p>
                <p className='text-xs text-gray-600'>{stat.label}</p>
              </div>
            ))}
          </motion.div>

          {/* Subheading */}
          <motion.p
            variants={fadeIn}
            className='text-base sm:text-lg text-gray-600 mb-10 sm:mb-12 max-w-2xl mx-auto leading-relaxed px-4'
          >
            <span className='font-medium text-blue-600'>স্টক ছাড়াই ব্যবসা</span> শুরু করুন, আমরা
            দিবো <span className='font-medium text-indigo-600'>সম্পূর্ণ সাপোর্ট</span>।{' '}
            <span className='block mt-2 text-sm text-gray-500'>
              বাংলাদেশের প্রথম এবং সবচেয়ে বিশ্বস্ত রিসেলার প্ল্যাটফর্ম
            </span>
          </motion.p>

          {/* Features Grid */}
          <motion.div
            variants={staggerContainer}
            className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-12 sm:mb-16'
          >
            {[
              {
                icon: <FaStore />,
                title: 'জিরো ইনভেস্টমেন্ট',
                desc: 'স্টক ছাড়াই ব্যবসা শুরু করুন',
                color: 'blue',
              },
              {
                icon: <FaRocket />,
                title: 'দ্রুত পেমেন্ট',
                desc: 'অর্ডার শেষেই পেমেন্ট পান',
                color: 'green',
              },
              {
                icon: <FaShieldAlt />,
                title: 'গুণগত মান',
                desc: '১০০% টেস্টেড পণ্য',
                color: 'purple',
              },
              {
                icon: <FaUsers />,
                title: 'কমিউনিটি',
                desc: '১০,০০+ সক্রিয় রিসেলার',
                color: 'orange',
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                variants={fadeIn}
                whileHover={{ y: -8, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`bg-white p-5 sm:p-6 rounded-xl shadow-md hover:shadow-lg transition-all border border-${feature.color}-50 flex flex-col items-center text-center`}
              >
                <div
                  className={`bg-${feature.color}-100 w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-4`}
                >
                  <span className={`text-xl sm:text-2xl text-${feature.color}-600`}>
                    {feature.icon}
                  </span>
                </div>
                <h3 className={`font-bold text-lg mb-2 text-gray-800`}>{feature.title}</h3>
                <p className='text-sm text-gray-600'>{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* How it works */}
          <motion.div variants={fadeIn} className='mb-12 sm:mb-14'>
            <h2 className='text-2xl sm:text-3xl font-bold text-gray-900 mb-6'>কাজ করার পদ্ধতি</h2>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl mx-auto'>
              {[
                {
                  step: '১',
                  title: 'নিবন্ধন করুন',
                  desc: 'মোবাইল নম্বর দিয়ে ফ্রি রেজিস্ট্রেশন করুন',
                },
                {
                  step: '২',
                  title: 'পণ্য শেয়ার করুন',
                  desc: 'সামাজিক মিডিয়ায় আমাদের পণ্য শেয়ার করুন',
                },
                { step: '৩', title: 'আয় করুন', desc: 'অর্ডার সম্পূর্ণ হলে পেমেন্ট পান' },
              ].map((item, index) => (
                <div
                  key={index}
                  className='bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center text-center'
                >
                  <div className='w-10 h-10 rounded-full bg-blue-100 text-blue-600 font-bold flex items-center justify-center mb-3'>
                    {item.step}
                  </div>
                  <h3 className='font-semibold text-lg text-gray-800 mb-2'>{item.title}</h3>
                  <p className='text-sm text-gray-600'>{item.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* CTA Section */}
          <motion.div
            variants={fadeIn}
            className='relative bg-gradient-to-r from-blue-600 to-indigo-700 p-6 sm:p-10 rounded-2xl text-white overflow-hidden shadow-xl'
          >
            {/* Decorative elements */}
            <div className='absolute top-0 right-0 w-32 h-32 -translate-y-8 translate-x-8 bg-white/10 rounded-full'></div>
            <div className='absolute bottom-0 left-0 w-40 h-40 -translate-x-12 translate-y-8 bg-white/10 rounded-full'></div>

            <div className='relative z-10'>
              <div className='flex justify-center mb-4'>
                <div className='bg-white/20 p-3 rounded-full'>
                  <FaGift className='text-2xl text-white' />
                </div>
              </div>

              <h2 className='text-2xl sm:text-3xl md:text-4xl font-bold mb-4'>
                এখনই যুক্ত হোন <span className='text-blue-200'>আমাদের কমিউনিটির সাথে</span>
              </h2>

              <p className='text-sm sm:text-base text-blue-100 mb-6 max-w-2xl mx-auto leading-relaxed'>
                শপ বিডি রিসেলার জবস বাংলাদেশের সবচেয়ে বিশ্বস্ত প্ল্যাটফর্ম। আজই রেজিস্টার করুন এবং
                উপভোগ করুন <span className='font-semibold text-white'>বোনাস ২০৳ Welcome অফার!</span>
              </p>

              <div className='flex flex-col sm:flex-row gap-4 justify-center items-center'>
                <motion.button
                  onClick={() => navigate('/register#register')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className='bg-white text-blue-600 px-8 py-3 rounded-lg font-bold hover:bg-gray-50 transition-all shadow-lg flex items-center justify-center w-full sm:w-auto'
                >
                  ফ্রি রেজিস্ট্রেশন করুন <FaRocket className='ml-2' />
                </motion.button>

                <motion.button
                  onClick={() => navigate('/login')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className='bg-transparent border border-white text-white px-8 py-3 rounded-lg font-bold hover:bg-white/10 transition-all w-full sm:w-auto'
                >
                  একাউন্টে লগইন
                </motion.button>
              </div>

              <p className='text-xs text-blue-200/80 mt-4'>
                ✅ কোনো ক্রেডিট কার্ড বা hidden ফি প্রয়োজন নেই
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

export default HomeIntroduction
