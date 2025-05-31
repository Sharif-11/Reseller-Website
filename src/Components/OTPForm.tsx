import { useFormik } from 'formik'
import { useState } from 'react'
import { FiSend } from 'react-icons/fi'
import * as Yup from 'yup'
import { sendOtp } from '../Api/otp.api'

const OTPForm = ({
  mobileNumber,
  setMobileNumber,
  setPage,
}: {
  mobileNumber: string
  setMobileNumber: (value: string) => void
  setPage: (value: number) => void
}) => {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const validationSchema = Yup.object({
    mobileNumber: Yup.string()
      .matches(/^01[3-9]\d{8}$/, 'সঠিক মোবাইল নম্বর দিন (01XXXXXXXXX)')
      .required('মোবাইল নম্বর প্রয়োজন'),
  })

  const formik = useFormik({
    initialValues: {
      mobileNumber: mobileNumber,
    },
    validationSchema,
    onSubmit: async values => {
      setError(null)
      setIsLoading(true)
      try {
        const result = await sendOtp(values.mobileNumber)
        if (result.success) {
          setMobileNumber(values.mobileNumber)
          if (result.data.isVerified) {
            setPage(2) // Registration page
          } else {
            setPage(1) // OTP verification page
          }
        } else {
          setError(result.message || 'OTP পাঠাতে ব্যর্থ হয়েছে')
        }
      } catch (error) {
        setError('একটি ত্রুটি ঘটেছে, পরে আবার চেষ্টা করুন')
      } finally {
        setIsLoading(false)
      }
    },
  })

  return (
    <div className='flex items-start justify-center  py-16 px-4'>
      <div className='bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden'>
        <div className='bg-gradient-to-r from-indigo-600 to-indigo-700 p-6 text-center text-white'>
          <h1 className='text-2xl font-bold'>রেজিস্ট্রেশন শুরু করুন</h1>
          <p className='text-indigo-100 mt-1 text-sm'>OTP পেতে আপনার মোবাইল নম্বর দিন</p>
        </div>

        <div className='p-6'>
          {error && (
            <div className='mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm'>{error}</div>
          )}

          <form onSubmit={formik.handleSubmit} className='space-y-4'>
            <div>
              <label
                htmlFor='mobileNumber'
                className='block text-sm font-medium text-gray-700 mb-1'
              >
                মোবাইল নম্বর *
              </label>
              <input
                id='mobileNumber'
                name='mobileNumber'
                type='text'
                placeholder='01XXXXXXXXX'
                value={formik.values.mobileNumber}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                  formik.touched.mobileNumber && formik.errors.mobileNumber
                    ? 'border-red-500'
                    : 'border-gray-300'
                }`}
              />
              {formik.touched.mobileNumber && formik.errors.mobileNumber && (
                <p className='text-red-500 text-xs mt-1'>{formik.errors.mobileNumber}</p>
              )}
            </div>

            <button
              type='submit'
              disabled={isLoading}
              className='w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2'
            >
              {isLoading ? (
                <>
                  <svg
                    className='animate-spin h-4 w-4 text-white'
                    xmlns='http://www.w3.org/2000/svg'
                    fill='none'
                    viewBox='0 0 24 24'
                  >
                    <circle
                      className='opacity-25'
                      cx='12'
                      cy='12'
                      r='10'
                      stroke='currentColor'
                      strokeWidth='4'
                    ></circle>
                    <path
                      className='opacity-75'
                      fill='currentColor'
                      d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                    ></path>
                  </svg>
                  পাঠানো হচ্ছে...
                </>
              ) : (
                <>
                  <FiSend />
                  OTP পাঠান
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default OTPForm
