import { useState, useEffect } from 'react';
import { supabase, Profile, Transaction, Referral } from '../../lib/supabase';
import { Wallet, TrendingUp, TrendingDown, Clock, Check, X, Users, Copy, Package, FileText, User, Home, ShoppingBag } from 'lucide-react';
import OrderHistory from './OrderHistory';
import DepositPage from './DepositPage';
import CategoryPurchase from './CategoryPurchase';

interface DashboardProps {
  profile: Profile;
  onBalanceUpdate: () => void;
  initialTab?: 'overview' | 'deposit' | 'orders' | 'categories' | 'referrals' | 'transactions' | 'profile';
}

export default function Dashboard({ profile, onBalanceUpdate, initialTab = 'overview' }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'deposit' | 'orders' | 'categories' | 'referrals' | 'transactions' | 'profile'>(initialTab);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [amount, setAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTransactions();
    fetchReferrals();
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

  return (
    <div className="pb-24 md:pb-6">
      {activeTab === 'deposit' ? (
        <DepositPage
          userId={profile.id}
          onBack={() => handleTabChange('overview')}
          onSuccess={() => {
            fetchTransactions();
            onBalanceUpdate();
          }}
        />
      ) : (
        <div className="max-w-6xl mx-auto p-4 sm:p-6">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2 break-words">
              Welcome, {profile.full_name || profile.email}
            </h1>
            <p className="text-sm sm:text-base text-gray-600">Manage your account and transactions</p>
          </div>

          <div className="hidden md:flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 mb-6">
            {[
              { id: 'overview', label: 'Overview', icon: Wallet },
              { id: 'orders', label: 'Orders', icon: Package },
              { id: 'categories', label: 'Buy Categories', icon: ShoppingBag },
              { id: 'referrals', label: 'Referrals', icon: Users },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => handleTabChange(id as typeof activeTab)}
                className={`flex items-center justify-center sm:justify-start space-x-2 px-4 py-2 rounded-lg transition-all ${
                  activeTab === id
                    ? 'bg-gradient-to-r from-[#f5b04c] to-[#2a5f64] text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{label}</span>
              </button>
            ))}
          </div>

      {activeTab === 'overview' && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="bg-gradient-to-r from-[#f5b04c] to-[#2a5f64] text-white rounded-lg shadow-lg p-4 sm:p-6 sm:col-span-2 md:col-span-1">
              <div className="flex items-center space-x-3 mb-3 sm:mb-4">
                <Wallet className="w-6 sm:w-8 h-6 sm:h-8" />
                <h2 className="text-lg sm:text-xl font-semibold">Balance</h2>
              </div>
              <p className="text-3xl sm:text-4xl font-bold">${profile.balance.toFixed(2)}</p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
              <button
                onClick={() => handleTabChange('deposit')}
                className="w-full flex items-center justify-center space-x-2 bg-green-500 text-white py-3 sm:py-4 rounded-lg hover:bg-green-600 transition-colors"
              >
                <TrendingUp className="w-5 sm:w-6 h-5 sm:h-6" />
                <span className="text-base sm:text-lg font-medium">Deposit</span>
              </button>
            </div>

            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
              <button
                onClick={() => setShowWithdrawalModal(true)}
                className="w-full flex items-center justify-center space-x-2 bg-red-500 text-white py-3 sm:py-4 rounded-lg hover:bg-red-600 transition-colors"
              >
                <TrendingDown className="w-5 sm:w-6 h-5 sm:h-6" />
                <span className="text-base sm:text-lg font-medium">Withdraw</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">Transaction History</h2>

            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No transactions yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors space-y-3 sm:space-y-0"
                  >
                    <div className="flex items-center space-x-3 sm:space-x-4 w-full sm:w-auto">
                      <div
                        className={`p-2 sm:p-3 rounded-lg ${
                          transaction.type === 'deposit'
                            ? 'bg-green-100 text-green-600'
                            : 'bg-red-100 text-red-600'
                        }`}
                      >
                        {transaction.type === 'deposit' ? (
                          <TrendingUp className="w-5 sm:w-6 h-5 sm:h-6" />
                        ) : (
                          <TrendingDown className="w-5 sm:w-6 h-5 sm:h-6" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-sm sm:text-base capitalize">{transaction.type}</h3>
                        <p className="text-xs sm:text-sm text-gray-600">
                          {new Date(transaction.created_at).toLocaleString()}
                        </p>
                        {transaction.rejection_reason && (
                          <p className="text-xs sm:text-sm text-red-600 mt-1">
                            Reason: {transaction.rejection_reason}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto sm:space-x-4">
                      <div className="text-left sm:text-right">
                        <p className="font-bold text-base sm:text-lg">
                          {transaction.type === 'deposit' ? '+' : '-'}$
                          {transaction.amount.toFixed(2)}
                        </p>
                        <div className="flex items-center space-x-1 justify-start sm:justify-end">
                          {getStatusIcon(transaction.status)}
                          <span className="text-xs sm:text-sm capitalize">{transaction.status}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === 'orders' && (
        <OrderHistory
          userId={profile.id}
          onNavigateToDeposit={() => handleTabChange('deposit')}
        />
      )}

      {activeTab === 'categories' && <CategoryPurchase />}

      {activeTab === 'transactions' && (
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">Transaction History</h2>

          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No transactions yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors space-y-3 sm:space-y-0"
                >
                  <div className="flex items-center space-x-3 sm:space-x-4 w-full sm:w-auto">
                    <div
                      className={`p-2 sm:p-3 rounded-lg ${
                        transaction.type === 'deposit'
                          ? 'bg-green-100 text-green-600'
                          : 'bg-red-100 text-red-600'
                      }`}
                    >
                      {transaction.type === 'deposit' ? (
                        <TrendingUp className="w-5 sm:w-6 h-5 sm:h-6" />
                      ) : (
                        <TrendingDown className="w-5 sm:w-6 h-5 sm:h-6" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm sm:text-base capitalize">{transaction.type}</h3>
                      <p className="text-xs sm:text-sm text-gray-600">
                        {new Date(transaction.created_at).toLocaleString()}
                      </p>
                      {transaction.rejection_reason && (
                        <p className="text-xs sm:text-sm text-red-600 mt-1">
                          Reason: {transaction.rejection_reason}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto sm:space-x-4">
                    <div className="text-left sm:text-right">
                      <p className="font-bold text-base sm:text-lg">
                        {transaction.type === 'deposit' ? '+' : '-'}$
                        {transaction.amount.toFixed(2)}
                      </p>
                      <div className="flex items-center space-x-1 justify-start sm:justify-end">
                        {getStatusIcon(transaction.status)}
                        <span className="text-xs sm:text-sm capitalize">{transaction.status}</span>
                      </div>
                    </div>
                  </div>
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

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
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
            onClick={() => handleTabChange('categories')}
            className={`flex flex-col items-center justify-center px-3 py-2 rounded-lg transition-all ${
              activeTab === 'categories'
                ? 'text-[#f5b04c]'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <ShoppingBag className="w-6 h-6 mb-1" />
            <span className="text-xs font-medium">Categories</span>
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
