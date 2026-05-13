import React, { useEffect, useState } from 'react';
import { VideoCard } from '../components/VideoCard';

export const Home = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data for initial frontend setup until backend is fully hooked up
    const mockVideos = Array.from({ length: 12 }).map((_, i) => ({
      _id: `video-${i}`,
      title: `Building a Modern Video Platform - Part ${i + 1}`,
      thumbnail: `https://picsum.photos/seed/${i}/640/360`,
      views: Math.floor(Math.random() * 1000000),
      createdAt: new Date().toISOString(),
      duration: Math.floor(Math.random() * 1200) + 60,
      owner: {
        _id: 'user-1',
        username: 'videoOnn Official',
        avatar: 'https://picsum.photos/seed/avatar/100/100'
      }
    }));
    
    setVideos(mockVideos);
    setLoading(false);
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-white mb-6">Recommended</h2>
      
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-3">
              <div className="w-full aspect-video bg-zinc-800 rounded-xl animate-pulse"></div>
              <div className="flex gap-3 px-1">
                <div className="w-9 h-9 bg-zinc-800 rounded-full animate-pulse flex-shrink-0"></div>
                <div className="flex flex-col gap-2 w-full">
                  <div className="h-4 bg-zinc-800 rounded w-full animate-pulse"></div>
                  <div className="h-4 bg-zinc-800 rounded w-2/3 animate-pulse"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {videos.map(video => (
            <VideoCard key={video._id} video={video} />
          ))}
        </div>
      )}
    </div>
  );
};
