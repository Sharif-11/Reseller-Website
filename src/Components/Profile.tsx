import { useFormik } from 'formik'
import { useEffect, useState } from 'react'
import {
  FiFacebook,
  FiMail,
  FiMapPin,
  FiPhone,
  FiSave,
  FiShoppingBag,
  FiUser,
} from 'react-icons/fi'
import * as Yup from 'yup'
import districts from '../../public/zillasInfo.json'
import { updateProfile } from '../Api/auth.api'
import { useAuth } from '../Hooks/useAuth'
import { omitEmptyStringKeys } from '../utils/omitEmptyStrings'

export interface ProfileInfo {
  name: string
  email: string
  shopName: string
  zilla: string
  upazilla: string
  address: string
  nomineePhone: string
  facebookProfileLink: string
}

const Profile = () => {
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [upazillas, setUpazillas] = useState<string[]>([])
  const { user, setUser } = useAuth()

  useEffect(() => {
    if (user?.zilla) {
      setUpazillas(districts[user.zilla as keyof typeof districts] || [])
    }
  }, [user?.zilla])

  const validationSchema = Yup.object({
    name: Yup.string().min(3, 'নাম অবশ্যই ৩ অক্ষরের বেশি হতে হবে').max(48, 'নামটি আরও ছোট হতে হবে'),
    email: Yup.string().optional().email('সঠিক ইমেইল দিন'),
    shopName: Yup.string().max(32, 'দোকানের নাম আরও ছোট হতে হবে'),
    zilla: Yup.string().max(48, 'জেলার নাম আরও ছোট হতে হবে'),
    upazilla: Yup.string().max(48, 'উপজেলার নাম আরও ছোট হতে হবে'),
    address: Yup.string().max(255, 'ঠিকানা আরও ছোট হতে হবে'),
    nomineePhone: Yup.string()
      .optional()
      .matches(/^01\d{9}$/, 'সঠিক মোবাইল নম্বর দিন (01XXXXXXXXX)'),
    facebookProfileLink: Yup.string().optional().url('সঠিক URL লিংক প্রদান করুন'),
  })

  const formik = useFormik({
    initialValues: {
      name: user?.name || '',
      email: user?.email || '',
      shopName: user?.shopName || '',
      zilla: user?.zilla || '',
      upazilla: user?.upazilla || '',
      address: user?.address || '',
      nomineePhone: user?.nomineePhone || '',
      facebookProfileLink: user?.facebookProfileLink || '',
    },
    validationSchema,
    onSubmit: async values => {
      setError(null)
      setSuccessMessage(null)
      try {
        const result = await updateProfile(omitEmptyStringKeys(values) as ProfileInfo)
        if (result.success) {
          setUser(result.data)
          setSuccessMessage('প্রোফাইল সফলভাবে আপডেট হয়েছে')
          setTimeout(() => setSuccessMessage(null), 3000)
        } else {
          setError(result.message || 'প্রোফাইল আপডেট করতে ব্যর্থ হয়েছে')
        }
      } catch (err) {
        setError('একটি ত্রুটি ঘটেছে, পরে আবার চেষ্টা করুন')
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
    <div className='min-h-screen p-2 sm:p-4 bg-gray-50'>
      <div className='max-w-2xl mx-auto bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200'>
        {/* Header */}
        <div className='bg-gradient-to-r from-blue-600 to-blue-700 p-4 sm:p-6 text-white'>
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-xl sm:text-2xl font-bold'>প্রোফাইল আপডেট</h1>
              <p className='text-blue-100 text-xs sm:text-sm mt-1'>
                আপনার ব্যক্তিগত তথ্য আপডেট করুন
              </p>
            </div>
            <div className='bg-blue-500 rounded-full h-10 w-10 flex items-center justify-center text-white font-bold'>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>

        {/* Form */}
        <div className='p-4 sm:p-6'>
          {error && (
            <div className='mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-xs sm:text-sm border border-red-100'>
              {error}
            </div>
          )}
          {successMessage && (
            <div className='mb-4 p-3 bg-green-50 text-green-600 rounded-lg text-xs sm:text-sm border border-green-100'>
              {successMessage}
            </div>
          )}

          <form onSubmit={formik.handleSubmit} className='space-y-3 sm:space-y-4'>
            {/* Phone (Readonly) */}
            <div>
              <label className='block text-xs sm:text-sm font-medium text-gray-700 mb-1 flex items-center gap-2'>
                <FiPhone className='text-blue-600' />
                ফোন নম্বর
              </label>
              <input
                type='text'
                readOnly
                className='w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg bg-gray-50 text-xs sm:text-sm focus:outline-none'
                value={user?.phoneNo}
              />
            </div>

            {/* Name */}
            <div>
              <label className='block text-xs sm:text-sm font-medium text-gray-700 mb-1 flex items-center gap-2'>
                <FiUser className='text-blue-600' />
                আপনার নাম
              </label>
              <input
                type='text'
                className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
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
              <label className='block text-xs sm:text-sm font-medium text-gray-700 mb-1 flex items-center gap-2'>
                <FiMail className='text-blue-600' />
                ইমেইল (ঐচ্ছিক)
              </label>
              <input
                type='email'
                className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
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
              <label className='block text-xs sm:text-sm font-medium text-gray-700 mb-1 flex items-center gap-2'>
                <FiShoppingBag className='text-blue-600' />
                দোকানের নাম
              </label>
              <input
                type='text'
                className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
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

            {/* Facebook Profile Link */}
            <div>
              <label className='block text-xs sm:text-sm font-medium text-gray-700 mb-1 flex items-center gap-2'>
                <FiFacebook className='text-blue-600' />
                ফেসবুক প্রোফাইল লিংক (ঐচ্ছিক)
              </label>
              <input
                type='url'
                className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
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

            {/* District */}
            <div>
              <label className='block text-xs sm:text-sm font-medium text-gray-700 mb-1 flex items-center gap-2'>
                <FiMapPin className='text-blue-600' />
                জেলা
              </label>
              <select
                className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
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
              <label className='block text-xs sm:text-sm font-medium text-gray-700 mb-1'>
                উপজেলা
              </label>
              <select
                className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
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

            {/* Nominee Phone */}
            <div>
              <label className='block text-xs sm:text-sm font-medium text-gray-700 mb-1 flex items-center gap-2'>
                <FiPhone className='text-blue-600' />
                নমিনির ফোন নম্বর (ঐচ্ছিক)
              </label>
              <input
                type='text'
                placeholder='01XXXXXXXXX'
                className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  formik.touched.nomineePhone && formik.errors.nomineePhone
                    ? 'border-red-500'
                    : 'border-gray-300'
                }`}
                {...formik.getFieldProps('nomineePhone')}
              />
              {formik.touched.nomineePhone && formik.errors.nomineePhone && (
                <p className='text-red-500 text-xs mt-1'>{formik.errors.nomineePhone}</p>
              )}
            </div>

            {/* Address */}
            <div>
              <label className='block text-xs sm:text-sm font-medium text-gray-700 mb-1'>
                ঠিকানা
              </label>
              <textarea
                rows={3}
                className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
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

            {/* Submit Button */}
            <div className='pt-4'>
              <button
                type='submit'
                disabled={formik.isSubmitting}
                className='w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
              >
                <FiSave />
                {formik.isSubmitting ? 'আপডেট হচ্ছে...' : 'প্রোফাইল আপডেট করুন'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Profile
