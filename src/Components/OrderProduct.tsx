import { useFormik } from 'formik'
import { useEffect, useState } from 'react'
import { FiEdit2, FiMapPin, FiPhone, FiShoppingCart, FiUser } from 'react-icons/fi'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import * as Yup from 'yup'
import districts from '../../public/zillasInfo.json'
import { orderApi } from '../Api/order.api'
import { productApi } from '../Api/product.api'
import { Product } from '../Api/shop.api'

import { authApi } from '../Api/auth.api'
import { sendOtp, verifyOtp } from '../Api/otp.api'
import { userApi } from '../Api/user.api'
import { walletApi } from '../Api/wallet.api'
import { extraDeliveryChargePerProduct } from '../Config/config'

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

const SingleProductOrder = () => {
  const [searchParams] = useSearchParams()
  const referralCode = searchParams.get('referralCode') || null
  const sellerPrice = searchParams.get('sellerPrice') || null
  const { productId } = useParams<{ productId: string }>()
  const navigate = useNavigate()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState<{ imageUrl: string; imageId: number } | null>(
    null
  )
  const [currentImageIndex, setCurrentImageIndex] = useState<{
    imageUrl: string
    imageId: number
  } | null>(null)
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({})
  const [quantity, setQuantity] = useState('1')
  const [validationError, setValidationError] = useState<string | null>(null)

  // Customer registration states
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [checkingCustomer, setCheckingCustomer] = useState(false)
  const [, setSendingOtp] = useState(false)
  const [verifyingOtp, setVerifyingOtp] = useState(false)
  const [verifyingOtpError, setVerifyingOtpError] = useState<string | null>(null)
  const [otpSent, setOtpSent] = useState(false)
  const [otp, setOtp] = useState('')
  const [otpCooldown] = useState<number>(0)
  const [otpCooldownInterval] = useState<NodeJS.Timeout | null>(null)

  // Order states
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [transactionId, setTransactionId] = useState('')
  const [customerWalletNumber, setCustomerWalletNumber] = useState('')
  const [systemWallets, setSystemWallets] = useState<
    { walletId: number; walletName: string; walletPhoneNo: string }[]
  >([])
  const [selectedSystemWallet, setSelectedSystemWallet] = useState<{
    walletId: number
    walletName: string
    walletPhoneNo: string
  } | null>(null)
  const [deliveryCharge, setDeliveryCharge] = useState(0)
  const [paymentError, setPaymentError] = useState<string | null>(null)

  // Initialize product data
  useEffect(() => {
    if (productId) {
      const fetchProduct = async () => {
        try {
          setLoading(true)
          const { success, data } = await productApi.getProductDetail(parseInt(productId))
          if (success) {
            setProduct({
              ...data.product,
              basePrice: data.product.basePrice || data.product.price || 0,
              suggestedMaxPrice: data.product.suggestedMaxPrice || data.product.price || 0,
              price:
                sellerPrice ||
                data.product.suggestedMaxPrice ||
                data.product.basePrice ||
                undefined,
            })
            // Auto-select first image
          } else {
            setError('Product not found')
          }
        } catch (err) {
          console.error('Error fetching product:', err)
          setError('Failed to load product')
        } finally {
          setLoading(false)
        }
      }
      fetchProduct()
    }
  }, [productId])

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (otpCooldownInterval) {
        clearInterval(otpCooldownInterval)
      }
    }
  }, [otpCooldownInterval])

  // Start OTP cooldown timer

  // Group variants by key
  const variantGroups =
    product?.ProductVariant?.reduce<Record<string, string[]>>((acc, variant) => {
      if (!acc[variant.name]) {
        acc[variant.name] = []
      }
      if (!acc[variant.name].includes(variant.value)) {
        acc[variant.name].push(variant.value)
      }
      return acc
    }, {}) || {}

  // Handle option selection
  const handleOptionSelect = (key: string, value: string) => {
    setSelectedOptions(prev => ({
      ...prev,
      [key]: value,
    }))
  }

  // Validation schema for customer form
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

  // Formik for customer form
  const formik = useFormik({
    initialValues: {
      customerPhone: '',
      customerName: '',
      zilla: '',
      upazilla: '',
      deliveryAddress: '',
      comments: '',
    },
    validationSchema,
    onSubmit: async values => {
      await handleOrderSubmit(values)
    },
  })

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
            // Automatically send OTP if no customer found
            handleSendOtp()
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
  useEffect(() => {
    const calculateDeliveryCharge = () => {
      if (!formik.values.zilla) {
        // alert(product?.shop.deliveryChargeOutside || 0)
        setDeliveryCharge(product?.shop.deliveryChargeOutside || 0)
        return
      }
      const isInside =
        formik.values.zilla.toLowerCase() === product?.shop.shopLocation.toLowerCase()

      // Your delivery charge calculation logic here
      // This is just an example - adjust based on your actual business rules
      const baseCharge = isInside
        ? product?.shop.deliveryChargeInside
        : product?.shop.deliveryChargeOutside
      let extraCharge = 0
      if (parseInt(quantity) > 3) {
        extraCharge = (parseInt(quantity) - 3) * extraDeliveryChargePerProduct
      }
      console.log({ baseCharge, extraCharge })

      setDeliveryCharge(Number(baseCharge!) + Number(extraCharge))
    }

    calculateDeliveryCharge()
  }, [quantity, formik.values.zilla, product])

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
        } else if (data.sendOTP) {
          // OTP sent successfully
          setOtpSent(true)
          toast.success('OTP sent successfully')
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
        sellerCode: referralCode || '123', // You might want to make this dynamic
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
        console.log('createCustomer called', data)
        if (data.otpVerified) {
          console.log('OTP verified successfully')
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

  // Handle order submission
  const handleOrderSubmit = async (values: any) => {
    if (!product) return
    const sellingPrice = parseFloat(sellerPrice || '') || 0

    // Validate product selections
    if (!selectedImage) {
      setValidationError('একটি ছবি সিলেক্ট করুন')
      return
    }

    const variantKeys = [...new Set(product.ProductVariant?.map(v => v.name) || [])]
    const absentOptions = variantKeys.filter(key => !selectedOptions[key])
    if (absentOptions.length > 0) {
      setValidationError(`${absentOptions[0]} সিলেক্ট করুন`)
      return
    }

    if (parseInt(quantity) < 1 || isNaN(parseInt(quantity))) {
      setValidationError('কোয়ান্টিটি কমপক্ষে 1 হতে হবে')
      return
    }

    // Check if customer is verified
    if (!customer) {
      toast.error('Please verify your phone number before placing an order')
      return
    }

    setIsSubmitting(true)
    try {
      const orderData = {
        shopId: product.shopId,
        customerName: values.customerName,
        customerPhoneNo: values.customerPhone,
        customerZilla: values.zilla,
        customerUpazilla: values.upazilla,
        deliveryAddress: values.deliveryAddress,
        comments: values.comments,
        products: [
          {
            id: product.productId,
            imageUrl: selectedImage.imageUrl,
            imageId: selectedImage.imageId,
            quantity: parseInt(quantity),
            sellingPrice: product.price || product.suggestedMaxPrice || product.basePrice,
            selectedVariants: selectedOptions,
          },
        ],
      }

      const { success, data, message } = await orderApi.createCustomerOrder(orderData)
      if (success && data) {
        setSelectedOrder(data)

        // Check if customer has enough balance for delivery charge
        if (customer && parseFloat(customer.balance) >= data.deliveryCharge) {
          // Customer has enough balance, navigate to success page
          navigate('/orders', {
            state: { orderId: data.orderId, phoneNo: customer.customerPhoneNo },
          })
        } else {
          // Show payment modal for delivery charge
          await fetchSystemWallets()
          setShowPaymentModal(true)
        }
      } else {
        setValidationError(message!)
      }
    } catch (error: any) {
      console.error('Order submission error:', error)
      setValidationError(error.response?.data?.message || 'Failed to create order')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Fetch system wallets for payment
  const fetchSystemWallets = async () => {
    try {
      const response = await walletApi.getSystemWallets()
      if (response.success) {
        setSystemWallets(response.data)
      } else {
        toast.error('Failed to load payment options')
      }
    } catch (error) {
      toast.error('Failed to load payment options')
    }
  }

  // Handle payment submission
  const handlePayment = async () => {
    if (!selectedOrder || !selectedSystemWallet) return

    try {
      const paymentData = {
        orderId: selectedOrder.orderId,
        paymentMethod: 'WALLET',
        customerWalletPhoneNo: customerWalletNumber,
        systemWalletPhoneNo: selectedSystemWallet.walletPhoneNo,
        transactionId: transactionId,
        customerWalletName: selectedSystemWallet.walletName,
        amount: selectedOrder.deliveryCharge || 0,
      }

      const { success, message } = await orderApi.orderPaymentByCustomer(paymentData)
      if (success) {
        toast.success('Payment successful')
        setShowPaymentModal(false)
        navigate('/orders', {
          state: { orderId: selectedOrder.orderId, phoneNo: customer?.customerPhoneNo },
        })
      } else {
        setPaymentError(message || 'Payment failed')
      }
    } catch (error) {
      setPaymentError('Payment failed')
    }
  }

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500'></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <p className='text-red-500'>{error}</p>
      </div>
    )
  }

  if (!product) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <p>Product not found</p>
      </div>
    )
  }
  // I need to update the delivery charge based on selected zilla
  if (isNaN(parseFloat(sellerPrice || ''))) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-red-50'>
        <div className='max-w-md w-full p-8 bg-white rounded-lg shadow-lg text-center'>
          <div className='text-red-500 mb-4'>
            <svg
              className='mx-auto h-16 w-16'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
              />
            </svg>
          </div>
          <h2 className='text-2xl font-bold text-gray-800 mb-2'>সেলিং প্রাইস সঠিক নয়</h2>
          <p className='text-gray-600 mb-6'>দুঃখিত, এই পণ্যের জন্য সেলিং প্রাইস সঠিক নয়</p>
          <button
            onClick={() => navigate(-1)}
            className='bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors'
          >
            ফিরে যান
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Product Section */}
      <div className='bg-white rounded-lg shadow-sm p-4 mb-4'>
        <div className='flex flex-col md:flex-row gap-6'>
          {/* Product Image */}
          <div className='md:w-1/2'>
            <div className='relative aspect-square bg-gray-100 rounded-lg overflow-hidden'>
              <img
                src={
                  selectedImage?.imageUrl ||
                  currentImageIndex?.imageUrl ||
                  product.ProductImage[0]?.imageUrl ||
                  '/placeholder.jpg'
                }
                alt={product.name}
                className='w-full h-full object-contain'
              />
              {product.ProductImage.length > 1 && (
                <>
                  <button
                    onClick={() => {
                      const currentIndex = product.ProductImage.findIndex(
                        img => img.imageUrl === currentImageIndex?.imageUrl
                      )
                      const prevIndex =
                        currentIndex <= 0 ? product.ProductImage.length - 1 : currentIndex - 1
                      setCurrentImageIndex(product.ProductImage[prevIndex])
                    }}
                    className='absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all'
                  >
                    <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M15 19l-7-7 7-7'
                      />
                    </svg>
                  </button>
                  <button
                    onClick={() => {
                      const currentIndex = product.ProductImage.findIndex(
                        img => img.imageUrl === currentImageIndex?.imageUrl
                      )
                      const length = product.ProductImage.length
                      // alert()
                      const nextIndex = (currentIndex + 1) % length
                      console.log({ currentIndex, nextIndex, length })

                      setCurrentImageIndex(product.ProductImage[nextIndex])
                    }}
                    className='absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all'
                  >
                    <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M9 5l7 7-7 7'
                      />
                    </svg>
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Images */}
            {product.ProductImage.length > 1 && (
              <div className='mt-4 grid grid-cols-4 gap-2'>
                {product.ProductImage.map(image => (
                  <button
                    key={image.imageId}
                    onClick={() =>
                      setSelectedImage({
                        imageUrl: image.imageUrl,
                        imageId: image.imageId,
                      })
                    }
                    className={`aspect-square border-2 rounded overflow-hidden ${
                      selectedImage?.imageUrl === image.imageUrl
                        ? 'border-blue-500'
                        : 'border-transparent'
                    }`}
                  >
                    <img
                      src={image.imageUrl}
                      alt={product.name}
                      className='w-full h-full object-cover'
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className='md:w-1/2'>
            <h1 className='text-2xl font-bold mb-2'>{product.name}</h1>
            <p className='text-gray-700 mb-4'>{product.description}</p>

            <div className='mb-4'>
              <span className='text-2xl font-bold text-blue-600'>
                ৳{product.price?.toLocaleString('bn-BD')}
              </span>
            </div>

            {/* Variants */}
            {Object.entries(variantGroups).length > 0 && (
              <div className='mb-4'>
                {Object.entries(variantGroups).map(([key, values]) => (
                  <div key={key} className='mb-3'>
                    <h3 className='text-sm font-medium mb-2 capitalize'>{key}</h3>
                    <div className='flex flex-wrap gap-2'>
                      {values.map(value => (
                        <button
                          key={value}
                          onClick={() => handleOptionSelect(key, value)}
                          className={`px-3 py-1 border rounded-full text-sm ${
                            selectedOptions[key] === value
                              ? 'border-blue-500 bg-blue-50 text-blue-600'
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          {value}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Quantity */}
            <div className='mb-4'>
              <label className='block text-sm font-medium mb-1'>পরিমাণ</label>
              <input
                type='number'
                min='1'
                value={quantity}
                onChange={e => setQuantity(e.target.value)}
                className='w-20 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500'
              />
            </div>
          </div>
        </div>
      </div>

      {/* Customer Form Section */}
      <div className='bg-white rounded-lg shadow-sm p-4'>
        <h2 className='text-xl font-bold mb-4'>অর্ডার সম্পূর্ণ করুন</h2>

        <form onSubmit={formik.handleSubmit} className='space-y-4'>
          {/* Customer Phone */}
          <div>
            <label className=' text-sm font-medium mb-1 flex items-center gap-1'>
              <FiPhone size={14} />
              মোবাইল নম্বর *
            </label>
            <div className='flex gap-2 items-center'>
              <input
                type='text'
                className={`w-full px-3 py-2 border rounded-lg ${
                  formik.touched.customerPhone && formik.errors.customerPhone
                    ? 'border-red-500'
                    : 'border-gray-300'
                }`}
                placeholder='01XXXXXXXXX'
                {...formik.getFieldProps('customerPhone')}
              />
              {checkingCustomer && (
                <div className='animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500'></div>
              )}
            </div>
            {formik.touched.customerPhone && formik.errors.customerPhone && (
              <p className='text-red-500 text-xs mt-1'>{formik.errors.customerPhone}</p>
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
                    className='flex-1 px-3 py-2 border border-gray-300 rounded'
                    maxLength={6}
                  />
                  <button
                    type='button'
                    onClick={verifyOtpAndCreateCustomer}
                    disabled={verifyingOtp || otp.length !== 6}
                    className='px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50'
                  >
                    {verifyingOtp ? 'Verifying...' : 'Verify'}
                  </button>
                </div>
                {verifyingOtpError && (
                  <p className='text-red-500 text-xs mt-1'>{verifyingOtpError}</p>
                )}
                <p className='text-xs text-gray-600 mt-2'>
                  OTP না পেলে {otpCooldown > 0 ? `${otpCooldown} সেকেন্ড পরে` : 'আবার'} রিকোয়েস্ট
                  করুন
                </p>
              </div>
            )}

            {/* Customer verification status */}
            {customer && (
              <div className='mt-2 p-2 bg-green-50 border border-green-200 rounded'>
                <p className='text-sm text-green-700'>✓ ফোন নম্বর ভেরিফাইড</p>
              </div>
            )}
          </div>

          {/* Customer Name */}
          <div>
            <label className=' text-sm font-medium mb-1 flex items-center gap-1'>
              <FiUser size={14} />
              নাম *
            </label>
            <input
              type='text'
              className={`w-full px-3 py-2 border rounded-lg ${
                formik.touched.customerName && formik.errors.customerName
                  ? 'border-red-500'
                  : 'border-gray-300'
              }`}
              placeholder='আপনার নাম লিখুন'
              {...formik.getFieldProps('customerName')}
            />
            {formik.touched.customerName && formik.errors.customerName && (
              <p className='text-red-500 text-xs mt-1'>{formik.errors.customerName}</p>
            )}
          </div>

          {/* Delivery Location */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label className=' text-sm font-medium mb-1 flex items-center gap-1'>
                <FiMapPin size={14} />
                জেলা *
              </label>
              <select
                className={`w-full px-3 py-2 border rounded-lg ${
                  formik.touched.zilla && formik.errors.zilla ? 'border-red-500' : 'border-gray-300'
                }`}
                {...formik.getFieldProps('zilla')}
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
              <label className='block text-sm font-medium mb-1'>থানা/এলাকা *</label>
              <select
                className={`w-full px-3 py-2 border rounded-lg ${
                  formik.touched.upazilla && formik.errors.upazilla
                    ? 'border-red-500'
                    : 'border-gray-300'
                }`}
                {...formik.getFieldProps('upazilla')}
                disabled={!formik.values.zilla}
              >
                <option value=''>থানা/এলাকা নির্বাচন করুন</option>
                {formik.values.zilla &&
                  districts[formik.values.zilla as keyof typeof districts]?.map(upazilla => (
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

          {/* Delivery Address */}
          <div>
            <label className=' text-sm font-medium mb-1 flex items-center gap-1'>
              <FiEdit2 size={14} />
              ডেলিভারির ঠিকানা *
            </label>
            <textarea
              rows={4}
              className={`w-full px-3 py-2 border rounded-lg ${
                formik.touched.deliveryAddress && formik.errors.deliveryAddress
                  ? 'border-red-500'
                  : 'border-gray-300'
              }`}
              placeholder='আপনার সম্পূর্ণ ঠিকানা লিখুন'
              {...formik.getFieldProps('deliveryAddress')}
            />
            {formik.touched.deliveryAddress && formik.errors.deliveryAddress && (
              <p className='text-red-500 text-xs mt-1'>{formik.errors.deliveryAddress}</p>
            )}
          </div>

          {/* Comments */}
          <div>
            <label className='block text-sm font-medium mb-1'>অতিরিক্ত মন্তব্য (ঐচ্ছিক)</label>
            <textarea
              rows={4}
              className='w-full px-3 py-2 border border-gray-300 rounded-lg'
              placeholder='অর্ডার সম্পর্কে কোন অতিরিক্ত নির্দেশিকা থাকলে লিখুন'
              {...formik.getFieldProps('comments')}
            />
          </div>

          {/* Order Summary */}
          <div className='bg-gray-50 p-4 rounded-lg'>
            <h3 className='font-medium mb-2'>অর্ডার সারাংশ</h3>
            <div className='space-y-1 text-sm'>
              <div className='flex justify-between'>
                <span>পণ্যের মূল্য:</span>
                <span>৳{product.price?.toLocaleString('bn-BD')}</span>
              </div>
              <div className='flex justify-between'>
                <span>পরিমাণ:</span>
                <span>{quantity}</span>
              </div>
              <div className='flex justify-between'>
                <span>ডেলিভারি চার্জ:</span>
                <span>৳{deliveryCharge.toLocaleString('bn-BD')}</span>
              </div>
              <div className='flex justify-between font-medium border-t pt-1 mt-1'>
                <span>মোট:</span>
                <span>
                  ৳
                  {(product.price! * parseInt(quantity) + Number(deliveryCharge)).toLocaleString(
                    'bn-BD'
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type='submit'
            disabled={isSubmitting || !customer}
            className='w-full py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2'
          >
            {isSubmitting ? (
              <>
                <div className='animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white'></div>
                প্রসেসিং...
              </>
            ) : (
              <>
                <FiShoppingCart />
                অর্ডার কনফার্ম করুন
              </>
            )}
          </button>
          {validationError && (
            <p className='text-red-500 text-sm mt-2 text-center'>{validationError}</p>
          )}
        </form>
      </div>

      {/* Payment Modal */}
      {/* Payment Modal - Mobile Friendly Version */}
      {/* Payment Modal - Mobile Friendly Modal Version */}
      {showPaymentModal && selectedOrder && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center p-0 sm:p-4 z-50'>
          <div className='bg-white w-full sm:w-full sm:max-w-md max-h-screen sm:max-h-[90vh] overflow-y-auto sm:rounded-lg shadow-xl'>
            <div className='sticky top-0 bg-white p-4 border-b border-gray-200 sm:rounded-t-lg'>
              <div className='flex items-center justify-between'>
                <h2 className='text-lg font-medium text-green-600'>
                  পেমেন্ট সম্পূর্ণ করুন (#{selectedOrder.orderId})
                </h2>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className='p-2 hover:bg-gray-100 rounded-full transition-colors'
                >
                  <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
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

            <div className='p-4 pb-safe'>
              <div className='bg-yellow-50 border-l-4 border-yellow-400 p-3 mb-4'>
                <p className='text-sm text-yellow-700'>
                  সতর্কতা: ভুল পেমেন্ট তথ্য দিলে অর্ডার রিজেক্ট করা হবে।
                </p>
              </div>

              <div className='bg-gray-50 p-4 rounded-lg mb-4'>
                <div className='flex justify-between items-center'>
                  <span className='text-base font-medium'>মোট পেমেন্ট:</span>
                  <span className='text-lg font-semibold text-green-600'>
                    ৳{selectedOrder.deliveryCharge.toLocaleString('bn-BD')}
                  </span>
                </div>
              </div>

              <div className='mb-4'>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  সিস্টেম ওয়ালেট নির্বাচন করুন *
                </label>
                <select
                  className='w-full px-3 py-3 border border-gray-300 rounded-lg text-base'
                  value={selectedSystemWallet?.walletId || ''}
                  onChange={e => {
                    const walletId = parseInt(e.target.value)
                    const wallet = systemWallets.find(w => w.walletId === walletId)
                    setSelectedSystemWallet(wallet || null)
                  }}
                  required
                >
                  <option value=''>সিলেক্ট করুন</option>
                  {systemWallets.map(wallet => (
                    <option key={wallet.walletId} value={wallet.walletId}>
                      {wallet.walletName} ({wallet.walletPhoneNo})
                    </option>
                  ))}
                </select>
              </div>

              <div className='mb-4'>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  আপনার ওয়ালেট নম্বর *
                </label>
                <input
                  type='text'
                  className='w-full px-3 py-3 border border-gray-300 rounded-lg text-base'
                  placeholder='01XXXXXXXXX'
                  value={customerWalletNumber}
                  onChange={e => setCustomerWalletNumber(e.target.value)}
                  required
                />
              </div>

              <div className='mb-4'>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  ট্রানজেকশন আইডি *
                </label>
                <input
                  type='text'
                  className='w-full px-3 py-3 border border-gray-300 rounded-lg text-base'
                  placeholder='ট্রানজেকশন আইডি'
                  value={transactionId}
                  onChange={e => setTransactionId(e.target.value)}
                  required
                />
              </div>

              <div className='bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6'>
                <h4 className='text-sm font-medium text-blue-800 mb-2'>পেমেন্ট নির্দেশনা:</h4>
                <ol className='list-decimal list-inside text-xs text-blue-700 space-y-1'>
                  <li>উপরের নির্বাচিত ওয়ালেটে {selectedOrder.deliveryCharge}৳ সেন্ড মানি করুন</li>
                  <li>ট্রানজেকশন আইডি সঠিকভাবে লিখুন</li>
                  <li>পেমেন্ট কনফার্ম করুন বাটনে ক্লিক করুন</li>
                </ol>
              </div>

              {paymentError && (
                <div className='mb-4 text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200'>
                  {paymentError}
                </div>
              )}

              <div className='flex flex-col gap-3'>
                <button
                  onClick={handlePayment}
                  disabled={!selectedSystemWallet || !customerWalletNumber || !transactionId}
                  className='w-full py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 transition-colors text-base'
                >
                  পেমেন্ট কনফার্ম করুন
                </button>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className='w-full py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors text-base'
                >
                  বাতিল
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SingleProductOrder
