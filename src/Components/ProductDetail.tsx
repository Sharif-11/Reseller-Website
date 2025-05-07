import { useEffect, useState } from 'react'
import { FaSpinner } from 'react-icons/fa'
import { FiCopy, FiDownload, FiShoppingCart, FiYoutube } from 'react-icons/fi'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'
import { getProduct } from '../Api/seller.api'
import { CartItem } from '../types/cart.types'
import { Product } from '../types/product.types'
import { CART_ITEMS_KEY, FAVORITES_KEY } from '../utils/utils.variables'

const ProductDetail = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { productId } = useParams()
  const [product, setProduct] = useState<Product | null>(location.state?.product || null)
  const [loading, setLoading] = useState(!location.state?.product)

  const [favorites, setFavorites] = useState<number[]>([])
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const [downloadingAll, setDownloadingAll] = useState(false)
  const [quantity, setQuantity] = useState('1')
  const [sellingPrice, setSellingPrice] = useState('0')
  const [selectedMeta, setSelectedMeta] = useState<Record<string, string>>({})
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [hoveredImage, setHoveredImage] = useState<string>('')
  const [copied, setCopied] = useState(false)
  const [inputErrors, setInputErrors] = useState({
    quantity: '',
    sellingPrice: '',
    options: '',
    image: '',
  })

  // Fetch product if not passed via location state
  useEffect(() => {
    if (!location.state?.product && productId) {
      const fetchProduct = async () => {
        try {
          setLoading(true)
          const response = await getProduct(productId)
          if (response.success && response.data) {
            setProduct(response.data)
            setSellingPrice(response.data.basePrice.toString())
          } else {
            console.error('Failed to fetch product:', response.message)
          }
        } catch (error) {
          console.error('Error fetching product:', error)
        } finally {
          setLoading(false)
        }
      }
      fetchProduct()
    } else if (location.state?.product) {
      setSellingPrice(location.state.product.basePrice.toString())
    }
  }, [productId, location.state])

  // Load favorites
  useEffect(() => {
    const savedFavorites = localStorage.getItem(FAVORITES_KEY)
    if (savedFavorites) {
      try {
        setFavorites(JSON.parse(savedFavorites))
      } catch (err) {
        console.error('ফেভারিট লোড করতে সমস্যা:', err)
        localStorage.removeItem(FAVORITES_KEY)
      }
    }
  }, [])

  // Save favorites
  useEffect(() => {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites))
  }, [favorites])

  const toggleFavorite = () => {}

  const downloadImage = async (url: string, name: string, id: string) => {
    try {
      setDownloadingId(id)
      const response = await fetch(url)
      const blob = await response.blob()
      const extension = url.split('.').pop()?.split('?')[0] || 'jpg'
      const blobUrl = URL.createObjectURL(blob)

      const link = document.createElement('a')
      link.href = blobUrl
      link.download = `${name.replace(/\s+/g, '_')}_${id}.${extension}`
      document.body.appendChild(link)
      link.click()

      setTimeout(() => {
        document.body.removeChild(link)
        URL.revokeObjectURL(blobUrl)
        setDownloadingId(null)
      }, 100)
    } catch (error) {
      console.error('ডাউনলোড ব্যর্থ:', error)
      setDownloadingId(null)
    }
  }

  const downloadAllImages = async () => {
    if (!product) return

    setDownloadingAll(true)
    try {
      const allImages = [
        { imageUrl: product.imageUrl, isMain: true },
        ...(product.images || []).map(img => ({ imageUrl: img.imageUrl, isMain: false })),
      ]

      for (let i = 0; i < allImages.length; i++) {
        const img = allImages[i]
        await downloadImage(img.imageUrl, product.name, `all_${i}`)
        await new Promise(resolve => setTimeout(resolve, 300))
      }
    } finally {
      setDownloadingAll(false)
    }
  }

  const copyDescription = () => {
    if (!product) return
    navigator.clipboard.writeText(product.description)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleMetaSelect = (key: string, value: string) => {
    setSelectedMeta(prev => ({ ...prev, [key]: value }))
    if (inputErrors.options) {
      setInputErrors(prev => ({ ...prev, options: '' }))
    }
  }

  const handleImageClick = (imageUrl: string) => {
    if (selectedImage === imageUrl) {
      setSelectedImage('')
    } else {
      setSelectedImage(imageUrl)
    }
    if (inputErrors.image) {
      setInputErrors(prev => ({ ...prev, image: '' }))
    }
  }

  const handleImageHover = (imageUrl: string) => {
    setHoveredImage(imageUrl)
  }

  const handleImageLeave = () => {
    setHoveredImage('')
  }

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuantity(value)

    if (value === '') {
      setInputErrors(prev => ({ ...prev, quantity: 'পরিমাণ লিখুন' }))
      return
    }

    const numValue = parseFloat(value)
    if (isNaN(numValue)) {
      setInputErrors(prev => ({ ...prev, quantity: 'সংখ্যা লিখুন' }))
      return
    }

    if (numValue < 1) {
      setInputErrors(prev => ({ ...prev, quantity: 'ন্যূনতম পরিমাণ ১' }))
      return
    }

    setInputErrors(prev => ({ ...prev, quantity: '' }))
  }

  const handleSellingPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSellingPrice(value)

    if (value === '') {
      setInputErrors(prev => ({ ...prev, sellingPrice: 'মূল্য লিখুন' }))
      return
    }

    const numValue = parseFloat(value)
    if (isNaN(numValue)) {
      setInputErrors(prev => ({ ...prev, sellingPrice: 'সংখ্যা লিখুন' }))
      return
    }

    if (product && numValue < product.basePrice) {
      setInputErrors(prev => ({ ...prev, sellingPrice: `ন্যূনতম মূল্য ৳${product.basePrice}` }))
      return
    }

    setInputErrors(prev => ({ ...prev, sellingPrice: '' }))
  }

  const addToCart = () => {
    if (!product) return

    const allOptionsSelected = (product.metas || []).every(meta => selectedMeta[meta.key])
    if (!allOptionsSelected && (product.metas || []).length > 0) {
      setInputErrors(prev => ({ ...prev, options: 'সব অপশন সিলেক্ট করুন' }))
      return
    }

    const currentImage = selectedImage
    if (!currentImage) {
      setInputErrors(prev => ({ ...prev, image: 'একটি ইমেজ সিলেক্ট করুন' }))
      return
    }

    const quantityNum = parseFloat(quantity)
    const priceNum = parseFloat(sellingPrice)

    if (isNaN(quantityNum)) {
      setInputErrors(prev => ({ ...prev, quantity: 'অবৈধ পরিমাণ' }))
      return
    }

    if (isNaN(priceNum)) {
      setInputErrors(prev => ({ ...prev, sellingPrice: 'অবৈধ মূল্য' }))
      return
    }

    if (quantityNum < 1) {
      setInputErrors(prev => ({ ...prev, quantity: 'ন্যূনতম পরিমাণ ১' }))
      return
    }

    if (priceNum < product.basePrice) {
      setInputErrors(prev => ({ ...prev, sellingPrice: `ন্যূনতম মূল্য ৳${product.basePrice}` }))
      return
    }

    const cartItem: CartItem = {
      productId: product.productId,
      name: product.name,
      basePrice: product.basePrice,
      sellingPrice: priceNum,
      quantity: quantityNum,
      imageUrl: currentImage,
      selectedOptions: { ...selectedMeta },
      cartItemId: uuidv4(),
    }

    const existingCart = JSON.parse(localStorage.getItem(CART_ITEMS_KEY) || '[]')
    const updatedCart = [...existingCart, cartItem]

    localStorage.setItem(CART_ITEMS_KEY, JSON.stringify(updatedCart))
    navigate('/cart')
  }

  if (loading) {
    return (
      <div className='flex justify-center items-center min-h-screen'>
        <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500'></div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className='text-center py-12'>
        <p className='text-gray-500'>পণ্য খুঁজে পাওয়া যায়নি</p>
      </div>
    )
  }

  const metaInfo = (product.metas || []).reduce<Record<string, string[]>>((acc, meta) => {
    if (!acc[meta.key]) {
      acc[meta.key] = []
    }
    if (!acc[meta.key].includes(meta.value)) {
      acc[meta.key].push(meta.value)
    }
    return acc
  }, {})

  // প্রধান ইমেজ এবং অতিরিক্ত ইমেজ একসাথে করুন
  const allImages = [
    { imageUrl: product.imageUrl, isMain: true },
    ...(product.images || []).map(img => ({ imageUrl: img.imageUrl, isMain: false })),
  ]

  return (
    <div className='container mx-auto px-4 py-8'>
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
        {/* বাম কলাম - পণ্যের ছবি */}
        <div className='bg-white rounded-lg shadow-md overflow-hidden'>
          <div className='relative aspect-square'>
            <img
              src={hoveredImage || selectedImage || product.imageUrl}
              alt={product.name}
              className='w-full h-full object-contain'
              loading='lazy'
              onError={e => {
                ;(e.target as HTMLImageElement).src = '/placeholder-product.jpg'
              }}
            />

            <div className='absolute top-4 right-4 flex gap-2'>
              <button
                onClick={() =>
                  downloadImage(
                    hoveredImage || selectedImage || product.imageUrl,
                    product.name,
                    'main'
                  )
                }
                className='bg-white p-2 rounded-full shadow-md hover:bg-gray-100 transition-colors'
                disabled={downloadingId === 'main'}
                title='ছবি ডাউনলোড করুন'
              >
                {downloadingId === 'main' ? (
                  <FaSpinner className='animate-spin text-blue-500' />
                ) : (
                  <FiDownload className='text-gray-700' />
                )}
              </button>

              {product.videoUrl && (
                <a
                  href={product.videoUrl}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='bg-white p-2 rounded-full shadow-md hover:bg-gray-100 transition-colors'
                  title='ইউটিউব ভিডিও দেখুন'
                >
                  <FiYoutube className='text-red-600' />
                </a>
              )}
            </div>
          </div>

          {/* ইমেজ সিলেকশন */}
          <div className='p-4 border-t'>
            <div className='flex justify-between items-center mb-2 text-xs'>
              <h3 className='font-medium text-xs'>ইমেজ সিলেক্ট করুন</h3>
              {allImages.length > 1 && (
                <button
                  onClick={downloadAllImages}
                  disabled={downloadingAll}
                  className='flex items-center text-sm text-blue-600 hover:text-blue-800'
                >
                  {downloadingAll ? (
                    <>
                      <FaSpinner className='animate-spin mr-1' />
                      ডাউনলোড হচ্ছে...
                    </>
                  ) : (
                    <>
                      <FiDownload className='mr-1 text-xs' />
                      সব ছবি ডাউনলোড
                    </>
                  )}
                </button>
              )}
            </div>
            {inputErrors.image && <p className='text-red-500 text-sm mb-2'>{inputErrors.image}</p>}
            <div className='grid grid-cols-4 gap-2'>
              {allImages.map((img, index) => (
                <div
                  key={index}
                  onClick={() => handleImageClick(img.imageUrl)}
                  onMouseEnter={() => handleImageHover(img.imageUrl)}
                  onMouseLeave={handleImageLeave}
                  className={`relative cursor-pointer border-2 rounded-md overflow-hidden ${
                    selectedImage === img.imageUrl ? 'border-blue-500' : 'border-transparent'
                  }`}
                >
                  <img
                    src={img.imageUrl}
                    alt={`${product.name} - ${index + 1}`}
                    className='w-full h-20 object-cover'
                  />
                  <div className='absolute inset-0 flex items-start top-0 justify-end opacity-0 hover:opacity-100 bg-black bg-opacity-30 transition-opacity'>
                    <button
                      onClick={e => {
                        e.stopPropagation()
                        downloadImage(img.imageUrl, product.name, `thumb_${index}`)
                      }}
                      className='p-1 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors'
                      title='ছবি ডাউনলোড করুন'
                    >
                      {downloadingId === `thumb_${index}` ? (
                        <FaSpinner className='animate-spin text-blue-500 text-xs' />
                      ) : (
                        <FiDownload className='text-gray-700 text-xs' />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ডান কলাম - পণ্যের তথ্য */}
        <div className='space-y-6'>
          <div className='flex justify-between items-start'>
            <h1 className='text-2xl font-bold text-gray-900'>{product.name}</h1>
          </div>

          {/* মূল্য তথ্য */}
          <div className='space-y-2'>
            <div className='flex items-center gap-1'>
              <span className='text-lg font-semibold'>দাম:</span>
              <span className='text-xl font-bold text-gray-900'>{product.basePrice}</span>
              <span className='text-lg font-semibold'>টাকা</span>
              {product.stockSize > 0 ? (
                <span className='px-2 py-1 bg-green-100 text-green-800 text-sm rounded'>
                  স্টকে আছে
                </span>
              ) : (
                <span className='px-2 py-1 bg-red-100 text-red-800 text-sm rounded'>স্টকে নেই</span>
              )}
            </div>

            <div className='flex items-center gap-1'>
              <span className='text-sm font-semibold'>সাজেস্টেড সর্বোচ্চ মূল্য:</span>
              <span className='text-lg text-[#e5307e] font-bold'>{product.suggestedMaxPrice}</span>
              টাকা
            </div>
          </div>

          {/* মেটা তথ্য */}
          {Object.entries(metaInfo).map(([key, values]) => (
            <div key={key} className='space-y-2'>
              <h3 className='font-medium capitalize'>{key}</h3>
              <div className='flex flex-wrap gap-2'>
                {values.map(value => (
                  <label key={value} className='flex items-center space-x-2 cursor-pointer'>
                    <input
                      type='radio'
                      name={key}
                      checked={selectedMeta[key] === value}
                      onChange={() => handleMetaSelect(key, value)}
                      className='h-4 w-4 text-blue-600 focus:ring-blue-500'
                    />
                    <span className='text-gray-700'>{value}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
          {inputErrors.options && <p className='text-red-500 text-sm'>{inputErrors.options}</p>}

          {/* পরিমাণ এবং বিক্রয় মূল্য */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>পরিমাণ</label>
              <input
                type='text'
                inputMode='numeric'
                pattern='[0-9]*'
                value={quantity}
                onChange={handleQuantityChange}
                className={`w-full px-3 py-2 border ${
                  inputErrors.quantity ? 'border-red-500' : 'border-gray-300'
                } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                placeholder='পরিমাণ লিখুন'
              />
              {inputErrors.quantity && (
                <p className='text-red-500 text-xs mt-1'>{inputErrors.quantity}</p>
              )}
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                বিক্রয় মূল্য (ন্যূনতম ৳{product.basePrice.toLocaleString('bn-BD')})
              </label>
              <input
                type='text'
                inputMode='numeric'
                pattern='[0-9]*'
                value={sellingPrice}
                onChange={handleSellingPriceChange}
                className={`w-full px-3 py-2 border ${
                  inputErrors.sellingPrice ? 'border-red-500' : 'border-gray-300'
                } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                placeholder='মূল্য লিখুন'
              />
              {inputErrors.sellingPrice && (
                <p className='text-red-500 text-xs mt-1'>{inputErrors.sellingPrice}</p>
              )}
            </div>
          </div>

          {/* কার্টে যোগ করুন বাটন */}
          <button
            onClick={addToCart}
            className={`w-full py-3 px-4 rounded-md font-medium ${
              !!(
                inputErrors.quantity ||
                inputErrors.sellingPrice ||
                inputErrors.options ||
                inputErrors.image
              )
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
            disabled={
              !!(
                inputErrors.quantity ||
                inputErrors.sellingPrice ||
                inputErrors.options ||
                inputErrors.image
              )
            }
          >
            <div className='flex items-center justify-center gap-2'>
              <FiShoppingCart />
              <span>কার্টে যোগ করুন</span>
            </div>
          </button>

          {/* বিবরণ */}
          <div className='border-t pt-4'>
            <div className='flex justify-between items-center mb-2'>
              <h3 className='font-medium'>বিবরণ</h3>
              <button
                onClick={copyDescription}
                className='flex items-center text-sm text-blue-600 hover:text-blue-800'
              >
                <FiCopy className='mr-1' />
                {copied ? 'কপি হয়েছে!' : 'কপি করুন'}
              </button>
            </div>
            <p className='text-gray-700 whitespace-pre-line'>
              {product.description || 'কোন বিবরণ পাওয়া যায়নি'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetail
