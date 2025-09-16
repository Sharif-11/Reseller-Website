import { ErrorMessage, Field, Form, Formik } from 'formik'
import { useEffect, useState } from 'react'
import { FiKey, FiLogIn, FiUserPlus } from 'react-icons/fi'
import { useLocation, useNavigate } from 'react-router-dom'
import * as Yup from 'yup'
import { login } from '../Api/auth.api'
import { localStorageAvailable } from '../Axios/baseUrl'
import { useAuth } from '../Hooks/useAuth'
import Footer from './Footer'

const LoginPage = () => {
  const [error, setError] = useState<string | null>(null)
  const [autoLoginAttempted, setAutoLoginAttempted] = useState(false)
  const { setUser, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Get phone and password from navigation state
  const { mobileNumber: preFilledMobile, password: preFilledPassword } = location.state || {}

  const validationSchema = Yup.object().shape({
    mobileNumber: Yup.string()
      .matches(/^01[3-9]\d{8}$/, 'সঠিক মোবাইল নম্বর দিন (01XXXXXXXXX)')
      .required('মোবাইল নম্বর প্রয়োজন'),
    password: Yup.string()
      .min(6, 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে')
      .max(16, 'পাসওয়ার্ড সর্বাধিক ১৬ অক্ষরের হতে হবে')
      .required('পাসওয়ার্ড প্রয়োজন'),
  })

  const handleLogin = async (values: { mobileNumber: string; password: string }) => {
    setError(null)
    try {
      const result = await login({
        phoneNo: values.mobileNumber,
        password: values.password,
      })

      if (result.success) {
        if (result.data.user.role === 'Seller') {
          setUser(result.data?.user)
          if (localStorageAvailable) {
            localStorage.setItem('token', result.data?.token)
          }
          console.log({ user })
          // Navigate after successful login
          navigate('/home', { replace: true }) // Change to your desired route
        } else {
          setError('আপনার একাউন্ট সেলার হিসেবে নিবন্ধিত নয়।')
        }
      } else {
        setError(result.message || 'লগইন করতে ব্যর্থ হয়েছে')
      }
    } catch (error) {
      setError('একটি ত্রুটি ঘটেছে, পরে আবার চেষ্টা করুন')
    }
  }

  // Auto-login effect when pre-filled credentials are available
  useEffect(() => {
    if (preFilledMobile && preFilledPassword && !autoLoginAttempted) {
      setAutoLoginAttempted(true)
      handleLogin({
        mobileNumber: preFilledMobile,
        password: preFilledPassword,
      })
    }
  }, [preFilledMobile, preFilledPassword, autoLoginAttempted])

  return (
    <>
      <div className='flex items-start justify-center py-8 px-4' id='login'>
        <div className='w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden'>
          {/* Header Section */}
          <div className='bg-gradient-to-r from-indigo-600 to-indigo-700 p-6 text-center'>
            <h1 className='text-2xl font-bold text-white flex items-center justify-center gap-2'>
              <FiLogIn className='text-2xl' />
              লগইন করুন
            </h1>
          </div>

          <div className='p-6 sm:p-8'>
            {error && (
              <div className='mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm'>{error}</div>
            )}

            <Formik
              initialValues={{
                mobileNumber: preFilledMobile || '',
                password: preFilledPassword || '',
              }}
              validationSchema={validationSchema}
              onSubmit={handleLogin}
              enableReinitialize
            >
              {({ isSubmitting, errors, touched }) => (
                <Form className='space-y-4'>
                  {/* Mobile Number Field */}
                  <div>
                    <label
                      htmlFor='mobileNumber'
                      className='block text-sm font-medium text-gray-700 mb-1'
                    >
                      মোবাইল নম্বর *
                    </label>
                    <Field
                      id='mobileNumber'
                      name='mobileNumber'
                      type='text'
                      placeholder='01XXXXXXXXX'
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                        errors.mobileNumber && touched.mobileNumber
                          ? 'border-red-500'
                          : 'border-gray-300'
                      }`}
                    />
                    <ErrorMessage
                      name='mobileNumber'
                      component='div'
                      className='text-red-500 text-xs mt-1'
                    />
                  </div>

                  {/* Password Field */}
                  <div>
                    <label
                      htmlFor='password'
                      className='block text-sm font-medium text-gray-700 mb-1'
                    >
                      পাসওয়ার্ড *
                    </label>
                    <Field
                      id='password'
                      name='password'
                      type='password'
                      placeholder='আপনার পাসওয়ার্ড লিখুন'
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                        errors.password && touched.password ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    <ErrorMessage
                      name='password'
                      component='div'
                      className='text-red-500 text-xs mt-1'
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type='submit'
                    disabled={isSubmitting}
                    className='w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2'
                  >
                    {isSubmitting ? (
                      <>
                        <svg
                          className='animate-spin -ml-1 mr-2 h-4 w-4 text-white'
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
                        লগইন হচ্ছে...
                      </>
                    ) : (
                      <>
                        <FiLogIn />
                        লগইন করুন
                      </>
                    )}
                  </button>
                </Form>
              )}
            </Formik>

            {/* Additional Options */}
            <div className='mt-6 pt-4 border-t border-gray-200'>
              <div className='flex flex-col sm:flex-row justify-between gap-3 text-sm'>
                <button
                  onClick={() => navigate('/register')}
                  className='text-indigo-600 hover:text-indigo-800 font-medium flex items-center justify-center gap-1'
                >
                  <FiUserPlus />
                  নতুন একাউন্ট তৈরি করুন
                </button>
                <button
                  onClick={() => navigate('/forgot-password')}
                  className='text-gray-600 hover:text-gray-800 font-medium flex items-center justify-center gap-1'
                >
                  <FiKey />
                  পাসওয়ার্ড ভুলে গেছেন?
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}

export default LoginPage
