import { ChevronLeft, ChevronRight, Download, Heart, MapPin, Package, Ruler, X } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { fileDownloader } from '../Api/ftp.api'
import { productApi } from '../Api/product.api'
import shopApi, { Product } from '../Api/shop.api'
import { useCartFavorite } from '../Context/cartContext'
import { FAVORITES_KEY } from '../utils/utils.variables'

interface ProductListProps {
  showShopInfo?: boolean
}

// Size Chart Modal Component
const SizeChartModal = ({
  isOpen,
  onClose,
  sizeChart,
  onDownload,
}: {
  isOpen: boolean
  onClose: () => void
  sizeChart?: string
  onDownload: () => void
}) => {
  if (!isOpen) return null

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2'>
      <div className='bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto'>
        <div className='flex justify-between items-center p-3 border-b'>
          <h3 className='text-lg font-semibold'>Size Chart</h3>
          <div className='flex items-center space-x-2'>
            <button
              onClick={onDownload}
              className='p-1.5 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors'
              title='Download Size Chart'
            >
              <Download className='h-4 w-4' />
            </button>
            <button onClick={onClose} className='text-gray-500 hover:text-gray-700'>
              <X className='h-5 w-5' />
            </button>
          </div>
        </div>
        <div className='p-3'>
          {sizeChart ? (
            <img
              src={sizeChart}
              alt='Size Chart'
              className='w-full h-auto object-contain'
              onError={e => {
                ;(e.target as HTMLImageElement).src =
                  'https://via.placeholder.com/400x600?text=Size+Chart+Not+Available'
              }}
            />
          ) : (
            <div className='text-center py-6'>
              <Ruler className='h-10 w-10 text-gray-400 mx-auto mb-3' />
              <p className='text-gray-500'>Size chart not available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

interface Category {
  categoryId: number
  name: string
  categoryIcon: string | null
  description: string
  parentId: number | null
  createdAt?: string
  updatedAt?: string
  subCategories?: SubCategory[]
  products: number
  sizeChart?: string
}

interface SubCategory {
  categoryId: number
  name: string
  categoryIcon: string | null
  description: string
  parentId: number
  createdAt: string
  updatedAt: string
  products: number
  sizeChart?: string
}

const ProductList = ({ showShopInfo = true }: ProductListProps) => {
  const location = useLocation()
  const { categoryId, shopId, categoryName } = location.state || {}
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [favorites, setFavorites] = useState<Product[]>(
    JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]')
  )
  const [currentImageIndex, setCurrentImageIndex] = useState<{ [key: number]: number }>({})
  const [autoSlideIntervals] = useState<{ [key: number]: NodeJS.Timeout }>({})
  const [totalProducts, setTotalProducts] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const { loadFavoriteCount } = useCartFavorite()
  const navigate = useNavigate()
  const observer = useRef<IntersectionObserver | null>(null)
  const lastProductRef = useRef<HTMLDivElement | null>(null)

  // Filter state (from Categories component)
  const [shops, setShops] = useState<any[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [minPrice, setMinPrice] = useState<number | undefined>(undefined)
  const [maxPrice, setMaxPrice] = useState<number | undefined>(undefined)
  const [selectedShopId, setSelectedShopId] = useState<number | undefined>(undefined)
  const [selectedFilterCategory, setSelectedFilterCategory] = useState<number | undefined>(
    undefined
  )
  const [selectedFilterSubCategory, setSelectedFilterSubCategory] = useState<number | undefined>(
    undefined
  )
  const [searchQuery, setSearchQuery] = useState<string | ''>('')
  const [applyingFilters, setApplyingFilters] = useState(false)
  const [sizeChartModal, setSizeChartModal] = useState<{
    isOpen: boolean
    sizeChart?: string
  }>({
    isOpen: false,
    sizeChart: undefined,
  })
  const [, setDownloadingSizeCharts] = useState<{ [key: number]: boolean }>({})

  const PRODUCTS_PER_PAGE = 20

  useEffect(() => {
    const loadShopsAndCategories = async () => {
      try {
        const shopsResponse = await shopApi.getAllShops()
        setShops(shopsResponse.data.shops || [])

        const { success, data } = await shopApi.getCategories(null)
        if (success) setCategories(data || [])
      } catch (error) {
        console.error('Error loading shops and categories:', error)
      }
    }

    loadShopsAndCategories()
  }, [])

  const loadProducts = async (page: number = 1, isLoadMore: boolean = false) => {
    try {
      if (isLoadMore) {
        setLoadingMore(true)
      } else {
        setLoading(true)
      }

      // Determine category filter
      let categoryIdFilter: number | number[] | undefined = undefined
      if (selectedFilterCategory && selectedFilterSubCategory) {
        categoryIdFilter = selectedFilterSubCategory
      } else if (selectedFilterCategory) {
        const category = categories.find(cat => cat.categoryId === selectedFilterCategory)
        const subCategories = category?.subCategories?.map(sub => sub.categoryId) || []
        categoryIdFilter = subCategories
      } else if (categoryId) {
        categoryIdFilter = parseInt(categoryId)
      }

      const { success, data, totalCount } = await productApi.getAllProducts({
        shopId: selectedShopId || (shopId ? parseInt(shopId) : undefined),
        categoryId: categoryIdFilter,
        search: searchQuery || undefined,
        minPrice: minPrice || undefined,
        maxPrice: maxPrice || undefined,
        page,
        limit: PRODUCTS_PER_PAGE,
      })

      if (success) {
        if (isLoadMore) {
          setProducts(prev => [...prev, ...(data || [])])
        } else {
          setProducts(data || [])
          // Initialize image indexes for new products
          const initialIndexes: { [key: number]: number } = {}
          data.forEach((product: Product) => {
            initialIndexes[product.productId] = 0
          })
          setCurrentImageIndex(initialIndexes)
        }

        setTotalProducts(totalCount || 0)
        setHasMore((data || []).length === PRODUCTS_PER_PAGE)
      }
    } catch (error) {
      console.error('Error loading products:', error)
      if (!isLoadMore) {
        setProducts([])
      }
      setTotalProducts(0)
      setHasMore(false)
    } finally {
      setLoading(false)
      setLoadingMore(false)
      setApplyingFilters(false)
    }
  }

  useEffect(() => {
    setCurrentPage(1)
    loadProducts(1, false)
    return () => {
      Object.values(autoSlideIntervals).forEach(interval => clearInterval(interval))
    }
  }, [shopId, categoryId])

  useEffect(() => {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites))
    loadFavoriteCount()
  }, [favorites])

  // Infinite scroll implementation
  const lastProductElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loadingMore) return
      if (observer.current) observer.current.disconnect()

      observer.current = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting && hasMore) {
          const nextPage = currentPage + 1
          setCurrentPage(nextPage)
          loadProducts(nextPage, true)
        }
      })

      if (node) observer.current.observe(node)
      lastProductRef.current = node
    },
    [loadingMore, hasMore, currentPage]
  )

  const nextImage = (productId: number, totalImages: number, e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrentImageIndex(prev => ({
      ...prev,
      [productId]: ((prev[productId] || 0) + 1) % totalImages,
    }))
    if (autoSlideIntervals[productId]) {
      clearInterval(autoSlideIntervals[productId])
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

  const resetFilters = () => {
    setMinPrice(undefined)
    setMaxPrice(undefined)
    setSelectedShopId(undefined)
    setSelectedFilterCategory(undefined)
    setSelectedFilterSubCategory(undefined)
    setSearchQuery('')
    setCurrentPage(1)
    setHasMore(true)
    loadProducts(1, false)
  }

  const downloadSizeChart = async (sizeChartUrl: string, categoryId: number) => {
    if (sizeChartUrl) {
      setDownloadingSizeCharts(prev => ({ ...prev, [categoryId]: true }))
      try {
        await fileDownloader.downloadAllFiles([sizeChartUrl], {
          baseNamePrefix: 'size_chart',
          delayBetweenDownloads: 500,
        })
      } catch (error) {
        console.error('Error downloading size chart:', error)
      } finally {
        setDownloadingSizeCharts(prev => ({ ...prev, [categoryId]: false }))
      }
    }
  }

  // const openSizeChart = (sizeChart?: string) => {
  //   setSizeChartModal({
  //     isOpen: true,
  //     sizeChart,
  //   })
  // }

  const closeSizeChart = () => {
    setSizeChartModal({
      isOpen: false,
      sizeChart: undefined,
    })
  }

  const handleSizeChartDownload = (categoryId: number) => {
    if (sizeChartModal.sizeChart) {
      downloadSizeChart(sizeChartModal.sizeChart, categoryId)
    }
  }

  const applyFilters = () => {
    setCurrentPage(1)
    setApplyingFilters(true)
    loadProducts(1, false)
  }

  if (loading && currentPage === 1) {
    return (
      <div className='flex justify-center items-center h-64'>
        <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500'></div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-gray-50 p-1 sm:p-2' id='products'>
      <SizeChartModal
        isOpen={sizeChartModal.isOpen}
        onClose={closeSizeChart}
        sizeChart={sizeChartModal.sizeChart}
        onDownload={() => handleSizeChartDownload(selectedFilterCategory!)}
      />

      {/* Header with Back Button */}
      <div className='mb-5 mt-3'>
        {/* <div className='flex items-center justify-between mb-2'>
          <button
            onClick={() => navigate(-1)}
            className='flex items-center text-blue-600 hover:text-blue-800 text-sm'
          >
            <ArrowLeft className='h-4 w-4 mr-1' />
            <span>Back to {categoryName || 'Categories'}</span>
          </button>
        </div> */}

        {/* Filter Section (from Categories component) */}
        <div className='bg-white rounded-lg p-2 mb-2 border border-gray-200 shadow-sm'>
          <div className='flex justify-between items-center mb-2'>
            <h3 className='text-sm font-semibold text-gray-800'>প্রোডাক্ট ফিল্টার</h3>
            <button
              onClick={resetFilters}
              className='text-xs text-red-500 flex items-center hover:text-red-700'
            >
              <X className='h-3 w-3 mr-0.5' />
              রিসেট
            </button>
          </div>

          <div className='flex items-center mb-2 w-full'>
            <div className='flex-1 min-w-0'>
              <input
                type='number'
                placeholder='শুরু মূল্য'
                value={minPrice || ''}
                onChange={e =>
                  setMinPrice(e.target.value === '' ? undefined : Number(e.target.value))
                }
                className='w-full p-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-400'
              />
            </div>
            <span className='px-1 text-xs text-gray-600 whitespace-nowrap'>থেকে</span>
            <div className='flex-1 min-w-0'>
              <input
                type='number'
                placeholder='শেষ মূল্য'
                value={maxPrice || ''}
                onChange={e =>
                  setMaxPrice(e.target.value === '' ? undefined : Number(e.target.value))
                }
                className='w-full p-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-400'
              />
            </div>
          </div>

          <select
            className='w-full p-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-400 mb-1'
            value={selectedFilterCategory || ''}
            onChange={e =>
              setSelectedFilterCategory(e.target.value ? Number(e.target.value) : undefined)
            }
          >
            <option value=''>ক্যাটাগরি সিলেক্ট করুন</option>
            {categories.map(cat => (
              <option key={cat.categoryId} value={cat.categoryId}>
                {cat.name}
              </option>
            ))}
          </select>

          <select
            className='w-full p-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-400 mb-1'
            value={selectedFilterSubCategory || ''}
            onChange={e =>
              setSelectedFilterSubCategory(e.target.value ? Number(e.target.value) : undefined)
            }
            disabled={!selectedFilterCategory}
          >
            <option value=''>সাব-ক্যাটাগরি সিলেক্ট করুন</option>
            {selectedFilterCategory &&
              categories
                .find(cat => cat.categoryId === selectedFilterCategory)
                ?.subCategories?.map(sub => (
                  <option key={sub.categoryId} value={sub.categoryId}>
                    {sub.name}
                  </option>
                ))}
          </select>

          <select
            className='w-full p-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-400 mb-1'
            value={selectedShopId || ''}
            onChange={e => setSelectedShopId(e.target.value ? Number(e.target.value) : undefined)}
          >
            <option value=''>শপ সিলেক্ট করুন</option>
            {shops.map(shop => (
              <option key={shop.shopId} value={shop.shopId}>
                {shop.shopName}
              </option>
            ))}
          </select>

          <input
            type='text'
            placeholder='প্রোডাক্টের নাম দিয়ে সার্চ করুন'
            className='w-full p-1.5 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-400 mb-2'
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />

          <div className='flex justify-between items-center'>
            <button
              className='flex-1 bg-blue-500 text-white text-xs font-medium py-1.5 rounded hover:bg-blue-600 transition mr-1 disabled:opacity-50'
              onClick={applyFilters}
              disabled={applyingFilters}
            >
              {applyingFilters ? 'সার্চ হচ্ছে...' : '🔍 প্রোডাক্ট সার্চ করুন'}
            </button>
            <button
              className='flex-1 bg-gray-200 text-gray-700 text-xs font-medium py-1.5 rounded hover:bg-gray-300 transition'
              onClick={resetFilters}
            >
              রিসেট
            </button>
          </div>
        </div>

        {/* <div className='text-sm text-gray-600 mb-2'>
          Showing {products.length} of {totalProducts} products
        </div> */}
      </div>

      {products.length === 0 && !loading ? (
        <div className='text-center py-12 bg-white rounded-lg'>
          <Package className='h-12 w-12 text-gray-400 mx-auto mb-4' />
          <p className='text-gray-500'>কোন প্রোডাক্ট পাওয়া যায়নি</p>
          <button
            onClick={resetFilters}
            className='mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm'
          >
            ফিল্টার ক্লিয়ার করুন
          </button>
        </div>
      ) : (
        <>
          <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2'>
            {products.map((product, index) => {
              const isFavorite = favorites.some(p => p.productId === product.productId)
              const productImages = product.ProductImage || []
              const currentIndex = currentImageIndex[product.productId] || 0
              const totalImages = productImages.length

              // Add ref to the last product for infinite scroll
              const isLastProduct = index === products.length - 1
              const productRef = isLastProduct ? lastProductElementRef : null

              return (
                <div
                  key={product.productId}
                  ref={productRef}
                  onClick={() => handleNavigate(product.productId)}
                  className='bg-white rounded-lg shadow-sm border hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden group mb-1'
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
                        <Package className='h-6 w-6 text-gray-400' />
                      </div>
                    )}

                    {/* Image Navigation Arrows */}
                    {totalImages > 1 && (
                      <>
                        <button
                          onClick={e => prevImage(product.productId, totalImages, e)}
                          className='absolute left-1 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity'
                        >
                          <ChevronLeft className='h-4 w-4' />
                        </button>
                        <button
                          onClick={e => nextImage(product.productId, totalImages, e)}
                          className='absolute right-1 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity'
                        >
                          <ChevronRight className='h-4 w-4' />
                        </button>
                      </>
                    )}

                    {/* Image Indicators */}
                    {totalImages > 1 && (
                      <div className='absolute bottom-1 left-1/2 transform -translate-x-1/2 flex space-x-1'>
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
                    <div className='absolute top-1 right-1 flex flex-col space-y-1'>
                      <button
                        onClick={e => toggleFavorite(product, e)}
                        className={`p-1.5 rounded-full shadow-lg transition-all ${
                          isFavorite
                            ? 'bg-red-500 text-white'
                            : 'bg-white/90 text-gray-700 hover:bg-white'
                        }`}
                      >
                        <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
                      </button>

                      {productImages.length > 0 && (
                        <button
                          onClick={e => downloadAllImages(product, e)}
                          className='p-1.5 bg-white/90 text-gray-700 hover:bg-white rounded-full shadow-lg transition-all'
                          title='Download all images'
                        >
                          <Download className='h-4 w-4' />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className='p-2'>
                    <h3 className='font-bold text-gray-900 mb-1 text-sm line-clamp-2'>
                      {product.name}
                    </h3>
                    <div className='text-sm font-bold text-gray-900'>
                      {formatPrice((product.basePrice || product.price)!)}
                    </div>

                    {showShopInfo && product.shop && (
                      <div className='text-xs text-gray-500 mt-1'>
                        <div className='flex-1'>
                          <h6 className='text-xs font-[600] text-gray-900'>
                            {product.shop.shopName}
                          </h6>
                          <div className='flex items-center text-gray-600 mt-0.5'>
                            <MapPin className='h-3 w-3 mr-0.5' />
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

          {/* Loading spinner for infinite scroll */}
          {loadingMore && (
            <div className='flex justify-center mt-4'>
              <div className='animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500'></div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default ProductList
