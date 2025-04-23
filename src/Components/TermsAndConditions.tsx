import { Helmet } from 'react-helmet'

const TermsAndConditions = () => {
  return (
    <div className='container mx-auto px-4 py-8 font-bangla'>
      <Helmet>
        <title>শর্তাবলী ও নীতিমালা - রিসেলার বিডি</title>
        <meta
          name='description'
          content='রিসেলার বিডির শর্তাবলী ও নীতিমালা সম্পর্কে বিস্তারিত জানুন'
        />
      </Helmet>

      <h1 className='text-2xl md:text-3xl font-bold text-center mb-8'>শর্তাবলী ও নীতিমালা</h1>

      <div className='bg-white rounded-lg shadow-md p-6 mb-6'>
        <h2 className='text-xl font-semibold mb-4'>১. ক্রয়-বিক্রয়ের শর্তাবলী</h2>

        <div className='mb-6'>
          <h3 className='text-lg font-medium mb-2'>১.১ ডেলিভারি সময়সীমা</h3>
          <p className='text-gray-700'>
            অর্ডার গ্রহণের পর ৪৮ ঘণ্টার মধ্যে পণ্য কুরিয়ারে হস্তান্তর করা হবে। সাধারণত ৭২ ঘণ্টার
            মধ্যে পণ্য গ্রাহকের কাছে পৌঁছে যাবে। অপ্রত্যাশিত ঘটনা বা প্রাকৃতিক দুর্যোগের ক্ষেত্রে
            সর্বোচ্চ ৫-৬ কর্মদিবস সময় লাগতে পারে।
          </p>
        </div>

        <div className='mb-6'>
          <h3 className='text-lg font-medium mb-2'>১.২ পণ্য ফেরত নীতিমালা</h3>
          <ul className='list-disc pl-5 space-y-2 text-gray-700'>
            <li>
              ডেলিভারি ম্যানের উপস্থিতিতে পণ্য পরীক্ষা করতে হবে। ত্রুটিপূর্ণ পণ্য সাথে সাথে ফেরত
              দিতে হবে
            </li>
            <li>
              ত্রুটিহীন পণ্য ইচ্ছাকৃতভাবে ফেরত দিলে ডেলিভারি চার্জ বাদে বাকি টাকা ফেরত দেওয়া হবে
            </li>
            <li>ত্রুটিযুক্ত পণ্যের ক্ষেত্রে আনবক্সিং ভিডিও আমাদের কাছে পাঠাতে হবে</li>
            <li>ডেলিভারি ম্যান চলে যাওয়ার পর ফেরত দিতে চাইলে ডেলিভারি চার্জসহ ফেরত দিতে হবে</li>
          </ul>
        </div>

        <div className='mb-6'>
          <h3 className='text-lg font-medium mb-2'>১.৩ মূল্য ফেরত</h3>
          <p className='text-gray-700'>
            অর্ডার বাতিলের ক্ষেত্রে ৩ ঘণ্টার মধ্যে টাকা ফেরত। পণ্য ফেরতের ক্ষেত্রে আমাদের কাছে
            পৌঁছানোর ১২ ঘণ্টার মধ্যে ফেরত দেওয়া হবে। বিকাশ/নগদে লেনদেনের ক্ষেত্রে যথাক্রমে ১.৫% ও
            ১.২% চার্জ কাটা হবে (ত্রুটির ক্ষেত্রে চার্জ প্রযোজ্য নয়)।
          </p>
        </div>
      </div>

      <div className='bg-white rounded-lg shadow-md p-6 mb-6'>
        <h2 className='text-xl font-semibold mb-4'>২. সেলারদের জন্য শর্তাবলী</h2>

        <div className='mb-4'>
          <h3 className='text-lg font-medium mb-2'>২.১ অর্ডার প্রক্রিয়াকরণ</h3>
          <p className='text-gray-700'>
            প্রথম ৫টি অর্ডারের ডেলিভারি চার্জ অগ্রিম নেওয়া হবে। গ্রাহক না পেলে বা পণ্য নিতে
            অস্বীকার করলে ডেলিভারি চার্জ সেলার বহন করবেন।
          </p>
        </div>

        <div className='mb-4'>
          <h3 className='text-lg font-medium mb-2'>২.২ প্রফিট উত্তোলন</h3>
          <p className='text-gray-700'>
            পণ্য ডেলিভারির ২৪ ঘণ্টার মধ্যে প্রফিট আপনার অ্যাকাউন্টে যোগ হবে। যেকোনো সময় উত্তোলন
            করতে পারবেন।
          </p>
        </div>
      </div>

      <div className='bg-white rounded-lg shadow-md p-6 mb-6'>
        <h2 className='text-xl font-semibold mb-4'>৩. সাধারণ নীতিমালা</h2>

        <div className='mb-4'>
          <h3 className='text-lg font-medium mb-2'>৩.১ অ্যাকাউন্ট নিরাপত্তা</h3>
          <p className='text-gray-700'>
            আপনার অ্যাকাউন্ট তথ্য গোপন রাখুন। আমরা কখনোই পাসওয়ার্ড জানতে চাইব না।
          </p>
        </div>

        <div className='mb-4'>
          <h3 className='text-lg font-medium mb-2'>৩.২ নীতিমালা পরিবর্তন</h3>
          <p className='text-gray-700'>
            আমরা যেকোনো সময় নীতিমালা পরিবর্তন করতে পারব। পরিবর্তিত নীতিমালা স্বয়ংক্রিয়ভাবে
            প্রযোজ্য হবে।
          </p>
        </div>
      </div>

      <div className='bg-white rounded-lg shadow-md p-6'>
        <h2 className='text-xl font-semibold mb-4'>যোগাযোগ</h2>
        <div className='space-y-2 text-gray-700'>
          <p>ফোন: ০৯৬৪৭৩০০১০০</p>
          <p>ইমেইল: support@resellerbd.com</p>
          <p>ঠিকানা: হাউস-৭১৭, রোড-১, মোহাম্মদপুর, ঢাকা-১২০৭</p>
        </div>
      </div>
    </div>
  )
}

export default TermsAndConditions
