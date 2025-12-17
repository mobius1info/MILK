import { useState } from 'react';
import { Package, TrendingUp, TrendingDown, Lock, CreditCard } from 'lucide-react';
import ProductManagement from './ProductManagement';
import DepositManagement from './DepositManagement';
import WithdrawalManagement from './WithdrawalManagement';
import CategoryAccessManagement from './CategoryAccessManagement';
import PaymentMethodsManagement from './PaymentMethodsManagement';

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState<'products' | 'deposits' | 'withdrawals' | 'access' | 'payment-methods'>('products');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 mb-6">
          <button
            onClick={() => setActiveTab('products')}
            className={`flex items-center justify-center sm:justify-start space-x-2 px-4 sm:px-6 py-3 rounded-lg transition-all ${
              activeTab === 'products'
                ? 'bg-gradient-to-r from-[#f5b04c] to-[#2a5f64] text-white shadow-md'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Package className="w-5 h-5" />
            <span className="font-medium">Products</span>
          </button>
          <button
            onClick={() => setActiveTab('deposits')}
            className={`flex items-center justify-center sm:justify-start space-x-2 px-4 sm:px-6 py-3 rounded-lg transition-all ${
              activeTab === 'deposits'
                ? 'bg-gradient-to-r from-[#f5b04c] to-[#2a5f64] text-white shadow-md'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <TrendingUp className="w-5 h-5" />
            <span className="font-medium">Deposits</span>
          </button>
          <button
            onClick={() => setActiveTab('withdrawals')}
            className={`flex items-center justify-center sm:justify-start space-x-2 px-4 sm:px-6 py-3 rounded-lg transition-all ${
              activeTab === 'withdrawals'
                ? 'bg-gradient-to-r from-[#f5b04c] to-[#2a5f64] text-white shadow-md'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <TrendingDown className="w-5 h-5" />
            <span className="font-medium">Withdrawals</span>
          </button>
          <button
            onClick={() => setActiveTab('access')}
            className={`flex items-center justify-center sm:justify-start space-x-2 px-4 sm:px-6 py-3 rounded-lg transition-all ${
              activeTab === 'access'
                ? 'bg-gradient-to-r from-[#f5b04c] to-[#2a5f64] text-white shadow-md'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Lock className="w-5 h-5" />
            <span className="font-medium">Category Access</span>
          </button>
          <button
            onClick={() => setActiveTab('payment-methods')}
            className={`flex items-center justify-center sm:justify-start space-x-2 px-4 sm:px-6 py-3 rounded-lg transition-all ${
              activeTab === 'payment-methods'
                ? 'bg-gradient-to-r from-[#f5b04c] to-[#2a5f64] text-white shadow-md'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <CreditCard className="w-5 h-5" />
            <span className="font-medium">Payment Methods</span>
          </button>
        </div>

        {activeTab === 'products' && <ProductManagement />}
        {activeTab === 'deposits' && <DepositManagement />}
        {activeTab === 'withdrawals' && <WithdrawalManagement />}
        {activeTab === 'access' && <CategoryAccessManagement />}
        {activeTab === 'payment-methods' && <PaymentMethodsManagement />}
      </div>
    </div>
  );
}
