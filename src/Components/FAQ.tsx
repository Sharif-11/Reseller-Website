import { motion } from 'framer-motion'
import { FaQuestionCircle } from 'react-icons/fa'
import { NavLink } from 'react-router-dom'

const FAQSection = () => {
  const faqs = [
    {
      question: ' শপ বিডি রিসেলার জবস কি?',
      answer:
        ' শপ বিডি রিসেলার জবস একটি সম্পূর্ণ অটোমেটেড অনলাইন প্রোডাক্ট রিসেলিং বিজনেস এর সহযোগী প্লাটফর্ম।',
    },
    {
      question: 'ডেলিভারি চার্জ কত?',
      answer:
        'ডেলিভারি চার্জ ঢাকার মধ্যে 80 টাকা ঢাকার বাইরে 130 টাকা। প্রোডাক্টের সংখ্যা বেশি হলে অথবা ওজন বেশি হলে ডেলিভারি চার্জ অতিরিক্ত হিসেবে ১০ থেকে ৩০ টাকা পর্যন্ত বাড়তে পারে।',
    },
    {
      question: 'রিটার্নের জন্য কোন চার্জ আছে কি?',
      answer: 'না, আমাদের কোন প্রকার রিটার্ন চার্জ নেওয়া হয় না।',
    },
    {
      question: 'নতুন সেলারদের জন্য ডেলিভারি চার্জের নিয়ম কি?',
      answer: 'নতুন সেলারের ক্ষেত্রে প্রথম  অর্ডারের ডেলিভারি চার্জ অগ্রিম দিতে হবে।',
    },
    {
      question: 'এক্সচেঞ্জ অর্ডার এর সুবিধা আছে কি?',
      answer:
        'জি, ডেলিভারি ম্যান দাঁড়িয়ে থাকা অবস্থায় প্রোডাক্টটি চেক করে নিতে হবে, প্রোডাক্ট এর কোন ত্রুটি বের হলে আমাদের খরচে আবার আমরা প্রোডাক্ট পাঠিয়ে দেব, ডেলিভারি ম্যান চলে আসার পর এক্সচেঞ্জ করে নিতে চাইলে সে ক্ষেত্রে ডেলিভারি চার্জ আবার দিতে হবে।',
    },
    {
      question: 'অর্ডার কনফার্ম হলে কখন বুকিং দেওয়া হয়?',
      answer:
        'বিকেল তিনটার মধ্যে অর্ডার কনফার্ম করা হলে সন্ধ্যার মধ্যেই বুকিং দেওয়া হয়ে থাকে। তিনটার পরের অর্ডার পরের দিন বুকিং দেওয়া হয়।',
    },
    {
      question: 'প্রফিটের টাকা কখন পাবো এবং উত্তোলন করতে কত সময় লাগে?',
      answer:
        'আপনার প্রোডাক্টটি ডেলিভারি হয়ে গেলে ঐদিন রাত বারোটার পর আপনার একাউন্টে প্রফিটের টাকা যোগ হয়ে যাবে। প্রফিটের টাকা যোগ হওয়ার সাথে সাথেই আপনি আপনার নগদ অথবা বিকাশে উত্তোলন করে নিতে পারবেন। অ্যাপস থেকে পেমেন্ট রিকোয়েস্ট দেওয়ার সর্বোচ্চ ১ ঘণ্টার মধ্যে আপনার একাউন্টে টাকা চলে যাবে।',
    },
    {
      question: 'একাধিক প্রোডাক্ট একসাথে অর্ডার করা যাবে কি?',
      answer:
        'জি, আমাদের অ্যাপসে থাকা যেকোনো প্রোডাক্টের সাথে অন্য যেকোনো প্রোডাক্ট এড করে একই ঠিকানায় একটিমাত্র ডেলিভারি চার্জ দিয়েই পাঠাতে পারবেন।',
    },
  ]

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  }

  return (
    <motion.div
      initial='hidden'
      animate='visible'
      variants={container}
      className='min-h-screen bg-gradient-to-b from-gray-50 to-white p-4 md:p-8'
    >
      <div className='max-w-4xl mx-auto'>
        {/* Header Section */}
        <motion.div variants={item} className='flex items-center gap-4 mb-8 md:mb-12'>
          <div className='bg-indigo-100 p-3 rounded-full'>
            <FaQuestionCircle className='text-3xl text-indigo-600' />
          </div>
          <div>
            <h1 className='text-2xl md:text-3xl font-bold text-gray-900'>
              সচরাচর জিজ্ঞাসিত প্রশ্ন
            </h1>
            <p className='text-gray-600 mt-1'>আপনার প্রশ্নের উত্তর খুঁজে নিন</p>
          </div>
        </motion.div>

        {/* FAQ List */}
        <motion.div variants={container} className='space-y-4'>
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              variants={item}
              whileHover={{ scale: 1.01 }}
              className='bg-white rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden border border-gray-100'
            >
              <details className='group'>
                <summary className='flex justify-between items-center p-5 md:p-6 cursor-pointer list-none'>
                  <h3 className='text-lg md:text-xl font-semibold text-gray-800 group-open:text-indigo-600'>
                    {faq.question}
                  </h3>
                  <svg
                    className='h-5 w-5 text-gray-500 group-open:text-indigo-600 group-open:rotate-180 transform transition-transform flex-shrink-0'
                    xmlns='http://www.w3.org/2000/svg'
                    viewBox='0 0 20 20'
                    fill='currentColor'
                  >
                    <path
                      fillRule='evenodd'
                      d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z'
                      clipRule='evenodd'
                    />
                  </svg>
                </summary>
                <div className='px-5 md:px-6 pb-5 md:pb-6 pt-0 md:pt-0 bg-gray-50'>
                  <p className='text-gray-700'>{faq.answer}</p>
                </div>
              </details>
            </motion.div>
          ))}
        </motion.div>

        {/* Additional Help Section */}
        <motion.div
          variants={item}
          className='mt-10 bg-gradient-to-r from-indigo-600 to-indigo-500 rounded-xl p-6 md:p-8 text-white'
        >
          <div className='flex flex-col md:flex-row items-center justify-between gap-6'>
            <div>
              <h3 className='text-xl font-bold mb-2'>আরো সাহায্য প্রয়োজন?</h3>
              <p className='text-indigo-100'>আমাদের সাপোর্ট টিম ২৪/৭ আপনার জন্য প্রস্তুত</p>
            </div>
            <NavLink
              to='/support'
              className='px-6 py-3 bg-white text-indigo-600 rounded-lg font-semibold hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-indigo-600 transition-colors inline-flex items-center whitespace-nowrap'
            >
              সাপোর্টে যোগাযোগ করুন
              <svg
                xmlns='http://www.w3.org/2000/svg'
                className='h-5 w-5 ml-2'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M14 5l7 7m0 0l-7 7m7-7H3'
                />
              </svg>
            </NavLink>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default FAQSection
