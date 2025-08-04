import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  useCreateOrGetChatMutation,
  useGetPostsQuery,
  useGetProfileQuery,
  useSendConnectionRequestMutation,
  useUpdateProfileMutation,
  useUploadAvatarMutation,
} from "../store/api";
import Header from "../components/Layout/Header";
import { PencilIcon, CameraIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import PostCard from "../components/Posts/PostCard";
import { VscSaveAs } from "react-icons/vsc";
import { MdOutlineCancel } from "react-icons/md";
import { BsFillPeopleFill } from "react-icons/bs";
import { TiMessages } from "react-icons/ti";

const Profile = () => {
  const { userId } = useParams();
  const { user: currentUser } = useSelector((state) => state.auth);
  const [sendConnectionRequest] = useSendConnectionRequestMutation();
  const [createOrGetChat] = useCreateOrGetChatMutation();

  const navigate = useNavigate();

  const {
    data: postData,
    isLoading: loading,
    isError,
    error,
  } = useGetPostsQuery({
    author: userId,
    filter: "latest",
    page: 1,
    limit: 10,
  });

  const { data: profileData, isLoading } = useGetProfileQuery(userId);
  const [updateProfile] = useUpdateProfileMutation();
  const [uploadAvatar] = useUploadAvatarMutation();

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});

  const isOwnProfile = currentUser?._id === userId;
  const profile = profileData?.user;

  const handleEdit = () => {
    setEditData({
      name: profile?.name || "",
      headline: profile?.headline || "",
      bio: profile?.bio || "",
      location: profile?.location || "",
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      await updateProfile({ id: userId, ...editData }).unwrap();
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error("Failed to update profile");
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("avatar", file);

    try {
      await uploadAvatar(formData).unwrap();
      toast.success("Avatar updated successfully!");
    } catch (error) {
      toast.error("Failed to upload avatar");
    }
  };

  const handleConnect = async () => {
    try {
      const data = await sendConnectionRequest(userId).unwrap();

      toast.success("Connection request sent!");
    } catch (error) {
      toast.error("Failed to send request");
    }
  };

  const handleSendMessage = async () => {
    try {
      const chat = await createOrGetChat(userId).unwrap();
      navigate(`/chat`);
    } catch (error) {
      navigate(`/chat`);
    }
  }; //
  if (isLoading) {
    return (
      <div className="min-h-screen bg-linkedin-gray-light">
        <Header />
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-linkedin-blue"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linkedin-gray-light">
      <Header />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Profile Header */}
        <div className="card mb-6 overflow-hidden rounded-t-2xl">
          {/* Cover Photo */}
          <div className="h-48 bg-gradient-to-r from-blue-100 to-blue-500"></div>

          {/* Profile Info */}
          <div className="px-6 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-end sm:space-x-6 -mt-16">
              {/* Avatar */}
              <div className="relative mb-4 sm:mb-0">
                <img
                  src={profile?.avatar || "/images/profile.png"}
                  alt={profile?.name}
                  className="w-32 h-32 rounded-full border-4 border-white object-cover"
                />
                {isOwnProfile && (
                  <label className="absolute bottom-2 right-2 bg-white rounded-full p-2 shadow-lg cursor-pointer hover:bg-gray-50">
                    <CameraIcon className="w-5 h-5 text-gray-700" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Basic Info */}
              <div className="flex-1">
                {isEditing ? (
                  <div className="space-y-3 ">
                    <input
                      type="text"
                      value={editData.name}
                      onChange={(e) =>
                        setEditData({ ...editData, name: e.target.value })
                      }
                      className="text-2xl font-bold text-gray-900 bg-transparent border-b-2 border-linkedin-blue outline-none"
                    />
                    <input
                      type="text"
                      value={editData.headline}
                      onChange={(e) =>
                        setEditData({ ...editData, headline: e.target.value })
                      }
                      className="text-lg text-gray-600 bg-transparent border-b border-gray-300 outline-none w-full"
                      placeholder="Professional headline"
                    />
                    <input
                      type="text"
                      value={editData.location}
                      onChange={(e) =>
                        setEditData({ ...editData, location: e.target.value })
                      }
                      className="text-gray-500 bg-transparent border-b border-gray-300 outline-none"
                      placeholder="Location"
                    />
                  </div>
                ) : (
                  <>
                    <h1 className="text-2xl font-bold text-gray-900">
                      {profile?.name}
                    </h1>
                    <p className="text-lg text-gray-600">{profile?.headline}</p>
                    <p className="text-gray-500">{profile?.location}</p>
                  </>
                )}

                <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                  <span>{profile?.connections?.length || 0} connections</span>
                  <span>•</span>
                  <span>500+ profile views</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 mt-4 sm:mt-0">
                {isOwnProfile ? (
                  isEditing ? (
                    <>
                      <button
                        onClick={handleSave}
                        className="border border-blue-500 text-blue-500 p-2 inline-block justify-center items-center rounded-full fo transition-all duration-200 transform hover:scale-105  cursor-pointer font-extrabold"
                      >
                        <VscSaveAs className="text-lg" />
                      </button>
                      <button
                        onClick={() => setIsEditing(false)}
                        className="bg-white hover:bg-gray-50 text-red-500 text-4xl  rounded-full font-medium transition-all duration-200  cursor-pointer"
                      >
                        <MdOutlineCancel />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={handleEdit}
                      className="flex items-center space-x-2 bg-white hover:bg-gray-50 text-black border border-linkedin-blue p-2 rounded-full font-medium transition-all duration-200  cursor-pointer"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                  )
                ) : (
                  <>
                    <div className="flex gap-5">
                      {!currentUser?.connections?.includes(
                        userId.toString()
                      ) && (
                        <div className="flex flex-col items-center justify-between group">
                          <button
                            onClick={handleConnect}
                            className="group-hover:scale-105 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-3 font-medium transition-all duration-200 transform cursor-pointer"
                          >
                            <BsFillPeopleFill />
                          </button>
                          <span className="text-xs text-gray-500 font-semibold">
                            Connect
                          </span>
                        </div>
                      )}

                      <div className="flex flex-col items-center justify-between group">
                        <button
                          onClick={handleSendMessage}
                          className="group-hover:scale-105 border border-blue-500 hover:bg-blue-100 text-blue-600  rounded-full p-3 font-medium transition-all duration-200 transform cursor-pointer"
                        >
                          <TiMessages />
                        </button>
                        <span className="text-xs text-gray-500 font-semibold">
                          Message
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* About Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">About</h2>
          {isEditing ? (
            <textarea
              value={editData.bio}
              onChange={(e) =>
                setEditData({ ...editData, bio: e.target.value })
              }
              rows="4"
              className="w-full p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-linkedin-blue resize-none"
              placeholder="Write about yourself..."
            />
          ) : (
            <p className="text-gray-700 leading-relaxed">
              {profile?.bio || "No bio available."}
            </p>
          )}
        </div>

        {/* Experience Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Experience
          </h2>
          <div className="space-y-4">
            <div className="flex space-x-4">
              <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                <span className="text-gray-500 font-semibold">TC</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  Software Developer
                </h3>
                <p className="text-gray-600">Tech Corp</p>
                <p className="text-sm text-gray-500">
                  Jan 2022 - Present • 2 yrs
                </p>
                <p className="text-sm text-gray-700 mt-2">
                  Developing web applications using React, Node.js, and MongoDB.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Activity Section */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Recent Activity
          </h2>
          {loading ? (
            <div className="flex justify-center py-12">
              <ClipLoader color="#0077B5" size={40} />
            </div>
          ) : (
            <div className="space-y-4">
              {postData?.posts?.length > 0 ? (
                postData.posts.map((post) => (
                  <PostCard key={post._id} post={post} />
                ))
              ) : (
                <div className="space-y-4">
                  <p className="text-gray-500 text-center py-8">
                    No recent activity to show
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
