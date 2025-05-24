import { useEffect, useState } from 'react'
import { BsGraphUp } from 'react-icons/bs'
import { FaExchangeAlt, FaPercentage } from 'react-icons/fa'
import {
  FiAlertCircle,
  FiBarChart2,
  FiCheckCircle,
  FiDollarSign,
  FiLoader,
  FiRefreshCw,
  FiShoppingBag,
  FiTrendingUp,
} from 'react-icons/fi'
import { MdPendingActions } from 'react-icons/md'
import { getSellerDashboardStats } from '../Api/seller.api'

interface DashboardStats {
  overall: {
    totalOrders: number
    completedOrders: number
    returnedOrders: number
    otherOrders: number
    totalSelling: number
    totalCommission: number
  }
  last7Days: {
    totalOrders: number
    completedOrders: number
    returnedOrders: number
    otherOrders: number
    totalSelling: number
    totalCommission: number
  }
}

const SellerDashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Simulate API call - replace with actual API endpoint
  const fetchDashboardStats = async () => {
    try {
      setLoading(true)
      setError(null)
      const { success, message, data } = await getSellerDashboardStats()
      if (!success) {
        throw new Error(message || 'ড্যাশবোর্ড ডেটা লোড করতে সমস্যা হয়েছে')
      }
      setStats(data)

      // Replace this with your actual API call
      // const response = await fetch('/api/seller/dashboard-stats')
      // const data = await response.json()

      // Mock data that matches backend response structure
      // const mockData: DashboardStats = {
      //   overall: {
      //     totalOrders: 142,
      //     completedOrders: 87,
      //     returnedOrders: 8,
      //     otherOrders: 47, // pending + processing + shipped + cancelled + faulty
      //     totalSelling: 125870,
      //     totalCommission: 25174,
      //   },
      //   last7Days: {
      //     totalOrders: 23,
      //     completedOrders: 15,
      //     returnedOrders: 2,
      //     otherOrders: 6,
      //     totalSelling: 18450,
      //     totalCommission: 3690,
      //   },
      // }

      // // Simulate API delay
      // await new Promise(resolve => setTimeout(resolve, 1000))
      // setStats(mockData)
    } catch (err) {
      setError('ড্যাশবোর্ড ডেটা লোড করতে সমস্যা হয়েছে')
      console.error('Dashboard fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  // Calculate performance metrics
  const getPerformanceMetrics = () => {
    if (!stats) return { completionRate: '0', avgOrderValue: '0', growthRate: '0' }

    const completionRate =
      stats.overall.totalOrders > 0
        ? ((stats.overall.completedOrders / stats.overall.totalOrders) * 100).toFixed(1)
        : '0'

    const avgOrderValue =
      stats.overall.completedOrders > 0
        ? (stats.overall.totalSelling / stats.overall.completedOrders).toFixed(0)
        : '0'

    // Calculate growth rate (last 7 days vs overall average)
    const dailyAvgOverall = stats.overall.totalOrders > 0 ? stats.overall.totalOrders / 30 : 0 // assuming 30 days overall
    const dailyAvgLast7Days = stats.last7Days.totalOrders / 7
    const growthRate =
      dailyAvgOverall > 0
        ? (((dailyAvgLast7Days - dailyAvgOverall) / dailyAvgOverall) * 100).toFixed(1)
        : '0'

    return { completionRate, avgOrderValue, growthRate }
  }

  const { completionRate, avgOrderValue, growthRate } = getPerformanceMetrics()

  if (loading) {
    return (
      <div className='bg-gray-50 p-4 md:p-6 min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <FiLoader className='animate-spin text-4xl text-indigo-600 mx-auto mb-4' />
          <p className='text-gray-600'>ড্যাশবোর্ড ডেটা লোড হচ্ছে...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className='bg-gray-50 p-4 md:p-6 min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <FiAlertCircle className='text-4xl text-red-500 mx-auto mb-4' />
          <p className='text-red-600 mb-4'>{error}</p>
          <button
            onClick={fetchDashboardStats}
            className='px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors'
          >
            পুনরায় চেষ্টা করুন
          </button>
        </div>
      </div>
    )
  }

  if (!stats) return null

  return (
    <div className='bg-gray-50 p-4 md:p-6 min-h-screen'>
      <div className='max-w-7xl mx-auto'>
        {/* Dashboard Header */}
        <div className='mb-6 md:mb-8 flex justify-between items-center'>
          <div>
            <h1 className='text-xs md:text-xs font-bold text-gray-800'>সেলার ড্যাশবোর্ড</h1>
            <p className='text-gray-600 mt-1 text-xs'>
              আপনার ব্যবসার সার্বিক পরিসংখ্যান ও বিশ্লেষণ
            </p>
          </div>
          <button
            onClick={fetchDashboardStats}
            className='px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 text-xs'
          >
            <FiRefreshCw className={loading ? 'animate-spin' : ''} />
            রিফ্রেশ
          </button>
        </div>

        {/* Main Stats Grid */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6'>
          {/* Total Sales Card */}
          <div className='bg-white rounded-xl shadow-sm p-5 border-l-4 border-blue-500'>
            <div className='flex justify-between items-start'>
              <div>
                <p className='text-sm font-medium text-gray-500'>মোট বিক্রয়</p>
                <p className='text-2xl font-bold text-gray-800 mt-1'>
                  ৳{stats.overall.totalSelling.toLocaleString()}
                </p>
                <div className='flex items-center mt-2 text-sm'>
                  <FiTrendingUp
                    className={`mr-1 ${
                      parseFloat(growthRate) >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  />
                  <span className={parseFloat(growthRate) >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {parseFloat(growthRate) >= 0 ? '+' : ''}
                    {growthRate}% গত সপ্তাহ থেকে
                  </span>
                </div>
              </div>
              <div className='p-3 rounded-lg bg-blue-50 text-blue-600'>
                <FiDollarSign className='text-2xl' />
              </div>
            </div>
          </div>

          {/* Orders Summary Card */}
          <div className='bg-white rounded-xl shadow-sm p-5 border-l-4 border-indigo-500'>
            <div className='flex justify-between items-start'>
              <div>
                <p className='text-sm font-medium text-gray-500'>মোট অর্ডার</p>
                <p className='text-2xl font-bold text-gray-800 mt-1'>{stats.overall.totalOrders}</p>
                <div className='flex items-center mt-2 text-sm text-green-500'>
                  <FiBarChart2 className='mr-1' />
                  <span>{stats.overall.completedOrders} কমপ্লিটেড</span>
                </div>
              </div>
              <div className='p-3 rounded-lg bg-indigo-50 text-indigo-600'>
                <FiShoppingBag className='text-2xl' />
              </div>
            </div>
          </div>

          {/* Commission Card */}
          <div className='bg-white rounded-xl shadow-sm p-5 border-l-4 border-green-500'>
            <div className='flex justify-between items-start'>
              <div>
                <p className='text-sm font-medium text-gray-500'>মোট কমিশন</p>
                <p className='text-2xl font-bold text-gray-800 mt-1'>
                  ৳{stats.overall.totalCommission.toLocaleString()}
                </p>
                <div className='flex items-center mt-2 text-sm text-gray-500'>
                  <FaPercentage className='mr-1' />
                  <span>
                    {stats.overall.totalSelling > 0
                      ? (
                          (stats.overall.totalCommission / stats.overall.totalSelling) *
                          100
                        ).toFixed(1)
                      : '0'}
                    % কমিশন রেট
                  </span>
                </div>
              </div>
              <div className='p-3 rounded-lg bg-green-50 text-green-600'>
                <BsGraphUp className='text-2xl' />
              </div>
            </div>
          </div>

          {/* Performance Card */}
          <div className='bg-white rounded-xl shadow-sm p-5 border-l-4 border-purple-500'>
            <div className='flex justify-between items-start'>
              <div>
                <p className='text-sm font-medium text-gray-500'>কমপ্লিটেড হার</p>
                <p className='text-2xl font-bold text-gray-800 mt-1'>{completionRate}%</p>
                <div className='flex items-center mt-2 text-sm text-gray-500'>
                  <span>গড় অর্ডার: ৳{avgOrderValue}</span>
                </div>
              </div>
              <div className='p-3 rounded-lg bg-purple-50 text-purple-600'>
                <FiCheckCircle className='text-2xl' />
              </div>
            </div>
          </div>
        </div>

        {/* Last 7 Days Comparison */}
        <div className='bg-white rounded-xl shadow-sm p-5 mb-6'>
          <h2 className='text-lg font-semibold text-gray-800 mb-4'>গত ৭ দিনের তুলনা</h2>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
            <div className='bg-gray-50 rounded-lg p-4'>
              <p className='text-sm font-medium text-gray-500'>অর্ডার</p>
              <p className='text-xl font-bold text-gray-800'>{stats.last7Days.totalOrders}</p>
              <p className='text-xs text-gray-500 mt-1'>মোট {stats.overall.totalOrders} এর মধ্যে</p>
            </div>
            <div className='bg-gray-50 rounded-lg p-4'>
              <p className='text-sm font-medium text-gray-500'>কমপ্লিটেড</p>
              <p className='text-xl font-bold text-green-600'>{stats.last7Days.completedOrders}</p>
              <p className='text-xs text-gray-500 mt-1'>
                মোট {stats.overall.completedOrders} এর মধ্যে
              </p>
            </div>
            <div className='bg-gray-50 rounded-lg p-4'>
              <p className='text-sm font-medium text-gray-500'>বিক্রয়</p>
              <p className='text-xl font-bold text-blue-600'>
                ৳{stats.last7Days.totalSelling.toLocaleString()}
              </p>
              <p className='text-xs text-gray-500 mt-1'>
                মোট ৳{stats.overall.totalSelling.toLocaleString()} এর মধ্যে
              </p>
            </div>
            <div className='bg-gray-50 rounded-lg p-4'>
              <p className='text-sm font-medium text-gray-500'>কমিশন</p>
              <p className='text-xl font-bold text-purple-600'>
                ৳{stats.last7Days.totalCommission.toLocaleString()}
              </p>
              <p className='text-xs text-gray-500 mt-1'>
                মোট ৳{stats.overall.totalCommission.toLocaleString()} এর মধ্যে
              </p>
            </div>
          </div>
        </div>

        {/* Order Status Grid */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6'>
          {/* Returned Orders */}
          <div className='bg-white rounded-lg shadow-sm p-4'>
            <div className='flex items-center justify-between mb-2'>
              <h3 className='font-medium text-gray-700'>রিটার্নড অর্ডার</h3>
              <div className='p-2 rounded-lg bg-red-50 text-red-600'>
                <FaExchangeAlt className='text-lg' />
              </div>
            </div>
            <p className='text-2xl font-bold text-red-800'>{stats.overall.returnedOrders}</p>
            <p className='text-sm text-red-400 mt-1'>
              {stats.overall.totalOrders > 0
                ? ((stats.overall.returnedOrders / stats.overall.totalOrders) * 100).toFixed(1)
                : '0'}
              % ফেরত হার
            </p>
            <div className='mt-2 text-xs text-red-400'>
              গত ৭ দিনে: {stats.last7Days.returnedOrders}টি
            </div>
          </div>

          {/* Other Orders */}
          <div className='bg-white rounded-lg shadow-sm p-4'>
            <div className='flex items-center justify-between mb-2'>
              <h3 className='font-medium text-gray-700'>অন্যান্য অর্ডার</h3>
              <div className='p-2 rounded-lg bg-gray-100 text-gray-600'>
                <MdPendingActions className='text-lg' />
              </div>
            </div>
            <p className='text-2xl font-bold text-gray-800'>{stats.overall.otherOrders}</p>
            <p className='text-sm text-gray-500 mt-1'>পেন্ডিং, প্রক্রিয়াধীন, শিপড ইত্যাদি</p>
            <div className='mt-2 text-xs text-gray-400'>
              গত ৭ দিনে: {stats.last7Days.otherOrders}টি
            </div>
          </div>
        </div>

        {/* Performance Insights */}
        <div className='bg-white rounded-xl shadow-sm p-5'>
          <div className='flex justify-between items-center mb-4'>
            <h2 className='text-lg font-semibold text-gray-800'>পারফরমেন্স ইনসাইট</h2>
          </div>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div className='text-center p-4 bg-blue-50 rounded-lg'>
              <div className='text-2xl font-bold text-blue-600'>{completionRate}%</div>
              <div className='text-sm text-gray-600 mt-1'>অর্ডার সম্পন্নের হার</div>
            </div>
            <div className='text-center p-4 bg-green-50 rounded-lg'>
              <div className='text-2xl font-bold text-green-600'>৳{avgOrderValue}</div>
              <div className='text-sm text-gray-600 mt-1'>গড় অর্ডার মূল্য</div>
            </div>
            <div className='text-center p-4 bg-purple-50 rounded-lg'>
              <div className='text-2xl font-bold text-purple-600'>
                {stats.overall.totalSelling > 0
                  ? ((stats.overall.totalCommission / stats.overall.totalSelling) * 100).toFixed(1)
                  : '0'}
                %
              </div>
              <div className='text-sm text-gray-600 mt-1'>গড় কমিশন রেট</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SellerDashboard
