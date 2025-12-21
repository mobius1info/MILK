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

    const numAmount = parseFloat(amount);

    if (!email.trim() || !amount || isNaN(numAmount) || numAmount === 0) {
      setResult({
        success: false,
        message: 'Please provide valid email and non-zero amount',
      });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const { data, error } = await supabase.rpc('admin_credit_balance', {
        user_email: email.trim(),
        credit_amount: numAmount,
        admin_note: note.trim() || null,
      });

      if (error) throw error;

      if (data.success) {
        const operation = numAmount > 0 ? 'credited' : 'debited';
        const absAmount = Math.abs(numAmount).toFixed(2);
        setResult({
          success: true,
          message: `Successfully ${operation} $${absAmount} ${numAmount > 0 ? 'to' : 'from'} ${email}. New balance: $${data.new_balance}`,
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
    <div>
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
            <span className="text-xs text-gray-500 ml-2">
              (Positive to add, negative to deduct)
            </span>
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
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f5b04c] focus:border-transparent"
              placeholder="100.00 or -50.00"
              required
            />
          </div>
          {amount && parseFloat(amount) < 0 && (
            <p className="mt-1 text-sm text-red-600">
              This will deduct ${Math.abs(parseFloat(amount)).toFixed(2)} from the user's balance
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description for Client (Optional)
            <span className="text-xs text-gray-500 ml-2">
              (This message will be shown to the client)
            </span>
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f5b04c] focus:border-transparent"
            placeholder="e.g., 'Bonus for referral', 'Refund for order #123', 'Penalty for violation'"
          />
          {note.trim() ? (
            <div className="mt-2 p-2 bg-gray-50 rounded border border-gray-200">
              <p className="text-xs text-gray-600 mb-1">Client will see:</p>
              <p className="text-sm text-gray-800">{note}</p>
            </div>
          ) : (
            <p className="mt-1 text-xs text-gray-500">
              If left empty, default message: "Balance {amount && parseFloat(amount) < 0 ? 'deducted' : 'credited'} by administrator"
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-[#f5b04c] to-[#2a5f64] text-white py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Processing...' : amount && parseFloat(amount) < 0 ? 'Deduct from Balance' : 'Credit Balance'}
        </button>
      </form>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">How it works:</h3>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>Enter the user's email address</li>
          <li>Specify the amount: positive to add funds, negative to deduct</li>
          <li>Example: 100 adds $100, -50 removes $50</li>
          <li>Add a custom description that the client will see in their transaction history</li>
          <li>Balance will be updated immediately</li>
          <li>A transaction record will be created automatically</li>
          <li>System prevents balance from going negative on deductions</li>
        </ul>
      </div>
    </div>
  );
}
