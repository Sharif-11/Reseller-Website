import {  FaRegSmile, FaLeaf, FaHeadset } from 'react-icons/fa';
import { GiTakeMyMoney, GiProgression } from 'react-icons/gi';
import { MdOutlineInventory, MdPayment } from 'react-icons/md';

const AboutUs = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
          রিসেলার বিডি - আপনার অনলাইন ব্যবসার সম্পূর্ণ সমাধান
        </h1>
        <div className="w-24 h-1 bg-indigo-600 mx-auto"></div>
      </div>

      {/* Why Choose Us Section */}
      <div className="mb-16">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
          কেন রিসেলার বিডি বেছে নিবেন?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="text-indigo-600 mb-3">
              <FaLeaf className="text-3xl" />
            </div>
            <h3 className="text-xl font-medium text-gray-800 mb-2">বিনা পুঁজিতে শুরু করুন</h3>
            <p className="text-gray-600">
              কোনো প্রাথমিক বিনিয়োগ ছাড়াই অনলাইন ব্যবসা শুরু করুন। আমাদের সাথে আপনাকে কোনো স্টক বা ইনভেন্টরি রাখতে হবে না।
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="text-indigo-600 mb-3">
              <GiTakeMyMoney className="text-3xl" />
            </div>
            <h3 className="text-xl font-medium text-gray-800 mb-2">লাভের নিশ্চয়তা</h3>
            <p className="text-gray-600">
              প্রতিটি পণ্যে ২০০-৫০০ টাকা পর্যন্ত লাভের সুযোগ। প্রতিদিনের আয় সরাসরি আপনার অ্যাকাউন্টে।
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="text-indigo-600 mb-3">
              <FaHeadset className="text-3xl" />
            </div>
            <h3 className="text-xl font-medium text-gray-800 mb-2">সম্পূর্ণ সহায়তা</h3>
            <p className="text-gray-600">
              নতুনদের জন্য ফ্রি ট্রেনিং এবং ২৪/৭ সাপোর্ট। আমরা আপনাকে প্রতিটি ধাপে গাইড করব।
            </p>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="mb-16">
        <h2 className="text-2xl font-semibold text-gray-800 mb-8 text-center">
          কিভাবে ব্যবসা করবেন?
        </h2>
        <div className="space-y-8">
          <div className="flex flex-col md:flex-row gap-6 items-center">
            <div className="bg-indigo-100 p-4 rounded-full text-indigo-600 md:order-1">
              <span className="text-2xl font-bold">১</span>
            </div>
            <div className="flex-1 bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-medium text-gray-800 mb-3">নিবন্ধন করুন</h3>
              <p className="text-gray-600">
                আমাদের ওয়েবসাইট বা অ্যাপে সম্পূর্ণ ফ্রিতে রেজিস্ট্রেশন করুন। কোনো লুকানো ফি নেই।
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-6 items-center">
            <div className="bg-indigo-100 p-4 rounded-full text-indigo-600 md:order-1">
              <span className="text-2xl font-bold">২</span>
            </div>
            <div className="flex-1 bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-medium text-gray-800 mb-3">পণ্য নির্বাচন করুন</h3>
              <p className="text-gray-600">
                আমাদের ভেরিফাইড পণ্য ক্যাটালগ থেকে কম দামে কোয়ালিটি পণ্য বাছাই করুন।
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-6 items-center">
            <div className="bg-indigo-100 p-4 rounded-full text-indigo-600 md:order-1">
              <span className="text-2xl font-bold">৩</span>
            </div>
            <div className="flex-1 bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-medium text-gray-800 mb-3">বিক্রয় করুন</h3>
              <p className="text-gray-600">
                ফেসবুক বা অন্যান্য প্ল্যাটফর্মে পণ্য প্রচার করুন এবং অর্ডার সংগ্রহ করুন।
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-6 items-center">
            <div className="bg-indigo-100 p-4 rounded-full text-indigo-600 md:order-1">
              <span className="text-2xl font-bold">৪</span>
            </div>
            <div className="flex-1 bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-medium text-gray-800 mb-3">আয় করুন</h3>
              <p className="text-gray-600">
                পণ্য ডেলিভারির পর আপনার লাভের টাকা সাথে সাথে পেয়ে যাবেন।
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Unique Features */}
      <div className="bg-indigo-50 rounded-xl p-8">
        <h2 className="text-2xl font-semibold text-indigo-800 mb-6 text-center">
          আমাদের বিশেষ সুবিধাসমূহ
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-start gap-4">
            <div className="mt-1 text-indigo-600">
              <MdOutlineInventory className="text-xl" />
            </div>
            <div>
              <h3 className="font-medium text-gray-800">নিজস্ব স্টক ব্যবস্থাপনা</h3>
              <p className="text-gray-600 text-sm">
                আমাদের নিজস্ব গুদামে পর্যাপ্ত স্টক থাকায় দ্রুত ডেলিভারি নিশ্চিত
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="mt-1 text-indigo-600">
              <GiProgression className="text-xl" />
            </div>
            <div>
              <h3 className="font-medium text-gray-800">বিক্রয় ট্র্যাকিং</h3>
              <p className="text-gray-600 text-sm">
                রিয়েল-টাইমে আপনার বিক্রয় ও আয়ের হিসাব দেখতে পারবেন
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="mt-1 text-indigo-600">
              <MdPayment className="text-xl" />
            </div>
            <div>
              <h3 className="font-medium text-gray-800">নিরাপদ পেমেন্ট</h3>
              <p className="text-gray-600 text-sm">
                বিকাশ/নগদ/রকেট ও ব্যাংক ট্রান্সফারের মাধ্যমে নিরাপদ লেনদেন
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="mt-1 text-indigo-600">
              <FaRegSmile className="text-xl" />
            </div>
            <div>
              <h3 className="font-medium text-gray-800">গ্রাহক সন্তুষ্টি</h3>
              <p className="text-gray-600 text-sm">
                কোয়ালিটি পণ্য ও সময়মতো ডেলিভারির মাধ্যমে গ্রাহক ধরে রাখুন
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;