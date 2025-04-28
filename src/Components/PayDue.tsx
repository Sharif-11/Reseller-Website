import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { verifyLogin } from '../Api/auth.api'
import { getAdminWallets, payDue } from '../Api/seller.api'
import { useAuth } from '../Hooks/useAuth'

interface Wallet {
  walletId: number
  walletName: 'bKash' | 'Nagad' | 'Rocket'
  walletPhoneNo: string
}

interface AdminWallet extends Wallet {
  adminId: number
}

const PayDue = () => {
  const navigate = useNavigate()
  const { user, setUser } = useAuth()
  const [wallets, setWallets] = useState<Wallet[]>([])
  const [adminWallets, setAdminWallets] = useState<AdminWallet[]>([])
  const [selectedWallet, setSelectedWallet] = useState<Wallet | null>(null)
  const [selectedAdminWallet, setSelectedAdminWallet] = useState<AdminWallet | null>(null)
  const [amount, setAmount] = useState('')
  const [dueAmount, setDueAmount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(false)
  const [errors, setErrors] = useState({
    wallet: '',
    adminWallet: '',
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

  // Fetch user's wallets and admin wallets
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsFetching(true)
        const [
          {
            success,
            message,
            data: { user: userData },
          },
          adminWalletsResponse,
        ] = await Promise.all([verifyLogin(), getAdminWallets()])

        if (success) {
          setUser(userData)
          setWallets(userData.wallets || [])
          // Set default wallet if available
          if (userData.wallets?.length > 0) {
            setSelectedWallet(userData.wallets[0])
          }
        } else {
          setErrors(prev => ({
            ...prev,
            form: message || 'ডেটা লোড করতে সমস্যা হয়েছে',
          }))
        }

        if (adminWalletsResponse.success) {
          setAdminWallets(adminWalletsResponse.data)
          // Find matching admin wallet if user has wallets
          if (userData.wallets?.length > 0) {
            const userWallet = userData.wallets[0]
            const matchingAdminWallet = adminWalletsResponse.data.find(
              (aw: Wallet) => aw.walletName === userWallet.walletName
            )
            if (matchingAdminWallet) {
              setSelectedAdminWallet(matchingAdminWallet)
            }
          }
        }
      } catch (error) {
        setErrors(prev => ({
          ...prev,
          form: 'ডেটা লোড করতে সমস্যা হয়েছে',
        }))
        console.error('Error fetching data:', error)
      } finally {
        setIsFetching(false)
      }
    }

    fetchData()
  }, [])

  const validateForm = () => {
    let isValid = true
    const newErrors = { wallet: '', adminWallet: '', amount: '', form: '' }

    if (!selectedWallet) {
      newErrors.wallet = 'একটি ওয়ালেট নির্বাচন করুন'
      isValid = false
    }

    if (!selectedAdminWallet) {
      newErrors.adminWallet = 'একটি অ্যাডমিন ওয়ালেট নির্বাচন করুন'
      isValid = false
    }

    // Check if wallet types match
    if (
      selectedWallet &&
      selectedAdminWallet &&
      selectedWallet.walletName !== selectedAdminWallet.walletName
    ) {
      newErrors.wallet = 'আপনার ওয়ালেট এবং অ্যাডমিন ওয়ালেট একই টাইপের হতে হবে'
      newErrors.adminWallet = 'আপনার ওয়ালেট এবং অ্যাডমিন ওয়ালেট একই টাইপের হতে হবে'
      isValid = false
    }

    const amountValue = parseFloat(amount)
    if (!amount || isNaN(amountValue) || amountValue <= 0) {
      newErrors.amount = 'সঠিক পরিমাণ লিখুন'
      isValid = false
    } else if (amountValue < dueAmount) {
      newErrors.amount = `ন্যূনতম পরিশোধের পরিমাণ ${dueAmount}৳`
      isValid = false
    }

    if (!transactionId.trim()) {
      newErrors.form = 'ট্রানজেকশন আইডি দিন'
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm() || !selectedWallet || !selectedAdminWallet) return

    try {
      setIsLoading(true)
      const response = await payDue({
        amount: parseFloat(amount),
        sellerWalletName: selectedWallet.walletName,
        sellerWalletPhoneNo: selectedWallet.walletPhoneNo,
        adminWalletId: selectedAdminWallet.walletId,
        transactionId,
      })
      if (response.success) {
        navigate('/home', { state: { message: 'বকেয়া পরিশোধ সফল হয়েছে' } })
      } else {
        throw new Error(response.message || 'বকেয়া পরিশোধ ব্যর্থ হয়েছে')
      }
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        form: (error as Error).message || 'বকেয়া পরিশোধে সমস্যা হয়েছে',
      }))
      console.error('Payment error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleWalletChange = (walletId: number) => {
    const wallet = wallets.find(w => w.walletId === walletId)
    setSelectedWallet(wallet || null)

    // Find matching admin wallet
    if (wallet) {
      const matchingAdminWallet = adminWallets.find(aw => aw.walletName === wallet.walletName)
      setSelectedAdminWallet(matchingAdminWallet || null)
    }

    setErrors(prev => ({ ...prev, wallet: '', adminWallet: '' }))
  }

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
        <p className='text-sm text-red-600 mt-1'>দয়া করে সম্পূর্ণ বকেয়া পরিশোধ করুন</p>
      </div>

      {/* Error message */}
      {errors.form && (
        <div className='mb-4 p-3 bg-red-100 text-red-700 rounded text-sm shadow'>{errors.form}</div>
      )}

      {/* Payment Form */}
      <form onSubmit={handleSubmit} className='bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6'>
        <div className='space-y-4'>
          {/* User Wallet Selection */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              আপনার ওয়ালেট নির্বাচন করুন
            </label>
            <select
              value={selectedWallet?.walletId || ''}
              onChange={e => handleWalletChange(Number(e.target.value))}
              className={`w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.wallet ? 'border-red-500' : 'border-gray-300'
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
            {errors.wallet && <p className='mt-1 text-xs text-red-600'>{errors.wallet}</p>}
          </div>

          {/* Admin Wallet Selection */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              অ্যাডমিন ওয়ালেট নির্বাচন করুন
            </label>
            <select
              value={selectedAdminWallet?.walletId || ''}
              onChange={e => {
                const selectedAdminWalletId = Number(e.target.value)
                const wallet = adminWallets.find(w => w.walletId === selectedAdminWalletId)
                setSelectedAdminWallet(wallet || null)
                setErrors(prev => ({ ...prev, adminWallet: '' }))
              }}
              className={`w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.adminWallet ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={isFetching || !selectedWallet}
            >
              <option value=''>অ্যাডমিন ওয়ালেট নির্বাচন করুন</option>
              {adminWallets
                .filter(aw => !selectedWallet || aw.walletName === selectedWallet.walletName)
                .map(wallet => (
                  <option key={wallet.walletId} value={wallet.walletId}>
                    {wallet.walletName} - {wallet.walletPhoneNo}
                  </option>
                ))}
            </select>
            {errors.adminWallet && (
              <p className='mt-1 text-xs text-red-600'>{errors.adminWallet}</p>
            )}
          </div>

          {/* Amount Input */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              পরিশোধের পরিমাণ (৳)
            </label>
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
            <p className='mt-1 text-xs text-gray-500'>পেমেন্টের পর প্রাপ্ত ট্রানজেকশন আইডি দিন</p>
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
                প্রসেসিং...
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
          <li className='pb-1'>উপরের ফর্মে আপনার ওয়ালেট নির্বাচন করুন</li>
          <li className='pb-1'>অ্যাডমিন ওয়ালেট স্বয়ংক্রিয়ভাবে নির্বাচিত হবে</li>
          <li className='pb-1'>স্বয়ংক্রিয়ভাবে বকেয়া পরিমাণ সেট করা হয়েছে</li>
          <li className='pb-1'>নির্বাচিত অ্যাডমিন ওয়ালেটে পেমেন্ট করুন</li>
          <li className='pb-1'>পেমেন্টের পর প্রাপ্ত ট্রানজেকশন আইডি লিখুন</li>
          <li className='pb-1'>"পরিশোধ করুন" বাটনে ক্লিক করুন</li>
        </ol>

        <div className='mt-4 p-3 bg-blue-50 rounded border border-blue-100'>
          <h4 className='font-medium text-blue-800 mb-1'>দ্রষ্টব্য:</h4>
          <p className='text-xs text-blue-700'>
            পেমেন্ট ভেরিফিকেশনের পর আপনার অ্যাকাউন্ট ব্যালেন্স আপডেট করা হবে। এটি ১-২ ঘন্টা সময়
            নিতে পারে। অ্যাডমিন ওয়ালেট অবশ্যই আপনার নির্বাচিত ওয়ালেটের মতো একই টাইপের হতে হবে
            (bKash বা Nagad)।
          </p>
        </div>
      </div>
    </div>
  )
}

export default PayDue
