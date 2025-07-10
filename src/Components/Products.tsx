import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Download,
  Grid3X3,
  Heart,
  List,
  MapPin,
  Package,
  Truck,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fileDownloader } from '../Api/ftp.api'
import { orderApi } from '../Api/order.api'
import ShopApi, { Category, Product, Shop } from '../Api/shop.api'
import { useCartFavorite } from '../Context/cartContext'
import { FAVORITES_KEY } from '../utils/utils.variables'

const Products = () => {
  const [view, setView] = useState('shops')
  const [shops, setShops] = useState<Shop[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [topSellingProducts, setTopSellingProducts] = useState<Product[]>([])
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [loading, setLoading] = useState(false)
  const [favorites, setFavorites] = useState<Product[]>(
    JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]') as Product[]
  )

  // Filter states
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000])
  const [showFilters, setShowFilters] = useState<boolean>(false)
  const [viewMode, setViewMode] = useState<string>('grid')

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [totalPages] = useState<number>(1)
  const itemsPerPage = 12
  const navigate = useNavigate()
  const { loadFavoriteCount } = useCartFavorite()

  // Image slider states
  const [currentImageIndex, setCurrentImageIndex] = useState<{ [key: number]: number }>({})
  const [autoSlideIntervals, setAutoSlideIntervals] = useState<{ [key: number]: NodeJS.Timeout }>(
    {}
  )

  // Load shops on component mount
  useEffect(() => {
    loadShops()
    loadFavorites()
    return () => {
      // Clear all intervals on unmount
      Object.values(autoSlideIntervals).forEach(interval => clearInterval(interval))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites))
  }, [favorites])

  // Load products when filters change
  useEffect(() => {
    if (view === 'products' && selectedShop && selectedCategory) {
      loadProducts()
    }
  }, [searchTerm, priceRange, currentPage, selectedShop, selectedCategory])
  useEffect(() => {
    loadFavoriteCount()
  }, [favorites])

  const loadShops = async () => {
    try {
      setLoading(true)
      const response = await ShopApi.getAllShops()
      setShops(response.data.shops || [])
    } catch (error) {
      console.error('Error loading shops:', error)
      setShops([])
    } finally {
      setLoading(false)
    }
  }
  const loadTopSellingProducts = async () => {
    try {
      const response = await orderApi.getTopSellingProducts()
      setTopSellingProducts(response.data || [])
    } catch (error) {
      console.error('Error loading top selling products:', error)
      setTopSellingProducts([])
    }
  }

  const loadFavorites = () => {
    const storedFavorites = localStorage.getItem(FAVORITES_KEY)
    if (storedFavorites) {
      setFavorites(JSON.parse(storedFavorites))
    } else {
      setFavorites([])
    }
  }

  const loadCategories = async (shopId: number) => {
    try {
      setLoading(true)
      const response = await ShopApi.getShopCategories(shopId)
      setCategories(response.data || [])
    } catch (error) {
      console.error('Error loading categories:', error)
      setCategories([])
    } finally {
      setLoading(false)
    }
  }

  const loadProducts = async () => {
    try {
      if (!selectedShop || !selectedCategory) {
        return
      }
      const response = await ShopApi.getAllProducts({
        search: searchTerm || undefined,
        minPrice: priceRange[0] > 0 ? priceRange[0] : undefined,
        maxPrice: priceRange[1] < 10000 ? priceRange[1] : undefined,
        categoryId: selectedCategory.categoryId,
        shopId: selectedShop.shopId,
        page: currentPage,
        limit: itemsPerPage,
      })

      // setUserType(response.response.userType)

      setProducts(response.data || [])

      setFilteredProducts(response.data || [])

      // Initialize auto-slide for each product
      response.data.forEach((product: Product) => {
        if (product.ProductImage && product.ProductImage.length > 1) {
          startAutoSlide(product.productId, product.ProductImage.length)
        }
      })
    } catch (error) {
      console.error('Error loading products:', error)
      setProducts([])
      setFilteredProducts([])
    }
  }

  const startAutoSlide = (productId: number, totalImages: number) => {
    // Clear existing interval if any
    if (autoSlideIntervals[productId]) {
      clearInterval(autoSlideIntervals[productId])
    }

    const interval = setInterval(() => {
      setCurrentImageIndex(prev => ({
        ...prev,
        [productId]: ((prev[productId] || 0) + 1) % totalImages,
      }))
    }, 3000) // Change image every 3 seconds

    setAutoSlideIntervals(prev => ({
      ...prev,
      [productId]: interval,
    }))
  }

  const stopAutoSlide = (productId: number) => {
    if (autoSlideIntervals[productId]) {
      clearInterval(autoSlideIntervals[productId])
      setAutoSlideIntervals(prev => {
        const newIntervals = { ...prev }
        delete newIntervals[productId]
        return newIntervals
      })
    }
  }

  const handleShopSelect = async (shop: Shop): Promise<void> => {
    setSelectedShop(shop)
    setView('categories')
    await loadCategories(shop.shopId)
  }

  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category)
    setView('products')
    setCurrentPage(1)
  }

  const toggleFavorite = (product: Product) => {
    setFavorites(prev => {
      const isFavorite = prev.some(p => p.productId === product.productId)
      if (isFavorite) {
        return prev.filter(p => p.productId !== product.productId)
      } else {
        return [...prev, product]
      }
    })
  }

  const downloadAllImages = async (product: Product) => {
    const imageUrls = []
    try {
      for (let i = 0; i < product.ProductImage.length; i++) {
        const image = product.ProductImage[i]
        if (image && image.imageUrl) {
          imageUrls.push(image.imageUrl)
        }
      }
      await fileDownloader.downloadAllFiles(imageUrls, {
        baseNamePrefix: `product_${product.name.replace(/\s+/g, '_')}`,
        delayBetweenDownloads: 500, // Optional delay between downloads
        onProgress: progress => {
          console.log(`Download progress: ${progress}%`)
          // Update your UI here
        },
      })
    } catch (error) {
      console.error('Error downloading images:', error)
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
    // Reset auto-slide timer
    if (autoSlideIntervals[productId]) {
      clearInterval(autoSlideIntervals[productId])
      startAutoSlide(productId, totalImages)
    }
  }

  const prevImage = (productId: number, totalImages: number) => {
    setCurrentImageIndex(prev => ({
      ...prev,
      [productId]: ((prev[productId] || 0) - 1 + totalImages) % totalImages,
    }))
    // Reset auto-slide timer
    if (autoSlideIntervals[productId]) {
      clearInterval(autoSlideIntervals[productId])
      startAutoSlide(productId, totalImages)
    }
  }

  const clearFilters = () => {
    setSearchTerm('')
    setPriceRange([0, 10000])
    setCurrentPage(1)
  }

  const handleNavigate = (productId: number) => {
    navigate(`/products/${productId}`)
  }
  useEffect(() => {
    loadShops()
    loadFavorites()
    loadTopSellingProducts() // Add this line
    return () => {
      Object.values(autoSlideIntervals).forEach(interval => clearInterval(interval))
    }
  }, [])

  if (loading) {
    return (
      <div className='flex justify-center items-center h-64'>
        <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500'></div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <div className='bg-white shadow-sm border-b sticky top-0 z-40'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex items-center justify-between h-16'>
            {/* Breadcrumb */}
            <div className='flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm overflow-x-auto scrollbar-hide pb-1'>
              <button
                onClick={() => setView('shops')}
                className={`flex items-center px-2 sm:px-3 py-1 rounded-full transition-colors whitespace-nowrap flex-shrink-0 ${
                  view === 'shops'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                <span className='hidden sm:inline'>Shops</span>
                <span className='sm:hidden'>🏪</span>
              </button>
              {selectedShop && (
                <>
                  <ChevronRight className='h-3 w-3 sm:h-4 sm:w-4 text-gray-400 flex-shrink-0' />
                  <button
                    onClick={() => setView('categories')}
                    className={`flex items-center px-2 sm:px-3 py-1 rounded-full transition-colors whitespace-nowrap flex-shrink-0 max-w-[120px] sm:max-w-none ${
                      view === 'categories'
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-blue-600'
                    }`}
                  >
                    <span className='truncate'>{selectedShop.shopName}</span>
                  </button>
                </>
              )}
              {selectedCategory && (
                <>
                  <ChevronRight className='h-3 w-3 sm:h-4 sm:w-4 text-gray-400 flex-shrink-0' />
                  <span className='px-2 sm:px-3 py-1 bg-gray-100 text-gray-700 rounded-full whitespace-nowrap flex-shrink-0 max-w-[100px] sm:max-w-none'>
                    <span className='truncate block'>{selectedCategory.name}</span>
                  </span>
                </>
              )}
            </div>

            {/* View controls for products */}
            {view === 'products' && (
              <div className='flex items-center space-x-2'>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-blue-100 text-blue-600'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <Grid3X3 className='h-5 w-5' />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'list'
                      ? 'bg-blue-100 text-blue-600'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <List className='h-5 w-5' />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* Search and Filters for Products */}
        {view === 'products' && (
          <div className='w-full'>
            {/* Search and Filter Header */}
            <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6'>
              {/* Search Bar */}
              <div className='relative flex-grow max-w-2xl'>
                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                  <svg className='h-5 w-5 text-gray-400' fill='currentColor' viewBox='0 0 20 20'>
                    <path
                      fillRule='evenodd'
                      d='M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z'
                      clipRule='evenodd'
                    />
                  </svg>
                </div>
                <input
                  type='text'
                  placeholder='Search products...'
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className='w-full pl-10 pr-10 py-3 md:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base'
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className='absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600'
                  >
                    <svg className='h-5 w-5' fill='currentColor' viewBox='0 0 20 20'>
                      <path
                        fillRule='evenodd'
                        d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'
                        clipRule='evenodd'
                      />
                    </svg>
                  </button>
                )}
              </div>

              {/* Filter Controls */}
              <div className='flex items-center justify-between gap-3'>
                {/* Results Count */}
                <div className='text-sm text-gray-600 whitespace-nowrap hidden sm:block'>
                  {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
                </div>

                {/* Filter Toggle */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className='flex items-center space-x-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm'
                >
                  <svg className='h-4 w-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z'
                    />
                  </svg>
                  <span>Filters</span>
                </button>

                {/* Clear Filters */}
                {(searchTerm || priceRange[0] > 0 || priceRange[1] < 10000) && (
                  <button
                    onClick={clearFilters}
                    className='text-sm text-blue-600 hover:text-blue-800 whitespace-nowrap'
                  >
                    Clear all
                  </button>
                )}
              </div>
            </div>

            {/* Price Filter Panel */}
            {showFilters && (
              <div className='bg-white p-4 mb-6 rounded-lg shadow-sm border border-gray-200'>
                <div className='space-y-4'>
                  <h3 className='font-medium text-gray-900'>Price Range</h3>

                  <div className='flex items-center space-x-3'>
                    <div className='flex-1'>
                      <label htmlFor='minPrice' className='sr-only'>
                        Min Price
                      </label>
                      <input
                        type='number'
                        id='minPrice'
                        value={priceRange[0]}
                        onChange={e => setPriceRange([Number(e.target.value), priceRange[1]])}
                        className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
                        placeholder='Min'
                      />
                    </div>
                    <span className='text-gray-500'>to</span>
                    <div className='flex-1'>
                      <label htmlFor='maxPrice' className='sr-only'>
                        Max Price
                      </label>
                      <input
                        type='number'
                        id='maxPrice'
                        value={priceRange[1]}
                        onChange={e => setPriceRange([priceRange[0], Number(e.target.value)])}
                        className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
                        placeholder='Max'
                      />
                    </div>
                  </div>

                  <div className='pt-2'>
                    <div className='text-sm font-medium text-gray-700'>
                      Selected: {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Shops View */}
        {view === 'shops' && (
          <div id='products'>
            <h1 className='text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8'>
              শপ সিলেক্ট করুন
            </h1>
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6'>
              {shops.map(shop => (
                <div
                  key={shop.shopId}
                  onClick={() => handleShopSelect(shop)}
                  className='bg-white rounded-xl shadow-sm border hover:shadow-lg transition-all duration-300 cursor-pointer group overflow-hidden'
                >
                  <div className='p-4 sm:p-6'>
                    <div className='flex items-start justify-between'>
                      <div className='flex-1'>
                        <h3 className='text-lg sm:text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors'>
                          {shop.shopName}
                        </h3>
                        <div className='flex items-center text-gray-600 mt-1 sm:mt-2'>
                          <MapPin className='h-4 w-4 mr-1' />
                          <span className='text-xs sm:text-sm'>{shop.shopLocation}</span>
                        </div>
                      </div>
                      <div className='bg-blue-50 p-2 sm:p-3 rounded-full'>
                        <Package className='h-5 sm:h-6 w-5 sm:w-6 text-blue-600' />
                      </div>
                    </div>

                    <div className='mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-100'>
                      <div className='flex items-center text-xs sm:text-sm text-gray-600'>
                        <Truck className='h-4 w-4 mr-2' />
                        <span>
                          Delivery: ৳{shop.deliveryChargeInside} (inside) / ৳
                          {shop.deliveryChargeOutside} (outside)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {topSellingProducts.length > 0 && (
              <div className='mt-12'>
                <h2 className='text-xl sm:text-2xl font-bold text-gray-900 mb-6'>
                  জনপ্রিয় পণ্য সমূহ
                </h2>
                <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4'>
                  {topSellingProducts.map(product => {
                    const isFavorite = favorites.some(p => p.productId === product.productId)
                    const primaryImage = product.ProductImage?.[0]?.imageUrl

                    return (
                      <div
                        key={product.productId}
                        onClick={() => handleNavigate(product.productId)}
                        className='bg-white rounded-lg shadow-sm border hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden'
                      >
                        {/* Product Image */}
                        <div className='relative aspect-[3/4]'>
                          {primaryImage ? (
                            <img
                              src={primaryImage}
                              alt={product.name}
                              className='w-full h-full object-cover'
                            />
                          ) : (
                            <div className='w-full h-full bg-gray-200 flex items-center justify-center'>
                              <Package className='h-12 w-12 text-gray-400' />
                            </div>
                          )}

                          {/* Favorite Button */}
                          <button
                            onClick={e => {
                              e.stopPropagation()
                              toggleFavorite(product)
                            }}
                            className={`absolute top-2 right-2 p-2 rounded-full shadow-lg transition-all ${
                              isFavorite
                                ? 'bg-red-500 text-white'
                                : 'bg-white/90 text-gray-700 hover:bg-white'
                            }`}
                          >
                            <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
                          </button>
                        </div>

                        {/* Product Info */}
                        <div className='p-3'>
                          <h3 className='font-bold text-gray-900 mb-1 text-sm line-clamp-2'>
                            {product.name}
                          </h3>
                          <div className='text-sm font-bold text-gray-900'>
                            {formatPrice(product.basePrice || product.price!)}
                          </div>
                          <div className='text-xs text-gray-500 mt-1'>
                            <div className='flex-1'>
                              <h6 className='text-md sm:text-xl font-[600] text-gray-900 group-hover:text-blue-600 transition-colors'>
                                {product.shop.shopName}
                              </h6>
                              <div className='flex items-center text-gray-600 mt-1 sm:mt-2'>
                                <MapPin className='h-4 w-4 mr-1' />
                                <span className='text-xs sm:text-sm'>
                                  {product.shop.shopLocation}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Categories View */}
        {view === 'categories' && selectedShop && (
          <div>
            {/* Header Section */}
            <div className='flex items-center mb-4 sm:mb-6'>
              <button
                onClick={() => setView('shops')}
                className='flex items-center text-gray-600 hover:text-gray-900 mr-4'
              >
                <ArrowLeft className='h-5 w-5 mr-1' />
                <span className='hidden sm:inline'>Back</span>
              </button>
              <h1 className='text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900'>
                প্রোডাক্ট ক্যাটাগরি ({selectedShop.shopName})
              </h1>
            </div>

            {/* Categories Grid */}
            <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4'>
              {categories.map(category => (
                <div
                  key={category.categoryId}
                  onClick={() => handleCategorySelect(category)}
                  className='bg-white rounded-xl shadow-sm border hover:shadow-md transition-all duration-200 cursor-pointer group p-2 text-center min-h-[200px] sm:min-h-[220px] md:min-h-[240px] flex flex-col'
                >
                  {/* Image taking 95% of card area */}
                  <div className='flex-1 p-1 flex items-center justify-center'>
                    {category.categoryIcon ? (
                      <img
                        src={category.categoryIcon}
                        alt={category.name}
                        className='w-full h-full object-cover rounded-lg max-h-[160px] sm:max-h-[170px] md:max-h-[180px]'
                      />
                    ) : (
                      <div className='w-full h-full bg-blue-100 rounded-lg flex items-center justify-center max-h-[160px] sm:max-h-[170px] md:max-h-[180px]'>
                        <Package className='h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24 text-blue-500' />
                      </div>
                    )}
                  </div>

                  {/* Category Name at bottom */}
                  <div className='p-2 pt-1'>
                    <h3 className='font-semibold text-sm sm:text-base text-gray-900 group-hover:text-blue-600 transition-colors leading-tight line-clamp-2'>
                      {category.name}
                    </h3>
                  </div>
                </div>
              ))}

              {/* Empty State */}
              {categories.length === 0 && (
                <div className='col-span-full text-center py-12 sm:py-16 bg-white rounded-xl'>
                  <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                    <Package className='h-8 w-8 text-gray-400' />
                  </div>
                  <h3 className='text-lg sm:text-xl font-semibold text-gray-900 mb-2'>
                    No categories found
                  </h3>
                  <p className='text-gray-600 text-sm sm:text-base'>
                    This shop has no categories available
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Products View */}
        {view === 'products' && selectedCategory && (
          <div>
            <div className='flex items-center mb-6 sm:mb-8'>
              <button
                onClick={() => setView('categories')}
                className='flex items-center text-gray-600 hover:text-gray-900 mr-4'
              >
                <ArrowLeft className='h-5 w-5 mr-1' />
                <span className='hidden sm:inline'>Back</span>
              </button>
              <h1 className='text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900'>
                {selectedCategory.name} Products
              </h1>
            </div>

            {filteredProducts.length === 0 ? (
              <div className='text-center py-12 sm:py-16 bg-white rounded-xl'>
                <Package className='h-12 sm:h-16 w-12 sm:w-16 text-gray-300 mx-auto mb-3 sm:mb-4' />
                <h3 className='text-lg sm:text-xl font-semibold text-gray-900 mb-1 sm:mb-2'>
                  No products found
                </h3>
                <p className='text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base'>
                  Try adjusting your search or filters
                </p>
                <button
                  onClick={clearFilters}
                  className='px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base'
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <>
                {/* Products Grid */}
                <div
                  className={`grid gap-3 sm:gap-4 ${
                    viewMode === 'grid'
                      ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'
                      : 'grid-cols-1'
                  }`}
                >
                  {filteredProducts.map(product => {
                    const currentImg = currentImageIndex[product.productId] || 0
                    const totalImages = product.ProductImage?.length || 0
                    const isFavorite = favorites.some(p => p.productId === product.productId)

                    return (
                      <div
                        key={`${product.productId}-${currentImg}`}
                        className={`bg-white rounded-lg sm:rounded-xl shadow-sm border hover:shadow-lg transition-all duration-300 group overflow-hidden ${
                          viewMode === 'list' ? 'flex flex-col sm:flex-row' : ''
                        }`}
                        onMouseEnter={() =>
                          totalImages > 1 && startAutoSlide(product.productId, totalImages)
                        }
                        onMouseLeave={() => stopAutoSlide(product.productId)}
                      >
                        {/* Image Section with Slider */}
                        <div
                          className={`relative ${
                            viewMode === 'list'
                              ? 'w-full sm:w-64 h-48 sm:h-64 flex-shrink-0' // Fixed height for list view
                              : 'aspect-[3/4]' // Taller aspect ratio
                          }`}
                        >
                          {product.ProductImage && product.ProductImage.length > 0 ? (
                            <img
                              src={product.ProductImage[currentImg]?.imageUrl}
                              alt={product.name}
                              className='w-full h-full object-cover transition-transform duration-500 group-hover:scale-105'
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
                          <div className='absolute top-2 right-2 flex flex-col space-y-2'>
                            <button
                              onClick={e => {
                                e.stopPropagation()
                                toggleFavorite(product)
                              }}
                              className={`p-1 sm:p-2 rounded-full shadow-lg transition-all ${
                                isFavorite
                                  ? 'bg-red-500 text-white'
                                  : 'bg-white/90 text-gray-700 hover:bg-white'
                              }`}
                            >
                              <Heart
                                className={`h-3 w-3 sm:h-4 sm:w-4 ${
                                  isFavorite ? 'fill-current' : ''
                                }`}
                              />
                            </button>

                            {totalImages > 1 && (
                              <button
                                onClick={e => {
                                  e.stopPropagation()
                                  downloadAllImages(product)
                                }}
                                className='p-1 sm:p-2 bg-white/90 text-gray-700 hover:bg-white rounded-full shadow-lg transition-all'
                                title='Download all images'
                              >
                                <Download className='h-3 w-3 sm:h-4 sm:w-4' />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Product Info */}
                        <div
                          className={`p-3 sm:p-4 ${viewMode === 'list' ? 'flex-1' : ''}`}
                          onClick={() => handleNavigate(product.productId)}
                        >
                          <h3 className='font-bold text-gray-900 mb-1 sm:mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors text-sm sm:text-base'>
                            {product.name}
                          </h3>

                          <div className='flex items-center justify-between mb-2 sm:mb-3'>
                            <div>
                              <span className='text-sm sm:text-base font-bold text-gray-900'>
                                {formatPrice(product.basePrice || product.price!)}
                              </span>
                            </div>
                          </div>

                          <div className='text-xs text-gray-500 space-y-1'>
                            <div className='flex items-center'>
                              <Package className='h-3 w-3 mr-1' />
                              <span className='truncate'>{product.shop?.shopName}</span>
                            </div>
                            <div className='flex items-center'>
                              <MapPin className='h-3 w-3 mr-1' />
                              <span className='truncate'>{product.shop?.shopLocation}</span>
                            </div>
                          </div>

                          {viewMode === 'list' && (
                            <div className='mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-100'>
                              <button className='w-full bg-blue-600 text-white py-1 sm:py-2 px-3 sm:px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base'>
                                View Details
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className='flex justify-center mt-6 sm:mt-8'>
                    <nav className='flex items-center space-x-2'>
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className='px-3 sm:px-4 py-1 sm:py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors'
                      >
                        <ChevronLeft className='h-4 w-4' />
                      </button>

                      <span className='px-3 sm:px-4 py-1 sm:py-2 text-sm text-gray-600'>
                        Page {currentPage} of {totalPages}
                      </span>

                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className='px-3 sm:px-4 py-1 sm:py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors'
                      >
                        <ChevronRight className='h-4 w-4' />
                      </button>
                    </nav>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Products

// export const PublicProducts = () => {
//   const [products, setProducts] = useState<Product[]>([])
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState<string | null>(null)
//   const navigate = useNavigate()

//   // Fetch products
//   useEffect(() => {
//     const fetchProducts = async () => {
//       try {
//         setLoading(true)
//         const response = await getAllProducts()
//         setProducts(response.data.filter((p: Product) => p.published))
//       } catch (err) {
//         setError('পণ্য লোড করতে সমস্যা হয়েছে। পরে আবার চেষ্টা করুন।')
//         console.error('পণ্য লোড করতে সমস্যা:', err)
//       } finally {
//         setLoading(false)
//       }
//     }

//     fetchProducts()
//   }, [])

//   const formatPrice = (price: number) => {
//     return new Intl.NumberFormat('bn-BD', {
//       style: 'currency',
//       currency: 'BDT',
//       minimumFractionDigits: 0,
//     })
//       .format(price)
//       .replace('BDT', '৳')
//   }

//   const navigateToProductDetail = (product: Product) => {
//     navigate(`/products/${product.productId}`, {
//       state: { product },
//     })
//   }

//   if (loading) {
//     return (
//       <div className='flex justify-center items-center h-64'>
//         <Loading />
//       </div>
//     )
//   }

//   if (error) {
//     return (
//       <div className='text-center py-12 text-red-500'>
//         {error}
//         <button
//           onClick={() => window.location.reload()}
//           className='mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors'
//         >
//           আবার চেষ্টা করুন
//         </button>
//       </div>
//     )
//   }

//   return (
//     <div className='bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'>
//       <div className='max-w-7xl mx-auto'>
//         <div className='text-center mb-12'>
//           <h2 className='text-3xl font-bold text-gray-900 mb-3'>আমাদের জনপ্রিয় পণ্য সমূহ</h2>
//           <p className='text-lg text-gray-600 max-w-3xl mx-auto'>
//             সেরা মানের পণ্য সংগ্রহ করুন আমাদের কাছ থেকে
//           </p>
//         </div>

//         <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8'>
//           {products.map(product => (
//             <div
//               key={product.productId}
//               className='bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group cursor-pointer border border-gray-100'
//               onClick={() => navigateToProductDetail(product)}
//             >
//               <div className='relative aspect-square overflow-hidden'>
//                 <img
//                   src={product.imageUrl || '/placeholder-product.jpg'}
//                   alt={product.name}
//                   className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-500'
//                   loading='lazy'
//                   onError={e => {
//                     ;(e.target as HTMLImageElement).src = '/placeholder-product.jpg'
//                   }}
//                 />

//                 <div
//                   className={`absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-medium ${
//                     product.stockSize > 0
//                       ? 'bg-green-100 text-green-800'
//                       : 'bg-red-100 text-red-800'
//                   }`}
//                 >
//                   {product.stockSize > 0 ? 'স্টকে আছে' : 'স্টকে নেই'}
//                 </div>
//               </div>

//               <div className='p-4'>
//                 <h3 className='text-lg font-semibold text-gray-800 mb-1 line-clamp-2'>
//                   {product.name}
//                 </h3>
//                 <p className='text-md font-bold text-blue-600 mb-2'>
//                   {formatPrice(product.basePrice)}
//                 </p>
//               </div>
//             </div>
//           ))}
//         </div>

//         {products.length === 0 && !loading && (
//           <div className='text-center py-12'>
//             <p className='text-gray-500'>কোন পণ্য পাওয়া যায়নি</p>
//           </div>
//         )}
//       </div>
//     </div>
//   )
// }
