import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FiThumbsUp, FiShare2, FiSave, FiSend, FiEye } from 'react-icons/fi';
import { getVideoById, getVideoComments, toggleVideoLike, addComment, toggleSubscription } from '../services/api';

export const VideoDetail = () => {
  const { videoId } = useParams();
  const { userData, status: isLoggedIn } = useSelector((s) => s.auth);

  const [video, setVideo]       = useState(null);
  const [comments, setComments] = useState([]);
  const [liked, setLiked]       = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading]   = useState(true);
  const [commentsLoading, setCommentsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getVideoById(videoId);
        const v = res.data.data;
        setVideo(v);
        setLiked(v.isLiked || false);
        setSubscribed(v.isSubscribed || false);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, [videoId]);

  useEffect(() => {
    const loadComments = async () => {
      try {
        const res = await getVideoComments(videoId);
        setComments(res.data.data.comments || []);
      } catch (e) { console.error(e); }
      finally { setCommentsLoading(false); }
    };
    loadComments();
  }, [videoId]);

  const handleLike = async () => {
    if (!isLoggedIn) return;
    try {
      await toggleVideoLike(videoId);
      setLiked((l) => !l);
      setVideo((v) => ({ ...v, likesCount: v.likesCount + (liked ? -1 : 1) }));
    } catch (e) { console.error(e); }
  };

  const handleSubscribe = async () => {
    if (!isLoggedIn || !video) return;
    try {
      await toggleSubscription(video.owner._id);
      setSubscribed((s) => !s);
    } catch (e) { console.error(e); }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || !isLoggedIn) return;
    try {
      const res = await addComment(videoId, commentText);
      setComments((c) => [res.data.data, ...c]);
      setCommentText('');
    } catch (e) { console.error(e); }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!video) return <div className="p-8 text-zinc-400">Video not found.</div>;

  return (
    <div className="p-4 md:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-[1400px] mx-auto">
      {/* Main column */}
      <div className="lg:col-span-2 flex flex-col gap-4">
        {/* Video player */}
        <div className="w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl">
          <video
            src={video.videoFile}
            controls
            autoPlay
            className="w-full h-full object-contain"
            poster={video.thumbnail}
          />
        </div>

        {/* Title & meta */}
        <h1 className="text-xl md:text-2xl font-bold text-white leading-snug">{video.title}</h1>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Channel info */}
          <div className="flex items-center gap-3">
            <Link to={`/channel/${video.owner?.username}`}>
              <img src={video.owner?.avatar} alt={video.owner?.username}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-purple-500/40" />
            </Link>
            <div>
              <Link to={`/channel/${video.owner?.username}`}
                className="font-semibold text-white hover:text-purple-400 transition-colors">
                {video.owner?.username}
              </Link>
              <p className="text-xs text-zinc-400">{video.subscribersCount} subscribers</p>
            </div>
            <button
              onClick={handleSubscribe}
              className={`ml-2 px-4 py-1.5 rounded-full font-medium text-sm transition-all ${
                subscribed
                  ? 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
                  : 'bg-purple-600 text-white hover:bg-purple-700'
              }`}
            >
              {subscribed ? 'Subscribed' : 'Subscribe'}
            </button>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleLike}
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm transition-all ${
                liked ? 'bg-purple-600 text-white' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              }`}
            >
              <FiThumbsUp size={16} /> {video.likesCount || 0}
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-full text-sm transition-all">
              <FiShare2 size={16} /> Share
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-full text-sm transition-all">
              <FiSave size={16} /> Save
            </button>
          </div>
        </div>

        {/* Description */}
        <div className="bg-zinc-900 rounded-xl p-4 text-sm text-zinc-300 leading-relaxed">
          <div className="flex items-center gap-3 text-zinc-400 text-xs mb-2">
            <span className="flex items-center gap-1"><FiEye size={13} /> {video.views?.toLocaleString()} views</span>
            <span>•</span>
            <span>{new Date(video.createdAt).toLocaleDateString()}</span>
          </div>
          <p className="whitespace-pre-wrap">{video.description || 'No description.'}</p>
        </div>

        {/* Comments */}
        <div className="mt-2">
          <h3 className="text-lg font-semibold text-white mb-4">{comments.length} Comments</h3>

          {isLoggedIn && (
            <form onSubmit={handleComment} className="flex gap-3 mb-6">
              <img src={userData?.avatar} alt="" className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
              <div className="flex-1 flex gap-2">
                <input
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1 bg-zinc-900 border border-zinc-800 rounded-full px-4 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
                />
                <button type="submit" className="p-2 bg-purple-600 hover:bg-purple-700 text-white rounded-full transition-colors">
                  <FiSend size={16} />
                </button>
              </div>
            </form>
          )}

          {commentsLoading ? (
            <div className="flex flex-col gap-4">
              {[1,2,3].map(i => (
                <div key={i} className="flex gap-3">
                  <div className="w-9 h-9 bg-zinc-800 rounded-full animate-pulse flex-shrink-0" />
                  <div className="flex-1 flex flex-col gap-2">
                    <div className="h-3 bg-zinc-800 rounded w-32 animate-pulse" />
                    <div className="h-3 bg-zinc-800 rounded w-full animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              {comments.map((c) => (
                <div key={c._id} className="flex gap-3">
                  <img src={c.owner?.avatar} alt="" className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white">{c.owner?.username}</span>
                      <span className="text-xs text-zinc-500">{new Date(c.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-zinc-300 mt-0.5">{c.content}</p>
                  </div>
                </div>
              ))}
              {comments.length === 0 && <p className="text-zinc-500 text-sm">No comments yet.</p>}
            </div>
          )}
        </div>
      </div>

      {/* Sidebar — up next */}
      <div className="flex flex-col gap-3">
        <h3 className="font-semibold text-white text-base">Up Next</h3>
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex gap-3">
            <div className="w-40 aspect-video bg-zinc-800 rounded-lg animate-pulse flex-shrink-0" />
            <div className="flex flex-col gap-2 flex-1">
              <div className="h-3 bg-zinc-800 rounded animate-pulse" />
              <div className="h-3 bg-zinc-800 rounded w-2/3 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
