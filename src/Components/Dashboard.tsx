// DashboardLayout.tsx — BazaarHub Design System
// Design tokens: --navy: #1a1a2e  --rose: #e94560  --cream: #f7f6f3
//
// Layout rules:
// • Sidebar: fixed overlay drawer on mobile, sticky column on lg+
// • Sidebar scrolls independently via overflow-y-auto — never touches main
// • Main content: zero wrapping, zero extra padding — pages render exactly standalone
// • min-w-0 on main prevents flex overflow on narrow viewports

import { ReactNode, useContext, useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { logout } from '../Api/auth.api'
import { UserContext } from '../Context/userContext'
import { useAuth } from '../Hooks/useAuth'
import Header from './Header'

/* ════════════════════════════════
   Nav building blocks
════════════════════════════════ */

const NavItem = ({
  to,
  icon,
  label,
  onClick,
}: {
  to: string
  icon: React.ReactNode
  label: string
  onClick: () => void
}) => (
  <NavLink
    to={to}
    onClick={onClick}
    className={({ isActive }) =>
      `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[13px] font-medium transition-all duration-150 ${
        isActive
          ? 'bg-[#e94560] text-white shadow-[0_4px_12px_rgba(233,69,96,0.3)]'
          : 'text-white/50 hover:bg-white/8 hover:text-white'
      }`
    }
  >
    <span className='h-4 w-4 shrink-0 [&>svg]:h-4 [&>svg]:w-4'>{icon}</span>
    {label}
  </NavLink>
)

const AccordionGroup = ({
  icon,
  label,
  isOpen,
  onToggle,
  children,
}: {
  icon: React.ReactNode
  label: string
  isOpen: boolean
  onToggle: () => void
  children: React.ReactNode
}) => (
  <div>
    <button
      onClick={onToggle}
      className='flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-[13px] font-medium text-white/50 transition hover:bg-white/8 hover:text-white'
    >
      <div className='flex items-center gap-3'>
        <span className='h-4 w-4 shrink-0 [&>svg]:h-4 [&>svg]:w-4'>{icon}</span>
        {label}
      </div>
      <svg
        className={`h-3.5 w-3.5 text-white/25 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        fill='none'
        stroke='currentColor'
        viewBox='0 0 24 24'
      >
        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
      </svg>
    </button>
    {isOpen && (
      <div className='ml-7 mt-0.5 space-y-0.5 border-l border-white/[0.07] pl-3'>{children}</div>
    )}
  </div>
)

const SubNavItem = ({ to, label, onClick }: { to: string; label: string; onClick: () => void }) => (
  <NavLink
    to={to}
    onClick={onClick}
    className={({ isActive }) =>
      `block rounded-lg px-3 py-2 text-[12px] font-medium transition-all ${
        isActive
          ? 'bg-[#e94560]/15 text-[#e94560]'
          : 'text-white/35 hover:bg-white/6 hover:text-white/65'
      }`
    }
  >
    {label}
  </NavLink>
)

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <p className='mb-1.5 mt-4 px-3.5 text-[10px] font-semibold uppercase tracking-[0.7px] text-white/20 first:mt-0'>
    {children}
  </p>
)

/* ════════════════════════════════
   Icons
════════════════════════════════ */
const I = {
  home: (
    <svg fill='none' stroke='currentColor' viewBox='0 0 24 24'>
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth={2}
        d='M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6'
      />
    </svg>
  ),
  profile: (
    <svg fill='none' stroke='currentColor' viewBox='0 0 24 24'>
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth={2}
        d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
      />
    </svg>
  ),
  products: (
    <svg fill='none' stroke='currentColor' viewBox='0 0 24 24'>
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth={2}
        d='M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4'
      />
    </svg>
  ),
  favorites: (
    <svg fill='none' stroke='currentColor' viewBox='0 0 24 24'>
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth={2}
        d='M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z'
      />
    </svg>
  ),
  cart: (
    <svg fill='none' stroke='currentColor' viewBox='0 0 24 24'>
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth={2}
        d='M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z'
      />
    </svg>
  ),
  orders: (
    <svg fill='none' stroke='currentColor' viewBox='0 0 24 24'>
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth={2}
        d='M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'
      />
    </svg>
  ),
  withdraw: (
    <svg fill='none' stroke='currentColor' viewBox='0 0 24 24'>
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth={2}
        d='M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
      />
    </svg>
  ),
  payment: (
    <svg fill='none' stroke='currentColor' viewBox='0 0 24 24'>
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth={2}
        d='M3 7h18M3 12h18m-7 5h7'
      />
    </svg>
  ),
  referral: (
    <svg fill='none' stroke='currentColor' viewBox='0 0 24 24'>
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth={2}
        d='M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z'
      />
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth={2}
        d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
      />
    </svg>
  ),
  users: (
    <svg fill='none' stroke='currentColor' viewBox='0 0 24 24'>
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth={2}
        d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z'
      />
    </svg>
  ),
  balance: (
    <svg fill='none' stroke='currentColor' viewBox='0 0 24 24'>
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth={2}
        d='M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
      />
    </svg>
  ),
  password: (
    <svg fill='none' stroke='currentColor' viewBox='0 0 24 24'>
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth={2}
        d='M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z'
      />
    </svg>
  ),
  support: (
    <svg fill='none' stroke='currentColor' viewBox='0 0 24 24'>
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth={2}
        d='M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z'
      />
    </svg>
  ),
  logout: (
    <svg fill='none' stroke='currentColor' viewBox='0 0 24 24'>
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth={2}
        d='M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1'
      />
    </svg>
  ),
}

/* ════════════════════════════════
   Sidebar inner — extracted so it
   can't accidentally influence layout
════════════════════════════════ */
const SidebarInner = ({
  user,
  openAccordions,
  toggleAccordion,
  handleLogout,
  closeSidebar,
}: {
  user: any
  openAccordions: Record<string, boolean>
  toggleAccordion: (k: string) => void
  handleLogout: () => void
  closeSidebar: () => void
}) => (
  /* This div is the flex column that fills the aside.
     overflow-y-auto is here, not on the aside, so the
     brand strip stays pinned at the bottom. */
  <div className='relative flex h-full flex-col bg-[#1a1a2e]'>
    {/* Accent line */}
    <div className='absolute left-0 right-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#e94560]/60 to-transparent' />

    {/* User card — never scrolls away */}
    <div className='shrink-0 border-b border-white/[0.06] p-4'>
      <div className='flex items-center gap-3'>
        <div className='relative h-10 w-10 shrink-0 overflow-hidden rounded-2xl bg-gradient-to-br from-[#e94560] to-[#ff6b6b]'>
          {user?.profileImage ? (
            <img src={user.profileImage} alt='Profile' className='h-full w-full object-cover' />
          ) : (
            <span className='flex h-full w-full items-center justify-center text-sm font-bold text-white'>
              {user?.name?.charAt(0).toUpperCase()}
            </span>
          )}
          <span className='absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-[#1a1a2e] bg-emerald-400' />
        </div>
        <div className='min-w-0 flex-1'>
          <p className='truncate text-[13px] font-semibold text-white'>{user?.name}</p>
          <div className='mt-0.5 flex flex-wrap items-center gap-1'>
            <span className='rounded-full bg-[#e94560]/15 px-2 py-0.5 text-[10px] font-semibold text-[#e94560]'>
              {user?.role}
            </span>
            {user?.isVerified && (
              <span className='rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-400'>
                ভেরিফাইড
              </span>
            )}
          </div>
        </div>
      </div>
      {user?.role === 'Seller' && (
        <div className='mt-3 flex items-center justify-between rounded-xl border border-emerald-500/15 bg-emerald-500/8 px-3 py-2'>
          <span className='text-[11px] text-white/35'>ব্যালেন্স</span>
          <span className='text-[14px] font-bold text-emerald-400'>
            ৳{Number(user?.balance).toFixed(2)}
          </span>
        </div>
      )}
    </div>

    {/* Scrollable nav area */}
    <nav className='flex-1 overflow-y-auto px-2.5 py-3 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10'>
      <SectionLabel>মেনু</SectionLabel>
      <NavItem to='/home' icon={I.home} label='হোম' onClick={closeSidebar} />
      <NavItem to='/profile' icon={I.profile} label='প্রোফাইল' onClick={closeSidebar} />
      <NavItem
        to='/products#products'
        icon={I.products}
        label='সকল প্রোডাক্টস'
        onClick={closeSidebar}
      />
      <NavItem
        to='/favorites'
        icon={I.favorites}
        label='ফেভরিট প্রোডাক্টস'
        onClick={closeSidebar}
      />
      <NavItem to='/cart' icon={I.cart} label='কার্ট' onClick={closeSidebar} />
      <NavItem to='/orders' icon={I.orders} label='অর্ডার' onClick={closeSidebar} />

      <div className='my-2 border-t border-white/[0.05]' />
      <SectionLabel>অর্থ</SectionLabel>

      <AccordionGroup
        icon={I.withdraw}
        label='টাকা উত্তোলন'
        isOpen={openAccordions.withdraw}
        onToggle={() => toggleAccordion('withdraw')}
      >
        <SubNavItem to='/add-wallet' label='ওয়ালেট যোগ করুন' onClick={closeSidebar} />
        <SubNavItem to='/request-withdraw' label='উত্তোলন করুন' onClick={closeSidebar} />
        <SubNavItem to='/withdraw-history' label='উত্তোলনের হিস্ট্রি' onClick={closeSidebar} />
      </AccordionGroup>

      <NavItem
        to='/payment-history'
        icon={I.payment}
        label='পেমেন্ট হিস্ট্রি'
        onClick={closeSidebar}
      />
      <NavItem
        to='/balance-statement'
        icon={I.balance}
        label='ব্যালেন্স স্টেটমেন্ট'
        onClick={closeSidebar}
      />

      {user?.isVerified && (
        <>
          <div className='my-2 border-t border-white/[0.05]' />
          <SectionLabel>রেফারেল</SectionLabel>

          <NavItem
            to='/add-referral-code'
            icon={I.referral}
            label='রেফারেল কোড শেয়ার'
            onClick={closeSidebar}
          />

          <AccordionGroup
            icon={I.users}
            label='সেলার রেফারেল'
            isOpen={openAccordions['seller-referral']}
            onToggle={() => toggleAccordion('seller-referral')}
          >
            <SubNavItem to='/seller-referrals' label='রেফার্ড সেলার' onClick={closeSidebar} />
            <SubNavItem to='/seller-referral-orders' label='সেলার অর্ডার' onClick={closeSidebar} />
          </AccordionGroup>

          <AccordionGroup
            icon={I.users}
            label='কাস্টমার রেফারেল'
            isOpen={openAccordions['customer-referral']}
            onToggle={() => toggleAccordion('customer-referral')}
          >
            <SubNavItem to='/customer-referrals' label='রেফার্ড কাস্টমার' onClick={closeSidebar} />
            <SubNavItem
              to='/customer-referral-orders'
              label='কাস্টমার অর্ডার'
              onClick={closeSidebar}
            />
          </AccordionGroup>
        </>
      )}

      <div className='my-2 border-t border-white/[0.05]' />
      <SectionLabel>সেটিংস</SectionLabel>

      <NavItem
        to='/change-password'
        icon={I.password}
        label='পাসওয়ার্ড পরিবর্তন'
        onClick={closeSidebar}
      />
      <NavItem
        to='/support-tickets'
        icon={I.support}
        label='সাপোর্ট টিকিট'
        onClick={closeSidebar}
      />

      <button
        onClick={handleLogout}
        className='mt-1 flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-[13px] font-medium text-white/35 transition hover:bg-red-500/10 hover:text-red-400'
      >
        <span className='h-4 w-4 shrink-0 [&>svg]:h-4 [&>svg]:w-4'>{I.logout}</span>
        লগ আউট
      </button>

      {/* Breathing room at the bottom of the scroll area */}
      <div className='h-2' />
    </nav>

    {/* Brand strip — never scrolls away */}
    {/* <div className='shrink-0 border-t border-white/[0.06] px-4 py-3'>
      <div className='flex items-center gap-2'>
        <div className='flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-[#e94560] to-[#ff6b6b]'>
          <span className='font-serif text-[11px] font-bold text-white'>B</span>
        </div>
        <span className='font-serif text-[13px] font-semibold text-white/50'>
          বাজার<span className='font-normal text-white/25'>Hub</span>
        </span>
      </div>
    </div> */}
  </div>
)

/* ════════════════════════════════
   Root layout
════════════════════════════════ */
const DashboardLayout = ({ children }: { children: ReactNode }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [openAccordions, setOpenAccordions] = useState<Record<string, boolean>>({
    withdraw: false,
    'seller-referral': false,
    'customer-referral': false,
  })

  const userContext = useContext(UserContext)
  const user = userContext ? userContext.user : null
  const { setUser } = useAuth()
  const navigate = useNavigate()

  const toggleAccordion = (key: string) =>
    setOpenAccordions(prev => ({ ...prev, [key]: !prev[key] }))

  const handleLogout = async () => {
    const { success } = await logout()
    if (success) {
      localStorage.removeItem('token')
      if (setUser) setUser(null)
      navigate('/')
    }
  }

  const closeSidebar = () => setIsSidebarOpen(false)

  return (
    /*
     * The outermost div just provides the cream background.
     * It does NOT set any height or overflow that could trap
     * content inside a nested scroll container.
     */
    <div className='bg-[#f7f6f3]'>
      {/* Fixed top bar — always 64px */}
      <Header setIsSidebarOpen={setIsSidebarOpen} isSidebarOpen={isSidebarOpen} />

      {user ? (
        /*
         * Shell below the header.
         *
         * — pt-16 offsets the fixed header so content starts below it.
         * — flex row: [sidebar] [main]
         * — The aside is sticky on desktop so it travels with the page scroll.
         *   On mobile it is a fixed overlay (z-50), so it never participates
         *   in document flow and can never push or shrink <main>.
         */
        <div className='flex min-h-screen pt-16'>
          {/* Mobile backdrop */}
          {isSidebarOpen && (
            <div
              aria-hidden
              className='fixed inset-0 z-40 bg-[#1a1a2e]/60 backdrop-blur-sm lg:hidden'
              onClick={closeSidebar}
            />
          )}

          {/*
           * SIDEBAR
           *
           * Mobile  — fixed, full-height below header, slides in/out.
           *           Completely outside normal flow → cannot affect <main> width.
           *
           * Desktop — sticky so it scrolls with the page but stays in view.
           *           h-[calc(100vh-64px)] keeps it within the viewport.
           *           overflow-hidden on the aside + flex-col on the inner div
           *           means only the <nav> inside scrolls.
           */}
          <aside
            style={{ width: 264 }}
            className={`
              fixed top-16 left-0 z-50 h-[calc(100dvh-64px)]
              transform transition-transform duration-300 ease-in-out
              ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
              lg:sticky lg:top-16 lg:translate-x-0 lg:h-[calc(100vh-64px)]
              lg:shrink-0 lg:self-start
              overflow-hidden
            `}
          >
            <SidebarInner
              user={user}
              openAccordions={openAccordions}
              toggleAccordion={toggleAccordion}
              handleLogout={handleLogout}
              closeSidebar={closeSidebar}
            />
          </aside>

          {/*
           * MAIN CONTENT
           *
           * min-w-0  — prevents flex children from overflowing on narrow screens.
           * flex-1   — takes all remaining horizontal space.
           * NO additional wrapper div, NO padding, NO border-radius card.
           * Each page (Cart, ProductDetail, etc.) owns its own layout completely.
           */}
          <main className='min-w-0 flex-1'>{children || <Outlet />}</main>
        </div>
      ) : (
        /* Unauthenticated users: header offset only, full-width content */
        <div className='pt-16'>
          <Outlet />
        </div>
      )}
    </div>
  )
}

export default DashboardLayout
