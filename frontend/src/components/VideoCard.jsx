import React from 'react';
import { Link } from 'react-router-dom';

export const VideoCard = ({ video }) => {
  // Mock time formatting
  const timeAgo = "2 days ago";
  const formattedViews = `${(video.views / 1000).toFixed(1)}k`;

  return (
    <div className="flex flex-col gap-3 group cursor-pointer">
      <Link to={`/video/${video._id}`} className="relative aspect-video rounded-xl overflow-hidden bg-zinc-800">
        <img 
          src={video.thumbnail} 
          alt={video.title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
        />
        <span className="absolute bottom-2 right-2 bg-black/80 text-white text-xs font-medium px-1.5 py-0.5 rounded backdrop-blur-sm">
          {Math.floor(video.duration / 60)}:{String(video.duration % 60).padStart(2, '0')}
        </span>
      </Link>
      
      <div className="flex gap-3 px-1">
        <Link to={`/channel/${video.owner.username}`} className="flex-shrink-0">
          <img 
            src={video.owner.avatar} 
            alt={video.owner.username} 
            className="w-9 h-9 rounded-full object-cover" 
          />
        </Link>
        <div className="flex flex-col overflow-hidden">
          <Link 
            to={`/video/${video._id}`} 
            className="text-white font-medium line-clamp-2 leading-tight group-hover:text-purple-400 transition-colors"
          >
            {video.title}
          </Link>
          <Link 
            to={`/channel/${video.owner.username}`} 
            className="text-zinc-400 text-sm mt-1 hover:text-white transition-colors"
          >
            {video.owner.username}
          </Link>
          <div className="flex items-center text-zinc-400 text-sm mt-0.5 gap-1">
            <span>{formattedViews} views</span>
            <span className="text-[10px]">•</span>
            <span>{timeAgo}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
