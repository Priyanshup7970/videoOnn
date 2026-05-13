import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { FiMenu, FiSearch, FiVideo, FiUpload, FiUser, FiLogOut, FiSettings, FiBarChart2, FiChevronDown } from 'react-icons/fi';
import { logout as storeLogout } from '../features/authSlice';
import { logout } from '../services/api';

export const Navbar = ({ toggleSidebar }) => {
  const { userData, status: isLoggedIn } = useSelector((s) => s.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [query, setQuery] = useState('');
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => { if (!dropdownRef.current?.contains(e.target)) setDropdownOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = async () => {
    try { await logout(); } catch {}
    dispatch(storeLogout());
    navigate('/login');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    navigate(`/?search=${encodeURIComponent(query.trim())}`);
  };

  return (
    <nav className="h-16 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800 flex items-center justify-between px-4 sticky top-0 z-50 flex-shrink-0">
      {/* Left */}
      <div className="flex items-center gap-3">
        <button onClick={toggleSidebar}
          className="p-2 rounded-full hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors">
          <FiMenu size={22} />
        </button>
        <Link to="/" className="flex items-center gap-2 group">
          <FiVideo className="text-purple-500 group-hover:text-purple-400 transition-colors" size={26} />
          <span className="text-xl font-bold tracking-tight text-white hidden sm:block">videoOnn</span>
        </Link>
      </div>

      {/* Center – Search */}
      <form onSubmit={handleSearch} className="flex-1 max-w-xl px-6 hidden md:flex">
        <div className="flex items-center w-full bg-zinc-900 border border-zinc-800 rounded-full overflow-hidden focus-within:border-purple-500 focus-within:ring-1 focus-within:ring-purple-500 transition-all">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search..."
            className="flex-1 bg-transparent px-5 py-2 outline-none text-sm text-white placeholder-zinc-500"
          />
          <button type="submit" className="px-5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white border-l border-zinc-700 transition-colors">
            <FiSearch size={18} />
          </button>
        </div>
      </form>

      {/* Right */}
      <div className="flex items-center gap-3">
        {isLoggedIn ? (
          <>
            <Link to="/upload"
              className="hidden sm:flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors">
              <FiUpload size={16} /> Upload
            </Link>
            {/* User menu */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen((o) => !o)}
                className="flex items-center gap-2 group"
              >
                <img
                  src={userData?.avatar}
                  alt={userData?.username}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-transparent group-hover:ring-purple-500 transition-all"
                />
                <FiChevronDown size={14} className={`text-zinc-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 top-12 w-56 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-zinc-800">
                    <p className="font-semibold text-white text-sm">{userData?.fullName}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">@{userData?.username}</p>
                  </div>
                  <div className="py-1">
                    <Link to={`/channel/${userData?.username}`} onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors">
                      <FiUser size={15} /> Your Channel
                    </Link>
                    <Link to="/dashboard" onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors">
                      <FiBarChart2 size={15} /> Dashboard
                    </Link>
                    <Link to="/settings" onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors">
                      <FiSettings size={15} /> Settings
                    </Link>
                  </div>
                  <div className="border-t border-zinc-800 py-1">
                    <button onClick={handleLogout}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-zinc-800 hover:text-red-300 transition-colors w-full text-left">
                      <FiLogOut size={15} /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <Link to="/login"
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors">
            <FiUser size={16} /> Sign In
          </Link>
        )}
      </div>
    </nav>
  );
};
