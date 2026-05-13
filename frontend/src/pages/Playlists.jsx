import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { FiFolder, FiPlus, FiLock, FiX } from 'react-icons/fi';
import { getUserPlaylists, createPlaylist, deletePlaylist } from '../services/api';

const PlaylistCard = ({ playlist, onDelete }) => (
  <div className="group bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-700 transition-all">
    <Link to={`/playlist/${playlist._id}`} className="block">
      <div className="relative aspect-video bg-zinc-800 overflow-hidden">
        {playlist.videos?.[0]?.thumbnail ? (
          <img src={playlist.videos[0].thumbnail} alt={playlist.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-zinc-600">
            <FiFolder size={36} />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-0.5 rounded backdrop-blur-sm">
          {playlist.videosCount} videos
        </div>
        {!playlist.isPublic && (
          <div className="absolute top-2 left-2">
            <FiLock size={14} className="text-zinc-400" />
          </div>
        )}
      </div>
    </Link>
    <div className="p-4 flex items-start justify-between">
      <div>
        <Link to={`/playlist/${playlist._id}`}
          className="font-semibold text-white hover:text-purple-400 transition-colors line-clamp-1">
          {playlist.name}
        </Link>
        <p className="text-xs text-zinc-500 mt-0.5">{playlist.isPublic ? 'Public' : 'Private'}</p>
      </div>
      <button onClick={() => onDelete(playlist._id)}
        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-zinc-700 text-zinc-400 hover:text-red-400 transition-all">
        <FiX size={16} />
      </button>
    </div>
  </div>
);

export const Playlists = () => {
  const { userData } = useSelector((s) => s.auth);
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newName, setNewName]     = useState('');
  const [newDesc, setNewDesc]     = useState('');
  const [creating, setCreating]   = useState(false);

  useEffect(() => {
    if (!userData?._id) return;
    const load = async () => {
      try {
        const res = await getUserPlaylists(userData._id);
        setPlaylists(res.data.data || []);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, [userData]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const res = await createPlaylist({ name: newName, description: newDesc });
      setPlaylists((p) => [res.data.data, ...p]);
      setNewName(''); setNewDesc(''); setShowModal(false);
    } catch (e) { alert('Failed to create playlist.'); }
    finally { setCreating(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this playlist?')) return;
    try {
      await deletePlaylist(id);
      setPlaylists((p) => p.filter((pl) => pl._id !== id));
    } catch { alert('Failed to delete.'); }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-white">Playlists</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-xl font-medium text-sm transition-colors"
        >
          <FiPlus size={18} /> New Playlist
        </button>
      </div>

      {playlists.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-20 text-zinc-500">
          <FiFolder size={48} />
          <p className="text-lg">No playlists yet.</p>
          <button onClick={() => setShowModal(true)} className="text-purple-400 hover:text-purple-300 font-medium">
            Create your first playlist →
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {playlists.map((pl) => (
            <PlaylistCard key={pl._id} playlist={pl} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {/* Create modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">New Playlist</h3>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white">
                <FiX size={20} />
              </button>
            </div>
            <form onSubmit={handleCreate} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Name</label>
                <input value={newName} onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
                  placeholder="My Playlist" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Description (optional)</label>
                <textarea value={newDesc} onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 resize-none"
                  rows={3} placeholder="Describe this playlist..." />
              </div>
              <button type="submit" disabled={creating}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white py-2.5 rounded-xl font-medium transition-colors">
                {creating ? 'Creating...' : 'Create Playlist'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
