import { ReactNode, useEffect, useState } from 'react'
import { transactionApi } from '../Api/transaction.api'

interface OptionCardProps {
  title: string
  subtitle?: string
  icon: ReactNode
  amount: number
  onClick: () => void
  gradient: string
  isHighlighted?: boolean
}
const formatNumber = (num: number) => {
  // Handle decimal values
  const integerPart = Math.floor(num)
  const decimalPart = Math.round((num - integerPart) * 100)

  // Format integer part with Bengali numbering
  let formattedInteger = new Intl.NumberFormat('bn-BD').format(integerPart)

  // Add decimal part if exists (formatted in Bengali)
  if (decimalPart > 0) {
    const formattedDecimal = new Intl.NumberFormat('bn-BD').format(decimalPart).padStart(2, '০')
    return `${formattedInteger}.${formattedDecimal}`
  }

  return formattedInteger
}
const OptionCard = ({
  title,
  subtitle,
  icon,
  amount,
  onClick,
  gradient,
  isHighlighted,
}: OptionCardProps) => {
  return (
    <div
      className={`relative group cursor-pointer transform transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl ${
        isHighlighted ? 'scale-[1.02] shadow-xl' : ''
      }`}
      onClick={onClick}
    >
      {/* Main Card */}
      <div
        className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${gradient} p-4 md:p-6 text-white shadow-lg`}
      >
        {/* Background Pattern */}
        <div className='absolute inset-0 bg-black/5'>
          <div className='absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10'></div>
          <div className='absolute -bottom-6 -left-6 h-20 w-20 rounded-full bg-white/5'></div>
        </div>

        {/* Content */}
        <div className='relative z-10'>
          <div className='flex items-start justify-between mb-3 md:mb-4'>
            <div className='flex-1 mr-2'>
              <h3 className='text-base md:text-lg font-bold mb-1 leading-tight'>{title}</h3>
              {subtitle && (
                <p className='text-white/80 text-xs md:text-sm font-medium'>{subtitle}</p>
              )}
            </div>

            <div className='bg-white/20 backdrop-blur-sm rounded-2xl p-2 md:p-3 group-hover:bg-white/30 transition-colors duration-300 flex-shrink-0'>
              <div className='text-white w-4 h-4 md:w-6 md:h-6'>{icon}</div>
            </div>
          </div>

          <div className='flex items-end justify-between'>
            <div className='min-w-0'>
              <p className='text-xl md:text-3xl font-black tracking-tight truncate'>
                ৳{formatNumber(amount)}
              </p>
            </div>

            <div className='text-white/60 group-hover:text-white/80 transition-colors duration-300 flex-shrink-0 ml-2'>
              <svg
                className='w-5 h-5 md:w-6 md:h-6'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2.5}
                  d='M13 7l5 5m0 0l-5 5m5-5H6'
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

interface DetailViewProps {
  period: string
  income: number
  onBack: () => void
}

const DetailView = ({ period, income, onBack }: DetailViewProps) => {
  const getPeriodTitle = (period: string) => {
    switch (period) {
      case 'today':
        return 'আজকের ইনকাম'
      case 'yesterday':
        return 'গতকালের ইনকাম'
      case 'last7Days':
        return 'গত ৭ দিনের ইনকাম'
      case 'last30Days':
        return 'গত ৩০ দিনের ইনকাম'
      case 'allTime':
        return 'সর্বমোট ইনকাম'
      default:
        return ''
    }
  }

  const getGradient = (period: string) => {
    switch (period) {
      case 'today':
        return 'from-emerald-500 to-teal-600'
      case 'yesterday':
        return 'from-blue-500 to-indigo-600'
      case 'last7Days':
        return 'from-purple-500 to-pink-600'
      case 'last30Days':
        return 'from-orange-500 to-red-500'
      case 'allTime':
        return 'from-violet-600 to-purple-700'
      default:
        return 'from-indigo-500 to-purple-600'
    }
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-3 md:p-4'>
      {/* Header */}
      <div className='max-w-md mx-auto pt-3 md:pt-4 pb-6 md:pb-8'>
        <button
          onClick={onBack}
          className='flex items-center space-x-2 text-slate-600 hover:text-slate-900 transition-colors duration-200 mb-4 md:mb-6 group'
        >
          <div className='p-2 rounded-xl bg-white shadow-sm group-hover:shadow-md transition-shadow duration-200'>
            <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2.5}
                d='M10 19l-7-7m0 0l7-7m-7 7h18'
              />
            </svg>
          </div>
          <span className='font-semibold'>ফিরে যান</span>
        </button>
      </div>

      {/* Main Content */}
      <div className='max-w-md mx-auto space-y-4 md:space-y-6'>
        {/* Hero Card */}
        <div
          className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${getGradient(
            period
          )} p-6 md:p-8 text-white shadow-2xl`}
        >
          <div className='absolute inset-0 bg-black/10'>
            <div className='absolute -right-6 md:-right-8 -top-6 md:-top-8 h-24 md:h-32 w-24 md:w-32 rounded-full bg-white/10'></div>
            <div className='absolute -bottom-6 md:-bottom-8 -left-6 md:-left-8 h-20 md:h-24 w-20 md:w-24 rounded-full bg-white/5'></div>
          </div>

          <div className='relative z-10 text-center'>
            <h1 className='text-xl md:text-2xl font-bold mb-2'>{getPeriodTitle(period)}</h1>
            <div className='my-6 md:my-8'>
              <p className='text-2xl md:text-4xl font-black tracking-tight mb-2 break-all'>
                ৳{formatNumber(income)}
              </p>
              <div className='h-1 w-16 bg-white/40 rounded-full mx-auto'></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const SellerStats = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<string | null>(null)

  // Mock loading and error states
  const isLoading = false
  const error = null
  const [data, setData] = useState<{
    today: number
    yesterday: number
    last7Days: number
    last30Days: number
    allTime: number
  } | null>()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const { success, data, message } = await transactionApi.getIncomeStatisticsOfAUser()
      if (success && data) {
        setData(data)
      } else {
        console.log(message)
      }
    } catch (err) {
      console.error(err)
    }
  }

  if (isLoading) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4'>
        <div className='max-w-md mx-auto pt-8'>
          <div className='h-8 bg-slate-200 rounded-xl w-48 animate-pulse mb-8 mx-auto'></div>
          <div className='space-y-4'>
            {[...Array(5)].map((_, i) => (
              <div key={i} className='bg-slate-200 rounded-3xl h-32 animate-pulse'></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4'>
        <div className='bg-white rounded-2xl shadow-xl p-6 text-center text-red-500 max-w-md'>
          <div className='w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4'>
            <svg
              className='w-8 h-8 text-red-500'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.966-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z'
              />
            </svg>
          </div>
          <p className='font-semibold'>কিছু সমস্যা হয়েছে</p>
        </div>
      </div>
    )
  }

  if (!data) return null

  const handleOptionClick = (period: string) => {
    setSelectedPeriod(period)
  }

  const handleBackClick = () => {
    setSelectedPeriod(null)
  }

  if (selectedPeriod) {
    let incomeValue = 0
    switch (selectedPeriod) {
      case 'today':
        incomeValue = data.today
        break
      case 'yesterday':
        incomeValue = data.yesterday
        break
      case 'last7Days':
        incomeValue = data.last7Days
        break
      case 'last30Days':
        incomeValue = data.last30Days
        break
      case 'allTime':
        incomeValue = data.allTime
        break
    }

    return <DetailView period={selectedPeriod} income={incomeValue} onBack={handleBackClick} />
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-3 md:p-4'>
      <div className='max-w-md mx-auto pt-6 md:pt-8 pb-6 md:pb-8'>
        {/* Header */}
        <div className='text-center mb-6 md:mb-8'>
          <h1 className='text-2xl md:text-3xl font-black text-slate-800 mb-2'>ইনকাম ড্যাশবোর্ড</h1>
          <p className='text-slate-600 font-medium text-sm md:text-base'>
            আপনার ইনকামের সম্পূর্ণ হিসাব দেখুন
          </p>
          <div className='h-1 w-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full mx-auto mt-3 md:mt-4'></div>
        </div>

        {/* Stats Cards */}
        <div className='space-y-3 md:space-y-4'>
          <OptionCard
            title='সর্বমোট ইনকাম'
            icon={
              <svg
                className='w-4 h-4 md:w-6 md:h-6'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z'
                />
              </svg>
            }
            amount={data.allTime}
            gradient='from-violet-600 to-purple-700'
            onClick={() => handleOptionClick('allTime')}
          />
          <OptionCard
            title='আজকের ইনকাম'
            icon={
              <svg
                className='w-4 h-4 md:w-6 md:h-6'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z'
                />
              </svg>
            }
            amount={data.today}
            gradient='from-emerald-500 to-teal-600'
            onClick={() => handleOptionClick('today')}
            isHighlighted={true}
          />

          <OptionCard
            title='গতকালের ইনकाम'
            icon={
              <svg
                className='w-4 h-4 md:w-6 md:h-6'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z'
                />
              </svg>
            }
            amount={data.yesterday}
            gradient='from-blue-500 to-indigo-600'
            onClick={() => handleOptionClick('yesterday')}
          />

          <OptionCard
            title='গত ৭ দিনের ইনকাম'
            icon={
              <svg
                className='w-4 h-4 md:w-6 md:h-6'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
                />
              </svg>
            }
            amount={data.last7Days}
            gradient='from-purple-500 to-pink-600'
            onClick={() => handleOptionClick('last7Days')}
          />

          <OptionCard
            title='গত ৩০ দিনের ইনকাম'
            icon={
              <svg
                className='w-4 h-4 md:w-6 md:h-6'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
                />
              </svg>
            }
            amount={data.last30Days}
            gradient='from-orange-500 to-red-500'
            onClick={() => handleOptionClick('last30Days')}
          />
        </div>
      </div>
    </div>
  )
}

export default SellerStats
