import { useContext, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { ReactNode } from "react";
import { UserContext } from "../Context/userContext";
import Header from "./Header";

const DashboardLayout = ({ children }: { children: ReactNode }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [openAccordions, setOpenAccordions] = useState<Record<string, boolean>>({
    withdraw: false,
    products: false,
  });
  const userContext = useContext(UserContext);
  const user = userContext ? userContext.user : null;

  const toggleAccordion = (key: string) => {
    setOpenAccordions(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header setIsSidebarOpen={setIsSidebarOpen} />

      {user ? (
        <div className="flex">
          {/* Sidebar */}
          <aside
            className={`
              fixed md:static w-64 h-[calc(100vh-4rem)] bg-gradient-to-b from-indigo-700 to-indigo-800
              text-white shadow-xl transform transition-transform duration-300 ease-in-out
              ${isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
              z-40 flex flex-col
            `}
          >
            <div className="p-4 border-b border-indigo-600">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium">{user?.name}</p>
                  <p className="text-xs text-indigo-200">{user?.role}</p>
                </div>
              </div>
            </div>

            <nav className="flex-1 overflow-y-auto p-4 space-y-1">
              {user?.role === 'Seller' && (
                <NavLink
                  to="/"
                  className={({ isActive }) => `
                    flex items-center px-4 py-3 rounded-lg transition-all
                    ${isActive ? 'bg-indigo-600 text-white' : 'text-indigo-100 hover:bg-indigo-600/50'}
                  `}
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  হোম
                </NavLink>
              )}

              <NavLink
                to="/profile"
                className={({ isActive }) => `
                  flex items-center px-4 py-3 rounded-lg transition-all
                  ${isActive ? 'bg-indigo-600 text-white' : 'text-indigo-100 hover:bg-indigo-600/50'}
                `}
                onClick={() => setIsSidebarOpen(false)}
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                প্রোফাইল
              </NavLink>

              {user?.role === 'Seller' && (
                <>
                  {/* Products Accordion */}
                  <div className="border-b border-indigo-600/30 pb-1">
                    <button
                      onClick={() => toggleAccordion('products')}
                      className="w-full flex items-center justify-between px-4 py-3 text-indigo-100 hover:bg-indigo-600/30 rounded-lg transition-all"
                    >
                      <div className="flex items-center">
                        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                        পণ্য ব্যবস্থাপনা
                      </div>
                      <svg
                        className={`w-4 h-4 transition-transform duration-200 ${openAccordions.products ? 'transform rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    {openAccordions.products && (
                      <div className="ml-8 mt-1 space-y-1">
                        <NavLink
                          to="/products"
                          className={({ isActive }) => `
                            flex items-center px-3 py-2 rounded-lg text-sm transition-all
                            ${isActive ? 'bg-indigo-600 text-white' : 'text-indigo-100 hover:bg-indigo-600/30'}
                          `}
                          onClick={() => setIsSidebarOpen(false)}
                        >
                          সকল প্রোডাক্টস
                        </NavLink>
                        <NavLink
                          to="/favorites"
                          className={({ isActive }) => `
                            flex items-center px-3 py-2 rounded-lg text-sm transition-all
                            ${isActive ? 'bg-indigo-600 text-white' : 'text-indigo-100 hover:bg-indigo-600/30'}
                          `}
                          onClick={() => setIsSidebarOpen(false)}
                        >
                          ফেভরিট প্রোডাক্টস
                        </NavLink>
                      </div>
                    )}
                  </div>

                  <NavLink
                    to="/cart"
                    className={({ isActive }) => `
                      flex items-center px-4 py-3 rounded-lg transition-all
                      ${isActive ? 'bg-indigo-600 text-white' : 'text-indigo-100 hover:bg-indigo-600/50'}
                    `}
                    onClick={() => setIsSidebarOpen(false)}
                  >
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    কার্ট
                  </NavLink>

                  {/* Withdraw Accordion */}
                  <div className="border-b border-indigo-600/30 pb-1">
                    <button
                      onClick={() => toggleAccordion('withdraw')}
                      className="w-full flex items-center justify-between px-4 py-3 text-indigo-100 hover:bg-indigo-600/30 rounded-lg transition-all"
                    >
                      <div className="flex items-center">
                        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        টাকা উত্তোলন
                      </div>
                      <svg
                        className={`w-4 h-4 transition-transform duration-200 ${openAccordions.withdraw ? 'transform rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    {openAccordions.withdraw && (
                      <div className="ml-8 mt-1 space-y-1">
                        <NavLink
                          to="/add-wallet"
                          className={({ isActive }) => `
                            flex items-center px-3 py-2 rounded-lg text-sm transition-all
                            ${isActive ? 'bg-indigo-600 text-white' : 'text-indigo-100 hover:bg-indigo-600/30'}
                          `}
                          onClick={() => setIsSidebarOpen(false)}
                        >
                          ওয়ালেট যোগ করুন
                        </NavLink>
                        <NavLink
                          to="/request-withdraw"
                          className={({ isActive }) => `
                            flex items-center px-3 py-2 rounded-lg text-sm transition-all
                            ${isActive ? 'bg-indigo-600 text-white' : 'text-indigo-100 hover:bg-indigo-600/30'}
                          `}
                          onClick={() => setIsSidebarOpen(false)}
                        >
                          উত্তোলন করুন
                        </NavLink>
                        <NavLink
                          to="/withdraw-history"
                          className={({ isActive }) => `
                            flex items-center px-3 py-2 rounded-lg text-sm transition-all
                            ${isActive ? 'bg-indigo-600 text-white' : 'text-indigo-100 hover:bg-indigo-600/30'}
                          `}
                          onClick={() => setIsSidebarOpen(false)}
                        >
                          উত্তোলনের হিস্ট্রি
                        </NavLink>
                      </div>
                    )}
                  </div>

                  <NavLink
                    to="/orders"
                    className={({ isActive }) => `
                      flex items-center px-4 py-3 rounded-lg transition-all
                      ${isActive ? 'bg-indigo-600 text-white' : 'text-indigo-100 hover:bg-indigo-600/50'}
                    `}
                    onClick={() => setIsSidebarOpen(false)}
                  >
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    অর্ডার
                  </NavLink>

                  {user?.isVerified && (
                    <NavLink
                      to="/add-referral-code"
                      className={({ isActive }) => `
                        flex items-center px-4 py-3 rounded-lg transition-all
                        ${isActive ? 'bg-indigo-600 text-white' : 'text-indigo-100 hover:bg-indigo-600/50'}
                      `}
                      onClick={() => setIsSidebarOpen(false)}
                    >
                      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      রেফারেল কোড যোগ করুন
                    </NavLink>
                  )}
                </>
              )}

              {user.role === "Admin" && (
                <>
                  <NavLink
                    to="/add-product"
                    className={({ isActive }) => `
                      flex items-center px-4 py-3 rounded-lg transition-all
                      ${isActive ? 'bg-indigo-600 text-white' : 'text-indigo-100 hover:bg-indigo-600/50'}
                    `}
                    onClick={() => setIsSidebarOpen(false)}
                  >
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    পণ্য যোগ করুন
                  </NavLink>
                  <NavLink
                    to="/admin-products"
                    className={({ isActive }) => `
                      flex items-center px-4 py-3 rounded-lg transition-all
                      ${isActive ? 'bg-indigo-600 text-white' : 'text-indigo-100 hover:bg-indigo-600/50'}
                    `}
                    onClick={() => setIsSidebarOpen(false)}
                  >
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    পণ্য সমূহ
                  </NavLink>
                  <NavLink
                    to="/admin-withdraw-request"
                    className={({ isActive }) => `
                      flex items-center px-4 py-3 rounded-lg transition-all
                      ${isActive ? 'bg-indigo-600 text-white' : 'text-indigo-100 hover:bg-indigo-600/50'}
                    `}
                    onClick={() => setIsSidebarOpen(false)}
                  >
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    টাকা উত্তোলনের অনুরোধ
                  </NavLink>
                </>
              )}

              <NavLink
                to="/change-password"
                className={({ isActive }) => `
                  flex items-center px-4 py-3 rounded-lg transition-all
                  ${isActive ? 'bg-indigo-600 text-white' : 'text-indigo-100 hover:bg-indigo-600/50'}
                `}
                onClick={() => setIsSidebarOpen(false)}
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
                পাসওয়ার্ড পরিবর্তন
              </NavLink>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 p-4 md:p-6 bg-white md:bg-transparent md:rounded-tl-lg overflow-hidden">
            <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 h-full">
              {children}
            </div>
          </main>
        </div>
      ) : (
        <Outlet />
      )}
    </div>
  );
};

export default DashboardLayout;