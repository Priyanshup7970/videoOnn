import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FiUsers, FiVideo } from 'react-icons/fi';
import { getUserChannelProfile, toggleSubscription } from '../services/api';
import { VideoCard } from '../components/VideoCard';

export const Profile = () => {
  const { username } = useParams();
  const { userData: me, status: isLoggedIn } = useSelector((s) => s.auth);

  const [channel, setChannel]     = useState(null);
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading]     = useState(true);
  const [activeTab, setActiveTab] = useState('videos');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getUserChannelProfile(username);
        const c = res.data.data;
        setChannel(c);
        setSubscribed(c.isSubscribed || false);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, [username]);

  const handleSubscribe = async () => {
    if (!isLoggedIn || !channel) return;
    try {
      await toggleSubscription(channel._id);
      setSubscribed((s) => !s);
      setChannel((c) => ({
        ...c,
        subscribersCount: c.subscribersCount + (subscribed ? -1 : 1),
      }));
    } catch (e) { console.error(e); }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!channel) return <div className="p-8 text-zinc-400">Channel not found.</div>;

  const isOwner = me?.username === channel.username;

  return (
    <div className="flex flex-col">
      {/* Cover image */}
      <div className="relative h-48 md:h-64 bg-zinc-800 overflow-hidden">
        {channel.coverImage ? (
          <img src={channel.coverImage} alt="cover" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-purple-900/40 to-zinc-900" />
        )}
      </div>

      {/* Profile info */}
      <div className="px-4 md:px-8 pb-6 border-b border-zinc-800">
        <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12 sm:-mt-14">
          <img
            src={channel.avatar}
            alt={channel.username}
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-zinc-950 ring-2 ring-purple-500/40 flex-shrink-0"
          />
          <div className="flex flex-1 flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
            <div>
              <h1 className="text-2xl font-bold text-white">{channel.fullName}</h1>
              <p className="text-zinc-400 text-sm">@{channel.username}</p>
              <div className="flex items-center gap-4 mt-2 text-sm text-zinc-400">
                <span className="flex items-center gap-1">
                  <FiUsers size={14} /> {channel.subscribersCount?.toLocaleString()} subscribers
                </span>
                <span className="flex items-center gap-1">
                  <FiVideo size={14} /> {channel.channelsSubscribedToCount} subscribed
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {isOwner ? (
                <Link to="/settings"
                  className="px-5 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-medium text-sm transition-colors">
                  Edit Channel
                </Link>
              ) : (
                <button
                  onClick={handleSubscribe}
                  className={`px-6 py-2 rounded-xl font-medium text-sm transition-all ${
                    subscribed
                      ? 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
                      : 'bg-purple-600 text-white hover:bg-purple-700'
                  }`}
                >
                  {subscribed ? 'Subscribed' : 'Subscribe'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-800 px-4 md:px-8">
        {['videos', 'playlists', 'about'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-4 text-sm font-medium capitalize border-b-2 transition-colors ${
              activeTab === tab
                ? 'border-purple-500 text-white'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="p-4 md:p-8">
        {activeTab === 'videos' && (
          channel.videos?.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {channel.videos.map((v) => (
                <VideoCard key={v._id} video={{ ...v, owner: channel }} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 py-16 text-zinc-500">
              <FiVideo size={40} />
              <p>No videos yet.</p>
            </div>
          )
        )}
        {activeTab === 'playlists' && (
          <div className="text-zinc-400 py-16 text-center">Playlists coming soon.</div>
        )}
        {activeTab === 'about' && (
          <div className="max-w-2xl">
            <h3 className="font-semibold text-white mb-2">About</h3>
            <p className="text-zinc-300 text-sm leading-relaxed">{channel.description || 'No description provided.'}</p>
          </div>
        )}
      </div>
    </div>
  );
};
