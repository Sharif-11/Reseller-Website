import { ReactNode, useContext, useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { logout } from '../Api/auth.api'
import { UserContext } from '../Context/userContext'
import { useAuth } from '../Hooks/useAuth'
import Header from './Header'

const DashboardLayout = ({ children }: { children: ReactNode }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [openAccordions, setOpenAccordions] = useState<Record<string, boolean>>({
    withdraw: false,
  })
  const userContext = useContext(UserContext)
  const user = userContext ? userContext.user : null
  const { setUser } = useAuth()
  const navigate = useNavigate()

  const toggleAccordion = (key: string) => {
    setOpenAccordions(prev => ({
      ...prev,
      [key]: !prev[key],
    }))
  }
  const handleLogout = async () => {
    const { success } = await logout()
    if (success) {
      localStorage.removeItem('token')
      if (setUser) setUser(null)
      navigate('/')
    }
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <Header setIsSidebarOpen={setIsSidebarOpen} isSidebarOpen={isSidebarOpen} />

      {user ? (
        <div className='flex h-full'>
          {/* Sidebar */}

          <aside
            className={`
    fixed md:relative w-64 bg-gradient-to-b from-indigo-700 to-indigo-800
    text-white shadow-xl transform transition-transform duration-300 ease-in-out
    ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
    z-50 flex flex-col h-[calc(100vh-64px)] md:h-auto
  `}
          >
            <div className='p-4 border-b border-indigo-600'>
              <div className='flex items-center space-x-3'>
                <div className='h-10 w-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold'>
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className='font-medium'>{user?.name}</p>
                  <p className='text-xs text-indigo-200'>{user?.role}</p>
                </div>
              </div>
            </div>

            <nav className='flex-1 overflow-y-auto p-4 space-y-1'>
              <NavLink
                to='/home'
                className={({ isActive }) => `
                  flex items-center px-4 py-3 rounded-lg transition-all
                  ${
                    isActive ? 'bg-indigo-600 text-white' : 'text-indigo-100 hover:bg-indigo-600/50'
                  }
                `}
                onClick={() => setIsSidebarOpen(false)}
              >
                <svg className='w-5 h-5 mr-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6'
                  />
                </svg>
                হোম
              </NavLink>

              <NavLink
                to='/profile'
                className={({ isActive }) => `
                  flex items-center px-4 py-3 rounded-lg transition-all
                  ${
                    isActive ? 'bg-indigo-600 text-white' : 'text-indigo-100 hover:bg-indigo-600/50'
                  }
                `}
                onClick={() => setIsSidebarOpen(false)}
              >
                <svg className='w-5 h-5 mr-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
                  />
                </svg>
                প্রোফাইল
              </NavLink>

              {/* Standalone Products Link */}
              <NavLink
                to='/products'
                className={({ isActive }) => `
                  flex items-center px-4 py-3 rounded-lg transition-all
                  ${
                    isActive ? 'bg-indigo-600 text-white' : 'text-indigo-100 hover:bg-indigo-600/50'
                  }
                `}
                onClick={() => setIsSidebarOpen(false)}
              >
                <svg className='w-5 h-5 mr-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4'
                  />
                </svg>
                সকল প্রোডাক্টস
              </NavLink>

              {/* Standalone Favorites Link */}
              <NavLink
                to='/favorites'
                className={({ isActive }) => `
                  flex items-center px-4 py-3 rounded-lg transition-all
                  ${
                    isActive ? 'bg-indigo-600 text-white' : 'text-indigo-100 hover:bg-indigo-600/50'
                  }
                `}
                onClick={() => setIsSidebarOpen(false)}
              >
                <svg className='w-5 h-5 mr-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z'
                  />
                </svg>
                ফেভরিট প্রোডাক্টস
              </NavLink>

              <NavLink
                to='/cart'
                className={({ isActive }) => `
                  flex items-center px-4 py-3 rounded-lg transition-all
                  ${
                    isActive ? 'bg-indigo-600 text-white' : 'text-indigo-100 hover:bg-indigo-600/50'
                  }
                `}
                onClick={() => setIsSidebarOpen(false)}
              >
                <svg className='w-5 h-5 mr-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z'
                  />
                </svg>
                কার্ট
              </NavLink>
              <NavLink
                to='/orders'
                className={({ isActive }) => `
                  flex items-center px-4 py-3 rounded-lg transition-all
                  ${
                    isActive ? 'bg-indigo-600 text-white' : 'text-indigo-100 hover:bg-indigo-600/50'
                  }
                `}
                onClick={() => setIsSidebarOpen(false)}
              >
                <svg className='w-5 h-5 mr-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'
                  />
                </svg>
                অর্ডার
              </NavLink>

              {/* Withdraw Accordion */}
              <div className='border-b border-indigo-600/30 pb-1'>
                <button
                  onClick={() => toggleAccordion('withdraw')}
                  className='w-full flex items-center justify-between px-4 py-3 text-indigo-100 hover:bg-indigo-600/30 rounded-lg transition-all'
                >
                  <div className='flex items-center'>
                    <svg
                      className='w-5 h-5 mr-3'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                      />
                    </svg>
                    টাকা উত্তোলন
                  </div>
                  <svg
                    className={`w-4 h-4 transition-transform duration-200 ${
                      openAccordions.withdraw ? 'transform rotate-180' : ''
                    }`}
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M19 9l-7 7-7-7'
                    />
                  </svg>
                </button>

                {openAccordions.withdraw && (
                  <div className='ml-8 mt-1 space-y-1'>
                    <NavLink
                      to='/add-wallet'
                      className={({ isActive }) => `
                        flex items-center px-3 py-2 rounded-lg text-sm transition-all
                        ${
                          isActive
                            ? 'bg-indigo-600 text-white'
                            : 'text-indigo-100 hover:bg-indigo-600/30'
                        }
                      `}
                      onClick={() => setIsSidebarOpen(false)}
                    >
                      ওয়ালেট যোগ করুন
                    </NavLink>
                    <NavLink
                      to='/request-withdraw'
                      className={({ isActive }) => `
                        flex items-center px-3 py-2 rounded-lg text-sm transition-all
                        ${
                          isActive
                            ? 'bg-indigo-600 text-white'
                            : 'text-indigo-100 hover:bg-indigo-600/30'
                        }
                      `}
                      onClick={() => setIsSidebarOpen(false)}
                    >
                      উত্তোলন করুন
                    </NavLink>
                    <NavLink
                      to='/withdraw-history'
                      className={({ isActive }) => `
                        flex items-center px-3 py-2 rounded-lg text-sm transition-all
                        ${
                          isActive
                            ? 'bg-indigo-600 text-white'
                            : 'text-indigo-100 hover:bg-indigo-600/30'
                        }
                      `}
                      onClick={() => setIsSidebarOpen(false)}
                    >
                      উত্তোলনের হিস্ট্রি
                    </NavLink>
                  </div>
                )}
              </div>

              <NavLink
                to='/payment-history'
                className={({ isActive }) => `
                  flex items-center px-4 py-3 rounded-lg transition-all
                  ${
                    isActive ? 'bg-indigo-600 text-white' : 'text-indigo-100 hover:bg-indigo-600/50'
                  }
                `}
                onClick={() => setIsSidebarOpen(false)}
              >
                <svg className='w-5 h-5 mr-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M3 7h18M3 12h18m-7 5h7'
                  />
                </svg>
                পেমেন্ট হিস্ট্রি
              </NavLink>
              <NavLink
                to='/balance-statement'
                className={({ isActive }) => `
                  flex items-center px-4 py-3 rounded-lg transition-all
                  ${
                    isActive ? 'bg-indigo-600 text-white' : 'text-indigo-100 hover:bg-indigo-600/50'
                  }
                `}
                onClick={() => setIsSidebarOpen(false)}
              >
                <svg className='w-5 h-5 mr-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                  />
                </svg>
                ব্যালেন্স স্টেটমেন্ট
              </NavLink>

              {user?.isVerified && (
                <NavLink
                  to='/add-referral-code'
                  className={({ isActive }) => `
                    flex items-center px-4 py-3 rounded-lg transition-all
                    ${
                      isActive
                        ? 'bg-indigo-600 text-white'
                        : 'text-indigo-100 hover:bg-indigo-600/50'
                    }
                  `}
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <svg
                    className='w-5 h-5 mr-3'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
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
                  রেফারেল কোড যোগ করুন
                </NavLink>
              )}

              <NavLink
                to='/change-password'
                className={({ isActive }) => `
                  flex items-center px-4 py-3 rounded-lg transition-all
                  ${
                    isActive ? 'bg-indigo-600 text-white' : 'text-indigo-100 hover:bg-indigo-600/50'
                  }
                `}
                onClick={() => setIsSidebarOpen(false)}
              >
                <svg className='w-5 h-5 mr-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z'
                  />
                </svg>
                পাসওয়ার্ড পরিবর্তন
              </NavLink>
              {/* <div className='relative'>
                <div className='flex items-center px-4 py-3 rounded-lg text-indigo-100 opacity-80'>
                  <svg
                    className='w-5 h-5 mr-3'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z'
                    />
                  </svg>
                  সাপোর্ট টিকিট
                  <span className='absolute top-2 right-4 bg-yellow-100 text-yellow-800 text-[8px] px-1 py-0.5 rounded-full'>
                    শীঘ্রই আসছে
                  </span>
                </div>
              </div> */}
              <NavLink
                to='/support-tickets'
                className={({ isActive }) => `
    flex items-center px-4 py-3 rounded-lg transition-all
    ${isActive ? 'bg-indigo-600 text-white' : 'text-indigo-100 hover:bg-indigo-600/50'}
  `}
                onClick={() => setIsSidebarOpen(false)}
              >
                <svg className='w-5 h-5 mr-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z'
                  />
                </svg>
                সাপোর্ট টিকিট
              </NavLink>
              <button
                className='flex items-center px-4 py-3 rounded-lg transition-all text-indigo-100 hover:bg-indigo-600/50 w-full text-left'
                onClick={handleLogout}
              >
                <svg className='w-5 h-5 mr-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1'
                  />
                </svg>
                লগ আউট
              </button>
            </nav>
          </aside>
          {/* Main Content */}
          <main className='flex-1 w-full p-0 md:p-6 bg-white md:bg-transparent md:rounded-tl-lg overflow-hidden'>
            <div className='bg-white min-h-[calc(100vh-4rem)] md:rounded-lg md:shadow-sm p-4 md:p-6'>
              {children}
            </div>
          </main>
        </div>
      ) : (
        <Outlet />
      )}
    </div>
  )
}

export default DashboardLayout
