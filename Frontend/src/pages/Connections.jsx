import { useState } from "react";
import { useSelector } from "react-redux";
import {
  useGetConnectionsQuery,
  useSendConnectionRequestMutation,
  useRespondToConnectionMutation,
  useCreateOrGetChatMutation,
} from "../store/api";
import Header from "../components/Layout/Header";
import {
  UserPlusIcon,
  CheckIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";

const Connections = () => {
  const [activeTab, setActiveTab] = useState("connections");
  const { user } = useSelector((state) => state.auth);
  const { data: connectionsData, isLoading } = useGetConnectionsQuery();
  const [sendConnectionRequest] = useSendConnectionRequestMutation();
  const [respondToConnection] = useRespondToConnectionMutation();
  const [createOrGetChat] = useCreateOrGetChatMutation();

  const navigate = useNavigate();

  const handleSendMessage = async (participantId) => {
    try {
      const chat = await createOrGetChat(participantId).unwrap();
      console.log("Chat Data : ", chat);
      navigate(`/chat`);
    } catch (error) {
      navigate(`/chat`);
      console.log(error);
    }
  }; //

  const handleSendRequest = async (userId) => {
    try {
      await sendConnectionRequest(userId).unwrap();
      toast.success("Connection request sent!");
    } catch (error) {
      toast.error("Failed to send request");
    }
  };

  const handleRespondToRequest = async (requestId, action) => {
    try {
      await respondToConnection({ requestId, action }).unwrap();
      toast.success(`Request ${action}ed successfully!`);
    } catch (error) {
      toast.error(`Failed to ${action} request`);
    }
  };

  const tabs = [
    {
      key: "connections",
      label: "My Connections",
      count: connectionsData?.connections?.length || 0,
    },
    {
      key: "requests",
      label: "Requests",
      count: connectionsData?.pendingRequests?.length || 0,
    },
  ];

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

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="card">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.key
                      ? "border-linkedin-blue text-blue-500"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 cursor-pointer"
                  }`}
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2 rounded-full text-xs">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="p-6">
            {activeTab === "connections" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {connectionsData?.connections?.map((connection) => (
                  <div
                    key={connection._id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="text-center">
                      <img
                        src={connection.user.avatar || "/images/profile.png"}
                        alt={connection.user.name}
                        className="w-20 h-20 rounded-full mx-auto mb-3 object-cover"
                      />
                      <h3 className="font-semibold text-gray-900">
                        {connection.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3">
                        {connection.headline}
                      </p>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            handleSendMessage(connection.user._id);
                          }}
                          className="flex-1 bg-white hover:bg-gray-50 text-blue-500 border border-linkedin-blue px-6 py-2 rounded-lg font-medium transition-all duration-200  cursor-pointer text-sm "
                        >
                          Message
                        </button>
                        <Link
                          to={`/profile/${connection.user._id}`}
                          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105  text-sm "
                        >
                          View Profile
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}

                {(!connectionsData?.connections ||
                  connectionsData.connections.length === 0) && (
                  <div className="col-span-full text-center py-12">
                    <UserPlusIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No connections yet
                    </h3>
                    <p className="text-gray-500">
                      Start connecting with people to grow your network!
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "requests" && (
              <div className="space-y-4">
                {connectionsData?.pendingRequests?.map((request) => (
                  <div
                    key={request.from._id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <img
                        src={request.from.avatar || "/images/profile.png"}
                        alt={request.from.name}
                        className="w-15 h-15 rounded-full object-cover"
                      />
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {request.from.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {request.from.headline}
                        </p>
                        <p className="text-xs text-gray-500">
                          Wants to connect
                        </p>
                      </div>
                    </div>

                    <div className="flex">
                      <button
                        onClick={() =>
                          handleRespondToRequest(request._id, "reject")
                        }
                        className="cursor-pointer flex items-center space-x-1 text-gray-600 hover:bg-gray-100 rounded-full p-3 transition-colors"
                      >
                        <XMarkIcon className="w-5 h-5 text-red-500" />
                      </button>
                      <button
                        onClick={() =>
                          handleRespondToRequest(request._id, "accept")
                        }
                        className="cursor-pointer flex items-center space-x-1 hover:bg-gray-100 rounded-full p-3 transition-colors hover:scale-105 text-blue-400"
                      >
                        <CheckIcon className="w-5 h-5" />
                        {/* <span>Accept</span> */}
                      </button>
                    </div>
                  </div>
                ))}

                {(!connectionsData?.pendingRequests ||
                  connectionsData.pendingRequests.length === 0) && (
                  <div className="text-center py-12">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No pending requests
                    </h3>
                    <p className="text-gray-500">
                      You have no connection requests at the moment.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Connections;
