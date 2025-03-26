import { useContext, useState } from "react";
import { NavLink, Outlet } from "react-router";

import { ReactNode } from "react";
import { UserContext } from "../Context/userContext";
import Header from "./Header";

const DashboardLayout = ({ children }: { children: ReactNode }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  //   const [isMenuOpen, setIsMenuOpen] = useState(false);
  const userContext = useContext(UserContext);
  const user = userContext ? userContext.user : null;
  //   const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  //   const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

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
              <NavLink
                to="/"
                className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
                onClick={() => setIsSidebarOpen(false)}
              >
                হোম
              </NavLink>
              <NavLink
                to="/profile"
                className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
                onClick={() => setIsSidebarOpen(false)}
              >
                প্রোফাইল
              </NavLink>
             {
              user.role === "Admin" &&  <><NavLink
              to="/add-product"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
              onClick={() => setIsSidebarOpen(false)}
            >
              পণ্য যোগ করুন
            </NavLink>
            <NavLink
            to="/products"
            className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
            onClick={() => setIsSidebarOpen(false)}
          >
            পণ্য সমূহ
          </NavLink>
          </>
             }
              
              <NavLink
                to="/orders"
                className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
                onClick={() => setIsSidebarOpen(false)}
              >
                অর্ডার
              </NavLink>
              {user?.isVerified && user.role==='Seller' && (
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
      {/* Dropdown Menu */}
      {/* {isDropdownOpen && (
        <div className="absolute right-4 top-16 w-48 bg-white rounded-md shadow-lg z-50">
          <button className="block px-4 py-2 text-gray-700 hover:bg-gray-100 w-full text-left">
            Change Password
          </button>
          <button className="block px-4 py-2 text-gray-700 hover:bg-gray-100 w-full text-left">
            Logout
          </button>
        </div>
      )} */}
    </div>
  );
};

export default DashboardLayout;
