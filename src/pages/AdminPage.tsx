import { useNavigate } from 'react-router-dom';
import { Profile } from '../lib/supabase';
import AdminPanel from '../components/Admin/AdminPanel';
import { LogOut, UserIcon, ShoppingBag } from 'lucide-react';

interface AdminPageProps {
  profile: Profile;
  onLogout: () => void;
}

export default function AdminPage({ profile, onLogout }: AdminPageProps) {
  const navigate = useNavigate();

  return (
    <div>
      <div className="bg-white shadow-sm border-b mb-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <h1
                onClick={() => navigate('/')}
                className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-[#f5b04c] to-[#2a5f64] bg-clip-text text-transparent cursor-pointer"
              >
                MK MALL
              </h1>
              <span className="px-2 py-1 bg-[#f5b04c] text-white text-xs rounded-full">Admin</span>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="hidden md:flex items-center space-x-2">
                <UserIcon className="w-5 h-5" />
                <span className="font-medium text-sm">{profile.email}</span>
              </div>
              <button
                onClick={() => navigate('/')}
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
