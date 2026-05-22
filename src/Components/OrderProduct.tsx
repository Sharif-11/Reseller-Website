import { useFormik } from 'formik'
import { useEffect, useState } from 'react'
import {
  FiAlertCircle,
  FiChevronLeft,
  FiChevronRight,
  FiEdit2,
  FiMapPin,
  FiMinus,
  FiPhone,
  FiPlus,
  FiShoppingCart,
  FiUser,
} from 'react-icons/fi'
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

interface AddOn {
  id: string
  name: string
  price: number
  imageUrl?: string
}

// Helper to format currency
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('bn-BD', {
    style: 'currency',
    currency: 'BDT',
    minimumFractionDigits: 0,
  }).format(amount)
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
  const [selectedAddOns, setSelectedAddOns] = useState<AddOn[]>([])
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
  // const [otpCooldown] = useState<number>(0)
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

  const addOns: AddOn[] = product?.addOns ? JSON.parse(product.addOns) : []
  const addOnsTotal = selectedAddOns.reduce((total, addOn) => total + Number(addOn.price), 0)
  const productPrice = (Number(sellerPrice) || Number(product?.price) || 0) + addOnsTotal

  // Fetch product
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
            if (data.product.ProductImage && data.product.ProductImage.length > 0) {
              setSelectedImage({
                imageUrl: data.product.ProductImage[0].imageUrl,
                imageId: data.product.ProductImage[0].imageId,
              })
              setCurrentImageIndex({
                imageUrl: data.product.ProductImage[0].imageUrl,
                imageId: data.product.ProductImage[0].imageId,
              })
            }
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
  }, [productId, sellerPrice])

  useEffect(() => {
    return () => {
      if (otpCooldownInterval) {
        clearInterval(otpCooldownInterval)
      }
    }
  }, [otpCooldownInterval])

  const variantGroups =
    product?.ProductVariant?.reduce<Record<string, string[]>>((acc, variant) => {
      if (!acc[variant.name]) acc[variant.name] = []
      if (!acc[variant.name].includes(variant.value)) acc[variant.name].push(variant.value)
      return acc
    }, {}) || {}

  const handleOptionSelect = (key: string, value: string) => {
    setSelectedOptions(prev => ({ ...prev, [key]: value }))
  }

  const handleAddOnSelect = (addOn: AddOn) => {
    setSelectedAddOns(prev => {
      const isSelected = prev.some(item => item.id === addOn.id)
      return isSelected ? prev.filter(item => item.id !== addOn.id) : [...prev, addOn]
    })
  }

  const handleQuantityChange = (value: string) => {
    if (value === '' || /^[1-9][0-9]*$/.test(value)) {
      setQuantity(value)
    }
  }

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

  // Check customer existence
  useEffect(() => {
    const checkCustomer = async () => {
      if (formik.values.customerPhone.length === 11) {
        setCheckingCustomer(true)
        try {
          const { data } = await userApi.getCustomerByPhoneNumber(formik.values.customerPhone)
          if (data) {
            setCustomer(data)
            formik.setFieldValue('customerName', data.customerName || '')
            setOtpSent(false)
          } else {
            setCustomer(null)
            handleSendOtp()
          }
        } catch (error) {
          setCustomer(null)
          console.error('Error checking customer:', error)
        } finally {
          setCheckingCustomer(false)
        }
      } else {
        setOtpSent(false)
        setOtp('')
        setVerifyingOtpError(null)
      }
    }
    const timer = setTimeout(checkCustomer, 500)
    return () => clearTimeout(timer)
  }, [formik.values.customerPhone])

  // Calculate delivery charge
  useEffect(() => {
    const calculateDeliveryCharge = () => {
      if (!formik.values.zilla) {
        setDeliveryCharge(product?.shop.deliveryChargeOutside || 0)
        return
      }
      const isInside =
        formik.values.zilla.toLowerCase() === product?.shop.shopLocation.toLowerCase()
      const baseCharge = isInside
        ? product?.shop.deliveryChargeInside
        : product?.shop.deliveryChargeOutside
      let extraCharge = 0
      if (parseInt(quantity) > 3) {
        extraCharge = (parseInt(quantity) - 3) * extraDeliveryChargePerProduct
      }
      setDeliveryCharge(Number(baseCharge!) + Number(extraCharge))
    }
    calculateDeliveryCharge()
  }, [quantity, formik.values.zilla, product])

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
          await createCustomer()
        } else if (data.alreadySent) {
          setOtpSent(true)
        } else if (data.sendOTP) {
          setOtpSent(true)
          toast.success('OTP sent successfully')
        } else if (data.isBlocked) {
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

  const createCustomer = async () => {
    try {
      const { success, data } = await authApi.createCustomer({
        customerPhoneNo: formik.values.customerPhone,
        sellerCode: referralCode || '123',
      })
      if (success && data) {
        setCustomer(data)
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
        data?: { otpVerified: boolean; message: string }
        message?: string
      }
      if (success && data?.otpVerified) {
        await createCustomer()
      } else {
        setVerifyingOtpError(data?.message || message || 'OTP verification failed')
      }
    } catch (error: any) {
      console.error('Error verifying OTP:', error)
      setVerifyingOtpError(error.response?.data?.message || 'OTP verification failed')
    } finally {
      setVerifyingOtp(false)
    }
  }

  const handleOrderSubmit = async (values: any) => {
    if (!product) return
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
            sellingPrice: productPrice,
            selectedVariants: selectedOptions,
            selectedAddOns: JSON.stringify(selectedAddOns),
          },
        ],
      }
      const { success, data, message } = await orderApi.createCustomerOrder(orderData)
      if (success && data) {
        setSelectedOrder(data)
        if (customer && parseFloat(customer.balance) >= data.deliveryCharge) {
          navigate('/orders', {
            state: { orderId: data.orderId, phoneNo: customer.customerPhoneNo },
          })
        } else {
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
      <div className='flex min-h-screen items-center justify-center bg-gray-50'>
        <div className='flex flex-col items-center gap-4'>
          <div className='h-12 w-12 animate-spin rounded-full border-3 border-gray-200 border-t-rose-500' />
          <p className='text-sm text-gray-500'>পণ্য লোড হচ্ছে...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className='flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 p-4'>
        <div className='text-center'>
          <div className='mb-4 text-5xl'>🛒</div>
          <p className='text-gray-600'>{error}</p>
        </div>
        <button
          onClick={() => navigate(-1)}
          className='rounded-xl bg-rose-500 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-600'
        >
          পিছনে যান
        </button>
      </div>
    )
  }

  if (!product) {
    return (
      <div className='flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 p-4'>
        <div className='text-center'>
          <div className='mb-4 text-5xl'>📦</div>
          <p className='text-gray-600'>পণ্যটি পাওয়া যায়নি</p>
        </div>
        <button
          onClick={() => navigate(-1)}
          className='rounded-xl bg-rose-500 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-600'
        >
          পিছনে যান
        </button>
      </div>
    )
  }

  if (isNaN(parseFloat(sellerPrice || ''))) {
    return (
      <div className='flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 p-4'>
        <div className='max-w-md w-full p-8 bg-white rounded-2xl shadow-lg text-center'>
          <div className='text-amber-500 mb-4'>
            <FiAlertCircle className='mx-auto h-16 w-16' />
          </div>
          <h2 className='text-xl font-bold text-gray-800 mb-2'>সেলিং প্রাইস সঠিক নয়</h2>
          <p className='text-gray-600 mb-6'>দুঃখিত, এই পণ্যের জন্য সেলিং প্রাইস সঠিক নয়</p>
          <button
            onClick={() => navigate(-1)}
            className='bg-rose-500 text-white px-6 py-2.5 rounded-xl hover:bg-rose-600 transition-colors w-full'
          >
            ফিরে যান
          </button>
        </div>
      </div>
    )
  }

  const images = product.ProductImage || []
  const mainImage =
    selectedImage?.imageUrl ||
    currentImageIndex?.imageUrl ||
    images[0]?.imageUrl ||
    '/placeholder.jpg'

  return (
    <div className='min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8'>
      <div className='mx-auto max-w-7xl'>
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className='mb-4 flex items-center gap-2 text-sm text-gray-500 transition hover:text-gray-700'
        >
          <FiChevronLeft className='h-4 w-4' />
          পণ্যের তালিকায় ফিরে যান
        </button>

        <div className='flex flex-col gap-6 lg:flex-row'>
          {/* LEFT COLUMN - Product Images & Details */}
          <div className='w-full lg:w-1/2 space-y-6'>
            {/* Main Image Card */}
            <div className='overflow-hidden rounded-2xl bg-white shadow-sm border border-gray-100'>
              <div className='relative aspect-square'>
                <img
                  src={mainImage}
                  alt={product.name}
                  className='h-full w-full object-contain p-4'
                />
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => {
                        const currentIndex = images.findIndex(
                          img => img.imageUrl === currentImageIndex?.imageUrl
                        )
                        const prevIndex = currentIndex <= 0 ? images.length - 1 : currentIndex - 1
                        setCurrentImageIndex(images[prevIndex])
                        setSelectedImage(images[prevIndex])
                      }}
                      className='absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-md transition hover:bg-white'
                    >
                      <FiChevronLeft className='h-5 w-5 text-gray-700' />
                    </button>
                    <button
                      onClick={() => {
                        const currentIndex = images.findIndex(
                          img => img.imageUrl === currentImageIndex?.imageUrl
                        )
                        const nextIndex = (currentIndex + 1) % images.length
                        setCurrentImageIndex(images[nextIndex])
                        setSelectedImage(images[nextIndex])
                      }}
                      className='absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-md transition hover:bg-white'
                    >
                      <FiChevronRight className='h-5 w-5 text-gray-700' />
                    </button>
                  </>
                )}
              </div>
              {/* Thumbnails */}
              {images.length > 1 && (
                <div className='border-t border-gray-100 p-3'>
                  <div className='grid grid-cols-5 gap-2'>
                    {images.map((img, idx) => (
                      <button
                        key={img.imageId}
                        onClick={() => {
                          setSelectedImage(img)
                          setCurrentImageIndex(img)
                        }}
                        className={`aspect-square overflow-hidden rounded-lg border-2 transition-all ${
                          selectedImage?.imageUrl === img.imageUrl
                            ? 'border-rose-500 ring-2 ring-rose-500/20'
                            : 'border-gray-100 hover:border-gray-300'
                        }`}
                      >
                        <img
                          src={img.imageUrl}
                          alt={`Thumbnail ${idx + 1}`}
                          className='h-full w-full object-cover'
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Product Info Card (mobile only - hidden on desktop because right column has it) */}
            <div className='block lg:hidden'>
              <div className='rounded-2xl bg-white p-5 shadow-sm border border-gray-100'>
                <h1 className='text-xl font-bold text-gray-800'>{product.name}</h1>
                <p className='mt-2 text-sm text-gray-500'>{product.description}</p>
                <div className='mt-3 flex items-baseline gap-2'>
                  <span className='text-2xl font-bold text-rose-600'>
                    {formatCurrency(productPrice)}
                  </span>
                  {sellerPrice && (
                    <span className='text-sm text-gray-400 line-through'>
                      {formatCurrency(Number(sellerPrice))}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Variants Section */}
            {Object.keys(variantGroups).length > 0 && (
              <div className='rounded-2xl bg-white p-5 shadow-sm border border-gray-100'>
                <h2 className='mb-4 text-base font-semibold text-gray-800'>
                  ভেরিয়েন্ট নির্বাচন করুন
                </h2>
                <div className='space-y-4'>
                  {Object.entries(variantGroups).map(([key, values]) => (
                    <div key={key}>
                      <p className='mb-2 text-sm font-medium text-gray-700'>
                        {key} {!selectedOptions[key] && <span className='text-rose-500'>*</span>}
                      </p>
                      <div className='flex flex-wrap gap-2'>
                        {values.map(val => (
                          <button
                            key={val}
                            onClick={() => handleOptionSelect(key, val)}
                            className={`rounded-full border px-4 py-2 text-sm font-medium transition-all ${
                              selectedOptions[key] === val
                                ? 'border-rose-500 bg-rose-50 text-rose-600 shadow-sm'
                                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {val}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add-ons Section */}
            {addOns.length > 0 && (
              <div className='rounded-2xl bg-white p-5 shadow-sm border border-gray-100'>
                <h2 className='mb-4 text-base font-semibold text-gray-800'>অতিরিক্ত সামগ্রী</h2>
                <div className='space-y-2'>
                  {addOns.map(addOn => (
                    <button
                      key={addOn.id}
                      onClick={() => handleAddOnSelect(addOn)}
                      className={`flex w-full items-center justify-between rounded-xl border p-3 transition-all ${
                        selectedAddOns.some(item => item.id === addOn.id)
                          ? 'border-rose-200 bg-rose-50/40'
                          : 'border-gray-100 bg-gray-50 hover:border-gray-200'
                      }`}
                    >
                      <div className='flex items-center gap-3'>
                        {addOn.imageUrl && (
                          <img
                            src={addOn.imageUrl}
                            alt={addOn.name}
                            className='h-10 w-10 rounded-lg object-cover'
                          />
                        )}
                        <span className='text-sm font-medium text-gray-800'>{addOn.name}</span>
                      </div>
                      <div className='flex items-center gap-3'>
                        <span className='text-sm font-semibold text-emerald-600'>
                          {formatCurrency(addOn.price)}
                        </span>
                        <div
                          className={`flex h-5 w-5 items-center justify-center rounded-md border ${
                            selectedAddOns.some(item => item.id === addOn.id)
                              ? 'border-rose-500 bg-rose-500'
                              : 'border-gray-300 bg-white'
                          }`}
                        >
                          {selectedAddOns.some(item => item.id === addOn.id) && (
                            <svg
                              className='h-3 w-3 text-white'
                              fill='currentColor'
                              viewBox='0 0 20 20'
                            >
                              <path
                                fillRule='evenodd'
                                d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                                clipRule='evenodd'
                              />
                            </svg>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
                {selectedAddOns.length > 0 && (
                  <div className='mt-3 rounded-lg bg-gray-50 p-3'>
                    <p className='text-sm text-gray-600'>
                      নির্বাচিত: {selectedAddOns.map(a => a.name).join(', ')}
                    </p>
                    <p className='text-sm font-semibold text-gray-800 mt-1'>
                      অতিরিক্ত মূল্য: {formatCurrency(addOnsTotal)}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Quantity */}
            <div className='rounded-2xl bg-white p-5 shadow-sm border border-gray-100'>
              <label className='block text-sm font-medium text-gray-700 mb-2'>পরিমাণ</label>
              <div className='flex items-center gap-3'>
                <button
                  onClick={() => handleQuantityChange((parseInt(quantity) - 1).toString())}
                  disabled={parseInt(quantity) <= 1}
                  className='flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-50 disabled:opacity-50'
                >
                  <FiMinus className='h-4 w-4' />
                </button>
                <input
                  type='number'
                  min='1'
                  value={quantity}
                  onChange={e => handleQuantityChange(e.target.value)}
                  className='w-20 rounded-xl border border-gray-200 px-3 py-2 text-center text-base font-semibold text-gray-800 focus:border-rose-300 focus:outline-none focus:ring-1 focus:ring-rose-500'
                />
                <button
                  onClick={() => handleQuantityChange((parseInt(quantity) + 1).toString())}
                  className='flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-600 transition hover:bg-gray-50'
                >
                  <FiPlus className='h-4 w-4' />
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN - Order Form */}
          <div className='w-full lg:w-1/2 space-y-6'>
            {/* Product Info (desktop only) */}
            <div className='hidden rounded-2xl bg-white p-5 shadow-sm border border-gray-100 lg:block'>
              <h1 className='text-xl font-bold text-gray-800'>{product.name}</h1>
              <p className='mt-2 text-sm text-gray-500'>{product.description}</p>
              <div className='mt-3 flex items-baseline gap-2'>
                <span className='text-2xl font-bold text-rose-600'>
                  {formatCurrency(productPrice)}
                </span>
                {sellerPrice && (
                  <span className='text-sm text-gray-400 line-through'>
                    {formatCurrency(Number(sellerPrice))}
                  </span>
                )}
              </div>
            </div>

            {/* Customer Form Card */}
            <div className='rounded-2xl bg-white shadow-sm border border-gray-100 overflow-hidden'>
              <div className='border-b border-gray-100 bg-gray-50/50 px-5 py-4'>
                <h2 className='text-base font-semibold text-gray-800'>অর্ডার সম্পূর্ণ করুন</h2>
                <p className='text-xs text-gray-500 mt-0.5'>আপনার তথ্য সঠিকভাবে পূরণ করুন</p>
              </div>

              <form onSubmit={formik.handleSubmit} className='p-5 space-y-5'>
                {/* Phone */}
                <div>
                  <label className='mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500'>
                    <FiPhone className='inline mr-1 h-3 w-3' /> মোবাইল নম্বর *
                  </label>
                  <div className='flex gap-2 items-center'>
                    <input
                      type='text'
                      className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition focus:ring-2 ${
                        formik.touched.customerPhone && formik.errors.customerPhone
                          ? 'border-rose-300 focus:border-rose-300 focus:ring-rose-100'
                          : 'border-gray-200 focus:border-gray-300 focus:ring-gray-100'
                      }`}
                      placeholder='01XXXXXXXXX'
                      {...formik.getFieldProps('customerPhone')}
                    />
                    {checkingCustomer && (
                      <div className='h-5 w-5 animate-spin rounded-full border-2 border-gray-200 border-t-rose-500' />
                    )}
                  </div>
                  {formik.touched.customerPhone && formik.errors.customerPhone && (
                    <p className='mt-1 text-xs text-rose-500'>{formik.errors.customerPhone}</p>
                  )}

                  {/* OTP Section */}
                  {otpSent && !customer && (
                    <div className='mt-3 rounded-xl border border-blue-200 bg-blue-50 p-3'>
                      <p className='text-sm text-blue-800'>
                        আপনার ফোনে 6 ডিজিটের OTP পাঠানো হয়েছে
                      </p>
                      <div className='mt-2 flex gap-2'>
                        <input
                          type='text'
                          value={otp}
                          onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          placeholder='OTP লিখুন'
                          className='flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-rose-300'
                          maxLength={6}
                        />
                        <button
                          type='button'
                          onClick={verifyOtpAndCreateCustomer}
                          disabled={verifyingOtp || otp.length !== 6}
                          className='rounded-lg bg-rose-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-600 disabled:opacity-50'
                        >
                          {verifyingOtp ? 'ভেরিফাই...' : 'ভেরিফাই'}
                        </button>
                      </div>
                      {verifyingOtpError && (
                        <p className='mt-1 text-xs text-rose-500'>{verifyingOtpError}</p>
                      )}
                    </div>
                  )}

                  {customer && (
                    <div className='mt-2 rounded-lg bg-emerald-50 p-2 text-sm text-emerald-700'>
                      ✓ ফোন নম্বর ভেরিফাইড
                    </div>
                  )}
                </div>

                {/* Name */}
                <div>
                  <label className='mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500'>
                    <FiUser className='inline mr-1 h-3 w-3' /> নাম *
                  </label>
                  <input
                    type='text'
                    className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition focus:ring-2 ${
                      formik.touched.customerName && formik.errors.customerName
                        ? 'border-rose-300 focus:border-rose-300 focus:ring-rose-100'
                        : 'border-gray-200 focus:border-gray-300 focus:ring-gray-100'
                    }`}
                    placeholder='আপনার নাম লিখুন'
                    {...formik.getFieldProps('customerName')}
                  />
                  {formik.touched.customerName && formik.errors.customerName && (
                    <p className='mt-1 text-xs text-rose-500'>{formik.errors.customerName}</p>
                  )}
                </div>

                {/* District & Upazilla */}
                <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                  <div>
                    <label className='mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500'>
                      <FiMapPin className='inline mr-1 h-3 w-3' /> জেলা *
                    </label>
                    <select
                      className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition focus:ring-2 ${
                        formik.touched.zilla && formik.errors.zilla
                          ? 'border-rose-300 focus:border-rose-300 focus:ring-rose-100'
                          : 'border-gray-200 focus:border-gray-300 focus:ring-gray-100'
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
                      <p className='mt-1 text-xs text-rose-500'>{formik.errors.zilla}</p>
                    )}
                  </div>
                  <div>
                    <label className='mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500'>
                      থানা/এলাকা *
                    </label>
                    <select
                      className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition focus:ring-2 ${
                        formik.touched.upazilla && formik.errors.upazilla
                          ? 'border-rose-300 focus:border-rose-300 focus:ring-rose-100'
                          : 'border-gray-200 focus:border-gray-300 focus:ring-gray-100'
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
                      <p className='mt-1 text-xs text-rose-500'>{formik.errors.upazilla}</p>
                    )}
                  </div>
                </div>

                {/* Delivery Address */}
                <div>
                  <label className='mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500'>
                    <FiEdit2 className='inline mr-1 h-3 w-3' /> ডেলিভারির ঠিকানা *
                  </label>
                  <textarea
                    rows={3}
                    className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition focus:ring-2 ${
                      formik.touched.deliveryAddress && formik.errors.deliveryAddress
                        ? 'border-rose-300 focus:border-rose-300 focus:ring-rose-100'
                        : 'border-gray-200 focus:border-gray-300 focus:ring-gray-100'
                    }`}
                    placeholder='আপনার সম্পূর্ণ ঠিকানা লিখুন'
                    {...formik.getFieldProps('deliveryAddress')}
                  />
                  {formik.touched.deliveryAddress && formik.errors.deliveryAddress && (
                    <p className='mt-1 text-xs text-rose-500'>{formik.errors.deliveryAddress}</p>
                  )}
                </div>

                {/* Comments */}
                <div>
                  <label className='mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500'>
                    অতিরিক্ত মন্তব্য (ঐচ্ছিক)
                  </label>
                  <textarea
                    rows={2}
                    className='w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition focus:border-gray-300 focus:ring-1 focus:ring-gray-200'
                    placeholder='অর্ডার সম্পর্কে কোন অতিরিক্ত নির্দেশিকা থাকলে লিখুন'
                    {...formik.getFieldProps('comments')}
                  />
                </div>

                {/* Order Summary */}
                {/* Order Summary - Fixed calculation */}
                <div className='rounded-xl bg-gray-50 p-4'>
                  <div className='space-y-1 text-sm'>
                    {/* Base product price (without add-ons) */}
                    <div className='flex justify-between'>
                      <span className='text-gray-600'>পণ্যের মূল্য:</span>
                      <span className='font-medium'>
                        {formatCurrency(Number(sellerPrice) || Number(product?.price) || 0)}
                      </span>
                    </div>
                    {/* Add-ons total (only if any selected) */}
                    {selectedAddOns.length > 0 && (
                      <div className='flex justify-between'>
                        <span className='text-gray-600'>অতিরিক্ত সামগ্রী:</span>
                        <span className='font-medium'>+{formatCurrency(addOnsTotal)}</span>
                      </div>
                    )}
                    <div className='flex justify-between'>
                      <span className='text-gray-600'>পরিমাণ:</span>
                      <span className='font-medium'>{quantity}</span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-gray-600'>ডেলিভারি চার্জ:</span>
                      <span className='font-medium'>{formatCurrency(deliveryCharge)}</span>
                    </div>
                    <div className='flex justify-between border-t border-gray-200 pt-2 mt-2 font-semibold'>
                      <span>মোট:</span>
                      <span className='text-rose-600'>
                        {formatCurrency(
                          ((Number(sellerPrice) || Number(product?.price) || 0) + addOnsTotal) *
                            parseInt(quantity, 10) +
                            +deliveryCharge * 1
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type='submit'
                  disabled={isSubmitting || !customer}
                  className='flex w-full items-center justify-center gap-2 rounded-xl bg-rose-500 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-rose-600 disabled:opacity-50'
                >
                  {isSubmitting ? (
                    <>
                      <div className='h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white' />
                      প্রসেসিং...
                    </>
                  ) : (
                    <>
                      <FiShoppingCart className='h-5 w-5' />
                      অর্ডার কনফার্ম করুন
                    </>
                  )}
                </button>
                {validationError && (
                  <p className='text-center text-sm text-rose-500'>{validationError}</p>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal - Redesigned */}
      {showPaymentModal && selectedOrder && (
        <div className='fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm sm:items-center sm:p-4'>
          <div className='w-full max-w-md rounded-t-2xl bg-white shadow-xl sm:rounded-2xl'>
            <div className='flex items-center justify-between border-b border-gray-100 p-4'>
              <div>
                <h2 className='text-lg font-semibold text-gray-800'>পেমেন্ট সম্পূর্ণ করুন</h2>
                <p className='text-xs text-gray-500'>অর্ডার #{selectedOrder.orderId}</p>
              </div>
              <button
                onClick={() => setShowPaymentModal(false)}
                className='rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600'
              >
                <svg className='h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M6 18L18 6M6 6l12 12'
                  />
                </svg>
              </button>
            </div>

            <div className='p-5 space-y-5'>
              <div className='rounded-xl bg-amber-50 border border-amber-200 p-3'>
                <p className='text-sm text-amber-700 flex items-start gap-2'>
                  <FiAlertCircle className='h-4 w-4 mt-0.5 shrink-0' />
                  সতর্কতা: ভুল পেমেন্ট তথ্য দিলে অর্ডার রিজেক্ট করা হবে।
                </p>
              </div>

              <div className='flex items-center justify-between rounded-xl bg-gray-50 p-4'>
                <span className='text-sm font-medium text-gray-600'>মোট পেমেন্ট:</span>
                <span className='text-xl font-bold text-rose-600'>
                  {formatCurrency(selectedOrder.deliveryCharge)}
                </span>
              </div>

              <div>
                <label className='mb-1.5 block text-xs font-semibold uppercase text-gray-500'>
                  সিস্টেম ওয়ালেট *
                </label>
                <select
                  className='w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-rose-300 focus:ring-1 focus:ring-rose-200'
                  value={selectedSystemWallet?.walletId || ''}
                  onChange={e => {
                    const walletId = parseInt(e.target.value)
                    const wallet = systemWallets.find(w => w.walletId === walletId)
                    setSelectedSystemWallet(wallet || null)
                  }}
                >
                  <option value=''>সিলেক্ট করুন</option>
                  {systemWallets.map(wallet => (
                    <option key={wallet.walletId} value={wallet.walletId}>
                      {wallet.walletName} ({wallet.walletPhoneNo})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className='mb-1.5 block text-xs font-semibold uppercase text-gray-500'>
                  আপনার ওয়ালেট নম্বর *
                </label>
                <input
                  type='text'
                  className='w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-rose-300 focus:ring-1 focus:ring-rose-200'
                  placeholder='01XXXXXXXXX'
                  value={customerWalletNumber}
                  onChange={e => setCustomerWalletNumber(e.target.value)}
                />
              </div>

              <div>
                <label className='mb-1.5 block text-xs font-semibold uppercase text-gray-500'>
                  ট্রানজেকশন আইডি *
                </label>
                <input
                  type='text'
                  className='w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-rose-300 focus:ring-1 focus:ring-rose-200'
                  placeholder='ট্রানজেকশন আইডি'
                  value={transactionId}
                  onChange={e => setTransactionId(e.target.value)}
                />
              </div>

              <div className='rounded-xl bg-blue-50 border border-blue-200 p-3'>
                <p className='text-xs font-medium text-blue-800 mb-1'>পেমেন্ট নির্দেশনা:</p>
                <ul className='list-decimal list-inside space-y-0.5 text-xs text-blue-700'>
                  <li>উপরের নির্বাচিত ওয়ালেটে {selectedOrder.deliveryCharge}৳ সেন্ড মানি করুন</li>
                  <li>ট্রানজেকশন আইডি সঠিকভাবে লিখুন</li>
                  <li>পেমেন্ট কনফার্ম করুন বাটনে ক্লিক করুন</li>
                </ul>
              </div>

              {paymentError && (
                <div className='rounded-xl bg-rose-50 border border-rose-200 p-3 text-sm text-rose-600'>
                  {paymentError}
                </div>
              )}

              <div className='flex flex-col gap-3'>
                <button
                  onClick={handlePayment}
                  disabled={!selectedSystemWallet || !customerWalletNumber || !transactionId}
                  className='w-full rounded-xl bg-rose-500 py-3 text-sm font-semibold text-white transition hover:bg-rose-600 disabled:opacity-50'
                >
                  পেমেন্ট কনফার্ম করুন
                </button>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className='w-full rounded-xl border border-gray-200 bg-white py-3 text-sm font-medium text-gray-600 transition hover:bg-gray-50'
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
