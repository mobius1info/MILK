import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { TrendingUp, TrendingDown, DollarSign, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface Transaction {
  id: string;
  user_id: string;
  type: 'deposit' | 'withdrawal' | 'commission' | 'referral_bonus' | 'manual_credit' | 'vip_purchase' | 'product_purchase';
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'rejected';
  description?: string;
  created_at: string;
}

interface BalanceHistoryProps {
  userId: string;
}

export default function BalanceHistory({ userId }: BalanceHistoryProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'deposit' | 'withdrawal' | 'commission'>('all');

  useEffect(() => {
    fetchTransactions();
  }, [userId]);

  const fetchTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredTransactions = () => {
    if (filter === 'all') return transactions;

    if (filter === 'commission') {
      return transactions.filter(t =>
        t.type === 'commission' ||
        t.type === 'referral_bonus'
      );
    }

    return transactions.filter(t => t.type === filter);
  };

  const getTransactionIcon = (type: Transaction['type']) => {
    switch (type) {
      case 'deposit':
      case 'manual_credit':
        return <TrendingUp className="w-5 h-5 text-green-500" />;
      case 'withdrawal':
        return <TrendingDown className="w-5 h-5 text-red-500" />;
      case 'commission':
      case 'referral_bonus':
        return <DollarSign className="w-5 h-5 text-blue-500" />;
      case 'vip_purchase':
      case 'product_purchase':
        return <TrendingDown className="w-5 h-5 text-orange-500" />;
      default:
        return <DollarSign className="w-5 h-5 text-gray-500" />;
    }
  };

  const getTransactionLabel = (type: Transaction['type']) => {
    switch (type) {
      case 'deposit':
        return 'Deposit';
      case 'withdrawal':
        return 'Withdrawal';
      case 'commission':
        return 'Purchase Commission';
      case 'referral_bonus':
        return 'Referral Bonus';
      case 'manual_credit':
        return 'Admin Credit';
      case 'vip_purchase':
        return 'VIP Purchase';
      case 'product_purchase':
        return 'Product Purchase';
      default:
        return type;
    }
  };

  const getStatusIcon = (status: Transaction['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'failed':
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusLabel = (status: Transaction['status']) => {
    switch (status) {
      case 'completed':
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

  const getStatusColor = (status: Transaction['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const isPositive = (type: Transaction['type']) => {
    return ['deposit', 'commission', 'referral_bonus', 'manual_credit'].includes(type);
  };

  const calculateTotals = () => {
    const filteredTrans = getFilteredTransactions();

    let totalAmount = 0;
    let approvedAmount = 0;
    let pendingAmount = 0;
    let rejectedAmount = 0;

    filteredTrans.forEach(t => {
      const amount = Math.abs(t.amount);
      totalAmount += amount;

      if (t.status === 'approved' || t.status === 'completed') {
        approvedAmount += amount;
      } else if (t.status === 'pending') {
        pendingAmount += amount;
      } else if (t.status === 'rejected' || t.status === 'failed') {
        rejectedAmount += amount;
      }
    });

    return {
      total: totalAmount,
      approved: approvedAmount,
      pending: pendingAmount,
      rejected: rejectedAmount,
      count: filteredTrans.length
    };
  };

  const getSectionTitle = () => {
    switch (filter) {
      case 'deposit':
        return 'Deposits';
      case 'withdrawal':
        return 'Withdrawals';
      case 'commission':
        return 'Earnings';
      default:
        return 'All Transactions';
    }
  };

  const filteredTransactions = getFilteredTransactions();
  const totals = calculateTotals();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f5b04c]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow-md p-4">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Balance History</h2>

        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-gradient-to-r from-[#f5b04c] to-[#2a5f64] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Transactions
          </button>
          <button
            onClick={() => setFilter('deposit')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'deposit'
                ? 'bg-gradient-to-r from-[#f5b04c] to-[#2a5f64] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Deposits
          </button>
          <button
            onClick={() => setFilter('withdrawal')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'withdrawal'
                ? 'bg-gradient-to-r from-[#f5b04c] to-[#2a5f64] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Withdrawals
          </button>
          <button
            onClick={() => setFilter('commission')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'commission'
                ? 'bg-gradient-to-r from-[#f5b04c] to-[#2a5f64] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Earnings
          </button>
        </div>

        {filter !== 'all' && totals.count > 0 && (
          <div className="bg-gradient-to-r from-[#f5b04c] to-[#2a5f64] rounded-lg p-4 mb-4 text-white">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold">{getSectionTitle()} - Total</h3>
              <span className="text-sm opacity-90">Total transactions: {totals.count}</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                <p className="text-xs opacity-90 mb-1">Approved</p>
                <p className="text-xl font-bold">${totals.approved.toFixed(2)}</p>
              </div>
              {totals.pending > 0 && (
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                  <p className="text-xs opacity-90 mb-1">Pending</p>
                  <p className="text-xl font-bold">${totals.pending.toFixed(2)}</p>
                </div>
              )}
              {totals.rejected > 0 && (
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                  <p className="text-xs opacity-90 mb-1">Rejected</p>
                  <p className="text-xl font-bold">${totals.rejected.toFixed(2)}</p>
                </div>
              )}
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                <p className="text-xs opacity-90 mb-1">Total</p>
                <p className="text-xl font-bold">${totals.total.toFixed(2)}</p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No transactions found</p>
            </div>
          ) : (
            filteredTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-start space-x-3 flex-1">
                  <div className="mt-1">
                    {getTransactionIcon(transaction.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-800">
                        {getTransactionLabel(transaction.type)}
                      </h3>
                      <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${getStatusColor(transaction.status)}`}>
                        {getStatusIcon(transaction.status)}
                        <span>{getStatusLabel(transaction.status)}</span>
                      </div>
                    </div>
                    {transaction.description && (
                      <p className="text-sm text-gray-600 mb-1">{transaction.description}</p>
                    )}
                    <p className="text-xs text-gray-500">
                      {new Date(transaction.created_at).toLocaleString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
                <div className="text-right ml-4">
                  <p className={`text-lg font-bold ${
                    isPositive(transaction.type) ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {isPositive(transaction.type) ? '+' : '-'}${Math.abs(transaction.amount).toFixed(2)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
