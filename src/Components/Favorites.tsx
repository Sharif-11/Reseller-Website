import { ChevronLeft, ChevronRight, Download, Heart, MapPin, Package } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Product } from '../Api/shop.api'
import { FAVORITES_KEY } from '../utils/utils.variables'

const Favorites = () => {
  const [favorites, setFavorites] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [currentImageIndex, setCurrentImageIndex] = useState<{ [key: number]: number }>({})
  const [downloadingId, setDownloadingId] = useState<number | null>(null)
  const navigate = useNavigate()
  const itemsPerPage = 12

  // Load favorites from localStorage
  useEffect(() => {
    const loadFavorites = () => {
      try {
        setLoading(true)
        const savedFavorites = localStorage.getItem(FAVORITES_KEY)

        if (savedFavorites) {
          const parsed = JSON.parse(savedFavorites)
          if (Array.isArray(parsed)) {
            setFavorites(parsed)
          }
        }
      } catch (err) {
        console.error('Error loading favorites:', err)
      } finally {
        setLoading(false)
      }
    }

    loadFavorites()
  }, [])

  const removeFavorite = (productId: number) => {
    const updatedFavorites = favorites.filter(fav => fav.productId !== productId)
    setFavorites(updatedFavorites)
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(updatedFavorites))
  }

  const downloadAllImages = async (product: Product) => {
    if (!product.ProductImage) return

    try {
      setDownloadingId(product.productId)
      for (let i = 0; i < product.ProductImage.length; i++) {
        const image = product.ProductImage[i]
        const response = await fetch(image.imageUrl)
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${product.name.replace(/[^a-z0-9]/gi, '_')}_image_${i + 1}.jpg`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Error downloading images:', error)
    } finally {
      setDownloadingId(null)
    }
  }

  const formatPrice = (price: number) => {
    return `৳${price.toLocaleString()}`
  }

  const nextImage = (productId: number, totalImages: number) => {
    setCurrentImageIndex(prev => ({
      ...prev,
      [productId]: ((prev[productId] || 0) + 1) % totalImages,
    }))
  }

  const prevImage = (productId: number, totalImages: number) => {
    setCurrentImageIndex(prev => ({
      ...prev,
      [productId]: ((prev[productId] || 0) - 1 + totalImages) % totalImages,
    }))
  }

  const navigateToProductDetail = (productId: number) => {
    navigate(`/products/${productId}`)
  }

  // Pagination
  const totalPages = Math.ceil(favorites.length / itemsPerPage)
  const paginatedFavorites = favorites.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  if (loading) {
    return (
      <div className='flex justify-center items-center h-64'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500'></div>
      </div>
    )
  }

  if (favorites.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center py-12 text-gray-500'>
        <Heart className='text-4xl mb-4 text-gray-300' />
        <p className='text-xl font-medium mb-2'>No favorite products yet</p>
        <p className='text-sm'>Add products to your favorites to see them here</p>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <div className='bg-white shadow-sm border-b sticky top-0 z-40'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex items-center justify-between h-16'>
            <h1 className='text-xl font-bold text-gray-900'>Your Favorite Products</h1>
            <div className='text-sm text-gray-600'>
              {favorites.length} {favorites.length === 1 ? 'item' : 'items'}
            </div>
          </div>
        </div>
      </div>

      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* Products Grid */}
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
          {paginatedFavorites.map(product => {
            const currentImg = currentImageIndex[product.productId] || 0
            const totalImages = product.ProductImage?.length || 0

            return (
              <div
                key={`${product.productId}-${currentImg}`}
                className='bg-white rounded-xl shadow-sm border hover:shadow-lg transition-all duration-300 group overflow-hidden'
              >
                {/* Image Section with Slider */}
                <div className='relative aspect-square'>
                  {product.ProductImage && product.ProductImage.length > 0 ? (
                    <img
                      src={product.ProductImage[currentImg]?.imageUrl}
                      alt={product.name}
                      className='w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 cursor-pointer'
                      onClick={() => navigateToProductDetail(product.productId)}
                    />
                  ) : (
                    <div className='w-full h-full bg-gray-200 flex items-center justify-center'>
                      <Package className='h-12 w-12 text-gray-400' />
                    </div>
                  )}

                  {/* Image Navigation */}
                  {totalImages > 1 && (
                    <>
                      <button
                        onClick={e => {
                          e.stopPropagation()
                          prevImage(product.productId, totalImages)
                        }}
                        className='absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity'
                      >
                        <ChevronLeft className='h-4 w-4' />
                      </button>
                      <button
                        onClick={e => {
                          e.stopPropagation()
                          nextImage(product.productId, totalImages)
                        }}
                        className='absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity'
                      >
                        <ChevronRight className='h-4 w-4' />
                      </button>
                    </>
                  )}

                  {/* Image Indicators */}
                  {totalImages > 1 && (
                    <div className='absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1'>
                      {product.ProductImage.map((_, index) => (
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
                            index === currentImg ? 'bg-white' : 'bg-white/50'
                          }`}
                        />
                      ))}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className='absolute top-3 right-3 flex flex-col space-y-2'>
                    <button
                      onClick={e => {
                        e.stopPropagation()
                        removeFavorite(product.productId)
                      }}
                      className='p-2 bg-white/90 text-red-500 hover:bg-white rounded-full shadow-lg transition-all'
                    >
                      <Heart className='h-4 w-4 fill-current' />
                    </button>

                    {totalImages > 0 && (
                      <button
                        onClick={e => {
                          e.stopPropagation()
                          downloadAllImages(product)
                        }}
                        className='p-2 bg-white/90 text-gray-700 hover:bg-white rounded-full shadow-lg transition-all'
                        disabled={downloadingId === product.productId}
                      >
                        {downloadingId === product.productId ? (
                          <div className='animate-spin h-4 w-4 border-b-2 border-blue-500 rounded-full'></div>
                        ) : (
                          <Download className='h-4 w-4' />
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Product Info */}
                <div
                  className='p-4 cursor-pointer'
                  onClick={() => navigateToProductDetail(product.productId)}
                >
                  <h3 className='font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors text-sm'>
                    {product.name}
                  </h3>

                  <div className='flex items-center justify-between mb-3'>
                    <div>
                      <span className='text-lg font-bold text-gray-900'>
                        {formatPrice(product.basePrice)}
                      </span>
                    </div>
                  </div>

                  {/* Shop Info */}
                  {product.shop && (
                    <div className='text-xs text-gray-500 space-y-1 border-t border-gray-100 pt-3'>
                      <div className='flex items-center'>
                        <Package className='h-3 w-3 mr-1' />
                        <span>{product.shop.shopName}</span>
                      </div>
                      <div className='flex items-center'>
                        <MapPin className='h-3 w-3 mr-1' />
                        <span>{product.shop.shopLocation}</span>
                      </div>
                      {/* <div className='flex items-center'>
                        <Truck className='h-3 w-3 mr-1' />
                        <span>
                          Delivery: ৳{product.shop.deliveryChargeInside} (inside), ৳
                          {product.shop.deliveryChargeOutside} (outside)
                        </span>
                      </div> */}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className='flex justify-center mt-8'>
            <nav className='flex items-center space-x-2'>
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className='px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors'
              >
                <ChevronLeft className='h-4 w-4' />
              </button>

              <span className='px-4 py-2 text-sm text-gray-600'>
                Page {currentPage} of {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className='px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors'
              >
                <ChevronRight className='h-4 w-4' />
              </button>
            </nav>
          </div>
        )}
      </div>
    </div>
  )
}

export default Favorites
