import { useEffect, useState } from 'react'
import { FaHeart, FaRegHeart, FaSpinner } from 'react-icons/fa'
import {
  FiCheck,
  FiChevronLeft,
  FiChevronRight,
  FiCopy,
  FiDownload,
  FiShare2,
  FiShoppingCart,
  FiYoutube,
} from 'react-icons/fi'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'
import { productApi } from '../Api/product.api'
import { Product } from '../Api/shop.api'

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

export type AddOn = {
  id: string
  name: string
  price: number
  imageUrl?: string
}

import axiosInstance from '../Axios/axiosInstance'
import { useCartFavorite } from '../Context/cartContext'
import { useAuth } from '../Hooks/useAuth'
import { shortenUrl } from '../utils/shortenUrl'
import { CART_ITEMS_KEY, FAVORITES_KEY } from '../utils/utils.variables'

const ProductDetail = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { productId } = useParams<{ productId: string }>()
  const [product, setProduct] = useState<Product | null>(location.state?.product || null)
  const [loading, setLoading] = useState(!location.state?.product)
  const [error, setError] = useState<string | null>(null)
  const { loadCartCount, loadFavoriteCount } = useCartFavorite()

  // User selections
  const [selectedImage, setSelectedImage] = useState<{ imageUrl: string; imageId: number } | null>(
    null
  )
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({})
  const [selectedAddOns, setSelectedAddOns] = useState<AddOn[]>([])
  const [quantity, setQuantity] = useState<string>('1')
  const [sellingPrice, setSellingPrice] = useState('')
  const [validationError, setValidationError] = useState<string | null>('একটি ছবি নির্বাচন করুন')

  // UI states
  const [isFavorite, setIsFavorite] = useState(
    (JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]') as Product[]).some(
      fav => fav.productId === Number(productId)
    )
  )
  const [downloading, setDownloading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [priceError, setPriceError] = useState('')
  const [userType, setUserType] = useState<'customer' | 'seller'>('customer')
  const [shareLink, setShareLink] = useState('')
  const [linkCopied, setLinkCopied] = useState(false)
  const [linkGenerationError, setLinkGenerationError] = useState<string | null>(null)
  const [thumbnailStartIndex, setThumbnailStartIndex] = useState(0)

  // Parse add-ons from product data
  const addOns: AddOn[] = product?.addOns ? JSON.parse(product.addOns) : []

  // Calculate total add-ons price
  const addOnsTotal = selectedAddOns.reduce((total, addOn) => total + Number(addOn.price), 0)

  // Calculate minimum selling price (base product + selected add-ons)
  const minSellingPrice = (Number(product?.basePrice) || 0) + addOnsTotal

  // Calculate suggested max price (base suggested max + selected add-ons)
  const suggestedMaxPrice = (Number(product?.suggestedMaxPrice) || 0) + addOnsTotal

  // Base product price without add-ons (for sharing)
  const baseProductPrice = Number(product?.basePrice) || 0
  const customerPrice = (Number(product?.price) || 0) + addOnsTotal

  // Thumbnail navigation
  const THUMBNAILS_PER_VIEW = 4
  const totalThumbnails = product?.ProductImage?.length || 0
  const maxThumbnailStartIndex = Math.max(0, totalThumbnails - THUMBNAILS_PER_VIEW)

  const showPrevThumbnails = () => {
    setThumbnailStartIndex(prev => Math.max(0, prev - 1))
  }

  const showNextThumbnails = () => {
    setThumbnailStartIndex(prev => Math.min(maxThumbnailStartIndex, prev + 1))
  }

  const visibleThumbnails =
    product?.ProductImage?.slice(thumbnailStartIndex, thumbnailStartIndex + THUMBNAILS_PER_VIEW) ||
    []

  // Initialize product data
  useEffect(() => {
    if (!location.state?.product && productId) {
      const fetchProduct = async () => {
        try {
          setLoading(true)

          const { success, data, message } = await productApi.getProductDetail(parseInt(productId))
          console.log({ success, data, message })
          if (success) {
            setProduct({
              ...data.product,
              basePrice: data.product.basePrice || data.product.price || 0,
              suggestedMaxPrice: data.product.suggestedMaxPrice || data.product.price || 0,
              price: data.product.price || undefined,
            })
            setUserType(data.userType)
            const price = data.product.basePrice?.toString() || data.product.price?.toString() || ''
            setSellingPrice(price)
          } else {
            setError(message || 'Product not found')
          }
        } catch (err) {
          console.log('Error fetching product:', err)
        } finally {
          setLoading(false)
        }
      }
      fetchProduct()
    } else if (location.state?.product) {
      // setSellingPrice(location.state.product.basePrice.toString())
    }
  }, [productId, location.state])

  useEffect(() => {
    setSellingPrice(user?.role === 'Seller' ? sellingPrice : customerPrice.toString())
  }, [user, addOnsTotal, selectedAddOns])

  // Load favorites from localStorage

  // Handle price validation
  useEffect(() => {
    if (!product) return

    // Validate quantity
    if (parseInt(quantity) < 1 || isNaN(parseInt(quantity))) {
      setValidationError('কোয়ান্টিটি কমপক্ষে 1 হতে হবে')
      return
    }

    // Validate seller selling price (base product + add-ons)
    if (userType === 'seller') {
      const sellerPrice = parseFloat(sellingPrice) || 0
      if (sellerPrice < minSellingPrice) {
        setValidationError(`মূল্য কমপক্ষে ${minSellingPrice} টাকা হতে হবে`)
        setPriceError(`মূল্য কমপক্ষে ${minSellingPrice} টাকা হতে হবে`)
        return
      } else {
        setPriceError('')
      }
    }

    // Validate image selection
    if (!selectedImage) {
      setValidationError('একটি ছবি সিলেক্ট করুন')
      return
    }

    // Validate variant selections
    const variantKeys = [...new Set(product.ProductVariant?.map(v => v.name) || [])]
    const absentOptions = variantKeys.filter(key => !selectedOptions[key])
    if (absentOptions.length > 0) {
      setValidationError(`${absentOptions[0]} সিলেক্ট করুন`)
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
    user,
    minSellingPrice,
  ])

  // Handle image selection
  const handleImageSelect = ({ imageUrl, imageId }: { imageUrl: string; imageId: number }) => {
    setSelectedImage({ imageUrl, imageId })
  }

  // Handle variant selection
  const handleOptionSelect = (key: string, value: string) => {
    setSelectedOptions(prev => ({
      ...prev,
      [key]: value,
    }))
  }

  // Handle add-on selection
  const handleAddOnSelect = (addOn: AddOn) => {
    setSelectedAddOns(prev => {
      const isSelected = prev.some(item => item.id === addOn.id)
      if (isSelected) {
        return prev.filter(item => item.id !== addOn.id)
      } else {
        return [...prev, addOn]
      }
    })
  }

  // Download single image
  const downloadFileViaAPI = async (
    fileUrl: string,
    baseName: string,
    setDownloading?: (loading: boolean) => void
  ): Promise<void> => {
    try {
      setDownloading?.(true)

      const response = await axiosInstance.post(
        '/ftp/download',
        { url: fileUrl },
        {
          responseType: 'blob',
          timeout: 0,
          headers: {
            Accept: 'application/octet-stream',
          },
        }
      )

      const contentDisposition = response.headers['content-disposition']
      const suggestedName =
        contentDisposition?.split('filename=')[1] || `${baseName.replace(/\s+/g, '_')}.jpg`

      const blob = new Blob([response.data])
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = suggestedName
      link.style.display = 'none'
      document.body.appendChild(link)
      link.click()

      setTimeout(() => {
        document.body.removeChild(link)
        window.URL.revokeObjectURL(downloadUrl)
        setDownloading?.(false)
      }, 100)
    } catch (error) {
      setDownloading?.(false)
      console.error('API download failed:', error)
      throw error
    }
  }

  // Download all images
  const downloadAllFilesViaAPI = async (
    fileUrls: string[],
    baseNamePrefix: string,
    setDownloading?: (loading: boolean) => void,
    delayBetweenDownloads: number = 300
  ): Promise<void> => {
    try {
      setDownloading?.(true)

      for (const [index, url] of fileUrls.entries()) {
        try {
          await downloadFileViaAPI(url, `${baseNamePrefix}_${index + 1}`, undefined)
        } catch (error) {
          console.warn(`Failed to download file ${index + 1}:`, error)
        }

        if (index < fileUrls.length - 1) {
          await new Promise(resolve => setTimeout(resolve, delayBetweenDownloads))
        }
      }
    } finally {
      setDownloading?.(false)
    }
  }

  // Copy description to clipboard
  const copyDescription = () => {
    if (!product) return
    navigator.clipboard.writeText(product.description)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const checkIsFavorite = (product: Product): boolean => {
    const savedFavorites: Product[] = JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]')
    return savedFavorites.some(fav => fav.productId === product.productId)
  }

  // Toggle favorite status
  const toggleFavorite = () => {
    if (!product) return

    const isFavorited = checkIsFavorite(product)
    const savedFavorites: Product[] = JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]')
    if (isFavorited) {
      const updatedFavorites = savedFavorites.filter(fav => fav.productId !== product.productId)
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(updatedFavorites))
      setIsFavorite(false)
      loadFavoriteCount()
    } else {
      savedFavorites.push(product)
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(savedFavorites))
      setIsFavorite(true)
      loadFavoriteCount()
    }
  }

  // Add to cart
  const addToCart = () => {
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

    const price = parseFloat(sellingPrice) || 0
    if (price < minSellingPrice) {
      setValidationError(`মূল্য কমপক্ষে ${minSellingPrice} টাকা হতে হবে`)
      return
    }

    if (parseInt(quantity) < 1 || isNaN(parseInt(quantity))) {
      setValidationError('কোয়ান্টিটি কমপক্ষে 1 হতে হবে')
      return
    }

    const cartItem: CartItem = {
      productId: product.productId,
      shopId: product.shopId,
      shopName: product.shop.shopName,
      shopLocation: product.shop.shopLocation,
      name: product.name,
      basePrice: minSellingPrice, // Base product price + add-ons
      sellingPrice: parseFloat(sellingPrice) || 0, // Seller's input price (already includes add-ons)
      quantity: parseInt(quantity),
      imageUrl: selectedImage.imageUrl,
      imageId: selectedImage.imageId,
      selectedOptions: selectedOptions,
      selectedAddOns: selectedAddOns,
      deliveryChargeInside: product.shop.deliveryChargeInside,
      deliveryChargeOutside: product.shop.deliveryChargeOutside,
      cartItemId: uuidv4(),
    }

    const existingCart = JSON.parse(localStorage.getItem(CART_ITEMS_KEY) || '[]')
    existingCart.push(cartItem)
    localStorage.setItem(CART_ITEMS_KEY, JSON.stringify(existingCart))
    loadCartCount()
    navigate('/cart')
  }

  const generateShareLink = async () => {
    if (!product) return

    // Use the selling price but exclude add-ons for sharing
    const sharePrice = Math.max(parseFloat(sellingPrice || '0') - addOnsTotal, baseProductPrice)

    if (sharePrice < baseProductPrice) {
      setLinkGenerationError(`মূল্য কমপক্ষে ${baseProductPrice} টাকা হতে হবে`)
      return
    }

    const referralCode = user?.referralCode

    if (!referralCode) {
      setLinkGenerationError('রেফারেল কোড পাওয়া যায়নি')
      return
    }

    const baseUrl = window.location.origin
    const link = `${baseUrl}/products/${productId}/order?sellerPrice=${sharePrice}&referralCode=${referralCode}`
    setShareLink(link)
    setLinkGenerationError(null)
  }

  const copyShareLink = async () => {
    if (!shareLink) return
    const shortUrl = await shortenUrl(shareLink)
    navigator.clipboard.writeText(shortUrl)
    setLinkCopied(true)
    setTimeout(() => setLinkCopied(false), 2000)
  }

  // Generate share link when selling price changes
  useEffect(() => {
    if (userType === 'seller' && user?.isVerified && sellingPrice) {
      generateShareLink()
    }
  }, [sellingPrice, selectedAddOns, userType, user])

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <FaSpinner className='animate-spin text-2xl text-blue-500' />
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
        <p>পণ্য খুঁজে পাওয়া যায়নি</p>
      </div>
    )
  }

  // Group variants by key
  const variantGroups =
    product.ProductVariant?.reduce<Record<string, string[]>>((acc, variant) => {
      if (!acc[variant.name]) {
        acc[variant.name] = []
      }
      if (!acc[variant.name].includes(variant.value)) {
        acc[variant.name].push(variant.value)
      }
      return acc
    }, {}) || {}

  // Calculate share price (selling price minus add-ons)
  const sharePrice = Math.max(parseFloat(sellingPrice || '0') - addOnsTotal, baseProductPrice)

  return (
    <div className='bg-gray-50 min-h-screen pb-36'>
      {/* Mobile Header */}
      <header className='lg:hidden sticky top-0 bg-white shadow-sm z-10'>
        <div className='container mx-auto px-4 py-3 flex items-center'>
          <button onClick={() => navigate(-1)} className='mr-4 text-gray-700'>
            <FiChevronLeft className='text-xl' />
          </button>
          <button onClick={toggleFavorite} className='text-xl text-red-500 ml-auto'>
            {isFavorite ? <FaHeart /> : <FaRegHeart />}
          </button>
        </div>
      </header>

      <main className='container mx-auto px-4'>
        {/* Desktop Header */}
        <header className='hidden lg:block py-4'>
          <button
            onClick={() => navigate(-1)}
            className='flex items-center text-gray-700 hover:text-blue-600'
          >
            <FiChevronLeft className='text-xl mr-1' />
            <span>পিছনে</span>
          </button>
        </header>

        <div className='lg:grid lg:grid-cols-2 lg:gap-8'>
          {/* Left Column - Images and Description */}
          <div className='bg-white rounded-lg shadow-sm mb-4 lg:sticky lg:top-4 lg:h-fit'>
            {/* Main Image */}
            <div className='relative aspect-square'>
              <img
                src={
                  selectedImage?.imageUrl || product.ProductImage[0]?.imageUrl || '/placeholder.jpg'
                }
                alt={product.name}
                className='w-full h-full object-contain'
                onError={e => {
                  ;(e.target as HTMLImageElement).src = '/placeholder.jpg'
                }}
              />

              {/* Image Actions */}
              <div className='absolute top-3 right-3 flex gap-2'>
                {product.videoUrl && (
                  <a
                    href={product.videoUrl}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='bg-white p-2 rounded-full shadow-md hover:bg-gray-100'
                    title='ভিডিও দেখুন'
                  >
                    <FiYoutube className='text-red-500' />
                  </a>
                )}
                <button
                  onClick={() =>
                    downloadFileViaAPI(
                      selectedImage?.imageUrl || product.ProductImage[0]?.imageUrl || '',
                      product.name
                    )
                  }
                  disabled={downloading}
                  className='bg-white p-2 rounded-full shadow-md hover:bg-gray-100'
                  title='ছবি ডাউনলোড করুন'
                >
                  {downloading ? (
                    <FaSpinner className='animate-spin text-blue-500' />
                  ) : (
                    <FiDownload className='text-gray-700' />
                  )}
                </button>
              </div>
            </div>

            {/* Thumbnail Images with Navigation */}
            <div className='p-3 border-t'>
              <div className='flex justify-between items-center mb-2'>
                <h3 className='text-sm font-medium'>ছবিসমূহ</h3>
                {product.ProductImage.length > 1 && (
                  <button
                    onClick={() =>
                      downloadAllFilesViaAPI(
                        product.ProductImage.map(img => img.imageUrl),
                        product.name,
                        setDownloading
                      )
                    }
                    disabled={downloading}
                    className='text-xs text-blue-600 flex items-center'
                  >
                    {downloading ? (
                      <>
                        <FaSpinner className='animate-spin mr-1' />
                        ডাউনলোড হচ্ছে...
                      </>
                    ) : (
                      <>
                        <FiDownload className='mr-1' />
                        সব ছবি ডাউনলোড
                      </>
                    )}
                  </button>
                )}
              </div>

              <div className='relative'>
                {thumbnailStartIndex > 0 && (
                  <button
                    onClick={showPrevThumbnails}
                    className='absolute left-0 top-1/2 transform -translate-y-1/2 bg-white shadow-md rounded-full p-1 z-10 hover:bg-gray-100'
                  >
                    <FiChevronLeft className='text-gray-600' />
                  </button>
                )}

                <div className='grid grid-cols-4 gap-2 mx-6'>
                  {visibleThumbnails.map(image => (
                    <button
                      key={image.imageId}
                      onClick={() =>
                        handleImageSelect({
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
                        alt={`${product.name} - ${image.imageId}`}
                        className='w-full h-full object-cover'
                      />
                    </button>
                  ))}
                </div>

                {thumbnailStartIndex < maxThumbnailStartIndex && (
                  <button
                    onClick={showNextThumbnails}
                    className='absolute right-0 top-1/2 transform -translate-y-1/2 bg-white shadow-md rounded-full p-1 z-10 hover:bg-gray-100'
                  >
                    <FiChevronRight className='text-gray-600' />
                  </button>
                )}
              </div>
            </div>

            {/* Product Title - Moved below thumbnails */}
            <div className='p-4 border-t'>
              <div className='flex justify-between items-start'>
                <h1 className='text-xl font-bold text-gray-900 leading-tight'>{product.name}</h1>
                <button onClick={toggleFavorite} className='text-2xl text-red-500 hidden lg:block'>
                  {isFavorite ? <FaHeart /> : <FaRegHeart />}
                </button>
              </div>
            </div>

            {/* Description */}
            <div className='p-4 border-t'>
              <div className='flex justify-between items-center mb-3'>
                <h3 className='text-sm font-medium'>বিবরণ</h3>
                <button
                  onClick={copyDescription}
                  className='text-sm text-blue-600 flex items-center'
                >
                  <FiCopy className='mr-1' />
                  {copied ? 'কপি হয়েছে!' : 'কপি করুন'}
                </button>
              </div>
              <p className='text-gray-700 whitespace-pre-line text-sm'>{product.description}</p>
            </div>
          </div>

          {/* Right Column - Product Info */}
          <div className='space-y-4'>
            {/* Desktop Title and Favorite - Now moved to left column */}

            {/* Shop Info */}
            <div className='bg-white rounded-lg shadow-sm p-4'>
              <h2 className='text-lg font-semibold mb-2'>দোকানের তথ্য</h2>
              <div className='space-y-2'>
                <div className='flex items-center'>
                  <span className='text-gray-600 w-24'>দোকান:</span>
                  <span className='font-medium'>{product.shop.shopName}</span>
                </div>
                <div className='flex items-center'>
                  <span className='text-gray-600 w-24'>লোকেশন:</span>
                  <span>{product.shop.shopLocation}</span>
                </div>
                <div className='flex items-center'>
                  <span className='text-gray-600 w-24'>ডেলিভারি চার্জ:</span>
                  <div>
                    <p>শহরের ভিতরে: ৳{product.shop.deliveryChargeInside}</p>
                    <p>শহরের বাইরে: ৳{product.shop.deliveryChargeOutside}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Add-ons Section */}
            {addOns.length > 0 && (
              <div className='bg-white rounded-lg shadow-sm p-4'>
                <h2 className='text-lg font-semibold mb-3'>অতিরিক্ত সামগ্রী</h2>
                <div className='space-y-2'>
                  {addOns.map(addOn => (
                    <div
                      key={addOn.id}
                      className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedAddOns.some(item => item.id === addOn.id)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      onClick={() => handleAddOnSelect(addOn)}
                    >
                      <div className='flex items-center'>
                        {addOn.imageUrl && (
                          <img
                            src={addOn.imageUrl}
                            alt={addOn.name}
                            className='w-10 h-10 object-cover rounded mr-3'
                          />
                        )}
                        <span className='font-medium'>{addOn.name}</span>
                      </div>
                      <div className='flex items-center'>
                        <span className='text-green-600 font-semibold mr-3'>
                          ৳{Number(addOn.price).toLocaleString('bn-BD')}
                        </span>
                        <div
                          className={`w-5 h-5 border rounded flex items-center justify-center ${
                            selectedAddOns.some(item => item.id === addOn.id)
                              ? 'bg-blue-500 border-blue-500'
                              : 'border-gray-400'
                          }`}
                        >
                          {selectedAddOns.some(item => item.id === addOn.id) && (
                            <FiCheck className='text-white text-sm' />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {selectedAddOns.length > 0 && (
                  <div className='mt-3 p-2 bg-gray-50 rounded'>
                    <p className='text-sm text-gray-600'>
                      নির্বাচিত অতিরিক্ত সামগ্রী:{' '}
                      {selectedAddOns.map(addOn => addOn.name).join(', ')}
                    </p>
                    <p className='text-sm font-semibold mt-1'>
                      অতিরিক্ত সামগ্রীর মূল্য: ৳{Number(addOnsTotal).toLocaleString('bn-BD')}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Price Info */}
            <div className='bg-white rounded-lg shadow-sm p-4'>
              {userType === 'seller' ? (
                <div className='space-y-3'>
                  <div className='flex items-center justify-between'>
                    <span className='text-gray-600'>পাইকারি মূল্য:</span>
                    <span className='text-lg font-bold text-blue-600'>
                      ৳{Number(product.basePrice || 0).toLocaleString('bn-BD')}
                    </span>
                  </div>

                  {selectedAddOns.length > 0 && (
                    <>
                      <div className='flex items-center justify-between'>
                        <span className='text-gray-600'>অতিরিক্ত সামগ্রীর মূল্য:</span>
                        <span className='text-lg font-semibold text-green-600'>
                          ৳{Number(addOnsTotal).toLocaleString('bn-BD')}
                        </span>
                      </div>
                      <div className='flex items-center justify-between border-t pt-2'>
                        <span className='text-gray-600 font-medium'>ন্যূনতম বিক্রয় মূল্য:</span>
                        <span className='text-lg font-bold text-red-600'>
                          ৳{Number(minSellingPrice).toLocaleString('bn-BD')}
                        </span>
                      </div>
                    </>
                  )}

                  <div className='flex items-center justify-between'>
                    <span className='text-gray-600'>সুপারিশকৃত সর্বোচ্চ বিক্রয় মূল্য:</span>
                    <span className='text-lg text-[#e5307e] font-bold'>
                      ৳{Number(suggestedMaxPrice).toLocaleString('bn-BD')}
                    </span>
                  </div>

                  <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-2'>
                    <p className='text-sm text-yellow-800'>
                      <strong>দ্রষ্টব্য:</strong> আপনি সুপারিশকৃত মূল্যের চেয়ে বেশি মূল্যে পণ্য
                      বিক্রি করতে পারবেন, তবে এটি সুপারিশকৃত নয়। বেশি মূল্য নির্ধারণ করলে গ্রাহকের
                      আগ্রহ কমতে পারে।
                    </p>
                    {selectedAddOns.length > 0 && (
                      <p className='text-sm text-yellow-800 mt-1'>
                        <strong>মনে রাখবেন:</strong> আপনার ইনপুট মূল্য পণ্যের মূল মূল্য + নির্বাচিত
                        অতিরিক্ত সামগ্রীর মূল্য অন্তর্ভুক্ত করতে হবে।
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className='space-y-2'>
                  <div className='flex items-center justify-between'>
                    <span className='text-gray-600'>মূল্য:</span>
                    <span className='text-lg font-bold text-blue-600'>
                      ৳{Number(customerPrice).toLocaleString('bn-BD')}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Variants */}
            {Object.entries(variantGroups).length > 0 && (
              <div className='bg-white rounded-lg shadow-sm p-4'>
                {Object.entries(variantGroups).map(([key, values]) => (
                  <div key={key} className='mb-4 last:mb-0'>
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

            {/* Quantity and Price Input */}
            <div className='bg-white rounded-lg shadow-sm p-4'>
              <h2 className='text-lg font-semibold mb-3'>অর্ডার করুন</h2>
              <div className='grid grid-cols-1 gap-4'>
                <div>
                  <label className='block text-sm font-medium mb-1'>পরিমাণ</label>
                  <input
                    type='text'
                    inputMode='numeric'
                    value={quantity}
                    onChange={e => {
                      const value = e.target.value
                      if (value === '' || /^[1-9][0-9]*$/.test(value)) {
                        setQuantity(value)
                      }
                    }}
                    className='w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500'
                  />
                </div>

                {userType === 'seller' && (
                  <div>
                    <label className='block text-sm font-medium mb-1'>
                      আপনার বিক্রয় মূল্য{' '}
                      {selectedAddOns.length > 0 && '(পণ্য মূল্য + অতিরিক্ত সামগ্রী)'}
                      {selectedAddOns.length > 0 ? (
                        <span className='text-red-600'>
                          {' '}
                          (ন্যূনতম ৳{Number(minSellingPrice).toLocaleString('bn-BD')})
                        </span>
                      ) : (
                        <span> (ন্যূনতম ৳{Number(minSellingPrice).toLocaleString('bn-BD')})</span>
                      )}
                    </label>
                    <input
                      type='text'
                      inputMode='numeric'
                      value={sellingPrice}
                      onChange={e => {
                        const value = e.target.value
                        if (value === '' || /^[0-9]*\.?[0-9]*$/.test(value)) {
                          setSellingPrice(value)
                        }
                      }}
                      className={`w-full px-3 py-2 border ${
                        priceError ? 'border-red-500' : 'border-gray-300'
                      } rounded focus:outline-none focus:ring-1 focus:ring-blue-500`}
                    />
                    {priceError && <p className='text-red-500 text-xs mt-1'>{priceError}</p>}
                  </div>
                )}
              </div>
            </div>

            {user?.isVerified && userType === 'seller' && (
              <div className='bg-white rounded-lg shadow-sm p-3 md:p-4 '>
                <div className='flex items-center mb-2'>
                  <FiShare2 className='text-blue-600 mr-2' />
                  <h2 className=' font-semibold text-xs'>
                    {`কাস্টমারের কাছে প্রোডাক্টটি ${sharePrice.toLocaleString(
                      'bn-BD'
                    )} টাকায় বিক্রি করতে এই লিঙ্কটি তাদের সাথে শেয়ার করুন।`}
                    {selectedAddOns.length > 0 && (
                      <span className='text-gray-600 block mt-1'>
                        (অতিরিক্ত সামগ্রী গ্রাহক অর্ডার পৃষ্ঠায় নির্বাচন করতে পারবে)
                      </span>
                    )}
                  </h2>
                </div>

                <div className='space-y-2'>
                  {shareLink ? (
                    <div className='flex items-center justify-between p-2 bg-gray-50 border border-gray-200 rounded-lg'>
                      <p className='text-xs text-gray-600 truncate mr-2'>{shareLink}</p>
                      <button
                        onClick={copyShareLink}
                        className='flex-shrink-0 flex items-center text-blue-600 hover:text-blue-800 text-xs p-1 hover:bg-blue-50 rounded transition-colors'
                      >
                        {linkCopied ? (
                          <>
                            <FiCheck className='mr-1' />
                            <span>কপি হয়েছে!</span>
                          </>
                        ) : (
                          <>
                            <FiCopy className='mr-1' />
                            <span>কপি করুন</span>
                          </>
                        )}
                      </button>
                    </div>
                  ) : (
                    <p className='text-red-500 text-xs'>{linkGenerationError}</p>
                  )}
                </div>
              </div>
            )}

            {/* Mobile Add to Cart Button */}
            <div className='lg:hidden fixed z-[100] bottom-0 left-0 right-0 bg-white shadow-lg p-3 border-t'>
              <button
                onClick={addToCart}
                disabled={!!validationError}
                className={`w-full py-3 rounded-lg font-medium flex items-center justify-center gap-2 ${
                  !!validationError
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                <FiShoppingCart />
                কার্টে যোগ করুন
              </button>
              {validationError && (
                <div className='text-red-500 text-sm bg-white p-3 rounded-lg shadow-sm text-center'>
                  {validationError}
                </div>
              )}
            </div>

            {/* Desktop Add to Cart Button */}
            <div className='hidden lg:block'>
              <button
                onClick={addToCart}
                disabled={!!validationError}
                className={`w-full py-3 rounded-lg font-medium flex items-center justify-center gap-2 ${
                  !!validationError
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                <FiShoppingCart />
                কার্টে যোগ করুন
              </button>
              {validationError && (
                <div className='text-red-500 text-sm bg-white p-3 rounded-lg shadow-sm text-center'>
                  {validationError}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default ProductDetail
