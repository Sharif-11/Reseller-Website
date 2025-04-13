import { FaPhone, FaFacebook, FaEnvelope, FaWhatsapp } from 'react-icons/fa';
import { MdSupportAgent } from 'react-icons/md';
import { NavLink } from 'react-router-dom';

const SupportCenter = () => {
  const supportChannels = [
    {
      title: 'হটলাইন নাম্বার',
      icon: <FaPhone className="text-2xl text-blue-600" />,
      details: '০৯৬৩৮ ৭৭৭ ৮৮৮',
      action: 'কল করতে ক্লিক করুন',
      link: 'tel:09638777888',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'ফেসবুক পেজ',
      icon: <FaFacebook className="text-2xl text-[#1877F2]" />,
      details: 'আমাদের অফিসিয়াল পেজ',
      action: 'পেজ ভিজিট করুন',
      link: 'https://facebook.com/yourpage',
      bgColor: 'bg-[#1877F2]/10'
    },
    {
      title: 'ইমেইল সাপোর্ট',
      icon: <FaEnvelope className="text-2xl text-red-600" />,
      details: 'support@yourdomain.com',
      action: 'ইমেইল পাঠান',
      link: 'mailto:support@yourdomain.com',
      bgColor: 'bg-red-50'
    },
    {
      title: 'হোয়াটসঅ্যাপ গ্রুপ',
      icon: <FaWhatsapp className="text-2xl text-green-600" />,
      details: 'সেলার্স কমিউনিটি',
      action: 'জয়েন করুন',
      link: 'https://wa.me/yourgroup',
      bgColor: 'bg-green-50'
    }
  ];

  return (
    <div className=" bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="flex items-center gap-3 mb-6 md:mb-8">
          <MdSupportAgent className="text-4xl text-indigo-600" />
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">সাপোর্ট সেন্টার</h1>
            <p className="text-gray-600">আমাদের সাথে যোগাযোগ করার বিভিন্ন মাধ্যম</p>
          </div>
        </div>

        {/* Support Channels Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {supportChannels.map((channel, index) => (
            <NavLink
              key={index}
              to={channel.link}
              target="_blank"
              rel="noopener noreferrer"
              className={`${channel.bgColor} rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 p-5 border border-transparent hover:border-indigo-200`}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-white">
                  {channel.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">{channel.title}</h3>
                  <p className="text-sm text-gray-600">{channel.details}</p>
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <span className="inline-flex items-center text-indigo-600 text-sm font-medium">
                  {channel.action}
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
              </div>
            </NavLink>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SupportCenter;