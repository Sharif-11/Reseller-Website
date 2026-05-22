// PasswordReset.tsx — follows header theme colors, no branding
import { ErrorMessage, Field, Form, Formik } from 'formik'
import { useState } from 'react'
import { FiArrowLeft, FiArrowRight, FiCheckCircle, FiLock, FiSmartphone } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import * as Yup from 'yup'
import { forgotPassword } from '../Api/auth.api'

const validationSchema = Yup.object({
  phoneNo: Yup.string()
    .required('ফোন নম্বর প্রয়োজন')
    .matches(/^01\d{9}$/, 'সঠিক মোবাইল নম্বর দিন (01XXXXXXXXX)'),
})

const PasswordReset = () => {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (values: { phoneNo: string }) => {
    setError(null)
    setIsLoading(true)
    try {
      const { success, message } = await forgotPassword(values)
      if (success) {
        setSuccess(true)
        setSuccessMessage(message || 'পাসওয়ার্ড রিসেট লিঙ্ক সফলভাবে পাঠানো হয়েছে।')
        setTimeout(() => navigate('/login'), 5000)
      } else {
        setError(message || 'পাসওয়ার্ড রিসেট করতে সমস্যা হয়েছে')
      }
    } catch (err) {
      setError('একটি ত্রুটি ঘটেছে, পরে আবার চেষ্টা করুন')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='min-h-screen bg-[#f7f6f3] flex flex-col'>
      {/* Mobile top bar with theme colors (navy background, rose accent) */}
      <div className='bg-[#1a1a2e] px-4 py-3 flex items-center gap-3 lg:hidden border-b border-white/10'>
        <button
          onClick={() => navigate('/login')}
          className='flex items-center justify-center h-8 w-8 rounded-lg border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition'
        >
          <FiArrowLeft className='h-4 w-4' />
        </button>
        <span className='text-sm font-medium text-white/80'>পাসওয়ার্ড রিসেট</span>
      </div>

      <div className='flex flex-1 items-center justify-center px-4 py-10 lg:py-16'>
        <div className='w-full max-w-md'>
          {/* Card with theme accent */}
          <div className='bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden'>
            {/* Header – clean, using navy for background, rose for icon */}
            <div className='bg-[#1a1a2e] px-6 pt-6 pb-4'>
              <div className='flex items-center gap-3 mb-2'>
                <div className='h-10 w-10 rounded-full bg-[#e94560]/15 flex items-center justify-center border border-[#e94560]/25'>
                  <FiLock className='h-5 w-5 text-[#e94560]' />
                </div>
                <h1 className='text-xl font-bold text-white'>পাসওয়ার্ড রিসেট করুন</h1>
              </div>
              <p className='text-sm text-white/50'>
                আপনার রেজিস্টার্ড মোবাইল নম্বরে একটি রিসেট লিঙ্ক পাঠানো হবে।
              </p>
            </div>

            {/* Form body */}
            <div className='px-6 py-6'>
              {/* Success message */}
              {success && (
                <div className='mb-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4 flex gap-3'>
                  <FiCheckCircle className='h-5 w-5 text-emerald-600 shrink-0 mt-0.5' />
                  <div>
                    <p className='text-sm font-medium text-emerald-800'>সফলভাবে পাঠানো হয়েছে!</p>
                    <p className='text-sm text-emerald-700 mt-0.5'>{successMessage}</p>
                    <p className='text-xs text-emerald-600 mt-1'>
                      ৫ সেকেন্ডের মধ্যে লগইন পেজে নিয়ে যাওয়া হবে...
                    </p>
                  </div>
                </div>
              )}

              {/* Error message */}
              {error && (
                <div className='mb-6 rounded-lg border border-red-200 bg-red-50 p-4'>
                  <p className='text-sm text-red-700'>{error}</p>
                </div>
              )}

              <Formik
                initialValues={{ phoneNo: '' }}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
              >
                {({ touched, errors, values }) => (
                  <Form className='space-y-5'>
                    {/* Phone field */}
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-1.5'>
                        মোবাইল নম্বর <span className='text-[#e94560]'>*</span>
                      </label>

                      <div className='relative'>
                        <div className='absolute left-0 inset-y-0 flex items-center pl-3 pointer-events-none'>
                          <FiSmartphone className='h-4 w-4 text-gray-400' />
                        </div>
                        <Field
                          name='phoneNo'
                          type='tel'
                          placeholder='01XXXXXXXXX'
                          className={`w-full pl-9 pr-10 py-2.5 rounded-lg border text-sm text-gray-800 placeholder:text-gray-400 transition-all outline-none focus:ring-2 focus:ring-[#e94560]/20 focus:border-[#e94560] ${
                            touched.phoneNo && errors.phoneNo
                              ? 'border-red-400 bg-red-50'
                              : 'border-gray-300 bg-white'
                          }`}
                        />
                        {values.phoneNo && !errors.phoneNo && (
                          <div className='absolute right-3 top-1/2 -translate-y-1/2'>
                            <FiCheckCircle className='h-4 w-4 text-emerald-500' />
                          </div>
                        )}
                      </div>

                      <ErrorMessage
                        name='phoneNo'
                        component='p'
                        className='mt-1.5 text-xs text-red-500'
                      />
                      <p className='mt-1.5 text-xs text-gray-400'>উদাহরণ: 01712345678 (11 ডিজিট)</p>
                    </div>

                    {/* Submit button – rose theme */}
                    <button
                      type='submit'
                      disabled={isLoading || success}
                      className='w-full flex justify-center items-center gap-2 rounded-lg bg-[#e94560] py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#c73652] focus:outline-none focus:ring-2 focus:ring-[#e94560]/30 focus:ring-offset-1 disabled:opacity-60 disabled:cursor-not-allowed transition-colors'
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
                            />
                            <path
                              className='opacity-75'
                              fill='currentColor'
                              d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                            />
                          </svg>
                          যাচাই করা হচ্ছে...
                        </>
                      ) : success ? (
                        <>
                          <FiCheckCircle className='h-4 w-4' />
                          পাঠানো হয়েছে
                        </>
                      ) : (
                        <>
                          রিসেট লিঙ্ক পাঠান
                          <FiArrowRight className='h-4 w-4' />
                        </>
                      )}
                    </button>
                  </Form>
                )}
              </Formik>

              {/* Divider */}
              <div className='my-6 flex items-center gap-3'>
                <div className='flex-1 h-px bg-gray-200' />
                <span className='text-xs text-gray-400 uppercase tracking-wider'>অথবা</span>
                <div className='flex-1 h-px bg-gray-200' />
              </div>

              {/* Back to login – neutral style */}
              <button
                type='button'
                onClick={() => navigate('/login')}
                className='group flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors'
              >
                <FiArrowLeft className='h-3.5 w-3.5' />
                লগইন পেজে ফিরে যান
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PasswordReset
