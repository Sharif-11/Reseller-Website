import { ReactNode, useState } from 'react'
import { useQuery } from 'react-query'
import { dashboardApiService } from '../Api/dashboard.api'

interface StatCardProps {
  title: string
  value: string | number
  icon: ReactNode
  trend?: {
    value: string | number
    positive: boolean
  }
  className?: string
}

const StatCard = ({ title, value, icon, trend, className = '' }: StatCardProps) => {
  return (
    <div className={`bg-white rounded-lg shadow p-4 h-full ${className}`}>
      <div className='flex justify-between items-start'>
        <div>
          <p className='text-sm font-medium text-gray-500'>{title}</p>
          <p className='text-xl md:text-2xl font-semibold text-gray-900 mt-1'>{value}</p>
          {trend && (
            <span
              className={`inline-flex items-center text-xs mt-1 ${
                trend.positive ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {trend.positive ? (
                <svg className='w-3 h-3 mr-1' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M5 15l7-7 7 7'
                  />
                </svg>
              ) : (
                <svg className='w-3 h-3 mr-1' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M19 9l-7 7-7-7'
                  />
                </svg>
              )}
              {trend.value}
            </span>
          )}
        </div>
        <div className='bg-indigo-50 rounded-full p-2 md:p-3 text-indigo-600'>{icon}</div>
      </div>
    </div>
  )
}

const TimePeriodTabs = ({
  activeTab,
  setActiveTab,
}: {
  activeTab: '7days' | '30days' | 'allTime'
  setActiveTab: (tab: '7days' | '30days' | 'allTime') => void
}) => {
  return (
    <div className='flex flex-wrap gap-2 mb-6'>
      <button
        onClick={() => setActiveTab('7days')}
        className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-colors duration-200 ${
          activeTab === '7days'
            ? 'bg-indigo-600 text-white shadow-sm'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        Last 7 Days
      </button>
      <button
        onClick={() => setActiveTab('30days')}
        className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-colors duration-200 ${
          activeTab === '30days'
            ? 'bg-indigo-600 text-white shadow-sm'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        Last 30 Days
      </button>
      <button
        onClick={() => setActiveTab('allTime')}
        className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-colors duration-200 ${
          activeTab === 'allTime'
            ? 'bg-indigo-600 text-white shadow-sm'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        All Time
      </button>
    </div>
  )
}

const SellerStats = () => {
  const [activeTab, setActiveTab] = useState<'7days' | '30days' | 'allTime'>('7days')

  const { data, isLoading, error } = useQuery(
    'sellerDashboard',
    async () => {
      const response = await dashboardApiService.getDashboardData()
      if (!response.success) throw new Error(response.message)
      return response.data
    },
    {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  )

  if (isLoading) {
    return (
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
        {[...Array(4)].map((_, i) => (
          <div key={i} className='bg-white rounded-lg shadow p-4 h-24 animate-pulse'></div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className='bg-white rounded-lg shadow p-4 text-center text-red-500'>
        {(error as Error).message}
      </div>
    )
  }

  if (!data) return null

  // Get the current time period data based on active tab
  const currentStats =
    data[activeTab === '7days' ? 'last7Days' : activeTab === '30days' ? 'last30Days' : 'allTime']

  return (
    <div className='space-y-6'>
      <h2 className='text-xl font-bold text-gray-800'>Sales Overview</h2>

      <TimePeriodTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
        <StatCard
          title='Total Orders'
          value={currentStats.totalOrders}
          icon={
            <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'
              />
            </svg>
          }
        />

        <StatCard
          title='Total Sales'
          value={`$${currentStats.totalSales.toLocaleString()}`}
          icon={
            <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
              />
            </svg>
          }
        />

        <StatCard
          title='Products Sold'
          value={currentStats.totalProductsSold}
          icon={
            <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z'
              />
            </svg>
          }
        />

        <StatCard
          title='Completed Orders'
          value={currentStats.totalOrdersCompleted}
          icon={
            <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M5 13l4 4L19 7'
              />
            </svg>
          }
        />
      </div>

      <h2 className='text-xl font-bold text-gray-800 mt-8'>Commission & Referrals</h2>

      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
        <StatCard
          title='Total Commission'
          value={`$${currentStats.totalCommission.toLocaleString()}`}
          icon={
            <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
              />
            </svg>
          }
        />

        <StatCard
          title='Total Referrals'
          value={data.totalReferrals}
          icon={
            <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z'
              />
            </svg>
          }
        />

        <StatCard
          title='Level 1 Referrals'
          value={data.totalLevel1Referrals}
          icon={
            <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M13 7h8m0 0v8m0-8l-8 8-4-4-6 6'
              />
            </svg>
          }
        />

        <StatCard
          title='Level 2 Referrals'
          value={data.totalLevel2Referrals}
          icon={
            <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M13 7h8m0 0v8m0-8l-8 8-4-4-6 6'
              />
            </svg>
          }
        />
      </div>

      {/* Comparison section */}
      <div className='mt-8 bg-white rounded-lg shadow p-6'>
        <h3 className='text-lg font-semibold text-gray-800 mb-4'>Performance Comparison</h3>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <div className='border rounded-lg p-4'>
            <h4 className='text-sm font-medium text-gray-500'>Last 7 Days</h4>
            <p className='text-lg font-semibold'>${data.last7Days.totalSales.toLocaleString()}</p>
            <p className='text-sm text-gray-500'>{data.last7Days.totalOrders} orders</p>
          </div>
          <div className='border rounded-lg p-4'>
            <h4 className='text-sm font-medium text-gray-500'>Last 30 Days</h4>
            <p className='text-lg font-semibold'>${data.last30Days.totalSales.toLocaleString()}</p>
            <p className='text-sm text-gray-500'>{data.last30Days.totalOrders} orders</p>
          </div>
          <div className='border rounded-lg p-4'>
            <h4 className='text-sm font-medium text-gray-500'>All Time</h4>
            <p className='text-lg font-semibold'>${data.allTime.totalSales.toLocaleString()}</p>
            <p className='text-sm text-gray-500'>{data.allTime.totalOrders} orders</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SellerStats
