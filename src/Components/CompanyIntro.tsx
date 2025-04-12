import { FaStore, FaRocket, FaHeadset, FaShieldAlt } from 'react-icons/fa';

const HomeIntroduction = () => {
  return (
    <section className="py-12 bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-blue-600 mb-6">
            রিসেলার বিডি - আপনার অনলাইন ব্যবসার নির্ভরযোগ্য সঙ্গী
          </h1>
          
          <p className="text-xl text-gray-700 mb-10 leading-relaxed">
            ইনভেস্টমেন্ট ছাড়াই শুরু করুন আপনার ড্রপশিপিং ব্যবসা। আমাদের সাথে যুক্ত হয়ে 
            উপভোগ করুন সহজ রিসেলিং অভিজ্ঞতা এবং আয় করুন ঘরে বসেই!
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <FaStore className="text-3xl text-blue-500 mb-4 mx-auto" />
              <h3 className="font-semibold text-lg mb-2">জিরো ইনভেস্টমেন্ট</h3>
              <p className="text-gray-600">কোন প্রাথমিক বিনিয়োগ ছাড়াই ব্যবসা শুরু করুন</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <FaRocket className="text-3xl text-blue-500 mb-4 mx-auto" />
              <h3 className="font-semibold text-lg mb-2">দ্রুত পেমেন্ট</h3>
              <p className="text-gray-600">অনলাইন পেমেন্টের সাথে সাথে গ্রহণ করুন</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <FaShieldAlt className="text-3xl text-blue-500 mb-4 mx-auto" />
              <h3 className="font-semibold text-lg mb-2">গুণগত মান</h3>
              <p className="text-gray-600">যাচাইকৃত ও মানসম্মত পণ্য সংগ্রহ</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <FaHeadset className="text-3xl text-blue-500 mb-4 mx-auto" />
              <h3 className="font-semibold text-lg mb-2">২৪/৭ সাপোর্ট</h3>
              <p className="text-gray-600">আমাদের বিশেষজ্ঞ টিম সবসময় আপনার পাশে</p>
            </div>
          </div>

          <div className="bg-blue-100 p-6 rounded-lg border-l-4 border-blue-500">
            <h2 className="text-2xl font-semibold text-blue-700 mb-3">কেন রিসেলার বিডি বেছে নিবেন?</h2>
            <p className="text-gray-700">
              আমরা বাংলাদেশের উদীয়মান ড্রপশিপিং প্ল্যাটফর্ম হিসেবে ক্রমাগত সম্প্রসারণ করছি। 
              আমাদের সাথে থাকুন এবং উপভোগ করুন সেরা রিসেলিং অভিজ্ঞতা - 
              যেখানে প্রতিটি পণ্য, প্রতিটি সুবিধা সাজানো হয়েছে আপনার সফলতার জন্য।
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeIntroduction;