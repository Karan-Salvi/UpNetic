import { useSelector, useDispatch } from "react-redux";
import { setFilter } from "../../store/slices/postSlice";
import { ClockIcon, FireIcon, HashtagIcon } from "@heroicons/react/24/outline";

const PostFilter = () => {
  const { currentFilter } = useSelector((state) => state.posts);
  const dispatch = useDispatch();

  const filters = [
    { key: "latest", label: "Latest", icon: ClockIcon },
    { key: "mostLiked", label: "Most Liked", icon: FireIcon },
    { key: "trending", label: "Trending", icon: HashtagIcon },
    { key: "tags", label: "Tags", icon: HashtagIcon },
  ];

  return (
    <div className="card p-4 mb-6">
      <h3 className="font-semibold text-gray-900 mb-3">Sort by</h3>
      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => {
          const Icon = filter.icon;
          const isActive = currentFilter === filter.key;

          return (
            <button
              key={filter.key}
              onClick={() => dispatch(setFilter(filter.key))}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all duration-200 ${
                isActive
                  ? "bg-linkedin-blue text-black shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{filter.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default PostFilter;
