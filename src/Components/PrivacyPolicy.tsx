import { Helmet } from 'react-helmet'

const PrivacyPolicy = () => {
  return (
    <div className='w-full px-4 py-6 md:py-8'>
      <div className='mx-auto max-w-lg md:max-w-3xl lg:max-w-4xl bg-white rounded-lg shadow-md p-4 md:p-6'>
        <Helmet>
          <title>গোপনীয়তা সংক্রান্ত নীতিমালা | রিসেলার বিডি</title>
          <meta name='description' content="রিসেলার বিডি'র গোপনীয়তা সংক্রান্ত নীতিমালা" />
        </Helmet>
        <h1 className='text-xl md:text-2xl font-bold text-center mb-4 md:mb-6'>
          গোপনীয়তা সংক্রান্ত নীতিমালা
        </h1>

        <div className='mb-6'>
          <p className='text-gray-600 text-xs md:text-sm mb-2'>কার্যকর তারিখ: ০১ জুন ২০২৫</p>
          <p className='text-gray-600 text-xs md:text-sm mb-2'>প্রস্তুতকারক: রিসেলার বিডি</p>
          <p className='text-gray-600 text-xs md:text-sm'>
            যোগাযোগের ঠিকানা: support@resellerbd.com
          </p>
        </div>

        <div className='mb-6'>
          <h2 className='text-lg md:text-xl font-semibold mb-3'>পরিচিতি</h2>
          <p className='text-gray-700 text-sm md:text-base mb-3'>
            রিসেলার বিডি আমাদের ব্যবহারকারীদের তথ্যের গোপনীয়তা রক্ষায় সর্বদা অঙ্গীকারবদ্ধ। এই
            নীতিমালায় বিস্তারিতভাবে বর্ণনা করা হয়েছে কিভাবে আমরা আপনার তথ্য সংগ্রহ করি, ব্যবহার
            করি এবং সুরক্ষিত রাখি যখন আপনি আমাদের অ্যাপ্লিকেশন ব্যবহার করেন। আমাদের ডাটা ব্যবস্থাপনা
            পদ্ধতি সম্পর্কে সম্পূর্ণ জানতে অনুগ্রহ করে এই নীতিমালাটি মনোযোগ সহকারে পড়ুন।
          </p>
        </div>

        <div className='mb-6'>
          <h2 className='text-lg md:text-xl font-semibold mb-3'>
            ১. আমরা যে ধরনের তথ্য সংগ্রহ করি
          </h2>
          <p className='text-gray-700 text-sm md:text-base'>
            আমরা কোনো ব্যক্তিগত বা সংবেদনশীল ব্যবহারকারীর তথ্য সংগ্রহ, প্রবেশ বা শেয়ার করি না, যদি
            না এখানে স্পষ্টভাবে উল্লেখ করা হয়। ভবিষ্যতে কোন আপডেটে যদি এই ধরনের তথ্য প্রয়োজন হয়,
            তবে এই নীতিমালা অনুসারে পরিবর্তন করা হবে।
          </p>
        </div>

        <div className='mb-6'>
          <h2 className='text-lg md:text-xl font-semibold mb-3'>২. আপনার তথ্য ব্যবহারের পদ্ধতি</h2>
          <p className='text-gray-700 text-sm md:text-base'>
            বর্তমানে, আমাদের অ্যাপ্লিকেশনটি কোনো ব্যক্তিগত বা সংবেদনশীল তথ্য সংগ্রহ করে না। যদি
            ভবিষ্যতে এই অবস্থা পরিবর্তিত হয়, আমরা পরিষ্কার ও স্বচ্ছ সম্মতি প্রক্রিয়া চালু করব এবং
            সমস্ত ডাটা সুরক্ষা আইন মেনে চলব।
          </p>
        </div>

        <div className='mb-6'>
          <h2 className='text-lg md:text-xl font-semibold mb-3'>৩. তথ্য শেয়ারিং</h2>
          <p className='text-gray-700 text-sm md:text-base'>
            আমরা অন্য কোনো তৃতীয় পক্ষের সাথে ব্যবহারকারীর তথ্য শেয়ার করি না। যদি কোনো নতুন ফিচার
            বা আপডেটে তথ্য শেয়ারিং প্রয়োজন হয়, তাহলে এই নীতিমালা আপডেট করা হবে এবং ব্যবহারকারীর
            অনুমতি নেওয়া হবে।
          </p>
        </div>

        <div className='mb-6'>
          <h2 className='text-lg md:text-xl font-semibold mb-3'>৪. তথ্য সুরক্ষা</h2>
          <p className='text-gray-700 text-sm md:text-base'>
            আমরা আধুনিক মানসম্মত সুরক্ষা ব্যবস্থা বাস্তবায়নের মাধ্যমে আপনার তথ্য সুরক্ষিত রাখতে
            প্রতিশ্রুতিবদ্ধ। এখন পর্যন্ত, যেহেতু কোনো ব্যক্তিগত বা সংবেদনশীল ব্যবহারকারীর তথ্য
            সংগ্রহ করা হয় না, সেহেতু কোনো অতিরিক্ত সুরক্ষা প্রটোকল প্রয়োজন হয় না।
          </p>
        </div>

        <div className='mb-6'>
          <h2 className='text-lg md:text-xl font-semibold mb-3'>৫. তথ্য সংরক্ষণ এবং অপসারণ</h2>
          <p className='text-gray-700 text-sm md:text-base'>
            যেহেতু অ্যাপ্লিকেশনটি বর্তমানে কোনো ব্যক্তিগত তথ্য সংগ্রহ করে না, তাই এই মুহূর্তে কোনো
            তথ্য সংরক্ষণ বা অপসারণ নীতি প্রযোজ্য নয়। ভবিষ্যতে যদি এটি পরিবর্তিত হয়, ব্যবহারকারীদের
            নিজেদের তথ্য দেখার, পরিবর্তন করার বা মুছে ফেলার সুস্পষ্ট পদ্ধতি প্রদান করা হবে।
          </p>
        </div>

        <div className='mb-6'>
          <h2 className='text-lg md:text-xl font-semibold mb-3'>৬. তৃতীয় পক্ষের সেবাসমূহ</h2>
          <p className='text-gray-700 text-sm md:text-base'>
            আমাদের অ্যাপ্লিকেশনে তথ্যমূলক উদ্দেশ্যে বাহ্যিক ওয়েবসাইট বা পরিষেবার লিংক থাকতে পারে।
            আমরা সেইসব তৃতীয় পক্ষের সাইটগুলোর গোপনীয়তা অনুশীলনের জন্য দায়বদ্ধ নই এবং আপনাকে তাদের
            নীতিমালা পর্যালোচনা করার পরামর্শ দিই।
          </p>
        </div>

        <div className='mb-6'>
          <h2 className='text-lg md:text-xl font-semibold mb-3'>৭. নীতিমালার পরিবর্তন</h2>
          <p className='text-gray-700 text-sm md:text-base'>
            আমরা আমাদের কার্যপ্রণালির পরিবর্তন অনুযায়ী সময়ে সময়ে এই গোপনীয়তা নীতিমালা হালনাগাদ
            করতে পারি। গুরুত্বপূর্ণ পরিবর্তনগুলি সম্পর্কে ব্যবহারকারীদের অ্যাপ্লিকেশনের মাধ্যমে অথবা
            ইমেলের মাধ্যমে অবহিত করা হবে।
          </p>
        </div>

        <div className='mb-6'>
          <h2 className='text-lg md:text-xl font-semibold mb-3'>৮. যোগাযোগের ঠিকানা</h2>
          <p className='text-gray-700 text-sm md:text-base mb-2'>
            এই গোপনীয়তা নীতিমালা সম্পর্কে আপনার যদি কোনো প্রশ্ন বা উদ্বেগ থাকে, আপনি আমাদের সাথে
            যোগাযোগ করতে পারেন:
          </p>
          <p className='text-gray-700 text-sm md:text-base mb-1'>ইমেইল: support@resellerbd.com</p>
          <p className='text-gray-700 text-sm md:text-base'>ওয়েবসাইট: www.resellerbd.com</p>
        </div>

        <div>
          <h2 className='text-lg md:text-xl font-semibold mb-3'>৯. নীতিমালার প্রাপ্যতা</h2>
          <p className='text-gray-700 text-sm md:text-base'>
            এই গোপনীয়তা নীতিমালা আমাদের ওয়েবসাইটে "গোপনীয়তা নীতিমালা" মেনুতে এবং অ্যাপ্লিকেশনের
            ভিতরে সহজেই অ্যাক্সেসযোগ্য।
          </p>
        </div>
      </div>
    </div>
  )
}

export default PrivacyPolicy
