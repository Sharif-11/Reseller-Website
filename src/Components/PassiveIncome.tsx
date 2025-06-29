import { useEffect, useState } from 'react'
import { FaArrowRight, FaChartLine, FaMoneyBillWave, FaUserCheck, FaUsers } from 'react-icons/fa'
import { getCommissionTable } from '../Api/commission.api'
import { useAuth } from '../Hooks/useAuth'

type CommissionLevel = {
  startPrice: number
  endPrice: number | null
  level: number
  commission: number
  id: number
}

const ResellerPassiveIncome = () => {
  const { user } = useAuth()
  const [commissionData, setCommissionData] = useState<CommissionLevel[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchCommissionTable = async () => {
      try {
        setIsLoading(true)
        const response = await getCommissionTable()

        if (response.success && response.data) {
          setCommissionData(response.data)
        }
      } catch (error) {
        console.error('Failed to fetch commission table:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCommissionTable()
  }, [])

  const transformCommissionData = (data: CommissionLevel[]) => {
    const priceRanges: Record<string, Record<number, number>> = {}

    data.forEach(item => {
      const rangeKey = `${item.startPrice}-${item.endPrice || ''}`
      if (!priceRanges[rangeKey]) {
        priceRanges[rangeKey] = {}
      }
      priceRanges[rangeKey][item.level] = item.commission
    })

    return Object.entries(priceRanges).map(([range, levels]) => {
      const [startPrice, endPrice] = range.split('-')
      return {
        startPrice,
        endPrice,
        levels: [1, 2, 3, 4].map(level => levels[level] || 0),
      }
    })
  }

  const formatPriceRange = (start: string, end: string) => {
    if (!end) {
      return (
        <div className='flex items-center'>
          <span className='font-medium'>৳{start}</span>
          <span className='text-blue-500 ml-1'>+</span>
        </div>
      )
    }
    return (
      <div className='flex items-center'>
        <span className='font-medium'>৳{start}</span>
        <span className='mx-1 text-gray-400'>-</span>
        <span className='font-medium'>৳{end}</span>
      </div>
    )
  }

  const tableData = transformCommissionData(commissionData)

  if (isLoading) {
    return (
      <div className='flex justify-center items-center min-h-[300px]'>
        <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500'></div>
      </div>
    )
  }

  return (
    <div className='bg-gradient-to-b from-blue-50 to-white py-8 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-4xl mx-auto'>
        {/* Hero Section */}
        <div className='text-center mb-8'>
          <h1 className='text-2xl sm:text-3xl font-extrabold text-gray-900 mb-3'>
            <span className='text-blue-600'>প্যাসিভ ইনকাম</span> শুরু করুন
          </h1>
          <p className='text-sm sm:text-base text-gray-600 max-w-3xl mx-auto'>
            একটি সফল অর্ডার সম্পন্ন করে ভেরিফাইড সেলার হন এবং আপনার টিম থেকে কমিশন উপার্জন শুরু করুন
          </p>
          <div className='mt-4'>
            <div className='inline-flex items-center px-3 py-1 bg-blue-100 rounded-full text-blue-800 text-sm font-medium'>
              <FaArrowRight className='mr-1 text-xs' /> কোন ইনভেস্টমেন্ট নেই
            </div>
          </div>
        </div>

        {/* Verification Steps */}
        <div className='bg-white rounded-lg shadow-md p-4 sm:p-5 mb-6'>
          <h2 className='text-lg font-bold text-gray-800 mb-4 flex items-center'>
            <span className='bg-blue-100 p-1.5 rounded-full mr-2'>
              <FaUserCheck className='text-blue-600 text-sm' />
            </span>
            কিভাবে ভেরিফাইড সেলার হবেন?
          </h2>

          <div className='space-y-3'>
            {[
              'শপ বিডি রিসেলার জবস অ্যাপে রেজিস্ট্রেশন করুন',
              'অ্যাপ থেকে কমপক্ষে ১টি অর্ডার সফলভাবে সম্পন্ন করুন',
              'অটোমেটিকভাবে ভেরিফাইড সেলার হিসেবে অনুমোদিত হবেন',
              'ভেরিফাইড হওয়ার পর আপনার রেফারেল কোড যোগ করুন',
              'আপনার রেফারেল কোড দিয়ে অন্য সেলারদের রেজিস্টার করুন',
              ' এই সেলার কোডটি কাস্টমারদের সাথে শেয়ার করলে, তাদের অর্ডারের কমিশন আপনার অ্যাকাউন্টে যোগ হবে',
            ].map((step, index) => (
              <div key={index} className='flex items-start'>
                <div className='flex-shrink-0 bg-blue-100 rounded-full p-1.5 mt-0.5'>
                  <span className='text-blue-600 text-xs font-bold'>{index + 1}</span>
                </div>
                <p className='ml-2 text-gray-600 text-sm'>{step}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Benefits Cards */}
        <div className='grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8'>
          {[
            {
              icon: <FaMoneyBillWave className='text-green-600 text-xl' />,
              title: 'কোন ইনভেস্টমেন্ট নেই',
              desc: 'কোন প্রকার পুঁজি ছাড়াই শুরু করতে পারবেন',
              bg: 'bg-green-100',
            },
            {
              icon: <FaUsers className='text-purple-600 text-xl' />,
              title: 'টিম গঠন করুন',
              desc: 'আপনার রেফারেল কোড দিয়ে টিম তৈরি করুন',
              bg: 'bg-purple-100',
            },
            {
              icon: <FaChartLine className='text-yellow-600 text-xl' />,
              title: 'প্যাসিভ ইনকাম',
              desc: 'আপনার টিমের সেলস থেকে কমিশন পেতে থাকুন',
              bg: 'bg-yellow-100',
            },
          ].map((benefit, index) => (
            <div
              key={index}
              className='bg-white rounded-lg shadow-sm p-3 hover:shadow-md transition-shadow'
            >
              <div className={`${benefit.bg} p-2 rounded-full inline-flex mb-2`}>
                {benefit.icon}
              </div>
              <h3 className='text-base font-semibold text-gray-800 mb-1'>{benefit.title}</h3>
              <p className='text-gray-600 text-xs'>{benefit.desc}</p>
            </div>
          ))}
        </div>

        {/* Commission Structure */}
        <div className='bg-white rounded-lg shadow-md overflow-hidden mb-8'>
          <div className='p-3 sm:p-4'>
            <h2 className='text-lg font-bold text-gray-800 mb-3 text-center'>কমিশন স্ট্রাকচার</h2>

            {tableData.length === 0 ? (
              <div className='text-center py-4 text-gray-500 text-sm'>
                কমিশন টেবিল ডাটা লোড করা যায়নি
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className='hidden sm:block overflow-x-auto'>
                  <table className='w-full'>
                    <thead>
                      <tr className='bg-blue-50'>
                        <th className='px-3 py-2 text-left text-xs font-medium text-blue-800'>
                          প্রাইস রেঞ্জ
                        </th>
                        {[1, 2, 3, 4].map(level => (
                          <th
                            key={level}
                            className='px-2 py-2 text-center text-xs font-medium text-blue-800'
                          >
                            লেভেল {level}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className='divide-y divide-gray-200'>
                      {tableData.map((row, rowIndex) => (
                        <tr
                          key={rowIndex}
                          className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                        >
                          <td className='px-3 py-3 whitespace-nowrap text-xs text-gray-900'>
                            {formatPriceRange(row.startPrice, row.endPrice)}
                          </td>
                          {row.levels.map((amount, levelIndex) => (
                            <td
                              key={levelIndex}
                              className='px-2 py-3 whitespace-nowrap text-xs text-center text-gray-500'
                            >
                              <span className='bg-blue-100 text-blue-800 py-1 px-2 rounded-full text-xs font-medium inline-flex items-center justify-center h-6 w-full'>
                                ৳{amount}
                              </span>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className='sm:hidden space-y-3'>
                  {tableData.map((row, rowIndex) => (
                    <div
                      key={rowIndex}
                      className='bg-gray-50 p-3 rounded-md border border-gray-200'
                    >
                      <div className='flex justify-between items-center mb-2'>
                        <span className='text-xs text-gray-500 font-medium'>প্রাইস রেঞ্জ</span>
                        <div className='text-sm font-medium text-gray-900'>
                          {formatPriceRange(row.startPrice, row.endPrice)}
                        </div>
                      </div>
                      <div className='grid grid-cols-4 gap-2'>
                        {row.levels.map((amount, levelIndex) => (
                          <div key={levelIndex} className='text-center'>
                            <div className='text-[10px] text-gray-500 mb-1'>
                              লেভেল {levelIndex + 1}
                            </div>
                            <div className='bg-white rounded p-1 border border-gray-200'>
                              <div className='text-xs font-medium text-blue-600'>৳{amount}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className='bg-blue-50 px-3 py-2 border-t border-blue-100'>
            <p className='text-blue-800 text-xs font-medium'>
              * প্রতিটি লেভেল থেকে আপনি কমিশন পাবেন যখন আপনার টিম মেম্বাররা অর্ডার সম্পন্ন করবে
            </p>
          </div>
        </div>

        {/* CTA Section */}
        {!user && (
          <div className='text-center bg-gradient-to-r from-blue-600 to-blue-500 rounded-lg p-5 text-white'>
            <h2 className='text-xl font-bold mb-2'>আজই ভেরিফাইড সেলার হোন</h2>
            <p className='mb-4 max-w-2xl mx-auto opacity-90 text-sm'>
              একটি মাত্র সফল অর্ডার সম্পন্ন করে ভেরিফাইড সেলার হিসেবে আপনার প্যাসিভ ইনকামের যাত্রা
              শুরু করুন
            </p>
            <button className='bg-white text-blue-600 hover:bg-gray-100 font-medium py-2 px-6 rounded-full text-sm shadow-md transition duration-300 transform hover:scale-105'>
              এখনই রেজিস্ট্রেশন করুন
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default ResellerPassiveIncome
