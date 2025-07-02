import { useEffect, useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import { productApi } from '../Api/product.api'
import { Product } from '../types/product.types'

const PublicProductDetails = () => {
  const location = useLocation()
  const { productId } = useParams()
  const [product, setProduct] = useState<Product | null>(location.state?.product || null)
  const [loading, setLoading] = useState(!location.state?.product)
  const [mainImage, setMainImage] = useState('')

  useEffect(() => {
    if (!location.state?.product && productId) {
      const fetchProduct = async () => {
        try {
          setLoading(true)
          const response = await productApi.getProductDetail(parseInt(productId))
          if (response.success && response.data) {
            setProduct(response.data)
            setMainImage(response.data.imageUrl)
          }
        } catch (error) {
          console.error('পণ্য তথ্য লোড করতে সমস্যা:', error)
        } finally {
          setLoading(false)
        }
      }
      fetchProduct()
    } else if (location.state?.product) {
      setMainImage(location.state.product.imageUrl)
    }
  }, [productId, location.state])

  if (loading) {
    return (
      <div className='flex justify-center items-center min-h-screen'>
        <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500'></div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className='text-center py-12'>
        <p className='text-gray-500'>পণ্য খুঁজে পাওয়া যায়নি</p>
      </div>
    )
  }

  const allImages = [
    { imageUrl: product.imageUrl, isMain: true },
    ...(product.images || []).map(img => ({ imageUrl: img.imageUrl, isMain: false })),
  ]

  return (
    <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8' id='#product-detail'>
      {/* পণ্যের নাম */}
      <h1 className='text-2xl md:text-3xl font-bold text-gray-900 mb-6'>{product.name}</h1>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
        {/* ইমেজ গ্যালারী */}
        <div>
          {/* মূল ইমেজ */}
          <div className='bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-4'>
            <img
              src={mainImage}
              alt={product.name}
              className='w-full h-96 object-contain p-4'
              loading='lazy'
              onError={e => {
                ;(e.target as HTMLImageElement).src = '/placeholder-product.jpg'
              }}
            />
          </div>

          {/* থাম্বনেইল ইমেজ */}
          {allImages.length > 1 && (
            <div className='grid grid-cols-4 gap-3'>
              {allImages.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setMainImage(img.imageUrl)}
                  className={`rounded-lg border-2 overflow-hidden transition-all ${
                    mainImage === img.imageUrl ? 'border-blue-500' : 'border-gray-200'
                  }`}
                >
                  <img
                    src={img.imageUrl}
                    alt={`${product.name} - ${index + 1}`}
                    className='w-full h-20 object-cover'
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* পণ্যের বিবরণ */}
        <div className='space-y-6'>
          {/* মূল্য এবং স্টক */}
          <div className='bg-blue-50 rounded-lg p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-gray-600'>বর্তমান মূল্য</p>
                <p className='text-2xl font-bold text-blue-600'>
                  ৳{product.basePrice.toLocaleString('bn-BD')}
                </p>
              </div>
              <div
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  product.stockSize > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}
              >
                {product.stockSize > 0 ? 'স্টকে আছে' : 'স্টকে নেই'}
              </div>
            </div>
          </div>

          {/* পণ্যের বৈশিষ্ট্য (যদি থাকে) */}

          {/* পণ্যের বিবরণ */}
          <div className='border border-gray-100 rounded-lg p-4'>
            <h3 className='font-medium text-lg mb-3 text-gray-800'>পণ্যের বিবরণ</h3>
            <p className='text-gray-700 whitespace-pre-line'>
              {product.description || 'এই পণ্যের কোন বিবরণ প্রদান করা হয়নি।'}
            </p>
          </div>

          {/* ভিডিও (যদি থাকে) */}
          {product.videoUrl && (
            <div className='border border-gray-100 rounded-lg p-4'>
              <h3 className='font-medium text-lg mb-3 text-gray-800'>পণ্যের ভিডিও</h3>
              <div className='aspect-w-16 aspect-h-9'>
                <iframe
                  src={product.videoUrl.replace('watch?v=', 'embed/')}
                  className='w-full h-64 rounded-lg'
                  frameBorder='0'
                  allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PublicProductDetails
