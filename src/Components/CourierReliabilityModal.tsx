import React from 'react'
import { FiAlertCircle, FiCheckCircle, FiPackage, FiRotateCcw, FiTruck, FiX } from 'react-icons/fi'
import { getReliabilityMessage, SimplifiedResult } from '../utils/customer.reliability'

interface CourierReliabilityModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  reliabilityData: SimplifiedResult
  isLoading?: boolean
}

const CircularProgress: React.FC<{ score: number; size?: number }> = ({ score, size = 120 }) => {
  const radius = (size - 12) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (score / 100) * circumference

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#10B981' // green
    if (score >= 60) return '#F59E0B' // yellow
    if (score >= 40) return '#EF4444' // red
    return '#DC2626' // dark red
  }

  const getScoreText = (score: number) => {
    if (score >= 80) return 'চমৎকার'
    if (score >= 60) return 'ভাল'
    if (score >= 40) return 'গড়'
    return 'দুর্বল'
  }

  return (
    <div className='relative flex items-center justify-center'>
      <svg width={size} height={size} className='transform -rotate-90'>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke='#E5E7EB'
          strokeWidth='8'
          fill='none'
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={getScoreColor(score)}
          strokeWidth='8'
          fill='none'
          strokeLinecap='round'
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className='transition-all duration-1000 ease-out'
        />
      </svg>

      {/* Score text */}
      <div className='absolute inset-0 flex flex-col items-center justify-center'>
        <div className='text-2xl font-bold text-gray-900'>{score}</div>
        <div className='text-xs text-gray-500'>স্কোর</div>
        <div className='text-xs font-medium mt-1' style={{ color: getScoreColor(score) }}>
          {getScoreText(score)}
        </div>
      </div>
    </div>
  )
}

const CourierReliabilityModal: React.FC<CourierReliabilityModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  reliabilityData,
  isLoading = false,
}) => {
  if (!isOpen) return null

  const { totalOrders, completedOrders, returnedOrders, reliabilityScore } = reliabilityData

  const getReliabilityIcon = (score: number) => {
    if (score >= 60) return <FiCheckCircle className='text-green-500' size={20} />
    return <FiAlertCircle className='text-yellow-500' size={20} />
  }

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 pt-[85px] z-50'>
      <div className='bg-white rounded-lg shadow-xl w-full max-w-md mx-auto max-h-[90vh] overflow-y-auto'>
        {/* Header */}
        <div className='flex items-center justify-between p-4 border-b'>
          <h2 className='text-lg font-semibold text-gray-900'>কাস্টমার নির্ভরযোগ্যতা যাচাই</h2>
          <button
            onClick={onClose}
            className='p-1 rounded-full hover:bg-gray-100 transition-colors'
          >
            <FiX size={20} className='text-gray-500' />
          </button>
        </div>

        {/* Content */}
        <div className='p-6'>
          {isLoading ? (
            <div className='flex items-center justify-center py-8'>
              <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
              <span className='ml-2 text-gray-600'>যাচাই করা হচ্ছে...</span>
            </div>
          ) : (
            <>
              {/* Reliability Score Circle */}
              <div className='flex justify-center mb-6'>
                <CircularProgress score={reliabilityScore} />
              </div>

              {/* Reliability Message */}
              <div className='flex items-center justify-center mb-6 p-3 bg-gray-50 rounded-lg'>
                {getReliabilityIcon(reliabilityScore)}
                <p className='ml-2 text-sm text-gray-700 text-center'>
                  {getReliabilityMessage(reliabilityData)}
                </p>
              </div>

              {/* Statistics */}
              <div className='grid grid-cols-3 gap-4 mb-6'>
                <div className='text-center p-3 bg-blue-50 rounded-lg'>
                  <FiPackage className='mx-auto text-blue-600 mb-2' size={20} />
                  <div className='text-lg font-semibold text-gray-900'>
                    {totalOrders.toLocaleString('bn-BD')}
                  </div>
                  <div className='text-xs text-gray-600'>মোট অর্ডার</div>
                </div>

                <div className='text-center p-3 bg-green-50 rounded-lg'>
                  <FiTruck className='mx-auto text-green-600 mb-2' size={20} />
                  <div className='text-lg font-semibold text-gray-900'>
                    {completedOrders.toLocaleString('bn-BD')}
                  </div>
                  <div className='text-xs text-gray-600'>সম্পন্ন অর্ডার</div>
                </div>

                <div className='text-center p-3 bg-red-50 rounded-lg'>
                  <FiRotateCcw className='mx-auto text-red-600 mb-2' size={20} />
                  <div className='text-lg font-semibold text-gray-900'>
                    {returnedOrders.toLocaleString('bn-BD')}
                  </div>
                  <div className='text-xs text-gray-600'>রিটার্ন অর্ডার</div>
                </div>
              </div>

              {/* Additional Info */}
              {totalOrders > 0 && (
                <div className='bg-gray-50 rounded-lg p-4 mb-6'>
                  <h3 className='text-sm font-medium text-gray-900 mb-2'>বিস্তারিত তথ্য</h3>
                  <div className='space-y-2 text-sm'>
                    <div className='flex justify-between'>
                      <span className='text-gray-600'>সাফল্যের হার:</span>
                      <span className='font-medium'>
                        {totalOrders > 0 ? ((completedOrders / totalOrders) * 100).toFixed(1) : '0'}
                        %
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-gray-600'>রিটার্নের হার:</span>
                      <span className='font-medium'>
                        {totalOrders > 0 ? ((returnedOrders / totalOrders) * 100).toFixed(1) : '0'}%
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Warning for low reliability */}
              {/* {reliabilityScore < 30 && (
                <div className='bg-red-50 border border-red-200 rounded-lg p-4 mb-6'>
                  <div className='flex items-start'>
                    <FiAlertCircle className='text-red-600 mt-0.5 flex-shrink-0' size={16} />
                    <div className='ml-2'>
                      <h4 className='text-sm font-medium text-red-800'>সতর্কতা</h4>
                      <p className='text-sm text-red-700 mt-1'>
                        এই কাস্টমারের নির্ভরযোগ্যতা কম। অর্ডার গ্রহণের পূর্বে অতিরিক্ত সতর্কতা
                        অবলম্বন করুন।
                      </p>
                    </div>
                  </div>
                </div>
              )} */}
            </>
          )}
        </div>

        {/* Footer */}
        <div className='flex gap-3 p-4 border-t bg-gray-50'>
          <button
            onClick={onClose}
            className='flex-1 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors'
          >
            বাতিল
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className='flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors'
          >
            {isLoading ? 'যাচাই করা হচ্ছে...' : 'অর্ডার কনফার্ম করুন'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default CourierReliabilityModal
