import { motion } from 'framer-motion'
import { useState } from 'react'
import { FaChevronDown, FaQuestionCircle } from 'react-icons/fa'

// Animation variants
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.1 },
  },
}

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const faqs = [
    {
      question: 'শপ বিডি রিসেলার জবস কি?',
      answer:
        'শপ বিডি রিসেলার জবস একটি সম্পূর্ণ অটোমেটেড অনলাইন প্রোডাক্ট রিসেলিং বিজনেস এর সহযোগী প্লাটফর্ম।',
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
      answer: 'নতুন সেলারের ক্ষেত্রে প্রথম অর্ডারের ডেলিভারি চার্জ অগ্রিম দিতে হবে।',
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

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <div className='min-h-screen bg-[#f7f6f3] py-6 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-4xl mx-auto'>
        {/* Header */}
        <motion.div initial='hidden' animate='visible' variants={staggerContainer} className='mb-8'>
          <motion.div
            variants={fadeUp}
            className='flex flex-col sm:flex-row items-center gap-4 sm:gap-6'
          >
            <div className='h-16 w-16 rounded-2xl bg-gradient-to-br from-rose-500 to-rose-600 flex items-center justify-center shadow-lg'>
              <FaQuestionCircle className='text-3xl text-white' />
            </div>
            <div className='text-center sm:text-left'>
              <h1 className='text-2xl md:text-3xl font-bold text-[#1a1a2e]'>
                সচরাচর জিজ্ঞাসিত প্রশ্ন
              </h1>
              <p className='text-gray-500 text-sm mt-1'>আপনার প্রশ্নের উত্তর খুঁজে নিন</p>
            </div>
          </motion.div>
        </motion.div>

        {/* FAQ Accordion */}
        <motion.div
          variants={staggerContainer}
          initial='hidden'
          animate='visible'
          className='space-y-3'
        >
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              variants={fadeUp}
              className='bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden'
            >
              <button
                onClick={() => toggleAccordion(index)}
                className='w-full px-5 py-4 flex items-center justify-between text-left hover:bg-gray-50/50 transition-colors'
              >
                <h3
                  className={`text-base md:text-lg font-semibold transition-colors ${
                    openIndex === index ? 'text-rose-500' : 'text-gray-800'
                  }`}
                >
                  {faq.question}
                </h3>
                <FaChevronDown
                  className={`h-4 w-4 text-gray-400 transition-transform duration-300 flex-shrink-0 ${
                    openIndex === index ? 'rotate-180 text-rose-500' : ''
                  }`}
                />
              </button>
              <div
                className={`transition-all duration-300 overflow-hidden ${
                  openIndex === index ? 'max-h-96' : 'max-h-0'
                }`}
              >
                <div className='px-5 pb-5 pt-0'>
                  <div className='bg-gray-50 rounded-xl p-4'>
                    <p className='text-gray-700 text-sm leading-relaxed'>{faq.answer}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Banner */}
        <motion.div
          variants={fadeUp}
          initial='hidden'
          animate='visible'
          className='mt-8 bg-gradient-to-r from-[#1a1a2e] to-[#16213e] rounded-2xl p-6 text-white'
        >
          <div className='flex flex-col sm:flex-row items-center justify-between gap-4'>
            <div className='text-center sm:text-left'>
              <h3 className='text-lg font-bold mb-1'>আরো সাহায্য প্রয়োজন?</h3>
              <p className='text-white/60 text-sm'>আমাদের সাপোর্ট টিম ২৪/৭ আপনার জন্য প্রস্তুত</p>
            </div>
            <NavLink
              to='/support'
              className='px-6 py-2.5 bg-rose-500 text-white rounded-xl font-medium hover:bg-rose-600 transition-all flex items-center gap-2 shadow-lg shadow-rose-500/20'
            >
              সাপোর্টে যোগাযোগ করুন
              <svg className='h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
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
    </div>
  )
}

import { NavLink } from 'react-router-dom'

export default FAQSection
