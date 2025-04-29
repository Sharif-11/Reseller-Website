import { FaPhoneAlt } from 'react-icons/fa'

const Footer = () => {
  return (
    <footer className='bg-gray-900 text-white pt-12 pb-6'>
      <div className='container mx-auto px-4'>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8'>
          {/* Company Info */}
          <div className='mb-6'>
            <h3 className='text-2xl font-bold mb-4 text-blue-400'>শপ বিডি রিসেলার জবস</h3>
            <p className='mb-4'>বাংলাদেশের নির্ভরযোগ্য ড্রপশিপিং ও রিসেলিং প্ল্যাটফর্ম</p>
            {/* <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-blue-400 transition">
                <FaFacebook size={20} />
              </a>
              <a href="#" className="text-gray-300 hover:text-blue-400 transition">
                <FaInstagram size={20} />
              </a>
              <a href="#" className="text-gray-300 hover:text-blue-400 transition">
                <FaLinkedin size={20} />
              </a>
              <a href="#" className="text-gray-300 hover:text-blue-400 transition">
                <FaTwitter size={20} />
              </a>
            </div> */}
          </div>

          {/* Quick Links */}
          <div className='mb-6'>
            <h4 className='text-lg font-semibold mb-4 border-b border-blue-400 pb-2'>দ্রুত লিংক</h4>
            <ul className='space-y-2'>
              <li>
                <a href='/about-us#about-us' className='hover:text-blue-400 transition'>
                  আমাদের সম্পর্কে
                </a>
              </li>
              <li>
                <a href='#products' className='hover:text-blue-400 transition'>
                  পণ্য সমূহ
                </a>
              </li>
              <li>
                <a href='#how-it-works' className='hover:text-blue-400 transition'>
                  কিভাবে কাজ করে
                </a>
              </li>
              <li>
                <a href='/faq' className='hover:text-blue-400 transition'>
                  সচরাচর প্রশ্ন
                </a>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div className='mb-6'>
            <h4 className='text-lg font-semibold mb-4 border-b border-blue-400 pb-2'>
              গুরুত্বপূর্ণ লিংক
            </h4>
            <ul className='space-y-2'>
              <li>
                <a href='/privacy-policy' className='hover:text-blue-400 transition'>
                  প্রাইভেসি পলিসি
                </a>
              </li>
              <li>
                <a href='/return-refund-policy' className='hover:text-blue-400 transition'>
                  রিটার্ন ও রিফান্ড পলিসি
                </a>
              </li>
              <li>
                <a href='/terms-conditions' className='hover:text-blue-400 transition'>
                  শর্তাবলী
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className='mb-6'>
            <h4 className='text-lg font-semibold mb-4 border-b border-blue-400 pb-2'>যোগাযোগ</h4>
            <ul className='space-y-3'>
              <li className='flex items-start'>
                <FaPhoneAlt className='mt-1 mr-3 text-blue-400' />
                <span>09638755704</span>
              </li>
              {/* <li className="flex items-start">
                <FaEnvelope className="mt-1 mr-3 text-blue-400" />
                <span>support@resellerbd.com</span>
              </li>
              <li className="flex items-start">
                <FaMapMarkerAlt className="mt-1 mr-3 text-blue-400" />
                <span>রোড নং ১২, মোহাম্মদপুর, ঢাকা, বাংলাদেশ</span>
              </li> */}
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className='border-t border-gray-700 pt-6 text-center text-gray-400'>
          <p>&copy; {new Date().getFullYear()} শপ বিডি রিসেলার জবস. সকল স্বত্ব সংরক্ষিত</p>
          <p className='mt-2 text-sm'>ডিজাইন ও ডেভেলপমেন্ট - শপ বিডি রিসেলার জবস টিম</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
