import { FaChartLine, FaMoneyBillWave, FaUserCheck, FaUsers } from 'react-icons/fa'
import { useAuth } from '../Hooks/useAuth'

const ResellerPassiveIncome = () => {
  const { user } = useAuth()
  return (
    <div className='bg-gradient-to-b  py-12 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-6xl mx-auto'>
        {/* Hero Section */}
        <div className='text-center mb-12'>
          <h1 className='text-3xl font-extrabold text-gray-900 sm:text-4xl md:text-5xl mb-4'>
            <span className='text-blue-600'>প্যাসিভ ইনকাম</span> শুরু করুন শপ বিডি রিসেলার জবস থেকে
          </h1>
          <p className='text-lg text-gray-600 max-w-3xl mx-auto'>
            একটি সফল অর্ডার সম্পন্ন করে ভেরিফাইড সেলার হন এবং আপনার টিম থেকে কমিশন উপার্জন শুরু করুন
          </p>
        </div>

        {/* Verification Process */}
        <div className='bg-white rounded-xl shadow-lg p-6 mb-12'>
          <div className='flex flex-col md:flex-row items-center'>
            <div className='md:w-1/3 mb-6 md:mb-0 flex justify-center'>
              <div className='bg-blue-100 p-6 rounded-full'>
                <FaUserCheck className='text-blue-600 text-5xl' />
              </div>
            </div>
            <div className='md:w-2/3 md:pl-8'>
              <h2 className='text-2xl font-bold text-gray-800 mb-4'>কিভাবে ভেরিফাইড সেলার হবেন?</h2>
              <div className='space-y-4'>
                <div className='flex items-start'>
                  <div className='flex-shrink-0 bg-blue-100 rounded-full p-2 mt-1'>
                    <span className='text-blue-600 font-bold'>১</span>
                  </div>
                  <p className='ml-3 text-gray-600'>শপ বিডি রিসেলার জবস অ্যাপে রেজিস্ট্রেশন করুন</p>
                </div>
                <div className='flex items-start'>
                  <div className='flex-shrink-0 bg-blue-100 rounded-full p-2 mt-1'>
                    <span className='text-blue-600 font-bold'>২</span>
                  </div>
                  <p className='ml-3 text-gray-600'>
                    অ্যাপ থেকে কমপক্ষে ১টি অর্ডার সফলভাবে সম্পন্ন করুন
                  </p>
                </div>
                <div className='flex items-start'>
                  <div className='flex-shrink-0 bg-blue-100 rounded-full p-2 mt-1'>
                    <span className='text-blue-600 font-bold'>৩</span>
                  </div>
                  <p className='ml-3 text-gray-600'>
                    অটোমেটিকভাবে ভেরিফাইড সেলার হিসেবে অনুমোদিত হবেন
                  </p>
                </div>
                <div className='flex items-start'>
                  <div className='flex-shrink-0 bg-blue-100 rounded-full p-2 mt-1'>
                    <span className='text-blue-600 font-bold'>৪</span>
                  </div>
                  <p className='ml-3 text-gray-600'>
                    ভেরিফাইড হওয়ার পর আপনি নিজেই আপনার রেফারেল কোড বানিয়ে নিতে পারবেন, যেটা দিয়ে
                    অন্য সেলারদের রেজিস্টার করতে পারবেন।
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-12'>
          <div className='bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300'>
            <div className='flex items-center mb-4'>
              <div className='bg-green-100 p-3 rounded-full mr-4'>
                <FaMoneyBillWave className='text-green-600 text-2xl' />
              </div>
              <h3 className='text-xl font-semibold text-gray-800'>কোন ইনভেস্টমেন্ট নেই</h3>
            </div>
            <p className='text-gray-600'>
              কোন প্রকার পুঁজি বা ইনভেস্টমেন্ট ছাড়াই শুরু করতে পারবেন। শুধু একটি সফল অর্ডার সম্পন্ন
              করতে হবে।
            </p>
          </div>

          <div className='bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300'>
            <div className='flex items-center mb-4'>
              <div className='bg-purple-100 p-3 rounded-full mr-4'>
                <FaUsers className='text-purple-600 text-2xl' />
              </div>
              <h3 className='text-xl font-semibold text-gray-800'>টিম গঠন করুন</h3>
            </div>
            <p className='text-gray-600'>
              আপনার সেলার কোড ব্যবহার করে অন্যান্য সেলারদের রেজিস্ট্রেশন করিয়ে একটি টিম তৈরি করুন।
            </p>
          </div>

          <div className='bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300'>
            <div className='flex items-center mb-4'>
              <div className='bg-yellow-100 p-3 rounded-full mr-4'>
                <FaChartLine className='text-yellow-600 text-2xl' />
              </div>
              <h3 className='text-xl font-semibold text-gray-800'>প্যাসিভ ইনকাম</h3>
            </div>
            <p className='text-gray-600'>
              আপনার টিমের সেলস থেকে কমিশন পেতে থাকুন, এমনকি যখন আপনি সরাসরি কাজ করছেন না তখনও।
            </p>
          </div>
        </div>

        {/* Commission Structure */}
        <div className='bg-white rounded-xl shadow-lg p-6 mb-12'>
          <h2 className='text-2xl font-bold text-gray-800 mb-6 text-center'>কমিশন স্ট্রাকচার</h2>

          <div className='overflow-x-auto'>
            <table className='min-w-full divide-y divide-gray-200'>
              <thead className='bg-gray-50'>
                <tr>
                  <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    অর্ডার ভ্যালু
                  </th>
                  <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    লেভেল ১
                  </th>
                  <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    লেভেল ২
                  </th>
                  <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    লেভেল ৩
                  </th>
                </tr>
              </thead>
              <tbody className='bg-white divide-y divide-gray-200'>
                {[
                  { range: '৳১০০০+', levels: ['৳১৫০', '৳১০০', '৳৫০'] },
                  { range: '৳৫০০ - ৳৯৯৯', levels: ['৳১০০', '৳৭৫', '৳৩০'] },
                  { range: '৳৩০০ - ৳৪৯৯', levels: ['৳৭৫', '৳৫০', '৳২০'] },
                  { range: '৳১০০ - ৳২৯৯', levels: ['৳৫০', '৳৩০', '৳১০'] },
                  { range: '৳১০০ এর নিচে', levels: ['৳২০', '৳১০', '৳৫'] },
                ].map((row, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className='px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                      {row.range}
                    </td>
                    {row.levels.map((amount, i) => (
                      <td key={i} className='px-4 py-4 whitespace-nowrap text-sm text-gray-500'>
                        {amount}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className='mt-6 bg-blue-50 p-4 rounded-lg'>
            <p className='text-blue-800 font-medium'>
              * প্রতিটি লেভেল থেকে আপনি কমিশন পাবেন যখন আপনার টিম মেম্বাররা অর্ডার সম্পন্ন করবে।
            </p>
          </div>
        </div>

        {/* Success Story */}

        {/* CTA Section */}
        {!user && (
          <div className='text-center'>
            <h2 className='text-2xl font-bold text-gray-800 mb-4'>আজই ভেরিফাইড সেলার হোন</h2>
            <p className='text-gray-600 mb-6 max-w-2xl mx-auto'>
              একটি মাত্র সফল অর্ডার সম্পন্ন করে ভেরিফাইড সেলার হিসেবে আপনার প্যাসিভ ইনকামের যাত্রা
              শুরু করুন
            </p>
            <button className='bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full text-lg shadow-lg transition duration-300 transform hover:scale-105'>
              এখনই রেজিস্ট্রেশন করুন
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default ResellerPassiveIncome
