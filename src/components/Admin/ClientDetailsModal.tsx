import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { X, DollarSign, TrendingUp, TrendingDown, Award, Clock, CheckCircle, XCircle, Zap, Key, Eye, EyeOff, Package, Settings, List } from 'lucide-react';
import ComboSettingsModal from './ComboSettingsModal';
import VIPComboManager from './VIPComboManager';

interface ClientDetailsModalProps {
  clientId: string;
  clientEmail: string;
  onClose: () => void;
}

interface VIPPurchase {
  id: string;
  vip_level: number;
  category_id: string;
  status: string;
  created_at: string;
  approved_at: string | null;
  completed_products_count: number;
  total_products: number;
  vip_price: number;
  combo_enabled_at_approval: boolean | null;
  combo_position_at_approval: number | null;
  combo_multiplier_at_approval: number | null;
  combo_deposit_percent_at_approval: number | null;
}

interface ProductProgress {
  id: string;
  product_id: string;
  product_index: number;
  times_purchased: number;
  quantity_purchased: number;
  times_needed: number;
  quantity_needed: number;
  completed: boolean;
  product: {
    name: string;
    price: number;
    quantity_multiplier: number;
  };
}

interface Transaction {
  id: string;
  type: string;
  amount: number;
  status: string;
  description: string;
  created_at: string;
}

interface Profile {
  balance: number;
  username: string;
  referral_code: string;
  combo_enabled: boolean;
  vip_completions_count: number;
  combo_product_position: number;
  combo_multiplier: number;
  combo_deposit_percent: number;
}

export default function ClientDetailsModal({ clientId, clientEmail, onClose }: ClientDetailsModalProps) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [vipPurchases, setVipPurchases] = useState<VIPPurchase[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'vips' | 'transactions' | 'active_vip'>(() => {
    const saved = localStorage.getItem(`clientModal_${clientId}_tab`);
    return (saved as 'vips' | 'transactions' | 'active_vip') || 'vips';
  });
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [activeVipProgress, setActiveVipProgress] = useState<ProductProgress[]>([]);
  const [activeVip, setActiveVip] = useState<VIPPurchase | null>(null);
  const [showComboSettings, setShowComboSettings] = useState(false);
  const [showComboManager, setShowComboManager] = useState(false);
  const [vipCombos, setVipCombos] = useState<any[]>([]);

  useEffect(() => {
    localStorage.setItem(`clientModal_${clientId}_tab`, activeTab);
  }, [activeTab, clientId]);

  useEffect(() => {
    if (clientId) {
      loadClientDetails();
    }
  }, [clientId]);

  async function loadClientDetails() {
    try {
      setLoading(true);

      console.log('Loading details for client:', clientId);

      const [profileRes, vipRes, transRes] = await Promise.all([
        supabase
          .from('profiles')
          .select('balance, username, referral_code, combo_enabled, vip_completions_count, combo_product_position, combo_multiplier, combo_deposit_percent')
          .eq('id', clientId)
          .maybeSingle(),
        supabase
          .from('vip_purchases')
          .select(`
            id,
            vip_level,
            category_id,
            status,
            created_at,
            approved_at,
            completed_products_count,
            vip_price,
            is_completed,
            combo_enabled_at_approval,
            combo_position_at_approval,
            combo_multiplier_at_approval,
            combo_deposit_percent_at_approval
          `)
          .eq('user_id', clientId)
          .order('created_at', { ascending: false }),
        supabase
          .from('transactions')
          .select('id, type, amount, status, description, created_at')
          .eq('user_id', clientId)
          .order('created_at', { ascending: false })
      ]);

      if (profileRes.error) {
        console.error('Profile error:', profileRes.error);
        throw profileRes.error;
      }
      if (vipRes.error) {
        console.error('VIP purchases error:', vipRes.error);
        throw vipRes.error;
      }
      if (transRes.error) {
        console.error('Transactions error:', transRes.error);
        throw transRes.error;
      }

      console.log('Loaded profile:', profileRes.data);
      console.log('Loaded VIP purchases:', vipRes.data);
      console.log('Loaded transactions:', transRes.data);

      setProfile(profileRes.data);

      const vipPurchasesWithTotals = await Promise.all((vipRes.data || []).map(async (vip: any) => {
        const { data: vipLevelData } = await supabase
          .from('vip_levels')
          .select('products_count')
          .eq('level', vip.vip_level)
          .eq('category', vip.category_id)
          .maybeSingle();

        return {
          ...vip,
          total_products: vipLevelData?.products_count || 25,
          completed_products_count: vip.completed_products_count || 0
        };
      }));

      setVipPurchases(vipPurchasesWithTotals);
      setTransactions(transRes.data || []);

      const activeVips = vipPurchasesWithTotals?.filter(v =>
        v.status === 'approved' &&
        !v.is_completed &&
        v.completed_products_count < v.total_products
      ) || [];

      if (activeVips.length > 0) {
        const savedVipId = localStorage.getItem(`clientModal_${clientId}_vipId`);
        const selectedVip = savedVipId
          ? activeVips.find(v => v.id === savedVipId) || activeVips[0]
          : activeVips[0];

        setActiveVip(selectedVip);
        await loadActiveVipProgress(selectedVip);

        const savedTab = localStorage.getItem(`clientModal_${clientId}_tab`);
        if (!savedTab) {
          setActiveTab('active_vip');
        }
      }
    } catch (error) {
      console.error('Error loading client details:', error);
      alert('Error loading client details. Check console for details.');
    } finally {
      setLoading(false);
    }
  }

  async function loadActiveVipProgress(vipPurchase: VIPPurchase) {
    try {
      console.log('Loading progress for VIP:', vipPurchase);

      // Get category UUID from category name
      const { data: categoryData } = await supabase
        .from('categories')
        .select('id')
        .eq('name', vipPurchase.category_id)
        .maybeSingle();

      if (!categoryData) {
        console.error('Category not found:', vipPurchase.category_id);
        return;
      }

      const [productsRes, purchasesRes, combosRes] = await Promise.all([
        supabase
          .from('products')
          .select('id, name, price, quantity_multiplier')
          .eq('category_id', categoryData.id)
          .eq('is_active', true)
          .order('name', { ascending: true })
          .limit(vipPurchase.total_products),
        supabase
          .from('product_purchases')
          .select('product_id, quantity, status')
          .eq('vip_purchase_id', vipPurchase.id),
        supabase
          .from('vip_combo_settings')
          .select('*')
          .eq('vip_purchase_id', vipPurchase.id)
          .order('combo_position', { ascending: true })
      ]);

      if (productsRes.error) {
        console.error('Products error:', productsRes.error);
        throw productsRes.error;
      }

      if (purchasesRes.error) {
        console.error('Purchases error:', purchasesRes.error);
        throw purchasesRes.error;
      }

      console.log('Loaded products:', productsRes.data);
      console.log('Loaded purchases:', purchasesRes.data);
      console.log('Loaded combos:', combosRes.data);

      setVipCombos(combosRes.data || []);

      const progressData: ProductProgress[] = (productsRes.data || []).map((product, index) => {
        const productPurchases = purchasesRes.data?.filter(p => p.product_id === product.id) || [];
        const completedPurchases = productPurchases.filter(p => p.status === 'completed');
        const totalQuantity = completedPurchases.reduce((sum, p) => sum + (p.quantity || 0), 0);

        return {
          id: product.id,
          product_id: product.id,
          product_index: index + 1,
          times_purchased: completedPurchases.length,
          quantity_purchased: totalQuantity,
          times_needed: 1,
          quantity_needed: product.quantity_multiplier || 1,
          completed: totalQuantity >= (product.quantity_multiplier || 1),
          product: {
            name: product.name,
            price: Number(product.price),
            quantity_multiplier: product.quantity_multiplier || 1
          }
        };
      });

      console.log('Progress data:', progressData);
      setActiveVipProgress(progressData);
    } catch (error) {
      console.error('Error loading active VIP progress:', error);
    }
  }


  async function handlePasswordChange() {
    if (!newPassword || newPassword.length < 6) {
      setPasswordMessage({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }

    setChangingPassword(true);
    setPasswordMessage(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-change-user-password`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: clientId,
          newPassword: newPassword,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to change password');
      }

      setPasswordMessage({ type: 'success', text: 'Password changed successfully' });
      setNewPassword('');
      setShowPassword(false);

      setTimeout(() => {
        setPasswordMessage(null);
      }, 3000);
    } catch (error: any) {
      console.error('Error changing password:', error);
      setPasswordMessage({ type: 'error', text: error.message || 'Failed to change password' });
    } finally {
      setChangingPassword(false);
    }
  }

  const approvedVips = vipPurchases.filter(v =>
    v.status === 'approved' &&
    v.completed_products_count < v.total_products
  );

  const deposits = transactions.filter(t => t.type === 'deposit');
  const withdrawals = transactions.filter(t => t.type === 'withdrawal');
  const totalDeposits = deposits.filter(t => t.status === 'completed').reduce((sum, t) => sum + Number(t.amount), 0);
  const totalWithdrawals = withdrawals.filter(t => t.status === 'completed').reduce((sum, t) => sum + Number(t.amount), 0);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-6xl w-full my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-purple-600">
          <div className="text-white">
            <h2 className="text-2xl font-bold">Client Details <span className="text-sm opacity-70">(v2.3 - Fixed Active VIPs)</span></h2>
            <p className="text-blue-100 mt-1">{clientEmail}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Balance</p>
                  <p className="text-2xl font-bold">${Number(profile?.balance || 0).toFixed(2)}</p>
                </div>
                <DollarSign className="w-10 h-10 text-green-200" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Total Deposits</p>
                  <p className="text-2xl font-bold">${totalDeposits.toFixed(2)}</p>
                </div>
                <TrendingUp className="w-10 h-10 text-blue-200" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm">Total Withdrawals</p>
                  <p className="text-2xl font-bold">${totalWithdrawals.toFixed(2)}</p>
                </div>
                <TrendingDown className="w-10 h-10 text-orange-200" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">VIP Completions</p>
                  <p className="text-2xl font-bold">{profile?.vip_completions_count || 0}</p>
                </div>
                <Award className="w-10 h-10 text-purple-200" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <Key className="w-5 h-5 text-orange-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-gray-800 mb-1">Admin Password Management</h3>
                <p className="text-xs text-gray-600 mb-3">Set a new password for this client. Passwords are encrypted and cannot be viewed.</p>

                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password (min 6 characters)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                      disabled={changingPassword}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <button
                    onClick={handlePasswordChange}
                    disabled={changingPassword || !newPassword}
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                  >
                    {changingPassword ? 'Changing...' : 'Change Password'}
                  </button>
                </div>

                {passwordMessage && (
                  <div className={`mt-2 p-2 rounded text-xs ${
                    passwordMessage.type === 'success'
                      ? 'bg-green-100 text-green-700 border border-green-200'
                      : 'bg-red-100 text-red-700 border border-red-200'
                  }`}>
                    {passwordMessage.text}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-2 mb-4 bg-gray-100 p-1 rounded-lg">
            {activeVip && (
              <button
                onClick={() => setActiveTab('active_vip')}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'active_vip'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Active VIP Task
              </button>
            )}
            <button
              onClick={() => setActiveTab('vips')}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'vips'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              VIP Purchases ({vipPurchases.length})
            </button>
            <button
              onClick={() => setActiveTab('transactions')}
              className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'transactions'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Transactions ({transactions.length})
            </button>
          </div>

          {activeTab === 'active_vip' ? (
            <div className="space-y-4">
              {approvedVips.length > 1 && (
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Active VIP to manage:
                  </label>
                  <select
                    value={activeVip?.id || ''}
                    onChange={(e) => {
                      const selectedVip = approvedVips.find(v => v.id === e.target.value);
                      if (selectedVip) {
                        setActiveVip(selectedVip);
                        localStorage.setItem(`clientModal_${clientId}_vipId`, selectedVip.id);
                        loadActiveVipProgress(selectedVip);
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {approvedVips.map(vip => (
                      <option key={vip.id} value={vip.id}>
                        VIP {vip.vip_level} - {vip.category_id} (Created: {new Date(vip.created_at).toLocaleDateString()})
                      </option>
                    ))}
                  </select>
                </div>
              )}
              {activeVip && (
                <>
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-300 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">
                          VIP {activeVip.vip_level} - {activeVip.category_id}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Progress: {activeVip.completed_products_count}/{activeVip.total_products} products
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-blue-600">
                          {Math.round((activeVip.completed_products_count / activeVip.total_products) * 100)}%
                        </div>
                        <p className="text-xs text-gray-500">Complete</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {activeVip.combo_enabled_at_approval && (
                        <div className="bg-gradient-to-r from-yellow-100 to-orange-100 border border-yellow-400 rounded-lg p-3 flex items-center gap-3">
                          <Zap className="w-6 h-6 text-yellow-600" />
                          <div className="flex-1">
                            <div className="font-bold text-gray-900">Combo at VIP Approval</div>
                            <div className="text-sm text-gray-700 mt-1">
                              Position: {activeVip.combo_position_at_approval} |
                              Multiplier: {activeVip.combo_multiplier_at_approval}x |
                              Deposit: {activeVip.combo_deposit_percent_at_approval}%
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="bg-gradient-to-r from-blue-100 to-indigo-100 border border-blue-400 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Settings className="w-6 h-6 text-blue-600" />
                            <div>
                              <div className="font-bold text-gray-900">
                                User Combo Settings {profile?.combo_enabled ? '(Enabled)' : '(Disabled)'}
                              </div>
                              <div className="text-sm text-gray-700 mt-1">
                                Position: {profile?.combo_product_position || 9} |
                                Multiplier: {profile?.combo_multiplier || 3}x |
                                Deposit: {profile?.combo_deposit_percent || 50}%
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => setShowComboSettings(true)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium"
                          >
                            <Settings className="w-4 h-4" />
                            Edit Settings
                          </button>
                        </div>
                      </div>

                      <div className="bg-gradient-to-r from-orange-100 to-red-100 border border-orange-400 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <List className="w-6 h-6 text-orange-600" />
                            <div>
                              <div className="font-bold text-gray-900">
                                VIP Combo List ({vipCombos.length})
                              </div>
                              <div className="text-sm text-gray-700 mt-1">
                                {vipCombos.length === 0 ? (
                                  'No combos configured'
                                ) : (
                                  `Positions: ${vipCombos.map(c => `#${c.combo_position}`).join(', ')}`
                                )}
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => setShowComboManager(true)}
                            className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-lg hover:from-yellow-500 hover:to-orange-600 transition-colors flex items-center gap-2 font-medium"
                          >
                            <Zap className="w-4 h-4" />
                            Manage Combos
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                      <h4 className="font-bold text-gray-900 flex items-center gap-2">
                        <Package className="w-5 h-5 text-blue-600" />
                        Product Progress
                      </h4>
                      <p className="text-xs text-gray-600 mt-1">
                        Track completion of products for this VIP task
                      </p>
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                      {activeVipProgress.map((progress) => {
                        const isCurrentProduct = progress.product_index === activeVip.completed_products_count + 1;
                        const isCompleted = progress.completed;
                        const comboAtPosition = vipCombos.find(c => c.combo_position === progress.product_index);

                        return (
                          <div
                            key={progress.id}
                            className={`p-4 border-b border-gray-200 ${
                              isCompleted
                                ? 'bg-green-50'
                                : isCurrentProduct
                                ? 'bg-blue-50 border-l-4 border-l-blue-500'
                                : 'bg-white'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-gray-900">
                                    #{progress.product_index} - {progress.product.name}
                                  </span>
                                  {isCompleted && (
                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                  )}
                                  {isCurrentProduct && (
                                    <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded-full font-bold">
                                      CURRENT
                                    </span>
                                  )}
                                  {comboAtPosition && (
                                    <span className="px-2 py-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs rounded-full font-bold flex items-center gap-1">
                                      <Zap className="w-3 h-3" />
                                      COMBO x{comboAtPosition.combo_multiplier}
                                      {comboAtPosition.is_completed && ' ✓'}
                                    </span>
                                  )}
                                </div>
                                <div className="text-sm text-gray-600 mt-1">
                                  Price: ${progress.product.price} |
                                  Purchased: {progress.times_purchased}/{progress.times_needed} times |
                                  Quantity: {progress.quantity_purchased}/{progress.quantity_needed}
                                </div>
                                {!isCompleted && (
                                  <div className="mt-2">
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                      <div
                                        className="bg-blue-600 h-2 rounded-full transition-all"
                                        style={{
                                          width: `${(progress.times_purchased / progress.times_needed) * 100}%`
                                        }}
                                      />
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      {activeVipProgress.length === 0 && (
                        <div className="p-8 text-center text-gray-500">
                          <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                          <p>No product progress data available</p>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : activeTab === 'vips' ? (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {['pending', 'approved', 'completed', 'rejected'].map((status) => {
                const statusVips = vipPurchases.filter(v => v.status === status);
                if (statusVips.length === 0) return null;

                return (
                  <div key={status}>
                    <h3 className="text-lg font-bold text-gray-900 mb-2 capitalize flex items-center gap-2">
                      {status === 'pending' && <Clock className="w-5 h-5 text-yellow-500" />}
                      {status === 'approved' && <CheckCircle className="w-5 h-5 text-green-500" />}
                      {status === 'completed' && <Award className="w-5 h-5 text-blue-500" />}
                      {status === 'rejected' && <XCircle className="w-5 h-5 text-red-500" />}
                      {status} ({statusVips.length})
                    </h3>
                    <div className="grid gap-2">
                      {statusVips.map((vip) => (
                        <div
                          key={vip.id}
                          className={`border rounded-lg p-4 ${
                            status === 'pending'
                              ? 'bg-yellow-50 border-yellow-300'
                              : status === 'approved'
                              ? 'bg-green-50 border-green-300'
                              : status === 'completed'
                              ? 'bg-blue-50 border-blue-300'
                              : 'bg-red-50 border-red-300'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <p className="font-bold text-gray-900">
                                VIP {vip.vip_level} - {vip.category_id}
                              </p>
                              <p className="text-sm text-gray-600 mt-1">
                                Created: {new Date(vip.created_at).toLocaleString('en-US')}
                              </p>
                              {vip.approved_at && (
                                <p className="text-sm text-gray-600">
                                  Approved: {new Date(vip.approved_at).toLocaleString('en-US')}
                                </p>
                              )}
                            </div>
                            {(status === 'approved' || status === 'completed') && (
                              <div className="text-right">
                                <p className="text-2xl font-bold text-blue-600">
                                  {vip.completed_products_count || 0}/{vip.total_products}
                                </p>
                                <p className="text-xs text-gray-500">Products completed</p>
                              </div>
                            )}
                          </div>

                          {status !== 'pending' && vip.combo_enabled_at_approval !== null && (
                            <div className={`p-3 rounded-lg border flex items-center gap-3 ${
                              vip.combo_enabled_at_approval
                                ? 'bg-gradient-to-r from-yellow-100 to-orange-100 border-yellow-400'
                                : 'bg-gray-100 border-gray-300'
                            }`}>
                              <Zap className={`w-5 h-5 ${vip.combo_enabled_at_approval ? 'text-yellow-600' : 'text-gray-500'}`} />
                              <div className="flex-1">
                                <div className="font-bold text-gray-900 text-sm">
                                  Combo: {vip.combo_enabled_at_approval ? 'ENABLED' : 'DISABLED'}
                                </div>
                                {vip.combo_enabled_at_approval && (
                                  <div className="text-xs text-gray-700 mt-1">
                                    Position: {vip.combo_position_at_approval} |
                                    Multiplier: {vip.combo_multiplier_at_approval}x |
                                    Deposit: {vip.combo_deposit_percent_at_approval}%
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

              {vipPurchases.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <Award className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>No VIP purchases yet</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className={`border rounded-lg p-4 ${
                    transaction.type === 'deposit'
                      ? 'bg-green-50 border-green-200'
                      : transaction.type === 'withdrawal'
                      ? 'bg-orange-50 border-orange-200'
                      : transaction.type === 'commission'
                      ? 'bg-blue-50 border-blue-200'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        {transaction.type === 'deposit' && <TrendingUp className="w-5 h-5 text-green-600" />}
                        {transaction.type === 'withdrawal' && <TrendingDown className="w-5 h-5 text-orange-600" />}
                        {transaction.type === 'commission' && <Award className="w-5 h-5 text-blue-600" />}
                        <span className="font-bold text-gray-900 capitalize">{transaction.type}</span>
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            transaction.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : transaction.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {transaction.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{transaction.description || 'No description'}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(transaction.created_at).toLocaleString('en-US')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-2xl font-bold ${
                          transaction.type === 'withdrawal' ? 'text-orange-600' : 'text-green-600'
                        }`}
                      >
                        {transaction.type === 'withdrawal' ? '-' : '+'}${Number(transaction.amount).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {transactions.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <DollarSign className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>No transactions yet</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>

      {showComboSettings && profile && (
        <ComboSettingsModal
          clientId={clientId}
          clientEmail={clientEmail}
          currentStatus={profile.combo_enabled}
          onClose={() => setShowComboSettings(false)}
          onUpdate={() => {
            loadClientDetails();
            setShowComboSettings(false);
          }}
        />
      )}

      {showComboManager && activeVip && (
        <VIPComboManager
          vipPurchaseId={activeVip.id}
          vipLevel={activeVip.vip_level}
          category={activeVip.category_id}
          totalProducts={activeVip.total_products}
          onClose={() => setShowComboManager(false)}
          onUpdate={() => {
            if (activeVip) {
              loadActiveVipProgress(activeVip);
            }
            setShowComboManager(false);
          }}
        />
      )}
    </div>
  );
}
