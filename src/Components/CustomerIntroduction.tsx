import { motion } from 'framer-motion'
import { FaClipboardList, FaQrcode, FaShoppingCart, FaUserPlus } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'

const CustomerIntroduction = () => {
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

  const steps = [
    {
      icon: <FaUserPlus className='text-2xl text-blue-600' />,
      title: 'রেজিস্ট্রেশন সম্পন্ন করুন',
      description: 'ফোন নম্বর ও OTP ভেরিফিকেশন এর মাধ্যমে অ্যাকাউন্ট তৈরি করুন',
    },
    {
      icon: <FaQrcode className='text-2xl text-blue-600' />,
      title: 'রেফারেল লিংক ব্যবহার করুন',
      description: 'আপনাকে প্রদত্ত লিংক বা QR কোড স্ক্যান করে শপিং শুরু করুন',
    },
    {
      icon: <FaShoppingCart className='text-2xl text-blue-600' />,
      title: 'অর্ডার সম্পন্ন করুন',
      description: 'পণ্য নির্বাচন করে আপনার অর্ডার সম্পন্ন করুন',
    },
    {
      icon: <FaClipboardList className='text-2xl text-blue-600' />,
      title: 'অর্ডার ট্র্যাক করুন',
      description: 'আপনার অ্যাকাউন্টে লগইন করে যেকোনো সময় অর্ডার স্ট্যাটাস চেক করুন',
    },
  ]

  return (
    <section className='py-12 md:py-16 bg-gradient-to-b from-blue-50 to-white'>
      <div className='container mx-auto px-4 sm:px-6'>
        <motion.div
          initial='hidden'
          animate='visible'
          variants={staggerContainer}
          className='max-w-6xl mx-auto text-center'
        >
          {/* Main Heading */}
          <motion.h1
            variants={fadeIn}
            className='text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 sm:mb-6 leading-snug'
          >
            <span className='bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-400 block pt-2 pb-2'>
              শপ বিডি - সহজ শপিং অভিজ্ঞতা
            </span>
            <span className='text-lg sm:text-xl md:text-2xl font-semibold text-gray-600 block mt-2 sm:mt-3'>
              রেজিস্ট্রেশন করে শুরু করুন আপনার শপিং
            </span>
          </motion.h1>

          {/* Process Steps */}
          <motion.div
            variants={staggerContainer}
            className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12'
          >
            {steps.map((step, index) => (
              <motion.div
                key={index}
                variants={fadeIn}
                whileHover={{ y: -5 }}
                className='bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all border border-blue-50 flex flex-col items-center'
              >
                <div className='bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mb-4'>
                  {step.icon}
                </div>
                <h3 className='font-bold text-lg mb-2 text-gray-800'>{step.title}</h3>
                <p className='text-sm text-gray-600 text-center'>{step.description}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Detailed Instructions */}
          <motion.div
            variants={fadeIn}
            className='bg-white p-6 sm:p-8 rounded-xl shadow-md mb-12 text-left max-w-4xl mx-auto'
            id='how-to-order'
          >
            <h2 className='text-xl sm:text-2xl font-bold mb-4 text-gray-800 border-b pb-2'>
              রেজিস্ট্রেশন প্রক্রিয়া
            </h2>
            <p className='text-gray-700 mb-4'>
              আমাদের ওয়েবসাইটে সফলভাবে অর্ডার করার জন্য একটি অ্যাকাউন্ট থাকা বাধ্যতামূলক। নিচের সহজ
              ধাপগুলো অনুসরণ করে দ্রুত রেজিস্ট্রেশন সম্পন্ন করুন:
            </p>

            <ol className='list-decimal pl-5 space-y-4 text-gray-700'>
              <li className='pl-2'>
                <span className='font-semibold'>ফোন নম্বর দিন:</span> রেজিস্ট্রেশন শুরু করতে আপনার
                সচল ফোন নম্বরটি নির্দিষ্ট বক্সে লিখুন এবং "ওটিপি পাঠান" বাটনে ক্লিক করুন।
              </li>
              <li className='pl-2'>
                <span className='font-semibold'>ওটিপি যাচাই করুন:</span> আপনার দেওয়া ফোন নাম্বারে
                এসএমএস এর মাধ্যমে একটি ওয়ান-টাইম পাসওয়ার্ড (ওটিপি) কোড পাঠানো হবে। প্রাপ্ত SMS এর
                (এটিপি) কোডটি নির্দিষ্ট স্থানে প্রবেশ করিয়ে "যাচাই করুন" বাটনে ক্লিক করুন।
              </li>
              <li className='pl-2'>
                <span className='font-semibold'>অ্যাকাউন্ট তৈরি:</span> আপনার দেওয়া (ওটিপি) কোড টি
                সঠিক হলে, আপনার অ্যাকাউন্ট সফলভাবে তৈরি হয়ে যাবে!
              </li>
            </ol>

            <div className='mt-6 p-4 bg-blue-50 rounded-lg'>
              <h3 className='font-bold text-blue-800 mb-2'>গুরুত্বপূর্ণ তথ্য:</h3>
              <ul className='list-disc pl-5 space-y-2 text-blue-700'>
                <li>অর্ডার করার পূর্বে একাউন্ট রেজিস্ট্রেশন আবশ্যক</li>
                <li>রেজিস্ট্রেশন ছাড়া আপনি আমাদের গ্রাহক হিসেবে বিবেচিত হবেন না</li>
                <li>একটি ফোন নম্বর দিয়ে শুধুমাত্র একটি অ্যাকাউন্ট তৈরি করা যাবে</li>
                <li>
                  রেজিস্ট্রেশন সংক্রান্ত আরও কোনো প্রশ্ন থাকলে আমাদের সেলস টিম বা সেলস ম্যানেজার কে
                  জিজ্ঞাসা করুন
                </li>
              </ul>
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div
            variants={fadeIn}
            className='relative bg-gradient-to-r from-blue-600 to-blue-500 p-6 sm:p-8 rounded-xl text-white overflow-hidden'
          >
            <div className='absolute -right-8 -top-8 w-24 h-24 sm:w-32 sm:h-32 bg-blue-400 rounded-full opacity-20'></div>
            <div className='absolute -left-8 -bottom-8 w-28 h-28 sm:w-40 sm:h-40 bg-blue-400 rounded-full opacity-20'></div>
            <div className='relative z-10'>
              <h2 className='text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4'>
                এখনই রেজিস্ট্রেশন করুন
              </h2>
              <p className='text-sm sm:text-base text-blue-100 mb-5 sm:mb-6 max-w-2xl mx-auto'>
                সহজ রেজিস্ট্রেশন প্রক্রিয়া শেষ করে শুরু করুন আপনার শপিং
              </p>
              <div className='flex flex-col sm:flex-row justify-center gap-4'>
                <motion.button
                  onClick={() => navigate('/products#products')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className='bg-white text-blue-600 px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg font-bold hover:bg-gray-50 transition-all shadow-lg text-sm sm:text-base'
                >
                  পণ্য দেখুন →
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

export default CustomerIntroduction
