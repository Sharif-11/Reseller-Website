import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiShoppingCart, FiTrash2, FiArrowLeft, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { CART_ITEMS_KEY } from '../utils/utils.variables';
import { CartItem } from '../types/cart.types';

const Cart = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState<number | null>(null);

  // Load cart items from localStorage
  useEffect(() => {
    const loadCartItems = () => {
      try {
        const savedCart = localStorage.getItem(CART_ITEMS_KEY);
        console.log('Loaded from localStorage:', savedCart);
        
        if (savedCart) {
          const parsed = JSON.parse(savedCart);
          if (Array.isArray(parsed)) {
            const itemsWithIds = parsed.map(item => ({
              ...item,
              cartItemId: item.cartItemId || `${item.productId}-${JSON.stringify(item.selectedOptions)}`
            }));
            setCartItems(itemsWithIds);
          } else {
            console.error('Invalid cart format - resetting');
            localStorage.removeItem(CART_ITEMS_KEY);
            setCartItems([]);
          }
        }
      } catch (err) {
        console.error('Error loading cart:', err);
        localStorage.removeItem(CART_ITEMS_KEY);
        setCartItems([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadCartItems();
  }, []);

  const removeItem = (cartItemId: string) => {
    const newItems = cartItems.filter(item => item.cartItemId !== cartItemId);
    setCartItems(newItems);
    localStorage.setItem(CART_ITEMS_KEY, JSON.stringify(newItems));
  };

  const updateQuantity = (cartItemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    setIsUpdating(parseInt(cartItemId.split('-')[0]));
    const updatedItems = cartItems.map(item =>
      item.cartItemId === cartItemId ? { ...item, quantity: newQuantity } : item
    );
    setCartItems(updatedItems);
    localStorage.setItem(CART_ITEMS_KEY, JSON.stringify(updatedItems));
    setTimeout(() => setIsUpdating(null), 300);
  };

  // Calculation functions
  const calculateSubtotal = () => cartItems.reduce((sum, item) => sum + item.sellingPrice * item.quantity, 0);
  const calculateTotalItems = () => cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const calculateProfit = (item: CartItem) => (item.sellingPrice - item.basePrice) * item.quantity;
  const calculateTotalProfit = () => cartItems.reduce((sum, item) => sum + (item.sellingPrice - item.basePrice) * item.quantity, 0);
  const calculateTotalBasePrice = () => cartItems.reduce((sum, item) => sum + item.basePrice * item.quantity, 0);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 min-h-screen flex flex-col items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full text-center">
          <div className="flex justify-center mb-6">
            <FiShoppingCart className="text-gray-400 text-5xl" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">আপনার কার্ট খালি</h2>
          <p className="text-gray-600 mb-6">কার্টে পণ্য যোগ করুন অর্ডার দেওয়ার জন্য</p>
          <Link
            to="/products"
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
          >
            <FiArrowLeft className="mr-2" />
            পণ্য ব্রাউজ করুন
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
      <div className="flex items-center mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 ml-2 sm:ml-4">আপনার কার্ট</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
        {/* Cart items list - Mobile optimized */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Mobile cart header (hidden on desktop) */}
            <div className="md:hidden p-3 border-b bg-gray-50">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-700">মোট পণ্য: {calculateTotalItems()} টি</span>
                <span className="font-medium text-gray-900">৳{calculateSubtotal().toLocaleString('bn-BD')}</span>
              </div>
            </div>

            {/* Desktop cart header */}
            <div className="hidden md:grid grid-cols-12 bg-gray-100 p-3 sm:p-4 border-b">
              <div className="col-span-5 font-medium text-gray-700">পণ্য</div>
              <div className="col-span-2 font-medium text-gray-700 text-center">দাম</div>
              <div className="col-span-3 font-medium text-gray-700 text-center">পরিমাণ</div>
              <div className="col-span-2 font-medium text-gray-700 text-right">মোট</div>
            </div>

            {/* Cart items */}
            {cartItems.map((item) => (
              <div
                key={item.cartItemId}
                className="grid grid-cols-1 sm:grid-cols-12 p-3 sm:p-4 border-b last:border-b-0 hover:bg-gray-50 transition-colors"
              >
                {/* Product info - full width on mobile, col-span-5 on desktop */}
                <div className="col-span-6 md:col-span-5 flex items-start sm:items-center mb-2 sm:mb-0">
                  <div className="relative h-12 w-12 sm:h-16 sm:w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="h-full w-full object-cover object-center"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder-product.jpg';
                      }}
                    />
                  </div>
                  <div className="ml-3 sm:ml-4 flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 line-clamp-2 sm:line-clamp-1">
                      {item.name}
                    </h3>
                    {Object.entries(item.selectedOptions).length > 0 && (
                      <div className="mt-1 text-xs text-gray-500">
                        {Object.entries(item.selectedOptions).map(([key, value]) => (
                          <p key={key} className="truncate">
                            {key}: {value}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Price - hidden on mobile, shown on desktop */}
                <div className="hidden md:flex flex-col items-center justify-center col-span-2">
                  <p className="text-gray-900">৳{item.sellingPrice.toLocaleString('bn-BD')}</p>
                  <p className="text-xs text-gray-500 line-through">
                    ৳{item.basePrice.toLocaleString('bn-BD')}
                  </p>
                  <p className="text-xs text-green-600">
                    (+৳{(item.sellingPrice - item.basePrice).toLocaleString('bn-BD')})
                  </p>
                </div>

                {/* Quantity - full width on mobile, col-span-3 on desktop */}
                <div className="col-span-4 md:col-span-3 flex items-center justify-between sm:justify-center mt-2 sm:mt-0">
                  <span className="text-xs text-gray-500 md:hidden">পরিমাণ:</span>
                  <div className="flex items-center border rounded-md">
                    <button
                      onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                      className="px-2 py-1 text-gray-600 hover:bg-gray-100"
                      disabled={isUpdating === item.productId}
                    >
                      <FiChevronLeft size={16} />
                    </button>
                    <span className="px-2 sm:px-3 py-1 text-center min-w-[30px] sm:min-w-[40px]">
                      {isUpdating === item.productId ? (
                        <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-blue-500 border-r-transparent"></div>
                      ) : (
                        item.quantity
                      )}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                      className="px-2 py-1 text-gray-600 hover:bg-gray-100"
                      disabled={isUpdating === item.productId}
                    >
                      <FiChevronRight size={16} />
                    </button>
                  </div>
                </div>

                {/* Total and remove - full width on mobile, col-span-2 on desktop */}
                <div className="col-span-2 flex flex-col sm:items-end justify-between sm:justify-center mt-3 sm:mt-0">
                  <div className="flex justify-between sm:block">
                    <p className="text-gray-900 font-medium">
                      ৳{(item.sellingPrice * item.quantity).toLocaleString('bn-BD')}
                    </p>
                    {/* Mobile price info (hidden on desktop) */}
                    <div className="md:hidden text-right">
                      <p className="text-xs text-gray-500 line-through">
                        ৳{item.basePrice.toLocaleString('bn-BD')}
                      </p>
                      <p className="text-xs text-green-600">
                        লাভ: ৳{calculateProfit(item).toLocaleString('bn-BD')}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeItem(item.cartItemId)}
                    className="mt-1 text-xs text-red-600 hover:text-red-800 flex items-center justify-end sm:justify-start"
                  >
                    <FiTrash2 className="mr-1" size={12} />
                    সরান
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order summary - Sticky on desktop, appears after cart items on mobile */}
        <div className="lg:col-span-1 order-first lg:order-last">
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 sticky top-4">
            <h2 className="text-lg font-medium text-gray-900 mb-3 sm:mb-4">অর্ডার সারাংশ</h2>

            <div className="space-y-3 sm:space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">মোট পণ্য:</span>
                <span className="text-gray-900">{calculateTotalItems()} টি</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">মূল মূল্য:</span>
                <span className="text-gray-900">৳{calculateTotalBasePrice().toLocaleString('bn-BD')}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">সাবটোটাল:</span>
                <span className="text-gray-900">৳{calculateSubtotal().toLocaleString('bn-BD')}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">মোট লাভ:</span>
                <span className="text-green-600 font-medium">
                  ৳{calculateTotalProfit().toLocaleString('bn-BD')}
                </span>
              </div>

              <div className="border-t pt-3 sm:pt-4">
                <div className="flex justify-between font-medium text-gray-900">
                  <span>মোট:</span>
                  <span>৳{calculateSubtotal().toLocaleString('bn-BD')}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 sm:mt-6 space-y-3 sm:space-y-4">
              <Link
                to="/checkout"
                className="block w-full py-2 sm:py-3 px-4 rounded-md bg-green-600 hover:bg-green-700 text-white font-medium text-center transition-colors text-sm sm:text-base"
              >
                অর্ডার সম্পন্ন করুন
              </Link>

              <Link
                to="/products"
                className="block w-full py-2 sm:py-3 px-4 rounded-md border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium text-center transition-colors flex items-center justify-center text-sm sm:text-base"
              >
                <FiShoppingCart className="mr-2" size={16} />
                আরো পণ্য যোগ করুন
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;