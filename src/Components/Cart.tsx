// Cart.tsx — BazaarHub Design System Redesign
// Design tokens: --navy: #1a1a2e  --rose: #e94560  --cream: #f7f6f3

import { useEffect, useState } from 'react'
import { useCookies } from 'react-cookie'
import { FaStore } from 'react-icons/fa'
import {
  FiAlertCircle,
  FiArrowLeft,
  FiCheckCircle,
  FiChevronLeft,
  FiChevronRight,
  FiPhone,
  FiShield,
  FiShoppingCart,
  FiTrash2,
  FiX,
} from 'react-icons/fi'
import { Link, useNavigate } from 'react-router-dom'
import { orderApi } from '../Api/order.api'
import { useCartFavorite } from '../Context/cartContext'
import { useAuth } from '../Hooks/useAuth'
import calculateCustomerReliability from '../utils/reliabilty'
import { CART_ITEMS_KEY } from '../utils/utils.variables'
import { CartItem } from './ProductDetail'

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

interface FraudCheckApiData {
  courier_name: string
  total_parcels: number
  total_delivered_parcels: number
  total_cancelled_parcels: number
}
interface FraudCheckResponse {
  mobile_number: string
  total_parcels: number
  total_delivered: number
  total_cancel: number
  apis: { [key: string]: FraudCheckApiData }
}

const Cart = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [cookies] = useCookies(['customerMode'])
  const [shopCarts, setShopCarts] = useState<ShopCart[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState<number | null>(null)
  const [showInstructionModal, setShowInstructionModal] = useState(false)
  const [showMobileModal, setShowMobileModal] = useState(false)
  const [selectedShopId, setSelectedShopId] = useState<number | null>(null)
  const [mobileNumber, setMobileNumber] = useState('')
  const [isCheckingFraud, setIsCheckingFraud] = useState(false)
  const [fraudCheckData, setFraudCheckData] = useState<FraudCheckResponse | null>(null)
  const [fraudCheckError, setFraudCheckError] = useState('')
  const { loadCartCount } = useCartFavorite()

  const calculateDeliveryCharges = (shopCart: ShopCart) => {
    const totalItems = calculateShopTotalItems(shopCart.items)
    let insideCharge = Number(shopCart.deliveryChargeInside) || 0
    let outsideCharge = Number(shopCart.deliveryChargeOutside) || 0
    if (totalItems > 3) {
      const additionalItems = totalItems - 3
      insideCharge += additionalItems * 10
      outsideCharge += additionalItems * 10
    }
    return { totalDeliveryChargeInside: insideCharge, totalDeliveryChargeOutside: outsideCharge }
  }

  useEffect(() => {
    const loadCartItems = () => {
      try {
        const savedCart = localStorage.getItem(CART_ITEMS_KEY)
        if (savedCart) {
          const parsed = JSON.parse(savedCart)
          if (Array.isArray(parsed)) {
            const shopMap = new Map<number, ShopCart>()
            parsed.forEach(item => {
              if (!shopMap.has(item.shopId))
                shopMap.set(item.shopId, {
                  shopId: item.shopId,
                  shopName: item.shopName,
                  shopLocation: item.shopLocation,
                  deliveryChargeInside: item.deliveryChargeInside,
                  deliveryChargeOutside: item.deliveryChargeOutside,
                  items: [],
                })
              shopMap.get(item.shopId)?.items.push({
                ...item,
                cartItemId:
                  item.cartItemId || `${item.productId}-${JSON.stringify(item.selectedOptions)}`,
              })
            })
            const shopCartsWithDelivery = Array.from(shopMap.values()).map(shopCart => ({
              ...shopCart,
              ...calculateDeliveryCharges(shopCart),
            }))
            setShopCarts(shopCartsWithDelivery)
          } else {
            localStorage.removeItem(CART_ITEMS_KEY)
            setShopCarts([])
          }
        }
      } catch {
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
          return { ...updatedShopCart, ...calculateDeliveryCharges(updatedShopCart) }
        }
        return shopCart
      })
      .filter(shopCart => shopCart.items.length > 0)
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
        return { ...updatedShopCart, ...calculateDeliveryCharges(updatedShopCart) }
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
    setShowInstructionModal(false)
    if (cookies.customerMode) {
      if (!selectedShopId) return
      const selectedShopCart = shopCarts.find(cart => cart.shopId === selectedShopId)
      if (selectedShopCart) {
        if (user)
          navigate('/checkout', {
            state: {
              shopCart: selectedShopCart,
              totalDeliveryChargeInside: selectedShopCart.totalDeliveryChargeInside,
              totalDeliveryChargeOutside: selectedShopCart.totalDeliveryChargeOutside,
              mobileNumber: '',
            },
          })
        else
          navigate('/customer-checkout', {
            state: { shopCart: selectedShopCart, mobileNumber: '' },
          })
      }
    } else {
      if (user) setShowMobileModal(true)
      else {
        if (!selectedShopId) return
        const selectedShopCart = shopCarts.find(cart => cart.shopId === selectedShopId)
        navigate('/customer-checkout', { state: { shopCart: selectedShopCart, mobileNumber: '' } })
      }
    }
  }

  const handleMobileNumberSubmit = async () => {
    if (!mobileNumber || mobileNumber.length < 11) {
      setFraudCheckError('সঠিক মোবাইল নম্বর দিন')
      return
    }
    setIsCheckingFraud(true)
    setFraudCheckError('')
    try {
      const response = await orderApi.fraudCheckByPhoneNo(mobileNumber)
      if (response.success) setFraudCheckData(response.data)
      else setFraudCheckError(response.message || 'ফ্রড চেক ব্যর্থ হয়েছে')
    } catch {
      setFraudCheckError('একটি ত্রুটি ঘটেছে')
    } finally {
      setIsCheckingFraud(false)
    }
  }

  const proceedToCheckout = () => {
    if (!selectedShopId) return
    setShowMobileModal(false)
    const selectedShopCart = shopCarts.find(cart => cart.shopId === selectedShopId)
    if (selectedShopCart) {
      if (user)
        navigate('/checkout', {
          state: {
            shopCart: selectedShopCart,
            totalDeliveryChargeInside: selectedShopCart.totalDeliveryChargeInside,
            totalDeliveryChargeOutside: selectedShopCart.totalDeliveryChargeOutside,
            mobileNumber,
          },
        })
      else navigate('/customer-checkout', { state: { shopCart: selectedShopCart, mobileNumber } })
    }
  }

  const calculateShopSubtotal = (items: CartItem[]) =>
    items.reduce((sum, item) => sum + item.sellingPrice * item.quantity, 0)
  const calculateShopTotalItems = (items: CartItem[]) =>
    items.reduce((sum, item) => sum + item.quantity, 0)
  const calculateTotalItems = () =>
    shopCarts.reduce((sum, shopCart) => sum + calculateShopTotalItems(shopCart.items), 0)

  /* ── Loading ── */
  if (isLoading)
    return (
      <div className='flex min-h-screen items-center justify-center bg-[#f7f6f3]'>
        <div className='relative h-10 w-10'>
          <div className='absolute inset-0 rounded-full border-2 border-gray-200' />
          <div className='absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-[#e94560]' />
        </div>
      </div>
    )

  /* ── Empty ── */
  if (shopCarts.length === 0)
    return (
      <div className='flex min-h-screen flex-col items-center justify-center bg-[#f7f6f3] p-4'>
        <div className='w-full max-w-sm text-center'>
          <div className='mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-[#1a1a2e]'>
            <FiShoppingCart className='h-10 w-10 text-white/30' />
          </div>
          <h2 className='mb-2 font-serif text-2xl font-bold text-[#1a1a2e]'>কার্ট খালি</h2>
          <p className='mb-8 text-sm text-gray-500'>কার্টে পণ্য যোগ করুন অর্ডার দেওয়ার জন্য</p>
          <Link
            to='/products#products'
            className='inline-flex items-center gap-2 rounded-xl bg-[#e94560] px-6 py-3 text-sm font-semibold text-white shadow-[0_4px_20px_rgba(233,69,96,0.3)] transition hover:bg-[#c73652]'
          >
            <FiArrowLeft className='h-4 w-4' />
            পণ্য ব্রাউজ করুন
          </Link>
        </div>
      </div>
    )

  return (
    <div className='min-h-screen bg-[#f7f6f3] pt-16'>
      {/* ════ INSTRUCTION MODAL ════ */}
      {showInstructionModal && (
        <div className='fixed inset-0 z-50 flex items-end justify-center bg-[#1a1a2e]/70 backdrop-blur-sm sm:items-center sm:p-4'>
          <div className='w-full max-w-md overflow-hidden rounded-t-3xl bg-white sm:rounded-3xl'>
            <div className='flex items-center justify-between border-b border-gray-100 px-6 py-4'>
              <h3 className='text-base font-bold text-[#1a1a2e]'>অর্ডার নির্দেশনা</h3>
              <button
                onClick={() => setShowInstructionModal(false)}
                className='flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition hover:bg-gray-200'
              >
                <FiX className='h-4 w-4' />
              </button>
            </div>
            <div className='max-h-[60vh] overflow-y-auto px-6 py-4'>
              <div className='space-y-3'>
                {[
                  'ডেলিভারি কর্মী উপস্থিত থাকা অবস্থাতেই পণ্য পরীক্ষা করে নিতে হবে — কোনো ত্রুটি পাওয়া গেলে সাথে সাথে রিটার্ন করতে হবে।',
                  'ডেলিভারি কর্মী চলে যাওয়ার পর পণ্য ফেরত বা বদল করতে চাইলে অতিরিক্ত ডেলিভারি চার্জ দিতে হবে।',
                  '৩টি পণ্য পর্যন্ত সাধারণ ডেলিভারি চার্জ।',
                  '৩টির বেশি পণ্য হলে অতিরিক্ত চার্জ প্রযোজ্য হবে।',
                  'পণ্য সম্পর্কে কোনো অভিযোগ থাকলে আনবক্সিং ভিডিও দিতে হবে। ভিডিওতে কুরিয়ার স্টিকার স্পষ্টভাবে দেখাতে হবে।',
                ].map((text, i) => (
                  <div key={i} className='flex items-start gap-3'>
                    <span className='flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#e94560]/10 text-[11px] font-bold text-[#e94560]'>
                      {i + 1}
                    </span>
                    <p className='text-[13px] leading-relaxed text-gray-600'>{text}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className='flex gap-3 border-t border-gray-100 px-6 py-4'>
              <button
                onClick={() => setShowInstructionModal(false)}
                className='flex-1 rounded-xl border border-gray-200 py-3 text-[13px] font-medium text-gray-600 transition hover:bg-gray-50'
              >
                বাতিল
              </button>
              <button
                onClick={handleConfirmOrder}
                className='flex-1 rounded-xl bg-[#e94560] py-3 text-[13px] font-semibold text-white transition hover:bg-[#c73652]'
              >
                শর্তে রাজি হয়ে এগিয়ে যান
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════ FRAUD CHECK MODAL ════ */}
      {showMobileModal && !cookies.customerMode && (
        <div className='fixed inset-0 z-50 flex items-end justify-center bg-[#1a1a2e]/70 backdrop-blur-sm sm:items-center sm:p-4'>
          <div className='w-full max-w-md overflow-hidden rounded-t-3xl bg-white sm:rounded-3xl'>
            <div className='flex items-center justify-between border-b border-gray-100 px-6 py-4'>
              <div className='flex items-center gap-2'>
                <FiShield className='h-4 w-4 text-[#e94560]' />
                <h3 className='text-base font-bold text-[#1a1a2e]'>ফ্রড চেক</h3>
              </div>
              <button
                onClick={() => {
                  setShowMobileModal(false)
                  setFraudCheckData(null)
                  setFraudCheckError('')
                }}
                className='flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition hover:bg-gray-200'
              >
                <FiX className='h-4 w-4' />
              </button>
            </div>

            <div className='max-h-[70vh] overflow-y-auto px-6 py-5'>
              {!fraudCheckData && !fraudCheckError ? (
                <div className='space-y-4'>
                  <p className='text-[13px] text-gray-500'>
                    কাস্টমারের মোবাইল নম্বর দিয়ে ফ্রড চেক করুন
                  </p>
                  <div>
                    <label className='mb-1.5 block text-[12px] font-semibold uppercase tracking-wider text-gray-400'>
                      মোবাইল নম্বর
                    </label>
                    <div className='relative'>
                      <FiPhone className='absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400' />
                      <input
                        type='tel'
                        value={mobileNumber}
                        onChange={e => setMobileNumber(e.target.value)}
                        placeholder='01XXXXXXXXX'
                        className='w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 text-sm text-[#1a1a2e] outline-none transition focus:border-[#e94560]/40 focus:ring-2 focus:ring-[#e94560]/15'
                      />
                    </div>
                    {fraudCheckError && (
                      <p className='mt-1.5 text-[12px] text-[#e94560]'>{fraudCheckError}</p>
                    )}
                  </div>
                  <button
                    onClick={handleMobileNumberSubmit}
                    disabled={isCheckingFraud}
                    className='w-full rounded-xl bg-[#1a1a2e] py-3 text-[13px] font-semibold text-white transition hover:bg-[#16213e] disabled:opacity-50'
                  >
                    {isCheckingFraud ? (
                      <span className='flex items-center justify-center gap-2'>
                        <span className='h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white' />
                        চেক করা হচ্ছে...
                      </span>
                    ) : (
                      'চেক করুন'
                    )}
                  </button>
                </div>
              ) : fraudCheckData ? (
                <div className='space-y-4'>
                  <div className='rounded-2xl border border-gray-100 bg-gray-50 p-4'>
                    <p className='mb-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400'>
                      ফ্রড চেক রিপোর্ট
                    </p>
                    <div className='grid grid-cols-2 gap-3'>
                      {[
                        {
                          label: 'মোবাইল নম্বর',
                          value: fraudCheckData.mobile_number,
                          color: 'text-[#1a1a2e]',
                        },
                        {
                          label: 'মোট অর্ডার',
                          value: fraudCheckData.total_parcels,
                          color: 'text-[#1a1a2e]',
                        },
                        {
                          label: 'সফল ডেলিভারি',
                          value: fraudCheckData.total_delivered,
                          color: 'text-emerald-600',
                        },
                        {
                          label: 'ক্যান্সেল্ড',
                          value: fraudCheckData.total_cancel,
                          color: 'text-[#e94560]',
                        },
                      ].map(({ label, value, color }, i) => (
                        <div key={i} className='rounded-xl border border-gray-100 bg-white p-3'>
                          <p className='mb-1 text-[11px] text-gray-400'>{label}</p>
                          <p className={`text-sm font-bold ${color}`}>{value}</p>
                        </div>
                      ))}
                    </div>
                    <div
                      className={`mt-3 rounded-xl p-3 text-center text-[13px] font-medium ${fraudCheckData.total_cancel === 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}
                    >
                      {calculateCustomerReliability(fraudCheckData).suggestion}
                    </div>
                  </div>
                  <button
                    onClick={proceedToCheckout}
                    className='w-full rounded-xl bg-[#e94560] py-3 text-[13px] font-semibold text-white transition hover:bg-[#c73652]'
                  >
                    অর্ডার করুন
                  </button>
                </div>
              ) : (
                <div className='space-y-4'>
                  <div className='rounded-2xl border border-red-100 bg-red-50 p-4'>
                    <div className='flex items-start gap-3'>
                      <FiAlertCircle className='mt-0.5 h-4 w-4 shrink-0 text-red-500' />
                      <div>
                        <p className='text-[13px] font-medium text-red-700'>{fraudCheckError}</p>
                        <p className='mt-1 text-[12px] text-red-500'>
                          ফ্রড চেক ছাড়াও অর্ডার সম্পূর্ণ করতে পারবেন।
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className='flex flex-col gap-2'>
                    <button
                      onClick={proceedToCheckout}
                      className='w-full rounded-xl bg-[#e94560] py-3 text-[13px] font-semibold text-white transition hover:bg-[#c73652]'
                    >
                      অর্ডার করুন
                    </button>
                    <button
                      onClick={() => {
                        setFraudCheckError('')
                        setFraudCheckData(null)
                      }}
                      className='w-full rounded-xl border border-gray-200 py-3 text-[13px] font-medium text-gray-600 transition hover:bg-gray-50'
                    >
                      আবার চেষ্টা করুন
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ════ PAGE CONTENT ════ */}
      <div className='mx-auto max-w-screen-xl px-4 py-6 sm:px-6 lg:px-8'>
        {/* Page header */}
        <div className='mb-6 flex items-center justify-between'>
          <div>
            <h1 className='font-serif text-2xl font-bold text-[#1a1a2e]'>আপনার কার্ট</h1>
          </div>
          <Link
            to='/products#products'
            className='flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-[13px] font-medium text-gray-600 transition hover:bg-gray-50 hover:text-[#1a1a2e]'
          >
            <FiArrowLeft className='h-3.5 w-3.5' />
            আরও পণ্য যোগ করুন
          </Link>
        </div>

        <div className='grid gap-6 lg:grid-cols-3'>
          {/* ── Cart Items ── */}
          <div className='space-y-4 lg:col-span-2'>
            {shopCarts.map(shopCart => (
              <div
                key={shopCart.shopId}
                className='overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm'
              >
                {/* Shop Header */}
                <div className='flex items-center justify-between border-b border-gray-50 bg-[#f7f6f3] px-5 py-4'>
                  <div className='flex items-center gap-3'>
                    <div className='flex h-9 w-9 items-center justify-center rounded-xl bg-[#1a1a2e]'>
                      <FaStore className='h-3.5 w-3.5 text-white/60' />
                    </div>
                    <div>
                      <p className='text-[14px] font-semibold text-[#1a1a2e]'>
                        {shopCart.shopName}
                      </p>
                      {shopCart.shopLocation && (
                        <p className='text-[11px] text-gray-400'>{shopCart.shopLocation}</p>
                      )}
                    </div>
                  </div>
                  {shopCart.shopLocation && (
                    <div className='hidden text-right sm:block'>
                      <p className='text-[11px] text-gray-400'>
                        ডেলিভারি: ভিতরে ৳{shopCart.totalDeliveryChargeInside} / বাইরে ৳
                        {shopCart.totalDeliveryChargeOutside}
                      </p>
                    </div>
                  )}
                </div>

                {/* Cart Items */}
                <div className='divide-y divide-gray-50'>
                  {shopCart.items.map(item => (
                    <div
                      key={item.cartItemId}
                      className='flex items-start gap-4 p-5 transition hover:bg-gray-50/50'
                    >
                      {/* Image */}
                      <div className='h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-gray-100'>
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className='h-full w-full object-cover'
                          onError={e => {
                            ;(e.target as HTMLImageElement).src = '/placeholder-product.jpg'
                          }}
                        />
                      </div>

                      {/* Info */}
                      <div className='flex min-w-0 flex-1 flex-col gap-2'>
                        <h3 className='line-clamp-2 text-[13px] font-semibold text-[#1a1a2e]'>
                          {item.name}
                        </h3>

                        {Object.entries(item.selectedOptions).length > 0 && (
                          <div className='flex flex-wrap gap-1.5'>
                            {Object.entries(item.selectedOptions).map(([key, value]) => (
                              <span
                                key={key}
                                className='rounded-full border border-gray-100 bg-gray-50 px-2 py-0.5 text-[10px] font-medium text-gray-500'
                              >
                                {key}: {value}
                              </span>
                            ))}
                          </div>
                        )}

                        {item.selectedAddOns && item.selectedAddOns.length > 0 && (
                          <p className='text-[11px] text-emerald-600'>
                            অতিরিক্ত: {item.selectedAddOns.map(a => a.name).join(', ')}
                          </p>
                        )}

                        <div className='flex items-center justify-between'>
                          {/* Quantity */}
                          <div className='flex items-center overflow-hidden rounded-xl border border-gray-200 bg-white'>
                            <button
                              onClick={() =>
                                updateQuantity(shopCart.shopId, item.cartItemId, item.quantity - 1)
                              }
                              disabled={isUpdating === item.productId}
                              className='flex h-8 w-8 items-center justify-center text-gray-400 transition hover:bg-gray-50 hover:text-gray-900'
                            >
                              <FiChevronLeft className='h-3.5 w-3.5' />
                            </button>
                            <span className='flex w-8 items-center justify-center text-[13px] font-bold text-[#1a1a2e]'>
                              {isUpdating === item.productId ? (
                                <span className='h-3 w-3 animate-spin rounded-full border border-gray-300 border-t-[#e94560]' />
                              ) : (
                                item.quantity
                              )}
                            </span>
                            <button
                              onClick={() =>
                                updateQuantity(shopCart.shopId, item.cartItemId, item.quantity + 1)
                              }
                              disabled={isUpdating === item.productId}
                              className='flex h-8 w-8 items-center justify-center text-gray-400 transition hover:bg-gray-50 hover:text-gray-900'
                            >
                              <FiChevronRight className='h-3.5 w-3.5' />
                            </button>
                          </div>

                          {/* Price & remove */}
                          <div className='flex items-center gap-3'>
                            <div className='text-right'>
                              <p className='text-[14px] font-bold text-[#1a1a2e]'>
                                ৳{(item.sellingPrice * item.quantity).toLocaleString('bn-BD')}
                              </p>
                              <p className='text-[11px] text-gray-400'>
                                ৳{item.sellingPrice.toLocaleString('bn-BD')} × {item.quantity}
                              </p>
                            </div>
                            <button
                              onClick={() => removeItem(shopCart.shopId, item.cartItemId)}
                              className='flex h-8 w-8 items-center justify-center rounded-xl border border-red-100 bg-red-50 text-red-400 transition hover:bg-red-100 hover:text-red-600'
                            >
                              <FiTrash2 className='h-3.5 w-3.5' />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Shop Footer */}
                <div className='border-t border-gray-50 bg-[#f7f6f3]/60 px-5 py-4'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='text-[12px] text-gray-400'>
                        {calculateShopTotalItems(shopCart.items)} টি পণ্য
                      </p>
                      <p className='text-[14px] font-bold text-[#1a1a2e]'>
                        মোট: ৳{calculateShopSubtotal(shopCart.items).toLocaleString('bn-BD')}
                      </p>
                      {shopCart.shopLocation && (
                        <p className='text-[11px] text-gray-400'>
                          ডেলিভারি (ভিতরে): ৳{shopCart.totalDeliveryChargeInside}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleOrderClick(shopCart.shopId)}
                      className='flex items-center gap-2 rounded-xl bg-[#e94560] px-5 py-3 text-[13px] font-semibold text-white shadow-[0_4px_16px_rgba(233,69,96,0.25)] transition hover:bg-[#c73652] active:scale-[0.97]'
                    >
                      <FiShoppingCart className='h-4 w-4' />
                      অর্ডার করুন
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ── Order Summary Sidebar ── */}
          <div className='lg:col-span-1'>
            <div className='sticky top-20 overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm'>
              {/* Header */}
              <div className='border-b border-gray-50 px-5 py-4'>
                <h2 className='text-[14px] font-bold text-[#1a1a2e]'>অর্ডার সারাংশ</h2>
              </div>

              <div className='space-y-3 p-5'>
                {/* Stats */}
                {[
                  { label: 'মোট দোকান', value: `${shopCarts.length} টি` },
                  { label: 'মোট পণ্য', value: `${calculateTotalItems()} টি` },
                ].map(({ label, value }) => (
                  <div key={label} className='flex items-center justify-between'>
                    <span className='text-[13px] text-gray-500'>{label}</span>
                    <span className='text-[13px] font-medium text-[#1a1a2e]'>{value}</span>
                  </div>
                ))}

                <div className='my-1 border-t border-gray-100' />

                <div className='flex items-center justify-between'>
                  <span className='text-[14px] font-semibold text-[#1a1a2e]'>সর্বমোট মূল্য</span>
                  <span className='text-lg font-bold text-[#e94560]'>
                    ৳
                    {shopCarts
                      .reduce((sum, shop) => sum + calculateShopSubtotal(shop.items), 0)
                      .toLocaleString('bn-BD')}
                  </span>
                </div>

                <p className='text-[11px] text-gray-400'>* ডেলিভারি চার্জ আলাদাভাবে যোগ হবে</p>
              </div>

              {/* Trust badges */}
              <div className='border-t border-gray-50 bg-[#f7f6f3]/60 px-5 py-4'>
                <div className='space-y-2'>
                  {[
                    {
                      icon: FiCheckCircle,
                      text: 'নিরাপদ অর্ডার প্রক্রিয়া',
                      color: 'text-emerald-500',
                    },
                    {
                      icon: FiShield,
                      text: 'ডেলিভারিতে পণ্য পরীক্ষা করুন',
                      color: 'text-blue-500',
                    },
                  ].map(({ icon: Icon, text, color }, i) => (
                    <div key={i} className='flex items-center gap-2'>
                      <Icon className={`h-3.5 w-3.5 shrink-0 ${color}`} />
                      <p className='text-[11px] text-gray-500'>{text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cart
