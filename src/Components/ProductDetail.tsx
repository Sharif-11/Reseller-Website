import { useEffect, useState } from 'react'
import { FaHeart, FaRegHeart, FaSpinner } from 'react-icons/fa'
import { FiChevronLeft, FiCopy, FiDownload, FiShoppingCart, FiYoutube } from 'react-icons/fi'
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
  cartItemId: string
}

import axiosInstance from '../Axios/axiosInstance'
import { useCartFavorite } from '../Context/cartContext'
import { CART_ITEMS_KEY, FAVORITES_KEY } from '../utils/utils.variables'

const ProductDetail = () => {
  const location = useLocation()
  const navigate = useNavigate()
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

  // Load favorites from localStorage

  // Handle price validation

  useEffect(() => {
    if (!product) return
    if (parseInt(quantity) < 1 || isNaN(parseInt(quantity))) {
      setValidationError('কোয়ান্টিটি কমপক্ষে 1 হতে হবে')
    } else if (parseFloat(sellingPrice) < product?.basePrice) {
      setValidationError(`মূল্য কমপক্ষে ${product?.basePrice} টাকা হতে হবে`)
      setPriceError(`মূল্য কমপক্ষে ${product?.basePrice} টাকা হতে হবে`)
    } else if (!selectedImage) {
      setValidationError('একটি ছবি সিলেক্ট করুন')
    } else {
      const variantKeys = [...new Set(product.ProductVariant?.map(v => v.name) || [])]
      const absentOptions = variantKeys.filter(key => !selectedOptions[key])
      if (absentOptions.length > 0) {
        setValidationError(`${absentOptions[0]} সিলেক্ট করুন`)
      } else {
        setValidationError(null)
        setPriceError('')
      }
    }
  }, [quantity, sellingPrice, product, selectedImage, selectedOptions])

  // Handle image selection
  const handleImageSelect = ({ imageUrl, imageId }: { imageUrl: string; imageId: number }) => {
    setSelectedImage({ imageUrl, imageId })
    // setValidationError(null) // Clear validation error when image is selected
  }

  // Handle variant selection
  const handleOptionSelect = (key: string, value: string) => {
    setSelectedOptions(prev => ({
      ...prev,
      [key]: value,
    }))
  }

  // Download single image
  /**
   * Downloads a file through your backend API
   * @param fileUrl - Public URL of the file (e.g., 'https://media.example.com/ftp_dev/uuid.jpg')
   * @param baseName - Base filename for the downloaded file
   * @param setDownloading - State setter for loading indicator
   */
  const downloadFileViaAPI = async (
    fileUrl: string,
    baseName: string,
    setDownloading?: (loading: boolean) => void
  ): Promise<void> => {
    try {
      setDownloading?.(true)

      // Hit your backend API endpoint
      const response = await axiosInstance.post(
        '/ftp/download',
        { url: fileUrl },
        {
          responseType: 'blob',
          timeout: 0, // Disable timeout entirely for downloads
          headers: {
            Accept: 'application/octet-stream',
          },
        }
      )

      // Extract filename from headers or generate one
      const contentDisposition = response.headers['content-disposition']
      const suggestedName =
        contentDisposition?.split('filename=')[1] || `${baseName.replace(/\s+/g, '_')}.jpg`

      // Trigger browser download
      const blob = new Blob([response.data])
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = suggestedName
      link.style.display = 'none'
      document.body.appendChild(link)
      link.click()

      // Cleanup
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
  /**
   * Downloads multiple files through your backend API
   * @param fileUrls - Array of public file URLs
   * @param baseNamePrefix - Prefix for downloaded files (e.g., 'product')
   * @param setDownloading - State setter for loading indicator
   * @param delayBetweenDownloads - Delay between requests (ms)
   */
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
          await downloadFileViaAPI(
            url,
            `${baseNamePrefix}_${index + 1}`,
            undefined // No individual loading states
          )
        } catch (error) {
          console.warn(`Failed to download file ${index + 1}:`, error)
          // Continue with next file even if one fails
        }

        // Add delay between requests (except after last file)
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
      // Remove from favorites
      const updatedFavorites = savedFavorites.filter(fav => fav.productId !== product.productId)
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(updatedFavorites))
      setIsFavorite(false)
      loadFavoriteCount()
    } else {
      // Add to favorites
      savedFavorites.push(product)
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(savedFavorites))
      setIsFavorite(true)
      loadFavoriteCount()
    }
  }

  // Add to cart
  const addToCart = () => {
    if (!product) return

    // Validate selections
    if (!selectedImage) {
      setValidationError('একটি ছবি সিলেক্ট করুন')
      return
    }

    // Check if all variant options are selected
    const variantKeys = [...new Set(product.ProductVariant?.map(v => v.name) || [])]
    // const allOptionsSelected = variantKeys.every(key => selectedOptions[key])
    const absentOptions = variantKeys.filter(key => !selectedOptions[key])

    if (absentOptions.length > 0) {
      setValidationError(`${absentOptions[0]} সিলেক্ট করুন`)
      return
    }

    // Validate price
    const price = parseFloat(sellingPrice) || 0
    if (price < product.basePrice) {
      setValidationError(`মূল্য কমপক্ষে ${product.basePrice} টাকা হতে হবে`)
      return
    }

    // Validate quantity
    if (parseInt(quantity) < 1 || isNaN(parseInt(quantity))) {
      setValidationError('কোয়ান্টিটি কমপক্ষে 1 হতে হবে')
      return
    }
    console.log(selectedImage)
    // Create cart item
    const cartItem: CartItem = {
      productId: product.productId,
      shopId: product.shopId,
      shopName: product.shop.shopName,
      shopLocation: product.shop.shopLocation,
      name: product.name,
      basePrice: product.basePrice,
      sellingPrice: price,
      quantity: parseInt(quantity),
      imageUrl: selectedImage.imageUrl,
      imageId: selectedImage.imageId,
      selectedOptions: selectedOptions,
      deliveryChargeInside: product.shop.deliveryChargeInside,
      deliveryChargeOutside: product.shop.deliveryChargeOutside,
      cartItemId: uuidv4(),
    }

    // Get existing cart items from localStorage
    const existingCart = JSON.parse(localStorage.getItem(CART_ITEMS_KEY) || '[]')

    existingCart.push(cartItem)

    // Save to localStorage
    localStorage.setItem(CART_ITEMS_KEY, JSON.stringify(existingCart))
    loadCartCount()
    // Navigate to cart
    navigate('/cart')
  }

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

  return (
    <div className='bg-gray-50 min-h-screen pb-20'>
      {/* Mobile Header */}
      <header className='lg:hidden sticky top-0 bg-white shadow-sm z-10'>
        <div className='container mx-auto px-4 py-3 flex items-center'>
          <button onClick={() => navigate(-1)} className='mr-4 text-gray-700'>
            <FiChevronLeft className='text-xl' />
          </button>
          <h1 className='text-lg font-semibold truncate flex-1'>{product.name}</h1>
          <button onClick={toggleFavorite} className='text-xl text-red-500'>
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

            {/* Thumbnail Images */}
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

              <div className='grid grid-cols-4 gap-2'>
                {product.ProductImage.map(image => (
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
            {/* Desktop Title and Favorite */}
            <div className='hidden lg:flex justify-between items-start mb-2'>
              <h1 className='text-2xl font-bold'>{product.name}</h1>
              <button onClick={toggleFavorite} className='text-2xl text-red-500'>
                {isFavorite ? <FaHeart /> : <FaRegHeart />}
              </button>
            </div>

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

            {/* Price Info */}

            <div className='bg-white rounded-lg shadow-sm p-4'>
              {userType === 'seller' ? (
                <div className='space-y-2'>
                  <div className='flex items-center justify-between'>
                    <span className='text-gray-600'>পাইকারি মূল্য:</span>
                    <span className='text-lg font-bold text-blue-600'>
                      ৳{product.basePrice.toLocaleString('bn-BD')}
                    </span>
                  </div>
                  <div className='flex items-center justify-between'>
                    <span className='text-gray-600'>সর্বোচ্চ বিক্রয় মূল্য:</span>
                    <span className='text-lg text-[#e5307e] font-bold'>
                      ৳{product.suggestedMaxPrice.toLocaleString('bn-BD')}
                    </span>
                  </div>
                </div>
              ) : (
                <div className='space-y-2'>
                  <div className='flex items-center justify-between'>
                    <span className='text-gray-600'>মূল্য:</span>
                    <span className='text-lg font-bold text-blue-600'>
                      ৳{product.price!.toLocaleString('bn-BD')}
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
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm font-medium mb-1'>পরিমাণ</label>
                  <input
                    type='text'
                    inputMode='numeric'
                    value={quantity}
                    onChange={e => {
                      const value = e.target.value
                      // Allow only numbers and empty string
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
                      আপনার মূল্য (ন্যূনতম ৳{product.basePrice})
                    </label>
                    <input
                      type='text'
                      inputMode='numeric'
                      value={sellingPrice}
                      onChange={e => {
                        const value = e.target.value
                        // Allow only numbers and empty string
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

            {/* Image Selection Warning */}
            {validationError && (
              <div className='text-red-500 text-sm bg-white p-3 rounded-lg shadow-sm'>
                {validationError}
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
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default ProductDetail
