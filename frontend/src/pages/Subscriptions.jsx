import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { FiYoutube } from 'react-icons/fi';
import { getSubscribedChannels } from '../services/api';
import { VideoCard } from '../components/VideoCard';

export const Subscriptions = () => {
  const { userData } = useSelector((s) => s.auth);
  const [channels, setChannels] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    if (!userData?._id) return;
    const load = async () => {
      try {
        const res = await getSubscribedChannels(userData._id);
        setChannels(res.data.data || []);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, [userData]);

  if (loading) return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-8">Subscriptions</h1>

      {channels.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-20 text-zinc-500">
          <FiYoutube size={48} />
          <p className="text-lg">You haven't subscribed to any channels yet.</p>
          <Link to="/" className="text-purple-400 hover:text-purple-300 font-medium">Discover channels →</Link>
        </div>
      ) : (
        <>
          {/* Channel strip */}
          <div className="flex gap-4 pb-4 mb-8 overflow-x-auto scrollbar-thin">
            {channels.map((ch) => (
              <Link key={ch._id} to={`/channel/${ch.subscribedChannel?.username}`}
                className="flex flex-col items-center gap-2 flex-shrink-0">
                <img src={ch.subscribedChannel?.avatar} alt={ch.subscribedChannel?.username}
                  className="w-16 h-16 rounded-full object-cover ring-2 ring-purple-500/40 hover:ring-purple-500 transition-all" />
                <span className="text-xs text-zinc-400 max-w-[64px] truncate text-center">
                  {ch.subscribedChannel?.username}
                </span>
              </Link>
            ))}
          </div>

          {/* Latest videos from subscriptions */}
          <h2 className="text-lg font-semibold text-white mb-4">Latest</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {channels.flatMap((ch) =>
              (ch.subscribedChannel?.latestVideos || []).map((v) => (
                <VideoCard key={v._id} video={{ ...v, owner: ch.subscribedChannel }} />
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
};
