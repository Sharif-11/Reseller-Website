// Categories.tsx — BazaarHub design system
// Tokens: navy #1a1a2e · rose #e94560 · cream #f7f6f3
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Heart,
  MapPin,
  Package,
  Ruler,
  Search,
  SlidersHorizontal,
  Star,
  TrendingUp,
  X,
  Zap,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { fileDownloader } from '../Api/ftp.api'
import { orderApi } from '../Api/order.api'
import { productApi } from '../Api/product.api'
import shopApi, { Product, Shop } from '../Api/shop.api'
import { useCartFavorite } from '../Context/cartContext'
import { FAVORITES_KEY } from '../utils/utils.variables'

/* ─── Types ─── */
interface Category {
  categoryId: number
  name: string
  categoryIcon: string | null
  description: string
  parentId: number | null
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

/* ─── Size Chart Modal ─── */
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
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-[#1a1a2e]/80 p-4 backdrop-blur-sm'>
      <div className='relative w-full max-w-xl overflow-hidden rounded-2xl border border-white/10 bg-white shadow-2xl'>
        <div className='flex items-center justify-between border-b border-gray-100 px-5 py-4'>
          <div className='flex items-center gap-2'>
            <div className='flex h-7 w-7 items-center justify-center rounded-lg bg-[#e94560]/10'>
              <Ruler className='h-3.5 w-3.5 text-[#e94560]' />
            </div>
            <h3 className='text-[14px] font-semibold text-[#1a1a2e]'>সাইজ চার্ট</h3>
          </div>
          <div className='flex items-center gap-2'>
            <button
              onClick={onDownload}
              className='flex items-center gap-1.5 rounded-lg bg-[#e94560] px-3 py-1.5 text-[12px] font-medium text-white transition hover:bg-[#c73652]'
            >
              <Download className='h-3 w-3' />
              ডাউনলোড
            </button>
            <button
              onClick={onClose}
              className='flex h-8 w-8 items-center justify-center rounded-lg border border-gray-100 text-gray-400 transition hover:bg-gray-50 hover:text-gray-600'
            >
              <X className='h-4 w-4' />
            </button>
          </div>
        </div>
        <div className='max-h-[72vh] overflow-y-auto p-4'>
          {sizeChart ? (
            <img
              src={sizeChart}
              alt='Size Chart'
              className='h-auto w-full rounded-xl object-contain'
              onError={e => {
                ;(e.target as HTMLImageElement).src =
                  'https://via.placeholder.com/400x600?text=Not+Available'
              }}
            />
          ) : (
            <div className='flex flex-col items-center justify-center py-12'>
              <Ruler className='mb-3 h-10 w-10 text-gray-200' />
              <p className='text-[13px] text-gray-400'>সাইজ চার্ট পাওয়া যায়নি</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ─── Skeleton Card ─── */
const SkeletonCard = () => (
  <div className='overflow-hidden rounded-2xl border border-gray-100 bg-white'>
    <div className='aspect-[3/4] animate-pulse bg-gray-100' />
    <div className='space-y-2 p-3'>
      <div className='h-3 w-3/4 animate-pulse rounded-full bg-gray-100' />
      <div className='h-3 w-1/2 animate-pulse rounded-full bg-gray-100' />
      <div className='mt-2 h-7 animate-pulse rounded-lg bg-gray-100' />
    </div>
  </div>
)

/* ─── Product Card ─── */
const ProductCard = ({
  product,
  isFavorite,
  imgIndex,
  onNavigate,
  onToggleFavorite,
  onDownload,
  onSetImgIndex,
  formatPrice,
}: {
  product: ProductWithImages
  isFavorite: boolean
  imgIndex: number
  onNavigate: () => void
  onToggleFavorite: (e: React.MouseEvent) => void
  onDownload: (e: React.MouseEvent) => void
  onSetImgIndex: (i: number) => void
  formatPrice: (p: number) => string
}) => {
  const imgs = product.ProductImage || []
  const total = imgs.length

  return (
    <div
      onClick={onNavigate}
      className='group relative cursor-pointer overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(26,26,46,0.12)]'
    >
      {/* Image */}
      <div className='relative aspect-[3/4] overflow-hidden bg-gray-50'>
        {imgs.length > 0 ? (
          <img
            src={imgs[imgIndex]?.imageUrl}
            alt={product.name}
            className='h-full w-full object-cover transition-transform duration-500 group-hover:scale-105'
          />
        ) : (
          <div className='flex h-full w-full items-center justify-center'>
            <Package className='h-8 w-8 text-gray-200' />
          </div>
        )}

        {/* Prev/Next */}
        {total > 1 && (
          <>
            <button
              onClick={e => {
                e.stopPropagation()
                onSetImgIndex((imgIndex - 1 + total) % total)
              }}
              className='absolute left-1.5 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 shadow-md opacity-0 transition group-hover:opacity-100 hover:bg-white'
            >
              <ChevronLeft className='h-3.5 w-3.5 text-[#1a1a2e]' />
            </button>
            <button
              onClick={e => {
                e.stopPropagation()
                onSetImgIndex((imgIndex + 1) % total)
              }}
              className='absolute right-1.5 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 shadow-md opacity-0 transition group-hover:opacity-100 hover:bg-white'
            >
              <ChevronRight className='h-3.5 w-3.5 text-[#1a1a2e]' />
            </button>
          </>
        )}

        {/* Dots */}
        {total > 1 && (
          <div className='absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1'>
            {imgs.map((_, i) => (
              <button
                key={i}
                onClick={e => {
                  e.stopPropagation()
                  onSetImgIndex(i)
                }}
                className={`h-1.5 rounded-full transition-all ${i === imgIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/50'}`}
              />
            ))}
          </div>
        )}

        {/* Actions */}
        <div className='absolute right-2 top-2 flex flex-col gap-1.5 opacity-0 transition-opacity group-hover:opacity-100'>
          <button
            onClick={onToggleFavorite}
            className={`flex h-8 w-8 items-center justify-center rounded-full shadow-md transition ${
              isFavorite
                ? 'bg-[#e94560] text-white'
                : 'bg-white/95 text-gray-400 hover:text-[#e94560]'
            }`}
          >
            <Heart className={`h-3.5 w-3.5 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
          {imgs.length > 0 && (
            <button
              onClick={onDownload}
              className='flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-gray-400 shadow-md transition hover:text-[#1a1a2e]'
            >
              <Download className='h-3.5 w-3.5' />
            </button>
          )}
        </div>

        {/* New badge */}
        {(product as any).isNew && (
          <span className='absolute left-2 top-2 rounded-full bg-[#e94560] px-2 py-0.5 text-[9px] font-bold text-white'>
            নতুন
          </span>
        )}
      </div>

      {/* Body */}
      <div className='p-3'>
        {product.shop && (
          <div className='mb-1 flex items-center gap-1'>
            <span className='h-1.5 w-1.5 rounded-full bg-[#e94560]/60' />
            <span className='truncate text-[10px] font-medium text-gray-400'>
              {product.shop.shopName}
            </span>
          </div>
        )}
        <h3 className='mb-1.5 line-clamp-2 text-[13px] font-medium leading-snug text-[#1a1a2e]'>
          {product.name}
        </h3>
        <div className='mb-1.5 flex items-end justify-between'>
          <p className='text-[15px] font-bold text-[#1a1a2e]'>
            {formatPrice((product.price || product.basePrice || product.suggestedMaxPrice)!)}
          </p>
          <div className='flex items-center gap-0.5'>
            <Star className='h-3 w-3 fill-amber-400 text-amber-400' />
            <span className='text-[10px] text-gray-400'>4.8</span>
          </div>
        </div>
        {product.shop?.shopLocation && (
          <div className='mb-2 flex items-center gap-1 text-[10px] text-gray-400'>
            <MapPin className='h-2.5 w-2.5 shrink-0' />
            <span className='truncate'>{product.shop.shopLocation}</span>
          </div>
        )}
        <button
          onClick={e => {
            e.stopPropagation()
            onNavigate()
          }}
          className='w-full rounded-xl bg-[#1a1a2e] py-2 text-[11px] font-semibold text-white transition hover:bg-[#e94560] active:scale-[0.98]'
        >
          অর্ডার করুন
        </button>
      </div>
    </div>
  )
}

/* ─── Product Grid ─── */
interface ProductGridProps {
  products: ProductWithImages[]
  favorites: ProductWithImages[]
  toggleFavorite: (product: ProductWithImages, e: React.MouseEvent) => void
  currentImageIndex: { [key: number]: number }
  setCurrentImageIndex: React.Dispatch<React.SetStateAction<{ [key: number]: number }>>
  handleNavigate: (productId: number) => void
  downloadAllImages: (product: ProductWithImages, e: React.MouseEvent) => void
  formatPrice: (price: number) => string
  loadMore?: () => void
  hasMore?: boolean
  loadingMore?: boolean
  loading?: boolean
}

const ProductGrid = ({
  products,
  favorites,
  toggleFavorite,
  currentImageIndex,
  setCurrentImageIndex,
  handleNavigate,
  downloadAllImages,
  formatPrice,
  loadMore,
  hasMore,
  loadingMore,
  loading = false,
}: ProductGridProps) => {
  if (loading) {
    return (
      <div className='grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'>
        {Array.from({ length: 10 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    )
  }
  if (products.length === 0) return null

  return (
    <div>
      <div className='grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'>
        {products.map(product => (
          <ProductCard
            key={product.productId}
            product={product}
            isFavorite={favorites.some(p => p.productId === product.productId)}
            imgIndex={currentImageIndex[product.productId] || 0}
            onNavigate={() => handleNavigate(product.productId)}
            onToggleFavorite={e => toggleFavorite(product, e)}
            onDownload={e => downloadAllImages(product, e)}
            onSetImgIndex={i => setCurrentImageIndex(prev => ({ ...prev, [product.productId]: i }))}
            formatPrice={formatPrice}
          />
        ))}
      </div>
      {hasMore && (
        <div className='mt-6 flex justify-center'>
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className='flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-2.5 text-[13px] font-semibold text-[#1a1a2e] shadow-sm transition hover:border-[#e94560]/30 hover:bg-[#e94560]/5 hover:text-[#e94560] disabled:opacity-50'
          >
            {loadingMore ? (
              <>
                <div className='h-4 w-4 animate-spin rounded-full border-2 border-gray-200 border-t-[#e94560]' />
                লোড হচ্ছে...
              </>
            ) : (
              'আরও দেখুন'
            )}
          </button>
        </div>
      )}
    </div>
  )
}

/* ─── Section Header ─── */
const SectionHeader = ({
  icon: Icon,
  label,
  count,
}: {
  icon: React.ElementType
  label: string
  count?: number
}) => (
  <div className='mb-4 flex items-center justify-between'>
    <div className='flex items-center gap-2.5'>
      <div className='flex h-8 w-8 items-center justify-center rounded-xl bg-[#1a1a2e]'>
        <Icon className='h-4 w-4 text-white' />
      </div>
      <h2 className='font-serif text-[18px] font-bold text-[#1a1a2e]'>{label}</h2>
      {count !== undefined && (
        <span className='rounded-full bg-[#e94560]/10 px-2 py-0.5 text-[11px] font-semibold text-[#e94560]'>
          {count}
        </span>
      )}
    </div>
    <div className='h-px flex-1 mx-4 bg-gray-100' />
  </div>
)

/* ════════════════════════════════════════════ */
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
  const [sizeChartModal, setSizeChartModal] = useState<{ isOpen: boolean; sizeChart?: string }>({
    isOpen: false,
  })

  const [minPrice, setMinPrice] = useState<number | undefined>()
  const [maxPrice, setMaxPrice] = useState<number | undefined>()
  const [selectedShopId, setSelectedShopId] = useState<number | undefined>()
  const [selectedFilterCategory, setSelectedFilterCategory] = useState<number | undefined>()
  const [selectedFilterSubCategory, setSelectedFilterSubCategory] = useState<number | undefined>()
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredResults, setFilteredResults] = useState<ProductWithImages[]>([])
  const [filterProductMessage, setFilterProductMessage] = useState<string | null>(null)
  const [latestProducts, setLatestProducts] = useState<ProductWithImages[]>([])
  const [loadingLatestProducts, setLoadingLatestProducts] = useState(false)

  const [filterPage, setFilterPage] = useState(1)
  const [latestPage, setLatestPage] = useState(1)
  const [topSellingPage, setTopSellingPage] = useState(1)
  const [hasMoreFiltered, setHasMoreFiltered] = useState(false)
  const [hasMoreLatest, setHasMoreLatest] = useState(false)
  const [hasMoreTopSelling, setHasMoreTopSelling] = useState(false)
  const [loadingMoreFiltered, setLoadingMoreFiltered] = useState(false)
  const [loadingMoreLatest, setLoadingMoreLatest] = useState(false)
  const [loadingMoreTopSelling, setLoadingMoreTopSelling] = useState(false)
  const [applyingFilters, setApplyingFilters] = useState(false)
  const [downloadingSizeCharts, setDownloadingSizeCharts] = useState<{ [key: number]: boolean }>({})
  const [filterOpen, setFilterOpen] = useState(false)

  /* ── Data loading ── */
  useEffect(() => {
    const load = async () => {
      try {
        const shopsRes = await shopApi.getAllShops()
        setShops(shopsRes.data.shops || [])
        const { success, data } = await shopApi.getCategories(null)
        if (success) setCategories(data || [])
      } catch (e) {
        console.error(e)
      }
    }
    load()
    loadTopSellingProducts()
    loadFavorites()
  }, [])

  useEffect(() => {
    const loadLatest = async () => {
      try {
        setLoadingLatestProducts(true)
        const { success, data, pagination } = await (
          await productApi.getLatestProducts(1, 6)
        ).response
        if (success) {
          setLatestProducts(data || [])
          setHasMoreLatest(pagination!.page < pagination!.totalPages)
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoadingLatestProducts(false)
      }
    }
    loadLatest()
  }, [])

  useEffect(() => {
    const loadAndMerge = async () => {
      try {
        setLoadingCategories(true)
        const { success, data } = await shopApi.getCategories(null)
        if (!success) return
        const all = data || []
        if (selectedShop) {
          const { success: ss, data: shopCats } = await shopApi.getShopCategories(
            selectedShop.shopId
          )
          if (ss) {
            const ids = new Set(shopCats.map((c: Category) => c.categoryId))
            const filtered = all
              .map((cat: Category) => {
                const subs =
                  cat.subCategories?.filter((s: SubCategory) => ids.has(s.categoryId)) || []
                return {
                  ...cat,
                  subCategories: subs,
                  products: subs.reduce((n, s) => n + (s.products || 0), 0),
                }
              })
              .filter((c: Category) => c.subCategories && c.subCategories.length > 0)
            setCategories(filtered)
          }
        } else {
          setCategories(all)
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoadingCategories(false)
      }
    }
    loadAndMerge()
  }, [selectedShop])

  const loadTopSellingProducts = async (page = 1, append = false) => {
    try {
      if (page > 1) setLoadingMoreTopSelling(true)
      const { data } = await orderApi.getTopSellingProducts(page, 10)
      if (append) setTopSellingProducts(prev => [...prev, ...(data.data || [])])
      else setTopSellingProducts(data.data || [])
      setHasMoreTopSelling(data.page < data.totalPages || false)
      setTopSellingPage(page)
    } catch (e) {
      console.error(e)
    } finally {
      setLoadingMoreTopSelling(false)
    }
  }

  const loadFavorites = () => {
    const s = localStorage.getItem(FAVORITES_KEY)
    setFavorites(s ? JSON.parse(s) : [])
  }

  const toggleFavorite = (product: ProductWithImages, e: React.MouseEvent) => {
    e.stopPropagation()
    setFavorites(prev => {
      const has = prev.some(p => p.productId === product.productId)
      const next = has ? prev.filter(p => p.productId !== product.productId) : [...prev, product]
      updateFavoriteCount(next.length)
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(next))
      return next
    })
  }

  const formatPrice = (price: number) => `৳${price.toLocaleString()}`
  const handleNavigate = (productId: number) => navigate(`/products/${productId}`)
  const navigateToProductLists = (categoryId: number, shopId?: number) =>
    navigate('/products', { state: { categoryId, shopId: shopId || null } })

  const applyFilters = async (page = 1, append = false) => {
    let categoryId: number | number[] | undefined
    if (selectedFilterCategory && selectedFilterSubCategory) {
      categoryId = selectedFilterSubCategory
    } else if (selectedFilterCategory) {
      const cat = categories.find(c => c.categoryId === selectedFilterCategory)
      categoryId = cat?.subCategories?.map(s => s.categoryId) || []
    }
    try {
      if (page === 1) setApplyingFilters(true)
      else setLoadingMoreFiltered(true)
      const response = (
        await productApi.getAllProducts({
          search: searchQuery,
          minPrice,
          maxPrice,
          categoryId,
          shopId: selectedShopId,
          page,
          limit: 10,
        })
      ).response
      const { success, data, pagination } = response
      if (success) {
        if (append) setFilteredResults(prev => [...prev, ...(data || [])])
        else setFilteredResults(data || [])
        setHasMoreFiltered(pagination.page < pagination.totalPages)
        setFilterPage(page)
        setFilterProductMessage(!data || data.length === 0 ? 'কোন প্রোডাক্ট পাওয়া যায়নি' : null)
      }
    } catch (e) {
      console.error(e)
      setFilterProductMessage('ফিল্টার প্রয়োগে সমস্যা হয়েছে')
    } finally {
      setApplyingFilters(false)
      setLoadingMoreFiltered(false)
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
    setFilterPage(1)
    setHasMoreFiltered(false)
  }

  const downloadAllImages = async (product: ProductWithImages, e: React.MouseEvent) => {
    e.stopPropagation()
    const urls = product.ProductImage?.map(i => i.imageUrl) || []
    if (urls.length) {
      try {
        await fileDownloader.downloadAllFiles(urls, {
          baseNamePrefix: `product_${product.name.replace(/\s+/g, '_')}`,
          delayBetweenDownloads: 500,
        })
      } catch (e) {
        console.error(e)
      }
    }
  }

  const downloadSizeChart = async (url: string, catId: number) => {
    setDownloadingSizeCharts(prev => ({ ...prev, [catId]: true }))
    try {
      await fileDownloader.downloadAllFiles([url], {
        baseNamePrefix: 'size_chart',
        delayBetweenDownloads: 500,
      })
    } catch (e) {
      console.error(e)
    } finally {
      setDownloadingSizeCharts(prev => ({ ...prev, [catId]: false }))
    }
  }

  const loadMoreLatest = async () => {
    try {
      setLoadingMoreLatest(true)
      const res = await (await productApi.getLatestProducts(latestPage + 1, 6)).response
      setLatestProducts(prev => [...prev, ...(res.data || [])])
      setHasMoreLatest(res?.pagination?.page < res?.pagination?.totalPages)
      setLatestPage(p => p + 1)
    } catch (e) {
      console.error(e)
    } finally {
      setLoadingMoreLatest(false)
    }
  }

  const hasActiveFilters = !!(
    minPrice ||
    maxPrice ||
    selectedShopId ||
    selectedFilterCategory ||
    searchQuery
  )

  return (
    <div className='min-h-screen bg-[#f7f6f3]' id='categories'>
      <SizeChartModal
        isOpen={sizeChartModal.isOpen}
        onClose={() => setSizeChartModal({ isOpen: false })}
        sizeChart={sizeChartModal.sizeChart}
        onDownload={() => {
          if (sizeChartModal.sizeChart && selectedFilterCategory)
            downloadSizeChart(sizeChartModal.sizeChart, selectedFilterCategory)
        }}
      />

      {/* ── Top search bar ── */}
      <div className='sticky top-0 z-30 border-b border-gray-100 bg-white shadow-sm'>
        <div className='mx-auto flex max-w-screen-xl items-center gap-2 px-4 py-3'>
          <div className='flex flex-1 items-center gap-2 rounded-full border border-gray-200 bg-[#f7f6f3] px-4 py-2 transition focus-within:border-[#e94560]/40 focus-within:ring-2 focus-within:ring-[#e94560]/10'>
            <Search className='h-4 w-4 shrink-0 text-gray-400' />
            <input
              type='text'
              placeholder='পণ্যের নাম দিয়ে সার্চ করুন...'
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && applyFilters(1, false)}
              className='w-full bg-transparent text-[13px] text-[#1a1a2e] outline-none placeholder:text-gray-400'
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className='text-gray-300 hover:text-gray-500'
              >
                <X className='h-3.5 w-3.5' />
              </button>
            )}
          </div>
          <button
            onClick={() => applyFilters(1, false)}
            className='shrink-0 rounded-full bg-[#e94560] px-5 py-2 text-[13px] font-semibold text-white shadow-sm transition hover:bg-[#c73652] active:scale-95'
          >
            সার্চ
          </button>
          <button
            onClick={() => setFilterOpen(o => !o)}
            className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition ${
              filterOpen || hasActiveFilters
                ? 'border-[#e94560]/40 bg-[#e94560]/10 text-[#e94560]'
                : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
            }`}
          >
            <SlidersHorizontal className='h-4 w-4' />
            {hasActiveFilters && (
              <span className='absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-[#e94560]' />
            )}
          </button>
        </div>
      </div>

      {/* ── Filter Panel (collapsible) ── */}
      {filterOpen && (
        <div className='border-b border-gray-100 bg-white shadow-sm'>
          <div className='mx-auto max-w-screen-xl px-4 py-4'>
            <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4'>
              {/* Price range */}
              <div>
                <p className='mb-1.5 text-[11px] font-semibold uppercase tracking-[0.5px] text-gray-400'>
                  মূল্য পরিসীমা
                </p>
                <div className='flex items-center gap-2'>
                  <input
                    type='number'
                    placeholder='শুরু'
                    value={minPrice || ''}
                    onChange={e =>
                      setMinPrice(e.target.value === '' ? undefined : Number(e.target.value))
                    }
                    className='w-full rounded-xl border border-gray-200 bg-[#f7f6f3] px-3 py-2 text-[13px] text-[#1a1a2e] outline-none focus:border-[#e94560]/40 focus:ring-2 focus:ring-[#e94560]/10'
                  />
                  <span className='text-[12px] text-gray-400'>-</span>
                  <input
                    type='number'
                    placeholder='শেষ'
                    value={maxPrice || ''}
                    onChange={e =>
                      setMaxPrice(e.target.value === '' ? undefined : Number(e.target.value))
                    }
                    className='w-full rounded-xl border border-gray-200 bg-[#f7f6f3] px-3 py-2 text-[13px] text-[#1a1a2e] outline-none focus:border-[#e94560]/40 focus:ring-2 focus:ring-[#e94560]/10'
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <p className='mb-1.5 text-[11px] font-semibold uppercase tracking-[0.5px] text-gray-400'>
                  ক্যাটাগরি
                </p>
                <select
                  value={selectedFilterCategory || ''}
                  onChange={e => {
                    setSelectedFilterCategory(e.target.value ? Number(e.target.value) : undefined)
                    setSelectedFilterSubCategory(undefined)
                  }}
                  className='w-full rounded-xl border border-gray-200 bg-[#f7f6f3] px-3 py-2 text-[13px] text-[#1a1a2e] outline-none focus:border-[#e94560]/40 focus:ring-2 focus:ring-[#e94560]/10'
                >
                  <option value=''>সব ক্যাটাগরি</option>
                  {categories.map(c => (
                    <option key={c.categoryId} value={c.categoryId}>
                      {c.name}
                    </option>
                  ))}
                </select>
                {selectedFilterCategory && (
                  <select
                    value={selectedFilterSubCategory || ''}
                    onChange={e =>
                      setSelectedFilterSubCategory(
                        e.target.value ? Number(e.target.value) : undefined
                      )
                    }
                    className='mt-2 w-full rounded-xl border border-gray-200 bg-[#f7f6f3] px-3 py-2 text-[13px] text-[#1a1a2e] outline-none focus:border-[#e94560]/40 focus:ring-2 focus:ring-[#e94560]/10'
                  >
                    <option value=''>সব সাব-ক্যাটাগরি</option>
                    {categories
                      .find(c => c.categoryId === selectedFilterCategory)
                      ?.subCategories?.map(s => (
                        <option key={s.categoryId} value={s.categoryId}>
                          {s.name}
                        </option>
                      ))}
                  </select>
                )}
              </div>

              {/* Shop */}
              <div>
                <p className='mb-1.5 text-[11px] font-semibold uppercase tracking-[0.5px] text-gray-400'>
                  শপ
                </p>
                <select
                  value={selectedShopId || ''}
                  onChange={e =>
                    setSelectedShopId(e.target.value ? Number(e.target.value) : undefined)
                  }
                  className='w-full rounded-xl border border-gray-200 bg-[#f7f6f3] px-3 py-2 text-[13px] text-[#1a1a2e] outline-none focus:border-[#e94560]/40 focus:ring-2 focus:ring-[#e94560]/10'
                >
                  <option value=''>সব শপ</option>
                  {shops.map(s => (
                    <option key={s.shopId} value={s.shopId}>
                      {s.shopName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Actions */}
              <div className='flex items-end gap-2'>
                <button
                  onClick={() => {
                    applyFilters(1, false)
                    setFilterOpen(false)
                  }}
                  disabled={applyingFilters}
                  className='flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#1a1a2e] py-2.5 text-[13px] font-semibold text-white transition hover:bg-[#2d2d4e] disabled:opacity-60'
                >
                  {applyingFilters ? (
                    <>
                      <div className='h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white' />
                      সার্চ...
                    </>
                  ) : (
                    <>
                      <Search className='h-4 w-4' />
                      প্রয়োগ করুন
                    </>
                  )}
                </button>
                {hasActiveFilters && (
                  <button
                    onClick={resetFilters}
                    className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-200 text-gray-400 transition hover:border-[#e94560]/30 hover:text-[#e94560]'
                  >
                    <X className='h-4 w-4' />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className='mx-auto max-w-screen-xl px-4 py-6 sm:px-6 lg:px-8'>
        {/* ── Filter results ── */}
        {(applyingFilters || filteredResults.length > 0 || filterProductMessage) && (
          <section className='mb-8'>
            <SectionHeader
              icon={Search}
              label='সার্চ রেজাল্ট'
              count={filteredResults.length > 0 ? filteredResults.length : undefined}
            />
            {filterProductMessage && !applyingFilters && filteredResults.length === 0 ? (
              <div className='flex flex-col items-center justify-center rounded-2xl border border-gray-100 bg-white py-12 text-center'>
                <Search className='mb-3 h-10 w-10 text-gray-200' />
                <p className='mb-1 text-[14px] font-medium text-gray-600'>{filterProductMessage}</p>
                <p className='mb-4 text-[12px] text-gray-400'>অন্য ফিল্টার দিয়ে চেষ্টা করুন</p>
                <button
                  onClick={resetFilters}
                  className='rounded-xl bg-[#e94560] px-5 py-2 text-[13px] font-semibold text-white transition hover:bg-[#c73652]'
                >
                  ফিল্টার ক্লিয়ার
                </button>
              </div>
            ) : (
              <ProductGrid
                products={filteredResults}
                favorites={favorites}
                toggleFavorite={toggleFavorite}
                currentImageIndex={currentImageIndex}
                setCurrentImageIndex={setCurrentImageIndex}
                handleNavigate={handleNavigate}
                downloadAllImages={downloadAllImages}
                formatPrice={formatPrice}
                loadMore={() => applyFilters(filterPage + 1, true)}
                hasMore={hasMoreFiltered}
                loadingMore={loadingMoreFiltered}
                loading={applyingFilters}
              />
            )}
          </section>
        )}

        {/* ── Latest products ── */}
        <section className='mb-8'>
          <SectionHeader icon={Zap} label='নতুন পণ্যসমূহ' />
          <ProductGrid
            products={latestProducts}
            favorites={favorites}
            toggleFavorite={toggleFavorite}
            currentImageIndex={currentImageIndex}
            setCurrentImageIndex={setCurrentImageIndex}
            handleNavigate={handleNavigate}
            downloadAllImages={downloadAllImages}
            formatPrice={formatPrice}
            loadMore={loadMoreLatest}
            hasMore={hasMoreLatest}
            loadingMore={loadingMoreLatest}
            loading={loadingLatestProducts}
          />
        </section>

        {/* ── Top selling ── */}
        {topSellingProducts.length > 0 && (
          <section className='mb-8'>
            <SectionHeader icon={TrendingUp} label='সেরা বিক্রিত পণ্য' />
            <ProductGrid
              products={topSellingProducts}
              favorites={favorites}
              toggleFavorite={toggleFavorite}
              currentImageIndex={currentImageIndex}
              setCurrentImageIndex={setCurrentImageIndex}
              handleNavigate={handleNavigate}
              downloadAllImages={downloadAllImages}
              formatPrice={formatPrice}
              loadMore={() => loadTopSellingProducts(topSellingPage + 1, true)}
              hasMore={hasMoreTopSelling}
              loadingMore={loadingMoreTopSelling}
            />
          </section>
        )}

        {/* ── Shop selector ── */}
        <section className='mb-8'>
          <SectionHeader icon={Package} label='শপ নির্বাচন করুন' />
          <div className='grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'>
            {shops.map(shop => (
              <button
                key={shop.shopId}
                onClick={() =>
                  setSelectedShop(prev => (prev?.shopId === shop.shopId ? null : shop))
                }
                className={`group rounded-2xl border p-3 text-left transition-all duration-200 ${
                  selectedShop?.shopId === shop.shopId
                    ? 'border-[#e94560]/40 bg-[#e94560]/8 shadow-sm'
                    : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm'
                }`}
              >
                <div
                  className={`mb-1 h-2 w-2 rounded-full transition ${selectedShop?.shopId === shop.shopId ? 'bg-[#e94560]' : 'bg-gray-200 group-hover:bg-gray-300'}`}
                />
                <p
                  className={`truncate text-[13px] font-semibold transition ${selectedShop?.shopId === shop.shopId ? 'text-[#1a1a2e]' : 'text-gray-700'}`}
                >
                  {shop.shopName}
                </p>
                <p className='truncate text-[10px] text-gray-400'>{shop.shopLocation}</p>
              </button>
            ))}
          </div>
        </section>

        {/* ── Categories ── */}
        <section>
          <SectionHeader icon={SlidersHorizontal} label='সকল ক্যাটাগরি' />
          {loadingCategories ? (
            <div className='flex items-center justify-center py-16'>
              <div className='h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-[#e94560]' />
            </div>
          ) : categories.length === 0 ? (
            <div className='flex flex-col items-center justify-center rounded-2xl border border-gray-100 bg-white py-12'>
              <Package className='mb-3 h-10 w-10 text-gray-200' />
              <p className='text-[13px] text-gray-400'>কোন ক্যাটাগরি পাওয়া যায়নি</p>
            </div>
          ) : (
            <div className='space-y-4'>
              {categories.map(category => (
                <div
                  key={category.categoryId}
                  className='overflow-hidden rounded-2xl border border-gray-100 bg-white'
                >
                  {/* Category header */}
                  <div className='flex items-center justify-between border-b border-gray-50 px-5 py-3.5'>
                    <div className='flex items-center gap-2.5'>
                      <span className='h-3.5 w-[3px] rounded-full bg-[#e94560]' />
                      <h3 className='font-serif text-[15px] font-bold text-[#1a1a2e]'>
                        {category.name}
                      </h3>
                      <span className='rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-500'>
                        {category.products} পণ্য
                      </span>
                    </div>
                    {category.categoryIcon && (
                      <button
                        onClick={e => {
                          e.stopPropagation()
                          downloadSizeChart(category.categoryIcon!, category.categoryId)
                        }}
                        disabled={downloadingSizeCharts[category.categoryId]}
                        className='flex items-center gap-1.5 rounded-lg border border-gray-200 bg-[#f7f6f3] px-3 py-1.5 text-[11px] font-medium text-gray-600 transition hover:border-[#e94560]/30 hover:bg-[#e94560]/5 hover:text-[#e94560] disabled:opacity-50'
                      >
                        {downloadingSizeCharts[category.categoryId] ? (
                          <>
                            <div className='h-3 w-3 animate-spin rounded-full border-2 border-gray-300 border-t-[#e94560]' />
                            লোড হচ্ছে...
                          </>
                        ) : (
                          <>
                            <Download className='h-3 w-3' />
                            সাইজ চার্ট
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {/* Subcategories grid */}
                  {category.subCategories && category.subCategories.length > 0 ? (
                    <div className='grid grid-cols-3 gap-2 p-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-8'>
                      {category.subCategories.map(sub => (
                        <div
                          key={sub.categoryId}
                          className='group relative cursor-pointer overflow-hidden rounded-xl border border-gray-100 bg-[#f7f6f3] transition-all duration-200 hover:border-[#e94560]/25 hover:shadow-[0_4px_16px_rgba(233,69,96,0.08)]'
                          onClick={() =>
                            navigateToProductLists(sub.categoryId, selectedShop?.shopId)
                          }
                        >
                          {/* Product count */}
                          <div className='absolute right-1.5 top-1.5 z-10'>
                            <span className='rounded-full bg-[#1a1a2e]/80 px-1.5 py-0.5 text-[9px] font-bold text-white'>
                              {sub.products}
                            </span>
                          </div>

                          {/* Size chart icon */}
                          {sub.sizeChart && (
                            <button
                              onClick={e => {
                                e.stopPropagation()
                                setSizeChartModal({ isOpen: true, sizeChart: sub.sizeChart })
                              }}
                              className='absolute left-1.5 top-1.5 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-gray-500 shadow-sm opacity-0 transition group-hover:opacity-100 hover:text-[#e94560]'
                            >
                              <Ruler className='h-3 w-3' />
                            </button>
                          )}

                          {/* Image */}
                          <div className='aspect-square overflow-hidden'>
                            {sub.categoryIcon ? (
                              <img
                                src={sub.categoryIcon}
                                alt={sub.name}
                                className='h-full w-full object-cover transition-transform duration-300 group-hover:scale-110'
                                onError={e => {
                                  ;(e.target as HTMLImageElement).src =
                                    'https://via.placeholder.com/64'
                                }}
                              />
                            ) : (
                              <div className='flex h-full w-full items-center justify-center bg-gray-100'>
                                <Package className='h-6 w-6 text-gray-300' />
                              </div>
                            )}
                          </div>

                          {/* Name */}
                          <div className='px-2 py-2'>
                            <p className='line-clamp-2 text-center text-[10px] font-medium leading-tight text-[#1a1a2e] transition group-hover:text-[#e94560]'>
                              {sub.name}
                            </p>
                          </div>

                          {/* Bottom accent */}
                          <div className='absolute bottom-0 left-0 right-0 h-[2px] bg-[#e94560] opacity-0 transition-opacity group-hover:opacity-100' />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className='flex items-center justify-center py-8'>
                      <p className='text-[12px] text-gray-400'>কোন সাব-ক্যাটাগরি পাওয়া যায়নি</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

export default Categories
