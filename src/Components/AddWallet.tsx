import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { FaCreditCard, FaMobileAlt, FaPlus, FaTimes, FaWallet } from 'react-icons/fa'
import { toast } from 'react-toastify'
import { walletApi } from '../Api/wallet.api'
import { useAuth } from '../Hooks/useAuth'

interface Wallet {
  id: string
  walletName: 'bKash' | 'Nagad'
  walletPhoneNo: string
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

const AddWallet = () => {
  const [wallets, setWallets] = useState<Wallet[]>([])
  const { user } = useAuth()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [formData, setFormData] = useState({
    type: 'bKash' as 'bKash' | 'Nagad',
    number: '',
  })
  const [otp, setOtp] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(false)
  const [isOtpSent, setIsOtpSent] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [isAlreadyVerified, setIsAlreadyVerified] = useState(false)
  const [errors, setErrors] = useState({
    form: '',
    number: '',
    otp: '',
  })
  const [countdown, setCountdown] = useState(0)
  const [otpExpiry, setOtpExpiry] = useState<Date | null>(null)

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  useEffect(() => {
    if (!otpExpiry) return

    const checkExpiry = setInterval(() => {
      if (new Date() >= otpExpiry) {
        setIsOtpSent(false)
        setOtp('')
        setOtpExpiry(null)
        clearInterval(checkExpiry)
      }
    }, 1000)

    return () => clearInterval(checkExpiry)
  }, [otpExpiry])

  useEffect(() => {
    const fetchWallets = async () => {
      if (!user?.phoneNo) return

      try {
        setIsFetching(true)
        const response = await walletApi.getWalletsOfASeller(user.phoneNo)
        setWallets(response.data || [])
        localStorage.setItem(`wallets-${user.phoneNo}`, JSON.stringify(response.data || []))
      } catch (error) {
        setErrors(prev => ({ ...prev, form: 'ওয়ালেট লোড করতে ব্যর্থ হয়েছে' }))
        console.error('Error fetching wallets:', error)
      } finally {
        setIsFetching(false)
      }
    }

    fetchWallets()
  }, [user?.phoneNo])

  const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (name === 'number') {
      setErrors(prev => ({ ...prev, number: '' }))
    }
  }

  const validatePhoneNumber = (number: string) => {
    if (!number.trim()) {
      setErrors(prev => ({ ...prev, number: 'মোবাইল নাম্বার দিন' }))
      return false
    }
    if (!/^01[3-9]\d{8}$/.test(number)) {
      setErrors(prev => ({ ...prev, number: 'সঠিক মোবাইল নাম্বার দিন (01XXXXXXXXX)' }))
      return false
    }
    return true
  }

  const handleSendOtp = async () => {
    if (!validatePhoneNumber(formData.number)) return

    setIsLoading(true)
    setErrors(prev => ({ ...prev, form: '', otp: '' }))

    try {
      const { success, data, message } = await walletApi.sendOtpToWallet({
        walletPhoneNo: formData.number,
      })

      if (success && data?.alreadyVerified) {
        setIsAlreadyVerified(true)
        await addNewWallet()
      } else if (!success) {
        setErrors(prev => ({ ...prev, form: message || 'OTP পাঠাতে ব্যর্থ' }))
        return
      } else {
        setIsOtpSent(true)
        setCountdown(300)
        const expiryTime = new Date()
        expiryTime.setMinutes(expiryTime.getMinutes() + 5)
        setOtpExpiry(expiryTime)
      }
    } catch (error: any) {
      setErrors(prev => ({ ...prev, form: error.response?.data?.message || 'OTP পাঠাতে ব্যর্থ' }))
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyOtp = async () => {
    if (!otp.trim()) {
      setErrors(prev => ({ ...prev, otp: 'OTP দিন' }))
      return
    }

    setIsVerifying(true)
    setErrors(prev => ({ ...prev, form: '', otp: '' }))

    try {
      const { success, data, message } = await walletApi.verifyOtpForWallet({
        walletPhoneNo: formData.number,
        otp: otp,
      })

      if (success && (data?.isVerified || data?.alreadyVerified)) {
        await addNewWallet()
      } else {
        setErrors(prev => ({ ...prev, otp: message || 'OTP ভেরিফিকেশন ব্যর্থ' }))
      }
    } catch (error: any) {
      setErrors(prev => ({
        ...prev,
        otp: error.response?.data?.message || 'OTP ভেরিফিকেশন ব্যর্থ',
      }))
    } finally {
      setIsVerifying(false)
    }
  }

  const addNewWallet = async () => {
    try {
      const { success, message, data } = await walletApi.createWalletForSeller({
        walletName: formData.type,
        walletPhoneNo: formData.number,
      })

      if (success && data) {
        setWallets(prev => [...prev, data])
        if (user?.phoneNo) {
          localStorage.setItem(`wallets-${user.phoneNo}`, JSON.stringify([...wallets, data]))
        }
        toast.success(
          `${formData.type === 'bKash' ? 'bKash' : 'Nagad'} ওয়ালেট সফলভাবে যুক্ত হয়েছে`
        )
        resetForm()
      } else {
        setErrors(prev => ({ ...prev, form: message || 'ওয়ালেট যোগ করতে ব্যর্থ' }))
      }
    } catch (error: any) {
      setErrors(prev => ({
        ...prev,
        form: error.response?.data?.message || 'ওয়ালেট যোগ করতে ব্যর্থ',
      }))
    }
  }

  const resetForm = () => {
    setFormData({ type: 'bKash', number: '' })
    setOtp('')
    setErrors({ form: '', number: '', otp: '' })
    setIsFormOpen(false)
    setIsOtpSent(false)
    setIsAlreadyVerified(false)
    setOtpExpiry(null)
  }

  const handleResendOtp = async () => {
    if (countdown > 0) return

    setIsLoading(true)
    setErrors(prev => ({ ...prev, form: '' }))

    try {
      const { success, data, message } = await walletApi.sendOtpToWallet({
        walletPhoneNo: formData.number,
      })
      if (success && data.sendOTP) {
        setCountdown(300)
        const expiryTime = new Date()
        expiryTime.setMinutes(expiryTime.getMinutes() + 5)
        setOtpExpiry(expiryTime)
      } else {
        setErrors(prev => ({ ...prev, form: message || 'OTP পুনরায় পাঠাতে ব্যর্থ' }))
      }
    } catch (error: any) {
      setErrors(prev => ({
        ...prev,
        form: error.response?.data?.message || 'OTP পুনরায় পাঠাতে ব্যর্থ',
      }))
    } finally {
      setIsLoading(false)
    }
  }

  const WalletIcon = ({ type }: { type: 'bKash' | 'Nagad' }) => {
    if (type === 'bKash') {
      return (
        <div className='flex items-center justify-center w-8 h-8 rounded-lg bg-green-100 text-green-600'>
          <FaMobileAlt className='h-4 w-4' />
        </div>
      )
    }
    return (
      <div className='flex items-center justify-center w-8 h-8 rounded-lg bg-purple-100 text-purple-600'>
        <FaCreditCard className='h-4 w-4' />
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-[#f7f6f3] py-6 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-3xl mx-auto'>
        {/* Header */}
        <motion.div initial='hidden' animate='visible' variants={staggerContainer} className='mb-6'>
          <motion.div variants={fadeUp}>
            <h1 className='text-2xl md:text-3xl font-bold text-[#1a1a2e]'>আমার ওয়ালেট</h1>
            <p className='text-gray-500 text-sm mt-1'>পেমেন্ট গ্রহণের জন্য ওয়ালেট যুক্ত করুন</p>
          </motion.div>
        </motion.div>

        {/* Add Wallet Button */}
        {wallets?.length < 2 && !isFormOpen && (
          <motion.button
            variants={fadeUp}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsFormOpen(true)}
            className='w-full sm:w-auto mb-6 flex items-center justify-center gap-2 bg-rose-500 text-white px-5 py-3 rounded-xl hover:bg-rose-600 transition-all shadow-lg shadow-rose-500/20 font-medium'
            disabled={isFetching}
          >
            <FaPlus className='h-4 w-4' />
            <span>নতুন ওয়ালেট যোগ করুন</span>
          </motion.button>
        )}

        {/* Add Wallet Form */}
        {isFormOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className='bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6'
          >
            <div className='bg-gradient-to-r from-[#1a1a2e] to-[#16213e] px-5 py-4 flex justify-between items-center'>
              <h2 className='text-white font-semibold text-lg'>নতুন ওয়ালেট যোগ করুন</h2>
              <button
                onClick={resetForm}
                className='text-white/50 hover:text-white transition-colors'
              >
                <FaTimes className='h-5 w-5' />
              </button>
            </div>

            <div className='p-5'>
              {errors.form && (
                <div className='mb-4 p-3 bg-rose-50 rounded-xl border border-rose-100'>
                  <p className='text-rose-600 text-sm'>{errors.form}</p>
                </div>
              )}

              {isAlreadyVerified && (
                <div className='mb-4 p-3 bg-emerald-50 rounded-xl border border-emerald-100'>
                  <p className='text-emerald-600 text-sm'>
                    এই মোবাইল নাম্বারটি ইতিমধ্যে যাচাইকৃত, ওয়ালেট যোগ করা হচ্ছে...
                  </p>
                </div>
              )}

              {otpExpiry && new Date() >= otpExpiry && (
                <div className='mb-4 p-3 bg-amber-50 rounded-xl border border-amber-100'>
                  <p className='text-amber-600 text-sm'>
                    OTP এর মেয়াদ শেষ হয়ে গেছে। নতুন OTP পাঠান
                  </p>
                </div>
              )}

              <div className='space-y-4'>
                {/* Wallet Type Selection */}
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1.5'>
                    ওয়ালেট টাইপ
                  </label>
                  <div className='grid grid-cols-2 gap-3'>
                    <button
                      type='button'
                      onClick={() => setFormData(prev => ({ ...prev, type: 'bKash' }))}
                      className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${
                        formData.type === 'bKash'
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : 'border-gray-200 hover:border-green-300 text-gray-600'
                      }`}
                      disabled={isOtpSent || isAlreadyVerified}
                    >
                      <FaMobileAlt className='h-5 w-5' />
                      <span className='font-medium'>bKash</span>
                    </button>
                    <button
                      type='button'
                      onClick={() => setFormData(prev => ({ ...prev, type: 'Nagad' }))}
                      className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${
                        formData.type === 'Nagad'
                          ? 'border-purple-500 bg-purple-50 text-purple-700'
                          : 'border-gray-200 hover:border-purple-300 text-gray-600'
                      }`}
                      disabled={isOtpSent || isAlreadyVerified}
                    >
                      <FaCreditCard className='h-5 w-5' />
                      <span className='font-medium'>Nagad</span>
                    </button>
                  </div>
                </div>

                {/* Phone Number */}
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1.5'>
                    মোবাইল নাম্বার
                  </label>
                  <input
                    type='text'
                    name='number'
                    value={formData.number}
                    onChange={handleInputChange}
                    placeholder='01XXXXXXXXX'
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400 transition-all ${
                      errors.number
                        ? 'border-rose-500 bg-rose-50/30'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    disabled={isOtpSent || isAlreadyVerified}
                  />
                  {errors.number && <p className='mt-1 text-rose-500 text-xs'>{errors.number}</p>}
                </div>

                {/* OTP Section */}
                {isOtpSent && !isAlreadyVerified && otpExpiry && new Date() < otpExpiry && (
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1.5'>
                      OTP কোড
                    </label>
                    <input
                      type='text'
                      value={otp}
                      onChange={e => {
                        setOtp(e.target.value)
                        setErrors(prev => ({ ...prev, otp: '' }))
                      }}
                      placeholder='6-অঙ্কের OTP'
                      className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400 transition-all ${
                        errors.otp ? 'border-rose-500 bg-rose-50/30' : 'border-gray-200'
                      }`}
                    />
                    {errors.otp && <p className='mt-1 text-rose-500 text-xs'>{errors.otp}</p>}
                    <div className='mt-2 text-sm text-gray-500'>
                      {countdown > 0 ? (
                        <span>
                          ⏱️ OTP এর মেয়াদ শেষ হতে {Math.floor(countdown / 60)}:
                          {String(countdown % 60).padStart(2, '0')} মিনিট বাকি
                        </span>
                      ) : (
                        <button
                          type='button'
                          onClick={handleResendOtp}
                          className='text-rose-500 hover:text-rose-600 font-medium'
                        >
                          পুনরায় OTP পাঠান
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className='flex gap-3 pt-2'>
                  <button
                    type='button'
                    onClick={resetForm}
                    className='flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors text-sm font-medium'
                    disabled={isLoading || isVerifying || isAlreadyVerified}
                  >
                    বাতিল
                  </button>

                  {!isOtpSent && !isAlreadyVerified ? (
                    <button
                      type='button'
                      onClick={handleSendOtp}
                      className='flex-1 bg-rose-500 text-white rounded-xl py-2.5 hover:bg-rose-600 transition-colors disabled:opacity-50 text-sm font-medium'
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className='flex items-center justify-center gap-2'>
                          <div className='animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent' />
                          OTP পাঠানো হচ্ছে...
                        </div>
                      ) : (
                        'OTP পাঠান'
                      )}
                    </button>
                  ) : isOtpSent && otpExpiry && new Date() < otpExpiry ? (
                    <button
                      type='button'
                      onClick={handleVerifyOtp}
                      className='flex-1 bg-emerald-500 text-white rounded-xl py-2.5 hover:bg-emerald-600 transition-colors disabled:opacity-50 text-sm font-medium'
                      disabled={isVerifying}
                    >
                      {isVerifying ? (
                        <div className='flex items-center justify-center gap-2'>
                          <div className='animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent' />
                          যাচাই করা হচ্ছে...
                        </div>
                      ) : (
                        'যাচাই করুন'
                      )}
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Wallets List */}
        {isFetching && wallets?.length === 0 ? (
          <div className='flex justify-center py-12'>
            <div className='animate-spin rounded-full h-8 w-8 border-2 border-rose-500 border-t-transparent' />
          </div>
        ) : wallets?.length === 0 ? (
          <motion.div
            variants={fadeUp}
            className='bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center'
          >
            <div className='w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4'>
              <FaWallet className='h-7 w-7 text-gray-400' />
            </div>
            <p className='text-gray-500'>কোন ওয়ালেট যোগ করা হয়নি</p>
            <p className='text-xs text-gray-400 mt-1'>
              পেমেন্ট গ্রহণের জন্য একটি ওয়ালেট যুক্ত করুন
            </p>
          </motion.div>
        ) : (
          <motion.div
            variants={staggerContainer}
            initial='hidden'
            animate='visible'
            className='grid grid-cols-1 sm:grid-cols-2 gap-4'
          >
            {wallets.map((wallet, idx) => (
              <motion.div
                key={idx}
                variants={fadeUp}
                whileHover={{ y: -2 }}
                className='bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-all'
              >
                <div className='flex items-center justify-between mb-2'>
                  <div className='flex items-center gap-2'>
                    <WalletIcon type={wallet.walletName} />
                    <span className='font-semibold text-gray-800'>
                      {wallet.walletName === 'bKash' ? 'bKash' : 'Nagad'}
                    </span>
                  </div>
                  <div className='h-2 w-2 rounded-full bg-emerald-400' />
                </div>
                <p className='text-gray-600 text-sm'>{wallet.walletPhoneNo}</p>
                <p className='text-xs text-gray-400 mt-2'>প্রাথমিক ওয়ালেট</p>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Info Note */}
        {wallets.length > 0 && (
          <div className='mt-6 p-4 bg-amber-50 rounded-xl border border-amber-100'>
            <p className='text-amber-700 text-xs text-center'>
              ⚠️ ওয়ালেট পরিবর্তন বা ডিলিট করতে চাইলে সাপোর্ট এ যোগাযোগ করুন
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default AddWallet
