import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  MagnifyingGlassIcon,
  BellIcon,
  ChatBubbleLeftIcon,
  UserCircleIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { logout } from "../../store/slices/authSlice";
import toast from "react-hot-toast";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const { unreadCount } = useSelector((state) => state.chat);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    toast.success("Logged out successfully");
    navigate("/login");
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-3">
          {/* Logo */}
          <div className="flex items-center">
            <Link
              to="/feed"
              className="flex items-center justify-start space-x-1"
            >
              <img
                src="/images/logo.jpg"
                className="h-6  w-auto"
                alt="brand logo"
              />
              <span className="text-2xl font-extrabold text-blue-500 hidden sm:block roboto">
                UpNetic
              </span>
            </Link>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-md mx-4">
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2  border border-black bg-linkedin-gray-light rounded-full border-none focus:ring-2  focus:ring-linkedin-blue outline-1"
              />
            </div>
          </div>

          {/* Navigation Icons */}
          <div className="flex items-center space-x-4">
            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-md text-gray-600 hover:text-blue-500 cursor-pointer"
            >
              {isMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              <Link
                to="/feed"
                className="flex flex-col items-center p-2 text-gray-600 hover:text-blue-500 transition-colors"
              >
                <div className="w-6 h-6 mb-1">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
                  </svg>
                </div>
                <span className="text-xs">Home</span>
              </Link>

              <Link
                to="/connections"
                className="flex flex-col items-center p-2 text-gray-600 hover:text-blue-500 transition-colors"
              >
                <UserCircleIcon className="w-6 h-6 mb-1" />
                <span className="text-xs">Network</span>
              </Link>

              <Link
                to="/chat"
                className="flex flex-col items-center p-2 text-gray-600 hover:text-blue-500 transition-colors relative"
              >
                <ChatBubbleLeftIcon className="w-6 h-6 mb-1" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
                <span className="text-xs">Chat</span>
              </Link>
            </div>

            {/* Profile Menu */}
            <div className="relative cursor-pointer">
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="  flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <img
                  src={user?.avatar || "/images/profile.png"}
                  alt={user?.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <span className="hidden md:block text-sm font-medium text-gray-700">
                  {user?.name}
                </span>
              </button>

              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                  <Link
                    to={`/profile/${user?._id}`}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsProfileMenuOpen(false)}
                  >
                    View Profile
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-3 border-t border-gray-200">
            <div className="grid grid-cols-4 gap-4">
              <Link
                to="/feed"
                className="flex flex-col items-center p-2 text-gray-600 hover:text-blue-500 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="w-6 h-6 mb-1">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
                  </svg>
                </div>
                <span className="text-xs">Home</span>
              </Link>

              <Link
                to="/connections"
                className="flex flex-col items-center p-2 text-gray-600 hover:text-blue-500 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <UserCircleIcon className="w-6 h-6 mb-1" />
                <span className="text-xs">Network</span>
              </Link>

              <Link
                to="/chat"
                className="flex flex-col items-center p-2 text-gray-600 hover:text-blue-500 transition-colors relative"
                onClick={() => setIsMenuOpen(false)}
              >
                <ChatBubbleLeftIcon className="w-6 h-6 mb-1" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
                <span className="text-xs">Chat</span>
              </Link>

              <button className="flex flex-col items-center p-2 text-gray-600 hover:text-blue-500 transition-colors cursor-pointer">
                <BellIcon className="w-6 h-6 mb-1" />
                <span className="text-xs">Notify</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
