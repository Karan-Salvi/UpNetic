import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useGetPostsQuery } from '../store/api';
import Header from '../components/Layout/Header';
import Sidebar from '../components/Layout/Sidebar';
import CreatePost from '../components/Posts/CreatePost';
import PostCard from '../components/Posts/PostCard';
import PostFilter from '../components/Posts/PostFilter';
import { ClipLoader } from 'react-spinners';

const Feed = () => {
  const { currentFilter } = useSelector((state) => state.posts);
  const { data: postsData, isLoading, refetch } = useGetPostsQuery({ 
    filter: currentFilter,
    page: 1,
    limit: 10 
  });

  useEffect(() => {
    refetch();
  }, [currentFilter, refetch]);

  return (
    <div className="min-h-screen bg-linkedin-gray-light">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
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
                  {postsData?.posts?.length > 0 ? (
                    postsData.posts.map((post) => (
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
        </div>
      </div>
    </div>
  );
};

export default Feed;