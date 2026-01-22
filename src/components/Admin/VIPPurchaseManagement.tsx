import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Crown, CheckCircle, XCircle, Clock, User, Bell, RefreshCw, X, Zap } from 'lucide-react';
import NotificationModal from '../NotificationModal';

interface VIPPurchaseRequest {
  id: string;
  user_id: string;
  vip_level: number;
  category_id: string;
  status: string;
  created_at: string;
  approved_at: string | null;
  approved_by: string | null;
  completed_products_count: number;
  total_products: number;
  vip_price: number;
  combo_enabled_at_approval: boolean | null;
  combo_position_at_approval: number | null;
  combo_multiplier_at_approval: number | null;
  combo_deposit_percent_at_approval: number | null;
  profiles: {
    email: string;
    full_name: string;
  };
}

interface ComboSettings {
  enabled: boolean;
  position: number;
  multiplier: number;
  depositPercent: number;
}

export default function VIPPurchaseManagement() {
  const [requests, setRequests] = useState<VIPPurchaseRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>(() => {
    const saved = localStorage.getItem('adminVIPPurchaseFilter');
    return (saved as 'all' | 'pending' | 'approved' | 'rejected') || 'pending';
  });
  const [notification, setNotification] = useState<{
    isOpen: boolean;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
  }>({
    isOpen: false,
    type: 'info',
    title: '',
    message: '',
  });
  const [approvalModal, setApprovalModal] = useState<{
    isOpen: boolean;
    requestId: string;
    userId: string;
    categoryId: string;
    vipLevel: number;
    clientEmail: string;
  } | null>(null);
  const [comboSettings, setComboSettings] = useState<ComboSettings>({
    enabled: false,
    position: 9,
    multiplier: 3,
    depositPercent: 50
  });

  useEffect(() => {
    loadRequests();
  }, []);

  useEffect(() => {
    localStorage.setItem('adminVIPPurchaseFilter', filter);
  }, [filter]);

  async function loadRequests() {
    try {
      const { data, error } = await supabase
        .from('vip_purchases')
        .select(`
          id,
          user_id,
          vip_level,
          category_id,
          status,
          created_at,
          approved_at,
          approved_by,
          completed_products_count,
          vip_price,
          combo_enabled_at_approval,
          combo_position_at_approval,
          combo_multiplier_at_approval,
          combo_deposit_percent_at_approval,
          profiles:user_id (
            email,
            full_name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedData = await Promise.all((data || []).map(async (item: any) => {
        // Get total_products from vip_levels
        const { data: vipLevelData } = await supabase
          .from('vip_levels')
          .select('products_count')
          .eq('level', item.vip_level)
          .eq('category', item.category_id)
          .maybeSingle();

        // Get real progress from product_purchases
        const { data: purchasedProducts } = await supabase
          .from('product_purchases')
          .select('product_id, quantity')
          .eq('vip_purchase_id', item.id);

        // Count actual completed products (products with at least 1 quantity)
        const completedCount = (purchasedProducts || []).filter(p => p.quantity > 0).length;

        return {
          ...item,
          total_products: vipLevelData?.products_count || 25,
          completed_products_count: completedCount,
          profiles: Array.isArray(item.profiles) && item.profiles.length > 0
            ? {
                email: item.profiles[0].email || '',
                full_name: item.profiles[0].full_name || ''
              }
            : item.profiles && typeof item.profiles === 'object'
            ? {
                email: item.profiles.email || '',
                full_name: item.profiles.full_name || ''
              }
            : { email: '', full_name: '' }
        };
      }));

      setRequests(formattedData);
    } catch (error) {
      console.error('Error loading VIP requests:', error);
    } finally {
      setLoading(false);
    }
  }

  async function openApprovalModal(request: VIPPurchaseRequest) {
    try {
      console.log('Opening approval modal for request:', request.id);
      console.log('Loading combo settings for user:', request.user_id);

      // Load user's profile combo settings
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('combo_enabled, combo_deposit_percent, combo_product_position, combo_multiplier')
        .eq('id', request.user_id)
        .single();

      if (profileError) {
        console.error('Profile error:', profileError);
        throw profileError;
      }

      console.log('Profile combo settings:', profileData);

      const settings = {
        enabled: profileData?.combo_enabled ?? false,
        position: profileData?.combo_product_position ?? 9,
        multiplier: profileData?.combo_multiplier ?? 3,
        depositPercent: profileData?.combo_deposit_percent ?? 50
      };

      console.log('Setting combo settings:', settings);
      setComboSettings(settings);

      setApprovalModal({
        isOpen: true,
        requestId: request.id,
        userId: request.user_id,
        categoryId: request.category_id,
        vipLevel: request.vip_level,
        clientEmail: request.profiles?.email || 'Unknown'
      });
    } catch (error) {
      console.error('Error loading profile data:', error);
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: 'Failed to load client combo settings',
      });
    }
  }

  async function approveRequest() {
    if (!approvalModal) return;

    try {
      console.log('Approving VIP purchase with combo settings:', {
        requestId: approvalModal.requestId,
        comboSettings
      });

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Use atomic database function to approve VIP
      // This function handles: completing old VIPs, approving new one, granting access
      const { data, error } = await supabase.rpc('approve_vip_purchase', {
        p_vip_purchase_id: approvalModal.requestId,
        p_admin_id: user.id,
        p_combo_enabled: comboSettings.enabled,
        p_combo_position: comboSettings.position,
        p_combo_multiplier: comboSettings.multiplier,
        p_combo_deposit_percent: comboSettings.depositPercent
      });

      if (error) {
        console.error('RPC error:', error);
        throw error;
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Unknown error');
      }

      console.log('VIP approved successfully:', data);

      const message = data.completed_old_vips > 0
        ? `VIP access approved with combo ${comboSettings.enabled ? 'ENABLED' : 'DISABLED'}. ${data.completed_old_vips} old VIP(s) automatically completed.`
        : `VIP access approved with combo ${comboSettings.enabled ? 'ENABLED' : 'DISABLED'}`;

      setNotification({
        isOpen: true,
        type: 'success',
        title: 'Success',
        message,
      });
      setApprovalModal(null);
      loadRequests();
    } catch (error: any) {
      console.error('Error approving request:', error);
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: 'Error approving: ' + error.message,
      });
    }
  }

  async function rejectRequest(requestId: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('vip_purchases')
        .update({
          status: 'rejected',
          approved_by: user.id
        })
        .eq('id', requestId);

      if (error) throw error;

      setNotification({
        isOpen: true,
        type: 'info',
        title: 'Rejected',
        message: 'Request rejected',
      });
      loadRequests();
    } catch (error: any) {
      console.error('Error rejecting request:', error);
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: 'Error rejecting: ' + error.message,
      });
    }
  }

  const filteredRequests = requests.filter(req => {
    if (filter === 'all') return true;
    return req.status === filter;
  });

  const pendingCount = requests.filter(r => r.status === 'pending').length;

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <button
            onClick={() => {
              setLoading(true);
              loadRequests();
            }}
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 rounded-lg px-4 py-2 transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
            <span className="font-medium">Refresh</span>
          </button>
          {pendingCount > 0 && (
            <div className="flex items-center gap-2 bg-white/20 rounded-full px-4 py-2">
              <Bell className="w-5 h-5 animate-pulse" />
              <span className="font-bold">{pendingCount} new</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-2 bg-white rounded-lg p-2 shadow-sm">
        {(['all', 'pending', 'approved', 'rejected'] as const).map((filterOption) => (
          <button
            key={filterOption}
            onClick={() => setFilter(filterOption)}
            className={`flex-1 px-4 py-2 rounded font-medium transition-colors ${
              filter === filterOption
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {filterOption === 'all' && 'All'}
            {filterOption === 'pending' && `Pending (${pendingCount})`}
            {filterOption === 'approved' && 'Approved'}
            {filterOption === 'rejected' && 'Rejected'}
          </button>
        ))}
      </div>

      {filteredRequests.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center text-gray-500">
          <Crown className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-lg">No requests to display</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredRequests.map((request) => (
            <div
              key={request.id}
              className={`bg-white rounded-lg shadow-md p-6 border-2 ${
                request.status === 'pending'
                  ? 'border-yellow-300 bg-yellow-50/30'
                  : request.status === 'approved'
                  ? 'border-green-300'
                  : 'border-red-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                      {request.vip_level}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        VIP {request.vip_level} - <span className="capitalize">{request.category_id}</span>
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <User className="w-4 h-4" />
                        <span>{request.profiles?.full_name || request.profiles?.email}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Email:</span>
                      <div className="font-medium">{request.profiles?.email}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Request Date:</span>
                      <div className="font-medium">
                        {new Date(request.created_at).toLocaleString('en-US')}
                      </div>
                    </div>
                  </div>

                  {request.status === 'approved' && (
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-300 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Clock className="w-5 h-5 text-blue-600" />
                          <span className="font-bold text-gray-900">Progress:</span>
                          <span className="text-blue-700 font-semibold">
                            {request.completed_products_count} / {request.total_products} products
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          ${Number(request.vip_price || 0).toFixed(2)} VIP Price
                        </div>
                      </div>
                      <div className="mt-2 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${(request.completed_products_count / request.total_products) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {request.status !== 'pending' && request.combo_enabled_at_approval !== null && (
                    <div className={`mt-4 p-3 rounded-lg border flex items-center gap-3 ${
                      request.combo_enabled_at_approval
                        ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-300'
                        : 'bg-gray-100 border-gray-300'
                    }`}>
                      <Zap className={`w-5 h-5 ${request.combo_enabled_at_approval ? 'text-yellow-600' : 'text-gray-500'}`} />
                      <div className="flex-1">
                        <div className="font-bold text-gray-900">
                          Global Combo: {request.combo_enabled_at_approval ? 'ENABLED' : 'DISABLED'}
                        </div>
                        {request.combo_enabled_at_approval && (
                          <div className="text-sm text-gray-700 mt-1">
                            Position: {request.combo_position_at_approval} |
                            Multiplier: {request.combo_multiplier_at_approval}x |
                            Deposit: {request.combo_deposit_percent_at_approval}%
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {request.status === 'pending' && (
                    <div className="mt-4 p-3 bg-yellow-100 border border-yellow-300 rounded-lg flex items-center gap-2 text-yellow-800">
                      <Bell className="w-5 h-5 animate-pulse" />
                      <span className="font-semibold">
                        CLIENT PURCHASED VIP LEVEL {request.vip_level}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-end gap-3">
                  {request.status === 'pending' ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => openApprovalModal(request)}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                      >
                        <CheckCircle className="w-5 h-5" />
                        Grant Access
                      </button>
                      <button
                        onClick={() => rejectRequest(request.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                      >
                        <XCircle className="w-5 h-5" />
                        Reject
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        {request.status === 'approved' && (
                          <span className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-lg font-medium">
                            <CheckCircle className="w-5 h-5" />
                            Approved
                          </span>
                        )}
                        {request.status === 'rejected' && (
                          <span className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-800 rounded-lg font-medium">
                            <XCircle className="w-5 h-5" />
                            Rejected
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {request.status !== 'pending' && request.approved_at && (
                    <div className="text-xs text-gray-500">
                      {new Date(request.approved_at).toLocaleString('en-US')}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {approvalModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setApprovalModal(null)}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-green-600 to-blue-600">
              <div className="text-white">
                <h2 className="text-2xl font-bold">Approve VIP Access</h2>
                <p className="text-green-100 mt-1">
                  VIP {approvalModal.vipLevel} - {approvalModal.categoryId}
                </p>
                <p className="text-sm text-green-100 mt-1">{approvalModal.clientEmail}</p>
              </div>
              <button
                onClick={() => setApprovalModal(null)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  Configure combo settings for this VIP purchase. These settings will be applied when the client completes products.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Zap className={`w-6 h-6 ${comboSettings.enabled ? 'text-yellow-500' : 'text-gray-400'}`} />
                    <div>
                      <p className="font-bold text-gray-900">Combo Status</p>
                      <p className="text-sm text-gray-600">Enable combo multiplier for this VIP</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setComboSettings({ ...comboSettings, enabled: !comboSettings.enabled })}
                    className={`px-6 py-2 rounded-lg font-medium transition-all ${
                      comboSettings.enabled
                        ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg'
                        : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                    }`}
                  >
                    {comboSettings.enabled ? 'ENABLED' : 'DISABLED'}
                  </button>
                </div>

                {comboSettings.enabled && (
                  <>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Combo Position (1-100)
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="100"
                          value={comboSettings.position}
                          onChange={(e) => setComboSettings({ ...comboSettings, position: parseInt(e.target.value) || 1 })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">Every Nth product (1-100)</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Multiplier (1-500)
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="500"
                          value={comboSettings.multiplier}
                          onChange={(e) => setComboSettings({ ...comboSettings, multiplier: parseInt(e.target.value) || 1 })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">Times multiplier (1-500)</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Deposit % (5-5000%)
                        </label>
                        <input
                          type="number"
                          min="5"
                          max="5000"
                          value={comboSettings.depositPercent}
                          onChange={(e) => setComboSettings({ ...comboSettings, depositPercent: parseInt(e.target.value) || 50 })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">Balance deposit 5-5000%</p>
                      </div>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <p className="text-sm text-yellow-900 font-medium">
                        Combo Preview: Product #{comboSettings.position} (out of 25 products)
                        will receive {comboSettings.multiplier}x commission multiplier with {comboSettings.depositPercent}% balance deposit required
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setApprovalModal(null)}
                className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={approveRequest}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2"
              >
                <CheckCircle className="w-5 h-5" />
                Approve & Grant Access
              </button>
            </div>
          </div>
        </div>
      )}

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
