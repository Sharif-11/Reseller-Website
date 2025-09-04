import { useFormik } from 'formik'
import { useEffect, useState } from 'react'
import { FiChevronLeft, FiEdit2, FiMapPin, FiPhone, FiUser } from 'react-icons/fi'
import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import * as Yup from 'yup'
import districts from '../../public/zillasInfo.json'
import { orderApi } from '../Api/order.api'
import { walletApi } from '../Api/wallet.api'
import { useCartFavorite } from '../Context/cartContext'
import { useAuth } from '../Hooks/useAuth'
import { OrderData } from '../types/order.types'
import { SimplifiedResult } from '../utils/customer.reliability'
import { CART_ITEMS_KEY, DRAFT_KEY } from '../utils/utils.variables'
import { ShopCart } from './Cart'
import CourierReliabilityModal from './CourierReliabilityModal'
import { CartItem } from './ProductDetail'

// Draft data interface
// Draft data interface
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
  sellerVerified: boolean
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

const Checkout = () => {
  const location = useLocation()
  const { user, reloadUser } = useAuth()
  const navigate = useNavigate()
  const [upazillas, setUpazillas] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formErrors, setFormErrors] = useState<string[]>([])
  const { loadCartCount } = useCartFavorite()
  const [showReliabilityModal, setShowReliabilityModal] = useState(false)
  const [reliabilityMetrics, setReliabilityMetrics] = useState<SimplifiedResult | null>(null)
  const [isCheckingReliability] = useState(false)

  // Payment modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<OrderResponse | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<'BALANCE' | 'WALLET'>('BALANCE')
  const [transactionId, setTransactionId] = useState('')
  const [sellerWalletPhoneNo, setSellerWalletPhoneNo] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [savedWallets, setSavedWallets] = useState<{ walletName: string; walletPhoneNo: string }[]>(
    []
  )
  const [systemWallets, setSystemWallets] = useState<
    { walletId: number; walletName: string; walletPhoneNo: string }[]
  >([])
  const [selectedSystemWallet, setSelectedSystemWallet] = useState<{
    walletId: number
    walletName: string
    walletPhoneNo: string
  } | null>(null)
  const [walletLoading, setWalletLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState<{
    type: 'payment' | 'confirm' | '' | null
    id: string | null | number | ''
  }>({ type: '', id: '' })
  const [error, setError] = useState('')

  // Cart items and price calculation
  const shopCart = location?.state?.shopCart as ShopCart
  const totalDeliveryChargeInside = location?.state?.totalDeliveryChargeInside || 0
  const totalDeliveryChargeOutside = location?.state?.totalDeliveryChargeOutside || 0
  const totalItems = shopCart?.items.reduce((sum, item) => sum + item.quantity, 0)
  const subtotal = shopCart?.items.reduce((sum, item) => sum + item.sellingPrice * item.quantity, 0)
  const totalCommission = shopCart?.items.reduce(
    (sum, item) => sum + (item.sellingPrice - item.basePrice) * item.quantity,
    0
  )

  // Form validation schema
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
  const getDraftKey = (phone: string) => `${DRAFT_KEY}_${phone}`

  // Load draft data from localStorage
  // Load draft data from localStorage for specific customer
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

  // Handle district change
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

  const submitOrder = async (values: any) => {
    setIsSubmitting(true)
    try {
      const orderData: OrderData = {
        shopId: shopCart?.shopId,
        customerName: values.customerName,
        customerPhoneNo: values.customerPhone,
        customerZilla: values.zilla,
        customerUpazilla: values.upazilla,
        deliveryAddress: values.deliveryAddress,
        comments: values.comments,
        products: shopCart?.items.map(item => ({
          id: item.productId,
          imageUrl: item.imageUrl,
          imageId: item.imageId,
          quantity: item.quantity,
          sellingPrice: item.sellingPrice,
          selectedVariants: item.selectedOptions,
        })),
      }

      const { success, message, data } = await orderApi.createSellerOrder(orderData as OrderData)
      if (success && data) {
        clearDraft(values.customerPhone)
        const cartItems: CartItem[] = JSON.parse(localStorage.getItem(CART_ITEMS_KEY) || '[]')
        const updatedCartItems = cartItems.filter(
          (item: CartItem) => item.shopId !== shopCart?.shopId
        )
        localStorage.setItem(CART_ITEMS_KEY, JSON.stringify(updatedCartItems))
        loadCartCount()

        // Set the created order and show payment modal
        fetchSellersWallets()
        fetchSystemWallets()
        setSelectedOrder(data)
        setShowPaymentModal(true)
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

  // Handle modal confirmation
  const handleReliabilityConfirm = () => {
    setShowReliabilityModal(false)
    formik.handleSubmit()
  }

  // Handle modal close
  const handleReliabilityClose = () => {
    setShowReliabilityModal(false)
    setReliabilityMetrics(null)
  }

  // Payment modal handlers
  const handlePayment = async () => {
    if (!selectedOrder) return

    try {
      setActionLoading({ type: 'payment', id: selectedOrder.orderId })
      setError('')

      const paymentData = {
        orderId: selectedOrder.orderId,
        paymentMethod,
        ...(paymentMethod === 'WALLET' && {
          sellerWalletPhoneNo,
          systemWalletPhoneNo: selectedSystemWallet?.walletPhoneNo,
          transactionId,
          sellerWalletName: selectedSystemWallet?.walletName || '',
          amount: selectedOrder.deliveryCharge || 0,
        }),
      }

      const response = await orderApi.orderPaymentBySeller(paymentData)
      // await reloadUser() // Reload user data after payment

      if (response.success) {
        toast.success('পেমেন্ট সফল হয়েছে')
        setShowPaymentModal(false)
        resetPaymentForm()
        reloadUser()
        navigate('/orders', {
          state: { tab: paymentMethod === 'BALANCE' ? 'confirmed' : 'pending' },
        })
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

  const handleConfirmOrder = async (orderId: number) => {
    try {
      setActionLoading({ type: 'confirm', id: orderId })

      const response = await orderApi.confirmOrderBySeller(orderId)
      if (response.success) {
        setShowPaymentModal(false)
        resetPaymentForm()
        navigate('/orders', { state: { tab: 'confirmed' } })
      } else {
        setError(response.message || 'অর্ডার নিশ্চিত করতে ব্যর্থ হয়েছে')
      }
    } catch (error) {
      setError('একটি ত্রুটি ঘটেছে')
      console.error('Error confirming order:', error)
    } finally {
      setActionLoading({ type: null, id: null })
    }
  }

  const resetPaymentForm = () => {
    setPaymentMethod('BALANCE')
    setTransactionId('')
    setSellerWalletPhoneNo('')
    setSelectedSystemWallet(null)
    setError('')
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
  const fetchSellersWallets = async () => {
    try {
      setWalletLoading(true)
      const response = await walletApi.getWalletsOfASeller(user?.phoneNo!)
      if (response.success) {
        setSavedWallets(response.data)
      } else {
        toast.error(response.message || 'ওয়ালেট লোড করতে সমস্যা হয়েছে')
      }
    } catch (error) {
      toast.error('ওয়ালেট লোড করতে সমস্যা হয়েছে')
      console.error('Error fetching sellers wallets:', error)
    } finally {
      setWalletLoading(false)
    }
  }

  // Save form data to draft when values change
  // Save form data to draft when values change
  useEffect(() => {
    const timer = setTimeout(() => {
      if (Object.values(formik.values).some(value => value) && formik.values.customerPhone) {
        saveDraft(formik.values)
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [formik.values])

  // Load draft data on component mount
  // Load draft data on component mount
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

  // Redirect if no shop cart
  if (!shopCart) {
    navigate('/cart')
    return null
  }

  // Empty cart handling
  if (shopCart?.items.length === 0) {
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
  useEffect(() => {
    reloadUser()
  }, [showPaymentModal])
  console.log('state', location?.state)

  return (
    <div className='min-h-screen bg-gray-50 py-4 px-4 sm:px-6'>
      <div className='max-w-6xl mx-auto'>
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className='flex items-center text-blue-600 hover:text-blue-800 mb-4 text-sm'
        >
          <FiChevronLeft className='mr-1' />
          কার্টে ফিরে যান
        </button>

        <h1 className='text-2xl font-bold text-gray-900 mb-6'>চেকআউট</h1>

        {/* Shop information */}
        <div className='bg-white rounded-lg shadow-md p-4 mb-6 lg:hidden'>
          <div className='flex items-center gap-3 mb-3'>
            <FiMapPin className='text-blue-600' size={18} />
            <h2 className='text-lg font-medium text-gray-900'>{shopCart?.shopName}</h2>
          </div>

          {shopCart?.shopLocation && (
            <div className='flex items-start gap-3 text-sm text-gray-700 mb-3'>
              <FiMapPin className='text-gray-500 mt-0.5 flex-shrink-0' size={14} />
              <p>{shopCart?.shopLocation}</p>
            </div>
          )}

          <div className='flex flex-wrap gap-4 text-sm'>
            {shopCart?.deliveryChargeInside && (
              <div className='flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-full'>
                <span className='text-blue-700 font-medium'>
                  {shopCart?.shopLocation} এর ভিতরে:{' '}
                  {totalDeliveryChargeInside.toLocaleString('bn-BD')} ৳
                </span>
              </div>
            )}

            {shopCart?.deliveryChargeOutside && (
              <div className='flex items-center gap-1 bg-green-50 px-3 py-1.5 rounded-full'>
                <span className='text-green-700 font-medium'>
                  {shopCart?.shopLocation} এর বাইরে:
                </span>
                <span className='text-green-800 font-semibold'>
                  {totalDeliveryChargeOutside.toLocaleString('bn-BD')}৳
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Mobile order summary */}
        <div className='lg:hidden bg-white rounded-lg shadow-md p-4 mb-6'>
          <h2 className='text-lg font-medium text-gray-900 mb-3'>আপনার অর্ডার</h2>
          <div className='border-b pb-3 mb-3'>
            {shopCart?.items.map(item => (
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
                  <p className='text-xs text-green-600'>
                    কমিশন: ৳
                    {((item.sellingPrice - item.basePrice) * item.quantity).toLocaleString('bn-BD')}
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
              <span className='text-gray-900'>৳{subtotal?.toLocaleString('bn-BD')}</span>
            </div>
            <div className='flex justify-between text-green-600'>
              <span className='text-gray-600'>মোট কমিশন:</span>
              <span className='font-medium'>৳{totalCommission?.toLocaleString('bn-BD')}</span>
            </div>
          </div>
        </div>

        {/* Main grid */}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          {/* Customer information form */}
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
                {/* Customer phone */}
                <div>
                  <label className='text-sm font-medium text-gray-700 mb-1 flex items-center gap-1'>
                    <FiPhone size={14} />
                    কাস্টমারের মোবাইল নং*
                  </label>
                  <input
                    type='text'
                    className={`w-full px-3 py-2 border rounded-lg text-sm ${
                      formik.touched.customerPhone && formik.errors.customerPhone
                        ? 'border-red-500'
                        : 'border-gray-300'
                    }`}
                    {...formik.getFieldProps('customerPhone')}
                    placeholder='01XXXXXXXXX'
                    readOnly // Add this attribute
                  />
                  {formik.touched.customerPhone && formik.errors.customerPhone && (
                    <p className='text-red-500 text-xs mt-1'>
                      {formik.errors.customerPhone?.toString()}
                    </p>
                  )}
                </div>

                {/* Customer name */}
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

                {/* District and upazilla */}
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

                {/* Delivery address */}
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

                {/* Comments */}
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
                {/* Submit button */}
                <button
                  type='submit'
                  disabled={isSubmitting || isCheckingReliability}
                  className='w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center'
                >
                  {isCheckingReliability ? (
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
                      নির্ভরযোগ্যতা যাচাই...
                    </>
                  ) : isSubmitting ? (
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
              </form>
            </div>
          </div>

          {/* Desktop order summary */}
          <div className='hidden lg:block lg:col-span-1'>
            <div className='bg-white rounded-lg shadow-md p-4 sticky top-4'>
              <h2 className='text-lg font-medium text-gray-900 mb-3'>আপনার অর্ডার</h2>

              <div className='border-b pb-3 mb-3'>
                {shopCart?.items.map(item => (
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
                      <p className='text-xs text-green-600'>
                        কমিশন: ৳
                        {((item.sellingPrice - item.basePrice) * item.quantity).toLocaleString(
                          'bn-BD'
                        )}
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
                <div className='flex justify-between text-green-600'>
                  <span className='text-gray-600'>মোট কমিশন:</span>
                  <span className='font-medium'>৳{totalCommission.toLocaleString('bn-BD')}</span>
                </div>
              </div>

              {/* Shop information */}
              <div className='mt-4 pt-4 border-t'>
                <div className='flex items-center gap-2 mb-3'>
                  <FiMapPin className='text-blue-600' size={16} />
                  <h3 className='text-sm font-semibold text-gray-800'>{shopCart?.shopName}</h3>
                </div>

                <div className='space-y-2 text-sm'>
                  {shopCart?.shopLocation && (
                    <div className='flex items-start gap-2 text-gray-600'>
                      <FiMapPin className='text-gray-400 mt-0.5 flex-shrink-0' size={14} />
                      <p>{shopCart?.shopLocation}</p>
                    </div>
                  )}

                  <div className='flex flex-wrap gap-2 mt-2'>
                    {shopCart?.deliveryChargeInside && (
                      <div className='flex items-center gap-1 bg-blue-50/70 px-2.5 py-1 rounded-md'>
                        <span className='text-blue-700'>{shopCart?.shopLocation} এর ভিতরে:</span>
                        <span className='text-blue-800 font-medium'>
                          ৳{totalDeliveryChargeInside.toLocaleString('bn-BD')}
                        </span>
                      </div>
                    )}

                    {shopCart?.deliveryChargeOutside && (
                      <div className='flex items-center gap-1 bg-amber-50/70 px-2.5 py-1 rounded-md'>
                        <span className='text-amber-700'>{shopCart?.shopLocation} এর বাইরে:</span>
                        <span className='text-amber-800 font-medium'>
                          ৳{totalDeliveryChargeOutside.toLocaleString('bn-BD')}
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

      {/* Reliability Modal */}
      {reliabilityMetrics && (
        <CourierReliabilityModal
          isOpen={showReliabilityModal}
          onClose={handleReliabilityClose}
          reliabilityData={reliabilityMetrics}
          onConfirm={handleReliabilityConfirm}
          isLoading={isSubmitting}
        />
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedOrder && (
        <div className='fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto mt-8'>
          <div className='min-h-screen py-4 px-4 mt-4 flex items-start justify-center'>
            <div className='bg-white rounded-lg shadow-xl w-full max-w-md my-4 flex flex-col'>
              {/* Header */}
              <div className='p-4 border-b flex-shrink-0 bg-gradient-to-r from-green-50 to-blue-50'>
                <div className='flex items-center justify-between'>
                  <div>
                    <h2 className='text-lg font-medium text-green-600'>
                      {selectedOrder.sellerVerified ? 'অর্ডার কনফার্মেশন' : 'অর্ডার পেমেন্ট'}
                    </h2>
                    <p className='text-sm text-gray-600'>অর্ডার #{selectedOrder.orderId}</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowPaymentModal(false)
                      resetPaymentForm()
                    }}
                    className='p-2 hover:bg-white/50 rounded-full transition-colors'
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
              </div>

              {/* Scrollable Content */}
              <div className='p-4 space-y-4'>
                {/* Verified Seller Notice */}
                {selectedOrder.sellerVerified ? (
                  <div className='bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg'>
                    <div className='flex items-start'>
                      <div className='ml-3'>
                        <p className='text-sm text-blue-700 mt-1'>
                          আপনি একজন ভেরিফাইড বিক্রেতা, পেমেন্ট ছাড়াই অর্ডার কনফার্ম করতে পারেন
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className='bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg'>
                    <div className='flex items-start'>
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
                        <h4 className='text-sm font-medium text-yellow-800'>সতর্কতা</h4>
                        <p className='text-sm text-yellow-700 mt-1'>
                          ভুল পেমেন্ট তথ্য দিলে অর্ডার রিজেক্ট করা হবে এবং আপনাকে ব্লক করা হবে।
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Delivery Charge */}
                <div className='bg-gradient-to-r from-gray-50 to-green-50 p-4 rounded-lg border'>
                  <div className='flex justify-between items-center'>
                    <div className='flex items-center gap-2'>
                      <span className='text-base font-medium'>ডেলিভারি চার্জ:</span>
                      <div className='group relative'>
                        <span className='text-gray-400 cursor-help text-sm'>ℹ</span>
                        <div className='absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 p-2 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none'>
                          অর্ডার ডেলিভারির জন্য প্রয়োজনীয় চার্জ
                        </div>
                      </div>
                    </div>
                    <span className='text-xl font-bold text-green-600'>
                      {selectedOrder.deliveryCharge}৳
                    </span>
                  </div>
                </div>

                {/* Quick Confirm for Verified Sellers */}
                {selectedOrder.sellerVerified && (
                  <div className='space-y-3'>
                    <button
                      onClick={() => handleConfirmOrder(selectedOrder.orderId)}
                      disabled={
                        actionLoading.type === 'confirm' &&
                        actionLoading.id === selectedOrder.orderId
                      }
                      className='w-full px-4 py-3 text-base bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center justify-center'
                    >
                      {actionLoading.type === 'confirm' &&
                      actionLoading.id === selectedOrder.orderId ? (
                        <>
                          <div className='animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2'></div>
                          প্রক্রিয়াধীন...
                        </>
                      ) : (
                        <>
                          <svg
                            className='w-5 h-5 mr-2'
                            fill='none'
                            stroke='currentColor'
                            viewBox='0 0 24 24'
                          >
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth={2}
                              d='M5 13l4 4L19 7'
                            />
                          </svg>
                          কনফার্ম করুন (পেমেন্ট ছাড়া)
                        </>
                      )}
                    </button>
                    <div className='relative flex items-center'>
                      <div className='flex-grow border-t border-gray-300'></div>
                      <span className='flex-shrink mx-4 text-gray-500 text-sm bg-white px-2'>
                        অথবা
                      </span>
                      <div className='flex-grow border-t border-gray-300'></div>
                    </div>
                  </div>
                )}

                {/* Payment Methods */}
                <div className='space-y-3'>
                  <h3 className='font-medium text-base text-gray-800'>
                    পেমেন্ট মেথড নির্বাচন করুন
                  </h3>
                  <div className='space-y-3'>
                    {/* Balance Payment */}
                    <label
                      className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                        paymentMethod === 'BALANCE'
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300'
                      } ${user?.balance! < +selectedOrder.deliveryCharge ? 'opacity-60' : ''}`}
                    >
                      <input
                        type='radio'
                        className='text-green-600 focus:ring-green-500 flex-shrink-0'
                        name='paymentMethod'
                        value='BALANCE'
                        checked={paymentMethod === 'BALANCE'}
                        onChange={() => setPaymentMethod('BALANCE')}
                        disabled={user?.balance! < +selectedOrder.deliveryCharge}
                      />
                      <div className='ml-3 flex-1'>
                        <div className='flex items-center justify-between'>
                          <span className='text-sm font-medium'>ব্যালেন্স থেকে পেমেন্ট</span>
                          <span className='text-xs text-gray-500'>
                            ব্যালেন্স: {user?.balance || 0}৳
                          </span>
                        </div>
                        {user?.balance! < +selectedOrder.deliveryCharge && (
                          <div className='text-red-500 text-xs mt-1 flex items-center'>
                            <svg className='w-3 h-3 mr-1' fill='currentColor' viewBox='0 0 20 20'>
                              <path
                                fillRule='evenodd'
                                d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z'
                                clipRule='evenodd'
                              />
                            </svg>
                            অপর্যাপ্ত ব্যালেন্স
                          </div>
                        )}
                      </div>
                    </label>

                    {/* Wallet Payment */}
                    <label
                      className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                        paymentMethod === 'WALLET'
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type='radio'
                        className='text-green-600 focus:ring-green-500 flex-shrink-0'
                        name='paymentMethod'
                        value='WALLET'
                        checked={paymentMethod === 'WALLET'}
                        onChange={() => setPaymentMethod('WALLET')}
                      />
                      <div className='ml-3'>
                        <span className='text-sm font-medium'>মোবাইল ওয়ালেট পেমেন্ট</span>
                        <p className='text-xs text-gray-500 mt-1'>bKash, Nagad</p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Wallet Payment Details */}
                {paymentMethod === 'WALLET' && (
                  <div className='space-y-4 border-t pt-4 bg-blue-50/30 p-4 rounded-lg'>
                    <h4 className='font-medium text-sm text-gray-800'>পেমেন্ট বিস্তারিত</h4>

                    {/* System Wallet Selection */}
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        সিস্টেম ওয়ালেট নির্বাচন করুন *
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
                        disabled={walletLoading}
                      >
                        <option value=''>একটি ওয়ালেট নির্বাচন করুন</option>
                        {systemWallets.map(wallet => (
                          <option key={wallet.walletId} value={wallet.walletId}>
                            {wallet.walletName} - {wallet.walletPhoneNo}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Payment Instruction */}
                    {selectedSystemWallet && (
                      <div className='p-4 border-2 border-dashed border-green-300 bg-green-50 rounded-lg'>
                        <div className='text-center'>
                          <p className='text-sm text-green-800 font-medium mb-1'>
                            {selectedSystemWallet.walletName} এ সেন্ড মানি করুন
                          </p>
                          <p className='text-lg font-bold text-green-700'>
                            {selectedSystemWallet.walletPhoneNo}
                          </p>
                          <p className='text-xl font-bold text-green-800 mt-2'>
                            পরিমাণ: {selectedOrder.deliveryCharge}৳
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Sender Wallet Number */}
                    <div className='relative'>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        আপনার {selectedSystemWallet?.walletName || 'ওয়ালেট'} নম্বর *
                      </label>
                      <input
                        type='tel'
                        className='w-full px-3 py-3 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent'
                        placeholder='যে নম্বর থেকে পেমেন্ট করেছেন সেটি লিখুন'
                        value={sellerWalletPhoneNo}
                        onChange={e => {
                          const value = e.target.value.replace(/\D/g, '').slice(0, 11)
                          setSellerWalletPhoneNo(value)
                          setShowSuggestions(value.length > 0)
                        }}
                        maxLength={11}
                        required
                      />
                      {/* Saved Wallets Suggestions */}
                      {showSuggestions && savedWallets.length > 0 && (
                        <div className='absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md py-1 max-h-32 overflow-y-auto border'>
                          {savedWallets
                            .filter(
                              wallet =>
                                wallet.walletPhoneNo.includes(sellerWalletPhoneNo) &&
                                wallet.walletName.toLowerCase() ===
                                  selectedSystemWallet?.walletName?.toLowerCase()
                            )
                            .map((wallet, index) => (
                              <div
                                key={index}
                                className='px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm'
                                onClick={() => {
                                  setSellerWalletPhoneNo(wallet.walletPhoneNo)
                                  setShowSuggestions(false)
                                }}
                              >
                                {wallet.walletName} ({wallet.walletPhoneNo})
                              </div>
                            ))}
                        </div>
                      )}
                    </div>

                    {/* Transaction ID */}
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        ট্রানজেকশন আইডি *
                      </label>
                      <input
                        type='text'
                        className='w-full px-3 py-3 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-xs'
                        placeholder='পেমেন্ট করার পর ট্রানজেকশন আইডি লিখুন'
                        value={transactionId}
                        onChange={e => setTransactionId(e.target.value.trim())}
                        required
                      />
                    </div>
                  </div>
                )}

                {/* Error Display */}
                {error && (
                  <div className='p-4 bg-red-50 border border-red-200 rounded-lg'>
                    <div className='flex  items-center'>
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

                      <p className='text-sm text-red-700 pl-2'>{error}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer Actions */}
              <div className='p-4 bg-gray-50 rounded-b-lg'>
                <div className='space-y-3'>
                  {(!selectedOrder.sellerVerified || paymentMethod) && (
                    <button
                      onClick={handlePayment}
                      disabled={
                        actionLoading.type === 'payment' &&
                        actionLoading.id === selectedOrder.orderId
                      }
                      className='w-full px-4 py-3 text-base bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 transition-all duration-200 flex items-center justify-center'
                    >
                      {actionLoading.type === 'payment' &&
                      actionLoading.id === selectedOrder.orderId ? (
                        <>
                          <div className='animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2'></div>
                          প্রক্রিয়াধীন...
                        </>
                      ) : (
                        <>
                          <svg
                            className='w-5 h-5 mr-2'
                            fill='none'
                            stroke='currentColor'
                            viewBox='0 0 24 24'
                          >
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth={2}
                              d='M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1'
                            />
                          </svg>
                          {paymentMethod === 'BALANCE'
                            ? 'ব্যালেন্স থেকে পেমেন্ট করুন'
                            : paymentMethod === 'WALLET'
                            ? 'ওয়ালেট পেমেন্ট কনফার্ম করুন'
                            : 'পেমেন্ট করুন'}
                        </>
                      )}
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setShowPaymentModal(false)
                      resetPaymentForm()
                    }}
                    className='w-full px-4 py-2 text-base bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors'
                  >
                    বাতিল করুন
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Checkout
