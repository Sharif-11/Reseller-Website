import { ReactNode } from 'react'
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
  period?: string
}

const StatCard = ({ title, value, icon, className = '', period }: StatCardProps) => {
  return (
    <div
      className={`bg-white rounded-xl shadow-sm p-5 h-full border border-gray-100 hover:shadow-md transition-shadow duration-200 ${className}`}
    >
      <div className='flex justify-between items-start'>
        <div className='flex-1'>
          <p className='text-xs font-bold text-gray-500 uppercase tracking-wider'>{title}</p>
          <p className='text-2xl md:text-3xl font-bold text-gray-900 mt-2'>{value}</p>
          {period && <p className='text-xs text-gray-400 mt-1'>{period}</p>}
        </div>
        <div className='bg-indigo-100 rounded-xl p-3 text-indigo-600 flex-shrink-0 ml-2'>
          {icon}
        </div>
      </div>
    </div>
  )
}

const SellerStats = () => {
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
      <div className='space-y-6 p-4'>
        <div className='h-8 bg-gray-200 rounded-md w-1/3 animate-pulse mb-6'></div>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5'>
          {[...Array(4)].map((_, i) => (
            <div key={i} className='bg-white rounded-xl shadow-sm p-5 h-32 animate-pulse'></div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className='bg-white rounded-xl shadow-sm p-6 text-center text-red-500'>
        {(error as Error).message}
      </div>
    )
  }

  if (!data) return null

  // Format numbers in Bangla
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('bn-BD').format(num)
  }

  // Calculate percentage changes

  const todayIncome = data.today?.totalIncome || 0
  const yesterdayIncome = data.yesterday?.totalIncome || 0
  const last7DaysIncome = data.last7Days?.totalIncome || 0
  const last30DaysIncome = data.last30Days?.totalIncome || 0
  const allTimeIncome = data.allTime?.totalIncome || 0

  return (
    <div className='min-h-screen bg-gray-50 p-4 md:p-6'>
      {/* Header */}
      {/* <div className='mb-8'>
        <h1 className='text-2xl md:text-3xl font-bold text-gray-800'>আয়ের ড্যাশবোর্ড</h1>
      </div> */}

      {/* Key Metrics Cards */}
      <div className='bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-sm p-6 text-white mb-8'>
        <h2 className='text-xl font-bold mb-4 text-center'>সর্বমোট ইনকাম</h2>
        <div className='flex items-center justify-center'>
          <p className='text-4xl md:text-5xl font-bold'>৳{formatNumber(allTimeIncome)}</p>
        </div>
      </div>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8'>
        <StatCard
          title='আজকের ইনকাম'
          value={`৳${formatNumber(todayIncome)}`}
          icon={
            <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
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
          title='গতকালের ইনকাম'
          value={`৳${formatNumber(yesterdayIncome)}`}
          icon={
            <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
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
          title='গত 7 দিনের ইনকাম'
          value={`৳${formatNumber(last7DaysIncome)}`}
          icon={
            <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
              />
            </svg>
          }
          period='গত ৭ দিন'
        />

        <StatCard
          title='গত 30 দিনের ইনকাম'
          value={`৳${formatNumber(last30DaysIncome)}`}
          icon={
            <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
              />
            </svg>
          }
        />
      </div>

      {/* Performance Summary */}

      {/* Time Period Comparison */}
    </div>
  )
}

export default SellerStats
