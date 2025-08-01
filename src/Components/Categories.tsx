import { Package } from 'lucide-react'
import { useEffect, useState } from 'react'
import shopApi, { Shop, ShopCategory } from '../Api/shop.api'

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
  const [shops, setShops] = useState<Shop[]>([])
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [shopCategories, setShopCategories] = useState<ShopCategory[]>([])
  const [loading, setLoading] = useState(false)

  // Filter state
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [selectedFilterCategory, setSelectedFilterCategory] = useState('')
  const [selectedFilterSubCategory, setSelectedFilterSubCategory] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredResults, setFilteredResults] = useState<any[]>([])
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
              data: shopCategoriesResponse,
              data: shopCategories,
            } = await shopApi.getShopCategories(selectedShop.shopId)
            setShopCategories(shopCategories || [])

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

  // Load categories when shop is selected

  const handleShopSelect = (shop: Shop) => {
    setSelectedShop(prev => (prev?.shopId === shop.shopId ? null : shop))
  }

  // Mock filter data
  const mockShops = [
    { id: '', name: 'All Shops' },
    ...shops.map(shop => ({ id: String(shop.shopId), name: shop.shopName })),
  ]

  const mockCategories = [
    { id: '', name: 'All Categories' },
    ...categories.map(cat => ({ id: String(cat.categoryId), name: cat.name })),
  ]

  const mockSubCategories = selectedFilterCategory
    ? [
        { id: '', name: 'All Subcategories' },
        ...(categories
          .find(c => String(c.categoryId) === selectedFilterCategory)
          ?.subCategories.map(sub => ({ id: String(sub.categoryId), name: sub.name })) || []),
      ]
    : [{ id: '', name: 'Select a category first', disabled: true }]

  // Mock search results
  const mockResults = [
    { id: 1, name: 'Product 1', price: 1200, shop: 'Shop A' },
    { id: 2, name: 'Product 2', price: 1500, shop: 'Shop B' },
    { id: 3, name: 'Product 3', price: 1800, shop: 'Shop C' },
  ]

  const applyFilters = () => {
    // In a real app, you would filter actual data here
    // For now, we'll just use the mock results
    setFilteredResults(mockResults)
  }

  if (loading) {
    return (
      <div className='flex justify-center items-center h-64'>
        <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500'></div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-gray-50 p-2 sm:p-4' id='categories'>
      {/* Shop Selection */}
      <div className='mb-6'>
        <h2 className='text-lg font-bold text-gray-900 mb-3'>Select a Shop</h2>
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

                {category.subCategories?.length > 0 ? (
                  <div className='grid grid-cols-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-2'>
                    {category.subCategories.map(subCategory => (
                      <div
                        key={subCategory.categoryId}
                        className='border border-gray-200 rounded hover:bg-gray-50 transition-colors cursor-pointer'
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
      <div className='bg-white rounded-lg p-3 mb-6 border border-gray-200 mt-4'>
        <h3 className='text-sm font-medium text-gray-700 mb-2'>Filter Products</h3>

        {/* Price Range - Perfectly balanced single line */}
        <div className='flex items-center mb-1 w-full'>
          <div className='flex-1 min-w-0'>
            <input
              type='number'
              placeholder='Start Price'
              className='w-full p-1 border-b border-gray-300 text-xs focus:outline-none'
            />
          </div>
          <span className='px-2 text-xs text-gray-500 whitespace-nowrap'>to</span>
          <div className='flex-1 min-w-0'>
            <input
              type='number'
              placeholder='End Price'
              className='w-full p-1 border-b border-gray-300 text-xs focus:outline-none'
            />
          </div>
        </div>

        {/* Other filters */}
        <select className='w-full p-1 border-b border-gray-300 text-xs focus:outline-none mb-1'>
          <option value=''>Select shop</option>
          {mockShops.map(shop => (
            <option key={shop.id} value={shop.id}>
              {shop.name}
            </option>
          ))}
        </select>

        <select className='w-full p-1 border-b border-gray-300 text-xs focus:outline-none mb-1'>
          <option value=''>Select category</option>
          {mockCategories.map(cat => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>

        <select className='w-full p-1 border-b border-gray-300 text-xs focus:outline-none mb-1'>
          <option value=''>Select subcategory</option>
          {mockSubCategories.map(sub => (
            <option key={sub.id} value={sub.id}>
              {sub.name}
            </option>
          ))}
        </select>

        <input
          type='text'
          placeholder='Name,Description...'
          className='w-full p-1 border-b border-gray-300 text-xs focus:outline-none'
        />

        <button className='mt-3 text-xs text-blue-600 hover:text-blue-800 font-medium'>
          Apply Filters →
        </button>
      </div>

      {/* Filter Results */}
      {filteredResults.length > 0 && (
        <div className='mt-6'>
          <h2 className='text-lg font-bold text-gray-900 mb-3'>Filter Results</h2>
          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3'>
            {filteredResults.map(product => (
              <div
                key={product.id}
                className='bg-white rounded-lg shadow-sm p-3 border border-gray-200'
              >
                <h3 className='font-medium text-gray-900'>{product.name}</h3>
                <p className='text-sm text-gray-600'>Price: ৳{product.price.toLocaleString()}</p>
                <p className='text-xs text-gray-500'>Shop: {product.shop}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default Categories
