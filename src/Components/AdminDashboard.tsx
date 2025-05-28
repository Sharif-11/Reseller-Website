import { useEffect, useState } from 'react'
import { BsGraphUp, BsPeople } from 'react-icons/bs'
import { FaExchangeAlt, FaPercentage, FaUserTie } from 'react-icons/fa'
import {
  FiBarChart2,
  FiDollarSign,
  FiLoader,
  FiRefreshCw,
  FiShoppingBag,
  FiTrendingUp,
} from 'react-icons/fi'
import { MdPendingActions } from 'react-icons/md'
import { getAdminStats } from '../Api/admin.api'

const AdminDashboard = () => {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const fetchDashboardStats = async () => {
    try {
      setLoading(true)

      // Mock data - replace with actual API call
      const mockData = {
        overall: {
          totalOrders: 1245,
          completedOrders: 928,
          returnedOrders: 45,
          otherOrders: 272,
          totalSelling: 2587500,
          totalCommission: 517500,
          totalSellers: 87,
        },
        last7Days: {
          totalOrders: 238,
          completedOrders: 175,
          returnedOrders: 12,
          otherOrders: 51,
          totalSelling: 485200,
          totalCommission: 97040,
          activeSellers: 32,
          topPerformers: [
            {
              sellerName: 'John Doe',
              sellerPhoneNo: '123-456-7890',
              orders: 50,
              totalSelling: 100000,
            },
          ],
        },
        topPerformers: [], // Empty array to test no sellers case
      }

      const { data, message, success } = await getAdminStats()
      console.log('Fetched stats:', data)

      if (success) {
        setStats(data)
      } else {
        console.error('Error fetching stats:', message)
        // Fallback to mock data if API fails
        setStats(mockData)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  if (loading) {
    return (
      <div className='bg-gray-50 p-4 md:p-6 min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <FiLoader className='animate-spin text-4xl text-indigo-600 mx-auto mb-4' />
          <p className='text-gray-600'>ড্যাশবোর্ড লোড হচ্ছে...</p>
        </div>
      </div>
    )
  }

  return (
    <div className='bg-gray-50 p-4 md:p-6 min-h-screen'>
      <div className='max-w-7xl mx-auto'>
        {/* হেডার */}
        <div className='mb-6 md:mb-8 flex justify-between items-center'>
          <div>
            <h1 className='text-xl font-bold text-gray-800'>অ্যাডমিন ড্যাশবোর্ড</h1>
            <p className='text-gray-600 mt-1 text-xs'>
              প্ল্যাটফর্মের সার্বিক পরিসংখ্যান ও বিশ্লেষণ
            </p>
          </div>
          <button
            onClick={fetchDashboardStats}
            className='px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 text-xs'
          >
            <FiRefreshCw className={loading ? 'animate-spin' : ''} />
            রিফ্রেশ করুন
          </button>
        </div>

        {/* প্রধান স্ট্যাটস কার্ড */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6'>
          {/* মোট বিক্রয় */}
          <div className='bg-white rounded-xl shadow-sm p-5 border-l-4 border-blue-500'>
            <div className='flex justify-between items-start'>
              <div>
                <p className='text-sm font-medium text-gray-500'>মোট বিক্রয়</p>
                <p className='text-2xl font-bold text-gray-800 mt-1'>
                  ৳{stats.overall.totalSelling.toLocaleString()}
                </p>
                <div className='flex items-center mt-2 text-sm text-green-600'>
                  <FiTrendingUp className='mr-1' />
                  <span>
                    {Math.round(
                      ((stats.overall.totalSelling - stats.last7Days.totalSelling) /
                        stats.last7Days.totalSelling) *
                        100
                    )}
                    % বৃদ্ধি
                  </span>
                </div>
              </div>
              <div className='p-3 rounded-lg bg-blue-50 text-blue-600'>
                <FiDollarSign className='text-2xl' />
              </div>
            </div>
          </div>

          {/* মোট অর্ডার */}
          <div className='bg-white rounded-xl shadow-sm p-5 border-l-4 border-indigo-500'>
            <div className='flex justify-between items-start'>
              <div>
                <p className='text-sm font-medium text-gray-500'>মোট অর্ডার</p>
                <p className='text-2xl font-bold text-gray-800 mt-1'>{stats.overall.totalOrders}</p>
                <div className='flex items-center mt-2 text-sm text-green-500'>
                  <FiBarChart2 className='mr-1' />
                  <span>{stats.overall.completedOrders} টি সম্পন্ন</span>
                </div>
              </div>
              <div className='p-3 rounded-lg bg-indigo-50 text-indigo-600'>
                <FiShoppingBag className='text-2xl' />
              </div>
            </div>
          </div>

          {/* মোট সেলার */}
          <div className='bg-white rounded-xl shadow-sm p-5 border-l-4 border-green-500'>
            <div className='flex justify-between items-start'>
              <div>
                <p className='text-sm font-medium text-gray-500'>সক্রিয় সেলার</p>
                <p className='text-2xl font-bold text-gray-800 mt-1'>
                  {stats.overall.totalSellers}
                </p>
                <div className='flex items-center mt-2 text-sm text-gray-500'>
                  <BsPeople className='mr-1' />
                  <span>গত সপ্তাহে {stats.last7Days.activeSellers} জন সক্রিয়</span>
                </div>
              </div>
              <div className='p-3 rounded-lg bg-green-50 text-green-600'>
                <FaUserTie className='text-2xl' />
              </div>
            </div>
          </div>

          {/* কমিশন */}
          <div className='bg-white rounded-xl shadow-sm p-5 border-l-4 border-purple-500'>
            <div className='flex justify-between items-start'>
              <div>
                <p className='text-sm font-medium text-gray-500'>মোট কমিশন</p>
                <p className='text-2xl font-bold text-gray-800 mt-1'>
                  ৳{stats.overall.totalCommission.toLocaleString()}
                </p>
                <div className='flex items-center mt-2 text-sm text-gray-500'>
                  <FaPercentage className='mr-1' />
                  <span>
                    {Math.round((stats.overall.totalCommission / stats.overall.totalSelling) * 100)}
                    % কমিশন হার
                  </span>
                </div>
              </div>
              <div className='p-3 rounded-lg bg-purple-50 text-purple-600'>
                <BsGraphUp className='text-2xl' />
              </div>
            </div>
          </div>
        </div>

        {/* গত ৭ দিনের পরিসংখ্যান */}
        <div className='bg-white rounded-xl shadow-sm p-5 mb-6'>
          <h2 className='text-lg font-semibold text-gray-800 mb-4'>গত ৭ দিনের পরিসংখ্যান</h2>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
            <div className='bg-gray-50 rounded-lg p-4'>
              <p className='text-sm font-medium text-gray-500'>মোট অর্ডার</p>
              <p className='text-xl font-bold text-gray-800'>{stats.last7Days.totalOrders}</p>
              <p className='text-xs text-gray-500 mt-1'>মোট {stats.overall.totalOrders} এর মধ্যে</p>
            </div>
            <div className='bg-gray-50 rounded-lg p-4'>
              <p className='text-sm font-medium text-gray-500'>কমপ্লিটেড অর্ডার</p>
              <p className='text-xl font-bold text-green-600'>{stats.last7Days.completedOrders}</p>
              <p className='text-xs text-gray-500 mt-1'>
                মোট {stats.overall.completedOrders} এর মধ্যে
              </p>
            </div>
            <div className='bg-gray-50 rounded-lg p-4'>
              <p className='text-sm font-medium text-gray-500'>মোট বিক্রয়</p>
              <p className='text-xl font-bold text-blue-600'>
                ৳{stats.last7Days.totalSelling.toLocaleString()}
              </p>
              <p className='text-xs text-gray-500 mt-1'>
                মোট ৳{stats.overall.totalSelling.toLocaleString()} এর মধ্যে
              </p>
            </div>
            <div className='bg-gray-50 rounded-lg p-4'>
              <p className='text-sm font-medium text-gray-500'>সক্রিয় সেলার</p>
              <p className='text-xl font-bold text-purple-600'>{stats.last7Days.activeSellers}</p>
              <p className='text-xs text-gray-500 mt-1'>
                মোট {stats.overall.totalSellers} এর মধ্যে
              </p>
            </div>
          </div>
        </div>
        <div className='bg-white rounded-xl shadow-sm p-5 mb-6 hidden md:block'>
          <h2 className='text-lg font-semibold text-gray-800 mb-4'>টপ সেলার (গত ৭ দিন)</h2>
          {stats.topPerformers.last7Days && stats.topPerformers.last7Days.length > 0 ? (
            <div className='overflow-x-auto'>
              <table className='min-w-full divide-y divide-gray-200'>
                <thead className='bg-gray-50'>
                  <tr>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      সেলার
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      ফোন
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      অর্ডার
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      বিক্রয়
                    </th>
                  </tr>
                </thead>
                <tbody className='bg-white divide-y divide-gray-200'>
                  {stats.topPerformers.last7Days.map((seller: any, index: number) => (
                    <tr key={index}>
                      <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                        {seller.sellerName}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                        {seller.sellerPhoneNo}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                        {seller.completedOrderCount || 0}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                        ৳{(seller.totalSelling || 0).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className='text-center py-8 bg-gray-50 rounded-lg'>
              <p className='text-gray-500'>কোন টপ সেলার পাওয়া যায়নি</p>
            </div>
          )}
        </div>

        {/* টপ সেলার - মোবাইল ভিউ */}
        <div className='bg-white rounded-xl shadow-sm p-5 mb-6 md:hidden'>
          <h2 className='text-lg font-semibold text-gray-800 mb-4'>টপ সেলার (গত ৭ দিন)</h2>
          {stats.topPerformers.last7Days && stats.topPerformers.last7Days.length > 0 ? (
            <div className='space-y-4'>
              {stats.topPerformers.last7Days.map((seller: any, index: number) => (
                <div key={index} className='border border-gray-200 rounded-lg p-4'>
                  <div className='flex justify-between items-start'>
                    <div>
                      <h3 className='font-medium text-gray-900'>{seller.sellerName}</h3>
                      <p className='text-sm text-gray-500 mt-1'>{seller.sellerPhoneNo}</p>
                    </div>
                    <span className='px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full'>
                      #{index + 1}
                    </span>
                  </div>
                  <div className='mt-3 grid grid-cols-2 gap-2'>
                    <div className='bg-gray-50 p-2 rounded'>
                      <p className='text-xs text-gray-500'>অর্ডার</p>
                      <p className='font-medium'>{seller.completedOrderCount || 0}</p>
                    </div>
                    <div className='bg-gray-50 p-2 rounded'>
                      <p className='text-xs text-gray-500'>বিক্রয়</p>
                      <p className='font-medium'>৳{(seller.totalSelling || 0).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className='text-center py-8 bg-gray-50 rounded-lg'>
              <p className='text-gray-500'>কোন টপ সেলার পাওয়া যায়নি</p>
            </div>
          )}
        </div>
        {/* টপ সেলার - ডেস্কটপ ভিউ */}
        <div className='bg-white rounded-xl shadow-sm p-5 mb-6 hidden md:block'>
          <h2 className='text-lg font-semibold text-gray-800 mb-4'>টপ সেলার</h2>
          {stats.topPerformers.overall && stats.topPerformers.overall.length > 0 ? (
            <div className='overflow-x-auto'>
              <table className='min-w-full divide-y divide-gray-200'>
                <thead className='bg-gray-50'>
                  <tr>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      সেলার
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      ফোন
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      অর্ডার
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      বিক্রয়
                    </th>
                  </tr>
                </thead>
                <tbody className='bg-white divide-y divide-gray-200'>
                  {stats.topPerformers.overall.map((seller: any, index: number) => (
                    <tr key={index}>
                      <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                        {seller.sellerName}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                        {seller.sellerPhoneNo}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                        {seller.completedOrderCount || 0}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                        ৳{(seller.totalSelling || 0).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className='text-center py-8 bg-gray-50 rounded-lg'>
              <p className='text-gray-500'>কোন টপ সেলার পাওয়া যায়নি</p>
            </div>
          )}
        </div>

        {/* টপ সেলার - মোবাইল ভিউ */}
        <div className='bg-white rounded-xl shadow-sm p-5 mb-6 md:hidden'>
          <h2 className='text-lg font-semibold text-gray-800 mb-4'>টপ সেলার</h2>
          {stats.topPerformers.overall && stats.topPerformers.overall.length > 0 ? (
            <div className='space-y-4'>
              {stats.topPerformers.overall.map((seller: any, index: number) => (
                <div key={index} className='border border-gray-200 rounded-lg p-4'>
                  <div className='flex justify-between items-start'>
                    <div>
                      <h3 className='font-medium text-gray-900'>{seller.sellerName}</h3>
                      <p className='text-sm text-gray-500 mt-1'>{seller.sellerPhoneNo}</p>
                    </div>
                    <span className='px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full'>
                      #{index + 1}
                    </span>
                  </div>
                  <div className='mt-3 grid grid-cols-2 gap-2'>
                    <div className='bg-gray-50 p-2 rounded'>
                      <p className='text-xs text-gray-500'>অর্ডার</p>
                      <p className='font-medium'>{seller.completedOrderCount || 0}</p>
                    </div>
                    <div className='bg-gray-50 p-2 rounded'>
                      <p className='text-xs text-gray-500'>বিক্রয়</p>
                      <p className='font-medium'>৳{(seller.totalSelling || 0).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className='text-center py-8 bg-gray-50 rounded-lg'>
              <p className='text-gray-500'>কোন টপ সেলার পাওয়া যায়নি</p>
            </div>
          )}
        </div>

        {/* টপ সেলার -গত ৭ দিন ডেস্কটপ ভিউ */}

        {/* অন্যান্য মেট্রিক্স */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-6'>
          {/* রিটার্ন রেট */}
          <div className='bg-white rounded-lg shadow-sm p-4'>
            <div className='flex items-center justify-between mb-2'>
              <h3 className='font-medium text-gray-700'>রিটার্নড অর্ডার</h3>
              <div className='p-2 rounded-lg bg-red-50 text-red-600'>
                <FaExchangeAlt className='text-lg' />
              </div>
            </div>
            <p className='text-2xl font-bold text-red-800'>{stats.overall.returnedOrders}</p>
            <p className='text-sm text-red-400 mt-1'>
              {Math.round((stats.overall.returnedOrders / stats.overall.totalOrders) * 100)}%
              রিটার্নড হার
            </p>
            <div className='mt-2 text-xs text-red-400'>
              গত ৭ দিনে: {stats.last7Days.returnedOrders} টি
            </div>
          </div>

          {/* পেন্ডিং অর্ডার */}
          <div className='bg-white rounded-lg shadow-sm p-4'>
            <div className='flex items-center justify-between mb-2'>
              <h3 className='font-medium text-gray-700'>অন্যান্য অর্ডার</h3>
              <div className='p-2 rounded-lg bg-yellow-50 text-yellow-600'>
                <MdPendingActions className='text-lg' />
              </div>
            </div>
            <p className='text-2xl font-bold text-gray-800'>{stats.overall.otherOrders}</p>
            <p className='text-sm text-gray-500 mt-1'>পেন্ডিং, প্রক্রিয়াধীন, শিপড ইত্যাদি</p>
            <div className='mt-2 text-xs text-gray-400'>
              গত ৭ দিনে: {stats.last7Days.otherOrders} টি
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
