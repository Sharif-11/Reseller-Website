import { motion } from 'framer-motion'
import { useState } from 'react'
import { FaArrowRight, FaCheckCircle, FaEye, FaEyeSlash, FaLock, FaShieldAlt } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { changePassword } from '../Api/auth.api'

// Animation variants
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
}

const ChangePasswordPage = () => {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const [touched, setTouched] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  })

  // Password strength calculation
  const getPasswordStrength = (password: string) => {
    let strength = 0
    if (password.length >= 6) strength++
    if (password.length >= 8) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/[0-9]/.test(password)) strength++
    if (/[^A-Za-z0-9]/.test(password)) strength++
    return Math.min(strength, 4)
  }

  const passwordStrength = getPasswordStrength(formData.newPassword)
  const strengthLabels = ['দুর্বল', 'মধ্যম', 'শক্তিশালী', 'অতি শক্তিশালী']
  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500']

  // Validation schema
  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!formData.currentPassword) {
      errors.currentPassword = 'পুরোনো পাসওয়ার্ড প্রয়োজন'
    } else if (formData.currentPassword.length < 6) {
      errors.currentPassword = 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে'
    }

    if (!formData.newPassword) {
      errors.newPassword = 'নতুন পাসওয়ার্ড প্রয়োজন'
    } else if (formData.newPassword.length < 6) {
      errors.newPassword = 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে'
    } else if (formData.newPassword === formData.currentPassword) {
      errors.newPassword = 'নতুন পাসওয়ার্ড পুরোনো পাসওয়ার্ডের মতো হতে পারবে না'
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'পাসওয়ার্ড নিশ্চিত করুন'
    } else if (formData.confirmPassword !== formData.newPassword) {
      errors.confirmPassword = 'পাসওয়ার্ড মিলছে না'
    }

    return errors
  }

  const errors = validateForm()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Mark all fields as touched
    setTouched({
      currentPassword: true,
      newPassword: true,
      confirmPassword: true,
    })

    if (Object.keys(errors).length > 0) return

    setError(null)
    setSuccess(null)
    setIsLoading(true)

    try {
      const { success, message } = await changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      })

      if (success) {
        setSuccess('পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে')
        toast.success('পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে')
        setFormData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        })
        setTouched({
          currentPassword: false,
          newPassword: false,
          confirmPassword: false,
        })
        // Redirect after 2 seconds
        setTimeout(() => navigate('/profile'), 2000)
      } else {
        setError(message || 'পাসওয়ার্ড পরিবর্তন করতে সমস্যা হয়েছে')
        toast.error(message || 'পাসওয়ার্ড পরিবর্তন করতে সমস্যা হয়েছে')
      }
    } catch (err) {
      setError('একটি ত্রুটি ঘটেছে, পরে আবার চেষ্টা করুন')
      toast.error('একটি ত্রুটি ঘটেছে, পরে আবার চেষ্টা করুন')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setTouched(prev => ({ ...prev, [field]: true }))
    setError(null)
    setSuccess(null)
  }

  const getFieldError = (field: string) => {
    if (touched[field as keyof typeof touched] && errors[field]) {
      return errors[field]
    }
    return null
  }

  return (
    <div className='min-h-screen bg-[#f7f6f3] py-8 px-4 sm:px-6 lg:px-8 flex items-center justify-center'>
      <div className='max-w-md w-full mx-auto'>
        {/* Header with Animation */}
        <motion.div
          initial='hidden'
          animate='visible'
          variants={staggerContainer}
          className='text-center mb-6'
        >
          <motion.div
            variants={fadeUp}
            className='inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-rose-500 to-rose-600 shadow-lg mb-4'
          >
            <FaLock className='h-7 w-7 text-white' />
          </motion.div>
          <motion.h1 variants={fadeUp} className='text-2xl md:text-3xl font-bold text-[#1a1a2e]'>
            পাসওয়ার্ড পরিবর্তন
          </motion.h1>
          <motion.p variants={fadeUp} className='text-gray-500 text-sm mt-1'>
            আপনার অ্যাকাউন্টের নিরাপত্তার জন্য একটি শক্তিশালী পাসওয়ার্ড ব্যবহার করুন
          </motion.p>
        </motion.div>

        {/* Main Card */}
        <motion.div
          initial='hidden'
          animate='visible'
          variants={staggerContainer}
          className='bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden'
        >
          {/* Card Header */}
          <div className='bg-gradient-to-r from-[#1a1a2e] to-[#16213e] px-6 py-4'>
            <div className='flex items-center gap-3'>
              <div className='h-9 w-9 rounded-xl bg-rose-500/20 flex items-center justify-center'>
                <FaShieldAlt className='h-4 w-4 text-rose-400' />
              </div>
              <div>
                <h2 className='text-white font-semibold'>নিরাপত্তা সেটিংস</h2>
                <p className='text-white/40 text-xs'>আপনার পাসওয়ার্ড আপডেট করুন</p>
              </div>
            </div>
          </div>

          {/* Form Content */}
          <div className='p-6'>
            {/* Success Alert */}
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className='mb-5 p-4 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center gap-3'
              >
                <FaCheckCircle className='text-emerald-500 h-5 w-5 flex-shrink-0' />
                <div>
                  <p className='text-emerald-600 text-sm font-medium'>সফল!</p>
                  <p className='text-emerald-600 text-sm'>{success}</p>
                </div>
              </motion.div>
            )}

            {/* Error Alert */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className='mb-5 p-4 bg-red-50 rounded-xl border border-red-100'
              >
                <p className='text-red-600 text-sm'>{error}</p>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className='space-y-5'>
              {/* Current Password */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1.5'>
                  পুরোনো পাসওয়ার্ড <span className='text-rose-500'>*</span>
                </label>
                <div className='relative'>
                  <div className='absolute left-3 top-1/2 -translate-y-1/2'>
                    <FaLock className='h-4 w-4 text-gray-400' />
                  </div>
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={formData.currentPassword}
                    onChange={e => handleChange('currentPassword', e.target.value)}
                    placeholder='আপনার বর্তমান পাসওয়ার্ড'
                    className={`w-full pl-10 pr-10 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400 transition-all ${
                      getFieldError('currentPassword')
                        ? 'border-rose-500 bg-rose-50/30'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  />
                  <button
                    type='button'
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600'
                  >
                    {showCurrentPassword ? (
                      <FaEyeSlash className='h-4 w-4' />
                    ) : (
                      <FaEye className='h-4 w-4' />
                    )}
                  </button>
                </div>
                {getFieldError('currentPassword') && (
                  <p className='mt-1 text-rose-500 text-xs'>{getFieldError('currentPassword')}</p>
                )}
              </div>

              {/* New Password */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1.5'>
                  নতুন পাসওয়ার্ড <span className='text-rose-500'>*</span>
                </label>
                <div className='relative'>
                  <div className='absolute left-3 top-1/2 -translate-y-1/2'>
                    <FaLock className='h-4 w-4 text-gray-400' />
                  </div>
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={formData.newPassword}
                    onChange={e => handleChange('newPassword', e.target.value)}
                    placeholder='কমপক্ষে ৬ অক্ষরের পাসওয়ার্ড'
                    className={`w-full pl-10 pr-10 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400 transition-all ${
                      getFieldError('newPassword')
                        ? 'border-rose-500 bg-rose-50/30'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  />
                  <button
                    type='button'
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600'
                  >
                    {showNewPassword ? (
                      <FaEyeSlash className='h-4 w-4' />
                    ) : (
                      <FaEye className='h-4 w-4' />
                    )}
                  </button>
                </div>
                {getFieldError('newPassword') && (
                  <p className='mt-1 text-rose-500 text-xs'>{getFieldError('newPassword')}</p>
                )}

                {/* Password Strength Indicator */}
                {formData.newPassword.length > 0 && (
                  <div className='mt-2'>
                    <div className='flex gap-1 h-1.5'>
                      {[0, 1, 2, 3].map(level => (
                        <div
                          key={level}
                          className={`flex-1 rounded-full transition-all ${
                            level < passwordStrength
                              ? strengthColors[passwordStrength - 1]
                              : 'bg-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                    <p
                      className={`text-xs mt-1 ${passwordStrength > 0 ? 'text-green-600' : 'text-gray-400'}`}
                    >
                      {passwordStrength > 0
                        ? strengthLabels[passwordStrength - 1]
                        : 'পাসওয়ার্ড শক্তি'}
                    </p>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1.5'>
                  পাসওয়ার্ড নিশ্চিত করুন <span className='text-rose-500'>*</span>
                </label>
                <div className='relative'>
                  <div className='absolute left-3 top-1/2 -translate-y-1/2'>
                    <FaLock className='h-4 w-4 text-gray-400' />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={e => handleChange('confirmPassword', e.target.value)}
                    placeholder='নতুন পাসওয়ার্ডটি পুনরায় লিখুন'
                    className={`w-full pl-10 pr-10 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400 transition-all ${
                      getFieldError('confirmPassword')
                        ? 'border-rose-500 bg-rose-50/30'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  />
                  <button
                    type='button'
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600'
                  >
                    {showConfirmPassword ? (
                      <FaEyeSlash className='h-4 w-4' />
                    ) : (
                      <FaEye className='h-4 w-4' />
                    )}
                  </button>
                </div>
                {getFieldError('confirmPassword') && (
                  <p className='mt-1 text-rose-500 text-xs'>{getFieldError('confirmPassword')}</p>
                )}
              </div>

              {/* Password Requirements */}
              <div className='bg-gray-50/80 rounded-xl p-4 border border-gray-100'>
                <p className='text-xs font-medium text-gray-700 mb-2'>পাসওয়ার্ড নির্দেশিকা:</p>
                <ul className='text-xs text-gray-500 space-y-1'>
                  <li className='flex items-center gap-2'>
                    <div
                      className={`h-1.5 w-1.5 rounded-full ${formData.newPassword.length >= 6 ? 'bg-green-500' : 'bg-gray-300'}`}
                    />
                    কমপক্ষে ৬ অক্ষর
                  </li>
                  <li className='flex items-center gap-2'>
                    <div
                      className={`h-1.5 w-1.5 rounded-full ${/[A-Z]/.test(formData.newPassword) ? 'bg-green-500' : 'bg-gray-300'}`}
                    />
                    বড় হাতের অক্ষর (A-Z)
                  </li>
                  <li className='flex items-center gap-2'>
                    <div
                      className={`h-1.5 w-1.5 rounded-full ${/[0-9]/.test(formData.newPassword) ? 'bg-green-500' : 'bg-gray-300'}`}
                    />
                    সংখ্যা (0-9)
                  </li>
                  <li className='flex items-center gap-2'>
                    <div
                      className={`h-1.5 w-1.5 rounded-full ${/[^A-Za-z0-9]/.test(formData.newPassword) ? 'bg-green-500' : 'bg-gray-300'}`}
                    />
                    বিশেষ অক্ষর (!@#$%^&*)
                  </li>
                </ul>
              </div>

              {/* Submit Button */}
              <button
                type='submit'
                disabled={isLoading}
                className='w-full bg-rose-500 hover:bg-rose-600 text-white font-medium py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-rose-500/20'
              >
                {isLoading ? (
                  <>
                    <div className='animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent' />
                    প্রক্রিয়াকরণ হচ্ছে...
                  </>
                ) : (
                  <>
                    পাসওয়ার্ড পরিবর্তন করুন
                    <FaArrowRight className='h-3.5 w-3.5' />
                  </>
                )}
              </button>
            </form>
          </div>
        </motion.div>

        {/* Security Note */}
        <motion.div
          variants={fadeUp}
          initial='hidden'
          animate='visible'
          className='mt-6 text-center'
        >
          <p className='text-xs text-gray-400'>
            <FaShieldAlt className='inline h-3 w-3 mr-1' />
            আপনার পাসওয়ার্ড এনক্রিপ্ট করে সংরক্ষণ করা হয়
          </p>
        </motion.div>
      </div>
    </div>
  )
}

export default ChangePasswordPage
