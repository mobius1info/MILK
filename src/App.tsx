import { useState, useEffect } from 'react';
import { supabase, Profile, Product as DBProduct, CategoryAccess } from './lib/supabase';
import LoadingScreen from './components/LoadingScreen';
import LoginForm from './components/Auth/LoginForm';
import RegisterForm from './components/Auth/RegisterForm';
import AdminPanel from './components/Admin/AdminPanel';
import OrderHistory from './components/Client/OrderHistory';
import TransactionHistory from './components/Client/TransactionHistory';
import ProfileView from './components/Client/ProfileView';
import CategoryFilter from './components/CategoryFilter';
import BannerSection from './components/BannerSection';
import ActionButtons from './components/ActionButtons';
import SupabaseTest from './components/SupabaseTest';
import { categories } from './data/products';
import { CartItem, Product } from './types';
import { LogOut, User as UserIcon, Wallet, ShoppingBag, Home, TrendingUp, Package, FileText } from 'lucide-react';
import ProductCard from './components/ProductCard';
import Cart from './components/Cart';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [showLogin, setShowLogin] = useState(true);
  const [view, setView] = useState<'home' | 'deposit' | 'orders' | 'record' | 'profile'>('home');
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isFetchingProfile, setIsFetchingProfile] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [categoryAccess, setCategoryAccess] = useState<CategoryAccess[]>([]);

  useEffect(() => {
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        fetchProfile(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
        setIsLoading(false);
      }
    });

    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  useEffect(() => {
    if (user && profile) {
      fetchProducts();
      fetchCategoryAccess();
    }
  }, [user, profile]);

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        setUser(session.user);
        await fetchProfile(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
      }
    } catch (error) {
      console.error('Error checking user:', error);
      setUser(null);
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProfile = async (userId: string, retryCount = 0): Promise<void> => {
    if (isFetchingProfile) return;

    setIsFetchingProfile(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        if (retryCount < 3) {
          setIsFetchingProfile(false);
          await new Promise(resolve => setTimeout(resolve, 1000));
          return fetchProfile(userId, retryCount + 1);
        }
        await supabase.auth.signOut();
        setUser(null);
        setProfile(null);
        setIsLoading(false);
        setIsFetchingProfile(false);
        return;
      }

      if (data) {
        setProfile(data);
        setIsLoading(false);
        setIsFetchingProfile(false);
      } else {
        if (retryCount < 3) {
          console.log(`Profile not found, retry ${retryCount + 1}/3`);
          setIsFetchingProfile(false);
          await new Promise(resolve => setTimeout(resolve, 1000));
          return fetchProfile(userId, retryCount + 1);
        }
        console.error('Profile not found after retries');
        await supabase.auth.signOut();
        setUser(null);
        setProfile(null);
        setIsLoading(false);
        setIsFetchingProfile(false);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      if (retryCount < 3) {
        setIsFetchingProfile(false);
        await new Promise(resolve => setTimeout(resolve, 1000));
        return fetchProfile(userId, retryCount + 1);
      }
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
      setIsLoading(false);
      setIsFetchingProfile(false);
    }
  };

  const fetchCategoryAccess = async () => {
    if (!profile) return;

    try {
      const { data, error } = await supabase
        .from('category_access')
        .select('*')
        .eq('user_id', profile.id);

      if (error) throw error;
      setCategoryAccess(data || []);
    } catch (error) {
      console.error('Error fetching category access:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mappedProducts: Product[] = (data || []).map((p: DBProduct) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        image: p.image_url,
        category: p.category,
        description: p.description,
        rating: p.rating,
        reviews: p.reviews,
      }));

      setProducts(mappedProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const navigateTo = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setView('home');
    navigateTo('/');
  };

  const handleCheckout = async (address: string, paymentMethod: 'balance' | 'card' | 'cash') => {
    if (!profile) return;

    const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    if (paymentMethod === 'balance' && total > profile.balance) {
      throw new Error('Insufficient balance');
    }

    try {
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([
          {
            user_id: profile.id,
            total_amount: total,
            status: 'pending',
            payment_method: paymentMethod,
            shipping_address: address,
          },
        ])
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItems = cartItems.map((item) => ({
        order_id: order.id,
        product_id: item.id,
        quantity: item.quantity,
        price: item.price,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      if (paymentMethod === 'balance') {
        const { error: balanceError } = await supabase
          .from('profiles')
          .update({ balance: profile.balance - total })
          .eq('id', profile.id);

        if (balanceError) throw balanceError;

        await fetchProfile(profile.id);
      }

      setCartItems([]);
      alert('Order placed successfully!');
    } catch (error: any) {
      console.error('Error placing order:', error);
      throw error;
    }
  };

  const getAccessibleCategories = () => {
    if (profile?.role === 'admin') {
      return categories;
    }

    const accessibleCategoryIds = categoryAccess
      .filter((ca) => ca.is_enabled)
      .map((ca) => ca.category);

    return categories.filter((cat) => accessibleCategoryIds.includes(cat.id));
  };

  const filteredProducts = products.filter((product) => {
    if (profile?.role === 'admin') {
      const matchesCategory = !selectedCategory || product.category === selectedCategory;
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           product.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    }

    const access = categoryAccess.find((ca) => ca.category === product.category);
    if (!access || !access.is_enabled) {
      return false;
    }

    const matchesCategory = !selectedCategory || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const limitedProducts = (() => {
    if (profile?.role === 'admin') {
      return filteredProducts;
    }

    if (!selectedCategory) {
      const categoriesWithAccess = categoryAccess.filter(ca => ca.is_enabled);
      const productsWithLimit: Product[] = [];

      categoriesWithAccess.forEach(access => {
        const categoryProducts = filteredProducts.filter(p => p.category === access.category);
        const limited = access.product_limit > 0
          ? categoryProducts.slice(0, access.product_limit)
          : categoryProducts;
        productsWithLimit.push(...limited);
      });

      return productsWithLimit;
    }

    const access = categoryAccess.find((ca) => ca.category === selectedCategory);
    if (!access || access.product_limit === 0) {
      return filteredProducts;
    }

    return filteredProducts.slice(0, access.product_limit);
  })();

  const addToCart = (product: Product) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

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

  const handleDeposit = async () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    try {
      const { error } = await supabase.from('transactions').insert([
        {
          user_id: profile!.id,
          type: 'deposit',
          amount: parseFloat(depositAmount),
          status: 'pending',
        },
      ]);

      if (error) throw error;

      setShowDepositModal(false);
      setDepositAmount('');
      alert('Deposit request submitted successfully!');
      if (user) fetchProfile(user.id);
    } catch (error: any) {
      alert('Error: ' + error.message);
    }
  };

  const handleWithdrawal = async () => {
    if (!withdrawalAmount || parseFloat(withdrawalAmount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    if (parseFloat(withdrawalAmount) > profile!.balance) {
      alert('Insufficient balance');
      return;
    }

    try {
      const { error } = await supabase.from('transactions').insert([
        {
          user_id: profile!.id,
          type: 'withdrawal',
          amount: parseFloat(withdrawalAmount),
          status: 'pending',
        },
      ]);

      if (error) throw error;

      setShowWithdrawalModal(false);
      setWithdrawalAmount('');
      alert('Withdrawal request submitted successfully!');
      if (user) fetchProfile(user.id);
    } catch (error: any) {
      alert('Error: ' + error.message);
    }
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!user || !profile) {
    return (
      <>
        <SupabaseTest />
        {showLogin ? (
          <LoginForm
            onSuccess={checkUser}
            onToggleForm={() => setShowLogin(false)}
          />
        ) : (
          <RegisterForm
            onSuccess={checkUser}
            onToggleForm={() => setShowLogin(true)}
          />
        )}
      </>
    );
  }

  if (profile.role === 'admin' && currentPath === '/admin') {
    return (
      <div>
        <div className="bg-white shadow-sm border-b mb-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-2 sm:space-x-4">
                <h1
                  onClick={() => navigateTo('/')}
                  className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-[#f5b04c] to-[#2a5f64] bg-clip-text text-transparent cursor-pointer"
                >
                  MK MALL
                </h1>
                <span className="px-2 py-1 bg-[#f5b04c] text-white text-xs rounded-full">Admin</span>
              </div>
              <div className="flex items-center space-x-2 sm:space-x-4">
                <div className="hidden md:flex items-center space-x-2">
                  <UserIcon className="w-5 h-5" />
                  <span className="font-medium text-sm">{profile.email}</span>
                </div>
                <button
                  onClick={() => navigateTo('/')}
                  className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <ShoppingBag className="w-5 h-5" />
                  <span className="hidden sm:inline">Shop</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 sm:space-x-2 text-gray-700 hover:text-red-600 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
        <AdminPanel />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-[#f5b04c] to-[#2a5f64] bg-clip-text text-transparent">
              MK MALL
            </h1>
            <div className="flex items-center space-x-2">
              {profile.role === 'admin' && (
                <button
                  onClick={() => navigateTo('/admin')}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-[#f5b04c] text-white hover:bg-[#e09f3a] transition-colors"
                >
                  <UserIcon className="w-5 h-5" />
                  <span className="hidden sm:inline text-sm">Admin</span>
                </button>
              )}
              <button
                onClick={handleLogout}
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
          <>
            {profile?.role === 'client' && (
              <>
                <BannerSection />
                <ActionButtons
                  onDeposit={() => setShowDepositModal(true)}
                  onWithdrawal={() => setShowWithdrawalModal(true)}
                />
              </>
            )}

            <CategoryFilter
              categories={getAccessibleCategories()}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />

            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                  {selectedCategory
                    ? categories.find((c) => c.id === selectedCategory)?.name
                    : 'All Products'}
                </h2>
                <p className="text-sm sm:text-base text-gray-600 mt-1">
                  {limitedProducts.length} {limitedProducts.length === 1 ? 'product' : 'products'} found
                </p>
              </div>
              <button
                onClick={() => setIsCartOpen(true)}
                className="flex relative p-3 bg-gradient-to-r from-[#f5b04c] to-[#2a5f64] text-white rounded-full hover:shadow-lg transition-all"
              >
                <ShoppingBag className="w-6 h-6" />
                {cartItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                    {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                )}
              </button>
            </div>

            {limitedProducts.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-gray-500 text-lg">
                  {profile?.role === 'client' && categoryAccess.length === 0
                    ? 'No categories available. Please contact admin.'
                    : 'No products found'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {limitedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} onAddToCart={addToCart} />
                ))}
              </div>
            )}
          </>
        )}

        {view === 'orders' && <OrderHistory userId={profile.id} />}

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

      {/* Deposit Modal */}
      {showDepositModal && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setShowDepositModal(false)}
          ></div>
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
              <h3 className="text-2xl font-bold mb-4">Deposit Funds</h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f5b04c]"
                  placeholder="Enter amount"
                />
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleDeposit}
                  className="flex-1 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition-colors"
                >
                  Submit Request
                </button>
                <button
                  onClick={() => {
                    setShowDepositModal(false);
                    setDepositAmount('');
                  }}
                  className="flex-1 border border-gray-300 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Withdrawal Modal */}
      {showWithdrawalModal && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setShowWithdrawalModal(false)}
          ></div>
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
              <h3 className="text-2xl font-bold mb-4">Withdraw Funds</h3>
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Amount
                  </label>
                  <span className="text-sm text-gray-600">
                    Balance: ${profile?.balance.toFixed(2)}
                  </span>
                </div>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max={profile?.balance}
                  value={withdrawalAmount}
                  onChange={(e) => setWithdrawalAmount(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f5b04c]"
                  placeholder="Enter amount"
                />
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleWithdrawal}
                  className="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition-colors"
                >
                  Submit Request
                </button>
                <button
                  onClick={() => {
                    setShowWithdrawalModal(false);
                    setWithdrawalAmount('');
                  }}
                  className="flex-1 border border-gray-300 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
        <div className="flex items-center justify-around py-2">
          <button
            onClick={() => setView('home')}
            className={`flex flex-col items-center justify-center px-3 py-2 rounded-lg transition-all ${
              view === 'home'
                ? 'text-[#f5b04c]'
                : 'text-gray-600'
            }`}
          >
            <Home className="w-6 h-6 mb-1" />
            <span className="text-xs font-medium">Главная</span>
          </button>

          <button
            onClick={() => setShowDepositModal(true)}
            className="flex flex-col items-center justify-center px-3 py-2 rounded-lg transition-all text-gray-600"
          >
            <TrendingUp className="w-6 h-6 mb-1" />
            <span className="text-xs font-medium">Депозит</span>
          </button>

          <button
            onClick={() => setView('orders')}
            className={`flex flex-col items-center justify-center px-3 py-2 rounded-lg transition-all ${
              view === 'orders'
                ? 'text-[#f5b04c]'
                : 'text-gray-600'
            }`}
          >
            <Package className="w-6 h-6 mb-1" />
            <span className="text-xs font-medium">Заказы</span>
          </button>

          <button
            onClick={() => setView('record')}
            className={`flex flex-col items-center justify-center px-3 py-2 rounded-lg transition-all ${
              view === 'record'
                ? 'text-[#f5b04c]'
                : 'text-gray-600'
            }`}
          >
            <FileText className="w-6 h-6 mb-1" />
            <span className="text-xs font-medium">Запись</span>
          </button>

          <button
            onClick={() => setView('profile')}
            className={`flex flex-col items-center justify-center px-3 py-2 rounded-lg transition-all ${
              view === 'profile'
                ? 'text-[#f5b04c]'
                : 'text-gray-600'
            }`}
          >
            <UserIcon className="w-6 h-6 mb-1" />
            <span className="text-xs font-medium">Профиль</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
