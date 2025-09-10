import { Package } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import shopApi from '../Api/shop.api'
import { useAuth } from '../Hooks/useAuth'
import HomeIntroduction from './CompanyIntro'
import CustomerIntroduction from './CustomerIntroduction'
import Footer from './Footer'

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

const LandingPage = () => {
  const { customerMode } = useAuth()
  const navigate = useNavigate()
  const [categories, setCategories] = useState<Category[]>([])
  const [loadingCategories, setLoadingCategories] = useState(false)

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      setLoadingCategories(true)
      const { success, data } = await shopApi.getCategories(null)
      if (success) {
        setCategories(data || [])
      }
    } catch (error) {
      console.error('Error loading categories:', error)
    } finally {
      setLoadingCategories(false)
    }
  }

  const navigateToProductLists = (categoryId: number) => {
    navigate('/products', {
      state: {
        categoryId,
      },
    })
  }

  // Get all subcategories merged together
  const getAllSubCategories = () => {
    const allSubCategories: SubCategory[] = []
    categories.forEach(category => {
      if (category.subCategories && category.subCategories.length > 0) {
        allSubCategories.push(...category.subCategories)
      }
    })
    return allSubCategories
  }

  const allSubCategories = getAllSubCategories()

  return (
    <div className='flex flex-col'>
      <main className='flex-grow'>
        {/* Hero Introduction */}
        {customerMode ? <CustomerIntroduction /> : <HomeIntroduction />}

        {/* How It Works Section */}
        {!customerMode && (
          <section id='how-it-works' className='py-12 md:py-16 bg-white'>
            <div className='container mx-auto px-4'>
              <h2 className='text-2xl md:text-3xl font-bold text-center mb-8 md:mb-12'>
                কিভাবে কাজ করে?
              </h2>

              <div className='max-w-4xl mx-auto space-y-8 md:space-y-12'>
                {/* Step 1 */}
                <div className='flex flex-col md:flex-row items-center justify-center'>
                  <div className='mb-4 md:mb-0 md:mr-8 flex justify-center'>
                    <div className='w-16 h-16 md:w-20 md:h-20 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xl md:text-2xl font-bold'>
                      ১
                    </div>
                  </div>
                  <div className='text-center md:text-left md:w-2/3'>
                    <h3 className='text-lg md:text-xl font-semibold mb-2'>নিবন্ধন করুন</h3>
                    <p className='text-gray-600 text-sm md:text-base'>
                      শপ বিডি রিসেলার জবস-এ ফ্রি রেজিস্ট্রেশন করুন। মাত্র কয়েক মিনিটে সম্পন্ন হবে
                      আপনার অ্যাকাউন্ট ভেরিফিকেশন।
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className='flex flex-col md:flex-row items-center justify-center'>
                  <div className='mb-4 md:mb-0 md:mr-8 flex justify-center'>
                    <div className='w-16 h-16 md:w-20 md:h-20 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xl md:text-2xl font-bold'>
                      ২
                    </div>
                  </div>
                  <div className='text-center md:text-left md:w-2/3'>
                    <h3 className='text-lg md:text-xl font-semibold mb-2'>পণ্য নির্বাচন করুন</h3>
                    <p className='text-gray-600 text-sm md:text-base'>
                      শপ বিডি রিসেলার জবস এর পণ্য ক্যাটালগ ব্রাউজ করুন এবং আপনার পছন্দের পণ্যগুলো
                      নির্বাচন করুন।
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className='flex flex-col md:flex-row items-center justify-center'>
                  <div className='mb-4 md:mb-0 md:mr-8 flex justify-center'>
                    <div className='w-16 h-16 md:w-20 md:h-20 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xl md:text-2xl font-bold'>
                      ৩
                    </div>
                  </div>
                  <div className='text-center md:text-left md:w-2/3'>
                    <h3 className='text-lg md:text-xl font-semibold mb-2'>বিক্রয় শুরু করুন</h3>
                    <p className='text-gray-600 text-sm md:text-base'>
                      আপনার সোশ্যাল মিডিয়া বা অনলাইন স্টোরে শপ বিডি রিসেলার জবস এর পণ্যগুলো প্রচার
                      করুন। অর্ডার পেলে আমাদেরকে জানান।
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Categories Section - Modified for landing page */}
        <section id='categories' className='py-8 bg-gray-50'>
          <div className='container mx-auto px-4'>
            <h2 className='text-2xl md:text-3xl font-bold text-center mb-6 md:mb-8'>
              প্রোডাক্ট ক্যাটাগরি
            </h2>

            {loadingCategories ? (
              <div className='flex justify-center items-center h-32 bg-white rounded'>
                <div className='animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500'></div>
              </div>
            ) : allSubCategories.length === 0 ? (
              <div className='text-center py-3 bg-white rounded'>
                <p className='text-gray-500 text-xs'>No categories found</p>
              </div>
            ) : (
              <div className='grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-1'>
                {allSubCategories.map(subCategory => (
                  <div
                    key={subCategory.categoryId}
                    className='border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group relative p-2'
                    onClick={() => navigateToProductLists(subCategory.categoryId)}
                  >
                    {/* Product count in absolute top right cornermost position without background */}
                    <span className='absolute top-2 right-2 text-[10px] font-bold text-gray-700'>
                      {subCategory.products || 0}
                    </span>

                    <div className='flex flex-col items-center mt-3'>
                      {subCategory.categoryIcon ? (
                        <div className='w-16 h-16 mb-2 flex items-center justify-center rounded-lg overflow-hidden bg-gray-100'>
                          <img
                            src={subCategory.categoryIcon}
                            alt={subCategory.name}
                            className='w-full h-full object-cover'
                            onError={e => {
                              ;(e.target as HTMLImageElement).src = 'https://via.placeholder.com/64'
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
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}

export default LandingPage
