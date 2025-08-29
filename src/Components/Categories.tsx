import { ChevronLeft, ChevronRight, Download, Heart, MapPin, Package, Ruler, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { fileDownloader } from '../Api/ftp.api'
import { orderApi } from '../Api/order.api'
import { productApi } from '../Api/product.api'
import shopApi, { Product, Shop } from '../Api/shop.api'
import { useCartFavorite } from '../Context/cartContext'
import { FAVORITES_KEY } from '../utils/utils.variables'

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

interface ProductImage {
  imageUrl: string
  imageId: number
}

interface ProductWithImages extends Omit<Product, 'ProductImage'> {
  ProductImage?: ProductImage[]
  price?: number
}

interface ProductCarouselProps {
  products: ProductWithImages[]
  favorites: ProductWithImages[]
  toggleFavorite: (product: ProductWithImages, e: React.MouseEvent) => void
  currentImageIndex: { [key: number]: number }
  setCurrentImageIndex: React.Dispatch<React.SetStateAction<{ [key: number]: number }>>
  handleNavigate: (productId: number) => void
  downloadAllImages: (product: ProductWithImages, e: React.MouseEvent) => void
  formatPrice: (price: number) => string
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

// Carousel component
const ProductCarousel = ({
  products,
  favorites,
  toggleFavorite,
  currentImageIndex,
  setCurrentImageIndex,
  handleNavigate,
  downloadAllImages,
  formatPrice,
}: ProductCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [itemsPerView, setItemsPerView] = useState(5)

  useEffect(() => {
    const handleResize = () => {
      setItemsPerView(
        Math.min(
          5,
          window.innerWidth < 640
            ? 2
            : window.innerWidth < 768
            ? 3
            : window.innerWidth < 1024
            ? 4
            : 5
        )
      )
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.addEventListener('resize', handleResize)
  }, [])

  const next = () => {
    setCurrentIndex(prevIndex => (prevIndex + itemsPerView >= products.length ? 0 : prevIndex + 1))
  }

  const prev = () => {
    setCurrentIndex(prevIndex =>
      prevIndex === 0 ? Math.max(0, products.length - itemsPerView) : prevIndex - 1
    )
  }

  return (
    <div className='relative'>
      <div className='overflow-hidden'>
        <div
          className='flex transition-transform duration-300 ease-in-out'
          style={{ transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)` }}
        >
          {products.map(product => {
            const isFavorite = favorites.some(p => p.productId === product.productId)
            const productImages = product.ProductImage || []
            const currentImgIndex = currentImageIndex[product.productId] || 0
            const totalImages = productImages.length

            return (
              <div
                key={product.productId}
                className='flex-shrink-0 p-1'
                style={{ width: `${100 / itemsPerView}%` }}
              >
                <div
                  onClick={() => handleNavigate(product.productId)}
                  className='bg-white rounded-lg shadow-sm border hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden group mb-1'
                >
                  <div className='relative aspect-[3/4]'>
                    {productImages.length > 0 ? (
                      <img
                        src={productImages[currentImgIndex]?.imageUrl}
                        alt={product.name}
                        className='w-full h-full object-cover transition-transform duration-500'
                      />
                    ) : (
                      <div className='w-full h-full bg-gray-200 flex items-center justify-center'>
                        <Package className='h-6 w-6 text-gray-400' />
                      </div>
                    )}

                    {totalImages > 1 && (
                      <>
                        <button
                          onClick={e => {
                            e.stopPropagation()
                            setCurrentImageIndex(prev => ({
                              ...prev,
                              [product.productId]:
                                ((prev[product.productId] || 0) - 1 + totalImages) % totalImages,
                            }))
                          }}
                          className='absolute left-1 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity'
                        >
                          <ChevronLeft className='h-4 w-4' />
                        </button>
                        <button
                          onClick={e => {
                            e.stopPropagation()
                            setCurrentImageIndex(prev => ({
                              ...prev,
                              [product.productId]:
                                ((prev[product.productId] || 0) + 1) % totalImages,
                            }))
                          }}
                          className='absolute right-1 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity'
                        >
                          <ChevronRight className='h-4 w-4' />
                        </button>
                      </>
                    )}

                    {totalImages > 1 && (
                      <div className='absolute bottom-1 left-1/2 transform -translate-x-1/2 flex space-x-0.5'>
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
                            className={`w-1 h-1 rounded-full transition-colors ${
                              index === currentImgIndex ? 'bg-white' : 'bg-white/50'
                            }`}
                          />
                        ))}
                      </div>
                    )}

                    <div className='absolute top-1 right-1 flex flex-col space-y-0.5'>
                      <button
                        onClick={e => {
                          e.stopPropagation()
                          toggleFavorite(product, e)
                        }}
                        className={`p-1 rounded-full shadow-lg transition-all ${
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
                          className='p-1 bg-white/90 text-gray-700 hover:bg-white rounded-full shadow-lg transition-all'
                          title='Download all images'
                        >
                          <Download className='h-4 w-4' />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className='p-1.5'>
                    <h3 className='font-bold text-gray-900 mb-0.5 text-xs line-clamp-2'>
                      {product.name}
                    </h3>
                    <div className='text-xs font-bold text-gray-900'>
                      {formatPrice(product.basePrice || product.price!)}
                    </div>

                    {product.shop && (
                      <div className='text-xs text-gray-500 mt-0.5'>
                        <div className='flex-1'>
                          <h6 className='text-xs font-[600] text-gray-900'>
                            {product.shop.shopName}
                          </h6>
                          <div className='flex items-center text-gray-600 mt-0.5'>
                            <MapPin className='h-2.5 w-2.5 mr-0.5' />
                            <span className='text-xs'>{product.shop.shopLocation}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {products.length > itemsPerView && (
        <>
          <button
            onClick={prev}
            className='absolute left-0 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-1 shadow-md hover:bg-gray-100 z-10'
            style={{ left: '-0.5rem' }}
          >
            <ChevronLeft className='h-5 w-5' />
          </button>
          <button
            onClick={next}
            className='absolute right-0 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-1 shadow-md hover:bg-gray-100 z-10'
            style={{ right: '-0.5rem' }}
          >
            <ChevronRight className='h-5 w-5' />
          </button>
        </>
      )}
    </div>
  )
}

const Categories = () => {
  const navigate = useNavigate()
  const [shops, setShops] = useState<Shop[]>([])
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [loadingCategories, setLoadingCategories] = useState(false)
  const [topSellingProducts, setTopSellingProducts] = useState<ProductWithImages[]>([])
  const [favorites, setFavorites] = useState<ProductWithImages[]>([])
  const { updateFavoriteCount } = useCartFavorite()
  const [currentImageIndex, setCurrentImageIndex] = useState<{ [key: number]: number }>({})
  const [sizeChartModal, setSizeChartModal] = useState<{
    isOpen: boolean
    sizeChart?: string
  }>({
    isOpen: false,
    sizeChart: undefined,
  })

  // Filter state
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
  const [filteredResults, setFilteredResults] = useState<ProductWithImages[]>([])
  const [filterProductMessage, setFilterProductMessage] = useState<string | null>(null)
  const [latestProducts, setLatestProducts] = useState<ProductWithImages[]>([])
  const [loadingLatestProducts, setLoadingLatestProducts] = useState(false)

  useEffect(() => {
    const loadAndMergeCategories = async () => {
      try {
        setLoadingCategories(true)

        const { success, data, message } = await shopApi.getCategories(null)
        if (success) {
          const allCategories = data || []
          setCategories(allCategories)

          if (selectedShop) {
            const { success: shopSuccess, data: shopCategories } = await shopApi.getShopCategories(
              selectedShop.shopId
            )

            if (shopSuccess) {
              const shopCategoriesId = new Set(
                shopCategories.map((cat: Category) => cat.categoryId)
              )
              const filteredCategories = allCategories
                .map((category: Category) => {
                  const subCategories =
                    category.subCategories?.filter((sub: SubCategory) =>
                      shopCategoriesId.has(sub.categoryId)
                    ) || []

                  return {
                    ...category,
                    subCategories,
                    products: subCategories.reduce(
                      (sum, subCat) => sum + (subCat.products || 0),
                      0
                    ),
                  }
                })
                .filter(
                  (category: Category) =>
                    category?.subCategories && category.subCategories.length > 0
                )
              setCategories(filteredCategories)
            } else {
              console.error('Failed to load shop categories:', message)
            }
          }
        } else {
          console.error('Failed to load categories:', message)
        }
      } catch (error) {
        console.error('Error loading categories:', error)
      } finally {
        setLoadingCategories(false)
      }
    }

    loadAndMergeCategories()
  }, [selectedShop])

  useEffect(() => {
    const loadData = async () => {
      try {
        const shopsResponse = await shopApi.getAllShops()
        setShops(shopsResponse.data.shops || [])

        const { success, data } = await shopApi.getCategories(null)
        if (success) setCategories(data || [])
      } catch (error) {
        console.error('Error loading data:', error)
      }
    }
    loadData()
  }, [])

  useEffect(() => {
    loadTopSellingProducts()
    loadFavorites()
  }, [])

  useEffect(() => {
    const loadLatestProducts = async () => {
      try {
        setLoadingLatestProducts(true)
        const response = await productApi.getLatestProducts()
        setLatestProducts(response.data || [])
      } catch (error) {
        console.error('Error loading latest products:', error)
        setLatestProducts([])
      } finally {
        setLoadingLatestProducts(false)
      }
    }

    loadLatestProducts()
  }, [])

  const handleShopSelect = (shop: Shop) => {
    setSelectedShop(prev => (prev?.shopId === shop.shopId ? null : shop))
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

  const toggleFavorite = (product: ProductWithImages, e: React.MouseEvent) => {
    e.stopPropagation()

    setFavorites(prev => {
      const isFavorite = prev.some(p => p.productId === product.productId)
      const updatedFavorites = isFavorite
        ? prev.filter(p => p.productId !== product.productId)
        : [...prev, product]
      updateFavoriteCount(updatedFavorites.length)
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(updatedFavorites))
      return updatedFavorites
    })
  }

  const formatPrice = (price: number) => {
    return `৳${price.toLocaleString()}`
  }

  const handleNavigate = (productId: number) => {
    navigate(`/products/${productId}`)
  }

  const navigateToProductLists = (categoryId: number, shopId?: number) => {
    navigate('/products', {
      state: {
        categoryId,
        shopId: shopId || null,
      },
    })
  }

  const applyFilters = async () => {
    let categoryId: number | number[] | undefined = undefined
    if (selectedFilterCategory && selectedFilterSubCategory) {
      categoryId = selectedFilterSubCategory
    } else if (selectedFilterCategory) {
      const category = categories.find(cat => cat.categoryId === selectedFilterCategory)
      const subCategories = category?.subCategories?.map(sub => sub.categoryId) || []
      categoryId = subCategories
    }

    const filters = {
      search: searchQuery,
      minPrice,
      maxPrice,
      categoryId,
      shopId: selectedShopId,
      page: 1,
      limit: 5,
    }

    const { success, data, message } = await shopApi.getAllProducts(filters)
    if (success) {
      setFilteredResults(data || [])
      if (data.length === 0) {
        setFilterProductMessage('No products found')
      } else {
        setFilterProductMessage(null)
      }
    } else {
      console.error('Failed to apply filters:', message)
      setFilterProductMessage('Failed to apply filters')
    }
  }

  const resetFilters = () => {
    setMinPrice(undefined)
    setMaxPrice(undefined)
    setSelectedShopId(undefined)
    setSelectedFilterCategory(undefined)
    setSelectedFilterSubCategory(undefined)
    setSearchQuery('')
    setFilteredResults([])
    setFilterProductMessage(null)
  }

  const downloadAllImages = async (product: ProductWithImages, e: React.MouseEvent) => {
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

  const downloadSizeChart = async (sizeChartUrl: string) => {
    if (sizeChartUrl) {
      try {
        await fileDownloader.downloadAllFiles([sizeChartUrl], {
          baseNamePrefix: 'size_chart',
          delayBetweenDownloads: 500,
        })
      } catch (error) {
        console.error('Error downloading size chart:', error)
      }
    }
  }

  const openSizeChart = (sizeChart?: string) => {
    setSizeChartModal({
      isOpen: true,
      sizeChart,
    })
  }

  const closeSizeChart = () => {
    setSizeChartModal({
      isOpen: false,
      sizeChart: undefined,
    })
  }

  const handleSizeChartDownload = () => {
    if (sizeChartModal.sizeChart) {
      downloadSizeChart(sizeChartModal.sizeChart)
    }
  }

  return (
    <div className='min-h-screen bg-gray-50 p-1 sm:p-2' id='categories'>
      <SizeChartModal
        isOpen={sizeChartModal.isOpen}
        onClose={closeSizeChart}
        sizeChart={sizeChartModal.sizeChart}
        onDownload={handleSizeChartDownload}
      />

      <div className='bg-white rounded-lg p-2 mb-1 border border-gray-200 shadow-sm mt-2'>
        <div className='flex justify-between items-center mb-2'>
          <h3 className='text-sm font-semibold text-gray-800'>প্রোডাক্ট ফিল্টার</h3>
          {filteredResults.length > 0 && (
            <button
              onClick={resetFilters}
              className='text-xs text-red-500 flex items-center hover:text-red-700'
            >
              <X className='h-3 w-3 mr-0.5' />
              রিসেট
            </button>
          )}
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
            className='flex-1 bg-blue-500 text-white text-xs font-medium py-1.5 rounded hover:bg-blue-600 transition mr-1'
            onClick={applyFilters}
          >
            🔍 প্রোডাক্ট সার্চ করুন
          </button>
          <button
            className='flex-1 bg-gray-200 text-gray-700 text-xs font-medium py-1.5 rounded hover:bg-gray-300 transition'
            onClick={resetFilters}
          >
            রিসেট
          </button>
        </div>
      </div>

      {filteredResults.length > 0 && (
        <div className='mb-4'>
          <h2 className='text-lg sm:text-xl font-bold text-gray-900 mb-2'>
            ফিল্টার্ড প্রোডাক্টস ({filteredResults.length})
          </h2>
          <ProductCarousel
            products={filteredResults}
            favorites={favorites}
            toggleFavorite={toggleFavorite}
            currentImageIndex={currentImageIndex}
            setCurrentImageIndex={setCurrentImageIndex}
            handleNavigate={handleNavigate}
            downloadAllImages={downloadAllImages}
            formatPrice={formatPrice}
          />
        </div>
      )}

      {filteredResults.length === 0 && filterProductMessage && (
        <div className='text-center text-gray-500 py-2'>{filterProductMessage}</div>
      )}

      {latestProducts.length > 0 && (
        <div className='mb-4'>
          <h2 className='text-lg sm:text-xl font-bold text-gray-900 mb-2'>
            নতুন প্রোডাক্টস ({latestProducts.length})
          </h2>
          {loadingLatestProducts ? (
            <div className='flex justify-center items-center h-32'>
              <div className='animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500'></div>
            </div>
          ) : (
            <ProductCarousel
              products={latestProducts}
              favorites={favorites}
              toggleFavorite={toggleFavorite}
              currentImageIndex={currentImageIndex}
              setCurrentImageIndex={setCurrentImageIndex}
              handleNavigate={handleNavigate}
              downloadAllImages={downloadAllImages}
              formatPrice={formatPrice}
            />
          )}
        </div>
      )}

      {topSellingProducts.length > 0 && (
        <div className='mb-4'>
          <h2 className='text-lg sm:text-xl font-bold text-gray-900 mb-2'>
            টপ সেলিং প্রোডাক্টস ({topSellingProducts.length})
          </h2>
          <ProductCarousel
            products={topSellingProducts}
            favorites={favorites}
            toggleFavorite={toggleFavorite}
            currentImageIndex={currentImageIndex}
            setCurrentImageIndex={setCurrentImageIndex}
            handleNavigate={handleNavigate}
            downloadAllImages={downloadAllImages}
            formatPrice={formatPrice}
          />
        </div>
      )}

      <div className='mb-4'>
        <h2 className='text-md font-bold text-gray-900 mb-1'>শপ সিলেক্ট করুন</h2>
        <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-1'>
          {shops.map(shop => (
            <div
              key={shop.shopId}
              onClick={() => handleShopSelect(shop)}
              className={`p-1 border rounded cursor-pointer transition-colors text-xs ${
                selectedShop?.shopId === shop.shopId
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-white hover:bg-gray-50'
              }`}
            >
              <h3 className='font-medium text-gray-900 truncate'>{shop.shopName}</h3>
              <p className='text-xs text-gray-500 truncate'>{shop.shopLocation}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        {loadingCategories ? (
          <div className='flex justify-center items-center h-32 bg-white rounded'>
            <div className='animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500'></div>
          </div>
        ) : categories.length === 0 ? (
          <div className='text-center py-3 bg-white rounded'>
            <p className='text-gray-500 text-xs'>No categories found</p>
          </div>
        ) : (
          <div className='space-y-2'>
            {categories.map(category => (
              <div key={category.categoryId} className='bg-white rounded shadow-sm p-2'>
                <div className='flex justify-between items-center mb-1'>
                  <div className='flex items-center space-x-1'>
                    <h3 className='font-bold text-gray-900 text-xs'>{category.name}</h3>
                    {category.categoryIcon && (
                      <button
                        onClick={() => downloadSizeChart(category.categoryIcon!)}
                        className='py-1 px-2 bg-blue-100 rounded hover:bg-blue-200 transition-colors flex items-center'
                        title='Download Size Chart'
                      >
                        <Download className='h-3 w-3 mr-0.5 text-blue-600' />
                        <span className='text-[10px] text-blue-600'>সাইজ চার্ট</span>
                      </button>
                    )}
                  </div>
                  <span className='text-xs text-gray-600'>({category.products})</span>
                </div>

                {category?.subCategories && category?.subCategories?.length > 0 ? (
                  <div className='grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-1'>
                    {category.subCategories.map(subCategory => (
                      <div
                        key={subCategory.categoryId}
                        className='border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group relative p-2'
                      >
                        {/* Product count in absolute top right cornermost position without background */}
                        <span className='absolute top-2 right-2 text-[10px] font-bold text-gray-700 transform translate-x-1 -translate-y-1'>
                          {subCategory.products}
                        </span>

                        {subCategory.sizeChart && (
                          <button
                            onClick={e => {
                              e.stopPropagation()
                              openSizeChart(subCategory.sizeChart)
                            }}
                            className='absolute top-0 left-0 m-1 p-0.5 bg-white rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity'
                            title='View Size Chart'
                          >
                            <Ruler className='h-3 w-3 text-gray-600' />
                          </button>
                        )}

                        <div
                          className='flex flex-col items-center mt-3'
                          onClick={() =>
                            navigateToProductLists(subCategory.categoryId, selectedShop?.shopId)
                          }
                        >
                          {subCategory.categoryIcon ? (
                            <div className='w-16 h-16 mb-2 flex items-center justify-center rounded-lg overflow-hidden bg-gray-100'>
                              <img
                                src={subCategory.categoryIcon}
                                alt={subCategory.name}
                                className='w-full h-full object-cover'
                                onError={e => {
                                  ;(e.target as HTMLImageElement).src =
                                    'https://via.placeholder.com/64'
                                }}
                              />
                            </div>
                          ) : (
                            <div className='w-16 h-16 bg-blue-50 rounded-lg flex items-center justify-center mb-2'>
                              <Package className='h-8 w-8 text-blue-400' />
                            </div>
                          )}
                          <h4 className='font-medium text-xs text-gray-900 text-center line-clamp-2 leading-tight'>
                            {subCategory.name}
                          </h4>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className='text-xs text-gray-500 py-1 text-center'>
                    No subcategories available
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Categories
