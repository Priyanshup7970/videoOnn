import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { FiMessageSquare, FiThumbsUp, FiTrash2, FiEdit2, FiSend, FiX, FiCheck } from 'react-icons/fi';
import { getUserTweets, createTweet, updateTweet, deleteTweet, toggleTweetLike } from '../services/api';

const TweetCard = ({ tweet, isOwner, onDelete, onEdit, onLike }) => {
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(tweet.content);

  const submitEdit = async () => {
    if (!editText.trim() || editText === tweet.content) { setEditing(false); return; }
    await onEdit(tweet._id, editText);
    setEditing(false);
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition-all">
      <div className="flex gap-4">
        <Link to={`/channel/${tweet.owner?.username}`} className="flex-shrink-0">
          <img src={tweet.owner?.avatar} alt={tweet.owner?.username}
            className="w-10 h-10 rounded-full object-cover" />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <Link to={`/channel/${tweet.owner?.username}`}
              className="font-semibold text-white hover:text-purple-400 transition-colors text-sm">
              {tweet.owner?.username}
            </Link>
            <span className="text-xs text-zinc-500">{new Date(tweet.createdAt).toLocaleDateString()}</span>
          </div>

          {editing ? (
            <div className="flex gap-2 items-center">
              <input value={editText} onChange={(e) => setEditText(e.target.value)}
                className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-purple-500" />
              <button onClick={submitEdit} className="p-1.5 text-green-400 hover:text-green-300"><FiCheck size={16} /></button>
              <button onClick={() => { setEditing(false); setEditText(tweet.content); }}
                className="p-1.5 text-zinc-400 hover:text-white"><FiX size={16} /></button>
            </div>
          ) : (
            <p className="text-zinc-200 text-sm leading-relaxed">{tweet.content}</p>
          )}

          <div className="flex items-center gap-4 mt-3">
            <button onClick={() => onLike(tweet._id)}
              className={`flex items-center gap-1.5 text-sm transition-colors ${
                tweet.isLiked ? 'text-purple-400' : 'text-zinc-500 hover:text-purple-400'
              }`}>
              <FiThumbsUp size={14} /> {tweet.likesCount || 0}
            </button>
            {isOwner && !editing && (
              <>
                <button onClick={() => setEditing(true)}
                  className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-blue-400 transition-colors">
                  <FiEdit2 size={14} />
                </button>
                <button onClick={() => onDelete(tweet._id)}
                  className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-red-400 transition-colors">
                  <FiTrash2 size={14} />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const Tweets = () => {
  const { userData, status: isLoggedIn } = useSelector((s) => s.auth);
  const [tweets, setTweets]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText]       = useState('');
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    if (!userData?._id) return;
    const load = async () => {
      try {
        const res = await getUserTweets(userData._id);
        setTweets(res.data.data || []);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, [userData]);

  const handlePost = async (e) => {
    e.preventDefault();
    if (!text.trim() || !isLoggedIn) return;
    setPosting(true);
    try {
      const res = await createTweet(text);
      setTweets((t) => [res.data.data, ...t]);
      setText('');
    } catch { alert('Failed to post.'); }
    finally { setPosting(false); }
  };

  const handleDelete = async (id) => {
    try {
      await deleteTweet(id);
      setTweets((t) => t.filter((tw) => tw._id !== id));
    } catch { alert('Failed to delete.'); }
  };

  const handleEdit = async (id, content) => {
    try {
      const res = await updateTweet(id, content);
      setTweets((t) => t.map((tw) => tw._id === id ? res.data.data : tw));
    } catch { alert('Failed to update.'); }
  };

  const handleLike = async (id) => {
    if (!isLoggedIn) return;
    try {
      await toggleTweetLike(id);
      setTweets((t) => t.map((tw) =>
        tw._id === id
          ? { ...tw, isLiked: !tw.isLiked, likesCount: tw.likesCount + (tw.isLiked ? -1 : 1) }
          : tw
      ));
    } catch { console.error('Like failed'); }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
        <FiMessageSquare className="text-purple-500" /> Community
      </h1>

      {/* Compose */}
      {isLoggedIn && (
        <form onSubmit={handlePost} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-6 flex gap-4">
          <img src={userData?.avatar} alt="" className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
          <div className="flex-1 flex flex-col gap-3">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Share something with your community..."
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 resize-none leading-relaxed"
              rows={3}
            />
            <div className="flex justify-between items-center">
              <span className="text-xs text-zinc-600">{text.length}/500</span>
              <button type="submit" disabled={posting || !text.trim()}
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                <FiSend size={14} /> {posting ? 'Posting...' : 'Post'}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Tweets feed */}
      <div className="flex flex-col gap-4">
        {tweets.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-zinc-500">
            <FiMessageSquare size={40} />
            <p>No posts yet.</p>
          </div>
        ) : (
          tweets.map((tw) => (
            <TweetCard
              key={tw._id}
              tweet={tw}
              isOwner={userData?._id === tw.owner?._id}
              onDelete={handleDelete}
              onEdit={handleEdit}
              onLike={handleLike}
            />
          ))
        )}
      </div>
    </div>
  );
};
