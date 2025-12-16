import { useState } from 'react';
import { X, Plus, Minus, Trash2, ShoppingBag, CreditCard, Wallet as WalletIcon } from 'lucide-react';
import { CartItem } from '../types';
import { Profile } from '../lib/supabase';

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  profile: Profile | null;
  onCheckout: (address: string, paymentMethod: 'balance' | 'card' | 'cash') => Promise<void>;
}

export default function Cart({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  profile,
  onCheckout
}: CartProps) {
  const [showCheckout, setShowCheckout] = useState(false);
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'balance' | 'card' | 'cash'>('balance');
  const [processing, setProcessing] = useState(false);

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = async () => {
    if (!address.trim()) {
      alert('Please enter shipping address');
      return;
    }

    if (paymentMethod === 'balance' && profile && total > profile.balance) {
      alert('Insufficient balance. Please deposit funds first.');
      return;
    }

    setProcessing(true);
    try {
      await onCheckout(address, paymentMethod);
      setShowCheckout(false);
      setAddress('');
      onClose();
    } catch (error: any) {
      alert('Error: ' + error.message);
    } finally {
      setProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose}></div>

      <div className="fixed right-0 top-0 h-full w-full sm:w-96 bg-white shadow-2xl z-50 flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-2">
            <ShoppingBag className="w-6 h-6 text-[#2a5f64]" />
            <h2 className="text-xl font-bold text-gray-800">Shopping Cart</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <ShoppingBag className="w-16 h-16 mb-4 opacity-50" />
              <p className="text-lg">Your cart is empty</p>
            </div>
          ) : !showCheckout ? (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex space-x-3 bg-gray-50 p-3 rounded-lg">
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded"
                  />

                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-800 text-sm mb-1 line-clamp-2">
                      {item.name}
                    </h3>
                    <p className="text-[#f5b04c] font-bold text-sm mb-2">
                      ${item.price}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => onUpdateQuantity(item.id, Math.max(0, item.quantity - 1))}
                          className="p-1 bg-white rounded hover:bg-gray-200 transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="font-medium w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                          className="p-1 bg-white rounded hover:bg-gray-200 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      <button
                        onClick={() => onRemoveItem(item.id)}
                        className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Shipping Address
                </label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f5b04c]"
                  placeholder="Enter your shipping address..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method
                </label>
                <div className="space-y-2">
                  <button
                    onClick={() => setPaymentMethod('balance')}
                    className={`w-full flex items-center justify-between p-3 rounded-lg border-2 transition-colors ${
                      paymentMethod === 'balance'
                        ? 'border-[#f5b04c] bg-[#f5b04c]/10'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <WalletIcon className="w-5 h-5" />
                      <span>Balance</span>
                    </div>
                    <span className="text-sm text-gray-600">
                      ${profile?.balance.toFixed(2) || '0.00'}
                    </span>
                  </button>

                  <button
                    onClick={() => setPaymentMethod('card')}
                    className={`w-full flex items-center space-x-2 p-3 rounded-lg border-2 transition-colors ${
                      paymentMethod === 'card'
                        ? 'border-[#f5b04c] bg-[#f5b04c]/10'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <CreditCard className="w-5 h-5" />
                    <span>Credit Card</span>
                  </button>

                  <button
                    onClick={() => setPaymentMethod('cash')}
                    className={`w-full flex items-center space-x-2 p-3 rounded-lg border-2 transition-colors ${
                      paymentMethod === 'cash'
                        ? 'border-[#f5b04c] bg-[#f5b04c]/10'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span>💵</span>
                    <span>Cash on Delivery</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t p-4 space-y-3">
            <div className="flex justify-between items-center text-lg font-bold">
              <span>Total:</span>
              <span className="text-[#2a5f64]">${total.toFixed(2)}</span>
            </div>
            {!showCheckout ? (
              <button
                onClick={() => setShowCheckout(true)}
                className="w-full bg-gradient-to-r from-[#f5b04c] to-[#2a5f64] text-white py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-300"
              >
                Proceed to Checkout
              </button>
            ) : (
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowCheckout(false)}
                  className="flex-1 border border-gray-300 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleCheckout}
                  disabled={processing}
                  className="flex-1 bg-gradient-to-r from-[#f5b04c] to-[#2a5f64] text-white py-2 rounded-lg font-medium hover:shadow-lg transition-all duration-300 disabled:opacity-50"
                >
                  {processing ? 'Processing...' : 'Place Order'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
