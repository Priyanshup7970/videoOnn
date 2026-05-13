import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { VideoDetail } from './pages/VideoDetail';
import { Dashboard } from './pages/Dashboard';
import { Profile } from './pages/Profile';
import { Subscriptions } from './pages/Subscriptions';
import { Playlists } from './pages/Playlists';
import { Tweets } from './pages/Tweets';
import { Upload } from './pages/Upload';
import { getCurrentUser } from './services/api';
import { login as storeLogin } from './features/authSlice';

// Guard for protected routes
const ProtectedRoute = ({ children }) => {
  const { status } = useSelector((s) => s.auth);
  return status ? children : <Navigate to="/login" replace />;
};

// Restore session on app load
function SessionRestore() {
  const dispatch = useDispatch();
  useEffect(() => {
    getCurrentUser()
      .then((res) => dispatch(storeLogin(res.data.data)))
      .catch(() => {}); // silently fail if not logged in
  }, []);
  return null;
}

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="h-screen flex flex-col bg-zinc-950 text-white overflow-hidden">
      <SessionRestore />
      <Navbar toggleSidebar={() => setSidebarOpen((o) => !o)} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar isOpen={sidebarOpen} />
        <main className="flex-1 overflow-y-auto">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/video/:videoId" element={<VideoDetail />} />
            <Route path="/channel/:username" element={<Profile />} />

            {/* Protected routes */}
            <Route path="/subscriptions" element={<ProtectedRoute><Subscriptions /></ProtectedRoute>} />
            <Route path="/playlists" element={<ProtectedRoute><Playlists /></ProtectedRoute>} />
            <Route path="/tweets" element={<ProtectedRoute><Tweets /></ProtectedRoute>} />
            <Route path="/upload" element={<ProtectedRoute><Upload /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;
