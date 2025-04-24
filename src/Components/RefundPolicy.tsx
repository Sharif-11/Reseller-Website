import { Helmet } from 'react-helmet'

const RefundPolicy = () => {
  return (
    <div className='max-w-4xl mx-auto px-4 py-8 font-sans'>
      <Helmet>
        <title>রিটার্ন ও রিফান্ড পলিসি - রিসেলার বিডি</title>
        <meta
          name='description'
          content='আমাদের পণ্য রিটার্ন ও টাকা ফেরত নীতিমালা সম্পর্কে বিস্তারিত জানুন'
        />
      </Helmet>

      <div className='bg-white rounded-lg shadow-md overflow-hidden'>
        {/* Header Section */}
        <div className=' px-6 py-4'>
          <h1 className='text-2xl md:text-3xl font-bold'>রিটার্ন ও রিফান্ড নীতিমালা</h1>
          <p className=' mt-2'>ক্যাশ অন ডেলিভারি সার্ভিস - সারা বাংলাদেশ</p>
        </div>

        {/* Main Content */}
        <div className='p-6'>
          {/* Introduction */}
          <div className='mb-8'>
            <p className='text-gray-700'>
              আমরা কুরিয়ার সার্ভিসের মাধ্যমে সারা বাংলাদেশে ক্যাশ অন ডেলিভারি সুবিধা প্রদান করি।
              পণ্য গ্রহণের সময় সতর্কতা অবলম্বন করুন এবং আমাদের রিটার্ন পলিসি ভালোভাবে পড়ে নিন।
            </p>
          </div>

          {/* Return Policy Section */}
          <div className='mb-8'>
            <h2 className='text-xl font-semibold mb-4 text-gray-800 border-b pb-2'>
              পণ্য রিটার্ন নীতিমালা
            </h2>

            <div className='space-y-4'>
              <div className='bg-gray-50 p-4 rounded-lg'>
                <h3 className='font-medium text-gray-800'>ডেলিভারি সময় পরীক্ষা</h3>
                <p className='text-gray-700 mt-1'>
                  ডেলিভারি কর্মীর উপস্থিতিতে পণ্য পরীক্ষা করে নিন। ত্রুটিপূর্ণ পণ্য সাথে সাথে ফেরত
                  দিন। আমরা পণ্য পুনরায় পরীক্ষা করে নতুনটি পাঠিয়ে দেব বা অর্ডার বাতিল করে টাকা
                  ফেরত দেব।
                </p>
              </div>

              <div className='bg-gray-50 p-4 rounded-lg'>
                <h3 className='font-medium text-gray-800'>ত্রুটির ধরন অনুযায়ী রিফান্ড</h3>
                <p className='text-gray-700 mt-1'>
                  পণ্যে প্রকৃত ত্রুটি থাকলে সম্পূর্ণ টাকা ফেরত। ত্রুটি না থাকলে শুধু ডেলিভারি চার্জ
                  কেটে বাকি টাকা ফেরত দেওয়া হবে। ডেলিভারি চার্জ সেলার বহন করবেন যদি কাস্টমার অগ্রিম
                  পেমেন্ট না করে থাকে।
                </p>
              </div>

              <div className='bg-gray-50 p-4 rounded-lg'>
                <h3 className='font-medium text-gray-800'>ভিডিও প্রমাণ জমা দেওয়া</h3>
                <p className='text-gray-700 mt-1'>
                  ত্রুটিপূর্ণ পণ্যের ক্ষেত্রে আনবক্সিং ভিডিও আমাদের কাছে পাঠান। ভিডিও যাচাই সাপেক্ষে
                  আমরা ডেলিভারি চার্জ ফেরত দেব।
                </p>
              </div>

              <div className='bg-gray-50 p-4 rounded-lg'>
                <h3 className='font-medium text-gray-800'>পরবর্তীতে রিটার্ন</h3>
                <p className='text-gray-700 mt-1'>
                  ডেলিভারি কর্মী চলে যাওয়ার পর রিটার্ন করতে চাইলে ডেলিভারি চার্জসহ পণ্য ফেরত দিতে
                  হবে। ব্যবহৃত বা ধোয়া পণ্য ফেরত গ্রহণযোগ্য নয়। প্যাকেট অক্ষত অবস্থায় ফেরত দিতে
                  হবে।
                </p>
              </div>
            </div>
          </div>

          {/* Refund Policy Section */}
          <div className='mb-8'>
            <h2 className='text-xl font-semibold mb-4 text-gray-800 border-b pb-2'>
              টাকা ফেরত নীতিমালা
            </h2>

            <div className='bg-blue-50 p-4 rounded-lg'>
              <h3 className='font-medium text-blue-800'>রিফান্ড প্রক্রিয়া</h3>
              <ul className='list-disc pl-5 space-y-2 mt-2 text-gray-700'>
                <li>রিটার্ন অনুমোদনের ২৪ ঘন্টার মধ্যে টাকা ফেরত</li>
                <li>যে অ্যাকাউন্ট থেকে পেমেন্ট সেই অ্যাকাউন্টেই রিফান্ড</li>
                <li>ভিন্ন অ্যাকাউন্টে রিফান্ডের অনুরোধ গ্রহণযোগ্য নয়</li>
                <li>২৪ ঘন্টার মধ্যে টাকা না পেলে আমাদের সাথে যোগাযোগ করুন</li>
                <li>অতিরিক্ত ২৪ ঘন্টার মধ্যে সমস্যার সমাধান করা হবে</li>
              </ul>
            </div>
          </div>

          {/* Contact Information */}
          <div className='bg-yellow-50 p-4 rounded-lg border border-yellow-200'>
            <h3 className='font-medium text-yellow-800'>জরুরি যোগাযোগ</h3>
            <p className='text-gray-700 mt-2'>
              রিফান্ড সংক্রান্ত কোনো সমস্যা হলে আমাদের সাপোর্ট নাম্বারে কল করুন বা ফেসবুক পেজে মেসেজ
              দিন।
            </p>
            <div className='mt-3 space-y-1'>
              <p className='text-sm'>
                <span className='font-medium'>ফোন:</span> 09638755704
              </p>
              <p className='text-sm'>
                <span className='font-medium'>ইমেইল:</span> support@shopbasebd.com
              </p>
              {/* <p className='text-sm'>
                <span className='font-medium'>ফেসবুক:</span> facebook.com/shopbasereseller
              </p> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RefundPolicy
