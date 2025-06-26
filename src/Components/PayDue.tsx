import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { paymentApi } from '../Api/payment.api'
import { walletApi } from '../Api/wallet.api'
import { useAuth } from '../Hooks/useAuth'

interface Wallet {
  walletId: number
  walletName: string
  walletPhoneNo: string
}

interface SystemWallet extends Wallet {
  walletType: 'SYSTEM'
}

interface SellerWallet extends Wallet {
  walletType: 'SELLER'
  userId: string
}

const PayDue = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [sellerWallets, setSellerWallets] = useState<SellerWallet[]>([])
  const [systemWallets, setSystemWallets] = useState<SystemWallet[]>([])
  const [selectedSellerWallet, setSelectedSellerWallet] = useState<SellerWallet | null>(null)
  const [selectedSystemWallet, setSelectedSystemWallet] = useState<SystemWallet | null>(null)
  const [amount, setAmount] = useState('')
  const [dueAmount, setDueAmount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(false)
  const [errors, setErrors] = useState({
    sellerWallet: '',
    systemWallet: '',
    amount: '',
    form: '',
  })
  const [transactionId, setTransactionId] = useState('')

  // Initialize with user's due amount
  useEffect(() => {
    if (user) {
      const balance = user.balance || 0
      if (balance < 0) {
        setDueAmount(Math.abs(balance))
        setAmount(Math.abs(balance).toString())
      }
    }
  }, [user])

  const fetchSellerWallets = async () => {
    try {
      setIsFetching(true)
      const { success, message, data } = await walletApi.getWalletsOfASeller(user?.phoneNo!)
      if (success) {
        setSellerWallets(data || [])
        if (data.length > 0) {
          setSelectedSellerWallet(data[0])
        }
      } else {
        setErrors(prev => ({ ...prev, form: message || 'ওয়ালেট লোড করতে সমস্যা হয়েছে' }))
      }
    } catch (error) {
      setErrors(prev => ({ ...prev, form: 'ওয়ালেট লোড করতে সমস্যা হয়েছে' }))
      console.error('ওয়ালেট লোড করার সময় ত্রুটি:', error)
    }
  }

  const fetchSystemWallets = async () => {
    try {
      const { success, message, data } = await walletApi.getSystemWallets()
      if (success) {
        setSystemWallets(data || [])
      } else {
        setErrors(prev => ({ ...prev, form: message || 'সিস্টেম ওয়ালেট লোড করতে সমস্যা হয়েছে' }))
      }
    } catch (error) {
      setErrors(prev => ({ ...prev, form: 'সিস্টেম ওয়ালেট লোড করতে সমস্যা হয়েছে' }))
      console.error('সিস্টেম ওয়ালেট লোড করার সময় ত্রুটি:', error)
    } finally {
      setIsFetching(false)
    }
  }

  useEffect(() => {
    fetchSellerWallets()
    fetchSystemWallets()
  }, [])

  // Update selected system wallet when seller wallet changes
  useEffect(() => {
    if (selectedSellerWallet && systemWallets.length > 0) {
      const matchingSystemWallet = systemWallets.find(
        sw => sw.walletName.toLowerCase() === selectedSellerWallet.walletName.toLowerCase()
      )
      setSelectedSystemWallet(matchingSystemWallet || null)
    }
  }, [selectedSellerWallet, systemWallets])

  const validateForm = () => {
    let isValid = true
    const newErrors = { sellerWallet: '', systemWallet: '', amount: '', form: '' }

    if (!selectedSellerWallet) {
      newErrors.sellerWallet = 'আপনার ওয়ালেট নির্বাচন করুন'
      isValid = false
    }

    if (!selectedSystemWallet) {
      newErrors.systemWallet = 'সিস্টেম ওয়ালেট নির্বাচন করুন'
      isValid = false
    }

    // Check if wallet types match
    if (
      selectedSellerWallet &&
      selectedSystemWallet &&
      selectedSellerWallet.walletName.toLowerCase() !==
        selectedSystemWallet.walletName.toLowerCase()
    ) {
      newErrors.sellerWallet = 'আপনার ওয়ালেট এবং সিস্টেম ওয়ালেট একই ধরনের হতে হবে'
      newErrors.systemWallet = 'আপনার ওয়ালেট এবং সিস্টেম ওয়ালেট একই ধরনের হতে হবে'
      isValid = false
    }

    const amountValue = parseFloat(amount)
    if (!amount || isNaN(amountValue)) {
      newErrors.amount = 'সঠিক পরিমাণ লিখুন'
      isValid = false
    } else if (amountValue <= 0) {
      newErrors.amount = 'পরিমাণ ০ টাকার বেশি হতে হবে'
      isValid = false
    } else if (amountValue < dueAmount) {
      newErrors.amount = `ন্যূনতম পরিশোধের পরিমাণ ${dueAmount}৳`
      isValid = false
    }

    if (!transactionId.trim()) {
      newErrors.form = 'ট্রানজেকশন আইডি লিখুন'
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm() || !selectedSellerWallet || !selectedSystemWallet) return

    try {
      setIsLoading(true)
      const response = await paymentApi.payDue({
        amount: parseFloat(amount),
        walletName: selectedSellerWallet.walletName,
        walletPhoneNo: selectedSellerWallet.walletPhoneNo,
        systemWalletPhoneNo: selectedSystemWallet.walletPhoneNo,
        transactionId,
      })

      if (response.success) {
        navigate('/payment-history', { state: { message: 'পেমেন্ট সফল হয়েছে' } })
      } else {
        throw new Error(response.message || 'পেমেন্ট ব্যর্থ হয়েছে')
      }
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        form: (error as Error).message || 'পেমেন্ট প্রক্রিয়াকরণে ত্রুটি',
      }))
      console.error('পেমেন্ট ত্রুটি:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSellerWalletChange = (walletId: number) => {
    const wallet = sellerWallets.find(w => w.walletId === walletId)
    setSelectedSellerWallet(wallet || null)
    setErrors(prev => ({ ...prev, sellerWallet: '', systemWallet: '' }))
  }

  const handleSystemWalletChange = (walletId: number) => {
    const wallet = systemWallets.find(w => w.walletId === walletId)
    setSelectedSystemWallet(wallet || null)
    setErrors(prev => ({ ...prev, systemWallet: '' }))
  }

  // Filter system wallets to only show those matching the selected seller wallet type
  const filteredSystemWallets = selectedSellerWallet
    ? systemWallets.filter(
        sw => sw.walletName.toLowerCase() === selectedSellerWallet.walletName.toLowerCase()
      )
    : systemWallets

  return (
    <div className='container mx-auto px-4 py-6 max-w-md w-full'>
      <div className='bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-lg p-4 mb-6 shadow-lg'>
        <h1 className='text-2xl font-bold text-center'>বকেয়া পরিশোধ</h1>
      </div>

      {/* Due Amount Info */}
      <div className='bg-red-50 rounded-lg p-4 mb-6 border-l-4 border-red-500 shadow-sm'>
        <div className='flex justify-between items-center'>
          <span className='font-medium'>বকেয়া পরিমাণ:</span>
          <span className='text-xl font-bold text-red-600'>{dueAmount} ৳</span>
        </div>
        <p className='text-sm text-red-600 mt-1'>সম্পূর্ণ বকেয়া পরিশোধ করুন</p>
      </div>

      {/* Error message */}
      {errors.form && (
        <div className='mb-4 p-3 bg-red-100 text-red-700 rounded text-sm shadow'>{errors.form}</div>
      )}

      {/* Payment Form */}
      <form onSubmit={handleSubmit} className='bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6'>
        <div className='space-y-4'>
          {/* Seller Wallet Selection */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              আপনার ওয়ালেট নির্বাচন করুন
            </label>
            <select
              value={selectedSellerWallet?.walletId || ''}
              onChange={e => handleSellerWalletChange(Number(e.target.value))}
              className={`w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.sellerWallet ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={isFetching}
            >
              <option value=''>ওয়ালেট নির্বাচন করুন</option>
              {sellerWallets.map(wallet => (
                <option key={wallet.walletId} value={wallet.walletId}>
                  {wallet.walletName} - {wallet.walletPhoneNo}
                </option>
              ))}
            </select>
            {errors.sellerWallet && (
              <p className='mt-1 text-xs text-red-600'>{errors.sellerWallet}</p>
            )}
          </div>

          {/* System Wallet Selection */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              সিস্টেম ওয়ালেট নির্বাচন করুন
            </label>
            <select
              value={selectedSystemWallet?.walletId || ''}
              onChange={e => handleSystemWalletChange(Number(e.target.value))}
              className={`w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.systemWallet ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={isFetching || !selectedSellerWallet}
            >
              <option value=''>সিস্টেম ওয়ালেট নির্বাচন করুন</option>
              {filteredSystemWallets.map(wallet => (
                <option key={wallet.walletId} value={wallet.walletId}>
                  {wallet.walletName} - {wallet.walletPhoneNo}
                </option>
              ))}
            </select>
            {errors.systemWallet && (
              <p className='mt-1 text-xs text-red-600'>{errors.systemWallet}</p>
            )}
          </div>

          {/* Amount Input */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>পরিমাণ (৳)</label>
            <input
              type='number'
              value={amount}
              onChange={e => {
                setAmount(e.target.value)
                setErrors(prev => ({ ...prev, amount: '' }))
              }}
              min={dueAmount}
              step='1'
              className={`w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.amount ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={isFetching}
            />
            {errors.amount && <p className='mt-1 text-xs text-red-600'>{errors.amount}</p>}
          </div>

          {/* Transaction ID */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>ট্রানজেকশন আইডি</label>
            <input
              type='text'
              value={transactionId}
              onChange={e => {
                setTransactionId(e.target.value)
                setErrors(prev => ({ ...prev, form: '' }))
              }}
              placeholder='ট্রানজেকশন আইডি লিখুন'
              className={`w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.form ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            <p className='mt-1 text-xs text-gray-500'>পেমেন্টের পর প্রাপ্ত ট্রানজেকশন আইডি লিখুন</p>
          </div>

          {/* Submit Button */}
          <button
            type='submit'
            disabled={isLoading || isFetching}
            className='w-full bg-gradient-to-r from-indigo-600 to-indigo-700 text-white py-3 px-4 rounded-lg hover:from-indigo-700 hover:to-indigo-800 disabled:opacity-50 transition-all shadow-md hover:shadow-lg'
          >
            {isLoading ? (
              <span className='flex items-center justify-center'>
                <svg
                  className='animate-spin -ml-1 mr-2 h-4 w-4 text-white'
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
              </span>
            ) : (
              'পরিশোধ করুন'
            )}
          </button>
        </div>
      </form>

      {/* Payment Instructions */}
      <div className='bg-white rounded-lg shadow-md p-4 sm:p-6'>
        <h3 className='text-lg font-semibold mb-3 text-center text-blue-600'>পেমেন্ট নির্দেশনা</h3>
        <ol className='list-decimal list-inside text-sm text-gray-700 space-y-2 pl-2'>
          <li className='pb-1'>উপরের ফর্ম থেকে আপনার ওয়ালেট নির্বাচন করুন</li>
          <li className='pb-1'>একই ধরনের সিস্টেম ওয়ালেট স্বয়ংক্রিয়ভাবে নির্বাচিত হবে</li>
          <li className='pb-1'>বকেয়া পরিমাণ স্বয়ংক্রিয়ভাবে সেট করা হয়েছে</li>
          <li className='pb-1'>নির্বাচিত সিস্টেম ওয়ালেটে পেমেন্ট করুন</li>
          <li className='pb-1'>পেমেন্টের পর প্রাপ্ত ট্রানজেকশন আইডি লিখুন</li>
          <li className='pb-1'>"পরিশোধ করুন" বাটনে ক্লিক করুন</li>
        </ol>

        <div className='mt-4 p-3 bg-blue-50 rounded border border-blue-100'>
          <h4 className='font-medium text-blue-800 mb-1'>দ্রষ্টব্য:</h4>
          <p className='text-xs text-blue-700'>
            পেমেন্ট ভেরিফিকেশনের পর আপনার অ্যাকাউন্ট ব্যালেন্স আপডেট করা হবে। এটি ১-২ ঘন্টা সময়
            নিতে পারে। সিস্টেম ওয়ালেট অবশ্যই আপনার নির্বাচিত ওয়ালেটের মতো একই ধরনের হতে হবে
            (bKash, Nagad ইত্যাদি)।
          </p>
        </div>
      </div>
    </div>
  )
}

export default PayDue
