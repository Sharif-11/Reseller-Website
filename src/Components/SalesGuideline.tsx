import { FaBox, FaHandshake, FaPhone, FaShieldAlt } from 'react-icons/fa'

const SalesGuidelines = () => {
  return (
    <div className='bg-white rounded-lg shadow-md p-6 my-6 border border-gray-200'>
      <h2 className='text-xl md:text-2xl font-bold text-gray-800 mb-6 pb-2 border-b border-gray-200 flex items-center'>
        <FaHandshake className='mr-2 text-blue-600' />
        শপ বিডি রিসেলার জবস - সেলস গাইডলাইন
      </h2>

      <div className='space-y-6'>
        {/* Order Section */}
        <div className='bg-blue-50 p-4 rounded-lg border border-blue-100'>
          <h3 className='text-lg font-semibold text-blue-800 mb-3 flex items-center'>
            <FaBox className='mr-2 text-blue-600' />
            অর্ডার সংক্রান্ত নিয়মাবলী
          </h3>
          <ul className='space-y-3 text-gray-700 pl-2'>
            <li className='flex items-start'>
              <span className='text-blue-600 mr-2'>•</span>
              <span>
                <strong className='text-blue-800'>অর্ডার গ্রহণ:</strong> ফেসবুক বা অন্য সোশ্যাল
                মিডিয়া থেকে অর্ডার নেওয়ার পর <strong className='text-blue-800'>অবশ্যই</strong>{' '}
                কাস্টমারের ফোনে কল করে নিশ্চিত করবেন। এতে ফেক অর্ডার কমবে।
              </span>
            </li>
            <li className='flex items-start'>
              <span className='text-blue-600 mr-2'>•</span>
              <span>
                <strong className='text-blue-800'>ডেলিভারি চার্জ:</strong> ফেক অর্ডার রোধ করতে
                কাস্টমারের কাছ থেকে{' '}
                <strong className='text-blue-800'>ডেলিভারি চার্জ আগাম নেওয়ার চেষ্টা করবেন</strong>।
                প্রাপ্ত ডেলিভারি চার্জ অবশ্যই শপ বিডি অ্যাপে পেমেন্ট করে অর্ডার প্লেস করবেন।
              </span>
            </li>
            <li className='flex items-start'>
              <span className='text-blue-600 mr-2'>•</span>
              <span>
                <strong className='text-blue-800'>অর্ডার যাচাইকরণ:</strong> যারা ডেলিভারি চার্জ
                দিবেন না, তাদের অর্ডার শপ বিডি অফিস থেকে কল করে ভেরিফাই করা হবে। ডেলিভারি চার্জ
                নিয়েও যারা পেমেন্ট করবেন না, তাদের বিরুদ্ধে ব্যবস্থা নেওয়া হবে।
              </span>
            </li>
          </ul>
        </div>

        {/* Account Security Section */}
        <div className='bg-green-50 p-4 rounded-lg border border-green-100'>
          <h3 className='text-lg font-semibold text-green-800 mb-3 flex items-center'>
            <FaShieldAlt className='mr-2 text-green-600' />
            অ্যাকাউন্ট নিরাপত্তা
          </h3>
          <ul className='space-y-3 text-gray-700 pl-2'>
            <li className='flex items-start'>
              <span className='text-green-600 mr-2'>•</span>
              <span>
                <strong className='text-green-800'>পাসওয়ার্ড শেয়ার নিষিদ্ধ:</strong> কোন অবস্থাতেই
                আপনার শপ বিডি অ্যাকাউন্টের পাসওয়ার্ড অন্য কাউকে দিবেন না। অ্যাকাউন্ট খোলার পর{' '}
                <strong className='text-green-800'>অবিলম্বে</strong> নগদ/বিকাশ নাম্বার যুক্ত করে
                ফেলুন।
              </span>
            </li>
            <li className='flex items-start'>
              <span className='text-green-600 mr-2'>•</span>
              <span>
                <strong className='text-green-800'>ফ্রী মেম্বারশিপ:</strong> শপ বিডি রিসেলার জবস-এ
                কাজ করতে বা সেলার কোড পেতে{' '}
                <strong className='text-green-800'>কোন ফী বা টাকার প্রয়োজন নেই</strong>। কাউকে টাকা
                দিবেন না বা নিবেন না।
              </span>
            </li>
            <li className='flex items-start'>
              <span className='text-green-600 mr-2'>•</span>
              <span>
                <strong className='text-green-800'>সমস্যা সমাধান:</strong> কোন সমস্যা হলে সাথে সাথে
                শপ বিডি সাপোর্টে যোগাযোগ করবেন (কল: <strong>09638755704</strong>)।
              </span>
            </li>
          </ul>
        </div>

        {/* General Advice */}
        <div className='bg-yellow-50 p-4 rounded-lg border border-yellow-100'>
          <h3 className='text-lg font-semibold text-yellow-800 mb-3 flex items-center'>
            <FaPhone className='mr-2 text-yellow-600' />
            সাধারণ পরামর্শ
          </h3>
          <div className='text-gray-700 space-y-2'>
            <p className='flex items-start'>
              <span className='text-yellow-600 mr-2'>•</span>
              <span>টিম লিডাররা এই গাইডলাইন সকল শপ বিডি মেম্বারের সাথে শেয়ার করবেন</span>
            </p>
            <p className='flex items-start'>
              <span className='text-yellow-600 mr-2'>•</span>
              <span>এই নিয়মগুলো মেনে চললে রিটার্ন কম আসবে এবং আপনার আয় বাড়বে</span>
            </p>
            <p className='flex items-start'>
              <span className='text-yellow-600 mr-2'>•</span>
              <span>শপ বিডি অ্যাপে নিয়মিত অর্ডার দিলে অতিরিক্ত বোনাস পাওয়া যাবে</span>
            </p>
            <p className='flex items-start'>
              <span className='text-yellow-600 mr-2'>•</span>
              <span>কোন প্রশ্ন থাকলে আমাদের সাপোর্ট টিমের সাথে যোগাযোগ করুন</span>
            </p>
          </div>
        </div>

        <div className='text-center mt-6 text-sm text-gray-500 border-t pt-4'>
          <p>এই নির্দেশিকা মেনে কাজ করলে শপ বিডি রিসেলার জবস প্লাটফর্মে আপনার ব্যবসা সফল হবে</p>
          <p className='font-medium text-blue-600 mt-1'>- শপ বিডি রিসেলার জবস টিম</p>
        </div>
      </div>
    </div>
  )
}

export default SalesGuidelines
