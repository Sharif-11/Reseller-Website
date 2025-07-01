import { useFormik } from 'formik'
import { useState } from 'react'
import {
  FiFacebook,
  FiLock,
  FiMail,
  FiMapPin,
  FiPhone,
  FiShoppingBag,
  FiUser,
} from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import * as Yup from 'yup'
import districts from '../../public/zillasInfo.json'
import { register, RegisterInfo } from '../Api/auth.api'
import { omitEmptyStringKeys } from '../utils/omitEmptyStrings'

const RegistrationInfo = ({
  mobileNumber,
  referralCode,
}: {
  mobileNumber: string
  referralCode: string | null
}) => {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [upazillas, setUpazillas] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const validationSchema = Yup.object({
    name: Yup.string()
      .min(3, 'নাম অবশ্যই ৩ অক্ষরের বেশি হতে হবে')
      .max(48, 'নামটি আরও ছোট হতে হবে')
      .required('নাম আবশ্যক'),
    email: Yup.string().optional().email('সঠিক ইমেইল দিন'),
    shopName: Yup.string()
      .min(3, 'দোকানের নাম অবশ্যই ৩ অক্ষরের বেশি হতে হবে')
      .max(32, 'দোকানের নাম আরও ছোট হতে হবে')
      .required('দোকানের নাম আবশ্যক'),
    zilla: Yup.string().required('জেলা নির্বাচন করুন').max(48, 'জেলার নাম আরও ছোট হতে হবে'),
    upazilla: Yup.string().required('উপজেলা নির্বাচন করুন').max(48, 'উপজেলার নাম আরও ছোট হতে হবে'),
    address: Yup.string()
      .min(10, 'ঠিকানা আরও বিস্তারিত হতে হবে')
      .max(255, 'ঠিকানা আরও ছোট হতে হবে')
      .required('ঠিকানা আবশ্যক'),
    nomineePhone: Yup.string()
      .optional()
      .matches(/^01\d{9}$/, 'সঠিক মোবাইল নম্বর দিন (01XXXXXXXXX)'),
    facebookProfileLink: Yup.string().optional().url('সঠিক URL লিংক প্রদান করুন'),
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
      email: '',
      shopName: '',
      zilla: '',
      upazilla: '',
      address: '',
      nomineePhone: '',
      facebookProfileLink: '',
      password: '',
      confirmPassword: '',
      referralCode: referralCode || '',
    },
    validationSchema,
    onSubmit: async values => {
      setError(null)
      setIsLoading(true)
      try {
        const { confirmPassword, ...payload } = values
        const registrationData = omitEmptyStringKeys(payload) as RegisterInfo
        const { success, message } = await register(registrationData)

        if (success) {
          navigate('/login')
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

  const handleZillaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedZilla = e.target.value as keyof typeof districts
    formik.setFieldValue('zilla', selectedZilla)
    formik.setFieldValue('upazilla', '')
    setUpazillas(selectedZilla ? districts[selectedZilla] || [] : [])
  }

  return (
    <div className='flex items-center justify-center min-h-screen p-4 bg-gray-50'>
      <div className='bg-white rounded-xl shadow-lg w-full max-w-2xl overflow-hidden border border-gray-200'>
        <div className='bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-center text-white'>
          <h1 className='text-2xl font-bold'>রেজিস্ট্রেশন ফর্ম</h1>
          <p className='text-blue-100 mt-2 text-sm'>
            রেজিস্ট্রেশন সম্পন্ন করতে সকল তথ্য সঠিকভাবে পূরণ করুন
          </p>
        </div>

        <div className='p-6 md:p-8'>
          <form onSubmit={formik.handleSubmit} className='grid md:grid-cols-2 gap-5'>
            {/* Phone Number (Readonly) */}
            <div className='md:col-span-2'>
              <label className='block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2'>
                <FiPhone className='text-blue-600' />
                মোবাইল নম্বর *
              </label>
              <input
                type='text'
                value={formik.values.phoneNo}
                readOnly
                className='w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              />
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

            {/* Email */}
            <div>
              <label className=' text-sm font-medium text-gray-700 mb-1 flex items-center gap-2'>
                <FiMail className='text-blue-600' />
                ইমেইল (ঐচ্ছিক)
              </label>
              <input
                type='email'
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  formik.touched.email && formik.errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                {...formik.getFieldProps('email')}
                placeholder='ইমেইল ঠিকানা'
              />
              {formik.touched.email && formik.errors.email && (
                <p className='text-red-500 text-xs mt-1'>{formik.errors.email}</p>
              )}
            </div>

            {/* Shop Name */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2'>
                <FiShoppingBag className='text-blue-600' />
                দোকানের নাম *
              </label>
              <input
                type='text'
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  formik.touched.shopName && formik.errors.shopName
                    ? 'border-red-500'
                    : 'border-gray-300'
                }`}
                {...formik.getFieldProps('shopName')}
                placeholder='দোকানের নাম লিখুন'
              />
              {formik.touched.shopName && formik.errors.shopName && (
                <p className='text-red-500 text-xs mt-1'>{formik.errors.shopName}</p>
              )}
            </div>

            {/* Facebook Profile */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2'>
                <FiFacebook className='text-blue-600' />
                ফেসবুক প্রোফাইল (ঐচ্ছিক)
              </label>
              <input
                type='url'
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  formik.touched.facebookProfileLink && formik.errors.facebookProfileLink
                    ? 'border-red-500'
                    : 'border-gray-300'
                }`}
                {...formik.getFieldProps('facebookProfileLink')}
                placeholder='https://facebook.com/username'
              />
              {formik.touched.facebookProfileLink && formik.errors.facebookProfileLink && (
                <p className='text-red-500 text-xs mt-1'>{formik.errors.facebookProfileLink}</p>
              )}
            </div>

            {/* Referral Code */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                রেফারাল কোড (ঐচ্ছিক)
              </label>
              <input
                type='text'
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  formik.values.referralCode ? 'bg-gray-50' : ''
                } ${
                  formik.touched.referralCode && formik.errors.referralCode
                    ? 'border-red-500'
                    : 'border-gray-300'
                }`}
                {...formik.getFieldProps('referralCode')}
                readOnly={!!referralCode}
                placeholder='রেফারাল কোড থাকলে লিখুন'
              />
              {formik.touched.referralCode && formik.errors.referralCode && (
                <p className='text-red-500 text-xs mt-1'>{formik.errors.referralCode}</p>
              )}
            </div>

            {/* District */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2'>
                <FiMapPin className='text-blue-600' />
                জেলা *
              </label>
              <select
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  formik.touched.zilla && formik.errors.zilla ? 'border-red-500' : 'border-gray-300'
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

            {/* Nominee Phone */}
            <div className='md:col-span-2'>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                নমিনির মোবাইল নম্বর (ঐচ্ছিক)
              </label>
              <input
                type='text'
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  formik.touched.nomineePhone && formik.errors.nomineePhone
                    ? 'border-red-500'
                    : 'border-gray-300'
                }`}
                {...formik.getFieldProps('nomineePhone')}
                placeholder='01XXXXXXXXX'
              />
              {formik.touched.nomineePhone && formik.errors.nomineePhone && (
                <p className='text-red-500 text-xs mt-1'>{formik.errors.nomineePhone}</p>
              )}
            </div>

            {/* Submit Button */}
            <div className='md:col-span-2 mt-2'>
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
          {error && (
            <div className='mb-4 my-2 p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100 md:text-center'>
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default RegistrationInfo
