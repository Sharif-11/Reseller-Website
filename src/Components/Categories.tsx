import { Download, Heart, MapPin, Package } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { fileDownloader } from '../Api/ftp.api'
import { orderApi } from '../Api/order.api'
import shopApi, { Product, Shop } from '../Api/shop.api'
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
}

const Categories = () => {
  const navigate = useNavigate()
  const [shops, setShops] = useState<Shop[]>([])
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [topSellingProducts, setTopSellingProducts] = useState<Product[]>([])
  const [favorites, setFavorites] = useState<Product[]>([])

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
  const [filteredResults, setFilteredResults] = useState<Product[]>([])
  const [filterProductMessage, setFilterProductMessage] = useState<string | null>(null)

  useEffect(() => {
    const loadAndMergeCategories = async () => {
      try {
        setLoading(true)

        const { success, data, message } = await shopApi.getCategories(null)
        if (success) {
          const allCategories = data || []
          setCategories(allCategories)

          // If a shop is selected, fetch its categories
          if (selectedShop) {
            const {
              success: shopSuccess,

              data: shopCategories,
            } = await shopApi.getShopCategories(selectedShop.shopId)
            // setShopCategories(shopCategories || [])

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
        setLoading(false)
      }
    }

    loadAndMergeCategories()
  }, [selectedShop])
  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const shopsResponse = await shopApi.getAllShops()
        setShops(shopsResponse.data.shops || [])

        const { success, data } = await shopApi.getCategories(null)
        if (success) setCategories(data || [])
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])
  useEffect(() => {
    loadTopSellingProducts()
    loadFavorites()
  }, [])

  // Load categories when shop is selected

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
    } else {
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
    console.log('Filters applied:', filters)

    const { success, data, message } = await shopApi.getAllProducts(filters)
    if (success) {
      setFilteredResults(data || [])
      if (data.length === 0) {
        setFilterProductMessage('No products found')
      } else {
        setFilterProductMessage(null)
      }
      console.log('Filters applied successfully:', data)
      // Handle successful response
    } else {
      console.error('Failed to apply filters:', message)
      setFilterProductMessage('Failed to apply filters')
    }
  }

  if (loading) {
    return (
      <div className='flex justify-center items-center h-64'>
        <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500'></div>
      </div>
    )
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

  return (
    <div className='min-h-screen bg-gray-50 p-2 sm:p-4' id='categories'>
      {/* Shop Selection */}
      <div className='mb-6'>
        <h2 className='text-lg font-bold text-gray-900 mb-3'>শপ সিলেক্ট করুন</h2>
        <div
          className={`grid ${
            shops.length === 1 ? 'grid-cols-1' : 'grid-cols-2'
          } gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5`}
        >
          {shops.map(shop => (
            <div
              key={shop.shopId}
              onClick={() => handleShopSelect(shop)}
              className={`p-2 border rounded-md cursor-pointer transition-colors text-sm ${
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

      {/* Filter Section */}

      {/* Categories with Subcategories */}
      <div>
        {categories.length === 0 ? (
          <div className='text-center py-6 bg-white rounded-lg'>
            <p className='text-gray-500 text-sm'>No categories found</p>
          </div>
        ) : (
          <div className='space-y-4'>
            {categories.map(category => (
              <div key={category.categoryId} className='bg-white rounded-lg shadow-sm p-3'>
                <div className='flex justify-between items-center mb-2 pb-1 border-b'>
                  <h3 className='font-bold text-gray-900 text-sm'>{category.name}</h3>
                  <span className='text-xs text-gray-600'>({category.products})</span>
                </div>

                {category?.subCategories && category?.subCategories?.length > 0 ? (
                  <div className='grid grid-cols-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-2'>
                    {category.subCategories.map(subCategory => (
                      <div
                        key={subCategory.categoryId}
                        className='border border-gray-200 rounded hover:bg-gray-50 transition-colors cursor-pointer'
                        onClick={() =>
                          navigateToProductLists(subCategory.categoryId, selectedShop?.shopId)
                        }
                      >
                        <div className='flex flex-col items-center p-1'>
                          {subCategory.categoryIcon ? (
                            <div className='w-full p-1'>
                              <img
                                src={subCategory.categoryIcon}
                                alt={subCategory.name}
                                className='w-full h-auto object-contain mb-1'
                                onError={e => {
                                  ;(e.target as HTMLImageElement).src =
                                    'https://via.placeholder.com/40'
                                }}
                              />
                            </div>
                          ) : (
                            <div className='w-full p-3 bg-blue-50 rounded flex items-center justify-center mb-1'>
                              <Package className='h-8 w-8 text-blue-400' />
                            </div>
                          )}
                          <h4 className='font-medium text-xs text-gray-900 text-center truncate w-full px-1'>
                            {subCategory.name}
                          </h4>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className='text-xs text-gray-500 py-1'>No subcategories available</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      <div className='bg-white rounded-lg p-4 mb-6 border border-gray-200 shadow-sm mt-4'>
        <h3 className='text-sm font-semibold text-gray-800 mb-3'>প্রোডাক্ট ফিল্টার</h3>

        {/* Price Range */}
        <div className='flex items-center mb-3 w-full'>
          <div className='flex-1 min-w-0'>
            <input
              type='number'
              placeholder='শুরু মূল্য'
              value={minPrice || ''}
              onChange={e =>
                setMinPrice(e.target.value === '' ? undefined : Number(e.target.value))
              }
              className='w-full p-2 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-blue-400'
            />
          </div>
          <span className='px-2 text-xs text-gray-600 whitespace-nowrap'>থেকে</span>
          <div className='flex-1 min-w-0'>
            <input
              type='number'
              placeholder='শেষ মূল্য'
              value={maxPrice || ''}
              onChange={e =>
                setMaxPrice(e.target.value === '' ? undefined : Number(e.target.value))
              }
              className='w-full p-2 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-blue-400'
            />
          </div>
        </div>

        {/* Shop Select */}
        <select
          className='w-full p-2 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-blue-400 mb-2'
          onChange={e =>
            setSelectedShopId(e.target.value === '' ? undefined : Number(e.target.value))
          }
        >
          <option value=''>শপ সিলেক্ট করুন</option>
          {shops.map(shop => (
            <option key={shop.shopId} value={shop.shopId}>
              {shop.shopName}
            </option>
          ))}
        </select>

        {/* Category Select */}
        <select
          className='w-full p-2 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-blue-400 mb-2'
          onChange={e =>
            setSelectedFilterCategory(
              categories.find(cat => cat.categoryId === Number(e.target.value))?.categoryId ||
                undefined
            )
          }
        >
          <option value=''>ক্যাটাগরি সিলেক্ট করুন</option>
          {categories.map(cat => (
            <option key={cat.categoryId} value={cat.categoryId}>
              {cat.name}
            </option>
          ))}
        </select>

        {/* Subcategory Select */}
        <select
          className='w-full p-2 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-blue-400 mb-2'
          onChange={e =>
            setSelectedFilterSubCategory(
              categories
                .find(cat => cat.categoryId === selectedFilterCategory)
                ?.subCategories?.find(sub => sub.categoryId === Number(e.target.value))
                ?.categoryId || undefined
            )
          }
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

        {/* Search by name/description */}
        <input
          type='text'
          placeholder='নাম বা বর্ণনা লিখুন...'
          className='w-full p-2 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-blue-400 mb-3'
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />

        {/* Action Buttons */}
        <div className='flex justify-between items-center'>
          <button
            className='flex-1 bg-blue-500 text-white text-xs font-medium py-2 rounded-md hover:bg-blue-600 transition mr-2'
            onClick={applyFilters}
          >
            🔍 প্রোডাক্ট সার্চ করুন
          </button>
        </div>
      </div>

      {/* Filter Results */}
      <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4'>
        {filteredResults.map(product => {
          const isFavorite = favorites.some(p => p.productId === product.productId)
          const productImages = product.ProductImage || []
          // const currentIndex = currentImageIndex[product.productId] || 0
          const currentIndex = 0
          // const totalImages = productImages.length

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
                {/* {totalImages > 1 && (
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
                    )} */}

                {/* Image Indicators */}
                {/* {totalImages > 1 && (
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
                )} */}

                {/* Action Buttons */}
                <div className='absolute top-2 right-2 flex flex-col space-y-2'>
                  <button
                    onClick={() => toggleFavorite(product)}
                    className={`p-1.5 rounded-full shadow-lg transition-all ${
                      isFavorite
                        ? 'bg-red-500 text-white'
                        : 'bg-white/90 text-gray-700 hover:bg-white'
                    }`}
                  >
                    <Heart className={`h-3.5 w-3.5 ${isFavorite ? 'fill-current' : ''}`} />
                  </button>

                  {productImages.length > 1 && (
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

                {product.shop && (
                  <div className='text-xs text-gray-500 mt-1'>
                    <div className='flex-1'>
                      <h6 className='text-md font-[600] text-gray-900'>{product.shop.shopName}</h6>
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
      {filteredResults.length === 0 && (
        <div className='text-center text-gray-500 py-4'>{filterProductMessage}</div>
      )}
      {/* Top Selling Products */}
      {topSellingProducts.length > 0 && (
        <div className='mt-12'>
          <h2 className='text-xl sm:text-2xl font-bold text-gray-900 mb-6'>টপ সেলিং প্রোডাক্টস</h2>
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
                          <span className='text-xs sm:text-sm'>{product.shop.shopLocation}</span>
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
  )
}

export default Categories
