import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Eye, EyeOff, LogOut, User as UserIcon, ShoppingBag } from 'lucide-react';
import AdminPanel from '../components/Admin/AdminPanel';
import { Profile } from '../lib/supabase';

interface AdminProps {
  onNavigate: (path: string) => void;
  currentUser: any;
  currentProfile: Profile | null;
  onLogout: () => void;
  onCheckUser: () => void;
}

export default function Admin({ onNavigate, currentUser, currentProfile, onLogout, onCheckUser }: AdminProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (currentUser && currentProfile) {
      if (currentProfile.role !== 'admin') {
        alert('Access denied. Admin privileges required.');
        onNavigate('/');
      }
    }
  }, [currentUser, currentProfile, onNavigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: username,
        password,
      });

      if (signInError) {
        if (signInError.message.includes('Invalid login credentials')) {
          throw new Error('Invalid username or password');
        }
        throw signInError;
      }

      if (data.session) {
        await onCheckUser();
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'An error occurred during login');
      setLoading(false);
    }
  };

  if (currentUser && currentProfile && currentProfile.role === 'admin') {
    return (
      <div>
        <div className="bg-white shadow-sm border-b mb-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-2 sm:space-x-4">
                <h1
                  onClick={() => onNavigate('/')}
                  className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-[#f5b04c] to-[#2a5f64] bg-clip-text text-transparent cursor-pointer"
                >
                  MK MALL
                </h1>
                <span className="px-2 py-1 bg-[#f5b04c] text-white text-xs rounded-full">Admin</span>
              </div>
              <div className="flex items-center space-x-2 sm:space-x-4">
                <div className="hidden md:flex items-center space-x-2">
                  <UserIcon className="w-5 h-5" />
                  <span className="font-medium text-sm">{currentProfile.email}</span>
                </div>
                <button
                  onClick={() => onNavigate('/')}
                  className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <ShoppingBag className="w-5 h-5" />
                  <span className="hidden sm:inline">Shop</span>
                </button>
                <button
                  onClick={onLogout}
                  className="flex items-center space-x-1 sm:space-x-2 text-gray-700 hover:text-red-600 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
        <AdminPanel />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-lg">
        <div>
          <div className="mb-4 p-4 bg-gradient-to-r from-[#f5b04c] to-[#2a5f64] text-white text-center rounded-lg">
            <h2 className="text-xl font-bold">Admin Access</h2>
            <p className="text-sm mt-1">Please login with admin credentials</p>
          </div>
          <h2 className="text-center text-3xl font-bold bg-gradient-to-r from-[#f5b04c] to-[#2a5f64] bg-clip-text text-transparent">
            MK MALL
          </h2>
          <h3 className="mt-4 text-center text-2xl font-bold text-gray-900">Admin Login</h3>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Admin Username
              </label>
              <input
                id="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f5b04c] focus:border-transparent"
                placeholder="Enter admin username"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative mt-1">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f5b04c] focus:border-transparent"
                  placeholder="Enter admin password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center bg-gradient-to-r from-[#f5b04c] to-[#2a5f64] text-white py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-300 disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Admin Login'}
          </button>

          <div className="text-center text-sm text-gray-600">
            <button
              type="button"
              onClick={() => onNavigate('/')}
              className="text-[#2a5f64] hover:text-[#1e4a4d] font-medium hover:underline"
            >
              Back to Home
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
