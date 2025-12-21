import { useState, useEffect } from 'react';
import { supabase, Transaction, Profile } from '../../lib/supabase';
import { Check, X, Clock, TrendingUp, TrendingDown } from 'lucide-react';
import NotificationModal from '../NotificationModal';

interface TransactionWithProfile extends Transaction {
  profile?: Profile;
}

export default function TransactionManagement() {
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
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const { error } = await supabase
        .from('transactions')
        .update({ status: 'approved' })
        .eq('id', id);

      if (error) throw error;
      fetchTransactions();
    } catch (error: any) {
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: error.message,
      });
    }
  };

  const handleReject = async (id: string) => {
    if (!rejectionReason.trim()) {
      setNotification({
        isOpen: true,
        type: 'warning',
        title: 'Warning',
        message: 'Please specify the reason for rejection',
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
        title: 'Error',
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
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Transaction Management</h2>
        <div className="flex space-x-2">
          {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg capitalize transition-all ${
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
            <p className="text-gray-500">No transactions found</p>
          </div>
        ) : (
          transactions.map((transaction) => (
            <div key={transaction.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <div
                      className={`p-2 rounded-lg ${
                        transaction.type === 'deposit'
                          ? 'bg-green-100 text-green-600'
                          : 'bg-red-100 text-red-600'
                      }`}
                    >
                      {transaction.type === 'deposit' ? (
                        <TrendingUp className="w-5 h-5" />
                      ) : (
                        <TrendingDown className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg capitalize">
                        {transaction.type}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {transaction.profile?.email || 'Unknown user'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <p className="text-sm text-gray-500">Amount</p>
                      <p className="font-semibold text-lg text-[#f5b04c]">
                        ${transaction.amount.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Date</p>
                      <p className="font-medium">
                        {new Date(transaction.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Status</p>
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                          transaction.status
                        )}`}
                      >
                        {transaction.status}
                      </span>
                    </div>
                    {transaction.rejection_reason && (
                      <div className="col-span-2">
                        <p className="text-sm text-gray-500">Rejection Reason</p>
                        <p className="text-red-600">{transaction.rejection_reason}</p>
                      </div>
                    )}
                  </div>
                </div>

                {transaction.status === 'pending' && (
                  <div className="flex flex-col space-y-2 ml-4">
                    <button
                      onClick={() => handleApprove(transaction.id)}
                      className="flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                    >
                      <Check className="w-4 h-4" />
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={() => setSelectedTransaction(transaction.id)}
                      className="flex items-center space-x-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
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
