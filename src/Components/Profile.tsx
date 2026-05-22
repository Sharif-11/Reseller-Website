import { useFormik } from 'formik'
import { motion } from 'framer-motion'
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

        if (selectedImage) {
          const uploadResponse = await fileDownloader.uploadFile(selectedImage, {
            additionalData: {
              folder: 'profile-images',
              userId: user?.userId,
            },
          })

          if (uploadResponse.success && uploadResponse.data) {
            profileImageUrl = uploadResponse.data.publicUrl
            formik.setFieldValue('profileImage', profileImageUrl)
          } else {
            setError(uploadResponse.error || 'ছবি আপলোড করতে ব্যর্থ হয়েছে')
            setIsUploading(false)
            return
          }
        }

        const payload: ProfileInfo = {
          ...values,
          profileImage: profileImageUrl,
        }

        const result = await updateProfile(omitEmptyStringKeys(payload) as ProfileInfo)

        if (result.success) {
          setUser(result.data)
          setSelectedImage(null)
          if (fileInputRef.current) {
            fileInputRef.current.value = ''
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

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      setError('শুধুমাত্র JPG, PNG, বা WebP ইমেজ আপলোড করতে পারবেন')
      return
    }

    const maxSize = 250 * 1024
    if (file.size > maxSize) {
      setError('ইমেজের সাইজ ২৫০KB এর কম হতে হবে')
      return
    }

    setError(null)
    setSelectedImage(file)

    const reader = new FileReader()
    reader.onload = e => {
      setImagePreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveImage = () => {
    setSelectedImage(null)
    setImagePreview(null)
    formik.setFieldValue('profileImage', '')
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
    <div className='min-h-screen bg-[#f7f6f3] py-6 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-3xl mx-auto'>
        {/* Header with Animation */}
        <motion.div initial='hidden' animate='visible' variants={staggerContainer} className='mb-6'>
          <motion.div variants={fadeUp}>
            <h1 className='text-2xl md:text-3xl font-bold text-[#1a1a2e]'>প্রোফাইল</h1>
            <p className='text-gray-500 text-sm mt-1'>আপনার ব্যক্তিগত তথ্য আপডেট করুন</p>
          </motion.div>
        </motion.div>

        {/* Main Card */}
        <motion.div
          initial='hidden'
          animate='visible'
          variants={staggerContainer}
          className='bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden'
        >
          {/* Gradient Header */}
          <div className='bg-gradient-to-r from-[#1a1a2e] to-[#16213e] px-6 py-5'>
            <div className='flex items-center justify-between'>
              <div>
                <h2 className='text-white font-semibold text-lg'>প্রোফাইল তথ্য</h2>
                <p className='text-white/40 text-xs mt-0.5'>আপনার তথ্য সঠিক রাখুন</p>
              </div>
              <div className='relative'>
                <div className='relative h-14 w-14 rounded-2xl bg-rose-500/20 flex items-center justify-center border-2 border-white/20'>
                  {getDisplayImage() ? (
                    <img
                      src={getDisplayImage()}
                      alt='Profile'
                      className='h-full w-full rounded-2xl object-cover'
                    />
                  ) : (
                    <FiUser className='text-white/60 text-xl' />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Form Content */}
          <div className='p-6'>
            {/* Alerts */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className='mb-5 p-4 bg-red-50 rounded-xl border border-red-100'
              >
                <p className='text-red-600 text-sm'>{error}</p>
              </motion.div>
            )}
            {successMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className='mb-5 p-4 bg-emerald-50 rounded-xl border border-emerald-100'
              >
                <p className='text-emerald-600 text-sm'>{successMessage}</p>
              </motion.div>
            )}

            {/* Profile Image Upload Section */}
            <div className='mb-6 p-5 bg-gray-50/50 rounded-xl border border-gray-100'>
              <div className='flex flex-col sm:flex-row items-center gap-5'>
                <div className='relative'>
                  <div className='h-24 w-24 rounded-2xl bg-gradient-to-br from-rose-100 to-rose-50 flex items-center justify-center border-2 border-rose-200 shadow-sm'>
                    {getDisplayImage() ? (
                      <img
                        src={getDisplayImage()}
                        alt='Profile'
                        className='h-full w-full rounded-2xl object-cover'
                      />
                    ) : (
                      <FiUser className='text-rose-400 text-3xl' />
                    )}
                  </div>
                  {(getDisplayImage() || selectedImage) && (
                    <button
                      type='button'
                      onClick={handleRemoveImage}
                      className='absolute -top-2 -right-2 bg-rose-500 text-white rounded-full p-1.5 hover:bg-rose-600 transition-colors shadow-sm'
                    >
                      <FiX className='text-xs' />
                    </button>
                  )}
                </div>

                <div className='flex-1 text-center sm:text-left'>
                  <h3 className='font-medium text-gray-800 mb-2'>প্রোফাইল ছবি</h3>
                  <div className='flex flex-col sm:flex-row gap-2'>
                    <label className='cursor-pointer'>
                      <input
                        ref={fileInputRef}
                        type='file'
                        accept='image/jpeg,image/jpg,image/png,image/webp'
                        onChange={handleImageSelect}
                        className='hidden'
                        disabled={isUploading}
                      />
                      <div className='inline-flex items-center gap-2 px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white text-sm font-medium rounded-xl transition-colors shadow-sm'>
                        <FiCamera className='h-3.5 w-3.5' />
                        {selectedImage ? 'ছবি পরিবর্তন করুন' : 'ছবি নির্বাচন করুন'}
                      </div>
                    </label>

                    {(getDisplayImage() || selectedImage) && (
                      <button
                        type='button'
                        onClick={handleRemoveImage}
                        className='inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-xl transition-colors'
                      >
                        <FiX className='h-3.5 w-3.5' />
                        ছবি সরান
                      </button>
                    )}
                  </div>
                  <p className='text-xs text-gray-400 mt-2'>JPG, PNG, বা WebP, সর্বোচ্চ ২৫০KB</p>
                </div>
              </div>
            </div>

            <form onSubmit={formik.handleSubmit} className='space-y-5'>
              {/* Phone (Readonly) */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2'>
                  <FiPhone className='text-rose-400 h-4 w-4' />
                  ফোন নম্বর
                </label>
                <input
                  type='text'
                  readOnly
                  className='w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-sm text-gray-600 focus:outline-none cursor-not-allowed'
                  value={user?.phoneNo}
                />
              </div>

              {/* Name */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2'>
                  <FiUser className='text-rose-400 h-4 w-4' />
                  আপনার নাম
                </label>
                <input
                  type='text'
                  className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400 transition-all ${
                    formik.touched.name && formik.errors.name
                      ? 'border-rose-500 bg-rose-50/30'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  {...formik.getFieldProps('name')}
                  placeholder='পুরো নাম লিখুন'
                />
                {formik.touched.name && formik.errors.name && (
                  <p className='text-rose-500 text-xs mt-1'>{formik.errors.name}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2'>
                  <FiMail className='text-rose-400 h-4 w-4' />
                  ইমেইল (ঐচ্ছিক)
                </label>
                <input
                  type='email'
                  className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400 transition-all ${
                    formik.touched.email && formik.errors.email
                      ? 'border-rose-500 bg-rose-50/30'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  {...formik.getFieldProps('email')}
                  placeholder='ইমেইল ঠিকানা'
                />
                {formik.touched.email && formik.errors.email && (
                  <p className='text-rose-500 text-xs mt-1'>{formik.errors.email}</p>
                )}
              </div>

              {/* Shop Name */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2'>
                  <FiShoppingBag className='text-rose-400 h-4 w-4' />
                  দোকানের নাম
                </label>
                <input
                  type='text'
                  className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400 transition-all ${
                    formik.touched.shopName && formik.errors.shopName
                      ? 'border-rose-500 bg-rose-50/30'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  {...formik.getFieldProps('shopName')}
                  placeholder='দোকানের নাম লিখুন'
                />
                {formik.touched.shopName && formik.errors.shopName && (
                  <p className='text-rose-500 text-xs mt-1'>{formik.errors.shopName}</p>
                )}
              </div>

              {/* Facebook Profile Link */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2'>
                  <FiFacebook className='text-rose-400 h-4 w-4' />
                  ফেসবুক প্রোফাইল লিংক (ঐচ্ছিক)
                </label>
                <input
                  type='url'
                  className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400 transition-all ${
                    formik.touched.facebookProfileLink && formik.errors.facebookProfileLink
                      ? 'border-rose-500 bg-rose-50/30'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  {...formik.getFieldProps('facebookProfileLink')}
                  placeholder='https://facebook.com/username'
                />
                {formik.touched.facebookProfileLink && formik.errors.facebookProfileLink && (
                  <p className='text-rose-500 text-xs mt-1'>{formik.errors.facebookProfileLink}</p>
                )}
              </div>

              {/* District & Upazilla Grid */}
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2'>
                    <FiMapPin className='text-rose-400 h-4 w-4' />
                    জেলা
                  </label>
                  <select
                    className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400 transition-all ${
                      formik.touched.zilla && formik.errors.zilla
                        ? 'border-rose-500 bg-rose-50/30'
                        : 'border-gray-200 hover:border-gray-300'
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
                    <p className='text-rose-500 text-xs mt-1'>{formik.errors.zilla}</p>
                  )}
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1.5'>উপজেলা</label>
                  <select
                    className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400 transition-all ${
                      formik.touched.upazilla && formik.errors.upazilla
                        ? 'border-rose-500 bg-rose-50/30'
                        : 'border-gray-200 hover:border-gray-300'
                    } ${!formik.values.zilla ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}`}
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
                    <p className='text-rose-500 text-xs mt-1'>{formik.errors.upazilla}</p>
                  )}
                </div>
              </div>

              {/* Nominee Phone */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2'>
                  <FiPhone className='text-rose-400 h-4 w-4' />
                  নমিনির ফোন নম্বর (ঐচ্ছিক)
                </label>
                <input
                  type='text'
                  placeholder='01XXXXXXXXX'
                  className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400 transition-all ${
                    formik.touched.nomineePhone && formik.errors.nomineePhone
                      ? 'border-rose-500 bg-rose-50/30'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  {...formik.getFieldProps('nomineePhone')}
                />
                {formik.touched.nomineePhone && formik.errors.nomineePhone && (
                  <p className='text-rose-500 text-xs mt-1'>{formik.errors.nomineePhone}</p>
                )}
              </div>

              {/* Address */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2'>
                  <FiMapPin className='text-rose-400 h-4 w-4' />
                  ঠিকানা
                </label>
                <textarea
                  rows={3}
                  className={`w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400 transition-all resize-none ${
                    formik.touched.address && formik.errors.address
                      ? 'border-rose-500 bg-rose-50/30'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  {...formik.getFieldProps('address')}
                  placeholder='গ্রাম/রোড নং, ইউনিয়ন/ওয়ার্ড, পোস্ট অফিস'
                />
                {formik.touched.address && formik.errors.address && (
                  <p className='text-rose-500 text-xs mt-1'>{formik.errors.address}</p>
                )}
              </div>

              {/* Submit Button */}
              <div className='pt-2'>
                <button
                  type='submit'
                  disabled={formik.isSubmitting || isUploading || !hasChanges()}
                  className='w-full bg-rose-500 hover:bg-rose-600 text-white font-medium py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-rose-500/20'
                >
                  <FiSave className='h-4 w-4' />
                  {isUploading
                    ? 'আপলোড হচ্ছে...'
                    : formik.isSubmitting
                      ? 'আপডেট হচ্ছে...'
                      : 'প্রোফাইল আপডেট করুন'}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Profile
