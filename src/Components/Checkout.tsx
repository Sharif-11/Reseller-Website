import { useFormik } from 'formik'
import { useEffect, useState } from 'react'
import { FaCheckCircle, FaHeart, FaShoppingCart, FaStar, FaTruck, FaWallet } from 'react-icons/fa'
import { FiChevronLeft, FiMapPin, FiPhone, FiUser } from 'react-icons/fi'
import { useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import * as Yup from 'yup'
import districtsInEnglish from '../../public/zillaInfoEnglish.json'
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

interface DraftData {
  customerPhone: string
  customerName: string
  zilla: string
  upazilla: string
  deliveryAddress: string
  comments: string
  createdAt: number
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
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<OrderResponse | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<'BALANCE' | 'WALLET'>('BALANCE')
  const [transactionId, setTransactionId] = useState('')
  const [sellerWalletPhoneNo, setSellerWalletPhoneNo] = useState('')
  const [, setShowSuggestions] = useState(false)
  const [, setSavedWallets] = useState<{ walletName: string; walletPhoneNo: string }[]>([])
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

  const shopCart = location?.state?.shopCart as ShopCart
  const totalDeliveryChargeInside = location?.state?.totalDeliveryChargeInside || 0
  const totalDeliveryChargeOutside = location?.state?.totalDeliveryChargeOutside || 0
  const totalItems = shopCart?.items.reduce((sum, item) => sum + item.quantity, 0)
  const subtotal = shopCart?.items.reduce((sum, item) => sum + item.sellingPrice * item.quantity, 0)
  const totalCommission = shopCart?.items.reduce(
    (sum, item) => sum + (item.sellingPrice - item.basePrice) * item.quantity,
    0
  )

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

  const loadDraft = (phone: string): DraftData | null => {
    const oneMonthAgo = Date.now() - 30 * 24 * 60 * 60 * 1000
    const draftKeys = Object.keys(localStorage).filter(key => key.startsWith(DRAFT_KEY))

    draftKeys.forEach(key => {
      try {
        const draft = JSON.parse(localStorage.getItem(key) || '')
        if (draft && draft.createdAt && draft.createdAt < oneMonthAgo) {
          localStorage.removeItem(key)
        }
      } catch (error) {
        localStorage.removeItem(key)
      }
    })

    const draft = localStorage.getItem(getDraftKey(phone))
    if (!draft) return null

    try {
      const parsedDraft = JSON.parse(draft)
      if (parsedDraft.createdAt && parsedDraft.createdAt >= oneMonthAgo) {
        return parsedDraft
      } else {
        localStorage.removeItem(getDraftKey(phone))
        return null
      }
    } catch (error) {
      localStorage.removeItem(getDraftKey(phone))
      return null
    }
  }

  const saveDraft = (data: DraftData) => {
    const draftWithTimestamp = { ...data, createdAt: Date.now() }
    localStorage.setItem(getDraftKey(data.customerPhone), JSON.stringify(draftWithTimestamp))
  }

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

  const handleZillaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedZilla = e.target.value as keyof typeof districts
    formik.setFieldValue('zilla', selectedZilla)
    formik.setFieldValue('upazilla', '')
    setUpazillas(selectedZilla ? districts[selectedZilla] || [] : [])

    if (formik.values.customerPhone) {
      saveDraft({
        ...formik.values,
        zilla: selectedZilla,
        upazilla: '',
        createdAt: Date.now(),
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
        customerZilla:
          districtsInEnglish[values.zilla as keyof typeof districtsInEnglish] || values.zilla,
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
          selectedAddOns: JSON.stringify(
            item.selectedAddOns?.map(addOn => ({
              id: addOn.id,
              name: addOn.name,
              price: addOn.price,
            })) || []
          ),
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

  const handleReliabilityConfirm = () => {
    setShowReliabilityModal(false)
    formik.handleSubmit()
  }

  const handleReliabilityClose = () => {
    setShowReliabilityModal(false)
    setReliabilityMetrics(null)
  }

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

      if (response.success) {
        toast.success('পেমেন্ট সফল হয়েছে')
        setShowPaymentModal(false)
        resetPaymentForm()
        reloadUser()
        navigate('/orders', { state: { tab: 'pending' } })
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
        navigate('/orders', { state: { tab: 'pending' } })
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

  useEffect(() => {
    const timer = setTimeout(() => {
      if (Object.values(formik.values).some(value => value) && formik.values.customerPhone) {
        saveDraft(formik.values)
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [formik.values])

  useEffect(() => {
    const locationMobileNumber = location.state?.mobileNumber
    const currentPhone = locationMobileNumber || formik.values.customerPhone

    if (currentPhone) {
      const draft = loadDraft(currentPhone)

      if (draft) {
        if (locationMobileNumber && draft.customerPhone !== locationMobileNumber) {
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
          formik.setValues(draft)
          if (draft.zilla) {
            setUpazillas(districts[draft.zilla as keyof typeof districts] || [])
          }
        }
      } else if (locationMobileNumber) {
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

  useEffect(() => {
    reloadUser()
  }, [showPaymentModal])

  if (!shopCart) {
    navigate('/cart')
    return null
  }

  if (shopCart?.items.length === 0) {
    return (
      <div className='min-h-screen bg-[#f7f6f3] flex items-center justify-center px-4'>
        <div className='max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center'>
          <div className='w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4'>
            <FaShoppingCart className='h-8 w-8 text-rose-500' />
          </div>
          <h2 className='text-xl font-bold text-[#1a1a2e] mb-2'>আপনার কার্ট খালি</h2>
          <p className='text-gray-500 mb-6'>অর্ডার করতে কার্টে পণ্য যোগ করুন</p>
          <button
            onClick={() => navigate('/products')}
            className='inline-flex items-center gap-2 px-6 py-3 bg-rose-500 text-white rounded-xl font-medium hover:bg-rose-600 transition-all'
          >
            <FiChevronLeft className='h-4 w-4' />
            পণ্য ব্রাউজ করুন
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-[#f7f6f3]'>
      {/* Header */}
      <div className='bg-white border-b border-gray-100 sticky top-0 z-10'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4'>
          <div className='flex items-center justify-between'>
            <button
              onClick={() => navigate(-1)}
              className='flex items-center gap-2 text-gray-500 hover:text-rose-500 transition-colors group'
            >
              <FiChevronLeft className='h-4 w-4 group-hover:-translate-x-0.5 transition-transform' />
              <span className='text-sm font-medium'>কার্টে ফিরুন</span>
            </button>
            <div className='flex items-center gap-2'>
              <div className='h-8 w-px bg-gray-200' />
              <span className='text-sm text-gray-400'>চেকআউট</span>
            </div>
          </div>
        </div>
      </div>

      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          {/* Main Form - Left Column */}
          <div className='lg:col-span-2 space-y-6'>
            {/* Shop Info Card */}
            <div className='bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden'>
              <div className='px-6 py-4 bg-gradient-to-r from-[#1a1a2e] to-[#16213e]'>
                <div className='flex items-center gap-3'>
                  <div className='h-10 w-10 rounded-xl bg-rose-500/20 flex items-center justify-center'>
                    <FaStore className='h-5 w-5 text-rose-400' />
                  </div>
                  <div>
                    <h2 className='text-white font-semibold'>{shopCart?.shopName}</h2>
                    {shopCart?.shopLocation && (
                      <p className='text-white/50 text-xs'>{shopCart.shopLocation}</p>
                    )}
                  </div>
                </div>
              </div>
              <div className='px-6 py-4'>
                <div className='flex flex-wrap gap-3'>
                  {shopCart?.deliveryChargeInside && (
                    <div className='flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-full'>
                      <FaTruck className='h-3 w-3 text-emerald-500' />
                      <span className='text-xs text-emerald-700'>
                        {shopCart?.shopLocation} এর ভিতরে:{' '}
                        {totalDeliveryChargeInside.toLocaleString('bn-BD')} ৳
                      </span>
                    </div>
                  )}
                  {shopCart?.deliveryChargeOutside && (
                    <div className='flex items-center gap-2 px-3 py-1.5 bg-amber-50 rounded-full'>
                      <FaTruck className='h-3 w-3 text-amber-500' />
                      <span className='text-xs text-amber-700'>
                        {shopCart?.shopLocation} এর বাইরে:{' '}
                        {totalDeliveryChargeOutside.toLocaleString('bn-BD')}৳
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Customer Information Form */}
            <div className='bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden'>
              <div className='px-6 py-4 border-b border-gray-100'>
                <div className='flex items-center gap-2'>
                  <FiUser className='h-5 w-5 text-rose-500' />
                  <h2 className='text-lg font-semibold text-[#1a1a2e]'>কাস্টমারের তথ্য</h2>
                </div>
                <p className='text-xs text-gray-400 mt-1'>
                  অর্ডার সম্পূর্ণ করতে নিচের তথ্য পূরণ করুন
                </p>
              </div>

              <div className='p-6'>
                <form onSubmit={formik.handleSubmit} className='space-y-5'>
                  {/* Phone Number */}
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      <FiPhone className='inline h-4 w-4 mr-1' />
                      কাস্টমারের মোবাইল নং <span className='text-rose-500'>*</span>
                    </label>
                    <input
                      type='text'
                      className={`w-full px-4 py-3 rounded-xl border ${
                        formik.touched.customerPhone && formik.errors.customerPhone
                          ? 'border-rose-500 ring-2 ring-rose-500/20'
                          : 'border-gray-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-500/20'
                      } transition-all bg-gray-50`}
                      {...formik.getFieldProps('customerPhone')}
                      placeholder='01XXXXXXXXX'
                      readOnly
                    />
                    {formik.touched.customerPhone && formik.errors.customerPhone && (
                      <p className='text-rose-500 text-xs mt-1'>
                        {formik.errors.customerPhone?.toString()}
                      </p>
                    )}
                  </div>

                  {/* Customer Name */}
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      কাস্টমারের নাম <span className='text-rose-500'>*</span>
                    </label>
                    <input
                      type='text'
                      className={`w-full px-4 py-3 rounded-xl border ${
                        formik.touched.customerName && formik.errors.customerName
                          ? 'border-rose-500 ring-2 ring-rose-500/20'
                          : 'border-gray-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-500/20'
                      } transition-all`}
                      {...formik.getFieldProps('customerName')}
                      placeholder='কাস্টমারের পুরো নাম লিখুন'
                    />
                    {formik.touched.customerName && formik.errors.customerName && (
                      <p className='text-rose-500 text-xs mt-1'>{formik.errors.customerName}</p>
                    )}
                  </div>

                  {/* District & Upazilla */}
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        জেলা <span className='text-rose-500'>*</span>
                      </label>
                      <select
                        className={`w-full px-4 py-3 rounded-xl border ${
                          formik.touched.zilla && formik.errors.zilla
                            ? 'border-rose-500 ring-2 ring-rose-500/20'
                            : 'border-gray-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-500/20'
                        } transition-all bg-white`}
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
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        থানা/এলাকা <span className='text-rose-500'>*</span>
                      </label>
                      <div className='relative'>
                        <input
                          list='upazilla-list'
                          className={`w-full px-4 py-3 rounded-xl border ${
                            formik.touched.upazilla && formik.errors.upazilla
                              ? 'border-rose-500 ring-2 ring-rose-500/20'
                              : 'border-gray-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-500/20'
                          } transition-all ${!formik.values.zilla ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}`}
                          {...formik.getFieldProps('upazilla')}
                          placeholder={
                            formik.values.zilla
                              ? 'থানা/এলাকা নির্বাচন করুন'
                              : 'প্রথমে জেলা নির্বাচন করুন'
                          }
                          disabled={!formik.values.zilla}
                        />
                        {formik.values.zilla && upazillas.length > 0 && (
                          <datalist id='upazilla-list'>
                            {upazillas.map(upazilla => (
                              <option key={upazilla} value={upazilla}>
                                {upazilla}
                              </option>
                            ))}
                          </datalist>
                        )}
                      </div>
                      {formik.touched.upazilla && formik.errors.upazilla && (
                        <p className='text-rose-500 text-xs mt-1'>{formik.errors.upazilla}</p>
                      )}
                    </div>
                  </div>

                  {/* Delivery Address */}
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      <FiMapPin className='inline h-4 w-4 mr-1' />
                      ডেলিভারির ঠিকানা <span className='text-rose-500'>*</span>
                    </label>
                    <textarea
                      rows={4}
                      className={`w-full px-4 py-3 rounded-xl border ${
                        formik.touched.deliveryAddress && formik.errors.deliveryAddress
                          ? 'border-rose-500 ring-2 ring-rose-500/20'
                          : 'border-gray-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-500/20'
                      } transition-all resize-none`}
                      {...formik.getFieldProps('deliveryAddress')}
                      placeholder='বিস্তারিত ঠিকানা লিখুন (বাসা/হোল্ডিং নম্বর, রাস্তা, এলাকা)'
                    />
                    {formik.touched.deliveryAddress && formik.errors.deliveryAddress && (
                      <p className='text-rose-500 text-xs mt-1'>{formik.errors.deliveryAddress}</p>
                    )}
                    <p className='text-gray-400 text-xs mt-2'>
                      ⚠️ শুধুমাত্র ঠিকানা লিখুন, কাস্টমারের নাম বা মোবাইল নম্বর দেবেন না
                    </p>
                  </div>

                  {/* Comments */}
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      কমেন্টস (ঐচ্ছিক)
                    </label>
                    <textarea
                      rows={3}
                      className='w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-500/20 transition-all resize-none'
                      {...formik.getFieldProps('comments')}
                      placeholder='অর্ডার সম্পর্কে কোনো বিশেষ নির্দেশনা থাকলে লিখুন...'
                    />
                  </div>

                  {formErrors.length > 0 && (
                    <div className='p-4 bg-red-50 rounded-xl border border-red-200'>
                      {formErrors.map((error, index) => (
                        <p key={index} className='text-red-600 text-sm'>
                          {error}
                        </p>
                      ))}
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type='submit'
                    disabled={isSubmitting || isCheckingReliability}
                    className='w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold py-3 px-6 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-rose-500/20'
                  >
                    {isCheckingReliability ? (
                      <>
                        <div className='animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent' />
                        নির্ভরযোগ্যতা যাচাই...
                      </>
                    ) : isSubmitting ? (
                      <>
                        <div className='animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent' />
                        প্রসেসিং...
                      </>
                    ) : (
                      <>
                        <FaCheckCircle className='h-4 w-4' />
                        অর্ডার কনফার্ম করুন
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Order Summary - Right Column */}
          <div className='lg:col-span-1'>
            <div className='sticky top-24 space-y-6'>
              {/* Order Items Summary */}
              <div className='bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden'>
                <div className='px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white'>
                  <h2 className='font-semibold text-[#1a1a2e] flex items-center gap-2'>
                    <FaShoppingCart className='h-4 w-4 text-rose-500' />
                    আপনার অর্ডার
                    <span className='text-xs text-gray-400 ml-auto'>{totalItems} টি আইটেম</span>
                  </h2>
                </div>

                <div className='max-h-[400px] overflow-y-auto divide-y divide-gray-100'>
                  {shopCart?.items.map(item => (
                    <div
                      key={item.cartItemId}
                      className='p-4 hover:bg-gray-50/50 transition-colors'
                    >
                      <div className='flex gap-3'>
                        <div className='h-16 w-16 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100'>
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className='h-full w-full object-cover'
                            onError={e => {
                              ;(e.target as HTMLImageElement).src = '/placeholder-product.jpg'
                            }}
                          />
                        </div>
                        <div className='flex-1 min-w-0'>
                          <h3 className='text-sm font-medium text-gray-800 truncate'>
                            {item.name}
                          </h3>
                          <p className='text-xs text-gray-500 mt-1'>
                            পরিমাণ: {item.quantity} × ৳{item.sellingPrice.toLocaleString('bn-BD')}
                          </p>
                          {Object.entries(item.selectedOptions).length > 0 && (
                            <div className='mt-1 text-xs text-gray-400'>
                              {Object.entries(item.selectedOptions).map(([key, value]) => (
                                <span key={key} className='inline-block mr-2'>
                                  {key}: {value}
                                </span>
                              ))}
                            </div>
                          )}
                          <div className='flex justify-between items-center mt-2'>
                            <span className='text-xs text-emerald-600'>
                              কমিশন: +৳
                              {(
                                (item.sellingPrice - item.basePrice) *
                                item.quantity
                              ).toLocaleString('bn-BD')}
                            </span>
                            <span className='text-sm font-semibold text-gray-900'>
                              ৳{(item.sellingPrice * item.quantity).toLocaleString('bn-BD')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Price Breakdown */}
                <div className='border-t border-gray-100 bg-gray-50/50 p-5 space-y-3'>
                  <div className='flex justify-between text-sm'>
                    <span className='text-gray-600'>পণ্যের মূল্য</span>
                    <span className='text-gray-900'>৳{subtotal?.toLocaleString('bn-BD')}</span>
                  </div>
                  <div className='flex justify-between text-sm'>
                    <span className='text-gray-600'>মোট পণ্য</span>
                    <span className='text-gray-900'>{totalItems} টি</span>
                  </div>
                  <div className='flex justify-between text-sm text-emerald-600'>
                    <span className='flex items-center gap-1'>
                      <FaWallet className='h-3 w-3' />
                      মোট কমিশন
                    </span>
                    <span className='font-semibold'>
                      ৳{totalCommission?.toLocaleString('bn-BD')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Delivery Info Card */}
              <div className='bg-gradient-to-r from-[#1a1a2e] to-[#16213e] rounded-2xl p-5 text-white'>
                <div className='flex items-center gap-2 mb-3'>
                  <FaTruck className='h-4 w-4 text-rose-400' />
                  <h3 className='font-medium'>ডেলিভারি তথ্য</h3>
                </div>
                <div className='space-y-2 text-sm'>
                  <p className='text-white/70'>
                    {shopCart?.deliveryChargeInside && (
                      <span className='block'>
                        📍 {shopCart?.shopLocation} এর ভিতরে: ৳{totalDeliveryChargeInside}
                      </span>
                    )}
                    {shopCart?.deliveryChargeOutside && (
                      <span className='block mt-1'>
                        📍 {shopCart?.shopLocation} এর বাইরে: ৳{totalDeliveryChargeOutside}
                      </span>
                    )}
                  </p>
                  <p className='text-white/40 text-xs mt-3'>
                    ⚡ ডেলিভারি সময়: অর্ডার কনফার্মের ২৪-৪৮ ঘণ্টার মধ্যে
                  </p>
                </div>
              </div>

              {/* Trust Badge */}
              <div className='flex items-center justify-center gap-4 text-xs text-gray-400'>
                <span className='flex items-center gap-1'>
                  <FaCheckCircle className='h-3 w-3 text-emerald-500' />
                  নিরাপদ পেমেন্ট
                </span>
                <span className='w-px h-3 bg-gray-200' />
                <span className='flex items-center gap-1'>
                  <FaStar className='h-3 w-3 text-amber-500' />
                  গুণগত মান নিশ্চিত
                </span>
                <span className='w-px h-3 bg-gray-200' />
                <span className='flex items-center gap-1'>
                  <FaHeart className='h-3 w-3 text-rose-500' />
                  ২৪/৭ সাপোর্ট
                </span>
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
        <div className='fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4'>
          <div className='bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-200'>
            {/* Modal Header */}
            <div className='px-6 py-4 border-b bg-gradient-to-r from-emerald-50 to-green-50'>
              <div className='flex items-center justify-between'>
                <div>
                  <h2 className='text-lg font-semibold text-emerald-700'>
                    {selectedOrder.sellerVerified ? 'অর্ডার কনফার্মেশন' : 'অর্ডার পেমেন্ট'}
                  </h2>
                  <p className='text-sm text-gray-500'>অর্ডার #{selectedOrder.orderId}</p>
                </div>
                <button
                  onClick={() => {
                    setShowPaymentModal(false)
                    resetPaymentForm()
                  }}
                  className='p-2 hover:bg-white/50 rounded-full transition-colors'
                >
                  <svg
                    className='w-5 h-5 text-gray-400'
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

            {/* Modal Content */}
            <div className='p-6 space-y-5 overflow-y-auto max-h-[calc(90vh-120px)]'>
              {/* Instruction Notice */}
              <div className='p-4 bg-amber-50 rounded-xl border-l-4 border-amber-500'>
                <h4 className='text-sm font-bold text-amber-800 mb-2'>গুরুত্বপূর্ণ নির্দেশনা</h4>
                <ul className='text-xs text-amber-700 space-y-1 list-disc list-inside'>
                  <li>ডেলিভারি চার্জ অগ্রিম পেমেন্ট করলে পণ্যের সাথে ডেলিভারি চার্জ যোগ হবে না</li>
                  <li>ডেলিভারি চার্জ অগ্রিম না করলে পণ্যের সাথে ডেলিভারি চার্জ যোগ হবে</li>
                  <li>ভুল পেমেন্ট তথ্য দিলে অর্ডার রিজেক্ট করা হবে</li>
                </ul>
              </div>

              {/* Delivery Charge */}
              <div className='flex justify-between items-center p-4 bg-gray-50 rounded-xl'>
                <span className='font-medium text-gray-700'>ডেলিভারি চার্জ:</span>
                <span className='text-xl font-bold text-emerald-600'>
                  {selectedOrder.deliveryCharge}৳
                </span>
              </div>

              {/* Quick Confirm for Verified Sellers */}
              {selectedOrder.sellerVerified && (
                <>
                  <button
                    onClick={() => handleConfirmOrder(selectedOrder.orderId)}
                    disabled={
                      actionLoading.type === 'confirm' && actionLoading.id === selectedOrder.orderId
                    }
                    className='w-full py-3 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600 transition-all flex items-center justify-center gap-2'
                  >
                    {actionLoading.type === 'confirm' &&
                    actionLoading.id === selectedOrder.orderId ? (
                      <>
                        <div className='animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent' />
                        প্রক্রিয়াধীন...
                      </>
                    ) : (
                      <>
                        <FaCheckCircle className='h-4 w-4' />
                        কনফার্ম করুন (পেমেন্ট ছাড়া)
                      </>
                    )}
                  </button>
                  <div className='relative'>
                    <div className='absolute inset-0 flex items-center'>
                      <div className='w-full border-t border-gray-200'></div>
                    </div>
                    <div className='relative flex justify-center text-xs'>
                      <span className='px-2 bg-white text-gray-400'>অথবা</span>
                    </div>
                  </div>
                </>
              )}

              {/* Payment Methods */}
              <div className='space-y-3'>
                <h3 className='font-medium text-gray-800'>পেমেন্ট মেথড নির্বাচন করুন</h3>

                {/* Balance Payment */}
                <label
                  className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    paymentMethod === 'BALANCE'
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-gray-200 hover:border-gray-300'
                  } ${user?.balance! < +selectedOrder.deliveryCharge ? 'opacity-50' : ''}`}
                >
                  <input
                    type='radio'
                    className='text-emerald-600 focus:ring-emerald-500'
                    name='paymentMethod'
                    value='BALANCE'
                    checked={paymentMethod === 'BALANCE'}
                    onChange={() => setPaymentMethod('BALANCE')}
                    disabled={user?.balance! < +selectedOrder.deliveryCharge}
                  />
                  <div className='ml-3 flex-1'>
                    <div className='flex justify-between'>
                      <span className='font-medium'>ব্যালেন্স থেকে পেমেন্ট</span>
                      <span className='text-xs text-gray-500'>
                        ব্যালেন্স: ৳{user?.balance || 0}
                      </span>
                    </div>
                  </div>
                </label>

                {/* Wallet Payment */}
                <label
                  className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                    paymentMethod === 'WALLET'
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type='radio'
                    className='text-emerald-600 focus:ring-emerald-500'
                    name='paymentMethod'
                    value='WALLET'
                    checked={paymentMethod === 'WALLET'}
                    onChange={() => setPaymentMethod('WALLET')}
                  />
                  <div className='ml-3'>
                    <span className='font-medium'>মোবাইল ওয়ালেট পেমেন্ট</span>
                    <p className='text-xs text-gray-500'>bKash, Nagad</p>
                  </div>
                </label>
              </div>

              {/* Wallet Payment Details */}
              {paymentMethod === 'WALLET' && (
                <div className='space-y-4 border-t pt-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      সিস্টেম ওয়ালেট নির্বাচন করুন *
                    </label>
                    <select
                      className='w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 transition-all'
                      value={selectedSystemWallet?.walletId || ''}
                      onChange={e => {
                        const walletId = parseInt(e.target.value)
                        const wallet = systemWallets.find(w => w.walletId === walletId)
                        setSelectedSystemWallet(wallet || null)
                      }}
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

                  {selectedSystemWallet && (
                    <div className='p-4 border-2 border-dashed border-emerald-300 bg-emerald-50 rounded-xl text-center'>
                      <p className='text-sm text-emerald-800 font-medium'>পেমেন্ট করুন</p>
                      <p className='text-lg font-bold text-emerald-700'>
                        {selectedSystemWallet.walletPhoneNo}
                      </p>
                      <p className='text-xl font-bold text-emerald-800 mt-2'>
                        পরিমাণ: {selectedOrder.deliveryCharge}৳
                      </p>
                    </div>
                  )}

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      আপনার {selectedSystemWallet?.walletName || 'ওয়ালেট'} নম্বর *
                    </label>
                    <input
                      type='tel'
                      className='w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 transition-all'
                      placeholder='যে নম্বর থেকে পেমেন্ট করেছেন'
                      value={sellerWalletPhoneNo}
                      onChange={e => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 11)
                        setSellerWalletPhoneNo(value)
                        setShowSuggestions(value.length > 0)
                      }}
                      maxLength={11}
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      ট্রানজেকশন আইডি *
                    </label>
                    <input
                      type='text'
                      className='w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 transition-all'
                      placeholder='পেমেন্টের পর ট্রানজেকশন আইডি লিখুন'
                      value={transactionId}
                      onChange={e => setTransactionId(e.target.value.trim())}
                    />
                  </div>
                </div>
              )}

              {error && (
                <div className='p-4 bg-red-50 rounded-xl border border-red-200'>
                  <p className='text-red-600 text-sm'>{error}</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className='px-6 py-4 border-t bg-gray-50 space-y-3'>
              {(!selectedOrder.sellerVerified || paymentMethod) && (
                <button
                  onClick={handlePayment}
                  disabled={
                    actionLoading.type === 'payment' && actionLoading.id === selectedOrder.orderId
                  }
                  className='w-full py-3 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600 transition-all flex items-center justify-center gap-2'
                >
                  {actionLoading.type === 'payment' &&
                  actionLoading.id === selectedOrder.orderId ? (
                    <>
                      <div className='animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent' />
                      প্রক্রিয়াধীন...
                    </>
                  ) : (
                    <>
                      <FaWallet className='h-4 w-4' />
                      {paymentMethod === 'BALANCE'
                        ? 'ব্যালেন্স থেকে পেমেন্ট করুন'
                        : 'ওয়ালেট পেমেন্ট কনফার্ম করুন'}
                    </>
                  )}
                </button>
              )}
              <button
                onClick={() => {
                  setShowPaymentModal(false)
                  resetPaymentForm()
                }}
                className='w-full py-2 bg-white border border-gray-200 text-gray-600 rounded-xl font-medium hover:bg-gray-50 transition-all'
              >
                বাতিল করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Missing FaStore import - add to imports
import { FaStore } from 'react-icons/fa'

export default Checkout
