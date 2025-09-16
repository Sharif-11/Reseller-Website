import { useFormik } from 'formik'
import { useEffect, useState } from 'react'
import { FiKey, FiLock, FiMapPin, FiPhone, FiRefreshCw, FiUser, FiX } from 'react-icons/fi'
import { useNavigate, useSearchParams } from 'react-router-dom'
import * as Yup from 'yup'
import districts from '../../public/zillasInfo.json'
import { register, RegisterInfo } from '../Api/auth.api'
import { sendOtp, verifyOtp } from '../Api/otp.api'
import { omitEmptyStringKeys } from '../utils/omitEmptyStrings'
import Footer from './Footer'

const DRAFT_STORAGE_KEY = 'registration_draft'

interface FormValues {
  phoneNo: string
  name: string
  zilla: string
  upazilla: string
  address: string
  password: string
  confirmPassword: string
}

const UnifiedRegistration = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const referralCode = searchParams.get('ref')

  const [error, setError] = useState<string | null>(null)
  const [upazillas, setUpazillas] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // OTP Modal states
  const [showOtpModal, setShowOtpModal] = useState(false)
  const [otpValue, setOtpValue] = useState('')
  const [otpError, setOtpError] = useState<string | null>(null)
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)

  const validationSchema = Yup.object({
    phoneNo: Yup.string()
      .matches(/^01[3-9]\d{8}$/, 'সঠিক মোবাইল নম্বর দিন (01XXXXXXXXX)')
      .required('মোবাইল নম্বর প্রয়োজন'),
    name: Yup.string()
      .min(3, 'নাম অবশ্যই ৩ অক্ষরের বেশি হতে হবে')
      .max(48, 'নামটি আরও ছোট হতে হবে')
      .required('নাম আবশ্যক'),
    zilla: Yup.string().required('জেলা নির্বাচন করুন').max(48, 'জেলার নাম আরও ছোট হতে হবে'),
    upazilla: Yup.string().required('উপজেলা নির্বাচন করুন').max(48, 'উপজেলার নাম আরও ছোট হতে হবে'),
    address: Yup.string()
      .min(10, 'ঠিকানা আরও বিস্তারিত হতে হবে')
      .max(255, 'ঠিকানা আরও ছোট হতে হবে')
      .required('ঠিকানা আবশ্যক'),
    password: Yup.string()
      .min(6, 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষর হতে হবে')
      .required('পাসওয়ার্ড আবশ্যক'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password')], 'পাসওয়ার্ড মেলেনি')
      .required('পাসওয়ার্ড নিশ্চিত করুন'),
  })

  // Load draft on mount
  const loadDraft = (): FormValues => {
    try {
      const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY)
      if (savedDraft) {
        const draft = JSON.parse(savedDraft)
        return {
          phoneNo: draft.phoneNo || '',
          name: draft.name || '',
          zilla: draft.zilla || '',
          upazilla: draft.upazilla || '',
          address: draft.address || '',
          password: '', // Don't save passwords in draft
          confirmPassword: '', // Don't save passwords in draft
        }
      }
    } catch (error) {
      console.error('Error loading draft:', error)
    }
    return {
      phoneNo: '',
      name: '',
      zilla: '',
      upazilla: '',
      address: '',
      password: '',
      confirmPassword: '',
    }
  }

  // Save draft function
  const saveDraft = (values: FormValues) => {
    try {
      const draftData = {
        phoneNo: values.phoneNo,
        name: values.name,
        zilla: values.zilla,
        upazilla: values.upazilla,
        address: values.address,
        // Don't save passwords
      }
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draftData))
    } catch (error) {
      console.error('Error saving draft:', error)
    }
  }

  // Clear draft function
  const clearDraft = () => {
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY)
    } catch (error) {
      console.error('Error clearing draft:', error)
    }
  }

  const formik = useFormik({
    initialValues: loadDraft(),
    validationSchema,
    onSubmit: async values => {
      setError(null)
      setIsLoading(true)

      try {
        // First, send OTP
        const otpResult = await sendOtp(values.phoneNo)

        if (otpResult.success) {
          if (otpResult.data.isVerified) {
            // Phone is already verified, proceed directly to registration
            await handleRegistration(values)
          } else {
            // Show OTP modal for verification
            setShowOtpModal(true)
            setIsLoading(false)
          }
        } else {
          setError(otpResult.message || 'OTP পাঠাতে ব্যর্থ হয়েছে')
          setIsLoading(false)
        }
      } catch (error) {
        setError('একটি ত্রুটি ঘটেছে, পরে আবার চেষ্টা করুন')
        setIsLoading(false)
      }
    },
  })

  // Auto-save draft when form values change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      // Only save if form has some data
      if (Object.values(formik.values).some(value => value.trim() !== '')) {
        saveDraft(formik.values)
      }
    }, 1000) // Save after 1 second of inactivity

    return () => clearTimeout(timeoutId)
  }, [formik.values])

  // Save draft before page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (Object.values(formik.values).some(value => value.trim() !== '')) {
        saveDraft(formik.values)
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [formik.values])

  // Load upazillas when component mounts if zilla is already selected from draft
  useEffect(() => {
    if (formik.values.zilla) {
      const selectedZilla = formik.values.zilla as keyof typeof districts
      setUpazillas(districts[selectedZilla] || [])
    }
  }, [])

  const handleRegistration = async (values: FormValues) => {
    try {
      const { confirmPassword, ...payload } = values
      // Add default shop name and referral code if present in URL
      const registrationData = {
        ...payload,
        shopName: `${payload.name}'s Shop`, // Default shop name based on user's name
        ...(referralCode && { referralCode }),
      }

      const cleanedData = omitEmptyStringKeys(registrationData) as RegisterInfo
      const { success, message } = await register(cleanedData)

      if (success) {
        clearDraft() // Clear draft on successful registration
        // From another component
        navigate('/login', {
          state: {
            mobileNumber: values.phoneNo,
            password: values.password,
          },
        })
      } else {
        setError(message || 'রেজিস্ট্রেশন ব্যর্থ হয়েছে')
        setShowOtpModal(false)
      }
    } catch (error) {
      setError('রেজিস্ট্রেশনে একটি ত্রুটি ঘটেছে')
      setShowOtpModal(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleOtpVerification = async () => {
    if (!otpValue || otpValue.length !== 6) {
      setOtpError('ওটিপি ৬ ডিজিটের হতে হবে')
      return
    }

    setOtpError(null)
    setIsVerifyingOtp(true)

    try {
      const result = await verifyOtp(formik.values.phoneNo, otpValue)

      if (result.success) {
        setShowOtpModal(false)
        setIsLoading(true)
        // Proceed with registration after successful OTP verification
        await handleRegistration(formik.values)
      } else {
        setOtpError(result.message || 'ওটিপি যাচাই ব্যর্থ হয়েছে')
      }
    } catch (error) {
      setOtpError('ওটিপি যাচাইয়ে একটি ত্রুটি ঘটেছে')
    } finally {
      setIsVerifyingOtp(false)
    }
  }

  const handleResendOtp = async () => {
    setResendLoading(true)
    setResendSuccess(false)
    setOtpError(null)

    try {
      const result = await sendOtp(formik.values.phoneNo)
      if (result.data?.alreadySent) {
        setOtpError(result.data.message || 'ওটিপি ইতিমধ্যে পাঠানো হয়েছে')
      } else if (result.success) {
        setResendSuccess(true)
        setTimeout(() => setResendSuccess(false), 3000)
      } else {
        setOtpError(result.message || 'ওটিপি পুনরায় পাঠানো ব্যর্থ হয়েছে')
      }
    } catch (error) {
      setOtpError('ওটিপি পুনরায় পাঠাতে সমস্যা হয়েছে')
    } finally {
      setResendLoading(false)
    }
  }

  const handleZillaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedZilla = e.target.value as keyof typeof districts
    formik.setFieldValue('zilla', selectedZilla)
    formik.setFieldValue('upazilla', '')
    setUpazillas(selectedZilla ? districts[selectedZilla] || [] : [])
  }

  const closeOtpModal = () => {
    setShowOtpModal(false)
    setOtpValue('')
    setOtpError(null)
    setResendSuccess(false)
  }

  return (
    <div className='pt-4' id='register'>
      <div className='flex items-center justify-center min-h-screen p-4 bg-gray-50'>
        <div className='bg-white rounded-xl shadow-lg w-full max-w-2xl overflow-hidden border border-gray-200'>
          <div className='bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-center text-white'>
            <h1 className='text-2xl font-bold'>রেজিস্ট্রেশন ফর্ম</h1>
            <p className='text-blue-100 mt-2 text-sm'>
              রেজিস্ট্রেশন সম্পন্ন করতে সকল তথ্য সঠিকভাবে পূরণ করুন
            </p>
            {referralCode && (
              <div className='mt-3 text-blue-100 text-sm'>
                রেফারাল কোড:{' '}
                <span className='font-mono bg-blue-500 px-2 py-1 rounded'>{referralCode}</span>
              </div>
            )}
          </div>

          <div className='p-6 md:p-8'>
            <form onSubmit={formik.handleSubmit} className='grid md:grid-cols-2 gap-5'>
              {/* Phone Number */}
              <div className='md:col-span-2'>
                <label className='block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2'>
                  <FiPhone className='text-blue-600' />
                  মোবাইল নম্বর *
                </label>
                <input
                  type='text'
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    formik.touched.phoneNo && formik.errors.phoneNo
                      ? 'border-red-500'
                      : 'border-gray-300'
                  }`}
                  {...formik.getFieldProps('phoneNo')}
                  placeholder='01XXXXXXXXX'
                />
                {formik.touched.phoneNo && formik.errors.phoneNo && (
                  <p className='text-red-500 text-xs mt-1'>{formik.errors.phoneNo}</p>
                )}
              </div>

              {/* Name */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2'>
                  <FiUser className='text-blue-600' />
                  আপনার পুরো নাম *
                </label>
                <input
                  type='text'
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    formik.touched.name && formik.errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  {...formik.getFieldProps('name')}
                  placeholder='পুরো নাম লিখুন'
                />
                {formik.touched.name && formik.errors.name && (
                  <p className='text-red-500 text-xs mt-1'>{formik.errors.name}</p>
                )}
              </div>

              {/* Shop Name - Removed, using default */}

              {/* District */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2'>
                  <FiMapPin className='text-blue-600' />
                  জেলা *
                </label>
                <select
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    formik.touched.zilla && formik.errors.zilla
                      ? 'border-red-500'
                      : 'border-gray-300'
                  }`}
                  {...formik.getFieldProps('zilla')}
                  onChange={handleZillaChange}
                >
                  <option value=''>জেলা নির্বাচন করুন</option>
                  {Object.keys(districts).map(district => (
                    <option key={district} value={district}>
                      {district}
                    </option>
                  ))}
                </select>
                {formik.touched.zilla && formik.errors.zilla && (
                  <p className='text-red-500 text-xs mt-1'>{formik.errors.zilla}</p>
                )}
              </div>

              {/* Upazilla */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>উপজেলা *</label>
                <select
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    formik.touched.upazilla && formik.errors.upazilla
                      ? 'border-red-500'
                      : 'border-gray-300'
                  }`}
                  {...formik.getFieldProps('upazilla')}
                  disabled={!formik.values.zilla}
                >
                  <option value=''>উপজেলা নির্বাচন করুন</option>
                  {upazillas.map(upazilla => (
                    <option key={upazilla} value={upazilla}>
                      {upazilla}
                    </option>
                  ))}
                </select>
                {formik.touched.upazilla && formik.errors.upazilla && (
                  <p className='text-red-500 text-xs mt-1'>{formik.errors.upazilla}</p>
                )}
              </div>

              {/* Address */}
              <div className='md:col-span-2'>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  সম্পূর্ণ ঠিকানা *
                </label>
                <textarea
                  rows={3}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    formik.touched.address && formik.errors.address
                      ? 'border-red-500'
                      : 'border-gray-300'
                  }`}
                  {...formik.getFieldProps('address')}
                  placeholder='গ্রাম/রোড নং, ইউনিয়ন/ওয়ার্ড, পোস্ট অফিস'
                />
                {formik.touched.address && formik.errors.address && (
                  <p className='text-red-500 text-xs mt-1'>{formik.errors.address}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2'>
                  <FiLock className='text-blue-600' />
                  পাসওয়ার্ড *
                </label>
                <input
                  type='password'
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    formik.touched.password && formik.errors.password
                      ? 'border-red-500'
                      : 'border-gray-300'
                  }`}
                  {...formik.getFieldProps('password')}
                  placeholder='অন্তত ৬ অক্ষর'
                />
                {formik.touched.password && formik.errors.password && (
                  <p className='text-red-500 text-xs mt-1'>{formik.errors.password}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  পাসওয়ার্ড নিশ্চিত করুন *
                </label>
                <input
                  type='password'
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    formik.touched.confirmPassword && formik.errors.confirmPassword
                      ? 'border-red-500'
                      : 'border-gray-300'
                  }`}
                  {...formik.getFieldProps('confirmPassword')}
                  placeholder='পাসওয়ার্ড আবার লিখুন'
                />
                {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                  <p className='text-red-500 text-xs mt-1'>{formik.errors.confirmPassword}</p>
                )}
              </div>

              {/* Submit Button */}
              <div className='md:col-span-2 mt-2'>
                {error && (
                  <div className='mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100'>
                    {error}
                  </div>
                )}

                <button
                  type='submit'
                  disabled={isLoading || !formik.isValid}
                  className='w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                >
                  {isLoading ? (
                    <>
                      <svg
                        className='animate-spin h-5 w-5 text-white'
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
                      প্রক্রিয়াকরণ হচ্ছে...
                    </>
                  ) : (
                    'রেজিস্ট্রেশন সম্পন্ন করুন'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* OTP Verification Modal */}
      {showOtpModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
          <div className='bg-white rounded-xl shadow-lg w-full max-w-md'>
            {/* Modal Header */}
            <div className='bg-gradient-to-r from-indigo-600 to-indigo-700 p-4 text-center text-white relative'>
              <button
                onClick={closeOtpModal}
                className='absolute right-4 top-4 text-white hover:text-gray-200'
              >
                <FiX size={20} />
              </button>
              <h2 className='text-xl font-bold'>ওটিপি যাচাইকরণ</h2>
              <p className='text-indigo-100 text-sm mt-1'>
                {formik.values.phoneNo} নম্বরে পাঠানো ৬ ডিজিটের কোড লিখুন
              </p>
            </div>

            {/* Modal Content */}
            <div className='p-6'>
              {otpError && (
                <div className='mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm'>{otpError}</div>
              )}

              {resendSuccess && (
                <div className='mb-4 p-3 bg-green-50 text-green-600 rounded-lg text-sm'>
                  ওটিপি সফলভাবে পুনরায় পাঠানো হয়েছে
                </div>
              )}

              <div className='space-y-4'>
                {/* OTP Input */}
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2'>
                    <FiKey className='text-indigo-600' />
                    ওটিপি কোড *
                  </label>
                  <input
                    type='text'
                    inputMode='numeric'
                    pattern='[0-9]*'
                    placeholder='৬ ডিজিটের ওটিপি'
                    maxLength={6}
                    value={otpValue}
                    onChange={e => setOtpValue(e.target.value)}
                    className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-center text-lg tracking-widest'
                  />
                </div>

                {/* Action Buttons */}
                <div className='flex items-center justify-between'>
                  <button
                    type='button'
                    onClick={handleResendOtp}
                    disabled={resendLoading}
                    className='text-indigo-600 hover:text-indigo-800 text-sm flex items-center gap-1'
                  >
                    <FiRefreshCw className={`text-sm ${resendLoading ? 'animate-spin' : ''}`} />
                    {resendLoading ? 'পাঠানো হচ্ছে...' : 'পুনরায় পাঠান'}
                  </button>
                </div>

                {/* Verify Button */}
                <button
                  onClick={handleOtpVerification}
                  disabled={isVerifyingOtp || !otpValue || otpValue.length !== 6}
                  className='w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50'
                >
                  {isVerifyingOtp ? (
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
                      যাচাই করা হচ্ছে...
                    </>
                  ) : (
                    'যাচাই করুন'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}

export default UnifiedRegistration
