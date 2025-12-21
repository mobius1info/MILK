import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Users, Mail, User, DollarSign, Search, RefreshCw, Award, Zap } from 'lucide-react';

interface Profile {
  id: string;
  email: string;
  username: string;
  balance: number;
  created_at: string;
  referral_code: string;
  referred_by: string | null;
  role: string;
  combo_enabled: boolean;
  vip_completions_count: number;
}

export default function ClientsManagement() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchProfiles();
  }, []);

  async function fetchProfiles() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, username, balance, created_at, referral_code, referred_by, role, combo_enabled, vip_completions_count')
        .eq('role', 'client')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const profilesWithDefaults = (data || []).map(profile => ({
        ...profile,
        combo_enabled: profile.combo_enabled ?? false,
        vip_completions_count: profile.vip_completions_count ?? 0
      }));

      setProfiles(profilesWithDefaults);
    } catch (error) {
      console.error('Error fetching profiles:', error);
    } finally {
      setLoading(false);
    }
  }

  async function toggleCombo(profileId: string, currentStatus: boolean) {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ combo_enabled: !currentStatus })
        .eq('id', profileId);

      if (error) throw error;

      setProfiles(profiles.map(p =>
        p.id === profileId ? { ...p, combo_enabled: !currentStatus } : p
      ));
    } catch (error) {
      console.error('Error toggling combo:', error);
      alert('Failed to update combo status');
    }
  }

  const filteredProfiles = profiles.filter(profile => {
    const query = searchQuery.toLowerCase();
    return (
      profile.email?.toLowerCase().includes(query) ||
      profile.username?.toLowerCase().includes(query) ||
      profile.referral_code?.toLowerCase().includes(query)
    );
  });

  const totalBalance = profiles.reduce((sum, profile) => sum + Number(profile.balance || 0), 0);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f5b04c]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Clients</p>
              <p className="text-3xl font-bold mt-1">{profiles.length}</p>
            </div>
            <Users className="w-12 h-12 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Total Balance</p>
              <p className="text-3xl font-bold mt-1">${totalBalance.toFixed(2)}</p>
            </div>
            <DollarSign className="w-12 h-12 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-6 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Average Balance</p>
              <p className="text-3xl font-bold mt-1">
                ${profiles.length > 0 ? (totalBalance / profiles.length).toFixed(2) : '0.00'}
              </p>
            </div>
            <DollarSign className="w-12 h-12 text-purple-200" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by email, username, or referral code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f5b04c] focus:border-transparent"
            />
          </div>
          <button
            onClick={fetchProfiles}
            className="flex items-center gap-2 px-4 py-2 bg-[#2a5f64] text-white rounded-lg hover:bg-[#1e4a4d] transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {filteredProfiles.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No clients found</h3>
            <p className="text-gray-600">
              {searchQuery ? 'Try adjusting your search criteria' : 'No clients have registered yet'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Client Info
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Username
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Balance
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    VIP Completions
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Combo Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Referral Code
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Registered
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredProfiles.map((profile) => (
                  <tr key={profile.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#f5b04c] to-[#2a5f64] rounded-full flex items-center justify-center">
                          <Mail className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{profile.email}</p>
                          <p className="text-xs text-gray-500">ID: {profile.id.slice(0, 8)}...</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-900 font-medium">{profile.username || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4 text-green-600" />
                        <span className="text-lg font-bold text-green-600">
                          {Number(profile.balance || 0).toFixed(2)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Award className="w-5 h-5 text-blue-500" />
                        <span className="text-lg font-bold text-gray-900">
                          {profile.vip_completions_count ?? 0}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {(profile.vip_completions_count ?? 0) >= 1 ? 'Combo eligible' : 'Need 1 completion'}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleCombo(profile.id, profile.combo_enabled ?? false)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all ${
                          profile.combo_enabled
                            ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg hover:shadow-xl'
                            : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                        }`}
                      >
                        <Zap className={`w-4 h-4 ${profile.combo_enabled ? 'animate-pulse' : ''}`} />
                        {profile.combo_enabled ? 'ENABLED' : 'DISABLED'}
                      </button>
                      {!profile.combo_enabled && (profile.vip_completions_count ?? 0) >= 1 && (
                        <p className="text-xs text-amber-600 mt-1">Click to enable combo</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <code className="px-2 py-1 bg-gray-100 rounded text-sm font-mono text-gray-700">
                        {profile.referral_code}
                      </code>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900">
                        {new Date(profile.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(profile.created_at).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
