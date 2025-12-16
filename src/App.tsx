import { useState, useEffect } from 'react';
import { supabase, Profile, Product as DBProduct } from './lib/supabase';
import LoadingScreen from './components/LoadingScreen';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminPanel from './components/Admin/AdminPanel';
import Dashboard from './components/Client/Dashboard';
import CategoryFilter from './components/CategoryFilter';
import { categories } from './data/products';
import { CartItem, Product } from './types';
import { LogOut, User as UserIcon, Wallet, ShoppingBag } from 'lucide-react';
import ProductCard from './components/ProductCard';
import Cart from './components/Cart';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [view, setView] = useState<'shop' | 'dashboard'>('shop');
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isFetchingProfile, setIsFetchingProfile] = useState(false);

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
    if (user) {
      fetchProducts();
    }
  }, [user]);

  useEffect(() => {
    if (currentPath === '/admin' && profile && profile.role !== 'admin') {
      alert('Access denied. Admin privileges required.');
      navigateTo('/');
    }

    if (!user && currentPath !== '/login' && currentPath !== '/register' && currentPath !== '/admin') {
      navigateTo('/login');
    }
  }, [currentPath, profile, user]);

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
    setView('shop');
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

  const filteredProducts = products.filter((product) => {
    const matchesCategory = !selectedCategory || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

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

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!user || !profile) {
    const isAdminPath = currentPath === '/admin';

    if (currentPath === '/register') {
      return (
        <Register
          onSuccess={checkUser}
          onNavigate={navigateTo}
          isAuthenticated={!!user}
        />
      );
    }

    return (
      <div>
        {isAdminPath && (
          <div className="mb-4 p-4 bg-gradient-to-r from-[#f5b04c] to-[#2a5f64] text-white text-center">
            <h2 className="text-xl font-bold">Admin Access</h2>
            <p className="text-sm">Please login with admin credentials</p>
          </div>
        )}
        <Login
          onSuccess={checkUser}
          onNavigate={navigateTo}
          isAuthenticated={!!user}
        />
      </div>
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
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-[#f5b04c] to-[#2a5f64] bg-clip-text text-transparent">
              MK MALL
            </h1>
            <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-4">
              <button
                onClick={() => setView('shop')}
                className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 md:px-4 py-2 rounded-lg transition-colors ${
                  view === 'shop'
                    ? 'bg-gradient-to-r from-[#f5b04c] to-[#2a5f64] text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <ShoppingBag className="w-4 sm:w-5 h-4 sm:h-5" />
                <span className="hidden sm:inline text-sm md:text-base">Shop</span>
              </button>
              <button
                onClick={() => setView('dashboard')}
                className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 md:px-4 py-2 rounded-lg transition-colors ${
                  view === 'dashboard'
                    ? 'bg-gradient-to-r from-[#f5b04c] to-[#2a5f64] text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Wallet className="w-4 sm:w-5 h-4 sm:h-5" />
                <span className="hidden sm:inline text-sm md:text-base">Dashboard</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 sm:space-x-2 text-gray-700 hover:text-red-600 transition-colors"
              >
                <LogOut className="w-4 sm:w-5 h-4 sm:h-5" />
                <span className="hidden md:inline text-sm">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {view === 'dashboard' ? (
        <Dashboard profile={profile} onBalanceUpdate={() => fetchProfile(user.id)} />
      ) : (
        <>
          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />

          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  {selectedCategory
                    ? categories.find((c) => c.id === selectedCategory)?.name
                    : 'All Products'}
                </h2>
                <p className="text-gray-600 mt-1">
                  {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} found
                </p>
              </div>
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-3 bg-gradient-to-r from-[#f5b04c] to-[#2a5f64] text-white rounded-full hover:shadow-lg transition-all"
              >
                <ShoppingBag className="w-6 h-6" />
                {cartItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                    {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                )}
              </button>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-gray-500 text-lg">No products found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} onAddToCart={addToCart} />
                ))}
              </div>
            )}
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

          <footer className="bg-white border-t mt-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="text-center text-gray-600">
                <p className="text-lg font-semibold bg-gradient-to-r from-[#f5b04c] to-[#2a5f64] bg-clip-text text-transparent mb-2">
                  MK MALL
                </p>
                <p className="text-sm">Your trusted online shopping destination</p>
              </div>
            </div>
          </footer>
        </>
      )}
    </div>
  );
}

export default App;
