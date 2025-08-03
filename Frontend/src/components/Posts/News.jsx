import React from "react";

const News = () => {
  const topStories = [
    {
      title: "New UPI rules kick in today",
      time: "2d ago",
      readers: "252,517 readers",
    },
    {
      title: "Top cities see salaries rise",
      time: "2d ago",
      readers: "11,183 readers",
    },
    {
      title: "New tariffs cloud India-U.S. trade talks",
      time: "2d ago",
      readers: "6,123 readers",
    },
    {
      title: "Want to stand out? Say hello",
      time: "2d ago",
      readers: "52,790 readers",
    },
    {
      title: "TCS to let go of 12,000 people",
      time: "2d ago",
      readers: "40,632 readers",
    },
  ];

  return (
    <div className="hidden lg:block w-64 bg-white rounded-lg shadow-sm p-4 h-fit sticky top-20">
      <h2 className="font-bold text-xl mb-4">UpNetic News</h2>
      <div className="mb-6">
        <h3 className="font-semibold mb-2">Top stories</h3>
        {topStories.map((story, index) => (
          <div key={index} className="flex justify-between mb-2">
            <div>
              <p className="text-sm">{story.title}</p>
              <p className="text-xs text-gray-500">
                {story.time} • {story.readers}
              </p>
            </div>
          </div>
        ))}
        <button className="text-blue-600 hover:underline mt-2">
          Show more
        </button>
      </div>
      <div className="mb-6">
        <h3 className="font-semibold mb-2">Today’s puzzle</h3>
        <div className="bg-gray-100 p-2 rounded-lg flex items-center justify-between">
          <img
            src="https://i.pinimg.com/736x/a9/7b/0d/a97b0dd9a33ebd44021983891d61b01f.jpg"
            alt="Puzzle"
            className="h-12 w-12 mr-2"
          />
          <div>
            <p className="text-sm">Zip - a quick brain teaser</p>
            <p className="text-xs text-gray-500">Solve in 60s or less!</p>
            <p className="text-xs text-gray-500">7 connections played</p>
          </div>
          <button className="text-blue-600">›</button>
        </div>
      </div>
      <div className="bg-gray-100 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">Promoted</h3>
        <div className="flex flex-col items-center mb-4">
          <img
            src="https://i.pinimg.com/originals/07/60/b5/0760b563bcd4e326252909b8d11fef9f.gif"
            alt="image"
            className="bg-black text-white h-12 w-12 flex items-center justify-center rounded-xl"
          />

          <div className="ml-3">
            <p className="font-semibold">SK</p>
            <p className="text-sm">Karan, Still Haven't Followed Me?</p>
            <p className="text-xs text-gray-500">
              Receive daily or weekly organization updates
            </p>
            <p className="text-xs text-gray-500">
              Sonali & 1 other connection also follow
            </p>
          </div>
        </div>
        <button className="text-blue-600">Follow</button>
      </div>
    </div>
  );
};

export default News;
