import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Gift, AlertCircle, CheckCircle, Users, Crown } from 'lucide-react';
import NotificationModal from '../NotificationModal';

interface DemoAccessRecord {
  user_email: string;
  vip_level_name: string;
  granted_at: string;
}

export default function DemoAccessManagement() {
  const [demoRecords, setDemoRecords] = useState<DemoAccessRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [granting, setGranting] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [notification, setNotification] = useState<{
    isOpen: boolean;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
  }>({
    isOpen: false,
    type: 'info',
    title: '',
    message: ''
  });

  useEffect(() => {
    loadDemoRecords();
  }, []);

  async function loadDemoRecords() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('vip_purchases')
        .select(`
          user_id,
          created_at,
          vip_level_id,
          vip_levels!inner(name)
        `)
        .eq('amount_paid', 0)
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      const userIds = [...new Set((data || []).map(p => p.user_id))];
      const { data: authUsers } = await supabase.auth.admin.listUsers();

      const emailMap = new Map(
        (authUsers.users || []).map(u => [u.id, u.email || ''])
      );

      const records: DemoAccessRecord[] = (data || []).map(record => ({
        user_email: emailMap.get(record.user_id) || 'Unknown',
        vip_level_name: (record.vip_levels as any)?.name || 'Unknown',
        granted_at: record.created_at
      }));

      setDemoRecords(records);
    } catch (error) {
      console.error('Error loading demo records:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleGrantAccess() {
    if (!userEmail) {
      setNotification({
        isOpen: true,
        type: 'warning',
        title: 'Missing Information',
        message: 'Please enter user email'
      });
      return;
    }

    if (!userEmail.includes('@')) {
      setNotification({
        isOpen: true,
        type: 'warning',
        title: 'Invalid Email',
        message: 'Please enter a valid email address'
      });
      return;
    }

    try {
      setGranting(true);

      const { data: vipBonusLevel, error: levelError } = await supabase
        .from('vip_levels')
        .select('id')
        .eq('is_active', true)
        .eq('is_bonus', true)
        .order('level')
        .limit(1)
        .maybeSingle();

      if (levelError) throw levelError;

      if (!vipBonusLevel) {
        setNotification({
          isOpen: true,
          type: 'error',
          title: 'No VIP BONUS Available',
          message: 'No active VIP BONUS level found. Please create one first.'
        });
        return;
      }

      const { data, error } = await supabase.rpc('grant_demo_access', {
        user_email: userEmail.trim().toLowerCase(),
        vip_level_id: vipBonusLevel.id
      });

      if (error) throw error;

      if (data.success) {
        setNotification({
          isOpen: true,
          type: 'success',
          title: 'Demo Access Granted',
          message: data.message || 'User can now access VIP BONUS tasks'
        });
        setUserEmail('');
        loadDemoRecords();
      } else {
        setNotification({
          isOpen: true,
          type: 'error',
          title: 'Failed to Grant Access',
          message: data.error || 'Unknown error occurred'
        });
      }
    } catch (error: any) {
      console.error('Error granting demo access:', error);
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: error.message || 'Failed to grant demo access'
      });
    } finally {
      setGranting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-semibold mb-1">Demo Access Information</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Each user can receive demo access only once per VIP level</li>
              <li>Demo access is granted immediately with approved status</li>
              <li>Users can start completing tasks right away</li>
              <li>Commission is earned and credited to user balance</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-3 mb-6">
          <Gift className="w-6 h-6 text-blue-600" />
          <h3 className="text-xl font-bold text-gray-900">Grant Demo Access</h3>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            User Email
          </label>
          <input
            type="email"
            value={userEmail}
            onChange={(e) => setUserEmail(e.target.value)}
            placeholder="user@example.com"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="mt-2 text-sm text-gray-500">
            User will receive access to the first available VIP BONUS level
          </p>
        </div>

        <button
          onClick={handleGrantAccess}
          disabled={granting || !userEmail}
          className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {granting ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Granting Access...
            </>
          ) : (
            <>
              <CheckCircle className="w-5 h-5" />
              Grant Demo Access
            </>
          )}
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-3 mb-4">
          <Users className="w-6 h-6 text-gray-700" />
          <h3 className="text-xl font-bold text-gray-900">Demo Access History</h3>
        </div>

        {demoRecords.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Crown className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p>No demo access granted yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">User Email</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">VIP Level</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Granted At</th>
                </tr>
              </thead>
              <tbody>
                {demoRecords.map((record, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-900">{record.user_email}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-semibold">
                        {record.vip_level_name}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600 text-sm">
                      {new Date(record.granted_at).toLocaleString('en-US')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <NotificationModal
        isOpen={notification.isOpen}
        onClose={() => setNotification({ ...notification, isOpen: false })}
        type={notification.type}
        title={notification.title}
        message={notification.message}
      />
    </div>
  );
}
