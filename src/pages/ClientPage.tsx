import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Profile } from '../lib/supabase';
import Dashboard from '../components/Client/Dashboard';
import OrderHistory from '../components/Client/OrderHistory';
import TransactionHistory from '../components/Client/TransactionHistory';
import ProfileView from '../components/Client/ProfileView';
import Cart from '../components/Cart';
import { CartItem } from '../types';
import { LogOut, UserIcon, Home, TrendingUp, Package, FileText } from 'lucide-react';

interface ClientPageProps {
  profile: Profile;
  onLogout: () => void;
  onBalanceUpdate: () => void;
}

export default function ClientPage({ profile, onLogout, onBalanceUpdate }: ClientPageProps) {
  const navigate = useNavigate();
  const [view, setView] = useState<'home' | 'deposit' | 'orders' | 'record' | 'profile'>('home');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    const titles: Record<typeof view, string> = {
      'home': 'ML MALL - Shop',
      'deposit': 'ML MALL - Deposit',
      'orders': 'ML MALL - Orders',
      'record': 'ML MALL - Transactions',
      'profile': 'ML MALL - Profile'
    };
    document.title = titles[view];
  }, [view]);

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity === 0) {
      setCartItems((prev) => prev.filter((item) => item.id !== productId));
    } else {
      setCartItems((prev) =>
        prev.map((item) => (item.id === productId ? { ...item, quantity } : item))
      );
    }
  };

  const removeItem = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== productId));
  };

  const handleCheckout = async () => {
    setCartItems([]);
    alert('Order placed successfully!');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <img src="/logo55555.svg" alt="ML MALL" className="h-16 w-auto" />
            <div className="flex items-center space-x-2">
              {profile.is_admin && (
                <button
                  onClick={() => navigate('/admin')}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-[#f5b04c] text-white hover:bg-[#e09f3a] transition-colors"
                >
                  <UserIcon className="w-5 h-5" />
                  <span className="hidden sm:inline text-sm">Admin</span>
                </button>
              )}
              <button
                onClick={onLogout}
                className="flex items-center space-x-2 text-gray-700 hover:text-red-600 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span className="hidden sm:inline text-sm">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {view === 'home' && (
          <Dashboard
            profile={profile}
            onBalanceUpdate={onBalanceUpdate}
            initialTab="overview"
          />
        )}

        {view === 'deposit' && (
          <Dashboard
            profile={profile}
            onBalanceUpdate={onBalanceUpdate}
            initialTab="deposit"
          />
        )}

        {view === 'orders' && (
          <OrderHistory
            userId={profile.id}
            onNavigateToDeposit={() => setView('deposit')}
          />
        )}

        {view === 'record' && <TransactionHistory userId={profile.id} />}

        {view === 'profile' && <ProfileView profile={profile} />}
      </main>

      <Cart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeItem}
        profile={profile}
        onCheckout={handleCheckout}
      />

      {view !== 'deposit' && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
          <div className="flex items-center justify-around py-2">
            <button
              onClick={() => setView('home')}
              className={`flex flex-col items-center justify-center px-3 py-2 rounded-lg transition-all ${
                view === 'home' ? 'text-[#f5b04c]' : 'text-gray-600'
              }`}
            >
              <Home className="w-6 h-6 mb-1" />
              <span className="text-xs font-medium">Home</span>
            </button>

            <button
              onClick={() => setView('deposit')}
              className={`flex flex-col items-center justify-center px-3 py-2 rounded-lg transition-all ${
                view === 'deposit' ? 'text-[#f5b04c]' : 'text-gray-600'
              }`}
            >
              <TrendingUp className="w-6 h-6 mb-1" />
              <span className="text-xs font-medium">Deposit</span>
            </button>

            <button
              onClick={() => setView('orders')}
              className={`flex flex-col items-center justify-center px-3 py-2 rounded-lg transition-all ${
                view === 'orders' ? 'text-[#f5b04c]' : 'text-gray-600'
              }`}
            >
              <Package className="w-6 h-6 mb-1" />
              <span className="text-xs font-medium">Orders</span>
            </button>

            <button
              onClick={() => setView('record')}
              className={`flex flex-col items-center justify-center px-3 py-2 rounded-lg transition-all ${
                view === 'record' ? 'text-[#f5b04c]' : 'text-gray-600'
              }`}
            >
              <FileText className="w-6 h-6 mb-1" />
              <span className="text-xs font-medium">Record</span>
            </button>

            <button
              onClick={() => setView('profile')}
              className={`flex flex-col items-center justify-center px-3 py-2 rounded-lg transition-all ${
                view === 'profile' ? 'text-[#f5b04c]' : 'text-gray-600'
              }`}
            >
              <UserIcon className="w-6 h-6 mb-1" />
              <span className="text-xs font-medium">Profile</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
