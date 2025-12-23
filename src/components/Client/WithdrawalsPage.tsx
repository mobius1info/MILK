import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { TrendingDown, Clock, CheckCircle, XCircle, AlertCircle, Plus } from 'lucide-react';
import NotificationModal from '../NotificationModal';

interface Transaction {
  id: string;
  user_id: string;
  type: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'rejected';
  created_at: string;
  description?: string;
}

interface WithdrawalsPageProps {
  userId: string;
  userBalance: number;
  onBalanceUpdate: () => void;
}

export default function WithdrawalsPage({ userId, userBalance, onBalanceUpdate }: WithdrawalsPageProps) {
  const [withdrawals, setWithdrawals] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [amount, setAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
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

  useEffect(() => {
    fetchWithdrawals();
  }, [userId]);

  const fetchWithdrawals = async () => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .eq('type', 'withdrawal')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWithdrawals(data || []);
    } catch (error) {
      console.error('Error fetching withdrawals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawal = async () => {
    const withdrawAmount = parseFloat(amount);

    if (!amount || withdrawAmount <= 0) {
      setNotification({
        isOpen: true,
        type: 'warning',
        title: 'Invalid Amount',
        message: 'Please enter a valid amount for withdrawal',
      });
      return;
    }

    if (withdrawAmount > userBalance) {
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Insufficient Funds',
        message: 'Your balance is insufficient to withdraw this amount',
      });
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from('transactions').insert([
        {
          user_id: userId,
          type: 'withdrawal',
          amount: withdrawAmount,
          status: 'pending',
        },
      ]);

      if (error) throw error;

      setShowWithdrawalModal(false);
      setAmount('');
      onBalanceUpdate();
      fetchWithdrawals();
      setNotification({
        isOpen: true,
        type: 'success',
        title: 'Request Submitted!',
        message: 'Your withdrawal request has been successfully submitted and is awaiting administrator approval',
      });
    } catch (error: any) {
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: error.message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'failed':
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
      case 'approved':
        return 'Completed';
      case 'pending':
        return 'Pending';
      case 'failed':
        return 'Failed';
      case 'rejected':
        return 'Rejected';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'failed':
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTotalStats = () => {
    const completed = withdrawals.filter(w => w.status === 'completed' || w.status === 'approved');
    const pending = withdrawals.filter(w => w.status === 'pending');
    const rejected = withdrawals.filter(w => w.status === 'rejected' || w.status === 'failed');

    return {
      total: withdrawals.reduce((sum, w) => sum + w.amount, 0),
      completed: completed.reduce((sum, w) => sum + w.amount, 0),
      pending: pending.reduce((sum, w) => sum + w.amount, 0),
      rejected: rejected.reduce((sum, w) => sum + w.amount, 0),
      completedCount: completed.length,
      pendingCount: pending.length,
      rejectedCount: rejected.length,
    };
  };

  const stats = getTotalStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f5b04c]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-red-500 to-pink-500 rounded-lg shadow-lg p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm opacity-90">Available for Withdrawal</p>
            <h2 className="text-3xl font-bold">${userBalance.toFixed(2)}</h2>
          </div>
          <TrendingDown className="w-12 h-12 opacity-80" />
        </div>
        <button
          onClick={() => setShowWithdrawalModal(true)}
          className="w-full bg-white text-red-600 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>New Withdrawal Request</span>
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-xs text-gray-600 mb-1">Total Withdrawn</p>
          <p className="text-xl font-bold text-green-600">${stats.completed.toFixed(2)}</p>
          <p className="text-xs text-gray-500 mt-1">{stats.completedCount} transactions</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-xs text-gray-600 mb-1">Pending</p>
          <p className="text-xl font-bold text-yellow-600">${stats.pending.toFixed(2)}</p>
          <p className="text-xs text-gray-500 mt-1">{stats.pendingCount} requests</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-xs text-gray-600 mb-1">Rejected</p>
          <p className="text-xl font-bold text-red-600">${stats.rejected.toFixed(2)}</p>
          <p className="text-xs text-gray-500 mt-1">{stats.rejectedCount} requests</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <p className="text-xs text-gray-600 mb-1">Total Requests</p>
          <p className="text-xl font-bold text-gray-800">{withdrawals.length}</p>
          <p className="text-xs text-gray-500 mt-1">${stats.total.toFixed(2)}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-4">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Withdrawal History</h2>

        <div className="space-y-3">
          {withdrawals.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <TrendingDown className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-semibold mb-2">No Withdrawals Yet</p>
              <p className="text-sm">Create your first withdrawal request</p>
            </div>
          ) : (
            withdrawals.map((withdrawal) => (
              <div
                key={withdrawal.id}
                className={`p-4 rounded-lg border-2 transition-all ${getStatusColor(withdrawal.status)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="mt-1">
                      {getStatusIcon(withdrawal.status)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-800">
                          Withdrawal Request
                        </h3>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">
                        Status: <span className="font-semibold">{getStatusLabel(withdrawal.status)}</span>
                      </p>
                      {withdrawal.description && (
                        <p className="text-sm text-gray-600 mb-1">{withdrawal.description}</p>
                      )}
                      <p className="text-xs text-gray-500">
                        {new Date(withdrawal.created_at).toLocaleString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-2xl font-bold text-red-600">
                      ${withdrawal.amount.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

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
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-gray-600">
                    Available: <span className="font-semibold text-lg text-blue-600">${userBalance.toFixed(2)}</span>
                  </p>
                </div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount to Withdraw</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max={userBalance}
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
