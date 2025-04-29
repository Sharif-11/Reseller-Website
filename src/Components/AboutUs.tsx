import { motion } from 'framer-motion'
import { FaHeadset, FaLeaf, FaRegSmile } from 'react-icons/fa'
import { GiProgression, GiTakeMyMoney } from 'react-icons/gi'
import { MdOutlineInventory, MdPayment } from 'react-icons/md'
import Footer from './Footer'

const AboutUs = () => {
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
        staggerChildren: 0.2,
      },
    },
  }

  return (
    <>
      <div className='max-w-6xl mx-auto px-4 sm:px-6 py-8 md:py-12'>
        {/* Hero Section */}
        <motion.div
          initial='hidden'
          animate='visible'
          variants={staggerContainer}
          className='text-center mb-12 md:mb-16'
        >
          <motion.div variants={fadeIn} className='mb-3'>
            <span className='inline-block bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm font-medium'>
              বাংলাদেশের সেরা রিসেলিং প্ল্যাটফর্ম
            </span>
          </motion.div>
          <motion.h1
            variants={fadeIn}
            className='text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight'
          >
            <span className='bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-400'>
              শপ বিডি রিসেলার জবস
            </span>
            <br />
            <span className='text-lg sm:text-xl md:text-2xl font-semibold text-gray-600'>
              আপনার অনলাইন ব্যবসার সম্পূর্ণ সমাধান
            </span>
          </motion.h1>
          <motion.div variants={fadeIn} className='w-24 h-1 bg-blue-600 mx-auto'></motion.div>
        </motion.div>

        {/* Why Choose Us Section */}
        <motion.div
          initial='hidden'
          animate='visible'
          variants={staggerContainer}
          className='mb-16'
        >
          <motion.h2
            variants={fadeIn}
            className='text-2xl md:text-3xl font-semibold text-gray-800 mb-8 text-center'
          >
            কেন শপ বিডি রিসেলার জবস বেছে নিবেন?
          </motion.h2>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            <motion.div
              variants={fadeIn}
              whileHover={{ y: -5 }}
              className='bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100'
            >
              <div className='bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4'>
                <FaLeaf className='text-xl text-blue-600' />
              </div>
              <h3 className='text-xl font-semibold text-gray-800 mb-3 text-center'>
                বিনা পুঁজিতে শুরু করুন
              </h3>
              <p className='text-gray-600 text-center'>
                কোনো প্রাথমিক বিনিয়োগ ছাড়াই অনলাইন ব্যবসা শুরু করুন। আমাদের সাথে আপনাকে কোনো স্টক
                বা ইনভেন্টরি রাখতে হবে না।
              </p>
            </motion.div>

            <motion.div
              variants={fadeIn}
              whileHover={{ y: -5 }}
              className='bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100'
            >
              <div className='bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4'>
                <GiTakeMyMoney className='text-xl text-blue-600' />
              </div>
              <h3 className='text-xl font-semibold text-gray-800 mb-3 text-center'>
                লাভের নিশ্চয়তা
              </h3>
              <p className='text-gray-600 text-center'>
                প্রতিটি পণ্যে ২০০-৫০০ টাকা পর্যন্ত লাভের সুযোগ। প্রতিদিনের আয় সরাসরি আপনার
                অ্যাকাউন্টে।
              </p>
            </motion.div>

            <motion.div
              variants={fadeIn}
              whileHover={{ y: -5 }}
              className='bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100'
            >
              <div className='bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4'>
                <FaHeadset className='text-xl text-blue-600' />
              </div>
              <h3 className='text-xl font-semibold text-gray-800 mb-3 text-center'>
                সম্পূর্ণ সহায়তা
              </h3>
              <p className='text-gray-600 text-center'>
                নতুনদের জন্য ফ্রি ট্রেনিং এবং ২৪/৭ সাপোর্ট। আমরা আপনাকে প্রতিটি ধাপে গাইড করব।
              </p>
            </motion.div>
          </div>
        </motion.div>

        {/* How It Works Section */}
        <motion.div
          initial='hidden'
          animate='visible'
          variants={staggerContainer}
          className='mb-16'
        >
          <motion.h2
            variants={fadeIn}
            className='text-2xl md:text-3xl font-semibold text-gray-800 mb-8 text-center'
          >
            কিভাবে ব্যবসা করবেন?
          </motion.h2>
          <div className='space-y-6'>
            {[1, 2, 3, 4].map(step => (
              <motion.div
                key={step}
                variants={fadeIn}
                whileHover={{ x: 5 }}
                className='flex flex-col md:flex-row gap-6 items-center bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all'
              >
                <div className='bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center text-blue-600 font-bold text-xl'>
                  {step}
                </div>
                <div className='flex-1'>
                  <h3 className='text-xl font-semibold text-gray-800 mb-2'>
                    {step === 1 && 'নিবন্ধন করুন'}
                    {step === 2 && 'পণ্য নির্বাচন করুন'}
                    {step === 3 && 'বিক্রয় করুন'}
                    {step === 4 && 'আয় করুন'}
                  </h3>
                  <p className='text-gray-600'>
                    {step === 1 &&
                      'আমাদের ওয়েবসাইট বা অ্যাপে সম্পূর্ণ ফ্রিতে রেজিস্ট্রেশন করুন। কোনো লুকানো ফি নেই।'}
                    {step === 2 &&
                      'আমাদের ভেরিফাইড পণ্য ক্যাটালগ থেকে কম দামে কোয়ালিটি পণ্য বাছাই করুন।'}
                    {step === 3 &&
                      'ফেসবুক বা অন্যান্য প্ল্যাটফর্মে পণ্য প্রচার করুন এবং অর্ডার সংগ্রহ করুন।'}
                    {step === 4 && 'পণ্য ডেলিভারির পর আপনার লাভের টাকা সাথে সাথে পেয়ে যাবেন।'}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Unique Features */}
        <motion.div
          initial='hidden'
          animate='visible'
          variants={staggerContainer}
          className='bg-blue-50 rounded-xl p-8 mb-12'
        >
          <motion.h2
            variants={fadeIn}
            className='text-2xl md:text-3xl font-semibold text-blue-800 mb-8 text-center'
          >
            আমাদের বিশেষ সুবিধাসমূহ
          </motion.h2>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <motion.div
              variants={fadeIn}
              whileHover={{ x: 5 }}
              className='flex items-start gap-4 bg-white p-5 rounded-lg shadow-sm hover:shadow-md transition-all'
            >
              <div className='bg-blue-100 p-2 rounded-full text-blue-600'>
                <MdOutlineInventory className='text-xl' />
              </div>
              <div>
                <h3 className='font-semibold text-gray-800'>নিজস্ব স্টক ব্যবস্থাপনা</h3>
                <p className='text-gray-600 text-sm'>
                  আমাদের নিজস্ব গুদামে পর্যাপ্ত স্টক থাকায় দ্রুত ডেলিভারি নিশ্চিত
                </p>
              </div>
            </motion.div>

            <motion.div
              variants={fadeIn}
              whileHover={{ x: 5 }}
              className='flex items-start gap-4 bg-white p-5 rounded-lg shadow-sm hover:shadow-md transition-all'
            >
              <div className='bg-blue-100 p-2 rounded-full text-blue-600'>
                <GiProgression className='text-xl' />
              </div>
              <div>
                <h3 className='font-semibold text-gray-800'>বিক্রয় ট্র্যাকিং</h3>
                <p className='text-gray-600 text-sm'>
                  রিয়েল-টাইমে আপনার বিক্রয় ও আয়ের হিসাব দেখতে পারবেন
                </p>
              </div>
            </motion.div>

            <motion.div
              variants={fadeIn}
              whileHover={{ x: 5 }}
              className='flex items-start gap-4 bg-white p-5 rounded-lg shadow-sm hover:shadow-md transition-all'
            >
              <div className='bg-blue-100 p-2 rounded-full text-blue-600'>
                <MdPayment className='text-xl' />
              </div>
              <div>
                <h3 className='font-semibold text-gray-800'>নিরাপদ পেমেন্ট</h3>
                <p className='text-gray-600 text-sm'>বিকাশ/নগদ মাধ্যমে নিরাপদ লেনদেন</p>
              </div>
            </motion.div>

            <motion.div
              variants={fadeIn}
              whileHover={{ x: 5 }}
              className='flex items-start gap-4 bg-white p-5 rounded-lg shadow-sm hover:shadow-md transition-all'
            >
              <div className='bg-blue-100 p-2 rounded-full text-blue-600'>
                <FaRegSmile className='text-xl' />
              </div>
              <div>
                <h3 className='font-semibold text-gray-800'>গ্রাহক সন্তুষ্টি</h3>
                <p className='text-gray-600 text-sm'>
                  কোয়ালিটি পণ্য ও সময়মতো ডেলিভারির মাধ্যমে গ্রাহক ধরে রাখুন
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
      <Footer />
    </>
  )
}

export default AboutUs
