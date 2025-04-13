import { FaBoxOpen, FaBook, FaMoneyBillWave, FaCoins, FaHeadset, FaQuestionCircle, FaTicketAlt, FaBullhorn, FaExclamationTriangle } from 'react-icons/fa';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../Hooks/useAuth';

const SellerHomeDashboard = () => {
  // Sample balance data (negative for demo)
  const {user}=useAuth()
  const currentBalance = user?.balance || 0; // Example balance, replace with actual data
  
  // Announcements data
  const announcements = [
    "🎉 নতুন বছর উপলক্ষে বিশেষ ডিসকাউন্ট চলছে!",
    "⚠️ আগামীকাল সিস্টেম মেইন্টেন্যান্সের কারণে বিক্রয় বন্ধ থাকবে সকাল ১০টা থেকে ১২টা পর্যন্ত",
    "📢 নতুন সেলারদের জন্য বিশেষ ট্রেনিং সেশনের আয়োজন করা হবে ১৫ই জানুয়ারি"
  ];

  const quickLinks = [
    {
      title: 'সমস্ত পণ্য',
      icon: <FaBoxOpen className="text-3xl text-blue-600" />,
      url: '/products'
    },
    {
      title: 'বিক্রয় নির্দেশিকা',
      icon: <FaBook className="text-3xl text-green-600" />,
      url: '/selling-guide'
    },
    {
      title: 'ব্যালেন্স স্টেটমেন্ট',
      icon: <FaMoneyBillWave className="text-3xl text-purple-600" />,
      url: '/balance-statement'
    },
    {
      title: 'সাপোর্ট টিকেট',
      icon: <FaTicketAlt className="text-3xl text-orange-600" />,
      url: '/support-ticket',
      upcoming: true
    },
    {
      title: 'প্যাসিভ ইনকাম',
      icon: <FaCoins className="text-3xl text-yellow-600" />,
      url: '/passive-income',
      upcoming: true
    },
    {
      title: 'সাপোর্ট সেন্টার',
      icon: <FaHeadset className="text-3xl text-red-600" />,
      url: '/support'
    },
    {
      title: 'সাধারণ প্রশ্ন',
      icon: <FaQuestionCircle className="text-3xl text-indigo-600" />,
      url: '/faq'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Announcement Bar with Moving Text */}
        <div className="bg-indigo-600 text-white rounded-lg mb-6 overflow-hidden">
          <div className="flex items-center p-3">
            <FaBullhorn className="text-xl mr-3 flex-shrink-0" />
            <div className="whitespace-nowrap overflow-hidden">
              <div className="inline-block animate-marquee">
                {announcements.map((announcement, index) => (
                  <span key={index} className="mx-8 inline-block">
                    {announcement}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Pay Due Alert (if balance is negative) */}
        {currentBalance < 0 && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <FaExclamationTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div className="ml-3 flex-1">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-red-700 font-medium">
                    আপনার অ্যাকাউন্টে {Math.abs(currentBalance)} টাকা বকেয়া রয়েছে
                  </p>
                  <NavLink
                    to="/pay-due"
                    className="px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors"
                  >
                    পেমেন্ট করুন
                  </NavLink>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Links Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {quickLinks.map((link, index) => (
            <NavLink
              key={index}
              to={link.url}
              className={`bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 p-4 md:p-6 flex flex-col items-center text-center border border-gray-100 hover:border-blue-200 relative ${
                link.upcoming ? 'opacity-80' : ''
              }`}
            >
              {link.upcoming && (
                <span className="absolute top-2 right-2 bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                  শীঘ্রই আসছে
                </span>
              )}
              <div className={`mb-3 md:mb-4 p-3 ${link.upcoming ? 'bg-gray-100' : 'bg-blue-50'} rounded-full`}>
                {link.icon}
              </div>
              <h3 className="text-lg md:text-xl font-semibold text-gray-800 mb-2">
                {link.title}
              </h3>
              {/* <p className="text-sm md:text-base text-gray-600">
                {link.title} দেখুন এবং ব্যবস্থাপনা করুন
              </p> */}
              <span className="mt-3 text-blue-600 text-sm font-medium flex items-center">
                বিস্তারিত দেখুন
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 ml-1"
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
              </span>
            </NavLink>
          ))}
        </div>

        {/* Add your other sections here if needed */}
      </div>

      {/* CSS for marquee animation */}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 20s linear infinite;
          display: inline-block;
        }
      `}</style>
    </div>
  );
};

export default SellerHomeDashboard;