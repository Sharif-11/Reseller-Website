import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Download,
  Heart,
  MapPin,
  Package,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { fileDownloader } from '../Api/ftp.api'
import { productApi } from '../Api/product.api'
import { Product } from '../Api/shop.api'
import { useCartFavorite } from '../Context/cartContext'
import { FAVORITES_KEY } from '../utils/utils.variables'

interface ProductListProps {
  showShopInfo?: boolean
}

const ProductList = ({ showShopInfo = true }: ProductListProps) => {
  const location = useLocation()
  const { categoryId, shopId, categoryName } = location.state || {}
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [favorites, setFavorites] = useState<Product[]>(
    JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]')
  )
  const [currentImageIndex, setCurrentImageIndex] = useState<{ [key: number]: number }>({})
  const [autoSlideIntervals] = useState<{ [key: number]: NodeJS.Timeout }>({})
  const [searchTerm, setSearchTerm] = useState('')
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 0])
  // const [showFilters, setShowFilters] = useState(false)
  const [totalProducts, setTotalProducts] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const { loadFavoriteCount } = useCartFavorite()
  const navigate = useNavigate()

  const loadProducts = async () => {
    try {
      const { success, data } = await productApi.getAllProducts({
        shopId: shopId ? parseInt(shopId) : undefined,
        categoryId: categoryId ? parseInt(categoryId) : undefined,
        search: searchTerm || undefined,
        minPrice: priceRange[0] > 0 ? priceRange[0] : undefined,
        maxPrice: priceRange[1] < 10000 ? priceRange[1] : undefined,
        page: currentPage,
        limit: 12,
      })

      if (success) {
        setProducts(data || [])
        setTotalProducts(data.length || 0)
        // Initialize image indexes
        const initialIndexes: { [key: number]: number } = {}
        data.forEach((product: Product) => {
          initialIndexes[product.productId] = 0
          if (product.ProductImage && product.ProductImage.length > 1) {
            // startAutoSlide(product.productId, product.ProductImage.length)
          }
        })
        setCurrentImageIndex(initialIndexes)
      }
    } catch (error) {
      console.error('Error loading products:', error)
      setProducts([])
      setTotalProducts(0)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProducts()
    return () => {
      Object.values(autoSlideIntervals).forEach(interval => clearInterval(interval))
    }
  }, [shopId, categoryId, searchTerm, priceRange, currentPage])

  useEffect(() => {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites))
    loadFavoriteCount()
  }, [favorites])

  // const startAutoSlide = (productId: number, totalImages: number) => {
  //   if (autoSlideIntervals[productId]) {
  //     clearInterval(autoSlideIntervals[productId])
  //   }

  //   const interval = setInterval(() => {
  //     setCurrentImageIndex(prev => ({
  //       ...prev,
  //       [productId]: ((prev[productId] || 0) + 1) % totalImages,
  //     }))
  //   }, 3000)

  //   setAutoSlideIntervals(prev => ({
  //     ...prev,
  //     [productId]: interval,
  //   }))
  // }

  // const stopAutoSlide = (productId: number) => {
  //   if (autoSlideIntervals[productId]) {
  //     clearInterval(autoSlideIntervals[productId])
  //     setAutoSlideIntervals(prev => {
  //       const newIntervals = { ...prev }
  //       delete newIntervals[productId]
  //       return newIntervals
  //     })
  //   }
  // }

  const nextImage = (productId: number, totalImages: number, e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrentImageIndex(prev => ({
      ...prev,
      [productId]: ((prev[productId] || 0) + 1) % totalImages,
    }))
    if (autoSlideIntervals[productId]) {
      clearInterval(autoSlideIntervals[productId])
      // startAutoSlide(productId, totalImages)
    }
  }

  const prevImage = (productId: number, totalImages: number, e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrentImageIndex(prev => ({
      ...prev,
      [productId]: ((prev[productId] || 0) - 1 + totalImages) % totalImages,
    }))
    if (autoSlideIntervals[productId]) {
      clearInterval(autoSlideIntervals[productId])
      // startAutoSlide(productId, totalImages)
    }
  }

  const toggleFavorite = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation()
    setFavorites(prev => {
      const isFavorite = prev.some(p => p.productId === product.productId)
      if (isFavorite) {
        return prev.filter(p => p.productId !== product.productId)
      } else {
        return [...prev, product]
      }
    })
    loadFavoriteCount()
  }

  const downloadAllImages = async (product: Product, e: React.MouseEvent) => {
    e.stopPropagation()
    const imageUrls = product.ProductImage?.map(img => img.imageUrl) || []
    if (imageUrls.length > 0) {
      try {
        await fileDownloader.downloadAllFiles(imageUrls, {
          baseNamePrefix: `product_${product.name.replace(/\s+/g, '_')}`,
          delayBetweenDownloads: 500,
        })
      } catch (error) {
        console.error('Error downloading images:', error)
      }
    }
  }

  const formatPrice = (price: number) => {
    return `৳${price.toLocaleString()}`
  }

  const handleNavigate = (productId: number) => {
    navigate(`/products/${productId}`)
  }

  const clearFilters = () => {
    setSearchTerm('')
    setPriceRange([0, 10000])
    setCurrentPage(1)
  }

  if (loading && currentPage === 1) {
    return (
      <div className='flex justify-center items-center h-64'>
        <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500'></div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-gray-50 p-4'>
      {/* Header with Back Button and Search */}
      <div className='mb-6'>
        <div className='flex items-center justify-between mb-4'>
          <button
            onClick={() => navigate(-1)}
            className='flex items-center text-blue-600 hover:text-blue-800'
          >
            <ArrowLeft className='h-5 w-5 mr-1' />
            <span>Back to {categoryName || 'Categories'}</span>
          </button>
        </div>

        {/* Search and Filter Bar */}
        <div className='bg-white rounded-lg p-3 mb-4 border border-gray-200'>
          {/* Price Range Filter */}
          <div className='flex items-center mb-2 w-full'>
            <div className='flex-1 min-w-0'>
              <input
                type='number'
                placeholder='শুরু মূল্য'
                value={priceRange[0] || ''}
                onChange={e => setPriceRange([Number(e.target.value), priceRange[1]])}
                className='w-full p-1 border-b border-gray-300 text-xs focus:outline-none'
              />
            </div>
            <span className='px-2 text-xs text-gray-500 whitespace-nowrap'>to</span>
            <div className='flex-1 min-w-0'>
              <input
                type='number'
                placeholder='শেষ মূল্য'
                value={priceRange[1] || ''}
                onChange={e => setPriceRange([priceRange[0], Number(e.target.value)])}
                className='w-full p-1 border-b border-gray-300 text-xs focus:outline-none'
              />
            </div>
          </div>

          {/* Search Filter */}
          <input
            type='text'
            placeholder='প্রোডাক্টের নাম দিয়ে সার্চ করুন'
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className='w-full p-1 border-b border-gray-300 text-xs focus:outline-none mb-2'
          />

          {/* Clear Filters Button (only shown when filters are active) */}
          {(searchTerm || priceRange[0] > 0 || priceRange[1] < 10000) && (
            <button
              onClick={clearFilters}
              className='text-xs text-blue-600 hover:text-blue-800 font-medium'
            >
              ফিল্টার ক্লিয়ার করুন
            </button>
          )}
        </div>

        <div className='text-sm text-gray-600 mb-2'>
          Showing {products.length} of {totalProducts} products
        </div>
      </div>

      {products.length === 0 ? (
        <div className='text-center py-12 bg-white rounded-lg'>
          <Package className='h-12 w-12 text-gray-400 mx-auto mb-4' />
          <p className='text-gray-500'>কোন প্রোডাক্ট পাওয়া যায়নি</p>
          <button
            onClick={clearFilters}
            className='mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700'
          >
            ফিল্টার ক্লিয়ার করুন
          </button>
        </div>
      ) : (
        <>
          <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4'>
            {products.map(product => {
              const isFavorite = favorites.some(p => p.productId === product.productId)
              const productImages = product.ProductImage || []
              const currentIndex = currentImageIndex[product.productId] || 0
              const totalImages = productImages.length

              return (
                <div
                  key={product.productId}
                  onClick={() => handleNavigate(product.productId)}
                  className='bg-white rounded-lg shadow-sm border hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden group'
                  // onMouseEnter={() =>
                  //   totalImages > 1 && startAutoSlide(product.productId, totalImages)
                  // }
                  // onMouseLeave={() => stopAutoSlide(product.productId)}
                >
                  {/* Product Image with Slider */}
                  <div className='relative aspect-[3/4]'>
                    {productImages.length > 0 ? (
                      <img
                        src={productImages[currentIndex]?.imageUrl}
                        alt={product.name}
                        className='w-full h-full object-cover transition-transform duration-500'
                      />
                    ) : (
                      <div className='w-full h-full bg-gray-200 flex items-center justify-center'>
                        <Package className='h-12 w-12 text-gray-400' />
                      </div>
                    )}

                    {/* Image Navigation Arrows */}
                    {totalImages > 1 && (
                      <>
                        <button
                          onClick={e => prevImage(product.productId, totalImages, e)}
                          className='absolute left-[2px] top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity'
                        >
                          <ChevronLeft className='h-4 w-4' />
                        </button>
                        <button
                          onClick={e => nextImage(product.productId, totalImages, e)}
                          className='absolute right-[2px] top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity'
                        >
                          <ChevronRight className='h-4 w-4' />
                        </button>
                      </>
                    )}

                    {/* Image Indicators */}
                    {totalImages > 1 && (
                      <div className='absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1'>
                        {productImages.map((_, index) => (
                          <button
                            key={index}
                            onClick={e => {
                              e.stopPropagation()
                              setCurrentImageIndex(prev => ({
                                ...prev,
                                [product.productId]: index,
                              }))
                            }}
                            className={`w-2 h-2 rounded-full transition-colors ${
                              index === currentIndex ? 'bg-white' : 'bg-white/50'
                            }`}
                          />
                        ))}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className='absolute top-2 right-2 flex flex-col space-y-2'>
                      <button
                        onClick={e => toggleFavorite(product, e)}
                        className={`p-1.5 rounded-full shadow-lg transition-all ${
                          isFavorite
                            ? 'bg-red-500 text-white'
                            : 'bg-white/90 text-gray-700 hover:bg-white'
                        }`}
                      >
                        <Heart className={`h-3.5 w-3.5 ${isFavorite ? 'fill-current' : ''}`} />
                      </button>

                      {productImages.length > 0 && (
                        <button
                          onClick={e => downloadAllImages(product, e)}
                          className='p-1.5 bg-white/90 text-gray-700 hover:bg-white rounded-full shadow-lg transition-all'
                          title='Download all images'
                        >
                          <Download className='h-3.5 w-3.5' />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className='p-3'>
                    <h3 className='font-bold text-gray-900 mb-1 text-sm line-clamp-2'>
                      {product.name}
                    </h3>
                    <div className='text-sm font-bold text-gray-900'>
                      {formatPrice(product.basePrice || product.price!)}
                    </div>

                    {showShopInfo && product.shop && (
                      <div className='text-xs text-gray-500 mt-1'>
                        <div className='flex-1'>
                          <h6 className='text-md font-[600] text-gray-900'>
                            {product.shop.shopName}
                          </h6>
                          <div className='flex items-center text-gray-600 mt-1'>
                            <MapPin className='h-4 w-4 mr-1' />
                            <span className='text-xs'>{product.shop.shopLocation}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Pagination */}
          {/* {totalProducts > 12 && (
            <div className='flex justify-center mt-8'>
              <div className='flex items-center gap-2'>
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className='p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100'
                >
                  <ChevronLeft className='h-5 w-5' />
                </button>
                <span className='px-4 py-2 text-gray-700'>
                  Page {currentPage} of {Math.ceil(totalProducts / 12)}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  disabled={currentPage >= Math.ceil(totalProducts / 12)}
                  className='p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100'
                >
                  <ChevronRight className='h-5 w-5' />
                </button>
              </div>
            </div>
          )} */}
        </>
      )}
    </div>
  )
}

export default ProductList
