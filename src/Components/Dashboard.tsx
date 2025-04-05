import { useContext, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { ReactNode } from "react";
import { UserContext } from "../Context/userContext";
import Header from "./Header";

const DashboardLayout = ({ children }: { children: ReactNode }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const userContext = useContext(UserContext);
  const user = userContext ? userContext.user : null;

  const toggleWithdrawAccordion = () => {
    setIsWithdrawOpen(!isWithdrawOpen);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <Header setIsSidebarOpen={setIsSidebarOpen} />

      {user ? (
        <div className="flex">
          {/* Sidebar */}
          <aside
            className={`
          fixed md:static w-64 h-[calc(100vh-4rem)] bg-white shadow-lg
          transform transition-transform duration-300 ease-in-out
          ${
            isSidebarOpen
              ? "translate-x-0"
              : "-translate-x-full md:translate-x-0"
          }
          z-40
        `}
          >
            <nav className="p-4 space-y-2">
             {user?.role==='Seller' && <NavLink
                to="/"
                className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
                onClick={() => setIsSidebarOpen(false)}
              >
                হোম
              </NavLink>}
              <NavLink
                to="/profile"
                className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
                onClick={() => setIsSidebarOpen(false)}
              >
                প্রোফাইল
              </NavLink>
          {user?.role==='Seller' && <>
           <NavLink
                to="/products"
                className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
                onClick={() => setIsSidebarOpen(false)}
              >
                সকল প্রোডাক্টস
              </NavLink>
              <NavLink
                to="/favorites"
                className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
                onClick={() => setIsSidebarOpen(false)}
              >      
                ফেভরিট প্রোডাক্টস
              </NavLink>
              <NavLink
                to="/cart"
                className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
                onClick={() => setIsSidebarOpen(false)}
              >
                কার্ট
              </NavLink>
              <NavLink
                to="/add-wallet"
                className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
                onClick={() => setIsSidebarOpen(false)}
              >
                ওয়ালেট যোগ করুন
              </NavLink>
            </>}
              
              {/* Withdraw Accordion */}
            { user?.role==='Seller' && <div className="border rounded-md overflow-hidden">
                <button
                  onClick={toggleWithdrawAccordion}
                  className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 flex justify-between items-center"
                >
                  <span>টাকা উত্তোলন</span>
                  <svg
                    className={`w-4 h-4 transition-transform duration-200 ${
                      isWithdrawOpen ? "transform rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {isWithdrawOpen && (
                  <div className="bg-gray-50">
                    <NavLink
                      to="/request-withdraw"
                      className="block px-6 py-2 text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsSidebarOpen(false)}
                    >
                     উত্তোলন করুন
                    </NavLink>
                    <NavLink
                      to="/withdraw-history"
                      className="block px-6 py-2 text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsSidebarOpen(false)}
                    >
                      উত্তোলনের হিস্ট্রি
                    </NavLink>
                  </div>
                )}
              </div>}

              {user.role === "Admin" && (
                <>
                  <NavLink
                    to="/add-product"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
                    onClick={() => setIsSidebarOpen(false)}
                  >
                    পণ্য যোগ করুন
                  </NavLink>
                  <NavLink
                    to="/admin-products"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
                    onClick={() => setIsSidebarOpen(false)}
                  >
                    পণ্য সমূহ
                  </NavLink>
                    <NavLink
                    to="/admin-withdraw-request"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded text-sm"
                    onClick={() => setIsSidebarOpen(false)}
                    >
                    টাকা উত্তোলনের অনুরোধ সমূহ
                    </NavLink>
                </>
              )}
              
              {user.role === 'Seller' && (
                <NavLink
                  to="/orders"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
                  onClick={() => setIsSidebarOpen(false)}
                >
                  অর্ডার
                </NavLink>
              )}
              
              {user?.isVerified && user.role === 'Seller' && (
                <NavLink
                  to="/add-referral-code"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
                  onClick={() => setIsSidebarOpen(false)}
                >
                  রেফারেল কোড যোগ করুন
                </NavLink>
              )}
              
              <NavLink
                to="/change-password"
                className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
                onClick={() => setIsSidebarOpen(false)}
              >
                পাসওয়ার্ড পরিবর্তন
              </NavLink>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 p-6">{children}</main>
        </div>
      ) : (
        <Outlet />
      )}
    </div>
  );
};

export default DashboardLayout;