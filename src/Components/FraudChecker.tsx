import { motion } from 'framer-motion'
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

// Animation variants
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.1 },
  },
}

// Circular Progress Component
const CircularProgress = ({
  percentage,
  size = 60,
  strokeWidth = 4,
  color = '#e94560',
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
      <span className='absolute inset-0 flex items-center justify-center text-sm font-bold text-gray-700'>
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
      const { success, data } = await orderApi.fraudCheckByPhoneNo(mobileNumber)

      if (success) {
        setFraudData(data)
      } else {
        setError(data.message || 'কিছু ভুল হয়েছে। আবার চেষ্টা করুন।')
      }
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
        color: 'text-emerald-600',
        bg: 'bg-emerald-50',
        icon: CheckCircle,
        borderColor: 'border-emerald-200',
        gradient: 'from-emerald-500 to-emerald-600',
      }
    }
    if (reliabilityScore >= 75) {
      return {
        level: 'কম ঝুঁকি',
        color: 'text-blue-600',
        bg: 'bg-blue-50',
        icon: Shield,
        borderColor: 'border-blue-200',
        gradient: 'from-blue-500 to-blue-600',
      }
    }
    if (reliabilityScore >= 50) {
      return {
        level: 'মাঝারি ঝুঁকি',
        color: 'text-amber-600',
        bg: 'bg-amber-50',
        icon: AlertTriangle,
        borderColor: 'border-amber-200',
        gradient: 'from-amber-500 to-amber-600',
      }
    }
    return {
      level: 'উচ্চ ঝুঁকি',
      color: 'text-rose-600',
      bg: 'bg-rose-50',
      icon: XCircle,
      borderColor: 'border-rose-200',
      gradient: 'from-rose-500 to-rose-600',
    }
  }

  const getProgressColor = (percentage: number): string => {
    if (percentage >= 80) return '#10b981'
    if (percentage >= 60) return '#3b82f6'
    if (percentage >= 40) return '#f59e0b'
    return '#e94560'
  }

  return (
    <div className='min-h-screen bg-[#f7f6f3] py-6 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-4xl mx-auto'>
        {/* Header */}
        <motion.div initial='hidden' animate='visible' variants={staggerContainer} className='mb-8'>
          <motion.div variants={fadeUp} className='text-center'>
            <div className='inline-flex h-16 w-16 rounded-2xl bg-gradient-to-br from-rose-500 to-rose-600 items-center justify-center shadow-lg mb-4'>
              <Shield className='h-8 w-8 text-white' />
            </div>
            <h1 className='text-2xl md:text-3xl font-bold text-[#1a1a2e]'>কাস্টমার ফ্রড চেকার</h1>
            <p className='text-gray-500 text-sm mt-1'>
              কাস্টমারের মোবাইল নম্বর দিয়ে ফ্রড চেক করুন
            </p>
          </motion.div>
        </motion.div>

        {/* Search Card */}
        <motion.div
          variants={fadeUp}
          initial='hidden'
          animate='visible'
          className='bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6'
        >
          <div className='space-y-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1.5'>মোবাইল নম্বর</label>
              <div className='relative'>
                <input
                  type='tel'
                  value={mobileNumber}
                  onChange={e => {
                    setMobileNumber(e.target.value)
                    setError('')
                  }}
                  placeholder='01XXXXXXXXX'
                  className='w-full px-4 py-3 rounded-xl border border-gray-200 text-center sm:text-left text-base focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400 transition-all'
                  maxLength={11}
                />
              </div>
              {error && <p className='text-rose-500 text-sm mt-1'>{error}</p>}
            </div>

            <button
              onClick={handleFraudCheck}
              disabled={isLoading || !mobileNumber.trim()}
              className='w-full bg-rose-500 hover:bg-rose-600 text-white font-medium py-3 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-rose-500/20'
            >
              {isLoading ? (
                <>
                  <div className='animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent' />
                  চেক করা হচ্ছে...
                </>
              ) : (
                <>
                  <Search className='h-4 w-4' />
                  চেক করুন
                </>
              )}
            </button>
          </div>
        </motion.div>

        {/* Results Section */}
        {fraudData && (
          <motion.div
            variants={staggerContainer}
            initial='hidden'
            animate='visible'
            className='space-y-6'
          >
            {/* Summary Cards */}
            <div className='grid grid-cols-3 gap-3'>
              <motion.div
                variants={fadeUp}
                className='bg-white rounded-xl p-4 text-center border border-gray-100 shadow-sm'
              >
                <div className='h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center mx-auto mb-2'>
                  <Package className='h-5 w-5 text-blue-500' />
                </div>
                <p className='text-xs text-gray-500 mb-1'>মোট পার্সেল</p>
                <p className='text-xl font-bold text-gray-800'>{fraudData.total_parcels}</p>
              </motion.div>

              <motion.div
                variants={fadeUp}
                className='bg-white rounded-xl p-4 text-center border border-gray-100 shadow-sm'
              >
                <div className='h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center mx-auto mb-2'>
                  <CheckCircle className='h-5 w-5 text-emerald-500' />
                </div>
                <p className='text-xs text-gray-500 mb-1'>ডেলিভার্ড</p>
                <p className='text-xl font-bold text-emerald-600'>{fraudData.total_delivered}</p>
              </motion.div>

              <motion.div
                variants={fadeUp}
                className='bg-white rounded-xl p-4 text-center border border-gray-100 shadow-sm'
              >
                <div className='h-10 w-10 rounded-xl bg-rose-100 flex items-center justify-center mx-auto mb-2'>
                  <XCircle className='h-5 w-5 text-rose-500' />
                </div>
                <p className='text-xs text-gray-500 mb-1'>ক্যান্সেল্ড</p>
                <p className='text-xl font-bold text-rose-600'>{fraudData.total_cancel}</p>
              </motion.div>
            </div>

            {/* Risk Assessment */}
            <motion.div variants={fadeUp}>
              {(() => {
                const reliability = calculateCustomerReliability(fraudData)
                const riskLevel = getRiskLevel(reliability.score)

                return (
                  <div
                    className={`bg-white rounded-2xl p-6 border ${riskLevel.borderColor} shadow-sm`}
                  >
                    <div className='flex flex-col sm:flex-row items-center gap-6'>
                      <div className='flex flex-col items-center'>
                        <CircularProgress
                          percentage={reliability.score}
                          size={100}
                          strokeWidth={8}
                          color={getProgressColor(reliability.score)}
                        />
                        <span className='text-xs text-gray-500 mt-2'>নির্ভরযোগ্যতা স্কোর</span>
                      </div>
                      <div className='flex-1 text-center sm:text-left'>
                        <div
                          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${riskLevel.bg} mb-3`}
                        >
                          <riskLevel.icon className={`h-4 w-4 ${riskLevel.color}`} />
                          <span className={`text-sm font-semibold ${riskLevel.color}`}>
                            {riskLevel.level}
                          </span>
                        </div>
                        <p className='text-gray-700 text-sm leading-relaxed'>
                          {reliability.suggestion}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })()}
            </motion.div>

            {/* Courier Details */}
            <motion.div
              variants={fadeUp}
              className='bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden'
            >
              <div className='bg-gradient-to-r from-[#1a1a2e] to-[#16213e] px-5 py-3'>
                <div className='flex items-center gap-2'>
                  <Truck className='h-4 w-4 text-rose-400' />
                  <h3 className='text-white font-semibold'>কুরিয়ার সার্ভিস বিস্তারিত</h3>
                </div>
              </div>

              {/* Mobile Card View */}
              <div className='sm:hidden divide-y divide-gray-100'>
                {Object.entries(fraudData.apis).map(([key, courier]) => {
                  const totalParcels = Number(courier.total_parcels)
                  const deliveredParcels = Number(courier.total_delivered_parcels)
                  const cancelledParcels = Number(courier.total_cancelled_parcels)
                  const successRate =
                    totalParcels > 0 ? Math.round((deliveredParcels / totalParcels) * 100) : 0

                  return (
                    <div key={key} className='p-4'>
                      <div className='flex justify-between items-center mb-3'>
                        <h4 className='font-semibold text-gray-800'>{courier.courier_name}</h4>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            totalParcels > 0
                              ? successRate >= 50
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-amber-100 text-amber-700'
                              : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {totalParcels > 0 ? `${successRate}% সফল` : 'কোনো ডাটা নেই'}
                        </span>
                      </div>
                      <div className='grid grid-cols-3 gap-2 text-center'>
                        <div className='bg-gray-50 rounded-lg p-2'>
                          <p className='text-xs text-gray-500'>মোট</p>
                          <p className='font-semibold'>{totalParcels}</p>
                        </div>
                        <div className='bg-emerald-50 rounded-lg p-2'>
                          <p className='text-xs text-emerald-600'>ডেলিভার্ড</p>
                          <p className='font-semibold text-emerald-700'>{deliveredParcels}</p>
                        </div>
                        <div className='bg-rose-50 rounded-lg p-2'>
                          <p className='text-xs text-rose-600'>ক্যান্সেল্ড</p>
                          <p className='font-semibold text-rose-700'>{cancelledParcels}</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Desktop Table View */}
              <div className='hidden sm:block overflow-x-auto'>
                <table className='w-full'>
                  <thead className='bg-gray-50 border-b border-gray-100'>
                    <tr>
                      <th className='px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        কুরিয়ার
                      </th>
                      <th className='px-5 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        মোট পার্সেল
                      </th>
                      <th className='px-5 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        ডেলিভার্ড
                      </th>
                      <th className='px-5 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        ক্যান্সেল্ড
                      </th>
                      <th className='px-5 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        সফলতার হার
                      </th>
                    </tr>
                  </thead>
                  <tbody className='divide-y divide-gray-100'>
                    {Object.entries(fraudData.apis).map(([key, courier]) => {
                      const totalParcels = Number(courier.total_parcels)
                      const deliveredParcels = Number(courier.total_delivered_parcels)
                      const cancelledParcels = Number(courier.total_cancelled_parcels)
                      const successRate =
                        totalParcels > 0 ? Math.round((deliveredParcels / totalParcels) * 100) : 0

                      return (
                        <tr key={key} className='hover:bg-gray-50/50 transition-colors'>
                          <td className='px-5 py-3 text-sm font-medium text-gray-800'>
                            {courier.courier_name}
                          </td>
                          <td className='px-5 py-3 text-sm text-center text-gray-600'>
                            {totalParcels}
                          </td>
                          <td className='px-5 py-3 text-sm text-center text-emerald-600 font-medium'>
                            {deliveredParcels}
                          </td>
                          <td className='px-5 py-3 text-sm text-center text-rose-600 font-medium'>
                            {cancelledParcels}
                          </td>
                          <td className='px-5 py-3 text-sm text-center'>
                            <span
                              className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                                totalParcels > 0
                                  ? successRate >= 50
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : 'bg-amber-100 text-amber-700'
                                  : 'bg-gray-100 text-gray-500'
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
            </motion.div>
          </motion.div>
        )}

        {/* Empty State */}
        {!fraudData && !error && (
          <motion.div
            variants={fadeUp}
            initial='hidden'
            animate='visible'
            className='text-center py-12 bg-white rounded-2xl border border-gray-100'
          >
            <div className='w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4'>
              <Shield className='h-10 w-10 text-gray-400' />
            </div>
            <p className='text-gray-500'>ফ্রড চেক করতে একটি মোবাইল নম্বর দিন</p>
          </motion.div>
        )}

        {/* Error State */}
        {error && !fraudData && (
          <motion.div
            variants={fadeUp}
            initial='hidden'
            animate='visible'
            className='bg-rose-50 border-l-4 border-rose-500 rounded-xl p-4'
          >
            <div className='flex items-start gap-3'>
              <XCircle className='h-5 w-5 text-rose-500 flex-shrink-0 mt-0.5' />
              <p className='text-rose-700 text-sm'>{error}</p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default FraudCheckComponent
