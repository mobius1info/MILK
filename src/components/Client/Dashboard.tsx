import { useState, useEffect } from 'react';
import { supabase, Profile, Transaction, Referral, Order, OrderItem, Product } from '../../lib/supabase';
import { TrendingUp, TrendingDown, Clock, Copy, Package, User, Home, CheckCircle, XCircle, Crown, ShoppingBag, UserPlus, Headphones, FileCheck, Info, HelpCircle, DollarSign, Settings } from 'lucide-react';
import BannerSection from '../BannerSection';
import VIPPurchase from './VIPPurchase';
import VIPCategories from './VIPCategories';
import DepositPage from './DepositPage';
import ActiveTasks from './ActiveTasks';
import BalanceHistory from './BalanceHistory';
import WithdrawalsPage from './WithdrawalsPage';
import TermsPage from './TermsPage';
import AboutPage from './AboutPage';
import FAQPage from './FAQPage';
import SettingsPage from './SettingsPage';
import NotificationModal from '../NotificationModal';

interface DashboardProps {
  profile: Profile;
  onBalanceUpdate: () => void;
}

interface OrderWithItems extends Order {
  items?: Array<OrderItem & { product?: Product }>;
}

export default function Dashboard({ profile, onBalanceUpdate }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'profile' | 'orders' | 'tasks' | 'referrals' | 'deposit' | 'balance-history' | 'withdrawals' | 'terms' | 'about' | 'faq' | 'settings'>(() => {
    const savedTab = localStorage.getItem('activeTab');
    return (savedTab as typeof activeTab) || 'overview';
  });
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [amount, setAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
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
    fetchOrders();
    fetchReferrals();
  }, []);

  useEffect(() => {
    setShowWithdrawalModal(false);
    setAmount('');
  }, [activeTab]);

  useEffect(() => {
    localStorage.setItem('activeTab', activeTab);
    const titles: Record<typeof activeTab, string> = {
      'overview': 'MG SOUK - Dashboard',
      'profile': 'MG SOUK - Profile',
      'orders': 'MG SOUK - Orders',
      'tasks': 'MG SOUK - Tasks',
      'referrals': 'MG SOUK - Referrals',
      'deposit': 'MG SOUK - Deposit',
      'balance-history': 'MG SOUK - Balance History',
      'withdrawals': 'MG SOUK - Withdrawals',
      'terms': 'MG SOUK - Terms',
      'about': 'MG SOUK - About Us',
      'faq': 'MG SOUK - FAQ',
      'settings': 'MG SOUK - Settings'
    };
    document.title = titles[activeTab];
  }, [activeTab]);

  const handleTabChange = (tab: typeof activeTab) => {
    setShowWithdrawalModal(false);
    setAmount('');
    setActiveTab(tab);
  };

  const fetchReferrals = async () => {
    try {
      const { data, error } = await supabase
        .from('referrals')
        .select('*')
        .eq('referrer_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReferrals(data || []);
    } catch (error) {
      console.error('Error fetching referrals:', error);
    }
  };

  const fetchOrders = async () => {
    try {
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      const ordersWithItems = await Promise.all(
        (ordersData || []).map(async (order) => {
          const { data: itemsData } = await supabase
            .from('order_items')
            .select(`
              *,
              product:products(*)
            `)
            .eq('order_id', order.id);

          return { ...order, items: itemsData || [] };
        })
      );

      setOrders(ordersWithItems);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyReferralCode = () => {
    navigator.clipboard.writeText(profile.referral_code);
    setNotification({
      isOpen: true,
      type: 'success',
      title: 'Copied!',
      message: 'Referral code successfully copied to clipboard'
    });
  };

  const handleWithdrawal = async () => {
    const withdrawAmount = parseFloat(amount);

    if (!amount || withdrawAmount <= 0) {
      setNotification({
        isOpen: true,
        type: 'warning',
        title: 'Invalid Amount',
        message: 'Please enter a valid amount for withdrawal'
      });
      return;
    }

    if (withdrawAmount > profile.balance) {
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Insufficient Funds',
        message: 'Your balance is insufficient to withdraw this amount'
      });
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from('transactions').insert([
        {
          user_id: profile.id,
          type: 'withdrawal',
          amount: withdrawAmount,
          status: 'pending',
        },
      ]);

      if (error) throw error;

      setShowWithdrawalModal(false);
      setAmount('');
      onBalanceUpdate();
      setNotification({
        isOpen: true,
        type: 'success',
        title: 'Request Submitted!',
        message: 'Your withdrawal request has been successfully submitted and is awaiting administrator approval'
      });
    } catch (error: any) {
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: error.message
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getOrderStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'processing':
        return <Package className="w-5 h-5 text-blue-500" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="pb-24">
      <div className="max-w-6xl mx-auto p-4 sm:p-6">
        {activeTab !== 'overview' && (
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2 break-words">
              Welcome, {profile.full_name || profile.email}
            </h1>
            <p className="text-sm sm:text-base text-gray-600">Manage your account and transactions</p>
          </div>
        )}


      {activeTab === 'overview' && (
        <>
          <BannerSection />

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <button
              onClick={() => handleTabChange('withdrawals')}
              className="flex flex-col items-center justify-center p-4 bg-white rounded-lg shadow-md hover:shadow-xl transition-all transform hover:scale-105"
            >
              <TrendingDown className="w-8 h-8 mb-2 text-red-500" />
              <span className="text-sm font-semibold text-gray-800">Withdrawal</span>
            </button>

            <button
              onClick={() => handleTabChange('deposit')}
              className="flex flex-col items-center justify-center p-4 bg-white rounded-lg shadow-md hover:shadow-xl transition-all transform hover:scale-105"
            >
              <TrendingUp className="w-8 h-8 mb-2 text-green-500" />
              <span className="text-sm font-semibold text-gray-800">Deposit</span>
            </button>

            <button
              onClick={() => window.open('https://t.me/mgsouk', '_blank')}
              className="flex flex-col items-center justify-center p-4 bg-white rounded-lg shadow-md hover:shadow-xl transition-all transform hover:scale-105"
            >
              <Headphones className="w-8 h-8 mb-2 text-blue-500" />
              <span className="text-sm font-semibold text-gray-800">Customer Service</span>
            </button>

            <button
              onClick={() => handleTabChange('terms')}
              className="flex flex-col items-center justify-center p-4 bg-white rounded-lg shadow-md hover:shadow-xl transition-all transform hover:scale-105"
            >
              <FileCheck className="w-8 h-8 mb-2 text-orange-500" />
              <span className="text-sm font-semibold text-gray-800">Terms</span>
            </button>

            <button
              onClick={() => handleTabChange('about')}
              className="flex flex-col items-center justify-center p-4 bg-white rounded-lg shadow-md hover:shadow-xl transition-all transform hover:scale-105"
            >
              <Info className="w-8 h-8 mb-2 text-cyan-500" />
              <span className="text-sm font-semibold text-gray-800">About US</span>
            </button>

            <button
              onClick={() => handleTabChange('faq')}
              className="flex flex-col items-center justify-center p-4 bg-white rounded-lg shadow-md hover:shadow-xl transition-all transform hover:scale-105"
            >
              <HelpCircle className="w-8 h-8 mb-2 text-pink-500" />
              <span className="text-sm font-semibold text-gray-800">FAQ</span>
            </button>

            <button
              onClick={() => handleTabChange('balance-history')}
              className="flex flex-col items-center justify-center p-4 bg-white rounded-lg shadow-md hover:shadow-xl transition-all transform hover:scale-105"
            >
              <DollarSign className="w-8 h-8 mb-2 text-emerald-500" />
              <span className="text-sm font-semibold text-gray-800">WFP</span>
            </button>

            <button
              onClick={() => handleTabChange('referrals')}
              className="flex flex-col items-center justify-center p-4 bg-white rounded-lg shadow-md hover:shadow-xl transition-all transform hover:scale-105"
            >
              <UserPlus className="w-8 h-8 mb-2 text-blue-500" />
              <span className="text-sm font-semibold text-gray-800">Invite</span>
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4 overflow-hidden">
            <h3 className="text-lg font-bold text-gray-800 mb-3">Live Withdrawals</h3>
            <div className="relative h-[300px] overflow-hidden">
              <style>{`
                @keyframes scroll {
                  0% {
                    transform: translateY(0);
                  }
                  100% {
                    transform: translateY(-50%);
                  }
                }
                .animate-scroll {
                  animation: scroll 540s linear infinite;
                }
              `}</style>
              <div className="animate-scroll">
                {(() => {
                  const generateMaskedName = (index: number) => {
                    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
                    const firstLetter = letters[index % 26];
                    const starsCount = 3 + (index % 5);
                    return firstLetter + '*'.repeat(starsCount);
                  };

                  const generateAmount = (index: number) => {
                    const base = 50 + (index * 7.3) % 950;
                    const cents = (index * 17) % 100;
                    return parseFloat((base + cents / 100).toFixed(2));
                  };

                  return [...Array(400)].map((_, index) => {
                    const name = generateMaskedName(index);
                    const amount = generateAmount(index);

                    return (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 mb-2 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold">
                            {name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800">{name}</p>
                            <p className="text-xs text-gray-600">Withdrawal Successful</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600 text-lg">${amount.toFixed(2)}</p>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'orders' && (
        <VIPPurchase onNavigateToDeposit={() => handleTabChange('deposit')} />
      )}

      {activeTab === 'tasks' && <ActiveTasks onNavigateToDeposit={() => setActiveTab('deposit')} />}

      {activeTab === 'deposit' && (
        <DepositPage
          userId={profile.id}
          onBack={() => handleTabChange('overview')}
          onSuccess={onBalanceUpdate}
        />
      )}

      {activeTab === 'balance-history' && (
        <BalanceHistory userId={profile.id} />
      )}

      {activeTab === 'withdrawals' && (
        <WithdrawalsPage
          userId={profile.id}
          userBalance={profile.balance}
          onBalanceUpdate={onBalanceUpdate}
        />
      )}

      {activeTab === 'terms' && <TermsPage />}

      {activeTab === 'about' && <AboutPage />}

      {activeTab === 'faq' && <FAQPage />}

      {activeTab === 'settings' && <SettingsPage onBack={() => handleTabChange('profile')} />}

      {activeTab === 'referrals' && (
        <div className="space-y-4 sm:space-y-6">
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">Your Referral Code</h2>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
              <input
                type="text"
                value={profile.referral_code}
                readOnly
                className="flex-1 px-3 sm:px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg font-mono text-sm sm:text-base"
              />
              <button
                onClick={copyReferralCode}
                className="flex items-center justify-center space-x-2 bg-[#f5b04c] text-white px-4 py-2 rounded-lg hover:bg-[#e5a03c] transition-colors"
              >
                <Copy className="w-5 h-5" />
                <span>Copy</span>
              </button>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 mt-3">
              Share this code with friends. You'll earn $10 when they make their first order!
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">
              Your Referrals ({referrals.length})
            </h2>
            {referrals.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No referrals yet</p>
            ) : (
              <div className="space-y-2">
                {referrals.map((referral) => (
                  <div
                    key={referral.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="text-sm text-gray-600">
                        {new Date(referral.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="font-bold text-green-600">
                        +${referral.bonus_amount.toFixed(2)}
                      </span>
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          referral.status === 'paid'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {referral.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'profile' && (
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Profile</h2>
            <div className="space-y-4">
              <div className="border-b pb-4">
                <label className="text-sm text-gray-600 block mb-1">Balance</label>
                <p className="text-2xl font-bold text-[#f5b04c]">${profile.balance.toFixed(2)}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-1">Email</label>
                <p className="text-lg font-medium text-gray-800">{profile.email}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleTabChange('deposit')}
              className="flex flex-col items-center justify-center p-4 bg-white rounded-lg shadow-md hover:shadow-xl transition-all transform hover:scale-105"
            >
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-2">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-sm font-semibold text-gray-800">Deposit</span>
            </button>

            <button
              onClick={() => handleTabChange('withdrawals')}
              className="flex flex-col items-center justify-center p-4 bg-white rounded-lg shadow-md hover:shadow-xl transition-all transform hover:scale-105"
            >
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-2">
                <TrendingDown className="w-6 h-6 text-red-600" />
              </div>
              <span className="text-sm font-semibold text-gray-800">Withdrawal</span>
            </button>

            <button
              onClick={() => window.open('https://t.me/mgsouk', '_blank')}
              className="flex flex-col items-center justify-center p-4 bg-white rounded-lg shadow-md hover:shadow-xl transition-all transform hover:scale-105"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                <Headphones className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-sm font-semibold text-gray-800">Service Center</span>
            </button>

            <button
              onClick={() => handleTabChange('balance-history')}
              className="flex flex-col items-center justify-center p-4 bg-white rounded-lg shadow-md hover:shadow-xl transition-all transform hover:scale-105"
            >
              <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center mb-2">
                <Info className="w-6 h-6 text-cyan-600" />
              </div>
              <span className="text-sm font-semibold text-gray-800">Balance Information</span>
            </button>

            <button
              onClick={() => window.open('https://t.me/mgsouk', '_blank')}
              className="flex flex-col items-center justify-center p-4 bg-white rounded-lg shadow-md hover:shadow-xl transition-all transform hover:scale-105"
            >
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-2">
                <Package className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-sm font-semibold text-gray-800">Message Center</span>
            </button>

            <button
              onClick={() => handleTabChange('balance-history')}
              className="flex flex-col items-center justify-center p-4 bg-white rounded-lg shadow-md hover:shadow-xl transition-all transform hover:scale-105"
            >
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-2">
                <FileCheck className="w-6 h-6 text-emerald-600" />
              </div>
              <span className="text-sm font-semibold text-gray-800">Deposit Record</span>
            </button>

            <button
              onClick={() => handleTabChange('referrals')}
              className="flex flex-col items-center justify-center p-4 bg-white rounded-lg shadow-md hover:shadow-xl transition-all transform hover:scale-105"
            >
              <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mb-2">
                <UserPlus className="w-6 h-6 text-pink-600" />
              </div>
              <span className="text-sm font-semibold text-gray-800">Invitation</span>
            </button>

            <button
              onClick={() => handleTabChange('settings')}
              className="flex flex-col items-center justify-center p-4 bg-white rounded-lg shadow-md hover:shadow-xl transition-all transform hover:scale-105"
            >
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                <Settings className="w-6 h-6 text-gray-600" />
              </div>
              <span className="text-sm font-semibold text-gray-800">Settings</span>
            </button>
          </div>
        </div>
      )}

      {showWithdrawalModal && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setShowWithdrawalModal(false)}
          ></div>
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
              <h3 className="text-2xl font-bold mb-4">Withdraw Funds</h3>
              <div className="mb-4">
                <div className="mb-2">
                  <p className="text-sm text-gray-600">
                    Available balance: <span className="font-semibold">${profile.balance.toFixed(2)}</span>
                  </p>
                </div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max={profile.balance}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f5b04c]"
                  placeholder="Enter amount"
                />
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleWithdrawal}
                  disabled={submitting}
                  className="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </button>
                <button
                  onClick={() => {
                    setShowWithdrawalModal(false);
                    setAmount('');
                  }}
                  className="flex-1 border border-gray-300 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </>
      )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
        <div className="flex items-center justify-around py-2">
          <button
            onClick={() => handleTabChange('overview')}
            className={`flex flex-col items-center justify-center px-2 py-2 rounded-lg transition-all ${
              activeTab === 'overview'
                ? 'text-[#f5b04c]'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Home className="w-5 h-5 mb-1" />
            <span className="text-xs font-medium">Home</span>
          </button>

          <button
            onClick={() => handleTabChange('orders')}
            className={`flex flex-col items-center justify-center px-2 py-2 rounded-lg transition-all ${
              activeTab === 'orders'
                ? 'text-[#f5b04c]'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Crown className="w-5 h-5 mb-1" />
            <span className="text-xs font-medium">Orders</span>
          </button>

          <button
            onClick={() => handleTabChange('tasks')}
            className={`flex flex-col items-center justify-center px-2 py-2 rounded-lg transition-all ${
              activeTab === 'tasks'
                ? 'text-[#f5b04c]'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <ShoppingBag className="w-5 h-5 mb-1" />
            <span className="text-xs font-medium">Tasks</span>
          </button>

          <button
            onClick={() => handleTabChange('deposit')}
            className={`flex flex-col items-center justify-center px-2 py-2 rounded-lg transition-all ${
              activeTab === 'deposit'
                ? 'text-[#f5b04c]'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <TrendingUp className="w-5 h-5 mb-1" />
            <span className="text-xs font-medium">Deposit</span>
          </button>

          <button
            onClick={() => handleTabChange('profile')}
            className={`flex flex-col items-center justify-center px-2 py-2 rounded-lg transition-all ${
              activeTab === 'profile'
                ? 'text-[#f5b04c]'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <User className="w-5 h-5 mb-1" />
            <span className="text-xs font-medium">Profile</span>
          </button>
        </div>
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
