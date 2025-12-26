import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Gift, AlertCircle, CheckCircle } from 'lucide-react';
import NotificationModal from '../NotificationModal';

export default function DemoAccessManagement() {
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
