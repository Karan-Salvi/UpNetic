import { useState } from "react";
import { useSelector } from "react-redux";
import { formatDistanceToNow } from "date-fns";
import {
  HeartIcon,
  ChatBubbleOvalLeftIcon,
  ShareIcon,
  EllipsisHorizontalIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolidIcon } from "@heroicons/react/24/solid";
import { useLikePostMutation, useAddCommentMutation } from "../../store/api";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

const PostCard = ({ post }) => {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const { user } = useSelector((state) => state.auth);
  const [likePost] = useLikePostMutation();
  const [addComment] = useAddCommentMutation();

  const isLiked = post.likes?.includes(user?._id);

  const handleLike = async () => {
    try {
      await likePost(post._id).unwrap();
    } catch (error) {
      toast.error("Failed to like post");
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      await addComment({
        postId: post._id,
        content: commentText.trim(),
      }).unwrap();
      setCommentText("");
      toast.success("Comment added!");
    } catch (error) {
      toast.error("Failed to add comment");
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard!");
  };

  return (
    <article className="card p-6 mb-4 animate-fade-in shadow-md rounded-lg border-2 border-gray-200 ">
      {/* Post Header */}
      <div className="flex items-start justify-between mb-4">
        <Link to={`/profile/${post.author?._id}`} className="flex space-x-3">
          <img
            src={post.author?.avatar || "/images/profile.png"}
            alt={post.author?.name}
            className="w-12 h-12 rounded-full object-cover"
          />
          <div>
            <h3 className="font-semibold text-gray-900 hover:text-blue-500 cursor-pointer">
              {post.author?.name}
            </h3>
            <p className="text-sm text-gray-600">{post.author?.headline}</p>
            <p className="text-xs text-gray-500">
              {formatDistanceToNow(new Date(post.createdAt), {
                addSuffix: true,
              })}
            </p>
          </div>
        </Link>

        <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
          <EllipsisHorizontalIcon className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* Post Content */}
      <div className="mb-4">
        <p className="text-gray-900 text-base leading-relaxed mb-3">
          {post.content}
        </p>

        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag, index) => (
              <span
                key={index}
                className="text-blue-500 text-sm font-medium hover:underline cursor-pointer"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Post Stats */}
      <div className="flex items-center justify-between py-2 border-t border-b border-gray-200 mb-3">
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <span>{post.likes?.length || 0} likes</span>
          <span>{post.comments?.length || 0} comments</span>
          <span>{post.shares || 0} shares</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={handleLike}
          className={`flex items-center space-x-2 px-4 cursor-pointer py-2 rounded-lg transition-all duration-200 ${
            isLiked
              ? "text-red-600 bg-red-50 hover:bg-red-100"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          {isLiked ? (
            <HeartSolidIcon className="w-5 h-5" />
          ) : (
            <HeartIcon className="w-5 h-5" />
          )}
          <span className="text-sm font-medium">Like</span>
        </button>

        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
        >
          <ChatBubbleOvalLeftIcon className="w-5 h-5" />
          <span className="text-sm font-medium">Comment</span>
        </button>

        <button
          onClick={handleShare}
          className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
        >
          <ShareIcon className="w-5 h-5" />
          <span className="text-sm font-medium">Share</span>
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="border-t border-gray-200 pt-4">
          {/* Add Comment */}
          <form onSubmit={handleComment} className="flex space-x-3 mb-4">
            <img
              src={user?.avatar || "/images/profile.png"}
              alt={user?.name}
              className="w-8 h-8 rounded-full object-cover"
            />
            <div className="flex-1">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment..."
                className="w-full px-3 py-2 bg-gray-100 rounded-full border-none outline-none focus:ring-2 focus:ring-linkedin-blue"
              />
            </div>
          </form>

          {/* Comments List */}
          <div className="space-y-3">
            {post.comments?.map((comment) => (
              <div key={comment._id} className="flex space-x-3">
                <img
                  src={comment.author?.avatar || "/images/profile.png"}
                  alt={comment.author?.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div className="flex-1">
                  <div className="bg-gray-100 rounded-lg px-3 py-2">
                    <h4 className="font-semibold text-sm text-gray-900">
                      {comment.author?.name}
                    </h4>
                    <p className="text-sm text-gray-800">{comment.content}</p>
                  </div>
                  <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                    <span>
                      {formatDistanceToNow(new Date(comment.createdAt), {
                        addSuffix: true,
                      })}
                    </span>
                    <button className="hover:text-gray-700">Like</button>
                    <button className="hover:text-gray-700">Reply</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </article>
  );
};

export default PostCard;
