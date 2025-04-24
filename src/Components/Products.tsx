import { useEffect, useState } from 'react'
import { FaHeart, FaSpinner } from 'react-icons/fa'
import { FiDownload, FiHeart } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { getAllProducts } from '../Api/product.api'
import { FavoriteProduct } from '../types/product.types'
import { FAVORITES_KEY } from '../utils/utils.variables'
import Loading from './Loading'

interface Product {
  productId: number
  name: string
  imageUrl: string
  basePrice: number
  published: boolean
  category: string
  stockSize: number
  suggestedMaxPrice: number
  description: string
  location: string
  deliveryChargeInside: number
  deliveryChargeOutside: number
  videoUrl: string
  images: { imageId: number; imageUrl: string }[]
  metas: { key: string; value: string }[]
}

const Products = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [favorites, setFavorites] = useState<FavoriteProduct[]>([])
  const [downloadingId, setDownloadingId] = useState<number | null>(null)
  const navigate = useNavigate()

  // Initialize favorites from localStorage
  useEffect(() => {
    const savedFavorites = localStorage.getItem(FAVORITES_KEY)
    if (savedFavorites) {
      try {
        const parsed = JSON.parse(savedFavorites)
        if (Array.isArray(parsed)) {
          setFavorites(parsed)
        }
      } catch (err) {
        console.error('Error parsing favorites:', err)
      }
    }
  }, [])

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        const response = await getAllProducts()
        setProducts(response.data)
      } catch (err) {
        setError('Failed to load products. Please try again later.')
        console.error('Error fetching products:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  const toggleFavorite = (productId: number) => {
    const updatedFavorites = favorites.some(fav => fav.productId === productId)
      ? favorites.filter(fav => fav.productId !== productId)
      : [...favorites, products.find(p => p.productId === productId)!]

    setFavorites(updatedFavorites)
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(updatedFavorites))
  }

  const downloadImage = async (imageUrl: string, productName: string, productId: number) => {
    try {
      setDownloadingId(productId)
      const response = await fetch(imageUrl)
      if (!response.ok) throw new Error('Failed to fetch image')

      const blob = await response.blob()
      const extension = imageUrl.split('.').pop()?.split('?')[0] || blob.type.split('/')[1] || 'jpg'

      const blobUrl = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = blobUrl
      link.download = `${productName.replace(/\s+/g, '_')}.${extension}`
      document.body.appendChild(link)
      link.click()

      setTimeout(() => {
        document.body.removeChild(link)
        URL.revokeObjectURL(blobUrl)
        setDownloadingId(null)
      }, 100)
    } catch (error) {
      console.error('Error downloading image:', error)
      setError('Failed to download image. Please try again.')
      setDownloadingId(null)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 2,
    })
      .format(price)
      .replace('BDT', '৳')
  }

  const navigateToProductDetail = (product: Product) => {
    navigate(`/products/${product.productId}`, {
      state: { product },
    })
  }

  if (loading) {
    return (
      <div className='flex justify-center items-center h-64'>
        <Loading />
      </div>
    )
  }

  if (error) {
    return (
      <div className='text-center py-12 text-red-500'>
        {error}
        <button
          onClick={() => window.location.reload()}
          className='mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors'
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
      <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6'>
        {products
          ?.filter(p => p.published)
          .map(product => (
            <div
              key={product.productId}
              className='bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 group border border-gray-100'
            >
              <div
                className='cursor-pointer relative'
                onClick={() => navigateToProductDetail(product)}
              >
                <div className='aspect-square overflow-hidden p-1'>
                  <img
                    src={product.imageUrl || '/placeholder-product.jpg'}
                    alt={product.name}
                    className='w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 border-rounded-xs'
                    loading='lazy'
                    onError={e => {
                      ;(e.target as HTMLImageElement).src = '/placeholder-product.jpg'
                    }}
                  />
                </div>

                <div className='absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300'>
                  <button
                    onClick={e => {
                      e.preventDefault()
                      e.stopPropagation()
                      downloadImage(product.imageUrl, product.name, product.productId)
                    }}
                    className='bg-white/90 p-2 rounded-full shadow hover:bg-gray-100 transition-colors backdrop-blur-sm'
                    aria-label={`Download ${product.name} image`}
                    title='Download image'
                    disabled={downloadingId === product.productId}
                  >
                    {downloadingId === product.productId ? (
                      <FaSpinner className='animate-spin text-blue-500 text-sm' />
                    ) : (
                      <FiDownload className='text-gray-700 text-sm' />
                    )}
                  </button>

                  <button
                    onClick={e => {
                      e.preventDefault()
                      e.stopPropagation()
                      toggleFavorite(product.productId)
                    }}
                    className='bg-white/90 p-2 rounded-full shadow hover:bg-gray-100 transition-colors backdrop-blur-sm'
                    aria-label={
                      favorites.some(p => p.productId === product.productId)
                        ? `Remove ${product.name} from favorites`
                        : `Add ${product.name} to favorites`
                    }
                  >
                    {favorites.some(p => p.productId === product.productId) ? (
                      <FaHeart className='text-red-500 text-sm' />
                    ) : (
                      <FiHeart className='text-gray-700 hover:text-red-500 text-sm' />
                    )}
                  </button>
                </div>
              </div>

              <div className='p-4'>
                <h3 className='text-sm font-medium text-gray-800 mb-1 line-clamp-2 h-10'>
                  {product.name}
                </h3>
                <p className='text-md font-bold text-gray-900'>{formatPrice(product.basePrice)}</p>
              </div>
            </div>
          ))}
      </div>

      {products?.length === 0 && !loading && (
        <div className='text-center py-12'>
          <p className='text-gray-500'>No products available</p>
        </div>
      )}
    </div>
  )
}

export default Products

export const PublicProducts = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        const response = await getAllProducts()
        setProducts(response.data.filter((p: Product) => p.published))
      } catch (err) {
        setError('পণ্য লোড করতে সমস্যা হয়েছে। পরে আবার চেষ্টা করুন।')
        console.error('পণ্য লোড করতে সমস্যা:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('bn-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
    })
      .format(price)
      .replace('BDT', '৳')
  }

  const navigateToProductDetail = (product: Product) => {
    navigate(`/products/${product.productId}`, {
      state: { product },
    })
  }

  if (loading) {
    return (
      <div className='flex justify-center items-center h-64'>
        <Loading />
      </div>
    )
  }

  if (error) {
    return (
      <div className='text-center py-12 text-red-500'>
        {error}
        <button
          onClick={() => window.location.reload()}
          className='mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors'
        >
          আবার চেষ্টা করুন
        </button>
      </div>
    )
  }

  return (
    <div className='bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-7xl mx-auto'>
        <div className='text-center mb-12'>
          <h2 className='text-3xl font-bold text-gray-900 mb-3'>আমাদের জনপ্রিয় পণ্য সমূহ</h2>
          <p className='text-lg text-gray-600 max-w-3xl mx-auto'>
            সেরা মানের পণ্য সংগ্রহ করুন আমাদের কাছ থেকে
          </p>
        </div>

        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8'>
          {products.map(product => (
            <div
              key={product.productId}
              className='bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group cursor-pointer border border-gray-100'
              onClick={() => navigateToProductDetail(product)}
            >
              <div className='relative aspect-square overflow-hidden'>
                <img
                  src={product.imageUrl || '/placeholder-product.jpg'}
                  alt={product.name}
                  className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-500'
                  loading='lazy'
                  onError={e => {
                    ;(e.target as HTMLImageElement).src = '/placeholder-product.jpg'
                  }}
                />

                <div
                  className={`absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-medium ${
                    product.stockSize > 0
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {product.stockSize > 0 ? 'স্টকে আছে' : 'স্টকে নেই'}
                </div>
              </div>

              <div className='p-4'>
                <h3 className='text-lg font-semibold text-gray-800 mb-1 line-clamp-2'>
                  {product.name}
                </h3>
                <p className='text-md font-bold text-blue-600 mb-2'>
                  {formatPrice(product.basePrice)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {products.length === 0 && !loading && (
          <div className='text-center py-12'>
            <p className='text-gray-500'>কোন পণ্য পাওয়া যায়নি</p>
          </div>
        )}
      </div>
    </div>
  )
}
