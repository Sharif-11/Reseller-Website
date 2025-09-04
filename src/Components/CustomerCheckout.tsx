import { useFormik } from 'formik'
import { useEffect, useState } from 'react'
import { FiChevronLeft, FiEdit2, FiMapPin, FiPhone, FiUser } from 'react-icons/fi'
import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import * as Yup from 'yup'
import districts from '../../public/zillasInfo.json'
import { authApi } from '../Api/auth.api'
import { orderApi } from '../Api/order.api'
import { sendOtp, verifyOtp } from '../Api/otp.api'
import { userApi } from '../Api/user.api'
import { walletApi } from '../Api/wallet.api'
import { useCartFavorite } from '../Context/cartContext'
import { CustomerOrderData } from '../types/order.types'
import { CART_ITEMS_KEY, DRAFT_KEY } from '../utils/utils.variables'
import { ShopCart } from './Cart'
import { CartItem } from './ProductDetail'

// Draft data interface with timestamp
interface DraftData {
  customerPhone: string
  customerName: string
  zilla: string
  upazilla: string
  deliveryAddress: string
  comments: string
  createdAt: number // Add timestamp
}

interface OrderResponse {
  orderId: number
  shopId: string
  customerName: string
  customerPhoneNo: string
  customerZilla: string
  customerUpazilla: string
  deliveryAddress: string
  comments: string
  deliveryCharge: number
  orderStatus: string
  products: {
    id: string
    imageUrl: string
    imageId: string
    quantity: number
    sellingPrice: number
    selectedVariants?: Record<string, string>
  }[]
}

interface Customer {
  customerId: string
  customerName: string | null
  customerPhoneNo: string
  role: string
  balance: string
  sellerId: string
  sellerCode: string
  sellerName: string
  sellerPhone: string
  createdAt: string
  updatedAt: string
}

interface OtpResponse {
  sendOTP: boolean
  alreadySent: boolean
  isBlocked: boolean
  isVerified: boolean
  message: string
  waitTime?: number
}

const CustomerCheckout = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [upazillas, setUpazillas] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formErrors, setFormErrors] = useState<string[]>([])
  const { loadCartCount } = useCartFavorite()
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<OrderResponse | null>(null)
  const [transactionId, setTransactionId] = useState('')
  const [customerWalletNumber, setCustomerWalletNumber] = useState('')
  const [actionLoading, setActionLoading] = useState<{
    type: 'payment' | 'confirm' | '' | null
    id: string | null | number | ''
  }>({ type: '', id: '' })
  const [error, setError] = useState('')
  const [systemWallets, setSystemWallets] = useState<
    { walletId: number; walletName: string; walletPhoneNo: string }[]
  >([])
  const [selectedSystemWallet, setSelectedSystemWallet] = useState<{
    walletId: number
    walletName: string
    walletPhoneNo: string
  } | null>(null)
  const [walletLoading, setWalletLoading] = useState(false)
  const [deliveryCharge, setDeliveryCharge] = useState<number>(0)

  // Customer verification states
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [checkingCustomer, setCheckingCustomer] = useState(false)
  const [sendingOtp, setSendingOtp] = useState(false)
  const [verifyingOtp, setVerifyingOtp] = useState(false)
  const [verifyingOtpError, setVerifyingOtpError] = useState<string | null>(null)
  const [otpSent, setOtpSent] = useState(false)
  const [otp, setOtp] = useState('')
  const [otpCooldown, setOtpCooldown] = useState<number>(0)
  const [otpCooldownInterval, setOtpCooldownInterval] = useState<NodeJS.Timeout | null>(null)

  const shopCart = location.state?.shopCart as ShopCart
  const totalItems = shopCart?.items.reduce((sum, item) => sum + item.quantity, 0)
  const subtotal = shopCart?.items.reduce((sum, item) => sum + item.sellingPrice * item.quantity, 0)

  const validationSchema = Yup.object({
    customerPhone: Yup.string()
      .matches(/^01\d{9}$/, 'সঠিক মোবাইল নম্বর দিন (01XXXXXXXXX)')
      .required('মোবাইল নম্বর আবশ্যক'),
    customerName: Yup.string().max(48, 'নামটি আরও ছোট হতে হবে').required('নাম আবশ্যক'),
    zilla: Yup.string().required('জেলা নির্বাচন করুন').max(48, 'জেলার নাম আরও ছোট হতে হবে'),
    upazilla: Yup.string()
      .required('থানা/এলাকা নির্বাচন করুন')
      .max(48, 'থানা/এলাকার নাম আরও ছোট হতে হবে'),
    deliveryAddress: Yup.string().max(255, 'ঠিকানা আরও ছোট হতে হবে').required('ঠিকানা আবশ্যক'),
    comments: Yup.string().max(500, 'কমেন্টস আরও ছোট হতে হবে'),
  })

  // Get draft key for specific customer
  const getDraftKey = (phone: string) => `${DRAFT_KEY}_${phone}`

  // Load draft data from localStorage for specific customer and clean up old drafts
  const loadDraft = (phone: string): DraftData | null => {
    // First, clean up all drafts older than a month
    const oneMonthAgo = Date.now() - 30 * 24 * 60 * 60 * 1000 // 30 days in milliseconds
    const draftKeys = Object.keys(localStorage).filter(key => key.startsWith(DRAFT_KEY))

    draftKeys.forEach(key => {
      try {
        const draft = JSON.parse(localStorage.getItem(key) || '')
        if (draft && draft.createdAt && draft.createdAt < oneMonthAgo) {
          localStorage.removeItem(key)
        }
      } catch (error) {
        // If JSON parsing fails, remove the invalid item
        localStorage.removeItem(key)
      }
    })

    // Now load the requested draft
    const draft = localStorage.getItem(getDraftKey(phone))
    if (!draft) return null

    try {
      const parsedDraft = JSON.parse(draft)
      // Check if this draft is still valid (not older than a month)
      if (parsedDraft.createdAt && parsedDraft.createdAt >= oneMonthAgo) {
        return parsedDraft
      } else {
        // Remove expired draft
        localStorage.removeItem(getDraftKey(phone))
        return null
      }
    } catch (error) {
      // If JSON parsing fails, remove the invalid item
      localStorage.removeItem(getDraftKey(phone))
      return null
    }
  }

  // Save draft data to localStorage for specific customer
  const saveDraft = (data: DraftData) => {
    const draftWithTimestamp = {
      ...data,
      createdAt: Date.now(), // Add current timestamp
    }
    localStorage.setItem(getDraftKey(data.customerPhone), JSON.stringify(draftWithTimestamp))
  }

  // Clear draft data for specific customer
  const clearDraft = (phone: string) => {
    localStorage.removeItem(getDraftKey(phone))
  }

  // Start OTP cooldown timer
  const startOtpCooldown = (seconds: number) => {
    setOtpCooldown(seconds)
    const interval = setInterval(() => {
      setOtpCooldown(prev => {
        if (prev <= 1) {
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    setOtpCooldownInterval(interval)
  }

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (otpCooldownInterval) {
        clearInterval(otpCooldownInterval)
      }
    }
  }, [otpCooldownInterval])

  const formik = useFormik({
    initialValues: {
      customerPhone: location.state?.mobileNumber || '',
      customerName: '',
      zilla: '',
      upazilla: '',
      deliveryAddress: '',
      comments: '',
      createdAt: Date.now(),
    },
    validationSchema,
    onSubmit: async values => {
      submitOrder(values)
    },
  })

  useEffect(() => {
    if (formik.values.zilla && shopCart) {
      const isInsideDeliveryZone =
        formik.values.zilla.toLowerCase() === shopCart.shopLocation!.toLowerCase()
      const deliveryChargeValue = isInsideDeliveryZone
        ? shopCart.deliveryChargeInside ?? 0
        : shopCart.deliveryChargeOutside ?? 0
      setDeliveryCharge(deliveryChargeValue)
    }
  }, [formik.values.zilla, shopCart])

  // Check if customer exists when phone number changes
  useEffect(() => {
    const checkCustomer = async () => {
      if (formik.values.customerPhone.length === 11) {
        setCheckingCustomer(true)
        try {
          const { data } = await userApi.getCustomerByPhoneNumber(formik.values.customerPhone)
          if (data) {
            setCustomer(data)
            formik.setFieldValue('customerName', data.customerName || '')
            // Hide OTP section if customer exists
            setOtpSent(false)
          } else {
            setCustomer(null)
          }
        } catch (error) {
          setCustomer(null)
          console.error('Error checking customer:', error)
        } finally {
          setCheckingCustomer(false)
        }
      } else {
        // Reset OTP state if phone number is incomplete
        setOtpSent(false)
        setOtp('')
        setVerifyingOtpError(null)
      }
    }

    const timer = setTimeout(checkCustomer, 500)
    return () => clearTimeout(timer)
  }, [formik.values.customerPhone])

  const handleZillaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedZilla = e.target.value as keyof typeof districts
    formik.setFieldValue('zilla', selectedZilla)
    formik.setFieldValue('upazilla', '')
    setUpazillas(selectedZilla ? districts[selectedZilla] || [] : [])

    // Save draft with updated values
    if (formik.values.customerPhone) {
      saveDraft({
        ...formik.values,
        zilla: selectedZilla,
        upazilla: '',
        createdAt: Date.now(), // Update timestamp
      })
    }
  }

  // Send OTP to customer phone
  const handleSendOtp = async () => {
    setSendingOtp(true)
    setVerifyingOtpError(null)
    try {
      const { success, data, message } = (await sendOtp(formik.values.customerPhone)) as {
        success: boolean
        data?: OtpResponse
        message?: string
      }

      if (success && data) {
        if (data.isVerified) {
          // Phone number already verified, create customer directly
          await createCustomer()
        } else if (data.alreadySent) {
          // OTP already sent, show cooldown
          setOtpSent(true)
          if (data.waitTime) {
            startOtpCooldown(data.waitTime)
          }
        } else if (data.sendOTP) {
          // OTP sent successfully
          setOtpSent(true)
          toast.success('OTP sent successfully')
          if (data.waitTime) {
            startOtpCooldown(data.waitTime)
          }
        } else if (data.isBlocked) {
          // Phone number blocked
          toast.error('This phone number is blocked from receiving OTPs')
        }
      } else {
        toast.error(message || 'Failed to send OTP')
      }
    } catch (error: any) {
      console.error('Error sending OTP:', error)
      toast.error(error.response?.data?.message || 'Failed to send OTP')
    } finally {
      setSendingOtp(false)
    }
  }

  // Create customer after OTP verification or if already verified
  const createCustomer = async () => {
    try {
      const { success, data } = await authApi.createCustomer({
        customerPhoneNo: formik.values.customerPhone,
        sellerCode: '123', // Fixed referral code as requested
      })

      if (success && data) {
        setCustomer(data)
        // Hide OTP section after successful customer creation
        setOtpSent(false)
        toast.success('Customer account created successfully')
      } else {
        toast.error('Failed to create customer account')
      }
    } catch (error: any) {
      console.error('Error creating customer:', error)
      toast.error(error.response?.data?.message || 'Failed to create customer account')
    }
  }

  // Verify OTP and create customer
  const verifyOtpAndCreateCustomer = async () => {
    if (otp.length !== 6) {
      setVerifyingOtpError('OTP must be 6 digits')
      return
    }

    setVerifyingOtp(true)
    setVerifyingOtpError(null)
    try {
      const { success, data, message } = (await verifyOtp(formik.values.customerPhone, otp)) as {
        success: boolean
        data?: {
          otpVerified: boolean
          message: string
        }
        message?: string
      }

      if (success && data) {
        if (data.otpVerified) {
          // OTP verified successfully, create customer
          await createCustomer()
        } else {
          setVerifyingOtpError(data.message || 'OTP verification failed')
        }
      } else {
        setVerifyingOtpError(message || 'OTP verification failed')
      }
    } catch (error: any) {
      console.error('Error verifying OTP:', error)
      setVerifyingOtpError(error.response?.data?.message || 'OTP verification failed')
    } finally {
      setVerifyingOtp(false)
    }
  }

  const submitOrder = async (values: any) => {
    // Check if customer is verified
    if (!customer) {
      toast.error('Please verify your phone number before placing an order')
      return
    }

    setIsSubmitting(true)
    try {
      const orderData: CustomerOrderData = {
        shopId: shopCart.shopId,
        customerName: values.customerName,
        customerPhoneNo: values.customerPhone,
        customerZilla: values.zilla,
        customerUpazilla: values.upazilla,
        deliveryAddress: values.deliveryAddress,
        comments: values.comments,
        products: shopCart.items.map(item => ({
          id: item.productId,
          imageUrl: item.imageUrl,
          imageId: item.imageId,
          quantity: item.quantity,
          sellingPrice: item.sellingPrice,
          selectedVariants: item.selectedOptions,
        })),
      }

      const { success, message, data } = await orderApi.createCustomerOrder(
        orderData as CustomerOrderData
      )
      if (success && data) {
        clearDraft(values.customerPhone)
        const cartItems: CartItem[] = JSON.parse(localStorage.getItem(CART_ITEMS_KEY) || '[]')
        const updatedCartItems = cartItems.filter(
          (item: CartItem) => item.shopId !== shopCart.shopId
        )
        localStorage.setItem(CART_ITEMS_KEY, JSON.stringify(updatedCartItems))
        loadCartCount()

        // Check if customer has enough balance for delivery charge
        if (customer && parseFloat(customer.balance) >= data.deliveryCharge) {
          // Customer has enough balance, navigate to success page
          navigate('/orders', { state: { orderSuccess: true } })
        } else {
          // Show payment modal for delivery charge
          fetchSystemWallets()
          setSelectedOrder(data)
          setShowPaymentModal(true)
        }
      } else {
        setFormErrors([message || 'অর্ডার সাবমিট করতে সমস্যা হয়েছে। পরে আবার চেষ্টা করুন।'])
      }
    } catch (error) {
      console.error('Order submission error:', error)
      setFormErrors(['অর্ডার সাবমিট করতে সমস্যা হয়েছে। পরে আবার চেষ্টা করুন।'])
    } finally {
      setIsSubmitting(false)
    }
  }

  const fetchSystemWallets = async () => {
    try {
      setWalletLoading(true)
      const response = await walletApi.getSystemWallets()
      if (response.success) {
        setSystemWallets(response.data)
      } else {
        toast.error(response.message || 'ওয়ালেট লোড করতে সমস্যা হয়েছে')
      }
    } catch (error) {
      toast.error('ওয়ালেট লোড করতে সমস্যা হয়েছে')
      console.error('Error fetching system wallets:', error)
    } finally {
      setWalletLoading(false)
    }
  }

  const handlePayment = async () => {
    if (!selectedOrder || !selectedSystemWallet) return

    try {
      setActionLoading({ type: 'payment', id: selectedOrder.orderId })
      setError('')

      const paymentData = {
        orderId: selectedOrder.orderId,
        paymentMethod: 'WALLET',
        customerWalletPhoneNo: customerWalletNumber,
        systemWalletPhoneNo: selectedSystemWallet.walletPhoneNo,
        transactionId: transactionId,
        customerWalletName: selectedSystemWallet.walletName,
        amount: selectedOrder.deliveryCharge || 0,
      }

      const response = await orderApi.orderPaymentByCustomer(paymentData)

      if (response.success) {
        toast.success('পেমেন্ট সফল হয়েছে')
        setShowPaymentModal(false)
        setTransactionId('')
        setCustomerWalletNumber('')
        setSelectedSystemWallet(null)
        navigate('/orders', { state: { orderSuccess: true } })
      } else {
        setError(response.message || 'পেমেন্ট করতে ব্যর্থ হয়েছে')
      }
    } catch (error) {
      setError('একটি ত্রুটি ঘটেছে')
      console.error('Error processing payment:', error)
    } finally {
      setActionLoading({ type: null, id: null })
    }
  }

  // Load draft data on component mount
  useEffect(() => {
    const locationMobileNumber = location.state?.mobileNumber
    const currentPhone = locationMobileNumber || formik.values.customerPhone

    if (currentPhone) {
      const draft = loadDraft(currentPhone)

      if (draft) {
        if (locationMobileNumber && draft.customerPhone !== locationMobileNumber) {
          // If mobile numbers don't match, update draft with location state mobile number and clear other fields
          const updatedDraft = {
            customerPhone: locationMobileNumber,
            customerName: '',
            zilla: '',
            upazilla: '',
            deliveryAddress: '',
            comments: '',
            createdAt: Date.now(),
          }
          formik.setValues(updatedDraft)
          saveDraft(updatedDraft)
          setUpazillas([])
        } else {
          // Use the existing draft if mobile numbers match
          formik.setValues(draft)
          if (draft.zilla) {
            setUpazillas(districts[draft.zilla as keyof typeof districts] || [])
          }
        }
      } else if (locationMobileNumber) {
        // If no draft but we have location mobile number, initialize with it
        formik.setFieldValue('customerPhone', locationMobileNumber)
        saveDraft({
          customerPhone: locationMobileNumber,
          customerName: '',
          zilla: '',
          upazilla: '',
          deliveryAddress: '',
          comments: '',
          createdAt: Date.now(),
        })
      }
    }
  }, [location.state?.mobileNumber])

  // Save form data to draft when values change
  useEffect(() => {
    const timer = setTimeout(() => {
      if (Object.values(formik.values).some(value => value) && formik.values.customerPhone) {
        saveDraft(formik.values)
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [formik.values])

  if (!shopCart) {
    navigate('/cart')
    return null
  }

  if (shopCart.items.length === 0) {
    return (
      <div className='flex items-center justify-center min-h-screen p-4'>
        <div className='bg-white rounded-lg shadow-md p-8 max-w-md w-full text-center'>
          <h2 className='text-xl font-bold text-gray-800 mb-4'>আপনার কার্টে কোনো পণ্য নেই</h2>
          <p className='text-gray-600 mb-6'>অর্ডার সম্পূর্ণ করতে কার্টে পণ্য যোগ করুন</p>
          <button
            onClick={() => navigate('/categories')}
            className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center justify-center mx-auto'
          >
            <FiChevronLeft className='mr-1' />
            পণ্য ব্রাউজ করুন
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-gray-50 py-4 px-4 sm:px-6'>
      <div className='max-w-6xl mx-auto'>
        <button
          onClick={() => navigate(-1)}
          className='flex items-center text-blue-600 hover:text-blue-800 mb-4 text-sm'
        >
          <FiChevronLeft className='mr-1' />
          কার্টে ফিরে যান
        </button>

        <h1 className='text-2xl font-bold text-gray-900 mb-6'>চেকআউট</h1>

        {/* Mobile shop info */}
        <div className='bg-white rounded-lg shadow-md p-4 mb-6 lg:hidden'>
          <div className='flex items-center gap-3 mb-3'>
            <FiMapPin className='text-blue-600' size={18} />
            <h2 className='text-lg font-medium text-gray-900'>{shopCart.shopName}</h2>
          </div>

          {shopCart.shopLocation && (
            <div className='flex items-start gap-3 text-sm text-gray-700 mb-3'>
              <FiMapPin className='text-gray-500 mt-0.5 flex-shrink-0' size={14} />
              <p>{shopCart.shopLocation}</p>
            </div>
          )}

          <div className='flex flex-wrap gap-4 text-sm'>
            {shopCart.deliveryChargeInside && (
              <div className='flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-full'>
                <span className='text-blue-700 font-medium'>
                  {' '}
                  {shopCart?.shopLocation} এর ভিতরে:{' '}
                </span>
                <span className='text-blue-800 font-semibold'>
                  ৳{shopCart.deliveryChargeInside.toLocaleString('bn-BD')}
                </span>
              </div>
            )}

            {shopCart.deliveryChargeOutside && (
              <div className='flex items-center gap-1 bg-green-50 px-3 py-1.5 rounded-full'>
                <span className='text-green-700 font-medium'>
                  {' '}
                  {shopCart?.shopLocation} এর বাইরে:
                </span>
                <span className='text-green-800 font-semibold'>
                  ৳{shopCart.deliveryChargeOutside.toLocaleString('bn-BD')}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Mobile order summary */}
        <div className='lg:hidden bg-white rounded-lg shadow-md p-4 mb-6'>
          <h2 className='text-lg font-medium text-gray-900 mb-3'>আপনার অর্ডার</h2>
          <div className='border-b pb-3 mb-3'>
            {shopCart.items.map(item => (
              <div key={item.cartItemId} className='flex items-start py-2'>
                <div className='h-14 w-14 flex-shrink-0 overflow-hidden rounded-md border border-gray-200'>
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className='h-full w-full object-cover object-center'
                    onError={e => {
                      ;(e.target as HTMLImageElement).src = '/placeholder-product.jpg'
                    }}
                  />
                </div>
                <div className='ml-3 flex-1'>
                  <div className='flex justify-between'>
                    <h6 className='text-sm font-medium'>{item.name}</h6>
                    <p className='text-sm font-medium'>
                      ৳{(item.sellingPrice * item.quantity).toLocaleString('bn-BD')}
                    </p>
                  </div>
                  <p className='text-xs text-gray-500'>
                    পরিমাণ: {item.quantity} × ৳{item.sellingPrice.toLocaleString('bn-BD')}
                  </p>
                  {Object.entries(item.selectedOptions).length > 0 && (
                    <div className='mt-1 text-xs text-gray-500'>
                      {Object.entries(item.selectedOptions).map(([key, value]) => (
                        <p key={key}>
                          {key}: {value}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className='space-y-2 text-sm'>
            <div className='flex justify-between'>
              <span className='text-gray-600'>মোট পণ্য:</span>
              <span className='text-gray-900'>{totalItems} টি</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-gray-600'>পণ্যের মূল্য:</span>
              <span className='text-gray-900'>৳{subtotal.toLocaleString('bn-BD')}</span>
            </div>

            {!!deliveryCharge && (
              <div className='flex justify-between font-medium text-lg mt-2'>
                <span className='text-gray-800'>ডেলিভারি চার্জ:</span>
                <span className='text-blue-600'>৳{deliveryCharge.toLocaleString('bn-BD')}</span>
              </div>
            )}
          </div>
        </div>

        {/* Main grid */}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          {/* Customer form */}
          <div className='lg:col-span-2 bg-white rounded-lg shadow-md overflow-hidden'>
            <div className='bg-gradient-to-r from-blue-600 to-blue-700 p-4 text-white'>
              <h2 className='text-lg font-bold'>কাস্টমার তথ্য</h2>
              <p className='text-blue-100 mt-1 text-xs'>
                অর্ডার সম্পূর্ণ করতে কাস্টমারের তথ্য প্রদান করুন
              </p>
            </div>

            <div className='p-4'>
              <form onSubmit={formik.handleSubmit} className='space-y-4'>
                {/* Customer phone */}
                <div>
                  <label className='text-sm font-medium text-gray-700 mb-1 flex items-center gap-1'>
                    <FiPhone size={14} />
                    কাস্টমারের মোবাইল নং*
                  </label>
                  <div className='flex gap-2 items-center'>
                    <input
                      type='text'
                      className={`w-full px-3 py-2 border rounded-lg text-sm ${
                        formik.touched.customerPhone && formik.errors.customerPhone
                          ? 'border-red-500'
                          : 'border-gray-300'
                      }`}
                      {...formik.getFieldProps('customerPhone')}
                      placeholder='01XXXXXXXXX'
                      readOnly={!!location.state?.mobileNumber}
                    />
                    {checkingCustomer && (
                      <div className='animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500'></div>
                    )}
                  </div>
                  {formik.touched.customerPhone && formik.errors.customerPhone && (
                    <p className='text-red-500 text-xs mt-1'>
                      {formik.errors.customerPhone as string}
                    </p>
                  )}

                  {/* OTP Section for new customers - Only show if OTP sent and no customer exists */}
                  {otpSent && !customer && (
                    <div className='mt-3 p-3 bg-blue-50 rounded-lg'>
                      <p className='text-sm text-blue-800 mb-2'>
                        আপনার ফোনে 6 ডিজিটের ওটিপি পাঠানো হয়েছে
                      </p>
                      <div className='flex gap-2'>
                        <input
                          type='text'
                          value={otp}
                          onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          placeholder='Enter OTP'
                          className='flex-1 px-3 py-2 border border-gray-300 rounded text-sm'
                          maxLength={6}
                        />
                        <button
                          type='button'
                          onClick={verifyOtpAndCreateCustomer}
                          disabled={verifyingOtp || otp.length !== 6}
                          className='px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 text-sm'
                        >
                          {verifyingOtp ? 'Verifying...' : 'Verify'}
                        </button>
                      </div>
                      {verifyingOtpError && (
                        <p className='text-red-500 text-xs mt-1'>{verifyingOtpError}</p>
                      )}
                      <p className='text-xs text-gray-600 mt-2'>
                        OTP না পেলে {otpCooldown > 0 ? `${otpCooldown} সেকেন্ড পরে` : 'আবার'}{' '}
                        রিকোয়েস্ট করুন
                      </p>
                    </div>
                  )}

                  {/* Customer verification status */}
                  {customer && (
                    <div className='mt-2 p-2 bg-green-50 border border-green-200 rounded'>
                      <p className='text-sm text-green-700'>✓ ফোন নম্বর ভেরিফাইড</p>
                    </div>
                  )}

                  {/* Send OTP button for new customers */}
                  {!customer && formik.values.customerPhone.length === 11 && !otpSent && (
                    <button
                      type='button'
                      onClick={handleSendOtp}
                      disabled={sendingOtp}
                      className='mt-2 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50'
                    >
                      {sendingOtp ? 'Sending...' : 'Send OTP'}
                    </button>
                  )}
                </div>

                <div>
                  <label className='text-sm font-medium text-gray-700 mb-1 flex items-center gap-1'>
                    <FiUser size={14} />
                    কাস্টমারের নাম*
                  </label>
                  <input
                    type='text'
                    className={`w-full px-3 py-2 border rounded-lg text-sm ${
                      formik.touched.customerName && formik.errors.customerName
                        ? 'border-red-500'
                        : 'border-gray-300'
                    }`}
                    {...formik.getFieldProps('customerName')}
                  />
                  {formik.touched.customerName && formik.errors.customerName && (
                    <p className='text-red-500 text-xs mt-1'>{formik.errors.customerName}</p>
                  )}
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                  <div>
                    <label className='text-sm font-medium text-gray-700 mb-1 flex items-center gap-1'>
                      <FiMapPin size={14} />
                      জেলা*
                    </label>
                    <select
                      className={`w-full px-3 py-2 border rounded-lg text-sm ${
                        formik.touched.zilla && formik.errors.zilla
                          ? 'border-red-500'
                          : 'border-gray-300'
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

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      থানা/এলাকা*
                    </label>
                    <select
                      className={`w-full px-3 py-2 border rounded-lg text-sm ${
                        formik.touched.upazilla && formik.errors.upazilla
                          ? 'border-red-500'
                          : 'border-gray-300'
                      }`}
                      {...formik.getFieldProps('upazilla')}
                      disabled={!formik.values.zilla}
                    >
                      <option value=''>থানা/এলাকা নির্বাচন করুন</option>
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
                </div>

                <div>
                  <label className='text-sm font-medium text-gray-700 mb-1 flex items-center gap-1'>
                    <FiEdit2 size={14} />
                    ডেলিভারির ঠিকানা*
                  </label>
                  <textarea
                    rows={6}
                    className={`w-full px-3 py-2 border rounded-lg text-sm ${
                      formik.touched.deliveryAddress && formik.errors.deliveryAddress
                        ? 'border-red-500'
                        : 'border-gray-300'
                    }`}
                    {...formik.getFieldProps('deliveryAddress')}
                  />
                  {formik.touched.deliveryAddress && formik.errors.deliveryAddress && (
                    <p className='text-red-500 text-xs mt-1'>{formik.errors.deliveryAddress}</p>
                  )}
                  <p className='text-gray-500 text-xs mt-1'>
                    শুধুমাত্র ঠিকানা লিখুন, কাস্টমার এর নাম বা মোবাইল নং দেয়া যাবে না।
                  </p>
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    কমেন্টস (অপশনাল)
                  </label>
                  <textarea
                    rows={5}
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg text-sm'
                    {...formik.getFieldProps('comments')}
                    placeholder='অর্ডার সম্পর্কে কোন অতিরিক্ত নির্দেশিকা থাকলে লিখুন'
                  />
                </div>

                {formErrors.length > 0 && (
                  <div className='mb-4 p-3 bg-red-50 border border-red-200 rounded-lg'>
                    {formErrors.map((error, index) => (
                      <p key={index} className='text-red-600 text-sm'>
                        {error}
                      </p>
                    ))}
                  </div>
                )}

                <div className='pt-3'>
                  <button
                    type='submit'
                    disabled={isSubmitting || !customer}
                    className='w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center'
                  >
                    {isSubmitting ? (
                      <>
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
                      </>
                    ) : (
                      'অর্ডার কনফার্ম করুন'
                    )}
                  </button>
                  {!customer && formik.values.customerPhone.length === 11 && (
                    <p className='text-red-500 text-sm mt-2 text-center'>
                      অর্ডার সম্পূর্ণ করতে ফোন নম্বর ভেরিফাই করুন
                    </p>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* Desktop order summary */}
          <div className='hidden lg:block lg:col-span-1'>
            <div className='bg-white rounded-lg shadow-md p-4 sticky top-4'>
              <h2 className='text-lg font-medium text-gray-900 mb-3'>আপনার অর্ডার</h2>

              <div className='border-b pb-3 mb-3'>
                {shopCart.items.map(item => (
                  <div key={item.cartItemId} className='flex items-start py-2'>
                    <div className='h-14 w-14 flex-shrink-0 overflow-hidden rounded-md border border-gray-200'>
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className='h-full w-full object-cover object-center'
                        onError={e => {
                          ;(e.target as HTMLImageElement).src = '/placeholder-product.jpg'
                        }}
                      />
                    </div>

                    <div className='ml-3 flex-1'>
                      <div className='flex justify-between'>
                        <h3 className='text-sm font-medium'>{item.name}</h3>
                        <p className='text-sm font-medium'>
                          ৳{(item.sellingPrice * item.quantity).toLocaleString('bn-BD')}
                        </p>
                      </div>
                      <p className='mt-1 text-xs text-gray-500'>
                        পরিমাণ: {item.quantity} × ৳{item.sellingPrice.toLocaleString('bn-BD')}
                      </p>
                      {Object.entries(item.selectedOptions).length > 0 && (
                        <div className='mt-1 text-xs text-gray-500'>
                          {Object.entries(item.selectedOptions).map(([key, value]) => (
                            <p key={key}>
                              {key}: {value}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className='space-y-2 text-sm'>
                <div className='flex justify-between'>
                  <span className='text-gray-600'>মোট পণ্য:</span>
                  <span className='text-gray-900'>{totalItems} টি</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-600'>পণ্যের মূল্য:</span>
                  <span className='text-gray-900'>৳{subtotal.toLocaleString('bn-BD')}</span>
                </div>
                {!!deliveryCharge && (
                  <div className='flex justify-between'>
                    <span className='text-gray-600'>ডেলিভারি চার্জ:</span>
                    <span className='text-gray-900'>
                      ৳{deliveryCharge?.toLocaleString('bn-BD')}
                    </span>
                  </div>
                )}
              </div>

              <div className='mt-4 pt-4 border-t'>
                <div className='flex items-center gap-2 mb-3'>
                  <FiMapPin className='text-blue-600' size={16} />
                  <h3 className='text-sm font-semibold text-gray-800'>{shopCart.shopName}</h3>
                </div>

                <div className='space-y-2 text-sm'>
                  {shopCart.shopLocation && (
                    <div className='flex items-start gap-2 text-gray-600'>
                      <FiMapPin className='text-gray-400 mt-0.5 flex-shrink-0' size={14} />
                      <p>{shopCart.shopLocation}</p>
                    </div>
                  )}

                  <div className='flex flex-wrap gap-2 mt-2'>
                    {shopCart.deliveryChargeInside && (
                      <div className='flex items-center gap-1 bg-blue-50/70 px-2.5 py-1 rounded-md'>
                        <span className='text-blue-700'> {shopCart?.shopLocation} এর ভিতরে: </span>
                        <span className='text-blue-800 font-medium'>
                          ৳{shopCart.deliveryChargeInside.toLocaleString('bn-BD')}
                        </span>
                      </div>
                    )}

                    {shopCart.deliveryChargeOutside && (
                      <div className='flex items-center gap-1 bg-amber-50/70 px-2.5 py-1 rounded-md'>
                        <span className='text-amber-700'> {shopCart?.shopLocation} এর বাইরে:</span>
                        <span className='text-amber-800 font-medium'>
                          ৳{shopCart.deliveryChargeOutside.toLocaleString('bn-BD')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedOrder && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-start sm:items-center justify-center p-0 sm:p-4 z-50 overflow-y-auto mt-16'>
          <div className='bg-white sm:rounded-lg shadow-xl w-full max-w-md min-h-screen sm:min-h-0 sm:max-h-[90vh] overflow-hidden flex flex-col sm:my-4'>
            {/* Header */}
            <div className='p-4 border-b flex-shrink-0 bg-green-50'>
              <div className='flex items-center justify-between'>
                <h2 className='text-lg font-medium text-green-600'>পেমেন্ট সম্পূর্ণ করুন</h2>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className='p-1 hover:bg-green-100 rounded-full transition-colors'
                >
                  <svg
                    className='w-5 h-5 text-gray-500'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M6 18L18 6M6 6l12 12'
                    />
                  </svg>
                </button>
              </div>
              <p className='text-sm text-gray-600 mt-1'>অর্ডার #{selectedOrder.orderId}</p>
            </div>

            {/* Scrollable Content */}
            <div className='flex-1 overflow-y-auto p-4 space-y-4'>
              {/* Warning Alert */}
              <div className='bg-yellow-50 border-l-4 border-yellow-400 p-3'>
                <div className='flex'>
                  <div className='flex-shrink-0'>
                    <svg
                      className='w-5 h-5 text-yellow-400'
                      fill='currentColor'
                      viewBox='0 0 20 20'
                    >
                      <path
                        fillRule='evenodd'
                        d='M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z'
                        clipRule='evenodd'
                      />
                    </svg>
                  </div>
                  <div className='ml-3'>
                    <p className='text-sm text-yellow-700 font-medium'>সতর্কতা</p>
                    <p className='text-sm text-yellow-600'>
                      ভুল পেমেন্ট তথ্য দিলে অর্ডার রিজেক্ট করা হবে।
                    </p>
                  </div>
                </div>
              </div>

              {/* Payment Amount */}
              <div className='bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border'>
                <div className='flex justify-between items-center'>
                  <span className='text-base font-medium text-gray-700'>পেমেন্ট পরিমাণ:</span>
                  <span className='text-xl font-bold text-green-600'>
                    ৳{selectedOrder.deliveryCharge.toLocaleString('bn-BD')}
                  </span>
                </div>
              </div>

              {/* System Wallet Selection */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  পেমেন্ট মাধ্যম নির্বাচন করুন *
                </label>
                <select
                  className='w-full px-3 py-3 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white'
                  value={selectedSystemWallet?.walletId || ''}
                  onChange={e => {
                    const walletId = parseInt(e.target.value)
                    const wallet = systemWallets.find(w => w.walletId === walletId)
                    setSelectedSystemWallet(wallet || null)
                  }}
                  required
                >
                  <option value=''>একটি ওয়ালেট নির্বাচন করুন</option>
                  {systemWallets.map(wallet => (
                    <option key={wallet.walletId} value={wallet.walletId}>
                      {wallet.walletName} - {wallet.walletPhoneNo}
                    </option>
                  ))}
                </select>
              </div>

              {/* Selected Wallet Info */}
              {selectedSystemWallet && (
                <div className='bg-blue-50 border border-blue-200 rounded-lg p-3'>
                  <h4 className='text-sm font-medium text-blue-800 mb-1'>নির্বাচিত ওয়ালেট:</h4>
                  <p className='text-blue-700 font-medium'>{selectedSystemWallet.walletName}</p>
                  <p className='text-blue-600 text-sm'>{selectedSystemWallet.walletPhoneNo}</p>
                </div>
              )}

              {/* Customer Wallet Number */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  আপনার ওয়ালেট নম্বর *
                </label>
                <input
                  type='tel'
                  className='w-full px-3 py-3 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent'
                  placeholder='যে নম্বর থেকে পেমেন্ট করেছেন সেটি লিখুন'
                  value={customerWalletNumber}
                  onChange={e =>
                    setCustomerWalletNumber(e.target.value.replace(/\D/g, '').slice(0, 11))
                  }
                  maxLength={11}
                  required
                />
              </div>

              {/* Transaction ID */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  ট্রানজেকশন আইডি *
                </label>
                <input
                  type='text'
                  className='w-full px-3 py-3 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent'
                  placeholder='ট্রানজেকশন আইডি লিখুন'
                  value={transactionId}
                  onChange={e => setTransactionId(e.target.value.trim())}
                  required
                />
              </div>

              {/* Payment Instructions */}
              <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
                <h4 className='text-base font-medium text-blue-800 mb-3 flex items-center'>
                  <svg className='w-5 h-5 mr-2' fill='currentColor' viewBox='0 0 20 20'>
                    <path
                      fillRule='evenodd'
                      d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z'
                      clipRule='evenodd'
                    />
                  </svg>
                  পেমেন্ট নির্দেশনা
                </h4>
                <div className='space-y-2 text-sm text-blue-700'>
                  <div className='flex items-start'>
                    <span className='flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full text-xs flex items-center justify-center mr-3 mt-0.5'>
                      1
                    </span>
                    <p>
                      উপরের নির্বাচিত ওয়ালেট নম্বরে{' '}
                      <strong>৳{selectedOrder.deliveryCharge}</strong> টাকা সেন্ড মানি করুন
                    </p>
                  </div>
                  <div className='flex items-start'>
                    <span className='flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full text-xs flex items-center justify-center mr-3 mt-0.5'>
                      2
                    </span>
                    <p>পেমেন্ট সম্পূর্ণ হওয়ার পর ট্রানজেকশন আইডি সংগ্রহ করুন</p>
                  </div>
                  <div className='flex items-start'>
                    <span className='flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full text-xs flex items-center justify-center mr-3 mt-0.5'>
                      3
                    </span>
                    <p>সকল তথ্য সঠিকভাবে পূরণ করে নিচের বাটনে ক্লিক করুন</p>
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className='bg-red-50 border border-red-200 rounded-lg p-3'>
                  <div className='flex'>
                    <svg
                      className='w-5 h-5 text-red-400 flex-shrink-0'
                      fill='currentColor'
                      viewBox='0 0 20 20'
                    >
                      <path
                        fillRule='evenodd'
                        d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'
                        clipRule='evenodd'
                      />
                    </svg>
                    <div className='ml-3'>
                      <p className='text-sm font-medium text-red-800'>পেমেন্ট ত্রুটি</p>
                      <p className='text-sm text-red-700'>{error}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className='p-4 border-t bg-gray-50 flex-shrink-0 space-y-3'>
              <button
                onClick={handlePayment}
                disabled={
                  !selectedSystemWallet ||
                  !customerWalletNumber ||
                  !transactionId ||
                  customerWalletNumber.length !== 11
                }
                className='w-full px-4 py-3 text-base bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center'
              >
                <svg className='w-5 h-5 mr-2' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M5 13l4 4L19 7'
                  />
                </svg>
                পেমেন্ট কনফার্ম করুন
              </button>

              <button
                onClick={() => setShowPaymentModal(false)}
                className='w-full px-4 py-2 text-base border border-gray-300 text-gray-700 bg-white rounded-lg font-medium hover:bg-gray-50 transition-colors'
              >
                বাতিল
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CustomerCheckout
