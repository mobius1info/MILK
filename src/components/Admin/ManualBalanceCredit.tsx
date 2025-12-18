import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { DollarSign, Mail, AlertCircle, CheckCircle } from 'lucide-react';

export default function ManualBalanceCredit() {
  const [email, setEmail] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleCredit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !amount || parseFloat(amount) <= 0) {
      setResult({
        success: false,
        message: 'Please provide valid email and amount',
      });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const { data, error } = await supabase.rpc('admin_credit_balance', {
        user_email: email.trim(),
        credit_amount: parseFloat(amount),
        admin_note: note.trim() || null,
      });

      if (error) throw error;

      if (data.success) {
        setResult({
          success: true,
          message: `Successfully credited $${amount} to ${email}. New balance: $${data.new_balance}`,
        });
        setEmail('');
        setAmount('');
        setNote('');
      } else {
        setResult({
          success: false,
          message: data.message,
        });
      }
    } catch (error: any) {
      setResult({
        success: false,
        message: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-3 bg-gradient-to-r from-[#f5b04c] to-[#2a5f64] rounded-lg">
          <DollarSign className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Manual Balance Credit</h2>
          <p className="text-sm text-gray-600">Credit balance to user by email</p>
        </div>
      </div>

      {result && (
        <div
          className={`mb-6 p-4 rounded-lg flex items-start space-x-3 ${
            result.success
              ? 'bg-green-50 border border-green-200'
              : 'bg-red-50 border border-red-200'
          }`}
        >
          {result.success ? (
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          )}
          <p className={`text-sm ${result.success ? 'text-green-800' : 'text-red-800'}`}>
            {result.message}
          </p>
        </div>
      )}

      <form onSubmit={handleCredit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            User Email
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f5b04c] focus:border-transparent"
              placeholder="user@example.com"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Amount ($)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <DollarSign className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              step="0.01"
              min="0.01"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f5b04c] focus:border-transparent"
              placeholder="0.00"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Note (Optional)
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f5b04c] focus:border-transparent"
            placeholder="Add a note for this credit (e.g., 'Compensation for issue #123')"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-[#f5b04c] to-[#2a5f64] text-white py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Processing...' : 'Credit Balance'}
        </button>
      </form>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">How it works:</h3>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>Enter the user's email address</li>
          <li>Specify the amount to credit</li>
          <li>Optionally add a note for record keeping</li>
          <li>Balance will be credited immediately</li>
          <li>A transaction record will be created automatically</li>
        </ul>
      </div>
    </div>
  );
}
