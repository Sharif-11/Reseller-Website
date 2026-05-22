import { motion } from 'framer-motion'
import {
  FaBox,
  FaCheckCircle,
  FaExclamationTriangle,
  FaHandshake,
  FaPhone,
  FaShieldAlt,
} from 'react-icons/fa'

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

const SalesGuidelines = () => {
  const guidelines = [
    {
      id: 'order',
      title: 'অর্ডার সংক্রান্ত নিয়মাবলী',
      icon: FaBox,
      color: 'rose',
      bgColor: 'rose-50',
      borderColor: 'rose-100',
      iconBgColor: 'rose-100',
      iconColor: 'rose-500',
      items: [
        {
          title: 'অর্ডার গ্রহণ',
          description:
            'ফেসবুক বা অন্য সোশ্যাল মিডিয়া থেকে অর্ডার নেওয়ার পর অবশ্যই কাস্টমারের ফোনে কল করে নিশ্চিত করবেন। এতে ফেক অর্ডার কমবে।',
          important: true,
        },
        {
          title: 'ডেলিভারি চার্জ',
          description:
            'ফেক অর্ডার রোধ করতে কাস্টমারের কাছ থেকে ডেলিভারি চার্জ আগাম নেওয়ার চেষ্টা করবেন। প্রাপ্ত ডেলিভারি চার্জ অবশ্যই শপ বিডি অ্যাপে পেমেন্ট করে অর্ডার প্লেস করবেন।',
          important: true,
        },
        {
          title: 'অর্ডার যাচাইকরণ',
          description:
            'যারা ডেলিভারি চার্জ দিবেন না, তাদের অর্ডার শপ বিডি অফিস থেকে কল করে ভেরিফাই করা হবে। ডেলিভারি চার্জ নিয়েও যারা পেমেন্ট করবেন না, তাদের বিরুদ্ধে ব্যবস্থা নেওয়া হবে।',
          important: false,
        },
      ],
    },
    {
      id: 'security',
      title: 'অ্যাকাউন্ট নিরাপত্তা',
      icon: FaShieldAlt,
      color: 'emerald',
      bgColor: 'emerald-50',
      borderColor: 'emerald-100',
      iconBgColor: 'emerald-100',
      iconColor: 'emerald-500',
      items: [
        {
          title: 'পাসওয়ার্ড শেয়ার নিষিদ্ধ',
          description:
            'কোন অবস্থাতেই আপনার শপ বিডি অ্যাকাউন্টের পাসওয়ার্ড অন্য কাউকে দিবেন না। অ্যাকাউন্ট খোলার পর অবিলম্বে নগদ/বিকাশ নাম্বার যুক্ত করে ফেলুন।',
          important: true,
        },
        {
          title: 'ফ্রী মেম্বারশিপ',
          description:
            'শপ বিডি রিসেলার জবস-এ কাজ করতে বা সেলার কোড পেতে কোন ফী বা টাকার প্রয়োজন নেই। কাউকে টাকা দিবেন না বা নিবেন না।',
          important: true,
        },
        {
          title: 'সমস্যা সমাধান',
          description: 'কোন সমস্যা হলে সাথে সাথে শপ বিডি সাপোর্টে যোগাযোগ করবেন (কল: 09638755704)।',
          important: false,
        },
      ],
    },
  ]

  const generalAdvice = [
    'টিম লিডাররা এই গাইডলাইন সকল শপ বিডি মেম্বারের সাথে শেয়ার করবেন',
    'এই নিয়মগুলো মেনে চললে রিটার্ন কম আসবে এবং আপনার আয় বাড়বে',
    'শপ বিডি অ্যাপে নিয়মিত অর্ডার দিলে অতিরিক্ত বোনাস পাওয়া যাবে',
    'কোন প্রশ্ন থাকলে আমাদের সাপোর্ট টিমের সাথে যোগাযোগ করুন',
  ]

  return (
    <div className='min-h-screen bg-[#f7f6f3] py-6 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-4xl mx-auto'>
        {/* Header */}
        <motion.div initial='hidden' animate='visible' variants={staggerContainer} className='mb-8'>
          <motion.div
            variants={fadeUp}
            className='flex items-center justify-between flex-wrap gap-4'
          >
            <div>
              <div className='flex items-center gap-2 mb-2'>
                <div className='h-8 w-1 rounded-full bg-rose-500' />
                <span className='text-rose-500 text-sm font-semibold uppercase tracking-wider'>
                  নির্দেশিকা
                </span>
              </div>
              <h1 className='text-2xl md:text-3xl font-bold text-[#1a1a2e] flex items-center gap-2'>
                <FaHandshake className='text-rose-500 h-6 w-6 md:h-7 md:w-7' />
                সেলস গাইডলাইন
              </h1>
              <p className='text-gray-500 text-sm mt-1'>
                শপ বিডি রিসেলার জবস - সফল ব্যবসার জন্য প্রয়োজনীয় নির্দেশিকা
              </p>
            </div>
            <div className='hidden sm:block h-12 w-12 rounded-xl bg-gradient-to-br from-rose-500 to-rose-600 flex items-center justify-center shadow-lg'>
              <FaHandshake className='h-6 w-6 text-white' />
            </div>
          </motion.div>
        </motion.div>

        {/* Guidelines Cards */}
        <motion.div
          initial='hidden'
          animate='visible'
          variants={staggerContainer}
          className='space-y-6 mb-8'
        >
          {guidelines.map(section => (
            <motion.div
              key={section.id}
              variants={fadeUp}
              className='bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300'
            >
              {/* Section Header */}
              <div
                className={`bg-${section.bgColor} px-6 py-4 border-b border-${section.borderColor}`}
              >
                <div className='flex items-center gap-3'>
                  <div
                    className={`h-10 w-10 rounded-xl bg-${section.iconBgColor} flex items-center justify-center`}
                  >
                    <section.icon className={`h-5 w-5 text-${section.iconColor}`} />
                  </div>
                  <h2 className='text-lg font-semibold text-gray-800'>{section.title}</h2>
                </div>
              </div>

              {/* Section Content */}
              <div className='p-6 space-y-4'>
                {section.items.map((item, itemIdx) => (
                  <div
                    key={itemIdx}
                    className={`flex items-start gap-3 p-3 rounded-xl transition-all ${
                      item.important
                        ? 'bg-gray-50/80 border-l-4 border-rose-400'
                        : 'hover:bg-gray-50/50'
                    }`}
                  >
                    <div className='flex-shrink-0 mt-0.5'>
                      {item.important ? (
                        <FaExclamationTriangle className={`h-4 w-4 text-${section.iconColor}`} />
                      ) : (
                        <FaCheckCircle className={`h-4 w-4 text-${section.iconColor}`} />
                      )}
                    </div>
                    <div>
                      <p className='text-sm text-gray-700'>
                        <span
                          className={`font-semibold text-${section.iconColor === 'rose-500' ? 'rose-600' : section.iconColor === 'emerald-500' ? 'emerald-600' : 'gray-800'}`}
                        >
                          {item.title}:
                        </span>{' '}
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* General Advice Section */}
        <motion.div
          variants={fadeUp}
          initial='hidden'
          animate='visible'
          className='bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-100 overflow-hidden mb-8'
        >
          <div className='px-6 py-4 border-b border-amber-100 bg-white/50'>
            <div className='flex items-center gap-3'>
              <div className='h-10 w-10 rounded-xl bg-amber-100 flex items-center justify-center'>
                <FaPhone className='h-5 w-5 text-amber-600' />
              </div>
              <h2 className='text-lg font-semibold text-gray-800'>সাধারণ পরামর্শ</h2>
            </div>
          </div>
          <div className='p-6'>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
              {generalAdvice.map((advice, idx) => (
                <div
                  key={idx}
                  className='flex items-start gap-2 p-2 rounded-lg hover:bg-white/50 transition-colors'
                >
                  <span className='text-amber-500 mt-0.5'>•</span>
                  <span className='text-sm text-gray-700'>{advice}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Footer Note */}
        <motion.div
          variants={fadeUp}
          initial='hidden'
          animate='visible'
          className='text-center pt-4 border-t border-gray-200'
        >
          <p className='text-sm text-gray-500'>
            এই নির্দেশিকা মেনে কাজ করলে শপ বিডি রিসেলার জবস প্লাটফর্মে আপনার ব্যবসা সফল হবে
          </p>
          <p className='text-sm font-medium text-rose-500 mt-2'>- শপ বিডি রিসেলার জবস টিম</p>
        </motion.div>
      </div>
    </div>
  )
}

export default SalesGuidelines
