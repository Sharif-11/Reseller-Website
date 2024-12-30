import { useContext, useState } from "react";
import { NavLink } from "react-router";
import { UserContext } from "../Context/userContext";

const Header = ({
  setIsSidebarOpen,
}: {
  setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const userContext = useContext(UserContext);
  const user = userContext ? userContext.user : null;
  const setUser = userContext ? userContext.setUser : null;
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    if (setUser) setUser(null);
  };

  return (
    <div className="bg-[rgb(135,89,78)] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center text-white  gap-3">
            <div
              onClick={() => setIsSidebarOpen((prev) => !prev)}
              className="md:hidden"
            >
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </div>

            <NavLink
              to="/"
              className="text-white text-2xl font-bold hover:text-gray-200 transition duration-300"
            >
              Reseller Bd
            </NavLink>
          </div>
          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            {!!user || (
              <button
                onClick={toggleMenu}
                className="text-white hover:text-gray-200 focus:outline-none mr-4"
              >
                {isMenuOpen ? (
                  <svg
                    className="h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                ) : (
                  <svg
                    className="h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                )}
              </button>
            )}

            {/* User Icon for Mobile */}
            {user && (
              <div className="relative">
                <button
                  onClick={toggleDropdown}
                  className="text-white flex items-center hover:bg-[rgba(255,255,255,0.2)] px-3 py-2 rounded-md transition duration-300"
                >
                  <svg
                    className="h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 12c2.485 0 4.5-2.015 4.5-4.5S14.485 3 12 3 7.5 5.015 7.5 7.5 9.515 12 12 12zM12 14c-4.418 0-8 2.015-8 4.5V21h16v-2.5c0-2.485-3.582-4.5-8-4.5z"
                    />
                  </svg>
                </button>
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                    <button
                      onClick={handleLogout}
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100 w-full text-left"
                    >
                      লগআউট
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <NavLink
              to="/"
              className="text-white hover:bg-[rgba(255,255,255,0.2)] px-3 py-2 rounded-md transition duration-300"
            >
              হোম
            </NavLink>
            {!user && (
              <>
                <NavLink
                  to="/login"
                  className="text-white hover:bg-[rgba(255,255,255,0.2)] px-3 py-2 rounded-md transition duration-300"
                >
                  লগইন
                </NavLink>
                <NavLink
                  to="/register"
                  className="text-white hover:bg-[rgba(255,255,255,0.2)] px-3 py-2 rounded-md transition duration-300"
                >
                  রেজিস্ট্রেশন
                </NavLink>
              </>
            )}

            {/* User Icon with Dropdown */}
            {user && (
              <div className="relative">
                <button
                  onClick={toggleDropdown}
                  className="text-white flex items-center hover:bg-[rgba(255,255,255,0.2)] px-3 py-2 rounded-md transition duration-300"
                >
                  <svg
                    className="h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 12c2.485 0 4.5-2.015 4.5-4.5S14.485 3 12 3 7.5 5.015 7.5 7.5 9.515 12 12 12zM12 14c-4.418 0-8 2.015-8 4.5V21h16v-2.5c0-2.485-3.582-4.5-8-4.5z"
                    />
                  </svg>
                </button>
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                    <button
                      onClick={handleLogout}
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100 w-full text-left"
                    >
                      লগআউট
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-[rgb(135,89,78)]">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <NavLink
              to="/"
              className="text-white block px-3 py-2 rounded-md hover:bg-[rgba(255,255,255,0.2)] transition duration-300"
              onClick={toggleMenu}
            >
              হোম
            </NavLink>
            {!user && (
              <>
                <NavLink
                  to="/login"
                  className="text-white block px-3 py-2 rounded-md hover:bg-[rgba(255,255,255,0.2)] transition duration-300"
                  onClick={toggleMenu}
                >
                  লগইন
                </NavLink>
                <NavLink
                  to="/register"
                  className="text-white block px-3 py-2 rounded-md hover:bg-[rgba(255,255,255,0.2)] transition duration-300"
                  onClick={toggleMenu}
                >
                  রেজিস্ট্রেশন
                </NavLink>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Header;
