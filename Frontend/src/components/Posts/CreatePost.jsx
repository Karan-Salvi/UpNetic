import { useState } from "react";
import { useCreatePostMutation } from "../../store/api";
import { useSelector } from "react-redux";
import {
  PhotoIcon,
  VideoCameraIcon,
  DocumentIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import { FiSend } from "react-icons/fi";

import { ImSpinner8 } from "react-icons/im";

const CreatePost = () => {
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const { user } = useSelector((state) => state.auth);
  const [createPost, { isLoading }] = useCreatePostMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      const postData = {
        content: content.trim(),
        tags: tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag),
      };

      await createPost(postData).unwrap();
      setContent("");
      setTags("");
      toast.success("Post created successfully!");
    } catch (error) {
      toast.error("Failed to create post");
    }
  };

  return (
    <div className="card p-4 mb-4  rounded-2xl shadow-md border border-gray-100">
      <form onSubmit={handleSubmit}>
        <div className="flex space-x-3">
          <img
            src={user?.avatar || "/images/profile.png"}
            alt={user?.name}
            className="w-12 h-12 rounded-full object-cover"
          />
          <div className="flex-1">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind?"
              className="w-full resize-none border-none outline-none text-gray-900 placeholder-gray-500 text-lg"
              rows="3"
            />
            <div className="flex justify-between items-center">
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="Add tags (comma separated): #react, #javascript"
                className="w-full mt-2 text-sm text-gray-600 border-none outline-none placeholder-gray-400"
              />
              <button
                type="submit"
                disabled={!content.trim() || isLoading}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 text-center rounded-lg disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed poppins"
              >
                {isLoading ? (
                  <ImSpinner8 className="animate-spin" />
                ) : (
                  <FiSend className="font-bold text-xl" />
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreatePost;
