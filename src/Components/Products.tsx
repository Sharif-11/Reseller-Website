import {
  ChevronLeft,
  ChevronRight,
  Download,
  Heart,
  MapPin,
  Package,
  Search,
  SlidersHorizontal,
  Star,
  X,
} from 'lucide-react'
import { memo, useCallback, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { fileDownloader } from '../Api/ftp.api'
import { productApi } from '../Api/product.api'
import shopApi, { Product } from '../Api/shop.api'
import { useCartFavorite } from '../Context/cartContext'
import { FAVORITES_KEY } from '../utils/utils.variables'

/* ─────────────────────────────────────────────
   Types
───────────────────────────────────────────── */
interface ProductListProps {
  showShopInfo?: boolean
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

/* ─────────────────────────────────────────────
   Skeleton Card
───────────────────────────────────────────── */
const SkeletonCard = () => (
  <div className='overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm'>
    <div className='aspect-[3/4] animate-pulse bg-gray-100' />
    <div className='space-y-2 p-3'>
      <div className='h-3 w-3/4 animate-pulse rounded-full bg-gray-100' />
      <div className='h-3 w-full animate-pulse rounded-full bg-gray-100' />
      <div className='h-3 w-1/2 animate-pulse rounded-full bg-gray-100' />
      <div className='mt-3 h-8 animate-pulse rounded-lg bg-gray-100' />
    </div>
  </div>
)

/* ─────────────────────────────────────────────
   Skeleton Pill
───────────────────────────────────────────── */
const SkeletonPill = () => (
  <div className='h-8 w-20 shrink-0 animate-pulse rounded-full bg-gray-200' />
)

/* ─────────────────────────────────────────────
   Filter Panel (memoized)
───────────────────────────────────────────── */
interface FilterPanelProps {
  minPrice: string
  setMinPrice: (val: string) => void
  maxPrice: string
  setMaxPrice: (val: string) => void
  selectedShopId: number | undefined
  setSelectedShopId: (val: number | undefined) => void
  selectedFilterCategory: number | undefined
  setSelectedFilterCategory: (val: number | undefined) => void
  selectedSubCategories: number[]
  setSelectedSubCategories: (val: number[]) => void
  categories: Category[]
  categoriesLoading: boolean
  shops: any[]
  applyingFilters: boolean
  applyFilters: () => void
  resetFilters: () => void
}

const FilterPanel = memo(
  ({
    minPrice,
    setMinPrice,
    maxPrice,
    setMaxPrice,
    selectedShopId,
    setSelectedShopId,
    selectedFilterCategory,
    setSelectedFilterCategory,
    setSelectedSubCategories,
    categories,
    categoriesLoading,
    shops,
    applyingFilters,
    applyFilters,
    resetFilters,
  }: FilterPanelProps) => (
    <div className='flex flex-col gap-5'>
      {/* Price */}
      <div>
        <p className='mb-2 text-xs font-semibold uppercase tracking-widest text-gray-400'>
          মূল্য পরিসীমা
        </p>
        <div className='flex gap-2'>
          <input
            key='min-price'
            type='text'
            inputMode='numeric'
            placeholder='৳ শুরু'
            value={minPrice}
            onChange={e => setMinPrice(e.target.value.replace(/[^0-9]/g, ''))}
            className='w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-100'
          />
          <input
            key='max-price'
            type='text'
            inputMode='numeric'
            placeholder='৳ শেষ'
            value={maxPrice}
            onChange={e => setMaxPrice(e.target.value.replace(/[^0-9]/g, ''))}
            className='w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-100'
          />
        </div>
      </div>

      {/* Root Category */}
      <div>
        <p className='mb-2 text-xs font-semibold uppercase tracking-widest text-gray-400'>
          ক্যাটাগরি
        </p>
        {categoriesLoading ? (
          <div className='h-10 animate-pulse rounded-lg bg-gray-100' />
        ) : (
          <>
            <select
              value={selectedFilterCategory || ''}
              onChange={e => {
                const val = e.target.value ? Number(e.target.value) : undefined
                setSelectedFilterCategory(val)
                setSelectedSubCategories([]) // reset subcategory selections when root changes
              }}
              className='w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-100'
            >
              <option value=''>সব ক্যাটাগরি</option>
              {categories.map(cat => (
                <option key={cat.categoryId} value={cat.categoryId}>
                  {cat.name}
                  {cat.products > 0 ? ` (${cat.products})` : ''}
                </option>
              ))}
            </select>

            {/* Sub‑category multiselect hint */}
            {selectedFilterCategory &&
              (() => {
                const subs = categories.find(
                  c => c.categoryId === selectedFilterCategory
                )?.subCategories
                return subs && subs.length > 0 ? (
                  <div className='mt-2 text-[11px] text-gray-500'>
                    (একাধিক সাব-ক্যাটাগরি সিলেক্ট করতে নিচের পিলগুলিতে ক্লিক করুন)
                  </div>
                ) : null
              })()}
          </>
        )}
      </div>

      {/* Shop */}
      <div>
        <p className='mb-2 text-xs font-semibold uppercase tracking-widest text-gray-400'>শপ</p>
        <select
          value={selectedShopId || ''}
          onChange={e => setSelectedShopId(e.target.value ? Number(e.target.value) : undefined)}
          className='w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-100'
        >
          <option value=''>সব শপ</option>
          {shops.map(shop => (
            <option key={shop.shopId} value={shop.shopId}>
              {shop.shopName}
            </option>
          ))}
        </select>
      </div>

      {/* Actions */}
      <div className='flex flex-col gap-2 pt-1'>
        <button
          onClick={applyFilters}
          disabled={applyingFilters}
          className='flex w-full items-center justify-center gap-2 rounded-xl bg-rose-500 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-600 disabled:opacity-60'
        >
          <Search className='h-4 w-4' />
          {applyingFilters ? 'সার্চ হচ্ছে...' : 'ফিল্টার প্রয়োগ করুন'}
        </button>
        <button
          onClick={resetFilters}
          className='flex w-full items-center justify-center gap-1.5 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-500 transition hover:bg-gray-50 hover:text-gray-700'
        >
          <X className='h-3.5 w-3.5' />
          রিসেট
        </button>
      </div>
    </div>
  )
)

/* ─────────────────────────────────────────────
   Main Component
───────────────────────────────────────────── */
const ProductList = ({ showShopInfo = true }: ProductListProps) => {
  const location = useLocation()
  const { categoryId, shopId } = location.state || {}
  const navigate = useNavigate()

  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [, setTotalProducts] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  const [favorites, setFavorites] = useState<Product[]>(
    JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]')
  )
  const { loadFavoriteCount } = useCartFavorite()

  const [currentImageIndex, setCurrentImageIndex] = useState<{ [key: number]: number }>({})
  const [autoSlideIntervals] = useState<{ [key: number]: NodeJS.Timeout }>({})

  const [shops, setShops] = useState<any[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [minPrice, setMinPrice] = useState<string>('')
  const [maxPrice, setMaxPrice] = useState<string>('')
  const [selectedShopId, setSelectedShopId] = useState<number | undefined>(undefined)
  const [selectedFilterCategory, setSelectedFilterCategory] = useState<number | undefined>(
    undefined
  )
  const [selectedSubCategories, setSelectedSubCategories] = useState<number[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [applyingFilters, setApplyingFilters] = useState(false)

  const [activeQuickCatId, setActiveQuickCatId] = useState<number | null>(null)
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false)

  const observer = useRef<IntersectionObserver | null>(null)
  const lastProductRef = useRef<HTMLDivElement | null>(null)
  const PRODUCTS_PER_PAGE = 20

  /* Load shops & categories */
  useEffect(() => {
    const loadShopsAndCategories = async () => {
      try {
        setCategoriesLoading(true)
        const shopsResponse = await shopApi.getAllShops()
        setShops(shopsResponse.data.shops || [])
        const { success, data } = await shopApi.getCategories(null)
        if (success) {
          const rootCategories: Category[] = (data || []).filter(
            (cat: Category) => cat.parentId === null
          )
          setCategories(rootCategories)
        }
      } catch (err) {
        console.error('Error loading shops/categories:', err)
      } finally {
        setCategoriesLoading(false)
      }
    }
    loadShopsAndCategories()
  }, [])

  /* Core product loading function */
  const loadProducts = useCallback(
    async (page: number = 1, isLoadMore = false, overrideCategoryId?: number | null) => {
      try {
        isLoadMore ? setLoadingMore(true) : setLoading(true)

        // Determine category filter
        let categoryIdFilter: number | number[] | undefined = undefined

        if (overrideCategoryId !== undefined && overrideCategoryId !== null) {
          // If a specific category (or sub‑category) is passed, use it directly
          categoryIdFilter = overrideCategoryId
        } else if (selectedSubCategories.length > 0) {
          // User selected specific sub‑categories → send array
          categoryIdFilter = selectedSubCategories
        } else if (selectedFilterCategory) {
          // Root category selected, but no sub‑categories chosen → send all sub‑category IDs
          const cat = categories.find(c => c.categoryId === selectedFilterCategory)
          const subIds = cat?.subCategories?.map(s => s.categoryId)
          categoryIdFilter = subIds && subIds.length > 0 ? subIds : selectedFilterCategory
        } else if (categoryId) {
          categoryIdFilter = parseInt(categoryId)
        }

        const params = {
          shopId: selectedShopId || (shopId ? parseInt(shopId) : undefined),
          categoryId: categoryIdFilter,
          search: searchQuery || undefined,
          minPrice: minPrice !== '' ? Number(minPrice) : undefined,
          maxPrice: maxPrice !== '' ? Number(maxPrice) : undefined,
          page,
          limit: PRODUCTS_PER_PAGE,
        }

        const { success, data, totalCount } = await productApi.getAllProducts(params)

        if (success) {
          if (isLoadMore) {
            setProducts(prev => [...prev, ...(data || [])])
          } else {
            setProducts(data || [])
            const initial: { [key: number]: number } = {}
            data.forEach((p: Product) => {
              initial[p.productId] = 0
            })
            setCurrentImageIndex(initial)
          }
          setTotalProducts(totalCount || 0)
          setHasMore((data || []).length === PRODUCTS_PER_PAGE)
        }
      } catch (err) {
        console.error('Error loading products:', err)
        if (!isLoadMore) setProducts([])
        setTotalProducts(0)
        setHasMore(false)
      } finally {
        setLoading(false)
        setLoadingMore(false)
        setApplyingFilters(false)
      }
    },
    [
      selectedFilterCategory,
      selectedSubCategories,
      categories,
      categoryId,
      selectedShopId,
      shopId,
      searchQuery,
      minPrice,
      maxPrice,
    ]
  )

  /* Initial load & when route state changes */
  useEffect(() => {
    setCurrentPage(1)
    loadProducts(1, false)
    return () => {
      Object.values(autoSlideIntervals).forEach(clearInterval)
    }
  }, [shopId, categoryId, loadProducts])

  /* Save favorites to localStorage */
  useEffect(() => {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites))
    loadFavoriteCount()
  }, [favorites, loadFavoriteCount])

  /* Infinite scroll */
  const lastProductElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loadingMore) return
      if (observer.current) observer.current.disconnect()
      observer.current = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting && hasMore) {
          const next = currentPage + 1
          setCurrentPage(next)
          loadProducts(next, true)
        }
      })
      if (node) observer.current.observe(node)
      lastProductRef.current = node
    },
    [loadingMore, hasMore, currentPage, loadProducts]
  )

  /* Image helpers */
  const nextImage = (productId: number, total: number, e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrentImageIndex(prev => ({ ...prev, [productId]: ((prev[productId] || 0) + 1) % total }))
    if (autoSlideIntervals[productId]) clearInterval(autoSlideIntervals[productId])
  }

  const prevImage = (productId: number, total: number, e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrentImageIndex(prev => ({
      ...prev,
      [productId]: ((prev[productId] || 0) - 1 + total) % total,
    }))
    if (autoSlideIntervals[productId]) clearInterval(autoSlideIntervals[productId])
  }

  const toggleFavorite = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation()
    setFavorites(prev =>
      prev.some(p => p.productId === product.productId)
        ? prev.filter(p => p.productId !== product.productId)
        : [...prev, product]
    )
  }

  const downloadAllImages = async (product: Product, e: React.MouseEvent) => {
    e.stopPropagation()
    const urls = product.ProductImage?.map(img => img.imageUrl) || []
    if (urls.length > 0) {
      try {
        await fileDownloader.downloadAllFiles(urls, {
          baseNamePrefix: `product_${product.name.replace(/\s+/g, '_')}`,
          delayBetweenDownloads: 500,
        })
      } catch (err) {
        console.error('Error downloading images:', err)
      }
    }
  }

  const formatPrice = (price: number) => `৳${price.toLocaleString()}`
  const handleNavigate = (productId: number) => navigate(`/products/${productId}`)

  const applyFilters = useCallback(() => {
    setCurrentPage(1)
    setApplyingFilters(true)
    loadProducts(1, false)
  }, [loadProducts])

  const resetFilters = useCallback(() => {
    setMinPrice('')
    setMaxPrice('')
    setSelectedShopId(undefined)
    setSelectedFilterCategory(undefined)
    setSelectedSubCategories([])
    setSearchQuery('')
    setActiveQuickCatId(null)
    setCurrentPage(1)
    setHasMore(true)
    loadProducts(1, false, null)
  }, [loadProducts])

  const handleQuickCatClick = useCallback(
    (catId: number | null) => {
      setActiveQuickCatId(catId)
      setSelectedFilterCategory(catId ?? undefined)
      setSelectedSubCategories([]) // clear subcategory selections
      setCurrentPage(1)
      setHasMore(true)
      loadProducts(1, false, catId)
    },
    [loadProducts]
  )

  /* Toggle sub‑category selection (multi‑select) */
  const toggleSubCategory = useCallback(
    (subCatId: number, parentCatId: number) => {
      setSelectedSubCategories(prev => {
        if (prev.includes(subCatId)) {
          return prev.filter(id => id !== subCatId)
        } else {
          return [...prev, subCatId]
        }
      })
      // Also ensure the parent category is active
      setActiveQuickCatId(parentCatId)
      setSelectedFilterCategory(parentCatId)
      setCurrentPage(1)
      setHasMore(true)
      // We'll let the effect or next render trigger load, but we call loadProducts directly with updated selection?
      // Since we are inside a state update, we need to call loadProducts after the state is updated.
      // Use setTimeout or useEffect. For simplicity, we'll call loadProducts after a microtask.
      setTimeout(() => {
        loadProducts(1, false, undefined)
      }, 0)
    },
    [loadProducts]
  )

  return (
    <div className='min-h-screen bg-[#f7f6f3]' id='products'>
      {/* Search Bar */}
      <div className='border-b border-gray-100 bg-white px-4 py-3 shadow-sm'>
        <div className='mx-auto flex max-w-screen-xl gap-2'>
          <div className='flex flex-1 items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-4 py-2 transition focus-within:border-rose-300 focus-within:ring-2 focus-within:ring-rose-100'>
            <Search className='h-4 w-4 shrink-0 text-gray-400' />
            <input
              type='text'
              placeholder='পণ্যের নাম দিয়ে সার্চ করুন...'
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && applyFilters()}
              className='w-full bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400'
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className='text-gray-400 hover:text-gray-600'
              >
                <X className='h-3.5 w-3.5' />
              </button>
            )}
          </div>
          <button
            onClick={applyFilters}
            className='shrink-0 rounded-full bg-rose-500 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-600 active:scale-95'
          >
            সার্চ
          </button>
        </div>
      </div>

      {/* Category Pills */}
      <div className='border-b border-gray-100 bg-white'>
        <div className='no-scrollbar flex gap-2 overflow-x-auto px-4 py-2.5'>
          <button
            onClick={() => handleQuickCatClick(null)}
            className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all ${
              activeQuickCatId === null
                ? 'border-[#1a1a2e] bg-[#1a1a2e] text-white shadow-md'
                : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300 hover:bg-gray-100'
            }`}
          >
            <span className='text-[13px]'>✦</span>
            সব
          </button>
          {categoriesLoading
            ? Array.from({ length: 5 }).map((_, i) => <SkeletonPill key={i} />)
            : categories.map(cat => (
                <button
                  key={cat.categoryId}
                  onClick={() => handleQuickCatClick(cat.categoryId)}
                  className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all ${
                    activeQuickCatId === cat.categoryId
                      ? 'border-[#1a1a2e] bg-[#1a1a2e] text-white shadow-md'
                      : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  {cat.name}
                  {cat.products > 0 && (
                    <span
                      className={`rounded-full px-1.5 py-0.5 text-[9px] font-semibold ${
                        activeQuickCatId === cat.categoryId
                          ? 'bg-white/20 text-white'
                          : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      {cat.products}
                    </span>
                  )}
                </button>
              ))}
        </div>

        {/* Sub‑category pills (multi‑select) */}
        {activeQuickCatId !== null &&
          (() => {
            const subs = categories.find(c => c.categoryId === activeQuickCatId)?.subCategories
            return subs && subs.length > 0 ? (
              <div className='no-scrollbar flex flex-wrap gap-2 overflow-x-auto border-t border-gray-100 px-4 py-2'>
                <button
                  onClick={() => {
                    setSelectedSubCategories([])
                    loadProducts(1, false, activeQuickCatId)
                  }}
                  className={`flex shrink-0 items-center gap-1 rounded-full border px-3 py-1 text-[11px] font-medium transition-all ${
                    selectedSubCategories.length === 0
                      ? 'border-rose-400 bg-rose-50 text-rose-600'
                      : 'border-gray-200 bg-gray-50 text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  সব
                </button>
                {subs.map(sub => (
                  <button
                    key={sub.categoryId}
                    onClick={() => toggleSubCategory(sub.categoryId, activeQuickCatId)}
                    className={`flex shrink-0 items-center gap-1 rounded-full border px-3 py-1 text-[11px] font-medium transition-all ${
                      selectedSubCategories.includes(sub.categoryId)
                        ? 'border-rose-400 bg-rose-50 text-rose-600'
                        : 'border-gray-200 bg-gray-50 text-gray-500 hover:bg-gray-100'
                    }`}
                  >
                    {sub.name}
                    {sub.products > 0 && (
                      <span className='ml-0.5 text-[9px] text-gray-400'>({sub.products})</span>
                    )}
                  </button>
                ))}
              </div>
            ) : null
          })()}
      </div>

      {/* Main Layout */}
      <div className='mx-auto flex max-w-screen-xl'>
        {/* Desktop Filter Sidebar */}
        <aside className='hidden w-64 shrink-0 border-r border-gray-100 bg-white p-5 lg:block'>
          <div className='mb-5 flex items-center justify-between border-b border-gray-100 pb-4'>
            <div className='flex items-center gap-2'>
              <SlidersHorizontal className='h-4 w-4 text-rose-500' />
              <span className='font-semibold text-gray-800'>ফিল্টার</span>
            </div>
            <button
              onClick={resetFilters}
              className='flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600'
            >
              <X className='h-3 w-3' />
              রিসেট
            </button>
          </div>
          <FilterPanel
            minPrice={minPrice}
            setMinPrice={setMinPrice}
            maxPrice={maxPrice}
            setMaxPrice={setMaxPrice}
            selectedShopId={selectedShopId}
            setSelectedShopId={setSelectedShopId}
            selectedFilterCategory={selectedFilterCategory}
            setSelectedFilterCategory={setSelectedFilterCategory}
            selectedSubCategories={selectedSubCategories}
            setSelectedSubCategories={setSelectedSubCategories}
            categories={categories}
            categoriesLoading={categoriesLoading}
            shops={shops}
            applyingFilters={applyingFilters}
            applyFilters={applyFilters}
            resetFilters={resetFilters}
          />
        </aside>

        {/* Product Area */}
        <main className='flex-1 p-3 sm:p-4'>
          {/* Results bar */}
          <div className='mb-3 flex flex-wrap items-center justify-between gap-2'>
            <div className='flex items-center gap-2'>
              <button
                onClick={() => setMobileFilterOpen(true)}
                className='flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3.5 py-1.5 text-xs font-medium text-gray-600 shadow-sm transition hover:bg-gray-50 lg:hidden'
              >
                <SlidersHorizontal className='h-3.5 w-3.5' />
                ফিল্টার
              </button>
              {activeQuickCatId !== null && (
                <span className='flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-1 text-[11px] font-medium text-rose-600'>
                  {categories.find(c => c.categoryId === activeQuickCatId)?.name}
                  <button
                    onClick={() => handleQuickCatClick(null)}
                    className='ml-0.5 text-rose-400 hover:text-rose-600'
                  >
                    <X className='h-3 w-3' />
                  </button>
                </span>
              )}
              <span className='text-xs text-gray-500'>
                <span className='font-semibold text-gray-800'>{products.length}টি</span> পণ্য পাওয়া
                গেছে
              </span>
            </div>
            <select className='rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-600 outline-none focus:border-rose-300'>
              <option>নতুন আগে</option>
              <option>কম দাম আগে</option>
              <option>বেশি দাম আগে</option>
            </select>
          </div>

          {loading && currentPage === 1 ? (
            <div className='grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4'>
              {Array.from({ length: 8 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className='flex flex-col items-center justify-center rounded-2xl border border-gray-100 bg-white py-16 text-center'>
              <Package className='mb-4 h-14 w-14 text-gray-200' />
              <h3 className='mb-1 text-lg font-semibold text-gray-700'>কোন পণ্য পাওয়া যায়নি</h3>
              <p className='mb-5 text-sm text-gray-400'>ফিল্টার পরিবর্তন করে আবার চেষ্টা করুন</p>
              <button
                onClick={resetFilters}
                className='rounded-xl bg-rose-500 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-600'
              >
                ফিল্টার ক্লিয়ার করুন
              </button>
            </div>
          ) : (
            <>
              <div className='grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4'>
                {products.map((product, index) => {
                  const isFavorite = favorites.some(p => p.productId === product.productId)
                  const productImages = product.ProductImage || []
                  const currentIndex = currentImageIndex[product.productId] || 0
                  const totalImages = productImages.length
                  const isLast = index === products.length - 1

                  return (
                    <div
                      key={product.productId}
                      ref={isLast ? lastProductElementRef : null}
                      onClick={() => handleNavigate(product.productId)}
                      className='group relative cursor-pointer overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl'
                    >
                      <div className='relative aspect-[3/4] overflow-hidden bg-gray-50'>
                        {productImages.length > 0 ? (
                          <img
                            src={productImages[currentIndex]?.imageUrl}
                            alt={product.name}
                            className='h-full w-full object-cover transition-transform duration-500 group-hover:scale-105'
                          />
                        ) : (
                          <div className='flex h-full w-full items-center justify-center'>
                            <Package className='h-8 w-8 text-gray-300' />
                          </div>
                        )}
                        {totalImages > 1 && (
                          <>
                            <button
                              onClick={e => prevImage(product.productId, totalImages, e)}
                              className='absolute left-1.5 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 shadow-md opacity-0 transition group-hover:opacity-100 hover:bg-white'
                            >
                              <ChevronLeft className='h-4 w-4 text-gray-700' />
                            </button>
                            <button
                              onClick={e => nextImage(product.productId, totalImages, e)}
                              className='absolute right-1.5 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 shadow-md opacity-0 transition group-hover:opacity-100 hover:bg-white'
                            >
                              <ChevronRight className='h-4 w-4 text-gray-700' />
                            </button>
                          </>
                        )}
                        {totalImages > 1 && (
                          <div className='absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1'>
                            {productImages.map((_, i) => (
                              <button
                                key={i}
                                onClick={e => {
                                  e.stopPropagation()
                                  setCurrentImageIndex(prev => ({
                                    ...prev,
                                    [product.productId]: i,
                                  }))
                                }}
                                className={`h-1.5 rounded-full transition-all ${i === currentIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/50'}`}
                              />
                            ))}
                          </div>
                        )}
                        <div className='absolute right-2 top-2 flex flex-col gap-1.5 opacity-0 transition-opacity group-hover:opacity-100'>
                          <button
                            onClick={e => toggleFavorite(product, e)}
                            className={`flex h-8 w-8 items-center justify-center rounded-full shadow-md transition-all ${isFavorite ? 'bg-rose-500 text-white' : 'bg-white/95 text-gray-400 hover:text-rose-500'}`}
                          >
                            <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
                          </button>
                          {productImages.length > 0 && (
                            <button
                              onClick={e => downloadAllImages(product, e)}
                              className='flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-gray-400 shadow-md transition hover:text-[#1a1a2e]'
                              title='সব ছবি ডাউনলোড করুন'
                            >
                              <Download className='h-4 w-4' />
                            </button>
                          )}
                        </div>
                      </div>
                      <div className='p-2.5'>
                        {showShopInfo && product.shop && (
                          <div className='mb-1 flex items-center gap-1.5'>
                            <span className='h-1.5 w-1.5 rounded-full bg-rose-400' />
                            <span className='truncate text-[10px] font-medium text-gray-400'>
                              {product.shop.shopName}
                            </span>
                          </div>
                        )}
                        <h3 className='mb-1.5 line-clamp-2 text-[13px] font-medium leading-snug text-gray-800'>
                          {product.name}
                        </h3>
                        <div className='mb-1.5 flex items-end justify-between'>
                          <div>
                            <p className='text-[15px] font-bold text-gray-900'>
                              {formatPrice((product.basePrice || product.price)!)}
                            </p>
                          </div>
                          <div className='flex items-center gap-0.5'>
                            <Star className='h-3 w-3 fill-amber-400 text-amber-400' />
                            <span className='text-[10px] text-gray-500'>4.8</span>
                          </div>
                        </div>
                        {showShopInfo && product.shop?.shopLocation && (
                          <div className='mb-2 flex items-center gap-1 text-[10px] text-gray-400'>
                            <MapPin className='h-2.5 w-2.5 shrink-0' />
                            <span className='truncate'>{product.shop.shopLocation}</span>
                          </div>
                        )}
                        <button
                          onClick={e => {
                            e.stopPropagation()
                            handleNavigate(product.productId)
                          }}
                          className='w-full rounded-xl bg-[#1a1a2e] py-2 text-[12px] font-semibold text-white transition hover:bg-rose-500 active:scale-[0.98]'
                        >
                          অর্ডার করুন
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
              {loadingMore && (
                <div className='mt-6 flex justify-center'>
                  <div className='h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-rose-500' />
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Mobile Filter Drawer */}
      {mobileFilterOpen && (
        <>
          <div
            className='fixed inset-0 z-50 bg-black/40 backdrop-blur-sm'
            onClick={() => setMobileFilterOpen(false)}
          />
          <div className='fixed bottom-0 left-0 right-0 z-50 max-h-[85vh] overflow-y-auto rounded-t-3xl bg-white px-5 py-5 shadow-2xl'>
            <div className='mb-5 flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <SlidersHorizontal className='h-4 w-4 text-rose-500' />
                <span className='font-semibold text-gray-800'>ফিল্টার</span>
              </div>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className='flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500'
              >
                <X className='h-4 w-4' />
              </button>
            </div>
            <FilterPanel
              minPrice={minPrice}
              setMinPrice={setMinPrice}
              maxPrice={maxPrice}
              setMaxPrice={setMaxPrice}
              selectedShopId={selectedShopId}
              setSelectedShopId={setSelectedShopId}
              selectedFilterCategory={selectedFilterCategory}
              setSelectedFilterCategory={setSelectedFilterCategory}
              selectedSubCategories={selectedSubCategories}
              setSelectedSubCategories={setSelectedSubCategories}
              categories={categories}
              categoriesLoading={categoriesLoading}
              shops={shops}
              applyingFilters={applyingFilters}
              applyFilters={applyFilters}
              resetFilters={resetFilters}
            />
            <div className='pb-safe h-4' />
          </div>
        </>
      )}
    </div>
  )
}

export default ProductList
