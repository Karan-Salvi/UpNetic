import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useGetPostsQuery } from "../store/api";
import Header from "../components/Layout/Header";
import Sidebar from "../components/Layout/Sidebar";
import CreatePost from "../components/Posts/CreatePost";
import PostCard from "../components/Posts/PostCard";
import PostFilter from "../components/Posts/PostFilter";
import { ClipLoader } from "react-spinners";
import News from "../components/Posts/News";

const Feed = () => {
  const { currentFilter } = useSelector((state) => state.posts);
  const [page, setPage] = useState(1);
  const [posts, setPosts] = useState([]);
  const [hasMore, setHasMore] = useState(true);

  // const {
  //   data: postsData,
  //   isLoading,
  //   refetch,
  // } = useGetPostsQuery({
  //   filter: currentFilter,
  //   page,
  //   limit: 10,
  // });

  // useEffect(() => {
  //   refetch();
  // }, [currentFilter, refetch]);

  const { data, isFetching, isLoading, refetch } = useGetPostsQuery({
    filter: currentFilter,
    page,
    limit: 10,
  });

  useEffect(() => {
    setPage(1);
    setPosts([]);
    setHasMore(true);
  }, [currentFilter]);

  useEffect(() => {
    if (data?.posts) {
      setPosts((prev) => [...prev, ...data.posts]);
      if (data.posts.length < 10) setHasMore(false);
    }
  }, [data]);

  // Infinite scroll trigger
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
          document.body.offsetHeight - 200 &&
        !isFetching &&
        hasMore
      ) {
        setPage((prevPage) => prevPage + 1);
      }
    };

   

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isFetching, hasMore]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Sidebar */}
          <Sidebar />

          {/* Main Feed */}
          <div className="lg:col-span-3">
            <div className="max-w-2xl mx-auto">
              <CreatePost />
              <PostFilter />

              {isLoading ? (
                <div className="flex justify-center py-12">
                  <ClipLoader color="#0077B5" size={40} />
                </div>
              ) : (
                <div className="space-y-4">
                  {posts?.length > 0 ? (
                    posts?.map((post) => (
                      <PostCard key={post._id} post={post} />
                    ))
                  ) : (
                    <div className="card p-12 text-center">
                      <p className="text-gray-500 text-lg">No posts found</p>
                      <p className="text-gray-400 text-sm mt-2">
                        Be the first to share something!
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <News />
        </div>
      </div>
    </div>
  );
};

export default Feed;
