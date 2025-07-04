import { useEffect, useState } from 'react'
import {
  FiArrowLeft,
  FiChevronLeft,
  FiChevronRight,
  FiShoppingCart,
  FiTrash2,
  FiX,
} from 'react-icons/fi'
import { Link, useNavigate } from 'react-router-dom'
import { useCartFavorite } from '../Context/cartContext'
import { useAuth } from '../Hooks/useAuth'
import { CartItem } from '../types/cart.types'
import { CART_ITEMS_KEY } from '../utils/utils.variables'

export type ShopCart = {
  shopId: number
  shopName: string
  shopLocation?: string
  deliveryChargeInside?: number
  deliveryChargeOutside?: number
  totalDeliveryChargeInside?: number
  totalDeliveryChargeOutside?: number
  items: CartItem[]
}

const Cart = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [shopCarts, setShopCarts] = useState<ShopCart[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState<number | null>(null)
  const [showInstructionModal, setShowInstructionModal] = useState(false)
  const [selectedShopId, setSelectedShopId] = useState<number | null>(null)
  const { loadCartCount } = useCartFavorite()

  // Calculate delivery charges for a shop
  const calculateDeliveryCharges = (shopCart: ShopCart) => {
    const totalItems = calculateShopTotalItems(shopCart.items)
    console.log(`Calculating delivery charges for shop ${shopCart.shopId} with ${totalItems} items`)
    let insideCharge = Number(shopCart.deliveryChargeInside) || 0
    let outsideCharge = Number(shopCart.deliveryChargeOutside) || 0

    // Add 10 tk for each additional item beyond 3
    if (totalItems > 3) {
      const additionalItems = totalItems - 3
      insideCharge += additionalItems * 10
      outsideCharge += additionalItems * 10
    }
    console.log({
      insideCharge,
      outsideCharge,
      shopId: shopCart.shopId,
      shopLocation: shopCart.shopLocation,
      totalItems,
      deliveryChargeInside: shopCart.deliveryChargeInside,
      deliveryChargeOutside: shopCart.deliveryChargeOutside,
    })

    return {
      totalDeliveryChargeInside: insideCharge,
      totalDeliveryChargeOutside: outsideCharge,
    }
  }

  // Load cart items from localStorage and group by shop
  useEffect(() => {
    const loadCartItems = () => {
      try {
        const savedCart = localStorage.getItem(CART_ITEMS_KEY)

        if (savedCart) {
          const parsed = JSON.parse(savedCart)

          if (Array.isArray(parsed)) {
            // Group items by shop
            const shopMap = new Map<number, ShopCart>()

            parsed.forEach(item => {
              if (!shopMap.has(item.shopId)) {
                shopMap.set(item.shopId, {
                  shopId: item.shopId,
                  shopName: item.shopName,
                  shopLocation: item.shopLocation,
                  deliveryChargeInside: item.deliveryChargeInside,
                  deliveryChargeOutside: item.deliveryChargeOutside,
                  items: [],
                })
              }
              shopMap.get(item.shopId)?.items.push({
                ...item,
                cartItemId:
                  item.cartItemId || `${item.productId}-${JSON.stringify(item.selectedOptions)}`,
              })
            })

            // Calculate delivery charges for each shop
            const shopCartsWithDelivery = Array.from(shopMap.values()).map(shopCart => {
              const deliveryCharges = calculateDeliveryCharges(shopCart)
              return {
                ...shopCart,
                ...deliveryCharges,
              }
            })

            setShopCarts(shopCartsWithDelivery)
          } else {
            console.error('Invalid cart format - resetting')
            localStorage.removeItem(CART_ITEMS_KEY)
            setShopCarts([])
          }
        }
      } catch (err) {
        console.error('Error loading cart:', err)
        localStorage.removeItem(CART_ITEMS_KEY)
        setShopCarts([])
      } finally {
        setIsLoading(false)
      }
    }

    loadCartItems()
  }, [])
  useEffect(() => {
    loadCartCount()
  }, [shopCarts])

  const removeItem = (shopId: number, cartItemId: string) => {
    const updatedShopCarts = shopCarts
      .map(shopCart => {
        if (shopCart.shopId === shopId) {
          const filteredItems = shopCart.items.filter(item => item.cartItemId !== cartItemId)
          const updatedShopCart = { ...shopCart, items: filteredItems }
          const deliveryCharges = calculateDeliveryCharges(updatedShopCart)
          return { ...updatedShopCart, ...deliveryCharges }
        }
        return shopCart
      })
      .filter(shopCart => shopCart.items.length > 0) // Remove empty shop carts

    setShopCarts(updatedShopCarts)
    saveCartToLocalStorage(updatedShopCarts)
  }

  const updateQuantity = (shopId: number, cartItemId: string, newQuantity: number) => {
    if (newQuantity < 1) return

    setIsUpdating(parseInt(cartItemId.split('-')[0]))
    const updatedShopCarts = shopCarts.map(shopCart => {
      if (shopCart.shopId === shopId) {
        const updatedItems = shopCart.items.map(item =>
          item.cartItemId === cartItemId ? { ...item, quantity: newQuantity } : item
        )
        const updatedShopCart = { ...shopCart, items: updatedItems }
        const deliveryCharges = calculateDeliveryCharges(updatedShopCart)
        return { ...updatedShopCart, ...deliveryCharges }
      }
      return shopCart
    })

    setShopCarts(updatedShopCarts)
    saveCartToLocalStorage(updatedShopCarts)
    setTimeout(() => setIsUpdating(null), 300)
  }

  const saveCartToLocalStorage = (shopCarts: ShopCart[]) => {
    const allItems = shopCarts.flatMap(shopCart => shopCart.items)
    localStorage.setItem(CART_ITEMS_KEY, JSON.stringify(allItems))
  }

  const handleOrderClick = (shopId: number) => {
    setSelectedShopId(shopId)
    setShowInstructionModal(true)
  }

  const handleConfirmOrder = () => {
    if (!selectedShopId) return

    setShowInstructionModal(false)
    const selectedShopCart = shopCarts.find(cart => cart.shopId === selectedShopId)
    if (selectedShopCart) {
      user &&
        navigate('/checkout', {
          state: {
            shopCart: selectedShopCart,
            totalDeliveryChargeInside: selectedShopCart.totalDeliveryChargeInside,
            totalDeliveryChargeOutside: selectedShopCart.totalDeliveryChargeOutside,
          },
        })
      user || navigate('/customer-checkout', { state: { shopCart: selectedShopCart } })
    }
  }

  // Calculation functions for a specific shop
  const calculateShopSubtotal = (items: CartItem[]) =>
    items.reduce((sum, item) => sum + item.sellingPrice * item.quantity, 0)

  const calculateShopTotalItems = (items: CartItem[]) =>
    items.reduce((sum, item) => sum + item.quantity, 0)

  // Calculation for all items (used in header)
  const calculateTotalItems = () =>
    shopCarts.reduce((sum, shopCart) => sum + calculateShopTotalItems(shopCart.items), 0)

  if (isLoading) {
    return (
      <div className='flex justify-center items-center min-h-screen'>
        <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500'></div>
      </div>
    )
  }

  if (shopCarts.length === 0) {
    return (
      <div className='container mx-auto px-4 py-8 min-h-screen flex flex-col items-center justify-center'>
        <div className='bg-white rounded-lg shadow-md p-8 max-w-md w-full text-center'>
          <div className='flex justify-center mb-6'>
            <FiShoppingCart className='text-gray-400 text-5xl' />
          </div>
          <h2 className='text-2xl font-bold text-gray-800 mb-2'>আপনার কার্ট খালি</h2>
          <p className='text-gray-600 mb-6'>কার্টে পণ্য যোগ করুন অর্ডার দেওয়ার জন্য</p>
          <Link
            to='/products'
            className='inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors'
          >
            <FiArrowLeft className='mr-2' />
            পণ্য ব্রাউজ করুন
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className='container mx-auto px-2 sm:px-4 py-4 sm:py-8'>
      {/* Instruction Modal */}
      {showInstructionModal && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
          <div className='bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto'>
            <div className='p-4 border-b flex justify-between items-center sticky top-0 bg-white'>
              <h3 className='text-lg font-bold'>অর্ডার নির্দেশনা</h3>
              <button
                onClick={() => setShowInstructionModal(false)}
                className='text-gray-500 hover:text-gray-700'
              >
                <FiX size={24} />
              </button>
            </div>

            <div className='p-4 text-sm space-y-3'>
              <p>
                ১. ডেলিভারি কর্মী উপস্থিত থাকা অবস্থাতেই পণ্য পরীক্ষা করে নিতে হবে - কোনো ত্রুটি
                পাওয়া গেলে সাথে সাথে রিটার্ন করতে হবে।
              </p>
              <p>
                ২. ডেলিভারি কর্মী চলে যাওয়ার পর পণ্য ফেরত বা বদল করতে চাইলে অতিরিক্ত ডেলিভারি চার্জ
                দিতে হবে।
              </p>
              <p>৩. ৩টি পণ্য পর্যন্ত সাধারণ ডেলিভারি চার্জ</p>
              <p>৪. ৩টির বেশি পণ্য হলে অতিরিক্ত চার্জ প্রযোজ্য হবে।</p>
            </div>

            <div className='p-4 border-t flex justify-end space-x-3 sticky bottom-0 bg-white text-xs'>
              <button
                onClick={() => setShowInstructionModal(false)}
                className='px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50'
              >
                বাতিল
              </button>
              <button
                onClick={handleConfirmOrder}
                className='px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700'
              >
                শর্তে রাজি হয়ে অর্ডার কনফার্ম করুন
              </button>
            </div>
          </div>
        </div>
      )}

      <div className='flex items-center mb-4 sm:mb-6'>
        <h1 className='text-xl sm:text-2xl font-bold text-gray-900 ml-2 sm:ml-4'>আপনার কার্ট</h1>
      </div>

      {/* Shop Cart Sections */}
      {shopCarts.map(shopCart => (
        <div key={shopCart.shopId} className='mb-8 border rounded-lg overflow-hidden'>
          {/* Shop Header */}
          <div className='bg-gray-100 p-3 sm:p-4 border-b'>
            <div className='flex justify-between items-center'>
              <div>
                <h2 className='font-medium text-gray-900'>{shopCart.shopName}</h2>
                {shopCart.shopLocation && (
                  <p className='text-xs text-gray-600 mt-1'>{shopCart.shopLocation}</p>
                )}
              </div>
              <div className='text-right'>
                <p className='text-xs text-gray-600'>
                  {shopCart.shopLocation && (
                    <>
                      <span>ডেলিভারি চার্জ: </span>
                      <span>
                        শহরে ({shopCart.shopLocation}): ৳{shopCart.totalDeliveryChargeInside}
                      </span>
                      <span>, বাইরে: ৳{shopCart.totalDeliveryChargeOutside}</span>
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Cart Items for this Shop */}
          <div className='bg-white'>
            {/* Desktop cart header */}
            <div className='hidden md:grid grid-cols-12 bg-gray-50 p-3 sm:p-4 border-b'>
              <div className='col-span-5 font-medium text-gray-700'>পণ্য</div>
              <div className='col-span-2 font-medium text-gray-700 text-center'>দাম</div>
              <div className='col-span-3 font-medium text-gray-700 text-center'>পরিমাণ</div>
              <div className='col-span-2 font-medium text-gray-700 text-right'>মোট</div>
            </div>

            {/* Cart items */}
            {shopCart.items.map(item => (
              <div
                key={item.cartItemId}
                className='grid grid-cols-1 sm:grid-cols-12 p-3 sm:p-4 border-b last:border-b-0 hover:bg-gray-50 transition-colors'
              >
                {/* Product info */}
                <div className='col-span-6 md:col-span-5 flex items-start sm:items-center mb-2 sm:mb-0'>
                  <div className='relative h-12 w-12 sm:h-16 sm:w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200'>
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className='h-full w-full object-cover object-center'
                      onError={e => {
                        ;(e.target as HTMLImageElement).src = '/placeholder-product.jpg'
                      }}
                    />
                  </div>
                  <div className='ml-3 sm:ml-4 flex-1 min-w-0'>
                    <h3 className='text-sm font-medium text-gray-900 line-clamp-2 sm:line-clamp-1'>
                      {item.name}
                    </h3>
                    {Object.entries(item.selectedOptions).length > 0 && (
                      <div className='mt-1 text-xs text-gray-500'>
                        {Object.entries(item.selectedOptions).map(([key, value]) => (
                          <p key={key} className='truncate'>
                            {key}: {value}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Price */}
                <div className='hidden md:flex flex-col items-center justify-center col-span-2'>
                  <p className='text-xs text-gray-900'>
                    ৳{item.sellingPrice.toLocaleString('bn-BD')}
                  </p>
                </div>

                {/* Quantity */}
                <div className='col-span-4 md:col-span-3 flex items-center justify-start sm:justify-center mt-2 sm:mt-0'>
                  <span className='text-[10px] text-gray-500 mr-1 md:hidden'>পরিমাণ:</span>
                  <div className='flex items-center border rounded-md'>
                    <button
                      onClick={() =>
                        updateQuantity(shopCart.shopId, item.cartItemId, item.quantity - 1)
                      }
                      className='px-2 py-1 text-gray-600 hover:bg-gray-100'
                      disabled={isUpdating === item.productId}
                    >
                      <FiChevronLeft size={8} />
                    </button>
                    <span className='px-1 sm:px-2 py-0.5 sm:py-1 text-center text-xs sm:text-sm max-w-[16px] sm:max-w-[20px] min-w-[16px] sm:min-w-[20px]'>
                      {isUpdating === item.productId ? (
                        <div className='inline-block h-1 w-1 sm:h-1.5 sm:w-1.5 animate-spin rounded-full border border-solid sm:border-2 border-blue-500 border-r-transparent'></div>
                      ) : (
                        <span className='text-xs sm:text-sm'>{item.quantity}</span>
                      )}
                    </span>
                    <button
                      onClick={() =>
                        updateQuantity(shopCart.shopId, item.cartItemId, item.quantity + 1)
                      }
                      className='px-2 py-1 text-gray-600 hover:bg-gray-100'
                      disabled={isUpdating === item.productId}
                    >
                      <FiChevronRight size={8} />
                    </button>
                  </div>
                </div>

                {/* Total and remove */}
                <div className='col-span-2 flex flex-col sm:items-end justify-between sm:justify-center mt-3 sm:mt-0'>
                  <div className='flex flex-col sm:block text-right'>
                    <p className='text-gray-900 text-sm pb-1'>
                      মোট: ৳{(item.sellingPrice * item.quantity).toLocaleString('bn-BD')}
                    </p>
                    {/* Mobile price info */}
                    <div className='md:hidden'>
                      <p className='text-xs text-gray-900'>
                        প্রতি পিস: ৳{item.sellingPrice.toLocaleString('bn-BD')}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeItem(shopCart.shopId, item.cartItemId)}
                    className='mt-1 text-xs text-red-600 hover:text-red-800 flex items-center justify-end sm:justify-start'
                  >
                    <FiTrash2 className='mr-1' size={12} />
                    সরান
                  </button>
                </div>
              </div>
            ))}

            {/* Shop Cart Summary */}
            <div className='p-4 border-t'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
                <div>
                  <p className='text-sm text-gray-600'>
                    মোট পণ্য: {calculateShopTotalItems(shopCart.items)} টি
                  </p>
                  <p className='text-sm font-medium text-gray-900'>
                    মোট মূল্য: ৳{calculateShopSubtotal(shopCart.items).toLocaleString('bn-BD')}
                  </p>
                </div>
                <div className='text-right'>
                  {shopCart.shopLocation && (
                    <>
                      <p className='text-sm text-gray-600'>
                        ডেলিভারি চার্জ (শহরে - {shopCart.shopLocation}): ৳
                        {shopCart.totalDeliveryChargeInside}
                      </p>
                      <p className='text-sm text-gray-600'>
                        ডেলিভারি চার্জ (বাইরে): ৳{shopCart.totalDeliveryChargeOutside}
                      </p>
                    </>
                  )}
                </div>
              </div>
              <div className='flex justify-end'>
                <button
                  onClick={() => handleOrderClick(shopCart.shopId)}
                  className='px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm'
                >
                  এই দোকান থেকে অর্ডার করুন
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Global Cart Summary */}
      <div className='bg-white rounded-lg shadow-md p-4 mt-6'>
        <h2 className='text-lg font-medium mb-4'>সর্বমোট অর্ডার সারাংশ</h2>
        <div className='space-y-3'>
          <div className='flex justify-between'>
            <span className='text-gray-600'>মোট দোকান:</span>
            <span className='font-medium'>{shopCarts.length} টি</span>
          </div>
          <div className='flex justify-between'>
            <span className='text-gray-600'>মোট পণ্য:</span>
            <span className='font-medium'>{calculateTotalItems()} টি</span>
          </div>
          <div className='flex justify-between'>
            <span className='text-gray-600'>সর্বমোট মূল্য:</span>
            <span className='font-medium'>
              ৳
              {shopCarts
                .reduce((sum, shop) => sum + calculateShopSubtotal(shop.items), 0)
                .toLocaleString('bn-BD')}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cart
