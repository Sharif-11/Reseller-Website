import { motion } from 'framer-motion'
import { FaRocket, FaShieldAlt, FaStore } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'

const HomeIntroduction = () => {
  const navigate = useNavigate()

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

  return (
    <section className='py-12 md:py-16 bg-gradient-to-b from-blue-50 to-white'>
      <div className='container mx-auto px-4 sm:px-6'>
        <motion.div
          initial='hidden'
          animate='visible'
          variants={staggerContainer}
          className='max-w-6xl mx-auto text-center'
        >
          {/* Badge */}

          {/* Main Heading */}
          <motion.h1
            variants={fadeIn}
            className='text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 sm:mb-6 leading-snug'
          >
            <span className='bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-400 block  pt-2'>
              শপ বিডি রিসেলার জবস
            </span>
            <span className='text-lg sm:text-xl md:text-2xl font-semibold text-gray-600 block mt-2 sm:mt-3'>
              ইনভেস্টমেন্ট ছাড়াই অনলাইন আয়ের সেরা সুযোগ!
            </span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            variants={fadeIn}
            className='text-base sm:text-lg text-gray-600 mb-8 sm:mb-12 max-w-2xl mx-auto leading-relaxed'
          >
            <span className='font-medium text-blue-600'>স্টক ছাড়াই ব্যবসা</span> শুরু করুন, আমরা
            দিবো <span className='font-medium'>সম্পূর্ণ সাপোর্ট</span>।{' '}
          </motion.p>

          {/* Features Grid */}
          <motion.div
            variants={staggerContainer}
            className='grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-12 sm:mb-16'
          >
            <motion.div
              variants={fadeIn}
              whileHover={{ y: -5, scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className='bg-white p-5 sm:p-6 rounded-xl shadow-md hover:shadow-lg transition-all border border-blue-50'
            >
              <div className='bg-blue-100 w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4'>
                <FaStore className='text-xl sm:text-2xl text-blue-600' />
              </div>
              <h3 className='font-bold text-lg sm:text-xl mb-2 text-gray-800'>জিরো ইনভেস্টমেন্ট</h3>
              <p className='text-sm sm:text-base text-gray-600'>স্টক ছাড়াই ব্যবসা শুরু করুন</p>
            </motion.div>

            <motion.div
              variants={fadeIn}
              whileHover={{ y: -5, scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className='bg-white p-5 sm:p-6 rounded-xl shadow-md hover:shadow-lg transition-all border border-blue-50'
            >
              <div className='bg-blue-100 w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4'>
                <FaRocket className='text-xl sm:text-2xl text-blue-600' />
              </div>
              <h3 className='font-bold text-lg sm:text-xl mb-2 text-gray-800'>দ্রুত পেমেন্ট</h3>
              <p className='text-sm sm:text-base text-gray-600'>অর্ডার শেষেই পেমেন্ট পান</p>
            </motion.div>

            <motion.div
              variants={fadeIn}
              whileHover={{ y: -5, scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className='bg-white p-5 sm:p-6 rounded-xl shadow-md hover:shadow-lg transition-all border border-blue-50'
            >
              <div className='bg-blue-100 w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4'>
                <FaShieldAlt className='text-xl sm:text-2xl text-blue-600' />
              </div>
              <h3 className='font-bold text-lg sm:text-xl mb-2 text-gray-800'>গুণগত মান</h3>
              <p className='text-sm sm:text-base text-gray-600'>১০০% টেস্টেড পণ্য</p>
            </motion.div>
          </motion.div>

          {/* CTA Section */}
          <motion.div
            variants={fadeIn}
            className='relative bg-gradient-to-r from-blue-600 to-blue-500 p-6 sm:p-8 rounded-xl text-white overflow-hidden'
          >
            <div className='absolute -right-8 -top-8 w-24 h-24 sm:w-32 sm:h-32 bg-blue-400 rounded-full opacity-20'></div>
            <div className='absolute -left-8 -bottom-8 w-28 h-28 sm:w-40 sm:h-40 bg-blue-400 rounded-full opacity-20'></div>
            <div className='relative z-10'>
              <h2 className='text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4'>
                এখনই যুক্ত হোন <span className='text-blue-200'>আমাদের সাথে</span>
              </h2>
              <p className='text-sm sm:text-base text-blue-100 mb-5 sm:mb-6 max-w-2xl mx-auto'>
                শপ বিডি রিসেলার জবস বাংলাদেশের সবচেয়ে বিশ্বস্ত প্ল্যাটফর্ম। আজই রেজিস্টার করুন
              </p>
              <motion.button
                onClick={() => navigate('/register#register')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className='bg-white text-blue-600 px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg font-bold hover:bg-gray-50 transition-all shadow-lg text-sm sm:text-base'
              >
                ফ্রি রেজিস্ট্রেশন করুন →
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

export default HomeIntroduction
