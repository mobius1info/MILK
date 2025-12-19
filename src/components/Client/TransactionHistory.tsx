import { useState, useEffect } from 'react';
import { supabase, Transaction } from '../../lib/supabase';
import { TrendingUp, TrendingDown, Clock, Check, X } from 'lucide-react';

interface TransactionHistoryProps {
  userId: string;
}

export default function TransactionHistory({ userId }: TransactionHistoryProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center py-8">Loading...</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">Transaction History</h2>

      {transactions.length === 0 ? (
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
  );
}
