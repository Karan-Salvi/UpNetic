import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  HomeIcon,
  UserGroupIcon,
  ChatBubbleLeftIcon,
  BookmarkIcon,
  BriefcaseIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";

const Sidebar = () => {
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);

  const navigation = [
    { name: "Feed", href: "/feed", icon: HomeIcon },
    { name: "My Network", href: "/connections", icon: UserGroupIcon },
    { name: "Messages", href: "/chat", icon: ChatBubbleLeftIcon },
  ];

  console.log("Sidebar user : ", user);

  const isActive = (href) => location.pathname === href;

  return (
    <aside className="hidden lg:block w-64 bg-white rounded-lg shadow-sm p-4 h-fit sticky top-20">
      {/* User Profile Card */}
      <div className="border-b border-gray-200 pb-4 mb-4">
        <Link
          to={`/profile/${user?._id}`}
          className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <img
            src={user?.avatar || "/images/profile.png"}
            alt={user?.name}
            className="w-12 h-12 rounded-full object-cover"
          />
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">{user?.name}</h3>
            <p className="text-sm text-gray-600 truncate">
              {user?.headline || user?.email}
            </p>
          </div>
        </Link>

        <div className="mt-3 grid grid-cols-2 gap-2 text-center">
          <div>
            <p className="text-sm font-semibold text-gray-900">
              {user.connectionCount || 0}
            </p>
            <p className="text-xs text-gray-600">Connections</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">1.2K</p>
            <p className="text-xs text-gray-600">Views</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="space-y-1">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive(item.href)
                  ? "bg-linkedin-blue text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Recent Activity */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Recent</h4>
        <div className="space-y-2">
          <button className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900 transition-colors">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>React Developers</span>
          </button>
          <button className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900 transition-colors">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span>JavaScript Community</span>
          </button>
          <button className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900 transition-colors">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <span>Tech Startups</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
