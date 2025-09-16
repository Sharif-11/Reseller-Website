import { useEffect, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { logout } from '../Api/auth.api'
import logo from '../assets/sbr.png'
import { useCartFavorite } from '../Context/cartContext'
import { useAuth } from '../Hooks/useAuth'
import { loadingText } from '../utils/utils.variables'

const Header = ({
  isSidebarOpen,
  setIsSidebarOpen,
}: {
  isSidebarOpen: boolean
  setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const { user, setUser, customerMode } = useAuth()

  // Sample cart and favorite counts - replace with actual data from your state/context
  const { cartCount, favoriteCount } = useCartFavorite()

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen)
  }

  const handleLogout = async () => {
    setLoading(true)
    const { success } = await logout()
    if (success) {
      localStorage.removeItem('token')
      if (setUser) setUser(null)
      navigate('/')
    }
    setLoading(false)
  }

  useEffect(() => {
    isDropdownOpen && setIsSidebarOpen(false)
  }, [isDropdownOpen])

  useEffect(() => {
    isSidebarOpen && setIsDropdownOpen(false)
  }, [isSidebarOpen])

  // Render cart icon component
  const CartIcon = () => (
    <NavLink
      to='/cart'
      className='relative p-1 md:p-2 text-white hover:bg-indigo-600 rounded-full transition'
    >
      <svg
        xmlns='http://www.w3.org/2000/svg'
        className='h-6 w-6'
        fill='none'
        viewBox='0 0 24 24'
        stroke='currentColor'
      >
        <path
          strokeLinecap='round'
          strokeLinejoin='round'
          strokeWidth={2}
          d='M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z'
        />
      </svg>
      {cartCount > 0 && (
        <span className='absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-4 w-4 md:h-5 md:w-5 flex items-center justify-center'>
          {cartCount > 9 ? '9+' : cartCount}
        </span>
      )}
    </NavLink>
  )

  // Render favorite icon component
  const FavoriteIcon = () => (
    <NavLink
      to='/favorites'
      className='relative p-1 md:p-2 text-white hover:bg-indigo-600 rounded-full transition'
    >
      <svg
        xmlns='http://www.w3.org/2000/svg'
        className='h-6 w-6'
        fill='none'
        viewBox='0 0 24 24'
        stroke='currentColor'
      >
        <path
          strokeLinecap='round'
          strokeLinejoin='round'
          strokeWidth={2}
          d='M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z'
        />
      </svg>
      {favoriteCount > 0 && (
        <span className='absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-4 w-4 md:h-5 md:w-5 flex items-center justify-center'>
          {favoriteCount > 9 ? '9+' : favoriteCount}
        </span>
      )}
    </NavLink>
  )
  // Render order icon component

  // create an Order icon component
  // {orderCount > 0 && (
  //     <span className='absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-4 w-4 md:h-5 md:w-5 flex items-center justify-center'>
  //       {orderCount > 9 ? '9+' : orderCount}
  //     </span>
  //   )}

  return (
    <header
      className='bg-gradient-to-r from-indigo-700 to-indigo-800 sticky top-0 z-[100] shadow-lg'
      id='home'
    >
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex items-center justify-between h-16'>
          {/* Logo and Mobile Sidebar Toggle */}
          <div className='flex items-center text-white gap-2 sm:gap-3'>
            {user && (
              <button
                onClick={() => setIsSidebarOpen(prev => !prev)}
                className='p-1 rounded-md hover:bg-indigo-600 transition md:hidden'
                aria-label='Toggle sidebar'
              >
                <svg
                  className='h-5 w-5 sm:h-6 sm:w-6'
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M4 6h16M4 12h16M4 18h16'
                  />
                </svg>
              </button>
            )}

            <NavLink
              to='/'
              className='flex items-center text-white font-bold hover:text-indigo-200 transition duration-300'
            >
              <img
                src={logo}
                alt='Shop BD Logo'
                className='h-16 w-36 sm:h-16 sm:w-48 md:h-20 md:w-60'
              />
            </NavLink>
          </div>

          {/* Mobile Right Section */}
          <div className='flex items-center gap-2 md:hidden'>
            {user ? (
              <>
                {/* Mobile Balance for Sellers */}
                {user?.role === 'Seller' && (
                  <div className='text-white bg-indigo-600 px-2 py-1 rounded-md text-xs sm:text-sm'>
                    <span className='hidden sm:inline'>৳</span>
                    <span className='sm:hidden'>৳</span>
                    {Number(user?.balance).toFixed(0)}
                  </div>
                )}

                {/* Mobile User Avatar */}
                <button
                  onClick={toggleDropdown}
                  className='flex items-center text-white hover:bg-indigo-600 p-1 sm:p-2 rounded-md transition'
                >
                  <div className='h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-indigo-500 flex items-center justify-center'>
                    <svg
                      className='h-4 w-4 sm:h-5 sm:w-5'
                      xmlns='http://www.w3.org/2000/svg'
                      fill='none'
                      viewBox='0 0 24 24'
                      stroke='currentColor'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
                      />
                    </svg>
                  </div>
                </button>
              </>
            ) : (
              <>
                {/* Mobile Cart and Favorites for Guest Users */}
                <div className='flex items-center gap-1 sm:gap-2'>
                  <FavoriteIcon />
                  <CartIcon />
                </div>

                {/* Mobile Menu Toggle for Guest Users */}
                <button
                  onClick={toggleMenu}
                  className='text-white hover:bg-indigo-600 p-1 sm:p-2 rounded-md focus:outline-none ml-1'
                  aria-label='Toggle menu'
                >
                  {isMenuOpen ? (
                    <svg
                      className='h-5 w-5 sm:h-6 sm:w-6'
                      xmlns='http://www.w3.org/2000/svg'
                      fill='none'
                      viewBox='0 0 24 24'
                      stroke='currentColor'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M6 18L18 6M6 6l12 12'
                      />
                    </svg>
                  ) : (
                    <svg
                      className='h-5 w-5 sm:h-6 sm:w-6'
                      xmlns='http://www.w3.org/2000/svg'
                      fill='none'
                      viewBox='0 0 24 24'
                      stroke='currentColor'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M4 6h16M4 12h16M4 18h16'
                      />
                    </svg>
                  )}
                </button>
              </>
            )}
          </div>

          {/* Desktop Navigation - Hidden on Mobile */}
          <div className='hidden md:flex items-center space-x-2 lg:space-x-4'>
            {!user ? (
              <>
                {/* Desktop Guest Navigation */}
                <div className='flex items-center space-x-1 lg:space-x-2'>
                  <a
                    href='/#home'
                    className='text-white hover:bg-indigo-600 px-3 py-2 lg:px-4 lg:py-2 rounded-md transition font-medium text-sm lg:text-base'
                  >
                    হোম
                  </a>
                  {customerMode !== true && (
                    <a
                      href='/about-us#about-us'
                      className='text-white hover:bg-indigo-600 px-3 py-2 lg:px-4 lg:py-2 rounded-md transition font-medium text-sm lg:text-base'
                    >
                      আমাদের সম্পর্কে
                    </a>
                  )}
                  <a
                    href='/products#products'
                    className='text-white hover:bg-indigo-600 px-3 py-2 lg:px-4 lg:py-2 rounded-md transition font-medium text-sm lg:text-base'
                  >
                    প্রোডাক্টস
                  </a>
                  <a
                    href='/orders#orders'
                    className='text-white hover:bg-indigo-600 px-3 py-2 lg:px-4 lg:py-2 rounded-md transition font-medium text-sm lg:text-base'
                  >
                    অর্ডারসমূহ
                  </a>

                  {!customerMode && (
                    <>
                      <NavLink
                        to='/login#login'
                        className='text-white hover:bg-indigo-600 px-3 py-2 lg:px-4 lg:py-2 rounded-md transition font-medium text-sm lg:text-base'
                      >
                        লগইন
                      </NavLink>
                      <NavLink
                        to='/register#register'
                        className='text-white hover:bg-indigo-600 px-3 py-2 lg:px-4 lg:py-2 rounded-md transition font-medium text-sm lg:text-base'
                      >
                        রেজিস্ট্রেশন
                      </NavLink>
                    </>
                  )}
                </div>

                {/* Desktop Cart and Favorites */}
                <div className='flex items-center space-x-2 ml-3 lg:ml-4'>
                  <FavoriteIcon />
                  <CartIcon />
                </div>
              </>
            ) : (
              <>
                {/* Desktop Logged-in User Section */}
                <div className='flex items-center space-x-3 lg:space-x-4'>
                  {/* Desktop Balance Display */}
                  {user?.role === 'Seller' && (
                    <div className='text-white bg-indigo-600 px-3 py-1 lg:px-4 lg:py-2 rounded-md text-sm lg:text-base'>
                      <span className='font-medium'>ব্যালেন্স: </span>
                      <span>৳{Number(user?.balance).toFixed(2)}</span>
                    </div>
                  )}

                  {/* Desktop Favorite and Cart Icons */}
                  <div className='flex items-center space-x-2'>
                    <FavoriteIcon />
                    <CartIcon />
                  </div>
                </div>

                {/* Desktop User Dropdown */}
                <div className='relative ml-3 lg:ml-4'>
                  <button
                    onClick={toggleDropdown}
                    className='flex items-center space-x-2 text-white hover:bg-indigo-600 px-3 py-2 rounded-md transition'
                  >
                    <div className='h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center'>
                      <svg
                        className='h-5 w-5'
                        xmlns='http://www.w3.org/2000/svg'
                        fill='none'
                        viewBox='0 0 24 24'
                        stroke='currentColor'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
                        />
                      </svg>
                    </div>
                    <span className='font-medium text-sm lg:text-base hidden lg:inline'>
                      {user.name || 'User'}
                    </span>
                    <svg
                      className={`h-4 w-4 transition-transform ${
                        isDropdownOpen ? 'transform rotate-180' : ''
                      }`}
                      xmlns='http://www.w3.org/2000/svg'
                      fill='none'
                      viewBox='0 0 24 24'
                      stroke='currentColor'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M19 9l-7 7-7-7'
                      />
                    </svg>
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Mobile User Dropdown - Positioned Absolutely */}
          {user && isDropdownOpen && (
            <div className='absolute top-16 right-4 w-60 sm:w-64 bg-white rounded-md shadow-lg z-50 overflow-hidden md:hidden'>
              <div className='px-4 py-3 border-b border-gray-100'>
                <p className='text-sm font-medium text-gray-900 truncate'>{user.name || 'User'}</p>
                {user.email && <p className='text-xs text-gray-500 truncate'>{user.email}</p>}
              </div>
              {user?.role === 'Seller' && (
                <div
                  className={`px-4 py-2 border-b border-gray-100 ${
                    user?.balance >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  <div className='flex justify-between text-xs font-medium'>
                    <span>ব্যালেন্স:</span>
                    <span>৳{Number(user?.balance).toFixed(2)}</span>
                  </div>
                </div>
              )}
              <button
                onClick={handleLogout}
                className='block w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 transition'
              >
                {loading ? loadingText : 'লগআউট'}
              </button>
            </div>
          )}

          {/* Desktop User Dropdown */}
          {user && isDropdownOpen && (
            <div className='absolute top-16 right-4 lg:right-8 w-56 lg:w-64 bg-white rounded-md shadow-lg z-50 overflow-hidden hidden md:block'>
              <div className='px-4 py-3 border-b border-gray-100'>
                <p className='text-sm font-medium text-gray-900'>{user.name || 'User'}</p>
                {user?.email && <p className='text-xs text-gray-500'>{user.email}</p>}
              </div>
              {user?.role === 'Seller' && (
                <div className='px-4 py-2 border-b border-gray-100'>
                  <p
                    className={`text-xs font-bold ${
                      user?.balance >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    ব্যালেন্স: ৳{Number(user?.balance).toFixed(2)}
                  </p>
                </div>
              )}
              <button
                onClick={handleLogout}
                className='block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 transition'
              >
                {loading ? loadingText : 'লগআউট'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && !user && (
        <div className='md:hidden bg-gradient-to-b from-indigo-700 to-indigo-800'>
          <div className='px-2 pt-2 pb-3 space-y-1 sm:px-3'>
            <NavLink
              to='/#home'
              className='block px-3 py-2 rounded-md text-white font-medium hover:bg-indigo-600 transition'
              onClick={toggleMenu}
            >
              হোম
            </NavLink>
            {customerMode === true || (
              <NavLink
                to='/about-us#about-us'
                className='block px-3 py-2 rounded-md text-white font-medium hover:bg-indigo-600 transition'
                onClick={toggleMenu}
              >
                আমাদের সম্পর্কে
              </NavLink>
            )}
            <NavLink
              to='/products#products'
              className='block px-3 py-2 rounded-md text-white font-medium hover:bg-indigo-600 transition'
              onClick={toggleMenu}
            >
              প্রোডাক্টস
            </NavLink>
            <NavLink
              to='/orders#orders'
              className='block px-3 py-2 rounded-md text-white font-medium hover:bg-indigo-600 transition'
              onClick={toggleMenu}
            >
              অর্ডারসমূহ
            </NavLink>

            {!customerMode && (
              <>
                <NavLink
                  to='/login#login'
                  className='block px-3 py-2 rounded-md text-white font-medium hover:bg-indigo-600 transition'
                  onClick={toggleMenu}
                >
                  লগইন
                </NavLink>
                <NavLink
                  to='/register#register'
                  className='block px-3 py-2 rounded-md text-white font-medium hover:bg-indigo-600 transition'
                  onClick={toggleMenu}
                >
                  রেজিস্ট্রেশন
                </NavLink>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}

export default Header
