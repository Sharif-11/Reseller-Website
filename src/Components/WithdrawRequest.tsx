import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { FaArrowRight, FaCreditCard, FaInfoCircle, FaMobileAlt, FaWallet } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { walletApi } from '../Api/wallet.api'
import withdrawApi from '../Api/withdraw.api'
import { useAuth } from '../Hooks/useAuth'
import { calculateWithdrawal } from '../utils/withdraw.utils'

interface Wallet {
  walletId: number
  walletName: 'bKash' | 'Nagad'
  walletPhoneNo: string
  userId: string
  userName: string
  userPhoneNo: string
  createdAt: string
}

interface WithdrawalDetails {
  amount: number
  actualAmount: number
  transactionFee: number
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

const WithdrawRequest = () => {
  const navigate = useNavigate()
  const { user, reloadUser } = useAuth()
  const [wallets, setWallets] = useState<Wallet[]>([])
  const [selectedWallet, setSelectedWallet] = useState<Wallet | null>(null)
  const [amount, setAmount] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(false)
  const [errors, setErrors] = useState({
    wallet: '',
    amount: '',
    form: '',
  })
  const [withdrawalDetails, setWithdrawalDetails] = useState<WithdrawalDetails | null>(null)
  const [activePolicyTab, setActivePolicyTab] = useState<'bKash' | 'Nagad'>('bKash')

  // Calculate withdrawal details when amount or wallet changes
  useEffect(() => {
    if (selectedWallet && amount) {
      const amountValue = parseFloat(amount)
      if (!isNaN(amountValue)) {
        try {
          const details = calculateWithdrawal(
            selectedWallet.walletName,
            selectedWallet.walletPhoneNo,
            amountValue
          )
          setWithdrawalDetails(details)
          setErrors(prev => ({ ...prev, amount: '' }))
        } catch (error) {
          setErrors(prev => ({
            ...prev,
            amount: (error as Error).message,
          }))
          setWithdrawalDetails(null)
        }
      } else {
        setWithdrawalDetails(null)
      }
    } else {
      setWithdrawalDetails(null)
    }
  }, [amount, selectedWallet])

  const fetchWallets = async () => {
    try {
      setIsFetching(true)
      const { success, message, data } = await walletApi.getWalletsOfASeller(user?.phoneNo!)
      if (success) {
        setWallets(data || [])
      } else {
        setErrors(prev => ({
          ...prev,
          form: message || 'ডেটা লোড করতে সমস্যা হয়েছে',
        }))
      }
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        form: 'ডেটা লোড করতে সমস্যা হয়েছে',
      }))
      console.error('Error fetching wallets:', error)
    } finally {
      setIsFetching(false)
    }
  }

  useEffect(() => {
    fetchWallets()
    reloadUser()
  }, [])

  const validateForm = () => {
    let isValid = true
    const newErrors = { wallet: '', amount: '', form: '' }

    if (!selectedWallet) {
      newErrors.wallet = 'একটি ওয়ালেট নির্বাচন করুন'
      isValid = false
    }

    const amountValue = parseFloat(amount)
    if (!amount || isNaN(amountValue)) {
      newErrors.amount = 'সঠিক পরিমাণ লিখুন'
      isValid = false
    } else if (withdrawalDetails === null) {
      newErrors.amount = 'অবৈধ উইথড্র পরিমাণ'
      isValid = false
    } else if (amountValue > user?.balance!) {
      newErrors.amount = 'আপনার ব্যালেন্স পর্যাপ্ত নয়'
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm() || !withdrawalDetails) return

    try {
      setIsLoading(true)

      const response = await withdrawApi.createWithdraw({
        amount: withdrawalDetails.amount,
        walletName: withdrawalDetails.walletName,
        walletPhoneNo: withdrawalDetails.walletPhoneNo,
      })

      if (response.success) {
        toast.success('উইথড্র রিকোয়েস্ট সফল হয়েছে')
        navigate('/withdraw-history')
        setSelectedWallet(null)
        setAmount('')
        setWithdrawalDetails(null)
      } else {
        throw new Error(response.message || 'উইথড্র রিকোয়েস্ট ব্যর্থ হয়েছে')
      }
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        form: (error as Error).message || 'উইথড্র রিকোয়েস্ট জমা দিতে সমস্যা হয়েছে',
      }))
      toast.error((error as Error).message || 'উইথড্র রিকোয়েস্ট জমা দিতে সমস্যা হয়েছে')
      console.error('Withdrawal error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const PolicyContent = () => {
    if (activePolicyTab === 'bKash') {
      return (
        <div className='space-y-2'>
          <div className='flex justify-between py-2 border-b border-gray-100'>
            <span className='text-gray-600 text-sm'>ন্যূনতম উইথড্র পরিমাণ</span>
            <span className='font-semibold text-gray-800'>৫০৳</span>
          </div>
          <div className='flex justify-between py-2 border-b border-gray-100'>
            <span className='text-gray-600 text-sm'>ফি (১০০০৳ পর্যন্ত)</span>
            <span className='font-semibold text-gray-800'>৫৳</span>
          </div>
          <div className='flex justify-between py-2 border-b border-gray-100'>
            <span className='text-gray-600 text-sm'>ফি (১০০০৳ এর বেশি)</span>
            <span className='font-semibold text-gray-800'>১০৳</span>
          </div>
          <div className='flex justify-between py-2'>
            <span className='text-gray-600 text-sm'>প্রসেসিং সময়</span>
            <span className='font-semibold text-emerald-600'>২৪-৪৮ ঘন্টা</span>
          </div>
        </div>
      )
    }
    return (
      <div className='space-y-2'>
        <div className='flex justify-between py-2 border-b border-gray-100'>
          <span className='text-gray-600 text-sm'>ন্যূনতম উইথড্র পরিমাণ</span>
          <span className='font-semibold text-gray-800'>৫০৳</span>
        </div>
        <div className='flex justify-between py-2 border-b border-gray-100'>
          <span className='text-gray-600 text-sm'>ফি (১০০০৳ পর্যন্ত)</span>
          <span className='font-semibold text-gray-800'>৫৳</span>
        </div>
        <div className='flex justify-between py-2 border-b border-gray-100'>
          <span className='text-gray-600 text-sm'>ফি (প্রতি হাজার টাকায়)</span>
          <span className='font-semibold text-gray-800'>৫৳</span>
        </div>
        <div className='flex justify-between py-2'>
          <span className='text-gray-600 text-sm'>প্রসেসিং সময়</span>
          <span className='font-semibold text-emerald-600'>২৪-৪৮ ঘন্টা</span>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-[#f7f6f3] py-6 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-2xl mx-auto'>
        {/* Header */}
        <motion.div initial='hidden' animate='visible' variants={staggerContainer} className='mb-6'>
          <motion.div variants={fadeUp}>
            <h1 className='text-2xl md:text-3xl font-bold text-[#1a1a2e]'>উইথড্র রিকোয়েস্ট</h1>
            <p className='text-gray-500 text-sm mt-1'>আপনার আয় উত্তোলন করুন</p>
          </motion.div>
        </motion.div>

        {/* Balance Card */}
        <motion.div
          variants={fadeUp}
          initial='hidden'
          animate='visible'
          className='bg-gradient-to-r from-[#1a1a2e] to-[#16213e] rounded-2xl p-5 mb-6 shadow-lg'
        >
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <div className='h-10 w-10 rounded-xl bg-rose-500/20 flex items-center justify-center'>
                <FaWallet className='h-5 w-5 text-rose-400' />
              </div>
              <div>
                <p className='text-white/50 text-xs uppercase tracking-wider'>বর্তমান ব্যালেন্স</p>
                <p className='text-white text-2xl font-bold'>
                  ৳{user?.balance?.toLocaleString('bn-BD') || 0}
                </p>
              </div>
            </div>
            <div className='text-right'>
              <p className='text-white/30 text-xs'>উপলব্ধ</p>
            </div>
          </div>
        </motion.div>

        {/* Error Alert */}
        {errors.form && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className='mb-5 p-4 bg-rose-50 rounded-xl border border-rose-100'
          >
            <p className='text-rose-600 text-sm'>{errors.form}</p>
          </motion.div>
        )}

        {/* Withdraw Form */}
        <motion.div
          variants={fadeUp}
          initial='hidden'
          animate='visible'
          className='bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6'
        >
          <div className='bg-gradient-to-r from-[#1a1a2e] to-[#16213e] px-5 py-4'>
            <h2 className='text-white font-semibold text-lg'>উইথড্র ফরম</h2>
          </div>

          <form onSubmit={handleSubmit} className='p-5 space-y-5'>
            {/* Wallet Selection */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1.5'>
                ওয়ালেট নির্বাচন করুন <span className='text-rose-500'>*</span>
              </label>
              <div className='relative'>
                <select
                  value={selectedWallet?.walletId || ''}
                  onChange={e => {
                    const selectedWalletId = Number(e.target.value)
                    const wallet = wallets.find(w => w.walletId === selectedWalletId)
                    setSelectedWallet(wallet || null)
                    setErrors(prev => ({ ...prev, wallet: '' }))
                  }}
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400 transition-all ${
                    errors.wallet
                      ? 'border-rose-500 bg-rose-50/30'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  disabled={isFetching}
                >
                  <option value=''>ওয়ালেট নির্বাচন করুন</option>
                  {wallets.map(wallet => (
                    <option key={wallet.walletId} value={wallet.walletId}>
                      {wallet.walletName} - {wallet.walletPhoneNo}
                    </option>
                  ))}
                </select>
                <div className='absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none'>
                  <svg
                    className='h-4 w-4 text-gray-400'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M19 9l-7 7-7-7'
                    />
                  </svg>
                </div>
              </div>
              {errors.wallet && <p className='mt-1 text-rose-500 text-xs'>{errors.wallet}</p>}
            </div>

            {/* Amount Input */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1.5'>
                পরিমাণ (৳) <span className='text-rose-500'>*</span>
              </label>
              <input
                type='number'
                value={amount}
                onChange={e => {
                  setAmount(e.target.value)
                  setErrors(prev => ({ ...prev, amount: '' }))
                }}
                placeholder='উইথড্র পরিমাণ লিখুন'
                min='0'
                step='1'
                className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400 transition-all ${
                  errors.amount
                    ? 'border-rose-500 bg-rose-50/30'
                    : 'border-gray-200 hover:border-gray-300'
                } ${!selectedWallet ? 'bg-gray-50 cursor-not-allowed' : ''}`}
                disabled={!selectedWallet}
              />
              {errors.amount && <p className='mt-1 text-rose-500 text-xs'>{errors.amount}</p>}
              {selectedWallet && <p className='mt-1 text-xs text-gray-400'>ন্যূনতম উইথড্র: ৫০৳</p>}
            </div>

            {/* Summary Card */}
            {withdrawalDetails && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className='bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-4 border border-emerald-100'
              >
                <div className='flex items-center gap-2 mb-3'>
                  <FaInfoCircle className='text-emerald-500 h-4 w-4' />
                  <h3 className='text-sm font-semibold text-emerald-800'>উইথড্র সারাংশ</h3>
                </div>
                <div className='space-y-2'>
                  <div className='flex justify-between text-sm'>
                    <span className='text-gray-600'>উইথড্র পরিমাণ:</span>
                    <span className='font-medium text-gray-800'>
                      {withdrawalDetails.amount.toFixed(2)}৳
                    </span>
                  </div>
                  <div className='flex justify-between text-sm'>
                    <span className='text-gray-600'>লেনদেন ফি:</span>
                    <span className='text-rose-600 font-medium'>
                      - {withdrawalDetails.transactionFee.toFixed(2)}৳
                    </span>
                  </div>
                  <div className='border-t border-emerald-200 pt-2 flex justify-between'>
                    <span className='font-semibold text-gray-700'>প্রাপ্ত অর্থ:</span>
                    <span className='font-bold text-emerald-700 text-lg'>
                      {withdrawalDetails.actualAmount.toFixed(2)}৳
                    </span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Submit Button */}
            <button
              type='submit'
              disabled={isLoading || isFetching || !withdrawalDetails}
              className='w-full bg-rose-500 text-white py-3 rounded-xl font-medium hover:bg-rose-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-rose-500/20'
            >
              {isLoading ? (
                <>
                  <div className='animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent' />
                  প্রসেসিং...
                </>
              ) : (
                <>
                  <FaArrowRight className='h-4 w-4' />
                  রিকোয়েস্ট জমা দিন
                </>
              )}
            </button>
          </form>
        </motion.div>

        {/* Withdrawal Policy Card */}
        <motion.div
          variants={fadeUp}
          initial='hidden'
          animate='visible'
          className='bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden'
        >
          <div className='bg-gradient-to-r from-gray-50 to-white px-5 py-4 border-b border-gray-100'>
            <h3 className='font-semibold text-[#1a1a2e] flex items-center gap-2'>
              <FaInfoCircle className='text-rose-400 h-4 w-4' />
              উইথড্র নীতিমালা
            </h3>
          </div>

          <div className='p-5'>
            <div className='flex gap-4 mb-4 border-b border-gray-100'>
              <button
                className={`pb-2 text-sm font-medium transition-all flex items-center gap-2 ${
                  activePolicyTab === 'bKash'
                    ? 'text-rose-500 border-b-2 border-rose-500'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
                onClick={() => setActivePolicyTab('bKash')}
              >
                <FaMobileAlt className='h-4 w-4' />
                bKash
              </button>
              <button
                className={`pb-2 text-sm font-medium transition-all flex items-center gap-2 ${
                  activePolicyTab === 'Nagad'
                    ? 'text-rose-500 border-b-2 border-rose-500'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
                onClick={() => setActivePolicyTab('Nagad')}
              >
                <FaCreditCard className='h-4 w-4' />
                Nagad
              </button>
            </div>
            <PolicyContent />
          </div>
        </motion.div>

        {/* Footer Note */}
        <motion.div
          variants={fadeUp}
          initial='hidden'
          animate='visible'
          className='mt-6 text-center'
        >
          <p className='text-xs text-gray-400'>
            আপনার টাকা নিরাপদ হাতে পৌঁছাতে ২৪-৪৮ ঘন্টা সময় লাগতে পারে
          </p>
        </motion.div>
      </div>
    </div>
  )
}

export default WithdrawRequest
