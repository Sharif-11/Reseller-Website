import {
  ChevronDown,
  Clock,
  Database,
  FileText,
  Globe,
  Link,
  Lock,
  Mail,
  Share2,
  Shield,
} from 'lucide-react'
import { useState } from 'react'
import { Helmet } from 'react-helmet'

const PrivacyPolicy = () => {
  const [activeSection, setActiveSection] = useState<number | null>(null)

  const toggleSection = (index: number): void => {
    setActiveSection(activeSection === index ? null : index)
  }

  const sections = [
    {
      title: '১. আমরা যে ধরনের তথ্য সংগ্রহ করি',
      content:
        'আমরা কোনো ব্যক্তিগত বা সংবেদনশীল ব্যবহারকারীর তথ্য সংগ্রহ, প্রবেশ বা শেয়ার করি না, যদি না এখানে স্পষ্টভাবে উল্লেখ করা হয়। ভবিষ্যতে কোন আপডেটে যদি এই ধরনের তথ্য প্রয়োজন হয়, তবে এই নীতিমালা অনুসারে পরিবর্তন করা হবে।',
      icon: <FileText className='w-5 h-5' />,
    },
    {
      title: '২. আপনার তথ্য ব্যবহারের পদ্ধতি',
      content:
        'বর্তমানে, আমাদের অ্যাপ্লিকেশনটি কোনো ব্যক্তিগত বা সংবেদনশীল তথ্য সংগ্রহ করে না। যদি ভবিষ্যতে এই অবস্থা পরিবর্তিত হয়, আমরা পরিষ্কার ও স্বচ্ছ সম্মতি প্রক্রিয়া চালু করব এবং সমস্ত ডাটা সুরক্ষা আইন মেনে চলব।',
      icon: <Database className='w-5 h-5' />,
    },
    {
      title: '৩. তথ্য শেয়ারিং',
      content:
        'আমরা অন্য কোনো তৃতীয় পক্ষের সাথে ব্যবহারকারীর তথ্য শেয়ার করি না। যদি কোনো নতুন ফিচার বা আপডেটে তথ্য শেয়ারিং প্রয়োজন হয়, তাহলে এই নীতিমালা আপডেট করা হবে এবং ব্যবহারকারীর অনুমতি নেওয়া হবে।',
      icon: <Share2 className='w-5 h-5' />,
    },
    {
      title: '৪. তথ্য সুরক্ষা',
      content:
        'আমরা আধুনিক মানসম্মত সুরক্ষা ব্যবস্থা বাস্তবায়নের মাধ্যমে আপনার তথ্য সুরক্ষিত রাখতে প্রতিশ্রুতিবদ্ধ। এখন পর্যন্ত, যেহেতু কোনো ব্যক্তিগত বা সংবেদনশীল ব্যবহারকারীর তথ্য সংগ্রহ করা হয় না, সেহেতু কোনো অতিরিক্ত সুরক্ষা প্রটোকল প্রয়োজন হয় না।',
      icon: <Lock className='w-5 h-5' />,
    },
    {
      title: '৫. তথ্য সংরক্ষণ এবং অপসারণ',
      content:
        'যেহেতু অ্যাপ্লিকেশনটি বর্তমানে কোনো ব্যক্তিগত তথ্য সংগ্রহ করে না, তাই এই মুহূর্তে কোনো তথ্য সংরক্ষণ বা অপসারণ নীতি প্রযোজ্য নয়। ভবিষ্যতে যদি এটি পরিবর্তিত হয়, ব্যবহারকারীদের নিজেদের তথ্য দেখার, পরিবর্তন করার বা মুছে ফেলার সুস্পষ্ট পদ্ধতি প্রদান করা হবে।',
      icon: <Database className='w-5 h-5' />,
    },
    {
      title: '৬. তৃতীয় পক্ষের সেবাসমূহ',
      content:
        'আমাদের অ্যাপ্লিকেশনে তথ্যমূলক উদ্দেশ্যে বাহ্যিক ওয়েবসাইট বা পরিষেবার লিংক থাকতে পারে। আমরা সেইসব তৃতীয় পক্ষের সাইটগুলোর গোপনীয়তা অনুশীলনের জন্য দায়বদ্ধ নই এবং আপনাকে তাদের নীতিমালা পর্যালোচনা করার পরামর্শ দিই।',
      icon: <Link className='w-5 h-5' />,
    },
    {
      title: '৭. নীতিমালার পরিবর্তন',
      content:
        'আমরা আমাদের কার্যপ্রণালির পরিবর্তন অনুযায়ী সময়ে সময়ে এই গোপনীয়তা নীতিমালা হালনাগাদ করতে পারি। গুরুত্বপূর্ণ পরিবর্তনগুলি সম্পর্কে ব্যবহারকারীদের অ্যাপ্লিকেশনের মাধ্যমে অথবা ইমেলের মাধ্যমে অবহিত করা হবে।',
      icon: <Clock className='w-5 h-5' />,
    },
    {
      title: '৮. যোগাযোগের ঠিকানা',
      content: (
        <div>
          <p className='mb-2'>
            এই গোপনীয়তা নীতিমালা সম্পর্কে আপনার যদি কোনো প্রশ্ন বা উদ্বেগ থাকে, আপনি আমাদের সাথে
            যোগাযোগ করতে পারেন:
          </p>
          <div className='flex items-center mb-1'>
            <Mail className='w-4 h-4 mr-2 text-indigo-600' />
            <p>support@shopbdresellerjobs.shop</p>
          </div>
          <div className='flex items-center'>
            <Globe className='w-4 h-4 mr-2 text-indigo-600' />
            <p>www.shopbdresellerjobs.shop</p>
          </div>
        </div>
      ),
      icon: <Mail className='w-5 h-5' />,
    },
    {
      title: '৯. নীতিমালার প্রাপ্যতা',
      content:
        'এই গোপনীয়তা নীতিমালা আমাদের ওয়েবসাইটে "গোপনীয়তা নীতিমালা" মেনুতে এবং অ্যাপ্লিকেশনের ভিতরে সহজেই অ্যাক্সেসযোগ্য।',
      icon: <FileText className='w-5 h-5' />,
    },
  ]

  return (
    <div className='bg-gradient-to-b from-gray-50 to-gray-100 min-h-screen'>
      <Helmet>
        <title>গোপনীয়তা সংক্রান্ত নীতিমালা | শপ বিডি রিসেলার জবস</title>
        <meta
          name='description'
          content='শপ বিডি রিসেলার জবস এর গোপনীয়তা সংক্রান্ত নীতিমালা - আমরা আপনার তথ্যের গোপনীয়তা ও নিরাপত্তা নিশ্চিত করি'
        />
      </Helmet>

      <div className='w-full px-4 py-4 sm:py-6 md:py-8'>
        <div className='mx-auto max-w-lg md:max-w-2xl lg:max-w-4xl bg-white rounded-xl shadow-lg overflow-hidden'>
          {/* Header Section with decorative elements */}
          <div className='relative bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-6 sm:px-6 sm:py-8 text-white'>
            <div className='absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-yellow-400 opacity-20 rounded-full'></div>
            <div className='absolute bottom-0 left-0 -mb-6 -ml-6 w-32 h-32 bg-blue-400 opacity-20 rounded-full'></div>

            <div className='relative flex items-center justify-center mb-2'>
              <Shield className='w-10 h-10 text-yellow-300' />
            </div>

            <h1 className='text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-2'>
              গোপনীয়তা সংক্রান্ত নীতিমালা
            </h1>

            <p className='text-center text-indigo-100 max-w-2xl mx-auto'>
              আপনার তথ্যের সুরক্ষা আমাদের কাছে অত্যন্ত গুরুত্বপূর্ণ। জেনে নিন কিভাবে আমরা আপনার তথ্য
              সংরক্ষণ করি।
            </p>
          </div>

          {/* Info cards */}
          <div className='px-4 py-6 sm:px-6'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-6'>
              <div className='bg-indigo-50 rounded-lg p-4 flex items-start'>
                <div className='bg-indigo-100 rounded-full p-2 mr-3'>
                  <Clock className='w-5 h-5 text-indigo-600' />
                </div>
                <div>
                  <h3 className='font-medium text-indigo-800'>কার্যকর তারিখ</h3>
                  <p className='text-indigo-600'>০১ জুন ২০২৫</p>
                </div>
              </div>

              <div className='bg-purple-50 rounded-lg p-4 flex items-start'>
                <div className='bg-purple-100 rounded-full p-2 mr-3'>
                  <Mail className='w-5 h-5 text-purple-600' />
                </div>
                <div>
                  <h3 className='font-medium text-purple-800'>যোগাযোগ</h3>
                  <p className='text-purple-600'>support@shopbdresellerjobs.shop</p>
                </div>
              </div>
            </div>

            {/* Introduction */}
            <div className='mb-8 bg-white rounded-lg p-4 border border-gray-100 shadow-sm'>
              <h2 className='text-lg sm:text-xl font-semibold mb-3 text-gray-800'>পরিচিতি</h2>
              <p className='text-gray-700 text-sm sm:text-base'>
                শপ বিডি রিসেলার জবস আমাদের ব্যবহারকারীদের তথ্যের গোপনীয়তা রক্ষায় সর্বদা
                অঙ্গীকারবদ্ধ। এই নীতিমালায় বিস্তারিতভাবে বর্ণনা করা হয়েছে কিভাবে আমরা আপনার তথ্য
                সংগ্রহ করি, ব্যবহার করি এবং সুরক্ষিত রাখি যখন আপনি আমাদের অ্যাপ্লিকেশন ব্যবহার করেন।
                আমাদের ডাটা ব্যবস্থাপনা পদ্ধতি সম্পর্কে সম্পূর্ণ জানতে অনুগ্রহ করে এই নীতিমালাটি
                মনোযোগ সহকারে পড়ুন।
              </p>
            </div>

            {/* Accordion for policy sections */}
            <div className='space-y-3'>
              {sections.map((section, index) => (
                <div
                  key={index}
                  className={`border border-gray-200 rounded-lg overflow-hidden transition-all duration-200 ${
                    activeSection === index ? 'shadow-md' : ''
                  }`}
                >
                  <button
                    className='w-full flex items-center justify-between p-4 text-left focus:outline-none'
                    onClick={() => toggleSection(index)}
                  >
                    <div className='flex items-center'>
                      <div
                        className={`mr-3 p-2 rounded-full ${
                          activeSection === index ? 'bg-indigo-100' : 'bg-gray-100'
                        }`}
                      >
                        {section.icon}
                      </div>
                      <h3
                        className={`font-medium ${
                          activeSection === index ? 'text-indigo-700' : 'text-gray-700'
                        }`}
                      >
                        {section.title}
                      </h3>
                    </div>
                    <ChevronDown
                      className={`w-5 h-5 transition-transform ${
                        activeSection === index
                          ? 'transform rotate-180 text-indigo-600'
                          : 'text-gray-400'
                      }`}
                    />
                  </button>

                  {activeSection === index && (
                    <div className='px-4 pb-4 pt-1 text-gray-600 bg-gray-50'>
                      {typeof section.content === 'string' ? (
                        <p>{section.content}</p>
                      ) : (
                        section.content
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className='mt-8 pt-6 border-t border-gray-200 text-center'>
              <p className='text-sm text-gray-500'>
                © {new Date().getFullYear()} শপ বিডি রিসেলার জবস। সর্বস্বত্ব সংরক্ষিত।
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PrivacyPolicy
