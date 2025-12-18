import { Profile } from '../../lib/supabase';
import { Copy } from 'lucide-react';

interface ProfileViewProps {
  profile: Profile;
}

export default function ProfileView({ profile }: ProfileViewProps) {
  const copyReferralCode = () => {
    navigator.clipboard.writeText(profile.referral_code);
    alert('Referral code copied!');
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6">Profile Information</h2>

      <div className="space-y-4">
        <div className="border-b pb-4">
          <label className="text-sm text-gray-600 block mb-1">Full Name</label>
          <p className="text-lg font-medium text-gray-800">{profile.full_name || 'Not set'}</p>
        </div>

        <div className="border-b pb-4">
          <label className="text-sm text-gray-600 block mb-1">Email</label>
          <p className="text-lg font-medium text-gray-800">{profile.email}</p>
        </div>

        <div className="border-b pb-4">
          <label className="text-sm text-gray-600 block mb-1">Balance</label>
          <p className="text-2xl font-bold text-[#f5b04c]">${profile.balance.toFixed(2)}</p>
        </div>

        <div className="border-b pb-4">
          <label className="text-sm text-gray-600 block mb-1">Referral Code</label>
          <div className="flex items-center space-x-2">
            <p className="text-lg font-mono text-gray-800">{profile.referral_code}</p>
            <button
              onClick={copyReferralCode}
              className="p-2 bg-[#f5b04c] text-white rounded-lg hover:bg-[#e5a03c] transition-colors"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="pt-2">
          <label className="text-sm text-gray-600 block mb-1">Account Created</label>
          <p className="text-lg font-medium text-gray-800">
            {new Date(profile.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
}
