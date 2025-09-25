import { useFormik } from 'formik'
import { useEffect, useRef, useState } from 'react'
import {
  FiCamera,
  FiFacebook,
  FiMail,
  FiMapPin,
  FiPhone,
  FiSave,
  FiShoppingBag,
  FiUser,
  FiX,
} from 'react-icons/fi'
import * as Yup from 'yup'
import districts from '../../public/zillasInfo.json'
import { updateProfile } from '../Api/auth.api'
import { fileDownloader } from '../Api/ftp.api'
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
  profileImage?: string | null
}

const Profile = () => {
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [upazillas, setUpazillas] = useState<string[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
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
      profileImage: user?.profileImage || '',
    },
    validationSchema,
    onSubmit: async values => {
      setError(null)
      setSuccessMessage(null)
      setIsUploading(true)

      try {
        let profileImageUrl = values.profileImage

        // Upload new image only if a file is selected
        if (selectedImage) {
          const uploadResponse = await fileDownloader.uploadFile(selectedImage, {
            additionalData: {
              folder: 'profile-images',
              userId: user?.userId,
            },
          })

          if (uploadResponse.success && uploadResponse.data) {
            profileImageUrl = uploadResponse.data.publicUrl
            // we need to set this to formik as well so that if user removes the image
            // before submitting, the previous image url is not sent again
            formik.setFieldValue('profileImage', profileImageUrl)
          } else {
            setError(uploadResponse.error || 'ছবি আপলোড করতে ব্যর্থ হয়েছে')
            setIsUploading(false)
            return
          }
        }

        // Prepare payload with updated image URL
        const payload: ProfileInfo = {
          ...values,
          profileImage: profileImageUrl,
        }
        console.log(payload)

        const result = await updateProfile(omitEmptyStringKeys(payload) as ProfileInfo)

        if (result.success) {
          setUser(result.data)
          setSelectedImage(null) // Clear selected image after successful upload
          if (fileInputRef.current) {
            fileInputRef.current.value = '' // Reset file input
          }
          setSuccessMessage('প্রোফাইল সফলভাবে আপডেট হয়েছে')
          setTimeout(() => setSuccessMessage(null), 3000)
        } else {
          setError(result.message || 'প্রোফাইল আপডেট করতে ব্যর্থ হয়েছে')
        }
      } catch (err) {
        setError('একটি ত্রুটি ঘটেছে, পরে আবার চেষ্টা করুন')
      } finally {
        setIsUploading(false)
      }
    },
  })

  const handleZillaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedZilla = e.target.value as keyof typeof districts
    formik.setFieldValue('zilla', selectedZilla)
    formik.setFieldValue('upazilla', '')
    setUpazillas(selectedZilla ? districts[selectedZilla] || [] : [])
  }

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      setError('শুধুমাত্র JPG, PNG, বা WebP ইমেজ আপলোড করতে পারবেন')
      return
    }

    // Validate file size (max 250KB)
    const maxSize = 250 * 1024
    if (file.size > maxSize) {
      setError('ইমেজের সাইজ ২৫০KB এর কম হতে হবে')
      return
    }

    setError(null)
    setSelectedImage(file)

    // Create preview
    const reader = new FileReader()
    reader.onload = e => {
      setImagePreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveImage = () => {
    setSelectedImage(null)
    setImagePreview(null)
    formik.setFieldValue('profileImage', '') // Clear profile image from form
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    setSuccessMessage('ছবি সরানো হয়েছে')
    setTimeout(() => setSuccessMessage(null), 3000)
  }

  const getDisplayImage = () => {
    if (imagePreview) return imagePreview
    if (formik.values.profileImage) return formik.values.profileImage
    return ''
  }

  const hasChanges = () => {
    const initialValues = {
      name: user?.name || '',
      email: user?.email || '',
      shopName: user?.shopName || '',
      zilla: user?.zilla || '',
      upazilla: user?.upazilla || '',
      address: user?.address || '',
      nomineePhone: user?.nomineePhone || '',
      facebookProfileLink: user?.facebookProfileLink || '',
      profileImage: user?.profileImage || '',
    }

    return (
      Object.keys(initialValues).some(key => {
        return (
          formik.values[key as keyof typeof formik.values] !==
          initialValues[key as keyof typeof initialValues]
        )
      }) || selectedImage !== null
    )
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
            <div className='relative'>
              <div className='relative h-16 w-16 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-2xl border-4 border-white shadow-lg'>
                {getDisplayImage() ? (
                  <img
                    src={getDisplayImage()}
                    alt='Profile'
                    className='h-full w-full rounded-full object-cover'
                  />
                ) : (
                  user?.name?.charAt(0).toUpperCase()
                )}
              </div>
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

          {/* Profile Image Upload Section */}
          <div className='mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200'>
            <div className='flex flex-col sm:flex-row items-center gap-4'>
              <div className='relative'>
                <div className='h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center border-4 border-white shadow-sm'>
                  {getDisplayImage() ? (
                    <img
                      src={getDisplayImage()}
                      alt='Profile'
                      className='h-full w-full rounded-full object-cover'
                    />
                  ) : (
                    <FiUser className='text-gray-400 text-2xl' />
                  )}
                </div>
                {(getDisplayImage() || selectedImage) && (
                  <button
                    type='button'
                    onClick={handleRemoveImage}
                    className='absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors'
                  >
                    <FiX className='text-xs' />
                  </button>
                )}
              </div>

              <div className='flex-1'>
                <h3 className='font-medium text-gray-700 mb-2'>প্রোফাইল ছবি</h3>
                <div className='flex flex-col sm:flex-row gap-2'>
                  <label className='flex-1 cursor-pointer'>
                    <input
                      ref={fileInputRef}
                      type='file'
                      accept='image/jpeg,image/jpg,image/png,image/webp'
                      onChange={handleImageSelect}
                      className='hidden'
                      disabled={isUploading}
                    />
                    <div className='w-full bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50'>
                      <FiCamera />
                      {selectedImage ? 'ছবি পরিবর্তন করুন' : 'ছবি নির্বাচন করুন'}
                    </div>
                  </label>

                  {(getDisplayImage() || selectedImage) && (
                    <button
                      type='button'
                      onClick={handleRemoveImage}
                      className='px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs sm:text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2'
                    >
                      <FiX />
                      ছবি সরান
                    </button>
                  )}
                </div>

                <p className='text-xs text-gray-500'>JPG, PNG, বা WebP ফরম্যাট, সর্বোচ্চ ২৫০KB</p>
              </div>
            </div>
          </div>

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
                disabled={formik.isSubmitting || isUploading || !hasChanges()}
                className='w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
              >
                <FiSave />
                {isUploading
                  ? 'আপলোড হচ্ছে...'
                  : formik.isSubmitting
                  ? 'আপডেট হচ্ছে...'
                  : 'প্রোফাইল আপডেট করুন'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Profile
