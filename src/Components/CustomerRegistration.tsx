import { useFormik } from 'formik'
import { useState } from 'react'
import { FiLock, FiPhone, FiUser } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import * as Yup from 'yup'
import { RegisterInfo, registerCustomer } from '../Api/auth.api'
import { omitEmptyStringKeys } from '../utils/omitEmptyStrings'
import CustomerLogin from './CustomerLogin'

interface CustomerRegistrationProps {
  mobileNumber: string
  referralCode: string | null
}

const CustomerRegistration = ({ mobileNumber, referralCode }: CustomerRegistrationProps) => {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [customerExists, setCustomerExists] = useState(false)
  const [checkingExistingCustomer, setCheckingExistingCustomer] = useState(true)

  // useEffect(() => {
  //   const check = async () => {
  //     try {
  //       const exists = await checkExistingCustomer(mobileNumber)
  //       setCustomerExists(exists.data)
  //       if (exists.data) {
  //         setError('এই মোবাইল নম্বর দিয়ে ইতিমধ্যে রেজিস্ট্রেশন করা হয়েছে। লগইন করুন।')
  //       }
  //     } catch (error) {
  //       setError('গ্রাহক তথ্য চেক করতে সমস্যা হয়েছে। পরে আবার চেষ্টা করুন।')
  //     } finally {
  //       setCheckingExistingCustomer(false)
  //     }
  //   }

  //   check()
  // }, [mobileNumber])

  const validationSchema = Yup.object({
    name: Yup.string().max(48, 'নামটি আরও ছোট হতে হবে').required('নাম আবশ্যক'),
    password: Yup.string()
      .min(6, 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষর হতে হবে')
      .required('পাসওয়ার্ড আবশ্যক'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password')], 'পাসওয়ার্ড মেলেনি')
      .required('পাসওয়ার্ড নিশ্চিত করুন'),
    referralCode: Yup.string()
      .optional()
      .matches(/^[a-zA-Z0-9-_]+$/, 'শুধুমাত্র অক্ষর, সংখ্যা, (-) এবং (_) ব্যবহার করুন')
      .min(3, 'অন্তত ৩ অক্ষর হতে হবে')
      .max(16, '১৬ অক্ষরের বেশি হতে পারবে না'),
  })

  const formik = useFormik({
    initialValues: {
      phoneNo: mobileNumber,
      name: '',
      password: '',
      confirmPassword: '',
      referralCode: referralCode || '',
      role: 'customer',
    },
    validationSchema,
    onSubmit: async values => {
      setError(null)
      setIsLoading(true)
      try {
        const { confirmPassword, ...payload } = values
        const registrationData = omitEmptyStringKeys(payload) as RegisterInfo

        const { success, message } = await registerCustomer({
          phoneNo: registrationData.phoneNo,
          name: registrationData.name,
          password: registrationData.password,
          sellerCode: registrationData.referralCode || '',
        })

        if (success) {
          navigate('/login', { state: { registrationSuccess: true } })
        } else {
          setError(message || 'রেজিস্ট্রেশন ব্যর্থ হয়েছে')
        }
      } catch (error) {
        setError('একটি ত্রুটি ঘটেছে, পরে আবার চেষ্টা করুন')
      } finally {
        setIsLoading(false)
      }
    },
  })

  if (checkingExistingCustomer) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mx-auto'></div>
          <p className='mt-4 text-gray-600'>গ্রাহক তথ্য যাচাই করা হচ্ছে...</p>
        </div>
      </div>
    )
  }

  if (customerExists) {
    return <CustomerLogin phoneNumber={mobileNumber} />
  }

  return (
    <div className='flex items-center justify-center min-h-screen p-4'>
      <div className='bg-white rounded-xl shadow-lg w-full max-w-2xl overflow-hidden'>
        <div className='bg-gradient-to-r from-indigo-600 to-indigo-700 p-6 text-center text-white'>
          <h1 className='text-xl font-bold'>কাস্টমার রেজিস্ট্রেশন</h1>
          <p className='text-indigo-100 mt-1 text-sm'>
            আপনার মৌলিক তথ্য প্রদান করে রেজিস্ট্রেশন সম্পন্ন করুন
          </p>
        </div>

        <div className='p-6'>
          {error && (
            <div className='mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm md:col-span-2'>
              {error}
            </div>
          )}

          <form onSubmit={formik.handleSubmit} className='grid md:grid-cols-2 gap-4'>
            <div className='md:col-span-2'>
              <label className='block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2'>
                <FiPhone />
                মোবাইল নম্বর *
              </label>
              <input
                type='text'
                value={formik.values.phoneNo}
                readOnly
                className='w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50'
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2'>
                <FiUser />
                আপনার নাম *
              </label>
              <input
                type='text'
                className={`w-full px-4 py-3 border rounded-lg ${
                  formik.touched.name && formik.errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                {...formik.getFieldProps('name')}
              />
              {formik.touched.name && formik.errors.name && (
                <p className='text-red-500 text-xs mt-1'>{formik.errors.name}</p>
              )}
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                রেফারাল কোড (ঐচ্ছিক)
              </label>
              <input
                type='text'
                className={`w-full px-4 py-3 border rounded-lg ${
                  formik.values.referralCode ? 'bg-gray-50' : ''
                } ${
                  formik.touched.referralCode && formik.errors.referralCode
                    ? 'border-red-500'
                    : 'border-gray-300'
                }`}
                {...formik.getFieldProps('referralCode')}
                readOnly={!!referralCode}
              />
              {formik.touched.referralCode && formik.errors.referralCode && (
                <p className='text-red-500 text-xs mt-1'>{formik.errors.referralCode}</p>
              )}
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2'>
                <FiLock />
                পাসওয়ার্ড *
              </label>
              <input
                type='password'
                className={`w-full px-4 py-3 border rounded-lg ${
                  formik.touched.password && formik.errors.password
                    ? 'border-red-500'
                    : 'border-gray-300'
                }`}
                {...formik.getFieldProps('password')}
              />
              {formik.touched.password && formik.errors.password && (
                <p className='text-red-500 text-xs mt-1'>{formik.errors.password}</p>
              )}
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                পাসওয়ার্ড নিশ্চিত করুন *
              </label>
              <input
                type='password'
                className={`w-full px-4 py-3 border rounded-lg ${
                  formik.touched.confirmPassword && formik.errors.confirmPassword
                    ? 'border-red-500'
                    : 'border-gray-300'
                }`}
                {...formik.getFieldProps('confirmPassword')}
              />
              {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                <p className='text-red-500 text-xs mt-1'>{formik.errors.confirmPassword}</p>
              )}
            </div>

            <div className='md:col-span-2'>
              <button
                type='submit'
                disabled={isLoading || !formik.isValid}
                className='w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50'
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
                    রেজিস্ট্রেশন করা হচ্ছে...
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
  )
}

export default CustomerRegistration
