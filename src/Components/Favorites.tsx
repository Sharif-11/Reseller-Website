// Favorites.tsx — BazaarHub Design System
// Design tokens: --navy: #1a1a2e  --rose: #e94560  --cream: #f7f6f3

import { ChevronLeft, ChevronRight, Download, Heart, MapPin, Package } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fileDownloader } from '../Api/ftp.api'
import { Product } from '../Api/shop.api'
import { useCartFavorite } from '../Context/cartContext'
import { FAVORITES_KEY } from '../utils/utils.variables'

const Favorites = () => {
  const [favorites, setFavorites] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [currentImageIndex, setCurrentImageIndex] = useState<{ [key: number]: number }>({})
  const [downloadingId, setDownloadingId] = useState<number | null>(null)
  const navigate = useNavigate()
  const itemsPerPage = 12
  const { loadCartCount, loadFavoriteCount } = useCartFavorite()

  useEffect(() => {
    const loadFavorites = () => {
      try {
        setLoading(true)
        const savedFavorites = localStorage.getItem(FAVORITES_KEY)
        if (savedFavorites) {
          const parsed = JSON.parse(savedFavorites)
          if (Array.isArray(parsed)) {
            setFavorites(parsed)
            loadFavoriteCount()
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

  useEffect(() => {
    loadFavoriteCount()
    loadCartCount()
  }, [favorites])

  const removeFavorite = (productId: number) => {
    const updatedFavorites = favorites.filter(fav => fav.productId !== productId)
    setFavorites(updatedFavorites)
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(updatedFavorites))
    loadFavoriteCount()
  }

  const downloadAllImages = async (product: Product) => {
    if (!product.ProductImage) return
    const imageUrls = product.ProductImage.map(image => image.imageUrl)
    try {
      setDownloadingId(product.productId)
      await fileDownloader.downloadAllFiles(imageUrls, {
        baseNamePrefix: `product_${product.name.replace(/\s+/g, '_')}`,
        delayBetweenDownloads: 500,
      })
    } catch (error) {
      console.error('Error downloading images:', error)
    } finally {
      setDownloadingId(null)
    }
  }

  const formatPrice = (price: number) => `৳${price.toLocaleString()}`

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

  const totalPages = Math.ceil(favorites.length / itemsPerPage)
  const paginatedFavorites = favorites.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  /* ── Loading ── */
  if (loading)
    return (
      <div className='flex min-h-[60vh] items-center justify-center bg-[#f7f6f3]'>
        <div className='relative h-10 w-10'>
          <div className='absolute inset-0 rounded-full border-2 border-gray-200' />
          <div className='absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-[#e94560]' />
        </div>
      </div>
    )

  /* ── Empty ── */
  if (favorites.length === 0)
    return (
      <div className='flex min-h-[60vh] flex-col items-center justify-center bg-[#f7f6f3] p-6 text-center'>
        <div className='mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-[#1a1a2e]'>
          <Heart className='h-9 w-9 text-white/20' />
        </div>
        <h2 className='mb-1.5 font-serif text-xl font-bold text-[#1a1a2e]'>পছন্দের তালিকা খালি</h2>
        <p className='text-[13px] text-gray-500'>পণ্য পছন্দের তালিকায় যোগ করলে এখানে দেখা যাবে</p>
      </div>
    )

  return (
    <div className='min-h-screen bg-[#f7f6f3]'>
      {/* ── Page header ── */}
      <div className='border-b border-gray-100 bg-white'>
        <div className='mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8'>
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='font-serif text-2xl font-bold text-[#1a1a2e]'>পছন্দের পণ্যসমূহ</h1>
              <p className='mt-0.5 text-[13px] text-gray-400'>
                {favorites.length} টি পণ্য সংরক্ষিত
              </p>
            </div>
            {/* Decorative rose accent */}
            <div className='hidden h-10 w-10 items-center justify-center rounded-2xl bg-[#e94560]/10 sm:flex'>
              <Heart className='h-5 w-5 text-[#e94560]' />
            </div>
          </div>
        </div>
      </div>

      <div className='mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8'>
        {/* ── Product grid ── */}
        <div className='grid grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 sm:gap-4'>
          {paginatedFavorites.map(product => {
            const currentImg = currentImageIndex[product.productId] || 0
            const totalImages = product.ProductImage?.length || 0

            return (
              <div
                key={`${product.productId}-${currentImg}`}
                className='group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5'
              >
                {/* Image */}
                <div className='relative aspect-square overflow-hidden'>
                  {product.ProductImage && product.ProductImage.length > 0 ? (
                    <img
                      src={product.ProductImage[currentImg]?.imageUrl}
                      alt={product.name}
                      className='h-full w-full cursor-pointer object-cover transition-transform duration-500 group-hover:scale-105'
                      onClick={() => navigate(`/products/${product.productId}`)}
                    />
                  ) : (
                    <div className='flex h-full w-full items-center justify-center bg-gray-100'>
                      <Package className='h-10 w-10 text-gray-300' />
                    </div>
                  )}

                  {/* Prev / Next arrows */}
                  {totalImages > 1 && (
                    <>
                      <button
                        onClick={e => {
                          e.stopPropagation()
                          prevImage(product.productId, totalImages)
                        }}
                        className='absolute left-2 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full bg-[#1a1a2e]/60 text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100'
                      >
                        <ChevronLeft className='h-3.5 w-3.5' />
                      </button>
                      <button
                        onClick={e => {
                          e.stopPropagation()
                          nextImage(product.productId, totalImages)
                        }}
                        className='absolute right-2 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full bg-[#1a1a2e]/60 text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100'
                      >
                        <ChevronRight className='h-3.5 w-3.5' />
                      </button>
                    </>
                  )}

                  {/* Dot indicators */}
                  {totalImages > 1 && (
                    <div className='absolute bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-1'>
                      {product.ProductImage.map((_, index) => (
                        <button
                          key={index}
                          onClick={e => {
                            e.stopPropagation()
                            setCurrentImageIndex(prev => ({ ...prev, [product.productId]: index }))
                          }}
                          className={`h-1.5 rounded-full transition-all ${index === currentImg ? 'w-4 bg-white' : 'w-1.5 bg-white/50'}`}
                        />
                      ))}
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className='absolute right-2.5 top-2.5 flex flex-col gap-1.5'>
                    <button
                      onClick={e => {
                        e.stopPropagation()
                        removeFavorite(product.productId)
                      }}
                      className='flex h-8 w-8 items-center justify-center rounded-xl border border-red-100 bg-white/90 text-[#e94560] shadow-sm backdrop-blur-sm transition hover:bg-white hover:shadow-md'
                    >
                      <Heart className='h-3.5 w-3.5 fill-current' />
                    </button>

                    {totalImages > 0 && (
                      <button
                        onClick={e => {
                          e.stopPropagation()
                          downloadAllImages(product)
                        }}
                        disabled={downloadingId === product.productId}
                        className='flex h-8 w-8 items-center justify-center rounded-xl border border-gray-100 bg-white/90 text-gray-600 shadow-sm backdrop-blur-sm transition hover:bg-white hover:shadow-md disabled:opacity-50'
                      >
                        {downloadingId === product.productId ? (
                          <div className='h-3.5 w-3.5 animate-spin rounded-full border-2 border-gray-300 border-t-[#e94560]' />
                        ) : (
                          <Download className='h-3.5 w-3.5' />
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Info */}
                <div
                  className='cursor-pointer p-3.5'
                  onClick={() => navigate(`/products/${product.productId}`)}
                >
                  <h3 className='mb-2 line-clamp-2 text-[13px] font-semibold leading-snug text-[#1a1a2e] transition-colors group-hover:text-[#e94560]'>
                    {product.name}
                  </h3>

                  <p className='mb-3 text-base font-bold text-[#1a1a2e]'>
                    {formatPrice(product.basePrice || product?.price!)}
                  </p>

                  {product.shop && (
                    <div className='space-y-1.5 border-t border-gray-50 pt-3'>
                      <div className='flex items-center gap-1.5 text-[11px] text-gray-400'>
                        <Package className='h-3 w-3 shrink-0' />
                        <span className='truncate'>{product.shop.shopName}</span>
                      </div>
                      <div className='flex items-center gap-1.5 text-[11px] text-gray-400'>
                        <MapPin className='h-3 w-3 shrink-0' />
                        <span className='truncate'>{product.shop.shopLocation}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* ── Pagination ── */}
        {totalPages > 1 && (
          <div className='mt-8 flex items-center justify-center gap-2'>
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className='flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 transition hover:border-[#e94560]/30 hover:text-[#e94560] disabled:opacity-40'
            >
              <ChevronLeft className='h-4 w-4' />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`flex h-9 w-9 items-center justify-center rounded-xl text-[13px] font-medium transition ${
                  page === currentPage
                    ? 'bg-[#e94560] text-white shadow-[0_4px_12px_rgba(233,69,96,0.3)]'
                    : 'border border-gray-200 bg-white text-gray-600 hover:border-[#e94560]/30 hover:text-[#e94560]'
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className='flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-500 transition hover:border-[#e94560]/30 hover:text-[#e94560] disabled:opacity-40'
            >
              <ChevronRight className='h-4 w-4' />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Favorites
