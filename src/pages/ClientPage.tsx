import { useNavigate } from 'react-router-dom';
import { Profile } from '../lib/supabase';
import Dashboard from '../components/Client/Dashboard';
import { LogOut, UserIcon } from 'lucide-react';

interface ClientPageProps {
  profile: Profile;
  onLogout: () => void;
  onBalanceUpdate: () => void;
}

export default function ClientPage({ profile, onLogout, onBalanceUpdate }: ClientPageProps) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <img src="/logo55555.svg" alt="ML MALL" className="h-16 w-auto" />
            <div className="flex items-center space-x-2">
              {profile.is_admin && (
                <button
                  onClick={() => navigate('/admin')}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-[#f5b04c] text-white hover:bg-[#e09f3a] transition-colors"
                >
                  <UserIcon className="w-5 h-5" />
                  <span className="hidden sm:inline text-sm">Admin</span>
                </button>
              )}
              <button
                onClick={onLogout}
                className="flex items-center space-x-2 text-gray-700 hover:text-red-600 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span className="hidden sm:inline text-sm">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <Dashboard profile={profile} onBalanceUpdate={onBalanceUpdate} />
    </div>
  );
}
