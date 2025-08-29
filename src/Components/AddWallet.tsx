import { useEffect, useState } from 'react'
import { FiPlus, FiX } from 'react-icons/fi'
import { walletApi } from '../Api/wallet.api'
import { useAuth } from '../Hooks/useAuth'

interface Wallet {
  id: string
  walletName: 'bKash' | 'Nagad'
  walletPhoneNo: string
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

  // Countdown timer for OTP resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  // Check OTP expiry periodically
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

  // Fetch wallets on component mount
  useEffect(() => {
    const fetchWallets = async () => {
      if (!user?.phoneNo) return

      try {
        setIsFetching(true)
        const response = await walletApi.getWalletsOfASeller(user.phoneNo)
        setWallets(response.data || [])
        localStorage.setItem(`wallets-${user.phoneNo}`, JSON.stringify(response.data || []))
      } catch (error) {
        setErrors(prev => ({
          ...prev,
          form: 'Failed to load wallets',
        }))
        console.error('Error fetching wallets:', error)
      } finally {
        setIsFetching(false)
      }
    }

    fetchWallets()
  }, [user?.phoneNo])

  const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
    // Clear error when typing
    if (name === 'number') {
      setErrors(prev => ({ ...prev, number: '' }))
    }
  }

  const validatePhoneNumber = (number: string) => {
    if (!number.trim()) {
      setErrors(prev => ({
        ...prev,
        number: 'মোবাইল নাম্বার দিন',
      }))
      return false
    }
    if (!/^01[3-9]\d{8}$/.test(number)) {
      setErrors(prev => ({
        ...prev,
        number: 'সঠিক মোবাইল নাম্বার দিন (01XXXXXXXXX)',
      }))
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
        await addNewWallet() // Add directly if already verified
      } else if (!success) {
        setErrors(prev => ({
          ...prev,
          form: message || 'OTP পাঠাতে ব্যর্থ',
        }))
        console.error('Error sending OTP:', message)
        return
      } else {
        setIsOtpSent(true)
        setCountdown(300) // 5 minutes countdown (300 seconds)
        // Set OTP expiry time (current time + 5 minutes)
        const expiryTime = new Date()
        expiryTime.setMinutes(expiryTime.getMinutes() + 5)
        setOtpExpiry(expiryTime)
      }
    } catch (error: any) {
      setErrors(prev => ({
        ...prev,
        form: error.response?.data?.message || 'OTP পাঠাতে ব্যর্থ',
      }))
      console.error('Error sending OTP:', error)
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
        setErrors(prev => ({
          ...prev,
          otp: message || 'OTP ভেরিফিকেশন ব্যর্থ',
        }))
      }
    } catch (error: any) {
      setErrors(prev => ({
        ...prev,
        otp: error.response?.data?.message || 'OTP ভেরিফিকেশন ব্যর্থ',
      }))
      console.error('Error verifying OTP:', error)
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
        resetForm()
      } else {
        setErrors(prev => ({
          ...prev,
          form: message || 'ওয়ালেট যোগ করতে ব্যর্থ',
        }))
        console.error('Error adding wallet:', message)
      }
    } catch (error: any) {
      setErrors(prev => ({
        ...prev,
        form: error.response?.data?.message || 'ওয়ালেট যোগ করতে ব্যর্থ',
      }))
      console.error('Error adding wallet:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      type: 'bKash',
      number: '',
    })
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
        setCountdown(300) // Reset 5 minutes countdown
        // Set new OTP expiry time
        const expiryTime = new Date()
        expiryTime.setMinutes(expiryTime.getMinutes() + 5)
        setOtpExpiry(expiryTime)
      } else {
        setErrors(prev => ({
          ...prev,
          form: message || 'OTP পুনরায় পাঠাতে ব্যর্থ',
        }))
      }
    } catch (error: any) {
      setErrors(prev => ({
        ...prev,
        form: error.response?.data?.message || 'OTP পুনরায় পাঠাতে ব্যর্থ',
      }))
      console.error('Error resending OTP:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='container mx-auto px-2 sm:px-4 py-4 sm:py-8 max-w-3xl'>
      <div className='flex justify-between items-center mb-4 sm:mb-6'>
        <h1 className='text-xl sm:text-2xl font-bold'>আমার ওয়ালেট</h1>
        {wallets?.length < 2 && (
          <button
            onClick={() => setIsFormOpen(true)}
            className='flex items-center gap-1 sm:gap-2 bg-blue-500 text-white px-3 sm:px-4 py-1 sm:py-2 rounded hover:bg-blue-600 transition-colors text-sm sm:text-base'
            disabled={isFetching}
          >
            <FiPlus className='text-sm sm:text-base' />
            <span>ওয়ালেট যোগ করুন</span>
          </button>
        )}
      </div>

      {/* Error message for form */}
      {errors.form && (
        <div className='mb-3 sm:mb-4 p-2 sm:p-3 bg-red-100 text-red-700 rounded text-sm sm:text-base'>
          {errors.form}
        </div>
      )}

      {/* Add Wallet Form */}
      {isFormOpen && (
        <div className='bg-white rounded-lg shadow-md p-4 sm:p-6 mb-4 sm:mb-8 relative'>
          <button
            onClick={resetForm}
            className='absolute top-2 right-2 text-gray-500 hover:text-gray-700'
          >
            <FiX className='text-lg' />
          </button>

          <h2 className='text-lg sm:text-xl font-semibold mb-3 sm:mb-4'>নতুন ওয়ালেট যোগ করুন</h2>

          {isAlreadyVerified && (
            <div className='mb-3 p-2 bg-green-100 text-green-700 rounded text-sm'>
              এই মোবাইল নাম্বারটি ইতিমধ্যে যাচাইকৃত, ওয়ালেট যোগ করা হচ্ছে...
            </div>
          )}

          {otpExpiry && new Date() >= otpExpiry && (
            <div className='mb-3 p-2 bg-red-100 text-red-700 rounded text-sm'>
              OTP এর মেয়াদ শেষ হয়ে গেছে। নতুন OTP পাঠান
            </div>
          )}

          <div className='grid grid-cols-1 gap-3 sm:gap-4 mb-3 sm:mb-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>ওয়ালেট টাইপ</label>
              <select
                name='type'
                value={formData.type}
                onChange={handleInputChange}
                className='w-full p-2 text-sm sm:text-base border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500'
                disabled={isOtpSent || isAlreadyVerified}
                required
              >
                <option value='bKash'>bKash</option>
                <option value='Nagad'>Nagad</option>
              </select>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>মোবাইল নাম্বার</label>
              <input
                type='text'
                name='number'
                value={formData.number}
                onChange={handleInputChange}
                placeholder='01XXXXXXXXX'
                className={`w-full p-2 text-sm sm:text-base border rounded focus:ring-blue-500 focus:border-blue-500 ${
                  errors.number ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={isOtpSent || isAlreadyVerified}
                required
              />
              {errors.number && (
                <p className='mt-1 text-xs sm:text-sm text-red-600'>{errors.number}</p>
              )}
            </div>

            {isOtpSent && !isAlreadyVerified && otpExpiry && new Date() < otpExpiry && (
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>OTP কোড</label>
                <input
                  type='text'
                  value={otp}
                  onChange={e => {
                    setOtp(e.target.value)
                    setErrors(prev => ({ ...prev, otp: '' }))
                  }}
                  placeholder='6-digit OTP'
                  className={`w-full p-2 text-sm sm:text-base border rounded focus:ring-blue-500 focus:border-blue-500 ${
                    errors.otp ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                />
                {errors.otp && <p className='mt-1 text-xs sm:text-sm text-red-600'>{errors.otp}</p>}
                <div className='mt-1 text-xs sm:text-sm text-gray-600'>
                  {countdown > 0 ? (
                    <span>
                      OTP এর মেয়াদ শেষ হতে {Math.floor(countdown / 60)}:
                      {String(countdown % 60).padStart(2, '0')} মিনিট বাকি
                    </span>
                  ) : (
                    <button
                      type='button'
                      onClick={handleResendOtp}
                      className='text-blue-600 hover:text-blue-800'
                    >
                      OTP পুনরায় পাঠান
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className='flex justify-end gap-2 sm:gap-3'>
            <button
              type='button'
              onClick={resetForm}
              className='px-3 sm:px-4 py-1 sm:py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 text-sm sm:text-base'
              disabled={isLoading || isVerifying || isAlreadyVerified}
            >
              বাতিল
            </button>

            {!isOtpSent && !isAlreadyVerified ? (
              <button
                type='button'
                onClick={handleSendOtp}
                className='px-3 sm:px-4 py-1 sm:py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 text-sm sm:text-base'
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className='flex items-center justify-center'>
                    <svg
                      className='animate-spin -ml-1 mr-1 sm:mr-2 h-3 sm:h-4 w-3 sm:w-4 text-white'
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
                    OTP পাঠানো হচ্ছে...
                  </span>
                ) : (
                  'OTP পাঠান'
                )}
              </button>
            ) : isOtpSent && otpExpiry && new Date() < otpExpiry ? (
              <button
                type='button'
                onClick={handleVerifyOtp}
                className='px-3 sm:px-4 py-1 sm:py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 text-sm sm:text-base'
                disabled={isVerifying}
              >
                {isVerifying ? (
                  <span className='flex items-center justify-center'>
                    <svg
                      className='animate-spin -ml-1 mr-1 sm:mr-2 h-3 sm:h-4 w-3 sm:w-4 text-white'
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
                  </span>
                ) : (
                  'যাচাই করুন'
                )}
              </button>
            ) : null}
          </div>
        </div>
      )}

      {/* Wallet limit message */}
      {/* {wallets?.length >= 2 && (
        <div className='mb-4 p-3 bg-blue-50 text-blue-700 rounded text-sm sm:text-base'>
          আপনি সর্বোচ্চ ২টি ওয়ালেট যোগ করতে পারবেন
        </div>
      )} */}

      {/* Wallets List */}
      {isFetching && wallets?.length === 0 ? (
        <div className='flex justify-center items-center h-40 sm:h-64'>
          <div className='animate-spin rounded-full h-6 sm:h-8 w-6 sm:w-8 border-b-2 border-blue-500'></div>
        </div>
      ) : wallets?.length === 0 ? (
        <div className='bg-white rounded-lg shadow-md p-6 sm:p-8 text-center'>
          <p className='text-gray-500 text-sm sm:text-base'>কোন ওয়ালেট যোগ করা হয়নি</p>
        </div>
      ) : (
        <div className='bg-white rounded-lg shadow-md overflow-hidden'>
          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 p-3 sm:p-4'>
            {wallets?.map((wallet, idx) => (
              <div key={idx} className='border border-gray-200 rounded-lg p-3 sm:p-4'>
                <div className='flex items-center justify-between mb-1 sm:mb-2'>
                  <span className='font-medium text-sm sm:text-base'>
                    {wallet.walletName === 'bKash' ? (
                      <span className='text-green-600'>bKash</span>
                    ) : (
                      <span className='text-purple-600'>Nagad</span>
                    )}
                  </span>
                </div>
                <div className='text-gray-700 text-sm sm:text-base'>{wallet.walletPhoneNo}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {wallets?.length > 0 && (
        <div className='mt-4 sm:mt-6 text-sm sm:text-base text-red-600'>
          ওয়ালেট ডিলিট করতে চাইলে সাপোর্ট এ যোগাযোগ করুন।
        </div>
      )}
    </div>
  )
}

export default AddWallet
