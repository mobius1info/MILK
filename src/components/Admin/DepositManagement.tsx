import { useState, useEffect } from 'react';
import { supabase, Transaction, Profile } from '../../lib/supabase';
import { Check, X, Clock, TrendingUp, AlertCircle } from 'lucide-react';
import NotificationModal from '../NotificationModal';

interface TransactionWithProfile extends Transaction {
  profile?: Profile;
}

export default function DepositManagement() {
  const [transactions, setTransactions] = useState<TransactionWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState<string | null>(null);
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
    fetchTransactions();
  }, [filter]);

  const fetchTransactions = async () => {
    try {
      let query = supabase
        .from('transactions')
        .select(`
          *,
          profile:profiles(*)
        `)
        .eq('type', 'deposit')
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Error fetching deposits:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const transaction = transactions.find((t) => t.id === id);

      const { error } = await supabase
        .from('transactions')
        .update({ status: 'approved' })
        .eq('id', id);

      if (error) throw error;

      setNotification({
        isOpen: true,
        type: 'success',
        title: 'Депозит одобрен',
        message: `$${transaction?.amount.toFixed(2)} зачислено на счет ${transaction?.profile?.email}`,
      });

      fetchTransactions();
    } catch (error: any) {
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Ошибка',
        message: error.message,
      });
    }
  };

  const handleReject = async (id: string) => {
    if (!rejectionReason.trim()) {
      setNotification({
        isOpen: true,
        type: 'warning',
        title: 'Предупреждение',
        message: 'Пожалуйста, укажите причину отклонения',
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('transactions')
        .update({
          status: 'rejected',
          rejection_reason: rejectionReason,
        })
        .eq('id', id);

      if (error) throw error;
      setSelectedTransaction(null);
      setRejectionReason('');
      fetchTransactions();
    } catch (error: any) {
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Ошибка',
        message: error.message,
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div>
      <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200 flex items-start space-x-3">
        <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-blue-900 mb-1">Auto-Credit Enabled</h3>
          <p className="text-sm text-blue-800">
            When you approve a deposit, the balance will be automatically credited to the user's account.
            A notification will confirm the credit was successful.
          </p>
        </div>
      </div>

      <div className="flex justify-end mb-6">
        <div className="flex flex-wrap gap-2">
          {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3 sm:px-4 py-2 text-sm rounded-lg capitalize transition-all ${
                filter === status
                  ? 'bg-gradient-to-r from-[#f5b04c] to-[#2a5f64] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {transactions.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <Clock className="w-12 h-12 mx-auto text-gray-400 mb-3" />
            <p className="text-gray-500">No deposits found</p>
          </div>
        ) : (
          transactions.map((transaction) => (
            <div key={transaction.id} className="bg-white rounded-lg shadow-md p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start justify-between space-y-4 sm:space-y-0">
                <div className="flex-1 w-full">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="p-2 rounded-lg bg-green-100 text-green-600">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-base sm:text-lg">Deposit</h3>
                      <p className="text-xs sm:text-sm text-gray-600 break-all">
                        {transaction.profile?.email || 'Unknown user'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <p className="text-xs sm:text-sm text-gray-500">Amount</p>
                      <p className="font-semibold text-base sm:text-lg text-green-600">
                        +${transaction.amount.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-gray-500">Date</p>
                      <p className="font-medium text-sm">
                        {new Date(transaction.created_at).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(transaction.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-gray-500">Status</p>
                      <span
                        className={`inline-block px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${getStatusColor(
                          transaction.status
                        )}`}
                      >
                        {transaction.status}
                      </span>
                    </div>
                    {transaction.rejection_reason && (
                      <div className="col-span-1 sm:col-span-2">
                        <p className="text-xs sm:text-sm text-gray-500">Rejection Reason</p>
                        <p className="text-sm text-red-600">{transaction.rejection_reason}</p>
                      </div>
                    )}
                  </div>
                </div>

                {transaction.status === 'pending' && (
                  <div className="flex sm:flex-col space-x-2 sm:space-x-0 sm:space-y-2 w-full sm:w-auto sm:ml-4">
                    <button
                      onClick={() => handleApprove(transaction.id)}
                      className="flex-1 sm:flex-none flex items-center justify-center space-x-2 bg-green-500 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-green-600 transition-colors text-sm"
                    >
                      <Check className="w-4 h-4" />
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={() => setSelectedTransaction(transaction.id)}
                      className="flex-1 sm:flex-none flex items-center justify-center space-x-2 bg-red-500 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-red-600 transition-colors text-sm"
                    >
                      <X className="w-4 h-4" />
                      <span>Reject</span>
                    </button>
                  </div>
                )}
              </div>

              {selectedTransaction === transaction.id && (
                <div className="mt-4 pt-4 border-t">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rejection Reason
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Enter reason for rejection..."
                  />
                  <div className="flex space-x-2 mt-2">
                    <button
                      onClick={() => handleReject(transaction.id)}
                      className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                    >
                      Confirm Rejection
                    </button>
                    <button
                      onClick={() => {
                        setSelectedTransaction(null);
                        setRejectionReason('');
                      }}
                      className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
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
