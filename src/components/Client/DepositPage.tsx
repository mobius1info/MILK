import { useState, useEffect } from 'react';
import { supabase, PaymentMethod } from '../../lib/supabase';
import { ArrowLeft, Copy, Check, Wallet, Info, Upload } from 'lucide-react';
import NotificationModal from '../NotificationModal';

interface DepositPageProps {
  userId: string;
  onBack: () => void;
  onSuccess: () => void;
}

export default function DepositPage({ userId, onBack, onSuccess }: DepositPageProps) {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
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
    fetchPaymentMethods();
  }, []);

  const fetchPaymentMethods = async () => {
    try {
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      setPaymentMethods(data || []);

      if (data && data.length > 0) {
        setSelectedMethod(data[0]);
      }
    } catch (error) {
      console.error('Error fetching payment methods:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async () => {
    if (!selectedMethod || !amount || parseFloat(amount) <= 0) {
      setNotification({
        isOpen: true,
        type: 'warning',
        title: 'Invalid Amount',
        message: 'Please enter a valid deposit amount'
      });
      return;
    }

    const depositAmount = parseFloat(amount);

    if (depositAmount < selectedMethod.min_amount) {
      setNotification({
        isOpen: true,
        type: 'warning',
        title: 'Amount Too Small',
        message: `Minimum deposit amount: $${selectedMethod.min_amount.toFixed(2)}`
      });
      return;
    }

    if (selectedMethod.max_amount && depositAmount > selectedMethod.max_amount) {
      setNotification({
        isOpen: true,
        type: 'warning',
        title: 'Amount Too Large',
        message: `Maximum deposit amount: $${selectedMethod.max_amount.toFixed(2)}`
      });
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from('transactions').insert([
        {
          user_id: userId,
          type: 'deposit',
          amount: depositAmount,
          status: 'pending',
          payment_method_id: selectedMethod.id,
        },
      ]);

      if (error) throw error;

      setNotification({
        isOpen: true,
        type: 'success',
        title: 'Request Submitted',
        message: 'Deposit request successfully submitted! Please wait for administrator confirmation.'
      });
      setAmount('');
      onSuccess();
      onBack();
    } catch (error: any) {
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: 'An error occurred: ' + error.message
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading payment methods...</div>
      </div>
    );
  }

  if (paymentMethods.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <Wallet className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No Payment Methods Available</h2>
          <p className="text-gray-600">Please contact support to enable deposit methods.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6">
      <button
        onClick={onBack}
        className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 mb-6 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="font-medium">Back to Dashboard</span>
      </button>

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Deposit Funds</h1>
        <p className="text-gray-600">Choose a payment method and complete your deposit</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Payment Methods</h2>
            <div className="space-y-2">
              {paymentMethods.map((method) => (
                <button
                  key={method.id}
                  onClick={() => setSelectedMethod(method)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    selectedMethod?.id === method.id
                      ? 'border-[#f5b04c] bg-orange-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-800">{method.name}</h3>
                      {method.network && (
                        <p className="text-sm text-gray-600">{method.network}</p>
                      )}
                    </div>
                    {selectedMethod?.id === method.id && (
                      <Check className="w-5 h-5 text-[#f5b04c]" />
                    )}
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    Min: ${method.min_amount.toFixed(2)}
                    {method.max_amount && ` | Max: $${method.max_amount.toFixed(2)}`}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          {selectedMethod && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  {selectedMethod.name} Deposit
                </h2>

                <div className="bg-gradient-to-r from-[#f5b04c] to-[#2a5f64] rounded-lg p-6 mb-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <p className="text-white text-sm mb-2 font-medium">
                        {selectedMethod.network ? `${selectedMethod.network} Address` : 'Wallet Address'}
                      </p>
                      <p className="text-white font-mono text-sm sm:text-base break-all">
                        {selectedMethod.wallet_address}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => copyToClipboard(selectedMethod.wallet_address)}
                    className="w-full bg-white text-[#f5b04c] py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2"
                  >
                    {copied ? (
                      <>
                        <Check className="w-5 h-5" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-5 h-5" />
                        <span>Copy Address</span>
                      </>
                    )}
                  </button>
                </div>

                {selectedMethod.instructions && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <div className="flex items-start space-x-3">
                      <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-semibold text-blue-900 mb-1">Instructions</h3>
                        <p className="text-sm text-blue-800">{selectedMethod.instructions}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Deposit Amount (USD)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min={selectedMethod.min_amount}
                      max={selectedMethod.max_amount || undefined}
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f5b04c] text-lg"
                      placeholder={`Min: $${selectedMethod.min_amount.toFixed(2)}`}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Range: ${selectedMethod.min_amount.toFixed(2)}
                      {selectedMethod.max_amount && ` - $${selectedMethod.max_amount.toFixed(2)}`}
                    </p>
                  </div>

                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="w-full bg-gradient-to-r from-[#f5b04c] to-[#2a5f64] text-white py-4 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 text-lg"
                  >
                    {submitting ? 'Submitting...' : 'Submit Deposit Request'}
                  </button>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <Info className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-yellow-800">
                        <p className="font-semibold mb-1">Important Notice:</p>
                        <ul className="list-disc list-inside space-y-1">
                          <li>Send exact amount to the address above</li>
                          <li>Your deposit will be reviewed by admin</li>
                          <li>Processing time: 10-30 minutes after confirmation</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
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
