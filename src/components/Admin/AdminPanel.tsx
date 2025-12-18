import { useState } from 'react';
import { Package, TrendingUp, TrendingDown, Lock, CreditCard, DollarSign, ShoppingBag, Image } from 'lucide-react';
import ProductManagement from './ProductManagement';
import DepositManagement from './DepositManagement';
import WithdrawalManagement from './WithdrawalManagement';
import CategoryAccessManagement from './CategoryAccessManagement';
import PaymentMethodsManagement from './PaymentMethodsManagement';
import ManualBalanceCredit from './ManualBalanceCredit';
import CategoryRequestManagement from './CategoryRequestManagement';
import BannerManagement from './BannerManagement';

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState<'products' | 'deposits' | 'withdrawals' | 'access' | 'category-requests' | 'payment-methods' | 'manual-credit' | 'banners'>('products');

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
            onClick={() => setActiveTab('category-requests')}
            className={`flex items-center justify-center sm:justify-start space-x-2 px-4 sm:px-6 py-3 rounded-lg transition-all ${
              activeTab === 'category-requests'
                ? 'bg-gradient-to-r from-[#f5b04c] to-[#2a5f64] text-white shadow-md'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <ShoppingBag className="w-5 h-5" />
            <span className="font-medium">Category Requests</span>
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
          <button
            onClick={() => setActiveTab('manual-credit')}
            className={`flex items-center justify-center sm:justify-start space-x-2 px-4 sm:px-6 py-3 rounded-lg transition-all ${
              activeTab === 'manual-credit'
                ? 'bg-gradient-to-r from-[#f5b04c] to-[#2a5f64] text-white shadow-md'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <DollarSign className="w-5 h-5" />
            <span className="font-medium">Manual Credit</span>
          </button>
          <button
            onClick={() => setActiveTab('banners')}
            className={`flex items-center justify-center sm:justify-start space-x-2 px-4 sm:px-6 py-3 rounded-lg transition-all ${
              activeTab === 'banners'
                ? 'bg-gradient-to-r from-[#f5b04c] to-[#2a5f64] text-white shadow-md'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Image className="w-5 h-5" />
            <span className="font-medium">Banners</span>
          </button>
        </div>

        {activeTab === 'products' && <ProductManagement />}
        {activeTab === 'deposits' && <DepositManagement />}
        {activeTab === 'withdrawals' && <WithdrawalManagement />}
        {activeTab === 'access' && <CategoryAccessManagement />}
        {activeTab === 'category-requests' && <CategoryRequestManagement />}
        {activeTab === 'payment-methods' && <PaymentMethodsManagement />}
        {activeTab === 'manual-credit' && <ManualBalanceCredit />}
        {activeTab === 'banners' && <BannerManagement />}
      </div>
    </div>
  );
}
