import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { FiVideo } from 'react-icons/fi';
import { login as storeLogin } from '../features/authSlice';
import { api } from '../services/api';

export const Register = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    username: '',
    password: ''
  });
  const [avatar, setAvatar] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setAvatar(e.target.files[0]);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = new FormData();
      data.append('fullName', formData.fullName);
      data.append('email', formData.email);
      data.append('username', formData.username);
      data.append('password', formData.password);
      if (avatar) {
        data.append('avatar', avatar);
      } else {
        throw new Error('Avatar is required');
      }

      const response = await api.post('/users/register', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const userData = response.data.data.user;
      
      // Attempt login immediately after registration
      dispatch(storeLogin(userData));
      navigate('/');
    } catch (err) {
      setError(err.message || err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-4 py-12">
      <div className="w-full max-w-[500px] bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-2xl p-8 shadow-2xl">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-purple-600/20 rounded-full flex items-center justify-center mb-4">
            <FiVideo className="text-purple-500" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-white">Create an Account</h2>
          <p className="text-zinc-400 mt-2">Join videoOnn to upload and share videos</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="flex flex-col gap-5">
          <Input 
            label="Full Name" 
            type="text" 
            name="fullName"
            placeholder="John Doe"
            value={formData.fullName}
            onChange={handleInputChange}
            required 
          />
          <Input 
            label="Username" 
            type="text" 
            name="username"
            placeholder="johndoe123"
            value={formData.username}
            onChange={handleInputChange}
            required 
          />
          <Input 
            label="Email" 
            type="email" 
            name="email"
            placeholder="john@example.com"
            value={formData.email}
            onChange={handleInputChange}
            required 
          />
          <Input 
            label="Password" 
            type="password" 
            name="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleInputChange}
            required 
          />
          <Input 
            label="Avatar" 
            type="file" 
            accept="image/*"
            onChange={handleFileChange}
            required 
            className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-700 cursor-pointer"
          />
          
          <Button type="submit" fullWidth disabled={loading} className="mt-2">
            {loading ? 'Creating account...' : 'Sign Up'}
          </Button>
        </form>

        <div className="mt-8 text-center text-sm text-zinc-400">
          <p>Already have an account? <Link to="/login" className="text-purple-400 hover:text-purple-300 font-medium transition-colors">Sign in</Link></p>
        </div>
      </div>
    </div>
  );
};
