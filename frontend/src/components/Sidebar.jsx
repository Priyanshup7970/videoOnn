import React from 'react';
import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  FiHome, FiTrendingUp, FiYoutube, FiClock, FiThumbsUp,
  FiFolder, FiBarChart2, FiUpload, FiMessageSquare
} from 'react-icons/fi';

export const Sidebar = ({ isOpen }) => {
  const { status: isLoggedIn } = useSelector((s) => s.auth);

  const mainItems = [
    { icon: <FiHome size={20} />, label: 'Home', path: '/' },
    { icon: <FiTrendingUp size={20} />, label: 'Trending', path: '/trending' },
    { icon: <FiYoutube size={20} />, label: 'Subscriptions', path: '/subscriptions' },
  ];

  const libraryItems = [
    { icon: <FiClock size={20} />, label: 'History', path: '/history' },
    { icon: <FiThumbsUp size={20} />, label: 'Liked Videos', path: '/liked' },
    { icon: <FiFolder size={20} />, label: 'Playlists', path: '/playlists' },
  ];

  const creatorItems = [
    { icon: <FiUpload size={20} />, label: 'Upload', path: '/upload' },
    { icon: <FiBarChart2 size={20} />, label: 'Dashboard', path: '/dashboard' },
    { icon: <FiMessageSquare size={20} />, label: 'Community', path: '/tweets' },
  ];

  const NavItem = ({ item }) => (
    <NavLink
      to={item.path}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg transition-all text-sm ${
          isActive
            ? 'bg-zinc-800 text-white font-semibold'
            : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
        }`
      }
      end={item.path === '/'}
    >
      <span className="flex-shrink-0">{item.icon}</span>
      <span>{item.label}</span>
    </NavLink>
  );

  const SectionLabel = ({ label }) => (
    <p className="px-6 pt-4 pb-1 text-xs font-semibold uppercase tracking-wider text-zinc-600">{label}</p>
  );

  return (
    <aside className={`bg-zinc-950 border-r border-zinc-800 transition-all duration-300 overflow-y-auto overflow-x-hidden flex-shrink-0 ${isOpen ? 'w-56' : 'w-0'}`}>
      <div className="flex flex-col py-3 w-56">
        {/* Main */}
        <div className="flex flex-col gap-0.5">
          {mainItems.map((item) => <NavItem key={item.path} item={item} />)}
        </div>

        <hr className="border-zinc-800 my-3 mx-4" />

        {/* Library */}
        <SectionLabel label="Library" />
        <div className="flex flex-col gap-0.5">
          {libraryItems.map((item) => <NavItem key={item.path} item={item} />)}
        </div>

        {/* Creator — only show when logged in */}
        {isLoggedIn && (
          <>
            <hr className="border-zinc-800 my-3 mx-4" />
            <SectionLabel label="Creator" />
            <div className="flex flex-col gap-0.5">
              {creatorItems.map((item) => <NavItem key={item.path} item={item} />)}
            </div>
          </>
        )}
      </div>
    </aside>
  );
};
