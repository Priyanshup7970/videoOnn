import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { FiVideo } from 'react-icons/fi';
import { login as storeLogin } from '../features/authSlice';
import { api } from '../services/api';

export const Login = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/users/login', {
        email: identifier.includes('@') ? identifier : undefined,
        username: !identifier.includes('@') ? identifier : undefined,
        password
      });

      const userData = response.data.data.user;
      dispatch(storeLogin(userData));
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-4">
      <div className="w-full max-w-md bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-2xl p-8 shadow-2xl">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-purple-600/20 rounded-full flex items-center justify-center mb-4">
            <FiVideo className="text-purple-500" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-white">Welcome Back</h2>
          <p className="text-zinc-400 mt-2">Sign in to continue to videoOnn</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          <Input 
            label="Email or Username" 
            type="text" 
            placeholder="johndoe or john@example.com"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required 
          />
          <Input 
            label="Password" 
            type="password" 
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required 
          />
          
          <Button type="submit" fullWidth disabled={loading} className="mt-2">
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <div className="mt-8 text-center text-sm text-zinc-400">
          <p>Don't have an account? <Link to="/register" className="text-purple-400 hover:text-purple-300 font-medium transition-colors">Sign up</Link></p>
        </div>
      </div>
    </div>
  );
};
