import {
  FaEnvelope,
  FaFacebook,
  FaInfoCircle,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaQuestionCircle,
  FaShoppingBag,
  FaTelegram,
  FaWhatsapp,
} from 'react-icons/fa'
import { useAuth } from '../Hooks/useAuth'

const Footer = () => {
  const { customerMode } = useAuth()

  return (
    <footer className='bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 text-white'>
      {/* Main Footer Content */}
      <div className='container mx-auto px-4 py-8 sm:px-6 sm:py-12 lg:py-16'>
        <div
          className={`grid grid-cols-1 sm:grid-cols-2 lg:${
            customerMode ? 'grid-cols-3' : 'grid-cols-4'
          } gap-6 sm:gap-8 lg:gap-12`}
        >
          {/* Company Info */}
          <div className='sm:col-span-2 lg:col-span-1'>
            <div className='mb-6 text-center sm:text-left'>
              <h3 className='text-xl sm:text-2xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent'>
                {customerMode ? 'শপ বিডি' : 'শপ বিডি রিসেলার জবস'}
              </h3>
              <p className='text-gray-300 text-sm sm:text-base leading-relaxed mb-4 sm:mb-6'>
                {customerMode
                  ? 'বাংলাদেশের নির্ভরযোগ্য অনলাইন শপিং প্ল্যাটফর্ম। গুণগত পণ্য ও সেবার জন্য আমাদের বিশ্বস্ত করুন।'
                  : 'বাংলাদেশের নির্ভরযোগ্য ড্রপশিপিং ও রিসেলিং প্ল্যাটফর্ম। আমরা আপনার ব্যবসার সফলতার জন্য প্রতিশ্রুতিবদ্ধ।'}
              </p>

              {/* Social Media Links */}
              <div className='flex justify-center sm:justify-start space-x-3 sm:space-x-4'>
                <a
                  href='https://www.facebook.com/profile.php?id=61578209851119&mibextid=ZbWKwL'
                  className='w-9 h-9 sm:w-10 sm:h-10 bg-gray-800 rounded-full flex items-center justify-center text-gray-300 hover:bg-blue-600 hover:text-white transition-all duration-300 transform hover:scale-110'
                >
                  <FaFacebook size={16} className='sm:text-lg' />
                </a>
                <a
                  href='https://t.me/+xUKRYo264jU5Njg1'
                  className='w-9 h-9 sm:w-10 sm:h-10 bg-gray-800 rounded-full flex items-center justify-center text-gray-300 hover:bg-blue-500 hover:text-white transition-all duration-300 transform hover:scale-110'
                >
                  <FaTelegram size={16} className='sm:text-lg' />
                </a>
                <a
                  href='https://chat.whatsapp.com/Gs5lCd3OBDM69bnv0h8Jc0?mode=ac_t'
                  className='w-9 h-9 sm:w-10 sm:h-10 bg-gray-800 rounded-full flex items-center justify-center text-gray-300 hover:bg-green-500 hover:text-white transition-all duration-300 transform hover:scale-110'
                >
                  <FaWhatsapp size={16} className='sm:text-lg' />
                </a>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className='text-center sm:text-left'>
            <h4 className='text-base sm:text-lg font-semibold mb-4 sm:mb-6 relative'>
              <span className='border-b-2 border-blue-400 pb-2'>
                {customerMode ? 'গুরুত্বপূর্ণ লিংক' : 'দ্রুত লিংক'}
              </span>
            </h4>
            <ul className='space-y-2 sm:space-y-4'>
              {customerMode ? (
                <>
                  <li>
                    <a
                      href='/categories#categories'
                      className='text-gray-300 hover:text-blue-400 transition-colors duration-200 flex items-center justify-center sm:justify-start group text-sm sm:text-base'
                    >
                      <span className='w-0 h-0.5 bg-blue-400 transition-all duration-300 group-hover:w-3 sm:group-hover:w-4 mr-0 group-hover:mr-2'></span>
                      <FaShoppingBag className='mr-2 text-blue-400' size={14} />
                      সকল পণ্য
                    </a>
                  </li>
                  <li>
                    <a
                      href='/#how-to-order'
                      className='text-gray-300 hover:text-blue-400 transition-colors duration-200 flex items-center justify-center sm:justify-start group text-sm sm:text-base'
                    >
                      <span className='w-0 h-0.5 bg-blue-400 transition-all duration-300 group-hover:w-3 sm:group-hover:w-4 mr-0 group-hover:mr-2'></span>
                      <FaInfoCircle className='mr-2 text-blue-400' size={14} />
                      কিভাবে অর্ডার করবেন
                    </a>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <a
                      href='/about-us'
                      className='text-gray-300 hover:text-blue-400 transition-colors duration-200 flex items-center justify-center sm:justify-start group text-sm sm:text-base'
                    >
                      <span className='w-0 h-0.5 bg-blue-400 transition-all duration-300 group-hover:w-3 sm:group-hover:w-4 mr-0 group-hover:mr-2'></span>
                      আমাদের সম্পর্কে
                    </a>
                  </li>
                  <li>
                    <a
                      href='/categories#categories'
                      className='text-gray-300 hover:text-blue-400 transition-colors duration-200 flex items-center justify-center sm:justify-start group text-sm sm:text-base'
                    >
                      <span className='w-0 h-0.5 bg-blue-400 transition-all duration-300 group-hover:w-3 sm:group-hover:w-4 mr-0 group-hover:mr-2'></span>
                      আমাদের প্রোডাক্টসমূহ
                    </a>
                  </li>
                  <li>
                    <a
                      href='/how-it-works'
                      className='text-gray-300 hover:text-blue-400 transition-colors duration-200 flex items-center justify-center sm:justify-start group text-sm sm:text-base'
                    >
                      <span className='w-0 h-0.5 bg-blue-400 transition-all duration-300 group-hover:w-3 sm:group-hover:w-4 mr-0 group-hover:mr-2'></span>
                      কিভাবে কাজ করে
                    </a>
                  </li>
                </>
              )}
              {customerMode || (
                <li>
                  <a
                    href='/faq'
                    className='text-gray-300 hover:text-blue-400 transition-colors duration-200 flex items-center justify-center sm:justify-start group text-sm sm:text-base'
                  >
                    <span className='w-0 h-0.5 bg-blue-400 transition-all duration-300 group-hover:w-3 sm:group-hover:w-4 mr-0 group-hover:mr-2'></span>
                    <FaQuestionCircle className='mr-2 text-blue-400' size={14} />
                    সচরাচর প্রশ্ন
                  </a>
                </li>
              )}
            </ul>
          </div>

          {/* Legal Links */}
          {customerMode || (
            <div className='text-center sm:text-left'>
              <h4 className='text-base sm:text-lg font-semibold mb-4 sm:mb-6 relative'>
                <span className='border-b-2 border-blue-400 pb-2'>নীতিমালা</span>
              </h4>
              <ul className='space-y-2 sm:space-y-4'>
                <li>
                  <a
                    href='/privacy-policy'
                    className='text-gray-300 hover:text-blue-400 transition-colors duration-200 flex items-center justify-center sm:justify-start group text-sm sm:text-base'
                  >
                    <span className='w-0 h-0.5 bg-blue-400 transition-all duration-300 group-hover:w-3 sm:group-hover:w-4 mr-0 group-hover:mr-2'></span>
                    প্রাইভেসি পলিসি
                  </a>
                </li>
                <li>
                  <a
                    href='/return-refund-policy'
                    className='text-gray-300 hover:text-blue-400 transition-colors duration-200 flex items-center justify-center sm:justify-start group text-sm sm:text-base'
                  >
                    <span className='w-0 h-0.5 bg-blue-400 transition-all duration-300 group-hover:w-3 sm:group-hover:w-4 mr-0 group-hover:mr-2'></span>
                    রিটার্ন ও রিফান্ড পলিসি
                  </a>
                </li>
                <li>
                  <a
                    href='/terms-conditions'
                    className='text-gray-300 hover:text-blue-400 transition-colors duration-200 flex items-center justify-center sm:justify-start group text-sm sm:text-base'
                  >
                    <span className='w-0 h-0.5 bg-blue-400 transition-all duration-300 group-hover:w-3 sm:group-hover:w-4 mr-0 group-hover:mr-2'></span>
                    টার্মস ও কন্ডিশন
                  </a>
                </li>
              </ul>
            </div>
          )}

          {/* Contact Info */}
          <div className='sm:col-span-2 lg:col-span-1'>
            <h4 className='text-base sm:text-lg font-semibold mb-4 sm:mb-6 relative text-center sm:text-left'>
              <span className='border-b-2 border-blue-400 pb-2'>যোগাযোগ</span>
            </h4>
            <ul className='space-y-4 sm:space-y-5'>
              <li className='flex flex-col sm:flex-row items-center sm:items-start group'>
                <div className='w-8 h-8 sm:w-10 sm:h-10 bg-blue-500/20 rounded-full flex items-center justify-center mb-2 sm:mb-0 sm:mr-4 group-hover:bg-blue-500/30 transition-colors duration-200'>
                  <FaPhoneAlt className='text-blue-400' size={14} />
                </div>
                <div className='text-center sm:text-left'>
                  <p className='text-gray-400 text-xs sm:text-sm'>ফোন</p>
                  <a
                    href='tel:09638755704'
                    className='text-gray-300 hover:text-blue-400 transition-colors duration-200 font-medium text-sm sm:text-base'
                  >
                    09638755704
                  </a>
                </div>
              </li>
              <li className='flex flex-col sm:flex-row items-center sm:items-start group'>
                <div className='w-8 h-8 sm:w-10 sm:h-10 bg-blue-500/20 rounded-full flex items-center justify-center mb-2 sm:mb-0 sm:mr-4 group-hover:bg-blue-500/30 transition-colors duration-200'>
                  <FaEnvelope className='text-blue-400' size={14} />
                </div>
                <div className='text-center sm:text-left'>
                  <p className='text-gray-400 text-xs sm:text-sm'>ইমেইল</p>
                  <a
                    href='mailto:support@shopbdresellerjob.com'
                    className='text-gray-300 hover:text-blue-400 transition-colors duration-200 font-medium break-all text-sm sm:text-base'
                  >
                    support@shopbdresellerjob.com
                  </a>
                </div>
              </li>
              <li className='flex flex-col sm:flex-row items-center sm:items-start group'>
                <div className='w-8 h-8 sm:w-10 sm:h-10 bg-blue-500/20 rounded-full flex items-center justify-center mb-2 sm:mb-0 sm:mr-4 group-hover:bg-blue-500/30 transition-colors duration-200'>
                  <FaMapMarkerAlt className='text-blue-400' size={14} />
                </div>
                <div className='text-center sm:text-left'>
                  <p className='text-gray-400 text-xs sm:text-sm'>ঠিকানা</p>
                  <span className='text-gray-300 font-medium text-sm sm:text-base'>
                    চট্টগ্রাম, বাংলাদেশ
                  </span>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className='bg-gray-900/80 border-t border-gray-700/50'>
        <div className='container mx-auto px-4 sm:px-6 py-4 sm:py-6'>
          <div className='flex flex-col items-center space-y-3 sm:flex-row sm:justify-between sm:space-y-0'>
            <div className='text-center sm:text-left order-2 sm:order-1'>
              <p className='text-gray-400 text-xs sm:text-sm'>
                &copy; {new Date().getFullYear()} {customerMode ? 'শপ বিডি' : 'শপ বিডি রিসেলার জবস'}
                । সকল স্বত্ব সংরক্ষিত
              </p>
            </div>
            <div className='text-center sm:text-right order-1 sm:order-2'>
              <p className='text-gray-500 text-xs sm:text-sm'>
                ডিজাইন ও ডেভেলপমেন্ট -{' '}
                <span className='text-blue-400'>
                  {customerMode ? 'শপ বিডি টিম' : 'শপ বিডি রিসেলার জবস টিম'}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
