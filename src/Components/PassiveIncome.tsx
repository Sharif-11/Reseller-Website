import { useEffect, useState } from 'react'
import { FaArrowRight, FaChartLine, FaMoneyBillWave, FaUserCheck, FaUsers } from 'react-icons/fa'
import { getCommissionTable } from '../Api/commission.api'
import { useAuth } from '../Hooks/useAuth'

type TableRow = {
  startPrice: string
  endPrice: string
  levels: string[]
}

const ResellerPassiveIncome = () => {
  const { user } = useAuth()
  const [tableData, setTableData] = useState<TableRow[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch commission table data
  useEffect(() => {
    const fetchCommissionTable = async () => {
      try {
        setIsLoading(true)
        const response = await getCommissionTable()

        if (response.success && response.data) {
          const transformedData = response.data.map((row: any) => ({
            startPrice: row.startPrice.toString(),
            endPrice: row.endPrice ? row.endPrice.toString() : '',
            levels: row.amounts.map((amount: number) => amount.toString()),
          }))
          setTableData(transformedData)
        }
      } catch (error) {
        console.error('Failed to fetch commission table:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCommissionTable()
  }, [])

  if (isLoading) {
    return (
      <div className='flex justify-center items-center min-h-[300px]'>
        <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500'></div>
      </div>
    )
  }

  return (
    <div className='bg-gradient-to-b from-blue-50 to-white py-8 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-6xl mx-auto'>
        {/* Hero Section */}
        <div className='text-center mb-10'>
          <h1 className='text-3xl font-extrabold text-gray-900 sm:text-4xl md:text-5xl mb-4'>
            <span className='text-blue-600'>প্যাসিভ ইনকাম</span> শুরু করুন
          </h1>
          <p className='text-lg text-gray-600 max-w-3xl mx-auto'>
            একটি সফল অর্ডার সম্পন্ন করে ভেরিফাইড সেলার হন এবং আপনার টিম থেকে কমিশন উপার্জন শুরু করুন
          </p>
          <div className='mt-6'>
            <div className='inline-flex items-center px-4 py-2 bg-blue-100 rounded-full text-blue-800 font-medium'>
              <FaArrowRight className='mr-2' /> কোন ইনভেস্টমেন্ট নেই
            </div>
          </div>
        </div>

        {/* Verification Steps */}
        <div className='bg-white rounded-2xl shadow-lg p-6 mb-8'>
          <h2 className='text-xl font-bold text-gray-800 mb-6 flex items-center'>
            <span className='bg-blue-100 p-2 rounded-full mr-3'>
              <FaUserCheck className='text-blue-600' />
            </span>
            কিভাবে ভেরিফাইড সেলার হবেন?
          </h2>

          <div className='space-y-4'>
            {[
              'শপ বিডি রিসেলার জবস অ্যাপে রেজিস্ট্রেশন করুন',
              'অ্যাপ থেকে কমপক্ষে ১টি অর্ডার সফলভাবে সম্পন্ন করুন',
              'অটোমেটিকভাবে ভেরিফাইড সেলার হিসেবে অনুমোদিত হবেন',
              'আপনার রেফারেল কোড দিয়ে অন্য সেলারদের রেজিস্টার করুন',
            ].map((step, index) => (
              <div key={index} className='flex items-start'>
                <div className='flex-shrink-0 bg-blue-100 rounded-full p-2 mt-1'>
                  <span className='text-blue-600 font-bold'>{index + 1}</span>
                </div>
                <p className='ml-3 text-gray-600'>{step}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Benefits Cards */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-5 mb-10'>
          {[
            {
              icon: <FaMoneyBillWave className='text-green-600 text-2xl' />,
              title: 'কোন ইনভেস্টমেন্ট নেই',
              desc: 'কোন প্রকার পুঁজি ছাড়াই শুরু করতে পারবেন',
              bg: 'bg-green-100',
            },
            {
              icon: <FaUsers className='text-purple-600 text-2xl' />,
              title: 'টিম গঠন করুন',
              desc: 'আপনার রেফারেল কোড দিয়ে টিম তৈরি করুন',
              bg: 'bg-purple-100',
            },
            {
              icon: <FaChartLine className='text-yellow-600 text-2xl' />,
              title: 'প্যাসিভ ইনকাম',
              desc: 'আপনার টিমের সেলস থেকে কমিশন পেতে থাকুন',
              bg: 'bg-yellow-100',
            },
          ].map((benefit, index) => (
            <div
              key={index}
              className='bg-white rounded-xl shadow-md p-5 hover:shadow-lg transition-shadow'
            >
              <div className={`${benefit.bg} p-3 rounded-full inline-flex mb-4`}>
                {benefit.icon}
              </div>
              <h3 className='text-lg font-semibold text-gray-800 mb-2'>{benefit.title}</h3>
              <p className='text-gray-600 text-sm'>{benefit.desc}</p>
            </div>
          ))}
        </div>

        {/* Commission Structure */}
        <div className='bg-white rounded-2xl shadow-lg overflow-hidden mb-10'>
          <div className='p-6'>
            <h2 className='text-xl font-bold text-gray-800 mb-6 text-center'>কমিশন স্ট্রাকচার</h2>

            {tableData.length === 0 ? (
              <div className='text-center py-8 text-gray-500'>কমিশন টেবিল ডাটা লোড করা যায়নি</div>
            ) : (
              <div className='overflow-x-auto'>
                <table className='w-full min-w-[600px]'>
                  <thead>
                    <tr className='bg-blue-50'>
                      <th className='px-4 py-3 text-left text-sm font-medium text-blue-800'>
                        অর্ডার ভ্যালু
                      </th>
                      {tableData[0].levels.map((_, index) => (
                        <th
                          key={index}
                          className='px-4 py-3 text-center text-sm font-medium text-blue-800'
                        >
                          লেভেল {index + 1}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className='divide-y divide-gray-200'>
                    {tableData.map((row, rowIndex) => (
                      <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className='px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                          {row.endPrice
                            ? `৳${row.startPrice} - ৳${row.endPrice}`
                            : `৳${row.startPrice}+`}
                        </td>
                        {row.levels.map((amount, levelIndex) => (
                          <td
                            key={levelIndex}
                            className='px-4 py-4 whitespace-nowrap text-sm text-center text-gray-500'
                          >
                            <span className='bg-blue-100 text-blue-800 py-1 px-3 rounded-full text-xs font-medium'>
                              ৳{amount}
                            </span>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className='bg-blue-50 px-6 py-4 border-t border-blue-100'>
            <p className='text-blue-800 text-sm font-medium'>
              * প্রতিটি লেভেল থেকে আপনি কমিশন পাবেন যখন আপনার টিম মেম্বাররা অর্ডার সম্পন্ন করবে
            </p>
          </div>
        </div>

        {/* CTA Section */}
        {!user && (
          <div className='text-center bg-gradient-to-r from-blue-600 to-blue-500 rounded-2xl p-8 text-white'>
            <h2 className='text-2xl font-bold mb-3'>আজই ভেরিফাইড সেলার হোন</h2>
            <p className='mb-6 max-w-2xl mx-auto opacity-90'>
              একটি মাত্র সফল অর্ডার সম্পন্ন করে ভেরিফাইড সেলার হিসেবে আপনার প্যাসিভ ইনকামের যাত্রা
              শুরু করুন
            </p>
            <button className='bg-white text-blue-600 hover:bg-gray-100 font-bold py-3 px-8 rounded-full text-lg shadow-lg transition duration-300 transform hover:scale-105'>
              এখনই রেজিস্ট্রেশন করুন
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default ResellerPassiveIncome
