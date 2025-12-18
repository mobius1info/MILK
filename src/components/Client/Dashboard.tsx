import { useState, useEffect } from 'react';
import { supabase, Profile, Transaction, Referral, Order, OrderItem, Product } from '../../lib/supabase';
import { Wallet, TrendingUp, TrendingDown, Clock, Check, X, Users, Copy, Package, FileText, User, Home, UserPlus, Headphones, FileCheck, Info, HelpCircle, DollarSign, CheckCircle, XCircle } from 'lucide-react';
import OrderHistory from './OrderHistory';
import DepositPage from './DepositPage';
import BannerSection from '../BannerSection';

interface DashboardProps {
  profile: Profile;
  onBalanceUpdate: () => void;
  initialTab?: 'overview' | 'deposit' | 'orders' | 'referrals' | 'transactions' | 'profile';
}

interface OrderWithItems extends Order {
  items?: Array<OrderItem & { product?: Product }>;
}

export default function Dashboard({ profile, onBalanceUpdate, initialTab = 'overview' }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'deposit' | 'orders' | 'referrals' | 'transactions' | 'profile'>(initialTab);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [amount, setAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  useEffect(() => {
    fetchTransactions();
    fetchReferrals();
    fetchOrders();
  }, []);

  useEffect(() => {
    setShowWithdrawalModal(false);
    setAmount('');
  }, [activeTab]);

  const handleTabChange = (tab: typeof activeTab) => {
    setShowWithdrawalModal(false);
    setAmount('');
    setActiveTab(tab);
  };

  const fetchTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReferrals = async () => {
    try {
      const { data, error } = await supabase
        .from('referrals')
        .select('*')
        .eq('referrer_id', profile.id)
        .order('created_at', { ascending: false});

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
    }
  };

  const copyReferralCode = () => {
    navigator.clipboard.writeText(profile.referral_code);
    alert('Referral code copied!');
  };


  const handleWithdrawal = async () => {
    const withdrawAmount = parseFloat(amount);

    if (!amount || withdrawAmount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    if (withdrawAmount > profile.balance) {
      alert('Insufficient balance');
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
      fetchTransactions();
      onBalanceUpdate();
      alert('Withdrawal request submitted successfully!');
    } catch (error: any) {
      alert('Error: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'approved':
        return <Check className="w-5 h-5 text-green-500" />;
      case 'rejected':
        return <X className="w-5 h-5 text-red-500" />;
      default:
        return null;
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
      {activeTab === 'deposit' && (
        <DepositPage
          userId={profile.id}
          onBack={() => handleTabChange('overview')}
          onSuccess={() => {
            fetchTransactions();
            onBalanceUpdate();
          }}
        />
      )}

      {activeTab !== 'deposit' && (
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
              onClick={() => handleTabChange('deposit')}
              className="flex flex-col items-center justify-center p-4 bg-white rounded-lg shadow-md hover:shadow-xl transition-all transform hover:scale-105"
            >
              <TrendingUp className="w-8 h-8 mb-2 text-green-500" />
              <span className="text-sm font-semibold text-gray-800">Deposit</span>
            </button>

            <button
              onClick={() => setShowWithdrawalModal(true)}
              className="flex flex-col items-center justify-center p-4 bg-white rounded-lg shadow-md hover:shadow-xl transition-all transform hover:scale-105"
            >
              <TrendingDown className="w-8 h-8 mb-2 text-red-500" />
              <span className="text-sm font-semibold text-gray-800">Withdrawal</span>
            </button>

            <button
              className="flex flex-col items-center justify-center p-4 bg-white rounded-lg shadow-md hover:shadow-xl transition-all transform hover:scale-105"
            >
              <Headphones className="w-8 h-8 mb-2 text-purple-500" />
              <span className="text-sm font-semibold text-gray-800">Customer Service</span>
            </button>

            <button
              className="flex flex-col items-center justify-center p-4 bg-white rounded-lg shadow-md hover:shadow-xl transition-all transform hover:scale-105"
            >
              <FileCheck className="w-8 h-8 mb-2 text-orange-500" />
              <span className="text-sm font-semibold text-gray-800">Terms</span>
            </button>

            <button
              className="flex flex-col items-center justify-center p-4 bg-white rounded-lg shadow-md hover:shadow-xl transition-all transform hover:scale-105"
            >
              <Info className="w-8 h-8 mb-2 text-cyan-500" />
              <span className="text-sm font-semibold text-gray-800">About US</span>
            </button>

            <button
              className="flex flex-col items-center justify-center p-4 bg-white rounded-lg shadow-md hover:shadow-xl transition-all transform hover:scale-105"
            >
              <HelpCircle className="w-8 h-8 mb-2 text-pink-500" />
              <span className="text-sm font-semibold text-gray-800">FAQ</span>
            </button>

            <button
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
                  animation: scroll 60s linear infinite;
                }
              `}</style>
              <div className="animate-scroll">
                {(() => {
                  const names = ['John D.', 'Maria S.', 'Alex K.', 'Sarah L.', 'Mike R.', 'Emma W.', 'David B.', 'Lisa M.', 'Tom H.', 'Anna P.', 'Chris J.', 'Nina F.', 'Paul G.', 'Kate V.', 'Ryan T.', 'Sophie C.', 'Jack N.', 'Mia D.', 'Lucas E.', 'Olivia R.'];
                  const amounts = [125.50, 340.00, 89.99, 510.75, 220.00, 765.20, 95.00, 430.50, 180.25, 620.00, 145.99, 890.00, 310.75, 555.50, 275.00, 720.99, 165.00, 450.25, 199.99, 580.75];
                  const times = [2, 5, 8, 12, 15, 18, 22, 25, 28, 31, 35, 38, 42, 45, 48, 52, 55, 58, 3, 7];

                  return [...Array(40)].map((_, index) => {
                    const name = names[index % names.length];
                    const amount = amounts[index % amounts.length];
                    const timeAgo = times[index % times.length];

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
        <OrderHistory
          userId={profile.id}
          onNavigateToDeposit={() => handleTabChange('deposit')}
        />
      )}

      {activeTab === 'transactions' && (
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">Order Records</h2>

          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-12 h-12 mx-auto text-gray-400 mb-3" />
              <p className="text-gray-500">No orders yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => (
                <div key={order.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  <div
                    className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getOrderStatusIcon(order.status)}
                        <div>
                          <p className="font-semibold text-gray-800">
                            Order #{order.id.slice(0, 8)}
                          </p>
                          <p className="text-sm text-gray-600">
                            {new Date(order.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-[#f5b04c]">
                          ${order.total_amount.toFixed(2)}
                        </p>
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getOrderStatusColor(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {expandedOrder === order.id && (
                    <div className="border-t bg-gray-50 p-4">
                      <div className="mb-4">
                        <p className="text-sm text-gray-600 mb-1">
                          <span className="font-medium">Payment Method:</span>{' '}
                          {order.payment_method}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Shipping Address:</span>{' '}
                          {order.shipping_address}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <p className="font-medium text-gray-800 mb-2">Items:</p>
                        {order.items?.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center space-x-3 bg-white p-3 rounded"
                          >
                            {item.product?.image_url && (
                              <img
                                src={item.product.image_url}
                                alt={item.product.name}
                                className="w-12 h-12 object-cover rounded"
                              />
                            )}
                            <div className="flex-1">
                              <p className="font-medium text-sm">
                                {item.product?.name || 'Product'}
                              </p>
                              <p className="text-xs text-gray-600">
                                Qty: {item.quantity} × ${item.price.toFixed(2)}
                              </p>
                            </div>
                            <p className="font-medium text-[#f5b04c]">
                              ${(item.quantity * item.price).toFixed(2)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'profile' && (
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
      )}

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
      )}

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
        <div className="flex items-center justify-around py-2">
          <button
            onClick={() => handleTabChange('overview')}
            className={`flex flex-col items-center justify-center px-3 py-2 rounded-lg transition-all ${
              activeTab === 'overview'
                ? 'text-[#f5b04c]'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Home className="w-6 h-6 mb-1" />
            <span className="text-xs font-medium">Home</span>
          </button>

          <button
            onClick={() => handleTabChange('deposit')}
            className={`flex flex-col items-center justify-center px-3 py-2 rounded-lg transition-all ${
              activeTab === 'deposit'
                ? 'text-[#f5b04c]'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <TrendingUp className="w-6 h-6 mb-1" />
            <span className="text-xs font-medium">Deposit</span>
          </button>

          <button
            onClick={() => handleTabChange('orders')}
            className={`flex flex-col items-center justify-center px-3 py-2 rounded-lg transition-all ${
              activeTab === 'orders'
                ? 'text-[#f5b04c]'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Package className="w-6 h-6 mb-1" />
            <span className="text-xs font-medium">Orders</span>
          </button>

          <button
            onClick={() => handleTabChange('transactions')}
            className={`flex flex-col items-center justify-center px-3 py-2 rounded-lg transition-all ${
              activeTab === 'transactions'
                ? 'text-[#f5b04c]'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <FileText className="w-6 h-6 mb-1" />
            <span className="text-xs font-medium">Record</span>
          </button>

          <button
            onClick={() => handleTabChange('profile')}
            className={`flex flex-col items-center justify-center px-3 py-2 rounded-lg transition-all ${
              activeTab === 'profile'
                ? 'text-[#f5b04c]'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <User className="w-6 h-6 mb-1" />
            <span className="text-xs font-medium">Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
}
