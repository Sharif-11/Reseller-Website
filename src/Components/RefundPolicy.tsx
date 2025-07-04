import { Helmet } from 'react-helmet'

const RefundPolicy = () => {
  return (
    <div className='max-w-4xl mx-auto px-4 py-8 font-sans'>
      <Helmet>
        <title>সহজ রিটার্ন পলিসি - শপ বিডি রিসেলার জবস | বাংলাদেশের সেরা অনলাইন শপ</title>
        <meta
          name='description'
          content='শপ বিডি রিসেলার জবস-এ কেনাকাটায় ১০০% সুরক্ষিত রিটার্ন পলিসি। যেকোনো ত্রুটিপূর্ণ পণ্য ফেরত দিন সহজেই!'
        />
      </Helmet>

      <div className='bg-white rounded-lg shadow-md overflow-hidden border border-gray-100'>
        {/* Vibrant Header Section */}
        <div className='bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-6 text-white'>
          <h1 className='text-2xl md:text-3xl font-bold'>শপ বিডি রিসেলার জবস - রিটার্ন পলিসি</h1>
          <p className='mt-2 text-blue-100'>কাস্টমার সন্তুষ্টিই আমাদের অগ্রাধিকার</p>
          <div className='mt-3 flex items-center'>
            <svg className='w-5 h-5 mr-2' fill='currentColor' viewBox='0 0 20 20'>
              <path
                fillRule='evenodd'
                d='M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z'
                clipRule='evenodd'
              />
            </svg>
            <span>ক্যাশ অন ডেলিভারি - সারা বাংলাদেশজুড়ে</span>
          </div>
        </div>

        {/* Main Content */}
        <div className='p-4 md:p-6'>
          {/* Introduction with icon */}
          <div className='mb-8 bg-blue-50 p-4 rounded-lg border border-blue-100'>
            <div className='flex items-start'>
              <svg
                className='w-6 h-6 text-blue-600 mr-3 mt-1 flex-shrink-0'
                fill='currentColor'
                viewBox='0 0 20 20'
              >
                <path
                  fillRule='evenodd'
                  d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z'
                  clipRule='evenodd'
                />
              </svg>
              <p className='text-gray-700'>
                <span className='font-semibold text-blue-800'>সতর্কতা:</span> আমরা কুরিয়ার
                সার্ভিসের মাধ্যমে সারা বাংলাদেশে ক্যাশ অন ডেলিভারি সুবিধা প্রদান করি। পণ্য গ্রহণের
                সময় অবশ্যই আমাদের ডেলিভারি এজেন্টের উপস্থিতিতে পণ্য পরীক্ষা করে নিন। নিচের রিটার্ন
                পলিসি ভালোভাবে পড়ে নিন যাতে আপনার কেনাকাটা সম্পূর্ণ ঝামেলামুক্ত হয়।
              </p>
            </div>
          </div>

          {/* Return Policy Section */}
          <div className='mb-8'>
            <h2 className='text-xl md:text-2xl font-semibold mb-4 text-gray-800 border-b-2 border-blue-200 pb-2 flex items-center'>
              <svg className='w-6 h-6 text-red-500 mr-2' fill='currentColor' viewBox='0 0 20 20'>
                <path
                  fillRule='evenodd'
                  d='M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z'
                  clipRule='evenodd'
                />
              </svg>
              পণ্য রিটার্ন নীতিমালা
            </h2>

            <div className='space-y-4'>
              <div className='bg-gray-50 p-4 rounded-lg border-l-4 border-blue-500 hover:bg-blue-50 transition duration-200'>
                <h3 className='font-medium text-gray-800 flex items-center'>
                  <svg
                    className='w-5 h-5 text-green-500 mr-2'
                    fill='currentColor'
                    viewBox='0 0 20 20'
                  >
                    <path
                      fillRule='evenodd'
                      d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                      clipRule='evenodd'
                    />
                  </svg>
                  ডেলিভারি সময় পণ্য পরীক্ষা
                </h3>
                <p className='text-gray-700 mt-1 pl-7'>
                  ডেলিভারি কর্মীর উপস্থিতিতে পণ্য অবশ্যই পরীক্ষা করে নিন। ত্রুটিপূর্ণ পণ্য পেলে সাথে
                  সাথে ফেরত দিন। আমরা পণ্য পুনরায় পরীক্ষা করে{' '}
                  <span className='font-semibold'>২৪ ঘন্টার মধ্যে</span> নতুনটি পাঠিয়ে দেব বা
                  অর্ডার বাতিল করে টাকা ফেরত দেব।
                </p>
              </div>

              <div className='bg-gray-50 p-4 rounded-lg border-l-4 border-purple-500 hover:bg-purple-50 transition duration-200'>
                <h3 className='font-medium text-gray-800 flex items-center'>
                  <svg
                    className='w-5 h-5 text-purple-500 mr-2'
                    fill='currentColor'
                    viewBox='0 0 20 20'
                  >
                    <path d='M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-1.447-.894l-4 2a1 1 0 00-.553.894V17zM15.211 6.276a1 1 0 000-1.788l-4.764-2.382a1 1 0 00-.894 0L4.789 4.488a1 1 0 000 1.788l4.764 2.382a1 1 0 00.894 0l4.764-2.382zM4.447 8.342A1 1 0 003 9.236V15a1 1 0 00.553.894l4 2A1 1 0 009 17v-5.764a1 1 0 00-.553-.894l-4-2z' />
                  </svg>
                  ত্রুটির ধরন অনুযায়ী রিফান্ড
                </h3>
                <p className='text-gray-700 mt-1 pl-7'>
                  পণ্যে{' '}
                  <span className='font-semibold'>প্রকৃত ত্রুটি থাকলে সম্পূর্ণ টাকা ফেরত</span>।
                  ত্রুটি না থাকলে শুধু ডেলিভারি চার্জ কেটে বাকি টাকা ফেরত দেওয়া হবে। ডেলিভারি চার্জ
                  সেলার বহন করবেন যদি কাস্টমার অগ্রিম পেমেন্ট না করে থাকে।
                </p>
              </div>

              <div className='bg-gray-50 p-4 rounded-lg border-l-4 border-red-500 hover:bg-red-50 transition duration-200'>
                <h3 className='font-medium text-gray-800 flex items-center'>
                  <svg
                    className='w-5 h-5 text-red-500 mr-2'
                    fill='currentColor'
                    viewBox='0 0 20 20'
                  >
                    <path
                      fillRule='evenodd'
                      d='M4 5a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2h-1.586a1 1 0 01-.707-.293l-1.121-1.121A2 2 0 0011.172 3H8.828a2 2 0 00-1.414.586L6.293 4.707A1 1 0 015.586 5H4zm6 9a3 3 0 100-6 3 3 0 000 6z'
                      clipRule='evenodd'
                    />
                  </svg>
                  ভিডিও প্রমাণ জমা দেওয়া
                </h3>
                <p className='text-gray-700 mt-1 pl-7'>
                  ত্রুটিপূর্ণ পণ্যের ক্ষেত্রে <span className='font-semibold'>আনবক্সিং ভিডিও</span>{' '}
                  আমাদের কাছে পাঠান। ভিডিওতে পণ্যের আইডি এবং ত্রুটি স্পষ্টভাবে দেখা যেতে হবে। ভিডিও
                  যাচাই সাপেক্ষে আমরা ডেলিভারি চার্জ ফেরত দেব।
                </p>
              </div>

              <div className='bg-gray-50 p-4 rounded-lg border-l-4 border-orange-500 hover:bg-orange-50 transition duration-200'>
                <h3 className='font-medium text-gray-800 flex items-center'>
                  <svg
                    className='w-5 h-5 text-orange-500 mr-2'
                    fill='currentColor'
                    viewBox='0 0 20 20'
                  >
                    <path
                      fillRule='evenodd'
                      d='M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z'
                      clipRule='evenodd'
                    />
                  </svg>
                  পরবর্তীতে রিটার্ন
                </h3>
                <p className='text-gray-700 mt-1 pl-7'>
                  ডেলিভারি কর্মী চলে যাওয়ার পর রিটার্ন করতে চাইলে{' '}
                  <span className='font-semibold'>ডেলিভারি চার্জসহ পণ্য ফেরত</span> দিতে হবে।
                  ব্যবহৃত বা ধোয়া পণ্য ফেরত গ্রহণযোগ্য নয়। প্যাকেট অক্ষত অবস্থায় ফেরত দিতে হবে।
                  রিটার্নের জন্য আমাদের হেল্পলাইনে যোগাযোগ করুন।
                </p>
              </div>
            </div>
          </div>

          {/* Refund Policy Section */}
          <div className='mb-8'>
            <h2 className='text-xl md:text-2xl font-semibold mb-4 text-gray-800 border-b-2 border-green-200 pb-2 flex items-center'>
              <svg className='w-6 h-6 text-green-600 mr-2' fill='currentColor' viewBox='0 0 20 20'>
                <path d='M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z' />
                <path
                  fillRule='evenodd'
                  d='M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z'
                  clipRule='evenodd'
                />
              </svg>
              টাকা ফেরত নীতিমালা
            </h2>

            <div className='bg-green-50 p-4 rounded-lg border border-green-200'>
              <h3 className='font-medium text-green-800 text-lg flex items-center'>
                <svg
                  className='w-5 h-5 text-green-600 mr-2'
                  fill='currentColor'
                  viewBox='0 0 20 20'
                >
                  <path
                    fillRule='evenodd'
                    d='M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z'
                    clipRule='evenodd'
                  />
                </svg>
                ঝামেলামুক্ত রিফান্ড প্রক্রিয়া
              </h3>
              <ul className='list-disc pl-5 space-y-2 mt-2 text-gray-700'>
                <li className='flex items-start'>
                  <svg
                    className='w-4 h-4 text-green-500 mr-2 mt-1 flex-shrink-0'
                    fill='currentColor'
                    viewBox='0 0 20 20'
                  >
                    <path
                      fillRule='evenodd'
                      d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                      clipRule='evenodd'
                    />
                  </svg>
                  <span>
                    রিটার্ন অনুমোদনের <span className='font-semibold'>২৪ ঘন্টার মধ্যে</span> টাকা
                    ফেরত (ব্যাংকিং প্রক্রিয়ার সময় বাদে)
                  </span>
                </li>
                <li className='flex items-start'>
                  <svg
                    className='w-4 h-4 text-green-500 mr-2 mt-1 flex-shrink-0'
                    fill='currentColor'
                    viewBox='0 0 20 20'
                  >
                    <path
                      fillRule='evenodd'
                      d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                      clipRule='evenodd'
                    />
                  </svg>
                  <span>যে অ্যাকাউন্ট/মোবাইল নম্বর থেকে পেমেন্ট সেই অ্যাকাউন্টেই রিফান্ড</span>
                </li>
                <li className='flex items-start'>
                  <svg
                    className='w-4 h-4 text-green-500 mr-2 mt-1 flex-shrink-0'
                    fill='currentColor'
                    viewBox='0 0 20 20'
                  >
                    <path
                      fillRule='evenodd'
                      d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                      clipRule='evenodd'
                    />
                  </svg>
                  <span>ভিন্ন অ্যাকাউন্টে রিফান্ডের অনুরোধ গ্রহণযোগ্য নয় (সিকিউরিটি কারণে)</span>
                </li>
                <li className='flex items-start'>
                  <svg
                    className='w-4 h-4 text-green-500 mr-2 mt-1 flex-shrink-0'
                    fill='currentColor'
                    viewBox='0 0 20 20'
                  >
                    <path
                      fillRule='evenodd'
                      d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                      clipRule='evenodd'
                    />
                  </svg>
                  <span>
                    ২৪ ঘন্টার মধ্যে টাকা না পেলে আমাদের সাথে{' '}
                    <span className='font-semibold'>অবশ্যই</span> যোগাযোগ করুন
                  </span>
                </li>
                <li className='flex items-start'>
                  <svg
                    className='w-4 h-4 text-green-500 mr-2 mt-1 flex-shrink-0'
                    fill='currentColor'
                    viewBox='0 0 20 20'
                  >
                    <path
                      fillRule='evenodd'
                      d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                      clipRule='evenodd'
                    />
                  </svg>
                  <span>অতিরিক্ত ২৪ ঘন্টার মধ্যে সমস্যার সমাধান করা হবে</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Contact Information */}
          <div className='bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-lg border border-yellow-200 shadow-sm'>
            <h3 className='font-medium text-yellow-900 text-lg flex items-center'>
              <svg className='w-5 h-5 text-yellow-600 mr-2' fill='currentColor' viewBox='0 0 20 20'>
                <path
                  d='M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z'
                />
              </svg>
              সহযোগিতা প্রয়োজন?
            </h3>
            <p className='text-gray-700 mt-2'>
              রিফান্ড সংক্রান্ত কোনো সমস্যা হলে আমাদের সাথে যেকোনো সময় যোগাযোগ করুন। আমরা আপনাকে
              সাহায্য করতে পেরে খুশি হব।
            </p>
            <div className='mt-4 grid grid-cols-1 md:grid-cols-2 gap-3'>
              <a
                href='tel:09638755704'
                className='bg-white p-3 rounded-lg border border-gray-200 hover:border-blue-400 transition duration-200 flex items-center'
              >
                <svg className='w-6 h-6 text-blue-500 mr-3' fill='currentColor' viewBox='0 0 20 20'>
                  <path d='M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z' />
                </svg>
                <div>
                  <p className='text-xs text-gray-500'>কল করুন</p>
                  <p className='font-medium'>09638755704</p>
                </div>
              </a>
              <a
                href='mailto:support@shopbasebd.com'
                className='bg-white p-3 rounded-lg border border-gray-200 hover:border-red-400 transition duration-200 flex items-center'
              >
                <svg className='w-6 h-6 text-red-500 mr-3' fill='currentColor' viewBox='0 0 20 20'>
                  <path d='M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z' />
                  <path d='M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z' />
                </svg>
                <div>
                  <p className='text-xs text-gray-500'>ইমেইল করুন</p>
                  <p className='font-medium text-xs'>support@shopbdresellerjobs.shop</p>
                </div>
              </a>
            </div>
            <div className='mt-4 bg-white p-3 rounded-lg border border-gray-200'>
              <p className='text-sm text-gray-600'>
                <span className='font-semibold'>নোট:</span> ফোন কলের সময় সকাল ৯টা থেকে রাত ১০টা
                পর্যন্ত। ইমেইলের জবাব পেতে ২৪ ঘন্টা সময় লাগতে পারে।
              </p>
            </div>
          </div>

          {/* Trust Badges */}
          <div className='mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 text-center'>
            <div className='bg-gray-50 p-3 rounded-lg border border-gray-200'>
              <svg
                className='w-8 h-8 text-green-500 mx-auto mb-2'
                fill='currentColor'
                viewBox='0 0 20 20'
              >
                <path
                  fillRule='evenodd'
                  d='M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                  clipRule='evenodd'
                />
              </svg>
              <p className='text-sm font-medium'>১০০% সুরক্ষিত</p>
            </div>
            <div className='bg-gray-50 p-3 rounded-lg border border-gray-200'>
              <svg
                className='w-8 h-8 text-blue-500 mx-auto mb-2'
                fill='currentColor'
                viewBox='0 0 20 20'
              >
                <path d='M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z' />
              </svg>
              <p className='text-sm font-medium'>দ্রুত নোটিফিকেশন</p>
            </div>
            <div className='bg-gray-50 p-3 rounded-lg border border-gray-200'>
              <svg
                className='w-8 h-8 text-purple-500 mx-auto mb-2'
                fill='currentColor'
                viewBox='0 0 20 20'
              >
                <path
                  fillRule='evenodd'
                  d='M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z'
                  clipRule='evenodd'
                />
              </svg>
              <p className='text-sm font-medium'>দ্রুত রিফান্ড</p>
            </div>
            <div className='bg-gray-50 p-3 rounded-lg border border-gray-200'>
              <svg
                className='w-8 h-8 text-orange-500 mx-auto mb-2'
                fill='currentColor'
                viewBox='0 0 20 20'
              >
                <path
                  fillRule='evenodd'
                  d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z'
                  clipRule='evenodd'
                />
              </svg>
              <p className='text-sm font-medium'>২৪/৭ সাপোর্ট</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RefundPolicy
