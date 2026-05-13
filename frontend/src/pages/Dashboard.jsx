import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiEye, FiThumbsUp, FiUsers, FiVideo, FiUpload, FiTrash2, FiEdit2, FiToggleLeft, FiToggleRight } from 'react-icons/fi';
import { getChannelStats, getChannelVideos, deleteVideo, togglePublishStatus } from '../services/api';

const StatCard = ({ icon, label, value, color }) => (
  <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white ${color}`}>{icon}</div>
    <div>
      <p className="text-zinc-400 text-sm">{label}</p>
      <p className="text-2xl font-bold text-white">{value?.toLocaleString() ?? '—'}</p>
    </div>
  </div>
);

export const Dashboard = () => {
  const [stats, setStats]   = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [sRes, vRes] = await Promise.all([getChannelStats(), getChannelVideos()]);
        setStats(sRes.data.data);
        setVideos(vRes.data.data || []);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const handleDelete = async (videoId) => {
    if (!confirm('Delete this video?')) return;
    try {
      await deleteVideo(videoId);
      setVideos((v) => v.filter((vid) => vid._id !== videoId));
    } catch (e) { alert('Failed to delete video.'); }
  };

  const handleTogglePublish = async (videoId) => {
    try {
      await togglePublishStatus(videoId);
      setVideos((v) => v.map((vid) =>
        vid._id === videoId ? { ...vid, isPublished: !vid.isPublished } : vid
      ));
    } catch (e) { alert('Failed to toggle publish.'); }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto flex flex-col gap-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Channel Dashboard</h1>
          <p className="text-zinc-400 text-sm mt-1">Manage your content and track performance</p>
        </div>
        <Link
          to="/upload"
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors"
        >
          <FiUpload size={18} /> Upload Video
        </Link>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<FiEye size={22} />}      label="Total Views"       value={stats?.totalViews}       color="bg-blue-600" />
        <StatCard icon={<FiThumbsUp size={22} />}  label="Total Likes"       value={stats?.totalLikes}       color="bg-pink-600" />
        <StatCard icon={<FiUsers size={22} />}     label="Subscribers"       value={stats?.totalSubscribers} color="bg-green-600" />
        <StatCard icon={<FiVideo size={22} />}     label="Total Videos"      value={stats?.totalVideos}      color="bg-purple-600" />
      </div>

      {/* Videos table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-zinc-800">
          <h2 className="text-lg font-semibold text-white">Your Videos</h2>
        </div>
        {videos.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-16 text-zinc-500">
            <FiVideo size={48} />
            <p>No videos yet. Upload your first video!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-zinc-500 text-left border-b border-zinc-800">
                  <th className="px-6 py-3 font-medium">Video</th>
                  <th className="px-4 py-3 font-medium text-center">Status</th>
                  <th className="px-4 py-3 font-medium text-center">Views</th>
                  <th className="px-4 py-3 font-medium text-center">Likes</th>
                  <th className="px-4 py-3 font-medium text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {videos.map((v) => (
                  <tr key={v._id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img src={v.thumbnail} alt={v.title}
                          className="w-20 aspect-video object-cover rounded-lg flex-shrink-0" />
                        <div>
                          <p className="font-medium text-white line-clamp-1">{v.title}</p>
                          <p className="text-xs text-zinc-500 mt-0.5">{new Date(v.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        v.isPublished ? 'bg-green-500/10 text-green-400' : 'bg-zinc-700 text-zinc-400'
                      }`}>
                        {v.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center text-zinc-300">{v.views?.toLocaleString()}</td>
                    <td className="px-4 py-4 text-center text-zinc-300">{v.likesCount || 0}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => handleTogglePublish(v._id)}
                          className="p-2 rounded-lg hover:bg-zinc-700 text-zinc-400 hover:text-purple-400 transition-colors"
                          title={v.isPublished ? 'Unpublish' : 'Publish'}>
                          {v.isPublished ? <FiToggleRight size={18} /> : <FiToggleLeft size={18} />}
                        </button>
                        <Link to={`/video/${v._id}/edit`}
                          className="p-2 rounded-lg hover:bg-zinc-700 text-zinc-400 hover:text-blue-400 transition-colors">
                          <FiEdit2 size={18} />
                        </Link>
                        <button onClick={() => handleDelete(v._id)}
                          className="p-2 rounded-lg hover:bg-zinc-700 text-zinc-400 hover:text-red-400 transition-colors">
                          <FiTrash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
