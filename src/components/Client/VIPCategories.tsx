import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { ShoppingBag, Lock, Crown } from 'lucide-react';
import VIPProductModal from './VIPProductModal';

interface CategoryAccess {
  id: string;
  category_id: string;
  granted_at: string;
}

interface VIPPurchase {
  id: string;
  vip_level: number;
  category_id: string;
  status: string;
}

interface VIPLevel {
  id: string;
  level: number;
  name: string;
  commission: number;
  categories: string[];
  is_active: boolean;
}

export default function VIPCategories() {
  const [categoryAccess, setCategoryAccess] = useState<CategoryAccess[]>([]);
  const [vipPurchases, setVipPurchases] = useState<VIPPurchase[]>([]);
  const [vipLevels, setVipLevels] = useState<VIPLevel[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<{
    vipLevel: number;
    categoryId: string;
    commission: number;
  } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [accessResult, purchasesResult, levelsResult] = await Promise.all([
        supabase
          .from('category_access')
          .select('*')
          .order('granted_at', { ascending: false }),
        supabase
          .from('vip_purchases')
          .select('*')
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
      setVipLevels(levelsResult.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }

  function hasAccess(categoryId: string): boolean {
    return categoryAccess.some(access => access.category_id === categoryId);
  }

  function getVIPLevelForCategory(categoryId: string): VIPLevel | undefined {
    return vipLevels.find(level => level.categories.includes(categoryId));
  }

  function openProductModal(categoryId: string) {
    const vipLevel = getVIPLevelForCategory(categoryId);
    if (vipLevel) {
      setSelectedCategory({
        vipLevel: vipLevel.level,
        categoryId,
        commission: vipLevel.commission
      });
    }
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
        <h3 className="text-xl font-bold text-gray-900 mb-2">VIP категории не доступны</h3>
        <p className="text-gray-600 mb-4">
          Приобретите доступ к VIP категориям чтобы начать зарабатывать комиссию!
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-center gap-3">
            <Crown className="w-8 h-8" />
            <div>
              <h2 className="text-2xl font-bold">Мои VIP Категории</h2>
              <p className="text-blue-100">Просматривайте товары и зарабатывайте комиссию</p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {uniqueCategories.map((categoryId) => {
            const vipLevel = getVIPLevelForCategory(categoryId);
            const approved = vipPurchases.find(p => p.category_id === categoryId && p.status === 'approved');
            const hasAccessToCategory = hasAccess(categoryId);

            if (!vipLevel || !approved) return null;

            return (
              <div
                key={categoryId}
                className="bg-white rounded-lg shadow-md overflow-hidden border-2 border-blue-200 hover:border-blue-400 transition-colors"
              >
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-4 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-bold capitalize">{categoryId}</h3>
                    <Crown className="w-6 h-6" />
                  </div>
                  <div className="text-sm text-blue-100">
                    {vipLevel.name} - Комиссия: ${vipLevel.commission.toFixed(2)}
                  </div>
                </div>

                <div className="p-4">
                  {hasAccessToCategory ? (
                    <button
                      onClick={() => openProductModal(categoryId)}
                      className="w-full py-3 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white rounded-lg font-semibold flex items-center justify-center gap-2 transition-all"
                    >
                      <ShoppingBag className="w-5 h-5" />
                      Просмотреть товары
                    </button>
                  ) : (
                    <div className="text-center py-3">
                      <Lock className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm text-gray-500">Ожидайте одобрения доступа</p>
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
          commission={selectedCategory.commission}
          onClose={() => setSelectedCategory(null)}
        />
      )}
    </>
  );
}
