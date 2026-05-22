// ProductDetail.tsx — Fully responsive + compact return policy + download fix
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { FaFacebookF, FaHeart, FaLink, FaRegHeart, FaSpinner, FaWhatsapp } from 'react-icons/fa'
import {
  FiAlertCircle,
  FiCheck,
  FiChevronLeft,
  FiCopy,
  FiDownload,
  FiInfo,
  FiMinus,
  FiPlus,
  FiRefreshCw,
  FiShare2,
  FiShoppingCart,
  FiStar,
  FiTruck,
  FiYoutube,
} from 'react-icons/fi'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'
import { productApi } from '../Api/product.api'
import { Product } from '../Api/shop.api'
import { useCartFavorite } from '../Context/cartContext'
import { useAuth } from '../Hooks/useAuth'
import { shortenUrl } from '../utils/shortenUrl'
import { CART_ITEMS_KEY, FAVORITES_KEY } from '../utils/utils.variables'

// ============================================================================
// TYPES
// ============================================================================

export type CartItem = {
  shopId: number
  shopName: string
  shopLocation?: string
  deliveryChargeInside?: number
  deliveryChargeOutside?: number
  productId: number
  name: string
  basePrice: number
  sellingPrice: number
  quantity: number
  imageUrl: string
  imageId: number
  selectedOptions: Record<string, string>
  selectedAddOns: AddOn[]
  cartItemId: string
}

export type AddOn = { id: string; name: string; price: number; imageUrl?: string }

// ============================================================================
// UTILITIES
// ============================================================================

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('bn-BD', {
    style: 'currency',
    currency: 'BDT',
    minimumFractionDigits: 0,
  }).format(amount)
}

// ============================================================================
// REUSABLE COMPONENTS
// ============================================================================

const IconButton = ({
  onClick,
  icon: Icon,
  label,
  active = false,
  disabled = false,
  className = '',
}: any) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`flex items-center justify-center rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
      active
        ? 'bg-rose-500 text-white hover:bg-rose-600 focus:ring-rose-500/50'
        : 'bg-white text-gray-600 hover:bg-gray-100 focus:ring-gray-300'
    } ${disabled ? 'cursor-not-allowed opacity-50' : ''} ${className}`}
    aria-label={label}
  >
    <Icon className='h-4 w-4' />
  </button>
)

const QuantitySelector = ({ quantity, onIncrease, onDecrease, onChange }: any) => (
  <div className='flex h-12 w-fit items-center overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm'>
    <button
      onClick={onDecrease}
      className='flex h-full w-12 items-center justify-center text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700'
      aria-label='পরিমাণ কমান'
    >
      <FiMinus className='h-4 w-4' />
    </button>
    <input
      type='text'
      inputMode='numeric'
      value={quantity}
      onChange={onChange}
      className='w-16 bg-transparent text-center text-base font-semibold text-gray-800 outline-none'
      aria-label='পরিমাণ'
    />
    <button
      onClick={onIncrease}
      className='flex h-full w-12 items-center justify-center text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700'
      aria-label='পরিমাণ বাড়ান'
    >
      <FiPlus className='h-4 w-4' />
    </button>
  </div>
)

const Section = ({ title, icon: Icon, children, className = '' }: any) => (
  <div
    className={`overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm ${className}`}
  >
    {title && (
      <div className='flex items-center gap-2 border-b border-gray-100 px-5 py-4'>
        {Icon && <Icon className='h-4 w-4 text-rose-500' />}
        <h2 className='text-sm font-semibold text-gray-700'>{title}</h2>
      </div>
    )}
    <div className='p-5'>{children}</div>
  </div>
)

const VariantChip = ({ label, selected, onClick }: any) => (
  <button
    onClick={onClick}
    className={`rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200 ${
      selected
        ? 'border-rose-500 bg-rose-50 text-rose-600 shadow-sm'
        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
    }`}
  >
    {label}
  </button>
)

const AddOnCard = ({ addOn, selected, onToggle }: any) => (
  <button
    onClick={onToggle}
    className={`flex w-full items-center justify-between rounded-xl border p-3 text-left transition-all duration-200 ${
      selected
        ? 'border-rose-200 bg-rose-50/40 shadow-sm'
        : 'border-gray-100 bg-gray-50 hover:border-gray-200'
    }`}
  >
    <div className='flex items-center gap-3'>
      {addOn.imageUrl && (
        <img
          src={addOn.imageUrl}
          alt={addOn.name}
          className='h-10 w-10 rounded-lg object-cover'
          loading='lazy'
        />
      )}
      <span className='text-sm font-medium text-gray-800'>{addOn.name}</span>
    </div>
    <div className='flex items-center gap-3'>
      <span className='text-sm font-semibold text-emerald-600'>{formatCurrency(addOn.price)}</span>
      <div
        className={`flex h-5 w-5 items-center justify-center rounded-md border transition-colors ${
          selected ? 'border-rose-500 bg-rose-500' : 'border-gray-300 bg-white'
        }`}
      >
        {selected && <FiCheck className='h-3 w-3 text-white' />}
      </div>
    </div>
  </button>
)

const InfoRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className='flex items-center justify-between border-b border-gray-100 pb-3 last:border-0 last:pb-0'>
    <span className='text-sm text-gray-500'>{label}</span>
    <span className='text-sm font-medium text-gray-800'>{value}</span>
  </div>
)

// Compact Return Policy Component
const ReturnPolicy = () => {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <div className='overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm'>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className='flex w-full items-center justify-between px-5 py-4 text-left'
      >
        <div className='flex items-center gap-2'>
          <FiRefreshCw className='h-4 w-4 text-rose-500' />
          <h2 className='text-sm font-semibold text-gray-700'>রিটার্ন নীতিমালা</h2>
        </div>
        <svg
          className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
        >
          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
        </svg>
      </button>
      {isOpen && (
        <div className='border-t border-gray-100 px-5 pb-5 pt-2'>
          <ul className='space-y-2 text-xs text-gray-600'>
            <li className='flex gap-2'>
              <FiCheck className='mt-0.5 h-3.5 w-3.5 text-emerald-500 shrink-0' />
              <span>
                <strong className='font-semibold'>ডেলিভারি সময় পণ্য পরীক্ষা:</strong> ডেলিভারি
                কর্মীর উপস্থিতিতে পণ্য পরীক্ষা করুন। ত্রুটিপূর্ণ পেলে সাথে সাথে ফেরত দিন। ২৪ ঘন্টার
                মধ্যে নতুন পণ্য বা টাকা ফেরত।
              </span>
            </li>
            <li className='flex gap-2'>
              <FiCheck className='mt-0.5 h-3.5 w-3.5 text-emerald-500 shrink-0' />
              <span>
                <strong className='font-semibold'>ত্রুটির ধরন অনুযায়ী রিফান্ড:</strong> প্রকৃত
                ত্রুটিতে সম্পূর্ণ টাকা ফেরত। অন্যথায় ডেলিভারি চার্জ বাদে বাকি টাকা ফেরত।
              </span>
            </li>
            <li className='flex gap-2'>
              <FiCheck className='mt-0.5 h-3.5 w-3.5 text-emerald-500 shrink-0' />
              <span>
                <strong className='font-semibold'>ভিডিও প্রমাণ জমা দেওয়া:</strong> আনবক্সিং ভিডিও
                পাঠান যেখানে পণ্যের আইডি ও ত্রুটি স্পষ্ট দেখা যায়।
              </span>
            </li>
            <li className='flex gap-2'>
              <FiCheck className='mt-0.5 h-3.5 w-3.5 text-emerald-500 shrink-0' />
              <span>
                <strong className='font-semibold'>পরবর্তীতে রিটার্ন:</strong> ডেলিভারি কর্মী চলে
                যাওয়ার পর রিটার্ন করতে ডেলিভারি চার্জসহ পণ্য ফেরত দিতে হবে। ব্যবহৃত/ধোয়া পণ্য
                গ্রহণযোগ্য নয়।
              </span>
            </li>
          </ul>
        </div>
      )}
    </div>
  )
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const ProductDetail = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { productId } = useParams<{ productId: string }>()
  const { loadCartCount, loadFavoriteCount } = useCartFavorite()
  const imageGalleryRef = useRef<HTMLDivElement>(null)
  const [sharePriceInput, setSharePriceInput] = useState<string>('')

  // State
  const [product, setProduct] = useState<Product | null>(location.state?.product || null)
  const [loading, setLoading] = useState(!location.state?.product)
  const [error, setError] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState<{ imageUrl: string; imageId: number } | null>(
    null
  )
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({})
  const [selectedAddOns, setSelectedAddOns] = useState<AddOn[]>([])
  const [quantity, setQuantity] = useState<string>('1')
  const [sellingPrice, setSellingPrice] = useState('')
  const [validationError, setValidationError] = useState<string | null>('একটি ছবি নির্বাচন করুন')
  const [isFavorite, setIsFavorite] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [priceError, setPriceError] = useState('')
  const [userType, setUserType] = useState<'customer' | 'seller'>('customer')
  const [shareLink, setShareLink] = useState('')
  const [linkCopied, setLinkCopied] = useState(false)
  const [pageLinkCopied, setPageLinkCopied] = useState(false) // NEW: for link button
  const [, setLinkGenerationError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'details' | 'shipping' | 'returns' | 'reviews'>(
    'details'
  )

  // Derived data
  const addOns: AddOn[] = product?.addOns ? JSON.parse(product.addOns) : []
  const addOnsTotal = selectedAddOns.reduce((t, a) => t + Number(a.price), 0)
  const minSellingPrice = (Number(product?.basePrice) || 0) + addOnsTotal
  const suggestedMaxPrice = (Number(product?.suggestedMaxPrice) || 0) + addOnsTotal
  const baseProductPrice = Number(product?.basePrice) || 0
  const customerPrice = (Number(product?.price) || 0) + addOnsTotal
  const totalPrice = (parseFloat(sellingPrice) || 0) * parseInt(quantity)

  const variantGroups = useMemo(() => {
    if (!product?.ProductVariant) return {}
    return product.ProductVariant.reduce<Record<string, string[]>>((acc, v) => {
      if (!acc[v.name]) acc[v.name] = []
      if (!acc[v.name].includes(v.value)) acc[v.name].push(v.value)
      return acc
    }, {})
  }, [product?.ProductVariant])

  // Initialize favorite state
  useEffect(() => {
    if (productId) {
      const favorites = JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]') as Product[]
      setIsFavorite(favorites.some(f => f.productId === Number(productId)))
    }
  }, [productId])

  // Fetch product
  useEffect(() => {
    if (!location.state?.product && productId) {
      const fetchProduct = async () => {
        try {
          setLoading(true)
          const { success, data, message } = await productApi.getProductDetail(parseInt(productId))
          if (success) {
            setProduct({
              ...data.product,
              basePrice: data.product.basePrice || data.product.price || 0,
              suggestedMaxPrice: data.product.suggestedMaxPrice || data.product.price || 0,
              price: data.product.price || undefined,
            })
            setUserType(data.userType)
            setSellingPrice(
              data.product.basePrice?.toString() || data.product.price?.toString() || ''
            )
            if (data.product.ProductImage?.[0]) {
              setSelectedImage({
                imageUrl: data.product.ProductImage[0].imageUrl,
                imageId: data.product.ProductImage[0].imageId,
              })
            }
          } else {
            setError(message || 'পণ্যটি পাওয়া যায়নি')
          }
        } catch {
          setError('পণ্য লোড করতে ব্যর্থ হয়েছে')
        } finally {
          setLoading(false)
        }
      }
      fetchProduct()
    }
  }, [productId, location.state])

  // Update selling price for customer
  useEffect(() => {
    if (user?.role === 'Seller') return
    setSellingPrice(customerPrice.toString())
  }, [user, customerPrice])

  // Validation
  useEffect(() => {
    if (!product) return

    const qty = parseInt(quantity)
    if (isNaN(qty) || qty < 1) {
      setValidationError('পরিমাণ কমপক্ষে ১ হতে হবে')
      return
    }

    if (userType === 'seller') {
      const price = parseFloat(sellingPrice) || 0
      if (price < minSellingPrice) {
        setValidationError(`মূল্য কমপক্ষে ${formatCurrency(minSellingPrice)} হতে হবে`)
        setPriceError(`সর্বনিম্ন মূল্য: ${formatCurrency(minSellingPrice)}`)
        return
      }
      setPriceError('')
    }

    if (!selectedImage) {
      setValidationError('একটি ছবি নির্বাচন করুন')
      return
    }

    const missingVariants = Object.keys(variantGroups).filter(key => !selectedOptions[key])
    if (missingVariants.length > 0) {
      setValidationError(`দয়া করে ${missingVariants[0]} নির্বাচন করুন`)
      return
    }

    setValidationError(null)
  }, [
    quantity,
    sellingPrice,
    product,
    selectedImage,
    selectedOptions,
    selectedAddOns,
    userType,
    minSellingPrice,
    variantGroups,
  ])

  // Generate share link
  const generateShareLinkFromInput = useCallback(async () => {
    if (!product || !user?.referralCode) return
    const price = parseFloat(sharePriceInput)
    if (isNaN(price) || price < baseProductPrice) {
      setLinkGenerationError(`মূল্য কমপক্ষে ${formatCurrency(baseProductPrice)} হতে হবে`)
      return
    }
    const link = `${window.location.origin}/products/${productId}/order?sellerPrice=${price}&referralCode=${user.referralCode}`
    setShareLink(link)
    setLinkGenerationError(null)
  }, [product, productId, sharePriceInput, baseProductPrice, user?.referralCode])

  useEffect(() => {
    if (userType === 'seller' && user?.isVerified && sellingPrice) {
      generateShareLinkFromInput()
    }
  }, [sellingPrice, selectedAddOns, userType, user, generateShareLinkFromInput])

  // Handlers
  const toggleFavorite = () => {
    if (!product) return
    const saved: Product[] = JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]')
    if (isFavorite) {
      localStorage.setItem(
        FAVORITES_KEY,
        JSON.stringify(saved.filter(f => f.productId !== product.productId))
      )
    } else {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify([...saved, product]))
    }
    setIsFavorite(!isFavorite)
    loadFavoriteCount()
  }

  // FIXED download function - properly fetches image as blob with CORS and delayed revoke
  const downloadFile = async (url: string, filename: string) => {
    try {
      setDownloading(true)
      const response = await fetch(url, {
        mode: 'cors',
        credentials: 'omit',
      })
      if (!response.ok) throw new Error('Download failed')
      const blob = await response.blob()
      const blobUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      const ext = url.split('.').pop()?.split('?')[0] || 'jpg'
      link.download = `${filename}.${ext}`
      link.href = blobUrl
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      // Delay revoke to ensure download starts
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 100)
    } catch (error) {
      console.error('Download failed:', error)
      alert('ছবি ডাউনলোড করতে ব্যর্থ হয়েছে। পরে আবার চেষ্টা করুন।')
    } finally {
      setDownloading(false)
    }
  }

  const copyDescription = () => {
    if (!product) return
    navigator.clipboard.writeText(product.description)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const copyShareLink = async () => {
    if (!shareLink) return
    const short = await shortenUrl(shareLink)
    navigator.clipboard.writeText(short)
    setLinkCopied(true)
    setTimeout(() => setLinkCopied(false), 2000)
  }

  // NEW: copy current page URL for the link button
  const copyPageLink = async () => {
    const currentUrl = window.location.href
    await navigator.clipboard.writeText(currentUrl)
    setPageLinkCopied(true)
    setTimeout(() => setPageLinkCopied(false), 2000)
  }

  // NEW: share on WhatsApp
  const shareOnWhatsApp = () => {
    const text = encodeURIComponent(`${product?.name}\n${window.location.href}`)
    window.open(`https://wa.me/?text=${text}`, '_blank')
  }

  // NEW: share on Facebook
  const shareOnFacebook = () => {
    const url = encodeURIComponent(window.location.href)
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank')
  }

  const addToCart = () => {
    if (!product || !selectedImage || validationError) return

    const item: CartItem = {
      productId: product.productId,
      shopId: product.shopId,
      shopName: product.shop.shopName,
      shopLocation: product.shop.shopLocation,
      name: product.name,
      basePrice: minSellingPrice,
      sellingPrice: parseFloat(sellingPrice) || 0,
      quantity: parseInt(quantity),
      imageUrl: selectedImage.imageUrl,
      imageId: selectedImage.imageId,
      selectedOptions,
      selectedAddOns,
      deliveryChargeInside: product.shop.deliveryChargeInside,
      deliveryChargeOutside: product.shop.deliveryChargeOutside,
      cartItemId: uuidv4(),
    }

    const cart = JSON.parse(localStorage.getItem(CART_ITEMS_KEY) || '[]')
    cart.push(item)
    localStorage.setItem(CART_ITEMS_KEY, JSON.stringify(cart))
    loadCartCount()
    navigate('/cart')
  }

  const isLoggedIn = !!user

  // Loading state
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

  // Error state
  if (error || !product) {
    return (
      <div className='flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 p-4'>
        <div className='text-center'>
          <div className='mb-4 text-5xl'>🛒</div>
          <p className='text-gray-600'>{error || 'পণ্যটি পাওয়া যায়নি'}</p>
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

  const images = product.ProductImage || []
  const mainImage = selectedImage?.imageUrl || images[0]?.imageUrl || '/placeholder.jpg'

  return (
    <div className='min-h-screen bg-gray-50 pb-28 lg:pb-8'>
      {/* Mobile Header – only for logged-out users */}
      {!isLoggedIn && (
        <header className='sticky top-0 z-30 flex items-center justify-between border-b border-gray-100 bg-white/95 px-4 py-3 backdrop-blur-sm lg:hidden'>
          <IconButton
            onClick={() => navigate(-1)}
            icon={FiChevronLeft}
            label='পিছনে'
            className='!h-9 !w-9 !bg-gray-100'
          />
          <span className='text-sm font-semibold text-gray-800'>পণ্যের বিবরণ</span>
          <IconButton
            onClick={toggleFavorite}
            icon={isFavorite ? FaHeart : FaRegHeart}
            label='পছন্দের তালিকা'
            active={isFavorite}
            className='!h-9 !w-9'
          />
        </header>
      )}

      {/* Back button (visible for all logged-in, and desktop for logged-out) */}
      <div
        className={`mx-auto max-w-7xl px-4 pt-5 sm:px-6 lg:px-8 ${isLoggedIn ? '' : 'hidden lg:block'}`}
      >
        <button
          onClick={() => navigate(-1)}
          className='flex items-center gap-2 text-sm text-gray-500 transition hover:text-gray-700'
        >
          <FiChevronLeft className='h-4 w-4' />
          পণ্যের তালিকায় ফিরে যান
        </button>
      </div>

      {/* Main Content - fully responsive grid */}
      <div className='mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:py-6'>
        <div className='flex flex-col gap-6 lg:flex-row lg:gap-8'>
          {/* LEFT COLUMN - Image Gallery */}
          <div className='w-full lg:w-1/2 space-y-4'>
            {/* Main Image */}
            <div className='relative aspect-square overflow-hidden rounded-2xl bg-white shadow-md'>
              <img
                src={mainImage}
                alt={product.name}
                className='h-full w-full object-contain p-4'
                loading='eager'
              />

              {/* Image Actions */}
              <div className='absolute right-3 top-3 flex flex-col gap-2'>
                {product.videoUrl && (
                  <a
                    href={product.videoUrl}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='flex h-9 w-9 items-center justify-center rounded-xl bg-white shadow-md text-red-500 transition hover:bg-gray-50'
                    title='ভিডিও দেখুন'
                  >
                    <FiYoutube className='h-4 w-4' />
                  </a>
                )}
                <button
                  onClick={() => downloadFile(mainImage, product.name)}
                  disabled={downloading}
                  className='flex h-9 w-9 items-center justify-center rounded-xl bg-white shadow-md text-gray-600 transition hover:bg-gray-50 disabled:opacity-50'
                  title='ছবি ডাউনলোড'
                >
                  {downloading ? (
                    <FaSpinner className='h-4 w-4 animate-spin' />
                  ) : (
                    <FiDownload className='h-4 w-4' />
                  )}
                </button>
                <button
                  onClick={toggleFavorite}
                  className={`hidden h-9 w-9 items-center justify-center rounded-xl shadow-md transition lg:flex ${
                    isFavorite
                      ? 'bg-rose-500 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {isFavorite ? (
                    <FaHeart className='h-4 w-4' />
                  ) : (
                    <FaRegHeart className='h-4 w-4' />
                  )}
                </button>
              </div>

              {/* SKU Badge */}
              <div className='absolute left-3 top-3'>
                <span className='rounded-lg bg-white/90 px-2.5 py-1 text-xs font-medium text-gray-500 shadow-sm backdrop-blur-sm'>
                  SKU: {product.productId}
                </span>
              </div>
            </div>

            {/* Thumbnail Gallery - responsive grid */}
            {images.length > 0 && (
              <div className='space-y-3'>
                <div className='flex items-center justify-between flex-wrap gap-2'>
                  <p className='text-xs font-medium text-gray-500'>
                    ছবি নির্বাচন করুন <span className='text-rose-500'>*</span>
                  </p>
                  {images.length > 1 && (
                    <button
                      onClick={() =>
                        images.forEach(img =>
                          downloadFile(img.imageUrl, `${product.name}_${img.imageId}`)
                        )
                      }
                      disabled={downloading}
                      className='flex items-center gap-1.5 text-xs text-rose-500 transition hover:text-rose-600 disabled:opacity-50'
                    >
                      {downloading ? (
                        <FaSpinner className='h-3 w-3 animate-spin' />
                      ) : (
                        <FiDownload className='h-3 w-3' />
                      )}
                      সব ছবি ডাউনলোড
                    </button>
                  )}
                </div>
                <div
                  ref={imageGalleryRef}
                  className='grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-5 gap-2'
                >
                  {images.map(img => (
                    <button
                      key={img.imageId}
                      onClick={() =>
                        setSelectedImage({ imageUrl: img.imageUrl, imageId: img.imageId })
                      }
                      className={`aspect-square overflow-hidden rounded-xl border-2 transition-all ${
                        selectedImage?.imageUrl === img.imageUrl
                          ? 'border-rose-500 ring-2 ring-rose-500/20'
                          : 'border-gray-100 hover:border-gray-300'
                      }`}
                    >
                      <img
                        src={img.imageUrl}
                        alt=''
                        className='h-full w-full object-cover'
                        loading='lazy'
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Mobile Tabs */}
            <div className='lg:hidden'>
              <div className='flex flex-wrap gap-1 rounded-xl bg-white p-1 shadow-sm'>
                {[
                  { id: 'details', label: 'বিস্তারিত' },
                  { id: 'shipping', label: 'ডেলিভারি' },
                  { id: 'returns', label: 'রিটার্ন' },
                  { id: 'reviews', label: 'রিভিউ' },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition ${
                      activeTab === tab.id
                        ? 'bg-rose-500 text-white shadow-sm'
                        : 'text-gray-500 hover:bg-gray-100'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className='mt-4'>
                {activeTab === 'details' && (
                  <Section title='পণ্যের বিবরণ'>
                    <div className='space-y-4'>
                      <div className='flex items-center justify-between flex-wrap gap-2'>
                        <span className='text-xs font-medium text-gray-400'>বিবরণ</span>
                        <button
                          onClick={copyDescription}
                          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                            copied
                              ? 'bg-emerald-50 text-emerald-600'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {copied ? (
                            <FiCheck className='h-3 w-3' />
                          ) : (
                            <FiCopy className='h-3 w-3' />
                          )}
                          {copied ? 'কপি হয়েছে' : 'কপি করুন'}
                        </button>
                      </div>
                      <p className='whitespace-pre-line text-sm leading-relaxed text-gray-600'>
                        {product.description}
                      </p>
                    </div>
                  </Section>
                )}
                {activeTab === 'shipping' && (
                  <Section title='ডেলিভারির তথ্য'>
                    <div className='space-y-3'>
                      <div className='flex items-start gap-3'>
                        <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100'>
                          <FiTruck className='h-4 w-4 text-gray-500' />
                        </div>
                        <div>
                          <p className='text-sm font-medium text-gray-800'>ডেলিভারি চার্জ</p>
                          <p className='text-sm text-gray-500'>
                            {product.shop.shopLocation || 'ঢাকা'} এর ভিতরে:{' '}
                            {formatCurrency(product.shop.deliveryChargeInside || 0)}
                          </p>
                          <p className='text-sm text-gray-500'>
                            {product.shop.shopLocation || 'ঢাকা'} এর বাইরে:{' '}
                            {formatCurrency(product.shop.deliveryChargeOutside || 0)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Section>
                )}
                {activeTab === 'returns' && <ReturnPolicy />}
                {activeTab === 'reviews' && (
                  <Section title='গ্রাহক রিভিউ'>
                    <div className='flex flex-col items-center justify-center py-8 text-center'>
                      <FiStar className='mb-3 h-12 w-12 text-gray-300' />
                      <p className='text-sm text-gray-500'>কোনো রিভিউ নেই</p>
                      <p className='text-xs text-gray-400'>এই পণ্যটির প্রথম রিভিউ দিন</p>
                    </div>
                  </Section>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN - Product Info & Actions */}
          <div className='w-full lg:w-1/2 space-y-5'>
            {/* Product Title & Rating */}
            <div className='rounded-2xl border border-gray-100 bg-white p-5 shadow-sm'>
              <h1 className='text-xl font-bold leading-tight text-gray-800 lg:text-2xl'>
                {product.name}
              </h1>
              <div className='mt-3 flex flex-wrap items-center gap-3'>
                <div className='flex items-center gap-0.5'>
                  {[1, 2, 3, 4, 5].map(i => (
                    <FiStar key={i} className='h-4 w-4 fill-amber-400 text-amber-400' />
                  ))}
                </div>
                <span className='text-xs text-gray-400'>(০টি রিভিউ)</span>
                <span className='h-3 w-px bg-gray-200' />
                <span className='rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-600'>
                  স্টকে আছে
                </span>
              </div>
            </div>

            {/* Shop Info */}
            <Section title='দোকানের তথ্য' icon={FiInfo}>
              <div className='space-y-3'>
                <InfoRow label='দোকানের নাম' value={product.shop.shopName} />
                <InfoRow label='ঠিকানা' value={product.shop.shopLocation || 'ঢাকা'} />
                <div className='flex items-center justify-between'>
                  <span className='text-sm text-gray-500'>ডেলিভারি চার্জ</span>
                  <div className='text-right'>
                    <p className='text-sm font-medium text-gray-800'>
                      {product.shop.shopLocation || 'ঢাকা'} এর ভিতরে:{' '}
                      {formatCurrency(product.shop.deliveryChargeInside || 0)}
                    </p>
                    <p className='text-xs text-gray-400'>
                      {product.shop.shopLocation || 'ঢাকা'} এর বাইরে:{' '}
                      {formatCurrency(product.shop.deliveryChargeOutside || 0)}
                    </p>
                  </div>
                </div>
              </div>
            </Section>

            {/* Price Section */}
            <Section title='মূল্য তথ্য'>
              {userType === 'seller' ? (
                <div className='space-y-4'>
                  <div className='flex items-center justify-between rounded-xl bg-gray-50 p-4'>
                    <span className='text-sm text-gray-600'>পাইকারি মূল্য</span>
                    <span className='text-xl font-bold text-gray-800'>
                      {formatCurrency(baseProductPrice)}
                    </span>
                  </div>
                  {selectedAddOns.length > 0 && (
                    <div className='flex items-center justify-between rounded-xl bg-emerald-50 p-4'>
                      <span className='text-sm text-emerald-700'>অতিরিক্ত পণ্যের মূল্য</span>
                      <span className='text-lg font-bold text-emerald-600'>
                        + {formatCurrency(addOnsTotal)}
                      </span>
                    </div>
                  )}
                  <div className='flex items-center justify-between rounded-xl border-2 border-dashed border-rose-200 bg-rose-50/30 p-4'>
                    <span className='text-sm text-rose-600'>সর্বোচ্চ খুচরা মূল্য (MRP)</span>
                    <span className='text-xl font-bold text-rose-600'>
                      {formatCurrency(suggestedMaxPrice)}
                    </span>
                  </div>
                  <div className='rounded-xl bg-amber-50 p-4'>
                    <p className='mb-2 text-xs font-semibold uppercase tracking-wide text-amber-700'>
                      গুরুত্বপূর্ণ নির্দেশনা
                    </p>
                    <ul className='space-y-1.5 text-xs text-amber-700'>
                      <li className='flex items-start gap-2'>
                        <span className='mt-1 h-1 w-1 rounded-full bg-amber-500' />
                        সর্বোচ্চ খুচরা মূল্যের বেশি দামে বিক্রি করলে আগ্রহ কমতে পারে
                      </li>
                      <li className='flex items-start gap-2'>
                        <span className='mt-1 h-1 w-1 rounded-full bg-amber-500' />
                        অতিরিক্ত পণ্যের মূল্য অবশ্যই যোগ করতে হবে
                      </li>
                      <li className='flex items-start gap-2'>
                        <span className='mt-1 h-1 w-1 rounded-full bg-amber-500' />
                        ডেলিভারি চার্জ পণ্যের মূল্যের বাইরে হিসাব করুন
                      </li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div className='flex items-center justify-between rounded-xl bg-gradient-to-r from-gray-50 to-white p-5'>
                  <span className='text-base text-gray-600'>পণ্যের মূল্য</span>
                  <span className='text-2xl font-bold text-gray-800'>
                    {formatCurrency(customerPrice)}
                  </span>
                </div>
              )}
            </Section>

            {/* Variants */}
            {Object.keys(variantGroups).length > 0 && (
              <Section title='ভেরিয়েন্ট নির্বাচন করুন'>
                <div className='space-y-5'>
                  {Object.entries(variantGroups).map(([key, values]) => (
                    <div key={key}>
                      <p className='mb-2.5 text-sm font-medium text-gray-700'>
                        {key} {!selectedOptions[key] && <span className='text-rose-500'>*</span>}
                      </p>
                      <div className='flex flex-wrap gap-2'>
                        {values.map(val => (
                          <VariantChip
                            key={val}
                            label={val}
                            selected={selectedOptions[key] === val}
                            onClick={() => setSelectedOptions(prev => ({ ...prev, [key]: val }))}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* Add-ons */}
            {addOns.length > 0 && (
              <Section title='অতিরিক্ত পণ্য'>
                <div className='space-y-2'>
                  {addOns.map(addOn => (
                    <AddOnCard
                      key={addOn.id}
                      addOn={addOn}
                      selected={selectedAddOns.some(a => a.id === addOn.id)}
                      onToggle={() =>
                        setSelectedAddOns(prev =>
                          prev.some(a => a.id === addOn.id)
                            ? prev.filter(a => a.id !== addOn.id)
                            : [...prev, addOn]
                        )
                      }
                    />
                  ))}
                </div>
              </Section>
            )}

            {/* Seller Price Input */}
            {userType === 'seller' && (
              <Section title='আপনার বিক্রয় মূল্য নির্ধারণ করুন'>
                <div>
                  <p className='mb-2 text-sm text-gray-600'>
                    বিক্রয় মূল্য{' '}
                    <span className='text-gray-400'>
                      (ন্যূনতম {formatCurrency(minSellingPrice)})
                    </span>
                  </p>
                  <div className='relative'>
                    <span className='absolute left-4 top-1/2 -translate-y-1/2 text-lg font-semibold text-gray-400'>
                      ৳
                    </span>
                    <input
                      type='text'
                      inputMode='numeric'
                      value={sellingPrice}
                      onChange={e => {
                        const val = e.target.value
                        if (val === '' || /^\d*\.?\d*$/.test(val)) setSellingPrice(val)
                      }}
                      className={`w-full rounded-xl border py-3 pl-10 pr-4 text-base text-gray-800 outline-none transition focus:ring-2 ${
                        priceError
                          ? 'border-rose-300 focus:ring-rose-200'
                          : 'border-gray-200 focus:border-gray-300 focus:ring-gray-100'
                      }`}
                      placeholder='মূল্য লিখুন'
                    />
                  </div>
                  {priceError && <p className='mt-2 text-xs text-rose-500'>{priceError}</p>}
                </div>
              </Section>
            )}

            {/* Quantity & Add to Cart */}
            <Section>
              <div className='space-y-5'>
                <div>
                  <p className='mb-2 text-sm font-medium text-gray-700'>পরিমাণ</p>
                  <QuantitySelector
                    quantity={quantity}
                    onDecrease={() => setQuantity(q => Math.max(1, parseInt(q) - 1).toString())}
                    onIncrease={() => setQuantity(q => (parseInt(q) + 1).toString())}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const val = e.target.value
                      if (val === '' || /^[1-9]\d*$/.test(val)) setQuantity(val)
                    }}
                  />
                </div>
                <div className='flex items-center justify-between rounded-xl bg-gray-50 p-4'>
                  <span className='text-sm text-gray-600'>মোট মূল্য</span>
                  <span className='text-xl font-bold text-gray-800'>
                    {formatCurrency(totalPrice)}
                  </span>
                </div>
                <button
                  onClick={addToCart}
                  disabled={!!validationError}
                  className={`flex w-full items-center justify-center gap-2.5 rounded-xl py-3.5 text-base font-semibold transition-all ${
                    validationError
                      ? 'cursor-not-allowed bg-gray-200 text-gray-400'
                      : 'bg-rose-500 text-white shadow-lg hover:bg-rose-600 active:scale-[0.98]'
                  }`}
                >
                  <FiShoppingCart className='h-5 w-5' />
                  কার্টে যোগ করুন
                </button>
                {validationError && (
                  <div className='flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3'>
                    <FiAlertCircle className='h-4 w-4 text-rose-500' />
                    <p className='text-sm text-rose-600'>{validationError}</p>
                  </div>
                )}
              </div>
            </Section>

            {/* Share Link for Verified Sellers - FIXED: added onClick handlers and responsive layout */}
            {/* Share Link for Verified Sellers - with dedicated price input */}
            {user?.isVerified && userType === 'seller' && (
              <Section>
                <div className='space-y-3'>
                  <div className='flex items-center gap-2'>
                    <FiShare2 className='h-4 w-4 text-rose-500' />
                    <p className='text-sm font-semibold text-gray-800'>শেয়ার লিংক তৈরি করুন</p>
                  </div>

                  {/* Dedicated input box for share link price */}
                  <div>
                    <label className='mb-1.5 block text-xs font-medium text-gray-600'>
                      লিংকের জন্য বিক্রয় মূল্য নির্ধারণ করুন
                    </label>
                    <div className='relative'>
                      <span className='absolute left-4 top-1/2 -translate-y-1/2 text-lg font-semibold text-gray-400'>
                        ৳
                      </span>
                      <input
                        type='text'
                        inputMode='numeric'
                        value={sharePriceInput}
                        onChange={e => {
                          const val = e.target.value
                          if (val === '' || /^\d*\.?\d*$/.test(val)) setSharePriceInput(val)
                        }}
                        className='w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 text-base text-gray-800 outline-none transition focus:border-gray-300 focus:ring-1 focus:ring-gray-200'
                        placeholder={`সর্বনিম্ন ${formatCurrency(baseProductPrice)}`}
                      />
                    </div>
                    <p className='mt-1.5 text-xs text-emerald-600'>
                      {sharePriceInput && !isNaN(parseFloat(sharePriceInput))
                        ? `এই পণ্যটি ${formatCurrency(parseFloat(sharePriceInput))} টাকায় বিক্রি করতে নিচের লিংকটি কাস্টমারদের সাথে শেয়ার করুন।`
                        : 'উপরে মূল্য লিখুন'}
                    </p>
                  </div>

                  {/* Generate link button */}
                  <button
                    onClick={generateShareLinkFromInput}
                    disabled={!sharePriceInput || parseFloat(sharePriceInput) < baseProductPrice}
                    className={`w-full rounded-xl py-2.5 text-sm font-medium transition ${
                      !sharePriceInput || parseFloat(sharePriceInput) < baseProductPrice
                        ? 'cursor-not-allowed bg-gray-100 text-gray-400'
                        : 'bg-rose-500 text-white hover:bg-rose-600'
                    }`}
                  >
                    লিংক জেনারেট করুন
                  </button>

                  {/* Generated link display */}
                  {shareLink && (
                    <div className='flex items-center gap-2 rounded-xl bg-gray-50 p-3'>
                      <p className='flex-1 truncate text-xs text-gray-500'>{shareLink}</p>
                      <button
                        onClick={copyShareLink}
                        className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                          linkCopied
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-gray-800 text-white hover:bg-gray-900'
                        }`}
                      >
                        {linkCopied ? (
                          <FiCheck className='h-3 w-3' />
                        ) : (
                          <FiCopy className='h-3 w-3' />
                        )}
                        {linkCopied ? 'কপি হয়েছে' : 'কপি করুন'}
                      </button>
                    </div>
                  )}

                  {/* Social share buttons */}
                  <div className='flex gap-2'>
                    <button
                      onClick={shareOnWhatsApp}
                      className='flex flex-1 items-center justify-center gap-2 rounded-xl bg-green-500 py-2.5 text-sm font-medium text-white transition hover:bg-green-600'
                    >
                      <FaWhatsapp className='h-4 w-4' /> হোয়াটসঅ্যাপ
                    </button>
                    <button
                      onClick={shareOnFacebook}
                      className='flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700'
                    >
                      <FaFacebookF className='h-4 w-4' /> ফেসবুক
                    </button>
                    <button
                      onClick={copyPageLink}
                      className='flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50'
                    >
                      {pageLinkCopied ? (
                        <FiCheck className='h-4 w-4 text-emerald-600' />
                      ) : (
                        <FaLink className='h-4 w-4' />
                      )}
                      {pageLinkCopied ? 'কপি হয়েছে' : 'লিংক'}
                    </button>
                  </div>
                </div>
              </Section>
            )}

            {/* Desktop Only: Description, Delivery & Return Policy */}
            <div className='hidden space-y-5 lg:block'>
              <Section title='পণ্যের বিস্তারিত বিবরণ'>
                <div className='space-y-4'>
                  <div className='flex items-center justify-between flex-wrap gap-2'>
                    <span className='text-xs font-medium text-gray-400'>বিবরণ</span>
                    <button
                      onClick={copyDescription}
                      className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                        copied
                          ? 'bg-emerald-50 text-emerald-600'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {copied ? <FiCheck className='h-3 w-3' /> : <FiCopy className='h-3 w-3' />}
                      {copied ? 'কপি হয়েছে' : 'কপি করুন'}
                    </button>
                  </div>
                  <p className='whitespace-pre-line text-sm leading-relaxed text-gray-600'>
                    {product.description}
                  </p>
                </div>
              </Section>

              <Section title='ডেলিভারির তথ্য' icon={FiTruck}>
                <div className='space-y-3'>
                  <div className='flex items-start gap-3'>
                    <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100'>
                      <FiTruck className='h-4 w-4 text-gray-500' />
                    </div>
                    <div>
                      <p className='text-sm font-medium text-gray-800'>ডেলিভারি চার্জ</p>
                      <p className='text-sm text-gray-500'>
                        {product.shop.shopLocation || 'ঢাকা'} এর ভিতরে:{' '}
                        {formatCurrency(product.shop.deliveryChargeInside || 0)}
                      </p>
                      <p className='text-sm text-gray-500'>
                        {product.shop.shopLocation || 'ঢাকা'} এর বাইরে:{' '}
                        {formatCurrency(product.shop.deliveryChargeOutside || 0)}
                      </p>
                    </div>
                  </div>
                </div>
              </Section>

              <ReturnPolicy />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky CTA */}
      <div className='fixed bottom-0 left-0 right-0 z-40 border-t border-gray-100 bg-white/95 p-3 backdrop-blur-sm lg:hidden'>
        <div className='flex items-center gap-3'>
          <div className='flex-1'>
            <p className='text-xs text-gray-500'>মোট মূল্য</p>
            <p className='text-lg font-bold text-gray-800'>{formatCurrency(totalPrice)}</p>
          </div>
          <button
            onClick={addToCart}
            disabled={!!validationError}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition ${
              validationError
                ? 'cursor-not-allowed bg-gray-200 text-gray-400'
                : 'bg-rose-500 text-white shadow-lg'
            }`}
          >
            <FiShoppingCart className='h-4 w-4' />
            {validationError || 'কার্টে যোগ করুন'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProductDetail
