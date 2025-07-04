import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet'

const TermsAndConditions = () => {
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
        staggerChildren: 0.1,
      },
    },
  }

  return (
    <motion.div
      initial='hidden'
      animate='visible'
      variants={staggerContainer}
      className='container mx-auto px-4 sm:px-6 py-8 font-bangla'
    >
      <Helmet>
        <title>শর্তাবলী ও নীতিমালা - শপ বিডি রিসেলার জবস</title>
        <meta
          name='description'
          content='শপ বিডি রিসেলার জবস এর শর্তাবলী ও নীতিমালা সম্পর্কে বিস্তারিত জানুন'
        />
      </Helmet>

      <motion.div variants={fadeIn} className='text-center mb-10'>
        <h1 className='text-3xl sm:text-4xl font-bold text-gray-900 mb-3'>শর্তাবলী ও নীতিমালা</h1>
        <div className='w-24 h-1 bg-blue-600 mx-auto'></div>
      </motion.div>

      {/* Section 1 */}
      <motion.div
        variants={fadeIn}
        className='bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 sm:p-8 mb-8 border border-gray-100'
      >
        <h2 className='text-xl sm:text-2xl font-semibold text-gray-800 mb-6 pb-2 border-b border-blue-100'>
          ১. ক্রয়-বিক্রয়ের শর্তাবলী
        </h2>

        <div className='mb-8'>
          <h3 className='text-lg sm:text-xl font-medium mb-3 text-blue-600'>
            ১.১ ডেলিভারি সময়সীমা
          </h3>
          <p className='text-gray-700'>
            অর্ডার গ্রহণের পর <span className='font-medium'>৪৮ ঘণ্টার মধ্যে</span> পণ্য কুরিয়ারে
            হস্তান্তর করা হবে। সাধারণত <span className='font-medium'>৭২ ঘণ্টার মধ্যে</span> পণ্য
            গ্রাহকের কাছে পৌঁছে যাবে। অপ্রত্যাশিত ঘটনা বা প্রাকৃতিক দুর্যোগের ক্ষেত্রে সর্বোচ্চ{' '}
            <span className='font-medium'>৫-৬ কর্মদিবস</span> সময় লাগতে পারে।
          </p>
        </div>

        <div className='mb-8'>
          <h3 className='text-lg sm:text-xl font-medium mb-3 text-blue-600'>
            ১.২ পণ্য ফেরত নীতিমালা
          </h3>
          <ul className='space-y-3'>
            <li className='flex items-start'>
              <span className='bg-blue-100 text-blue-600 rounded-full w-5 h-5 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0'>
                •
              </span>
              <span className='text-gray-700'>
                ডেলিভারি ম্যানের উপস্থিতিতে পণ্য পরীক্ষা করতে হবে। ত্রুটিপূর্ণ পণ্য সাথে সাথে ফেরত
                দিতে হবে
              </span>
            </li>
            <li className='flex items-start'>
              <span className='bg-blue-100 text-blue-600 rounded-full w-5 h-5 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0'>
                •
              </span>
              <span className='text-gray-700'>
                ত্রুটিহীন পণ্য ইচ্ছাকৃতভাবে ফেরত দিলে ডেলিভারি চার্জ বাদে বাকি টাকা ফেরত দেওয়া হবে
              </span>
            </li>
            <li className='flex items-start'>
              <span className='bg-blue-100 text-blue-600 rounded-full w-5 h-5 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0'>
                •
              </span>
              <span className='text-gray-700'>
                ত্রুটিযুক্ত পণ্যের ক্ষেত্রে আনবক্সিং ভিডিও আমাদের কাছে পাঠাতে হবে
              </span>
            </li>
            <li className='flex items-start'>
              <span className='bg-blue-100 text-blue-600 rounded-full w-5 h-5 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0'>
                •
              </span>
              <span className='text-gray-700'>
                ডেলিভারি ম্যান চলে যাওয়ার পর ফেরত দিতে চাইলে ডেলিভারি চার্জসহ ফেরত দিতে হবে
              </span>
            </li>
          </ul>
        </div>

        <div>
          <h3 className='text-lg sm:text-xl font-medium mb-3 text-blue-600'>১.৩ মূল্য ফেরত</h3>
          <p className='text-gray-700'>
            অর্ডার বাতিলের ক্ষেত্রে <span className='font-medium'>৩ ঘণ্টার মধ্যে</span> টাকা ফেরত।
            পণ্য ফেরতের ক্ষেত্রে আমাদের কাছে পৌঁছানোর{' '}
            <span className='font-medium'>১২ ঘণ্টার মধ্যে</span> ফেরত দেওয়া হবে। বিকাশ/নগদে
            লেনদেনের ক্ষেত্রে যথাক্রমে <span className='font-medium'>১.৫% ও ১.২%</span> চার্জ কাটা
            হবে (ত্রুটির ক্ষেত্রে চার্জ প্রযোজ্য নয়)।
          </p>
        </div>
      </motion.div>

      {/* Section 2 */}
      <motion.div
        variants={fadeIn}
        className='bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 sm:p-8 mb-8 border border-gray-100'
      >
        <h2 className='text-xl sm:text-2xl font-semibold text-gray-800 mb-6 pb-2 border-b border-blue-100'>
          ২. সেলারদের জন্য শর্তাবলী
        </h2>

        <div className='mb-8'>
          <h3 className='text-lg sm:text-xl font-medium mb-3 text-blue-600'>
            ২.১ অর্ডার প্রক্রিয়াকরণ
          </h3>
          <p className='text-gray-700'>
            প্রথম অর্ডারের ডেলিভারি চার্জ <span className='font-medium'>অগ্রিম নেওয়া হবে</span>।
            গ্রাহক না পেলে বা পণ্য নিতে অস্বীকার করলে ডেলিভারি চার্জ সেলার বহন করবেন।
          </p>
        </div>

        <div>
          <h3 className='text-lg sm:text-xl font-medium mb-3 text-blue-600'>২.২ প্রফিট উত্তোলন</h3>
          <p className='text-gray-700'>
            পণ্য ডেলিভারির <span className='font-medium'>২৪ ঘণ্টার মধ্যে</span> প্রফিট আপনার
            অ্যাকাউন্টে যোগ হবে। যেকোনো সময় উত্তোলন করতে পারবেন।
          </p>
        </div>
      </motion.div>

      {/* Section 3 */}
      <motion.div
        variants={fadeIn}
        className='bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 sm:p-8 mb-8 border border-gray-100'
      >
        <h2 className='text-xl sm:text-2xl font-semibold text-gray-800 mb-6 pb-2 border-b border-blue-100'>
          ৩. সাধারণ নীতিমালা
        </h2>

        <div className='mb-8'>
          <h3 className='text-lg sm:text-xl font-medium mb-3 text-blue-600'>
            ৩.১ অ্যাকাউন্ট নিরাপত্তা
          </h3>
          <p className='text-gray-700'>
            আপনার অ্যাকাউন্ট তথ্য <span className='font-medium'>গোপন রাখুন</span>। আমরা কখনোই
            পাসওয়ার্ড জানতে চাইব না।
          </p>
        </div>

        <div>
          <h3 className='text-lg sm:text-xl font-medium mb-3 text-blue-600'>
            ৩.২ নীতিমালা পরিবর্তন
          </h3>
          <p className='text-gray-700'>
            আমরা যেকোনো সময় নীতিমালা পরিবর্তন করতে পারব। পরিবর্তিত নীতিমালা{' '}
            <span className='font-medium'>স্বয়ংক্রিয়ভাবে প্রযোজ্য</span> হবে।
          </p>
        </div>
      </motion.div>

      {/* Contact Section */}
      <motion.div
        variants={fadeIn}
        className='bg-blue-50 rounded-xl shadow-sm p-6 sm:p-8 border border-blue-100'
      >
        <h2 className='text-xl sm:text-2xl font-semibold text-gray-800 mb-6 pb-2 border-b border-blue-200'>
          যোগাযোগ
        </h2>
        <div className='space-y-3'>
          <div className='flex items-center'>
            <span className='bg-blue-100 text-blue-600 rounded-lg w-10 h-10 flex items-center justify-center mr-4 flex-shrink-0'>
              📞
            </span>
            <span className='text-gray-700'>
              ফোন: <span className='font-medium'>09638755704</span>
            </span>
          </div>
          <div className='flex items-center'>
            <span className='bg-blue-100 text-blue-600 rounded-lg w-10 h-10 flex items-center justify-center mr-4 flex-shrink-0'>
              ✉️
            </span>
            <span className='text-gray-700'>
              ইমেইল: <span className='font-medium'>support@shopbdresellerjobs.shop</span>
            </span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default TermsAndConditions
