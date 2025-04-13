import { FaQuestionCircle } from 'react-icons/fa';
import { NavLink } from 'react-router-dom';

const FAQSection = () => {
  const faqs = [
    {
      question: 'শপবেইজ বিডি কি?',
      answer: 'শপবেইজ বিডি একটি সম্পূর্ণ অটোমেটেড অনলাইন প্রোডাক্ট রিসেলিং বিজনেস এর সহযোগী প্লাটফর্ম।'
    },
    {
      question: 'ডেলিভারি চার্জ কত?',
      answer: 'ডেলিভারি চার্জ ঢাকার মধ্যে ৭০ টাকা ঢাকার বাইরে ১২০ টাকা। প্রোডাক্টের সংখ্যা বেশি হলে অথবা ওজন বেশি হলে ডেলিভারি চার্জ অতিরিক্ত হিসেবে ১০ থেকে ৩০ টাকা পর্যন্ত বাড়তে পারে।'
    },
    {
      question: 'রিটার্নের জন্য কোন চার্জ আছে কি?',
      answer: 'না, আমাদের কোন প্রকার রিটার্ন চার্জ নেওয়া হয় না।'
    },
    {
      question: 'নতুন সেলারদের জন্য ডেলিভারি চার্জের নিয়ম কি?',
      answer: 'নতুন সেলারের ক্ষেত্রে প্রথম ৫ টি অর্ডারের ডেলিভারি চার্জ অগ্রিম দিতে হবে। পাঁচটি অর্ডার ডেলিভারি হলে তখন আর অগ্রিম দিতে হবে না।'
    },
    {
      question: 'এক্সচেঞ্জ অর্ডার এর সুবিধা আছে কি?',
      answer: 'জি, ডেলিভারি ম্যান দাঁড়িয়ে থাকা অবস্থায় প্রোডাক্টটি চেক করে নিতে হবে, প্রোডাক্ট এর কোন ত্রুটি বের হলে আমাদের খরচে আবার আমরা প্রোডাক্ট পাঠিয়ে দেব, ডেলিভারি ম্যান চলে আসার পর এক্সচেঞ্জ করে নিতে চাইলে সে ক্ষেত্রে ডেলিভারি চার্জ আবার দিতে হবে।'
    },
    {
      question: 'অর্ডার কনফার্ম হলে কখন বুকিং দেওয়া হয়?',
      answer: 'বিকেল তিনটার মধ্যে অর্ডার কনফার্ম করা হলে সন্ধ্যার মধ্যেই বুকিং দেওয়া হয়ে থাকে। তিনটার পরের অর্ডার পরের দিন বুকিং দেওয়া হয়।'
    },
    {
      question: 'প্রফিটের টাকা কখন পাবো এবং উত্তোলন করতে কত সময় লাগে?',
      answer: 'আপনার প্রোডাক্টটি ডেলিভারি হয়ে গেলে ঐদিন রাত বারোটার পর আপনার একাউন্টে প্রফিটের টাকা যোগ হয়ে যাবে। প্রফিটের টাকা যোগ হওয়ার সাথে সাথেই আপনি আপনার নগদ অথবা বিকাশে উত্তোলন করে নিতে পারবেন। অ্যাপস থেকে পেমেন্ট রিকোয়েস্ট দেওয়ার সর্বোচ্চ ১ ঘণ্টার মধ্যে আপনার একাউন্টে টাকা চলে যাবে।'
    },
    {
      question: 'একাধিক প্রোডাক্ট একসাথে অর্ডার করা যাবে কি?',
      answer: 'জি, আমাদের অ্যাপসে থাকা যেকোনো প্রোডাক্টের সাথে অন্য যেকোনো প্রোডাক্ট এড করে একই ঠিকানায় একটিমাত্র ডেলিভারি চার্জ দিয়েই পাঠাতে পারবেন।'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="flex items-center gap-3 mb-6 md:mb-8">
          <FaQuestionCircle className="text-4xl text-indigo-600" />
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">সাধারণ প্রশ্নাবলী</h1>
            <p className="text-gray-600">বিক্রেতাদের সাধারণ কিছু প্রশ্ন ও উত্তর</p>
          </div>
        </div>

        {/* FAQ List */}
        <div className="bg-white rounded-lg shadow-sm p-5 md:p-6">
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="border-b border-gray-100 pb-4 last:border-0">
                <details className="group">
                  <summary className="flex justify-between items-center font-medium text-gray-800 cursor-pointer list-none">
                    <span>{faq.question}</span>
                    <svg
                      className="h-5 w-5 text-gray-500 group-open:rotate-180 transform transition-transform"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </summary>
                  <p className="mt-2 text-gray-600 pl-2">{faq.answer}</p>
                </details>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Help Section */}
        <div className="mt-8 bg-indigo-50 rounded-lg p-5 md:p-6 border border-indigo-100">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-4 md:mb-0">
              <h3 className="text-lg font-semibold text-indigo-800">আরো সাহায্য প্রয়োজন?</h3>
              <p className="text-indigo-600">আমাদের সাপোর্ট টিম আপনার জন্য সবসময় প্রস্তুত</p>
            </div>
            <NavLink
              to="/support"
              className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors inline-flex items-center"
            >
              সাপোর্ট সেন্টারে যান
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 ml-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </NavLink>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQSection;