import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { ShoppingBag, Lock, Crown, RefreshCw } from 'lucide-react';
import VIPProductModal from './VIPProductModal';

interface CategoryAccess {
  id: string;
  category: string;
  is_enabled: boolean;
  created_at: string;
}

interface VIPPurchase {
  id: string;
  vip_level: number;
  category_id: string;
  status: string;
  products_completed: number;
  is_completed: boolean;
}

interface VIPLevel {
  id: string;
  level: number;
  name: string;
  commission: number;
  category: string;
  category_image_url: string;
  products_count: number;
  is_active: boolean;
}

export default function VIPCategories() {
  const [categoryAccess, setCategoryAccess] = useState<CategoryAccess[]>([]);
  const [vipPurchases, setVipPurchases] = useState<VIPPurchase[]>([]);
  const [vipLevels, setVipLevels] = useState<VIPLevel[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<{
    vipLevel: number;
    categoryId: string;
  } | null>(null);
  const [showLoading, setShowLoading] = useState(false);

  useEffect(() => {
    loadData();

    // Subscribe to VIP levels changes
    const channel = supabase
      .channel('vip_categories_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'vip_levels'
        },
        () => {
          console.log('VIP levels updated, reloading categories...');
          loadData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const [accessResult, purchasesResult, levelsResult] = await Promise.all([
        supabase
          .from('category_access')
          .select('*')
          .eq('is_enabled', true)
          .order('created_at', { ascending: false }),
        supabase
          .from('vip_purchases')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'approved'),
        supabase
          .from('vip_levels')
          .select('*')
          .eq('is_active', true)
          .order('level')
      ]);

      if (accessResult.error) throw accessResult.error;
      if (purchasesResult.error) throw purchasesResult.error;
      if (levelsResult.error) throw levelsResult.error;

      setCategoryAccess(accessResult.data || []);
      setVipPurchases(purchasesResult.data || []);
      const levels = (levelsResult.data || []).map(level => ({
        ...level,
        commission: Number(level.commission)
      }));
      console.log('Loaded VIP categories:', levels);
      setVipLevels(levels);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  async function refreshData() {
    setRefreshing(true);
    await loadData();
  }

  function hasAccess(categoryId: string): boolean {
    return categoryAccess.some(access => access.category === categoryId && access.is_enabled);
  }

  function getVIPLevelForCategory(categoryId: string): VIPLevel | undefined {
    return vipLevels.find(level => level.category === categoryId);
  }

  function openProductModal(categoryId: string) {
    const vipLevel = getVIPLevelForCategory(categoryId);
    const activePurchase = vipPurchases.find(
      p => p.category_id === categoryId &&
           p.status === 'approved' &&
           !p.is_completed
    );

    if (vipLevel && activePurchase) {
      setSelectedCategory({
        vipLevel: vipLevel.level,
        categoryId
      });
    }
  }

  async function handleProductComplete() {
    setSelectedCategory(null);
    setShowLoading(true);
    await loadData();
    setShowLoading(false);
  }

  async function handleNextProduct(categoryId: string) {
    setSelectedCategory(null);
    setShowLoading(true);
    await loadData();
    setTimeout(() => {
      setShowLoading(false);
      openProductModal(categoryId);
    }, 1500);
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const approvedCategories = vipPurchases.map(p => p.category_id);
  const uniqueCategories = Array.from(new Set(approvedCategories));

  if (uniqueCategories.length === 0) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-8 text-center border-2 border-dashed border-blue-300">
        <Lock className="w-16 h-16 mx-auto mb-4 text-blue-400" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">VIP Categories Not Available</h3>
        <p className="text-gray-600 mb-4">
          Purchase VIP category access to start earning commission!
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Crown className="w-8 h-8" />
              <div>
                <h2 className="text-2xl font-bold">My VIP Categories</h2>
                <p className="text-blue-100">Browse products and earn commission</p>
              </div>
            </div>
            <button
              onClick={refreshData}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors disabled:opacity-50"
              title="Refresh categories"
            >
              <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {uniqueCategories.map((categoryId) => {
            const vipLevel = getVIPLevelForCategory(categoryId);
            const approved = vipPurchases.find(p => p.category_id === categoryId && p.status === 'approved' && !p.is_completed);
            const allPurchases = vipPurchases.filter(p => p.category_id === categoryId && p.status === 'approved');
            const hasAccessToCategory = hasAccess(categoryId);

            if (!vipLevel || allPurchases.length === 0) return null;

            const currentPurchase = approved || allPurchases[0];

            return (
              <div
                key={categoryId}
                className="bg-white rounded-lg shadow-md overflow-hidden border-2 border-blue-200 hover:border-blue-400 transition-colors"
              >
                {vipLevel.category_image_url && (
                  <div className="relative h-32 overflow-hidden">
                    <img
                      src={vipLevel.category_image_url}
                      alt={categoryId}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold capitalize">{categoryId}</h3>
                        <Crown className="w-6 h-6" />
                      </div>
                    </div>
                  </div>
                )}

                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 font-medium">{vipLevel.name}</span>
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold">
                      {vipLevel.commission.toFixed(0)}%
                    </span>
                  </div>

                  <div className="bg-gray-100 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-600">Progress</span>
                      <span className="text-xs font-semibold text-gray-700">
                        {currentPurchase.products_completed || 0}/{vipLevel.products_count}
                      </span>
                    </div>
                    <div className="w-full bg-gray-300 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all"
                        style={{
                          width: `${((currentPurchase.products_completed || 0) / vipLevel.products_count) * 100}%`
                        }}
                      ></div>
                    </div>
                  </div>

                  {!approved ? (
                    <div className="text-center py-3 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm font-semibold text-blue-700">All products completed!</p>
                      <p className="text-xs text-blue-600 mt-1">Purchase VIP {vipLevel.level} again to continue earning</p>
                    </div>
                  ) : hasAccessToCategory ? (
                    <button
                      onClick={() => openProductModal(categoryId)}
                      className="w-full py-3 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white rounded-lg font-semibold flex items-center justify-center gap-2 transition-all"
                    >
                      <ShoppingBag className="w-5 h-5" />
                      Start
                    </button>
                  ) : (
                    <div className="text-center py-3">
                      <Lock className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm text-gray-500">Awaiting access approval</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selectedCategory && (
        <VIPProductModal
          vipLevel={selectedCategory.vipLevel}
          categoryId={selectedCategory.categoryId}
          onClose={() => setSelectedCategory(null)}
          onProductPurchased={handleNextProduct}
          onAllComplete={handleProductComplete}
        />
      )}

      {showLoading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
            <p className="text-lg font-semibold text-gray-700">Loading next product...</p>
          </div>
        </div>
      )}
    </>
  );
}
