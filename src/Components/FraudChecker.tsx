import { AlertTriangle, CheckCircle, Package, Search, Shield, Truck, XCircle } from 'lucide-react'
import { useState } from 'react'
import { orderApi } from '../Api/order.api'
import calculateCustomerReliability from '../utils/reliabilty'

// Types
interface CourierData {
  courier_name: string
  total_parcels: number
  total_delivered_parcels: number | string
  total_cancelled_parcels: number | string
}

interface FraudData {
  mobile_number: string
  total_parcels: number
  total_delivered: number
  total_cancel: number
  apis: {
    [key: string]: CourierData
  }
}

// Circular Progress Component
const CircularProgress = ({
  percentage,
  size = 60,
  strokeWidth = 4,
  color = '#3b82f6',
}: {
  percentage: number
  size?: number
  strokeWidth?: number
  color?: string
}) => {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`

  return (
    <div className='relative inline-flex items-center justify-center'>
      <svg width={size} height={size} className='transform -rotate-90'>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke='currentColor'
          strokeWidth={strokeWidth}
          fill='transparent'
          className='text-gray-200'
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill='transparent'
          strokeDasharray={strokeDasharray}
          strokeLinecap='round'
          className='transition-all duration-500 ease-out'
        />
      </svg>
      <span className='absolute inset-0 flex items-center justify-center text-xs font-semibold text-gray-700'>
        {percentage}%
      </span>
    </div>
  )
}

const FraudCheckComponent = () => {
  const [mobileNumber, setMobileNumber] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [fraudData, setFraudData] = useState<FraudData | null>(null)
  const [error, setError] = useState<string>('')

  // API call function - replace with your actual API endpoint
  const handleFraudCheck = async (): Promise<void> => {
    if (!mobileNumber.trim()) {
      setError('মোবাইল নম্বর দিন')
      return
    }

    if (mobileNumber.length !== 11 || !mobileNumber.startsWith('01')) {
      setError('সঠিক মোবাইল নম্বর দিন (01XXXXXXXXX)')
      return
    }

    setIsLoading(true)
    setError('')
    setFraudData(null)

    try {
      // Replace this with your actual API call
      const { success, data } = await orderApi.fraudCheckByPhoneNo(mobileNumber)

      if (success) {
        setFraudData(data)
      } else {
        setError(data.message || 'কিছু ভুল হয়েছে। আবার চেষ্টা করুন।')
      }
      // setFraudData(response.data)
      // Mock API call for demonstration
      // await new Promise(resolve => setTimeout(resolve, 1500))
      // const mockResponse: FraudResponse = {
      //   statusCode: 200,
      //   message: 'Fraud check completed successfully',
      //   success: true,
      //   data: {
      //     mobile_number: mobileNumber,
      //     total_parcels: 5,
      //     total_delivered: 4,
      //     total_cancel: 1,
      //     apis: {
      //       Pathao: {
      //         courier_name: 'Pathao',
      //         total_parcels: 2,
      //         total_delivered_parcels: 2,
      //         total_cancelled_parcels: 0,
      //       },
      //       Steadfast: {
      //         courier_name: 'Steadfast',
      //         total_parcels: 1,
      //         total_delivered_parcels: 0,
      //         total_cancelled_parcels: 1,
      //       },
      //       Paperfly: {
      //         courier_name: 'PaperFly',
      //         total_parcels: 1,
      //         total_delivered_parcels: 1,
      //         total_cancelled_parcels: 0,
      //       },
      //       Redex: {
      //         courier_name: 'Redx',
      //         total_parcels: 1,
      //         total_delivered_parcels: 1,
      //         total_cancelled_parcels: 0,
      //       },
      //     },
      //   },
      // }
      // setFraudData(mockResponse)
    } catch (err) {
      setError('কিছু ভুল হয়েছে। আবার চেষ্টা করুন।')
      console.error('Fraud check error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const getRiskLevel = (reliabilityScore: number) => {
    if (reliabilityScore >= 90) {
      return {
        level: 'নিরাপদ',
        color: 'text-green-600',
        bg: 'bg-green-50',
        icon: CheckCircle,
        borderColor: 'border-green-200',
      }
    }
    if (reliabilityScore >= 75) {
      return {
        level: 'কম ঝুঁকি',
        color: 'text-blue-600',
        bg: 'bg-blue-50',
        icon: Shield,
        borderColor: 'border-blue-200',
      }
    }
    if (reliabilityScore >= 50) {
      return {
        level: 'মাঝারি ঝুঁকি',
        color: 'text-yellow-600',
        bg: 'bg-yellow-50',
        icon: AlertTriangle,
        borderColor: 'border-yellow-200',
      }
    }
    return {
      level: 'উচ্চ ঝুঁকি',
      color: 'text-red-600',
      bg: 'bg-red-50',
      icon: XCircle,
      borderColor: 'border-red-200',
    }
  }

  const getProgressColor = (percentage: number): string => {
    if (percentage >= 80) return '#10b981' // green
    if (percentage >= 60) return '#3b82f6' // blue
    if (percentage >= 40) return '#f59e0b' // yellow
    return '#ef4444' // red
  }

  return (
    <div className='min-h-screen bg-gray-50 px-3 py-4 sm:px-4 sm:py-6'>
      <div className='max-w-4xl mx-auto space-y-4 sm:space-y-6'>
        {/* Header */}
        <div className='text-center space-y-2 px-2'>
          <div className='flex items-center justify-center space-x-2 text-indigo-600'>
            <Shield className='w-6 h-6 sm:w-8 sm:h-8' />
            <h1 className='text-xl sm:text-2xl md:text-3xl font-bold'>কাস্টমার ফ্রড চেকার</h1>
          </div>
          <p className='text-gray-600 text-xs sm:text-sm md:text-base'>
            কাস্টমারের মোবাইল নম্বর দিয়ে ফ্রড চেক করুন
          </p>
        </div>

        {/* Search Section */}
        <div className='bg-white rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6 border border-gray-100'>
          <div className='space-y-3 sm:space-y-4'>
            <label className='block text-sm font-semibold text-gray-700'>মোবাইল নম্বর</label>
            <div className='space-y-3'>
              <div className='relative'>
                <input
                  type='tel'
                  value={mobileNumber}
                  onChange={e => {
                    setMobileNumber(e.target.value)
                    setError('')
                  }}
                  placeholder='01XXXXXXXXX'
                  className='w-full px-4 py-3 text-center sm:text-left border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-lg sm:text-base'
                  maxLength={11}
                />
              </div>
              {error && <p className='text-red-600 text-sm text-center sm:text-left'>{error}</p>}
              <button
                type='submit'
                onClick={handleFraudCheck}
                disabled={isLoading || !mobileNumber.trim()}
                className='w-full px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center space-x-2'
              >
                {isLoading ? (
                  <div className='w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin' />
                ) : (
                  <>
                    <Search className='w-5 h-5' />
                    <span>চেক করুন</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Results Section */}
        {fraudData && (
          <div className='space-y-4 sm:space-y-6'>
            {/* Summary Cards */}
            <div className='grid grid-cols-3 gap-2 sm:gap-3'>
              {/* Total Parcels */}
              <div className='bg-white rounded-lg p-3 shadow-sm border border-gray-100 flex flex-col items-center'>
                <div className='p-2 bg-blue-50 rounded-full mb-1'>
                  <Package className='w-5 h-5 text-blue-500' />
                </div>
                <p className='text-xs text-gray-500 mb-1'>পার্সেল</p>
                <p className='text-md font-bold text-gray-800'>{fraudData.total_parcels}</p>
              </div>

              {/* Delivered */}
              <div className='bg-white rounded-lg p-3 shadow-sm border border-gray-100 flex flex-col items-center'>
                <div className='p-2 bg-green-50 rounded-full mb-1'>
                  <CheckCircle className='w-5 h-5 text-green-500' />
                </div>
                <p className='text-xs text-gray-500 mb-1'>ডেলিভার্ড</p>
                <p className='text-md font-bold text-gray-800'>{fraudData.total_delivered}</p>
              </div>

              {/* Cancelled */}
              <div className='bg-white rounded-lg p-3 shadow-sm border border-gray-100 flex flex-col items-center'>
                <div className='p-2 bg-red-50 rounded-full mb-1'>
                  <XCircle className='w-5 h-5 text-red-500' />
                </div>
                <p className='text-xs text-gray-500 mb-1'>ক্যান্সেল্ড</p>
                <p className='text-md font-bold text-gray-800'>{fraudData.total_cancel}</p>
              </div>
            </div>

            {/* Risk Assessment with Circular Progress */}
            <div className='bg-white rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6 border border-gray-100'>
              {(() => {
                const reliability = calculateCustomerReliability(fraudData)
                const riskLevel = getRiskLevel(reliability.score)

                return (
                  <div className={`p-4 rounded-lg ${riskLevel.bg} border ${riskLevel.borderColor}`}>
                    <div className='flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6'>
                      <div className='flex flex-col items-center space-y-2'>
                        <CircularProgress
                          percentage={reliability.score}
                          size={80}
                          strokeWidth={6}
                          color={getProgressColor(reliability.score)}
                        />
                        <span className='text-xs text-gray-600'>নির্ভরযোগ্যতা স্কোর</span>
                      </div>

                      <div className='flex-1 text-center sm:text-left'>
                        {/* <div className='flex items-center justify-center sm:justify-start space-x-3 mb-2'>
                          <RiskIcon className={`w-6 h-6 ${riskLevel.color}`} />
                        </div> */}
                        <div className='text-sm text-gray-700 space-y-1'>
                          <p className={`font-medium mt-2 ${riskLevel.color}`}>
                            {reliability.suggestion}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })()}
            </div>

            {/* Courier Details */}
            <div className='bg-white rounded-lg shadow-sm p-4 border border-gray-100'>
              <h3 className='text-md font-semibold text-gray-800 mb-3 flex items-center space-x-2'>
                <Truck className='w-4 h-4 text-indigo-500' />
                <span>কুরিয়ার সার্ভিস বিস্তারিত</span>
              </h3>

              {/* Mobile View (Cards) */}
              <div className='sm:hidden space-y-2'>
                {Object.entries(fraudData.apis).map(([key, courier]) => {
                  const totalParcels = Number(courier.total_parcels)
                  const deliveredParcels = Number(courier.total_delivered_parcels)
                  const cancelledParcels = Number(courier.total_cancelled_parcels)
                  const successRate =
                    totalParcels > 0 ? Math.round((deliveredParcels / totalParcels) * 100) : 0

                  return (
                    <div key={key} className='border border-gray-100 rounded-md p-3'>
                      <div className='flex justify-between items-center mb-1'>
                        <h4 className='font-medium text-gray-800'>{courier.courier_name}</h4>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            totalParcels > 0
                              ? successRate >= 50
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {totalParcels > 0 ? `${successRate}%` : 'N/A'}
                        </span>
                      </div>

                      <div className='grid grid-cols-3 gap-1 text-xs'>
                        <div className='flex flex-col'>
                          <span className='text-gray-500'>মোট</span>
                          <span className='font-semibold'>{totalParcels}</span>
                        </div>
                        <div className='flex flex-col'>
                          <span className='text-green-500'>ডেলিভার্ড</span>
                          <span className='font-semibold text-green-600'>{deliveredParcels}</span>
                        </div>
                        <div className='flex flex-col'>
                          <span className='text-red-500'>ক্যান্সেল্ড</span>
                          <span className='font-semibold text-red-600'>{cancelledParcels}</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Desktop View (Table) */}
              <div className='hidden sm:block overflow-x-auto'>
                <table className='min-w-full divide-y divide-gray-200'>
                  <thead className='bg-gray-50'>
                    <tr>
                      <th
                        scope='col'
                        className='px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                      >
                        কুরিয়ার
                      </th>
                      <th
                        scope='col'
                        className='px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider'
                      >
                        মোট পার্সেল
                      </th>
                      <th
                        scope='col'
                        className='px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider'
                      >
                        ডেলিভার্ড
                      </th>
                      <th
                        scope='col'
                        className='px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider'
                      >
                        ক্যান্সেল্ড
                      </th>
                      <th
                        scope='col'
                        className='px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider'
                      >
                        সফলতার হার
                      </th>
                    </tr>
                  </thead>
                  <tbody className='bg-white divide-y divide-gray-200'>
                    {Object.entries(fraudData.apis).map(([key, courier]) => {
                      const totalParcels = Number(courier.total_parcels)
                      const deliveredParcels = Number(courier.total_delivered_parcels)
                      const cancelledParcels = Number(courier.total_cancelled_parcels)
                      const successRate =
                        totalParcels > 0 ? Math.round((deliveredParcels / totalParcels) * 100) : 0

                      return (
                        <tr key={key} className='hover:bg-gray-50'>
                          <td className='px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900'>
                            {courier.courier_name}
                          </td>
                          <td className='px-4 py-2 whitespace-nowrap text-sm text-center text-gray-500'>
                            {totalParcels}
                          </td>
                          <td className='px-4 py-2 whitespace-nowrap text-sm text-center text-green-600 font-medium'>
                            {deliveredParcels}
                          </td>
                          <td className='px-4 py-2 whitespace-nowrap text-sm text-center text-red-600 font-medium'>
                            {cancelledParcels}
                          </td>
                          <td className='px-4 py-2 whitespace-nowrap text-sm text-center'>
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${
                                totalParcels > 0
                                  ? successRate >= 50
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {totalParcels > 0 ? `${successRate}%` : 'N/A'}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* No Data State */}
        {!fraudData && !error && (
          <div className='text-center py-12'>
            <Shield className='w-16 h-16 text-gray-300 mx-auto mb-4' />
            <p className='text-gray-500 text-sm sm:text-base px-4'>
              ফ্রড চেক করতে একটি মোবাইল নম্বর দিন
            </p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className='bg-red-50 border-l-4 border-red-500 p-4 rounded-lg'>
            <div className='flex items-start'>
              <div className='flex-shrink-0'>
                <XCircle className='w-5 h-5 text-red-600' />
              </div>
              <div className='ml-3 flex-1'>
                <p className='text-sm text-red-700'>{error}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default FraudCheckComponent
