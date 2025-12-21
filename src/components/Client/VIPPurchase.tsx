import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { ShoppingBag, Crown, CheckCircle, Clock, XCircle, Wallet } from 'lucide-react';
import NotificationModal from '../NotificationModal';

interface VIPLevel {
  id: string;
  level: number;
  name: string;
  commission: number;
  price: number;
  description: string;
  category: string;
  category_image_url: string;
  products_count: number;
  is_active: boolean;
}

interface VIPPurchaseRequest {
  id: string;
  vip_level: number;
  category_id: string;
  status: string;
  completed_products_count: number;
  is_completed: boolean;
  created_at: string;
}

interface VIPPurchaseProps {
  onNavigateToDeposit: () => void;
}

export default function VIPPurchase({ onNavigateToDeposit }: VIPPurchaseProps) {
  const [vipLevels, setVipLevels] = useState<VIPLevel[]>([]);
  const [purchases, setPurchases] = useState<VIPPurchaseRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInsufficientFundsModal, setShowInsufficientFundsModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [requiredAmount, setRequiredAmount] = useState(0);
  const [currentBalance, setCurrentBalance] = useState(0);
  const [selectedVIPLevel, setSelectedVIPLevel] = useState<number | 'all'>('all');
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
    loadData();
  }, []);

  async function loadData() {
    await Promise.all([loadVIPLevels(), loadPurchases()]);
  }

  async function loadVIPLevels() {
    try {
      const { data, error } = await supabase
        .from('vip_levels')
        .select('id, level, name, price, commission, description, category, category_image_url, products_count, is_active')
        .eq('is_active', true)
        .order('level');

      if (error) throw error;

      const levels = (data || []).map((level) => ({
        id: level.id,
        level: level.level,
        name: level.name,
        price: Number(level.price || 0),
        commission: Number(level.commission || 0),
        description: level.description || '',
        category: level.category || '',
        category_image_url: level.category_image_url || '',
        products_count: level.products_count || 25,
        is_active: level.is_active
      }));

      setVipLevels(levels);
    } catch (error: any) {
      console.error('Error loading VIP levels:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadPurchases() {
    try {
      const { data, error } = await supabase
        .from('vip_purchases')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPurchases(data || []);
    } catch (error) {
      console.error('Error loading purchases:', error);
    }
  }

  async function requestVIPAccess(vipLevel: number, categoryId: string, price: number) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('balance')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError) throw profileError;
      if (!profile) throw new Error('Profile not found');

      const currentBalance = Number(profile.balance);

      if (currentBalance < price) {
        setCurrentBalance(currentBalance);
        setRequiredAmount(price);
        setShowInsufficientFundsModal(true);
        return;
      }

      const { error: insertError } = await supabase
        .from('vip_purchases')
        .insert({
          user_id: user.id,
          vip_level: vipLevel,
          category_id: categoryId,
          vip_price: price,
          status: 'pending'
        });

      if (insertError) throw insertError;

      await supabase
        .from('transactions')
        .insert([
          {
            user_id: user.id,
            type: 'vip_purchase',
            amount: -price,
            status: 'completed',
            description: `VIP ${vipLevel} Purchase - ${categoryId}`
          },
          {
            user_id: user.id,
            type: 'deposit',
            amount: price,
            status: 'completed',
            description: `Working Capital for VIP ${vipLevel} - ${categoryId}`
          }
        ]);

      setShowSuccessModal(true);
      loadPurchases();
    } catch (error: any) {
      console.error('Error requesting VIP:', error);
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Payment Error',
        message: error.message
      });
    }
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
            <Clock className="w-3 h-3" />
            Pending
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
            <CheckCircle className="w-3 h-3" />
            Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
            <XCircle className="w-3 h-3" />
            Rejected
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
            <CheckCircle className="w-3 h-3" />
            Completed
          </span>
        );
      default:
        return null;
    }
  }

  function hasPendingOrApproved(level: number, category: string) {
    return purchases.some(
      p => p.vip_level === level &&
           p.category_id === category &&
           (p.status === 'pending' || (p.status === 'approved' && !p.is_completed))
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (vipLevels.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-8 text-center">
        <Crown className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <h2 className="text-xl font-semibold text-gray-600 mb-2">No VIP Levels Available</h2>
        <p className="text-gray-500">Please contact administration</p>
      </div>
    );
  }

  const filteredVIPLevels = selectedVIPLevel === 'all'
    ? vipLevels
    : vipLevels.filter(level => level.level === selectedVIPLevel);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-[#f5b04c] to-[#2a5f64] rounded-lg p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <Crown className="w-8 h-8" />
          <h2 className="text-2xl font-bold">VIP Levels ({vipLevels.length})</h2>
        </div>
        <p className="text-white/90">
          Each VIP level gives you access to a unique product category and commission percentage for each task!
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-4">
        <h3 className="text-lg font-bold text-gray-800 mb-3">Filter by Level</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedVIPLevel('all')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              selectedVIPLevel === 'all'
                ? 'bg-gradient-to-r from-[#f5b04c] to-[#2a5f64] text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          {[1, 2, 3, 4, 5].map((level) => (
            <button
              key={level}
              onClick={() => setSelectedVIPLevel(level)}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                selectedVIPLevel === level
                  ? 'bg-gradient-to-r from-[#f5b04c] to-[#2a5f64] text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              VIP {level}
            </button>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVIPLevels.map((vipLevel) => {
          const isPurchased = hasPendingOrApproved(vipLevel.level, vipLevel.category);
          const categoryPurchase = purchases.find(
            p => p.vip_level === vipLevel.level &&
                 p.category_id === vipLevel.category &&
                 p.status !== 'completed' &&
                 !p.is_completed
          );

          return (
            <div
              key={vipLevel.level}
              className="bg-white rounded-lg shadow-md overflow-hidden border-2 border-gray-200 hover:border-blue-500 transition-colors"
            >
              {vipLevel.category_image_url && (
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={vipLevel.category_image_url}
                    alt={vipLevel.category}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.pexels.com/photos/1194713/pexels-photo-1194713.jpeg';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                    <div className="flex items-center justify-between mb-2">
                      <Crown className="w-7 h-7 text-yellow-400" />
                      <span className="px-3 py-1 bg-yellow-400 text-gray-900 rounded-full text-xs font-bold">
                        Level {vipLevel.level}
                      </span>
                    </div>
                    <h3 className="text-2xl font-bold mb-1">{vipLevel.name}</h3>
                    <div className="flex items-center gap-2">
                      <div className="px-2 py-1 bg-blue-500/90 rounded text-xs font-semibold">
                        Category
                      </div>
                      <p className="text-sm font-medium capitalize">{vipLevel.category}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="p-4 space-y-4">
                <p className="text-sm text-gray-600">{vipLevel.description}</p>

                <div className="bg-yellow-50 rounded-lg p-3">
                  <div className="text-sm text-gray-600">Access Price</div>
                  <div className="text-2xl font-bold text-yellow-600">
                    ${vipLevel.price.toFixed(2)}
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-3">
                  <div className="text-sm text-gray-600">Base Commission</div>
                  <div className="text-2xl font-bold text-green-600">
                    {vipLevel.commission.toFixed(0)}%
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    + increased commission on select products
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-3">
                  <div className="text-sm text-gray-600">Number of Products (Tasks)</div>
                  <div className="text-2xl font-bold text-blue-600">
                    {vipLevel.products_count}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Complete tasks and earn commissions
                  </div>
                </div>

                <div>
                  {categoryPurchase ? (
                    <div className="flex items-center justify-center gap-2 p-3 bg-gray-50 rounded">
                      {getStatusBadge(categoryPurchase.status)}
                    </div>
                  ) : (
                    <button
                      onClick={() => requestVIPAccess(vipLevel.level, vipLevel.category, vipLevel.price)}
                      disabled={isPurchased}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      <ShoppingBag className="w-5 h-5" />
                      Pay ${vipLevel.price.toFixed(2)}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {purchases.filter(p => p.status !== 'completed' && !p.is_completed).length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Request History</h3>
          <div className="space-y-2">
            {purchases.filter(p => p.status !== 'completed' && !p.is_completed).map((purchase) => (
              <div
                key={purchase.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded"
              >
                <div>
                  <div className="font-medium">
                    VIP {purchase.vip_level} - <span className="capitalize">{purchase.category_id}</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(purchase.created_at).toLocaleString('en-US')}
                  </div>
                </div>
                {getStatusBadge(purchase.status)}
              </div>
            ))}
          </div>
        </div>
      )}

      {showInsufficientFundsModal && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setShowInsufficientFundsModal(false)}
          ></div>
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <Wallet className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  Insufficient Funds
                </h3>
                <p className="text-gray-600 mb-6">
                  To purchase this VIP level you need <span className="font-bold text-[#f5b04c]">${requiredAmount.toFixed(2)}</span>,
                  but your balance is <span className="font-bold text-red-600">${currentBalance.toFixed(2)}</span>
                </p>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 w-full">
                  <p className="text-sm text-yellow-800">
                    You need to deposit <span className="font-bold">${(requiredAmount - currentBalance).toFixed(2)}</span>
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full">
                  <button
                    onClick={() => {
                      setShowInsufficientFundsModal(false);
                      onNavigateToDeposit();
                    }}
                    className="flex-1 bg-gradient-to-r from-[#f5b04c] to-[#2a5f64] text-white py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
                  >
                    Deposit Funds
                  </button>
                  <button
                    onClick={() => setShowInsufficientFundsModal(false)}
                    className="flex-1 border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {showSuccessModal && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setShowSuccessModal(false)}
          ></div>
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4 animate-bounce">
                  <CheckCircle className="w-12 h-12 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  Payment Successful!
                </h3>
                <p className="text-gray-600 mb-6">
                  Your VIP access request has been sent to the administrator for approval.
                  You will receive access to the category after confirmation.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 w-full">
                  <p className="text-sm text-blue-800">
                    Verification usually takes no more than 10-15 minutes. You can continue browsing other categories.
                  </p>
                </div>
                <button
                  onClick={() => setShowSuccessModal(false)}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
                >
                  Great!
                </button>
              </div>
            </div>
          </div>
        </>
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
