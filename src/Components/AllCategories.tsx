import { Download, Package, Ruler, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { fileDownloader } from '../Api/ftp.api'
import shopApi from '../Api/shop.api'

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

interface AllCategoriesProps {
  onCategorySelect?: (categoryId: number) => void
}

const AllCategories = ({ onCategorySelect }: AllCategoriesProps) => {
  const navigate = useNavigate()
  const [categories, setCategories] = useState<Category[]>([])
  const [loadingCategories, setLoadingCategories] = useState(false)
  const [downloadingSizeCharts, setDownloadingSizeCharts] = useState<{ [key: number]: boolean }>({})
  const [sizeChartModal, setSizeChartModal] = useState<{
    isOpen: boolean
    sizeChart?: string
  }>({
    isOpen: false,
    sizeChart: undefined,
  })

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
    if (onCategorySelect) {
      onCategorySelect(categoryId)
    } else {
      navigate('/products', {
        state: {
          categoryId,
        },
      })
    }
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

  const handleSizeChartDownload = (categoryId: number) => {
    if (sizeChartModal.sizeChart) {
      downloadSizeChart(sizeChartModal.sizeChart, categoryId)
    }
  }

  // Size Chart Modal Component (same as in Categories)
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

  return (
    <div className='min-h-screen bg-gray-50 p-1 sm:p-2'>
      <SizeChartModal
        isOpen={sizeChartModal.isOpen}
        onClose={closeSizeChart}
        sizeChart={sizeChartModal.sizeChart}
        onDownload={() => handleSizeChartDownload(0)}
      />

      {/* Header Section */}
      <div className='mb-4'>
        <h2 className='text-md font-bold text-gray-900 mb-2'>সকল ক্যাটাগরি</h2>

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
                  </div>
                  <div className='flex items-center space-x-2'>
                    {category.categoryIcon && (
                      <button
                        onClick={e => {
                          e.stopPropagation()
                          downloadSizeChart(category.categoryIcon!, category.categoryId)
                        }}
                        className='py-1 px-2 bg-blue-100 rounded hover:bg-blue-200 transition-colors flex items-center text-[10px] min-w-[80px] justify-center'
                        title='Download Size Chart'
                        disabled={downloadingSizeCharts[category.categoryId]}
                      >
                        {downloadingSizeCharts[category.categoryId] ? (
                          <div className='flex items-center'>
                            <div className='animate-spin rounded-full h-3 w-3 border-t-2 border-b-2 border-blue-500 mr-1'></div>
                            <span className='text-blue-600'>লোড হচ্ছে...</span>
                          </div>
                        ) : (
                          <>
                            <Download className='h-3 w-3 mr-0.5 text-blue-600' />
                            <span className='text-blue-600'>সাইজ চার্ট</span>
                          </>
                        )}
                      </button>
                    )}
                    <span className='text-xs text-gray-600'>({category.products || 0})</span>
                  </div>
                </div>

                {category.subCategories && category.subCategories.length > 0 ? (
                  <div className='grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-1'>
                    {category.subCategories.map(subCategory => (
                      <div
                        key={subCategory.categoryId}
                        className='border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group relative p-2'
                      >
                        {/* Product count in absolute top right cornermost position without background */}
                        <span className='absolute top-2 right-2 text-[10px] font-bold text-gray-700'>
                          {subCategory.products || 0}
                        </span>

                        {subCategory.sizeChart && (
                          <button
                            onClick={e => {
                              e.stopPropagation()
                              openSizeChart(subCategory.sizeChart)
                            }}
                            className='absolute top-2 left-2 p-1 bg-white rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity'
                            title='View Size Chart'
                          >
                            <Ruler className='h-3 w-3 text-gray-600' />
                          </button>
                        )}

                        <div
                          className='flex flex-col items-center mt-3'
                          onClick={() => navigateToProductLists(subCategory.categoryId)}
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

export default AllCategories
