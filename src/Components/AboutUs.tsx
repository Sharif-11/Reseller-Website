import { motion } from 'framer-motion'
import { BiTransferAlt } from 'react-icons/bi'
import { BsCashCoin, BsTicketDetailed } from 'react-icons/bs'
import { FaRegSmile, FaShieldAlt, FaUserPlus } from 'react-icons/fa'
import { GiProgression } from 'react-icons/gi'
import { MdGroup, MdPayment, MdWeb } from 'react-icons/md'
import { useNavigate } from 'react-router-dom'
import Footer from './Footer'

const AboutUs = () => {
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
            <span className='text-lg sm:text-xl md:text-2xl font-semibold text-gray-600 mt-2 block'>
              বিনিয়োগ ছাড়াই নিজের ব্যবসা শুরু করুন!
            </span>
          </motion.h1>
          <motion.p variants={fadeIn} className='text-gray-600 max-w-2xl mx-auto mt-4'>
            শপবিডি রিসেলার প্রোগ্রামে যুক্ত হয়ে আপনি সহজেই একটি অনলাইন ব্যবসা শুরু করতে পারেন।
            এখানে আছে দারুণ কিছু সুবিধা, যা আপনার কাজকে আরও সহজ করবে
          </motion.p>
          <motion.div variants={fadeIn} className='w-24 h-1 bg-blue-600 mx-auto mt-6'></motion.div>
        </motion.div>

        {/* Amazing Features Section */}
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
            দুর্দান্ত আকর্ষণীয় ফিচারসমূহ
          </motion.h2>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {[
              {
                icon: FaShieldAlt,
                title: 'কাস্টমার ফ্রড চেকার',
                desc: 'আপনার ব্যবসাকে ফ্রড থেকে সুরক্ষিত রাখুন',
              },
              {
                icon: FaUserPlus,
                title: 'সেলার রেফার',
                desc: 'অন্যান্য রিসেলারদের রেফার করে ইনকাম করুন',
              },
              {
                icon: FaUserPlus,
                title: 'কাস্টমার রেফার',
                desc: 'কাস্টমার রেফার করে অতিরিক্ত আয় করুন',
              },
              {
                icon: MdWeb,
                title: 'ল্যান্ডিং পেজ ফ্রী',
                desc: 'প্রতিটি পণ্যের জন্য বিনামূল্যে ল্যান্ডিং পেজ',
              },

              {
                icon: MdGroup,
                title: 'টিম ব্যবস্থাপনা',
                desc: 'আপনার টিম তৈরি করে প্যাসিভ ইনকাম করুন',
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                variants={fadeIn}
                whileHover={{ y: -5 }}
                className='bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100 flex flex-col items-center text-center'
              >
                <div className='bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4'>
                  <feature.icon className='text-xl text-blue-600' />
                </div>
                <h3 className='text-lg font-semibold text-gray-800 mb-2'>{feature.title}</h3>
                <p className='text-gray-600 text-sm'>{feature.desc}</p>
                <span className='mt-3 text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full'>
                  লাইফটাইম ফ্রী
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Main Benefits Section */}
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
            মূল সুবিধাগুলো
          </motion.h2>
          <div className='space-y-6'>
            {[
              {
                icon: MdWeb,
                title: 'বিনামূল্যে ল্যান্ডিং পেজ',
                desc: 'প্রতিটি পণ্যের জন্য আলাদা ল্যান্ডিং পেজ তৈরি করতে পারবেন এবং তা দিয়ে বুস্ট বা মার্কেটিং করতে পারবেন। আপনি আপনার ইচ্ছেমতো পণ্যের দাম নির্ধারণ করতে পারবেন।',
              },
              {
                icon: FaShieldAlt,
                title: 'ফ্রড চেকার',
                desc: 'আপনার ব্যবসা নিরাপদ রাখতে আছে কাস্টমার ফ্রড চেকার।',
              },
              {
                icon: FaUserPlus,
                title: 'রেফার করে ইনকাম',
                desc: 'আপনি আপনার বন্ধুদের রিসেলার বা কাস্টমার হিসেবে রেফার করতে পারেন এবং প্রতি অর্ডারে ইনকাম করতে পারবেন।',
              },
              {
                icon: MdGroup,
                title: 'টিম তৈরি করে প্যাসিভ ইনকাম',
                desc: 'আপনার অধীনে একটি রিসেলার টিম তৈরি করে দুই লেভেল পর্যন্ত প্যাসিভ ইনকাম করার সুযোগ পাবেন।',
              },
              {
                icon: BsCashCoin,
                title: 'ক্যাশ অন ডেলিভারি',
                desc: 'গ্রাহকদের কাছ থেকে ডেলিভারি চার্জ অগ্রিম নেওয়ার প্রয়োজন নেই। একাধিক পণ্য অর্ডারের জন্য একটি মাত্র ডেলিভারি চার্জ প্রযোজ্য।',
              },
              {
                icon: BiTransferAlt,
                title: 'দ্রুত পেমেন্ট',
                desc: 'মাত্র ৫০ টাকা হলেই বিকাশ বা নগদের মাধ্যমে টাকা তুলতে পারবেন। পেমেন্ট উইথড্র করার সর্বোচ্চ ২৪ ঘন্টার মধ্যে উইথড্র কৃত টাকা পেয়ে যাবেন।',
              },
              {
                icon: BsTicketDetailed,
                title: 'সাপোর্ট সিস্টেম',
                desc: 'যেকোনো প্রয়োজনে সাপোর্ট সেন্টার, সাপোর্ট টিকেট এবং হটলাইন নাম্বারের সুবিধা পাবেন।',
              },
            ].map((benefit, index) => (
              <motion.div
                key={index}
                variants={fadeIn}
                whileHover={{ x: 5 }}
                className='flex flex-col md:flex-row gap-6 items-start bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all'
              >
                <div className='bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center text-blue-600 text-xl flex-shrink-0'>
                  <benefit.icon className='text-xl' />
                </div>
                <div className='flex-1'>
                  <h3 className='text-xl font-semibold text-gray-800 mb-2'>{benefit.title}</h3>
                  <p className='text-gray-600'>{benefit.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Requirements Section */}
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
            প্রয়োজনীয় শর্তাবলী
          </motion.h2>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <motion.div
              variants={fadeIn}
              whileHover={{ x: 5 }}
              className='flex items-start gap-4 bg-white p-5 rounded-lg shadow-sm hover:shadow-md transition-all'
            >
              <div className='bg-blue-100 p-3 rounded-full text-blue-600'>
                <FaRegSmile className='text-xl' />
              </div>
              <div>
                <h3 className='font-semibold text-gray-800'>রেজিস্ট্রেশন</h3>
                <p className='text-gray-600 text-sm'>
                  রেজিস্ট্রেশন করতে কোনো ইনভেস্টমেন্টের প্রয়োজন নেই, সম্পূর্ণ বিনামূল্যে।
                </p>
              </div>
            </motion.div>

            <motion.div
              variants={fadeIn}
              whileHover={{ x: 5 }}
              className='flex items-start gap-4 bg-white p-5 rounded-lg shadow-sm hover:shadow-md transition-all'
            >
              <div className='bg-blue-100 p-3 rounded-full text-blue-600'>
                <GiProgression className='text-xl' />
              </div>
              <div>
                <h3 className='font-semibold text-gray-800'>ভেরিফিকেশন</h3>
                <p className='text-gray-600 text-sm'>
                  রেফারেল ইনকাম পেতে হলে প্রথমে আপনাকে একটি অর্ডার দিয়ে আপনার অ্যাকাউন্ট ভেরিফাই
                  করতে হবে।
                </p>
              </div>
            </motion.div>

            <motion.div
              variants={fadeIn}
              whileHover={{ x: 5 }}
              className='flex items-start gap-4 bg-white p-5 rounded-lg shadow-sm hover:shadow-md transition-all md:col-span-2'
            >
              <div className='bg-blue-100 p-3 rounded-full text-blue-600'>
                <MdPayment className='text-xl' />
              </div>
              <div>
                <h3 className='font-semibold text-gray-800'>ডেলিভারি চার্জ</h3>
                <p className='text-gray-600 text-sm'>
                  কাস্টমার রেফার বা ল্যান্ডিং পেজ এর মাধ্যমে কাস্টমার অর্ডার সাবমিট করতে অফিস
                  নাম্বারে ডেলিভারি চার্জ অগ্রিম প্রদান আবশ্যক করে দেওয়া হয়েছে তাই রিটার্ন হওয়ার
                  কোন ঝামেলা নেই।
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial='hidden'
          animate='visible'
          variants={staggerContainer}
          className='text-center mb-12'
        >
          <motion.h2
            variants={fadeIn}
            className='text-2xl md:text-3xl font-bold text-gray-800 mb-4'
          >
            আজই শুরু করুন এবং প্রতিদিন আনলিমিটেড আয় করার সুযোগ নিন।
          </motion.h2>
          <motion.p variants={fadeIn} className='text-gray-600 mb-6 max-w-2xl mx-auto'>
            শপ বিডি রিসেলার প্রোগ্রামে যোগ দিন এবং আপনার আর্থিক স্বাধীনতার পথ শুরু করুন
          </motion.p>
          <motion.button
            variants={fadeIn}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              navigate('/register#register')
            }}
            className='bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-full transition-colors duration-300 shadow-md'
          >
            প্রোগ্রামে যোগ দিন
          </motion.button>
        </motion.div>
      </div>
      <Footer />
    </>
  )
}

export default AboutUs
