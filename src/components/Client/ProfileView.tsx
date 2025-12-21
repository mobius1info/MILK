import { Profile } from '../../lib/supabase';

interface ProfileViewProps {
  profile: Profile;
}

export default function ProfileView({ profile }: ProfileViewProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Profile</h2>

      <div className="space-y-4">
        <div className="border-b pb-4">
          <label className="text-sm text-gray-600 block mb-1">Username</label>
          <p className="text-lg font-medium text-gray-800">{profile.username}</p>
        </div>

        <div>
          <label className="text-sm text-gray-600 block mb-1">Email</label>
          <p className="text-lg font-medium text-gray-800">{profile.email}</p>
        </div>
      </div>
    </div>
  );
}
