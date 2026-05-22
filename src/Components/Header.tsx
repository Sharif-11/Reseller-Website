// Header.tsx — Redesigned to match BazaarHub design system
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import {
  FaBars,
  FaChevronDown,
  FaHeart,
  FaShoppingCart,
  FaSignOutAlt,
  FaTimes,
  FaWallet,
} from 'react-icons/fa'
import { NavLink, useNavigate } from 'react-router-dom'
import { logout } from '../Api/auth.api'
import logo from '../assets/sbr.png'
import { useCartFavorite } from '../Context/cartContext'
import { useAuth } from '../Hooks/useAuth'
import { loadingText } from '../utils/utils.variables'

/* ─── Design tokens (match ProductList + HomeIntroduction) ─── */
// --navy: #1a1a2e  --rose: #e94560  --cream: #f7f6f3

const Header = ({
  isSidebarOpen,
  setIsSidebarOpen,
}: {
  isSidebarOpen: boolean
  setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const { user, setUser, customerMode } = useAuth()
  const { cartCount, favoriteCount } = useCartFavorite()

  /* ── Scroll to top helper (instant, no animation) ── */
  const scrollToTop = () => {
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    })
  }

  /* ── Logout ── */
  const handleLogout = async () => {
    setLoading(true)
    const { success } = await logout()
    if (success) {
      localStorage.removeItem('token')
      if (setUser) setUser(null)
      navigate('/')
      scrollToTop() // also scroll to top after logout navigation
    }
    setLoading(false)
  }

  /* ── Close dropdown on outside click ── */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  /* ── Mutual exclusion: sidebar ↔ dropdown ── */
  useEffect(() => {
    if (isDropdownOpen) setIsSidebarOpen(false)
    if (isSidebarOpen) setIsDropdownOpen(false)
  }, [isDropdownOpen, isSidebarOpen])

  /* ── Nav links ── */
  const navLinks = [
    { to: '/', label: 'হোম' },
    ...(customerMode !== true ? [{ to: '/about-us', label: 'আমাদের সম্পর্কে' }] : []),
    { to: '/products', label: 'প্রোডাক্টস' },
    { to: '/orders', label: 'অর্ডারসমূহ' },
  ]

  /* ── Sub-components ── */
  const UserAvatar = ({ size = 'sm' }: { size?: 'sm' | 'md' }) => {
    const dims = size === 'sm' ? 'h-8 w-8 text-sm' : 'h-10 w-10 text-base'
    if (user?.profileImage) {
      return (
        <img
          src={user.profileImage}
          alt={user.name || 'User'}
          className={`rounded-xl object-cover ring-2 ring-white/10 ${dims}`}
        />
      )
    }
    return (
      <div
        className={`rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-semibold text-white ${dims}`}
      >
        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
      </div>
    )
  }

  const NavBadge = ({ count }: { count: number }) =>
    count > 0 ? (
      <motion.span
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className='absolute -right-1 -top-1 flex h-[17px] min-w-[17px] items-center justify-center rounded-full border-2 border-[#1a1a2e] bg-[#e94560] px-0.5 text-[9px] font-bold text-white'
      >
        {count > 9 ? '9+' : count}
      </motion.span>
    ) : null

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `relative px-3 py-2 text-[11px] font-medium uppercase tracking-[0.7px] rounded-lg transition-all duration-200 ${
      isActive ? 'text-white bg-white/8' : 'text-white/60 hover:text-white hover:bg-white/8'
    }`

  const mobileNavLinkClass = ({ isActive }: { isActive: boolean }) =>
    `block px-4 py-3 text-[13px] font-medium uppercase tracking-wider transition-all duration-200 ${
      isActive ? 'text-white bg-white/10' : 'text-white/65 hover:text-white hover:bg-white/6'
    }`

  /* ── Active underline ── */
  const ActiveBar = ({ isActive }: { isActive: boolean }) =>
    isActive ? (
      <motion.span
        layoutId='activeNav'
        className='absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-[#e94560]'
        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
      />
    ) : null

  return (
    <>
      {/* ════ HEADER ════ */}
      <header className='fixed left-0 right-0 top-0 z-50 border-b border-white/[0.06] bg-[#1a1a2e]'>
        {/* Top rose accent line */}
        <div className='absolute left-0 right-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#e94560]/60 to-transparent' />

        <div className='mx-auto flex h-16 max-w-screen-xl items-center justify-between px-4 sm:px-6 lg:h-[68px] lg:px-8'>
          {/* ── Logo ── */}
          <div className='flex items-center gap-3'>
            {user && (
              <motion.button
                whileTap={{ scale: 0.93 }}
                onClick={() => setIsSidebarOpen(prev => !prev)}
                className='flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/6 text-white/60 transition hover:bg-white/12 hover:text-white lg:hidden'
              >
                <FaBars className='h-4 w-4' />
              </motion.button>
            )}

            <NavLink to='/' onClick={scrollToTop} className='flex items-center'>
              <img
                src={logo}
                alt='BazaarHub'
                className='h-12 w-auto object-contain transition duration-200 hover:opacity-80'
                style={{ background: 'transparent' }}
              />
            </NavLink>
          </div>

          {/* ── Desktop nav ── */}
          <nav className='hidden items-center gap-0.5 lg:flex'>
            {navLinks.map(link => (
              <NavLink key={link.to} to={link.to} onClick={scrollToTop} className={navLinkClass}>
                {({ isActive }) => (
                  <>
                    {link.label}
                    <ActiveBar isActive={isActive} />
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* ── Right actions ── */}
          <div className='flex items-center gap-2'>
            {!user ? (
              /* Guest actions */
              <>
                <NavLink
                  to='/favorites'
                  onClick={scrollToTop}
                  className='relative flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/6 text-white/70 transition hover:bg-white/12 hover:text-white'
                >
                  <FaHeart className='h-4 w-4' />
                  <NavBadge count={favoriteCount} />
                </NavLink>
                <NavLink
                  to='/cart'
                  onClick={scrollToTop}
                  className='relative flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/6 text-white/70 transition hover:bg-white/12 hover:text-white'
                >
                  <FaShoppingCart className='h-4 w-4' />
                  <NavBadge count={cartCount} />
                </NavLink>

                {/* Desktop login/register */}
                {!customerMode && (
                  <div className='ml-1 hidden items-center gap-2 lg:flex'>
                    <NavLink
                      to='/login'
                      onClick={scrollToTop}
                      className='px-4 py-2 text-[13px] font-medium text-white/65 transition hover:text-white'
                    >
                      লগইন
                    </NavLink>
                    <NavLink
                      to='/register'
                      onClick={scrollToTop}
                      className='rounded-lg bg-[#e94560] px-4 py-2 text-[13px] font-semibold text-white shadow-sm transition hover:bg-[#c73652] active:scale-95'
                    >
                      রেজিস্ট্রেশন
                    </NavLink>
                  </div>
                )}

                {/* Mobile hamburger */}
                <motion.button
                  whileTap={{ scale: 0.93 }}
                  onClick={() => setIsMobileMenuOpen(prev => !prev)}
                  className='flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/6 text-white/70 transition hover:bg-white/12 hover:text-white lg:hidden'
                >
                  {isMobileMenuOpen ? (
                    <FaTimes className='h-4 w-4' />
                  ) : (
                    <FaBars className='h-4 w-4' />
                  )}
                </motion.button>
              </>
            ) : (
              /* Authenticated actions */
              <>
                {/* Seller balance */}
                {user?.role === 'Seller' && (
                  <div className='hidden items-center gap-2 rounded-lg border border-white/10 bg-white/6 px-3 py-1.5 md:flex'>
                    <FaWallet className='h-3.5 w-3.5 text-emerald-400' />
                    <span className='text-[13px] font-medium text-white'>
                      ৳{Number(user?.balance).toFixed(2)}
                    </span>
                  </div>
                )}

                {/* Favorites + Cart (desktop only) */}
                <div className='hidden items-center gap-1.5 lg:flex'>
                  <NavLink
                    to='/favorites'
                    onClick={scrollToTop}
                    className='relative flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/6 text-white/70 transition hover:bg-white/12 hover:text-white'
                  >
                    <FaHeart className='h-4 w-4' />
                    <NavBadge count={favoriteCount} />
                  </NavLink>
                  <NavLink
                    to='/cart'
                    onClick={scrollToTop}
                    className='relative flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/6 text-white/70 transition hover:bg-white/12 hover:text-white'
                  >
                    <FaShoppingCart className='h-4 w-4' />
                    <NavBadge count={cartCount} />
                  </NavLink>
                </div>

                {/* User dropdown */}
                <div className='relative' ref={dropdownRef}>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsDropdownOpen(prev => !prev)}
                    className='flex items-center gap-2 rounded-lg border border-white/10 bg-white/6 p-1.5 pr-3 text-white/80 transition hover:bg-white/12 hover:text-white'
                  >
                    <UserAvatar size='sm' />
                    <span className='hidden max-w-[100px] truncate text-[13px] font-medium lg:block'>
                      {user.name || 'User'}
                    </span>
                    <FaChevronDown
                      className={`hidden h-2.5 w-2.5 text-white/40 transition-transform duration-200 lg:block ${
                        isDropdownOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </motion.button>

                  <AnimatePresence>
                    {isDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.96 }}
                        transition={{ duration: 0.15 }}
                        className='absolute right-0 top-full mt-2 w-60 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-2xl'
                      >
                        {/* User info */}
                        <div className='flex items-center gap-3 border-b border-gray-50 bg-[#f7f6f3] px-4 py-3'>
                          <UserAvatar size='md' />
                          <div className='min-w-0 flex-1'>
                            <p className='truncate text-[13px] font-semibold text-gray-900'>
                              {user.name || 'User'}
                            </p>
                            {user.email && (
                              <p className='truncate text-[11px] text-gray-400'>{user.email}</p>
                            )}
                          </div>
                        </div>

                        {/* Seller balance row */}
                        {user?.role === 'Seller' && (
                          <div className='flex items-center justify-between border-b border-gray-50 bg-emerald-50/60 px-4 py-2.5'>
                            <div className='flex items-center gap-1.5'>
                              <FaWallet className='h-3 w-3 text-emerald-500' />
                              <span className='text-[12px] text-gray-500'>ব্যালেন্স</span>
                            </div>
                            <span className='text-[13px] font-bold text-emerald-600'>
                              ৳{Number(user?.balance).toFixed(2)}
                            </span>
                          </div>
                        )}

                        {/* Logout */}
                        <button
                          onClick={handleLogout}
                          className='flex w-full items-center gap-3 px-4 py-3 text-left text-[13px] font-medium text-red-500 transition hover:bg-red-50'
                        >
                          <FaSignOutAlt className='h-3.5 w-3.5' />
                          {loading ? loadingText : 'লগআউট'}
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ════ MOBILE MENU (guest only) ════ */}
      <AnimatePresence>
        {isMobileMenuOpen && !user && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
            className='fixed left-0 right-0 top-16 z-40 border-b border-white/10 bg-[#1a1a2e] lg:hidden'
          >
            <div className='mx-auto max-w-screen-xl px-4 py-3'>
              <nav className='flex flex-col'>
                {navLinks.map(link => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    onClick={() => {
                      setIsMobileMenuOpen(false)
                      scrollToTop()
                    }}
                    className={mobileNavLinkClass}
                  >
                    {link.label}
                  </NavLink>
                ))}
              </nav>

              {!customerMode && (
                <div className='mt-3 flex flex-col gap-2 border-t border-white/10 pt-3'>
                  <NavLink
                    to='/login'
                    onClick={() => {
                      setIsMobileMenuOpen(false)
                      scrollToTop()
                    }}
                    className='rounded-lg border border-white/10 py-2.5 text-center text-[13px] font-medium text-white/70 transition hover:bg-white/6 hover:text-white'
                  >
                    লগইন
                  </NavLink>
                  <NavLink
                    to='/register'
                    onClick={() => {
                      setIsMobileMenuOpen(false)
                      scrollToTop()
                    }}
                    className='rounded-lg bg-[#e94560] py-2.5 text-center text-[13px] font-semibold text-white transition hover:bg-[#c73652]'
                  >
                    রেজিস্ট্রেশন
                  </NavLink>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default Header
