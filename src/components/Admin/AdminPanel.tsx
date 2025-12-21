import { useState, useEffect, useMemo } from 'react';
import { Package, TrendingUp, TrendingDown, CreditCard, DollarSign, Image, Crown, Settings, Menu, X, Tag } from 'lucide-react';
import ProductManagement from './ProductManagement';
import DepositManagement from './DepositManagement';
import WithdrawalManagement from './WithdrawalManagement';
import PaymentMethodsManagement from './PaymentMethodsManagement';
import ManualBalanceCredit from './ManualBalanceCredit';
import BannerManagement from './BannerManagement';
import VIPPurchaseManagement from './VIPPurchaseManagement';
import VIPLevelManagement from './VIPLevelManagement';
import CategoryManagement from './CategoryManagement';

type TabType = 'products' | 'categories' | 'deposits' | 'withdrawals' | 'payment-methods' | 'manual-credit' | 'banners' | 'vip-purchases' | 'vip-levels';

interface NavItem {
  id: TabType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  group: string;
}

const navItems: NavItem[] = [
  { id: 'products', label: 'Products', icon: Package, group: 'Inventory' },
  { id: 'categories', label: 'Categories', icon: Tag, group: 'Inventory' },
  { id: 'banners', label: 'Banners', icon: Image, group: 'Content' },
  { id: 'deposits', label: 'Deposits', icon: TrendingUp, group: 'Finance' },
  { id: 'withdrawals', label: 'Withdrawals', icon: TrendingDown, group: 'Finance' },
  { id: 'manual-credit', label: 'Manual Credit', icon: DollarSign, group: 'Finance' },
  { id: 'payment-methods', label: 'Payment Methods', icon: CreditCard, group: 'Settings' },
  { id: 'vip-levels', label: 'VIP Levels', icon: Settings, group: 'VIP System' },
  { id: 'vip-purchases', label: 'VIP Purchases', icon: Crown, group: 'VIP System' },
];

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState<TabType>(() => {
    const saved = localStorage.getItem('adminActiveTab');
    return (saved as TabType) || 'products';
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('adminActiveTab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    const titles: Record<TabType, string> = {
      'products': 'ML MALL - Admin - Products',
      'categories': 'ML MALL - Admin - Categories',
      'deposits': 'ML MALL - Admin - Deposits',
      'withdrawals': 'ML MALL - Admin - Withdrawals',
      'payment-methods': 'ML MALL - Admin - Payment Methods',
      'manual-credit': 'ML MALL - Admin - Manual Credit',
      'banners': 'ML MALL - Admin - Banners',
      'vip-purchases': 'ML MALL - Admin - VIP Purchases',
      'vip-levels': 'ML MALL - Admin - VIP Levels'
    };
    document.title = titles[activeTab];
  }, [activeTab]);

  const groupedNavItems = navItems.reduce((acc, item) => {
    if (!acc[item.group]) {
      acc[item.group] = [];
    }
    acc[item.group].push(item);
    return acc;
  }, {} as Record<string, NavItem[]>);

  const currentNav = navItems.find(item => item.id === activeTab);

  const renderedTabs = useMemo(() => ({
    products: <ProductManagement />,
    categories: <CategoryManagement />,
    deposits: <DepositManagement />,
    withdrawals: <WithdrawalManagement />,
    'payment-methods': <PaymentMethodsManagement />,
    'manual-credit': <ManualBalanceCredit />,
    banners: <BannerManagement />,
    'vip-purchases': <VIPPurchaseManagement />,
    'vip-levels': <VIPLevelManagement />
  }), []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg hover:bg-gray-50 transition-colors"
      >
        {sidebarOpen ? <X className="w-6 h-6 text-gray-700" /> : <Menu className="w-6 h-6 text-gray-700" />}
      </button>

      <div className={`fixed inset-y-0 left-0 z-40 w-72 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-full flex flex-col">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-[#f5b04c] to-[#2a5f64] bg-clip-text text-transparent">
              Admin Panel
            </h1>
            <p className="text-sm text-gray-500 mt-1">Manage your store</p>
          </div>

          <nav className="flex-1 overflow-y-auto p-4 space-y-6">
            {Object.entries(groupedNavItems).map(([group, items]) => (
              <div key={group}>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-3">
                  {group}
                </h3>
                <div className="space-y-1">
                  {items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveTab(item.id);
                          setSidebarOpen(false);
                        }}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                          isActive
                            ? 'bg-gradient-to-r from-[#f5b04c] to-[#2a5f64] text-white shadow-md'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <Icon className="w-5 h-5 flex-shrink-0" />
                        <span className="font-medium text-left">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>
      </div>

      <div className="lg:pl-72">
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-2">
              {currentNav && <currentNav.icon className="w-8 h-8 text-[#2a5f64]" />}
              <h2 className="text-3xl font-bold text-gray-900">{currentNav?.label}</h2>
            </div>
            <p className="text-gray-500">{currentNav?.group}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6">
              {Object.entries(renderedTabs).map(([tabKey, component]) => (
                <div
                  key={tabKey}
                  style={{ display: activeTab === tabKey ? 'block' : 'none' }}
                >
                  {component}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
