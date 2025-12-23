import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Lock, CheckCircle, Package, Play, RefreshCw } from 'lucide-react';
import TaskProductsModal from './TaskProductsModal';

interface VIPLevel {
  id: string;
  level: number;
  name: string;
  price: number;
  commission: number;
  commission_percentage: number;
  description: string;
  category: string;
  category_image_url: string;
  is_active: boolean;
}

interface VIPPurchase {
  id: string;
  vip_level: number;
  category_id: string;
  status: string;
  created_at: string;
  vip_level_data?: VIPLevel;
}

interface Product {
  id: string;
  name: string;
  price: number;
  commission_percentage: number;
  image_url: string;
  description: string;
  category: string;
}

interface ActiveTasksProps {
  onNavigateToDeposit?: () => void;
}

export default function ActiveTasks({ onNavigateToDeposit }: ActiveTasksProps = {}) {
  const [activePurchases, setActivePurchases] = useState<VIPPurchase[]>([]);
  const [completedPurchases, setCompletedPurchases] = useState<VIPPurchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<VIPLevel | null>(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');
  const [comboEnabled, setComboEnabled] = useState(false);
  const [vipCompletions, setVipCompletions] = useState(0);

  useEffect(() => {
    loadPurchases();

    // Subscribe to VIP levels changes
    const channel = supabase
      .channel('vip_levels_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'vip_levels'
        },
        () => {
          console.log('VIP levels updated, reloading tasks...');
          loadPurchases();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function loadPurchases() {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Load user profile to get combo settings
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('combo_enabled, vip_completions_count')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;
      if (profileData) {
        setComboEnabled(profileData.combo_enabled || false);
        setVipCompletions(profileData.vip_completions_count || 0);
      }

      const { data: activeData, error: activeError } = await supabase
        .from('vip_purchases')
        .select(`
          id,
          vip_level,
          category_id,
          status,
          created_at,
          is_completed,
          completed_products_count
        `)
        .eq('user_id', user.id)
        .eq('status', 'approved')
        .eq('is_completed', false)
        .order('created_at', { ascending: false });

      if (activeError) throw activeError;

      const { data: completedData, error: completedError } = await supabase
        .from('vip_purchases')
        .select(`
          id,
          vip_level,
          category_id,
          status,
          created_at,
          is_completed,
          completed_products_count
        `)
        .eq('user_id', user.id)
        .eq('is_completed', true)
        .order('created_at', { ascending: false });

      if (completedError) throw completedError;

      const activeWithLevels = await Promise.all(
        (activeData || []).map(async (purchase) => {
          const { data: levelData } = await supabase
            .from('vip_levels')
            .select('*')
            .eq('category', purchase.category_id)
            .eq('level', purchase.vip_level)
            .maybeSingle();

          return {
            ...purchase,
            vip_level_data: levelData
          };
        })
      );

      const completedWithLevels = await Promise.all(
        (completedData || []).map(async (purchase) => {
          const { data: levelData } = await supabase
            .from('vip_levels')
            .select('*')
            .eq('category', purchase.category_id)
            .eq('level', purchase.vip_level)
            .maybeSingle();

          return {
            ...purchase,
            vip_level_data: levelData
          };
        })
      );

      console.log('Loaded active tasks with VIP levels:', activeWithLevels);
      setActivePurchases(activeWithLevels);
      setCompletedPurchases(completedWithLevels);
    } catch (error) {
      console.error('Error loading purchases:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  async function refreshData() {
    setRefreshing(true);
    await loadPurchases();
  }

  const handleStartEarning = (vipLevel: VIPLevel) => {
    setSelectedCategory(vipLevel);
    setShowTaskModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f5b04c]"></div>
      </div>
    );
  }

  const purchases = activeTab === 'active' ? activePurchases : completedPurchases;

  return (
    <>
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
            My Tasks
          </h2>
          <button
            onClick={refreshData}
            disabled={refreshing}
            className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
            title="Refresh tasks"
          >
            <RefreshCw className={`w-5 h-5 text-gray-600 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('active')}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
              activeTab === 'active'
                ? 'bg-gradient-to-r from-[#f5b04c] to-[#2a5f64] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Play className="w-5 h-5" />
              <span>Active ({activePurchases.length})</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
              activeTab === 'completed'
                ? 'bg-gradient-to-r from-[#f5b04c] to-[#2a5f64] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span>Completed ({completedPurchases.length})</span>
            </div>
          </button>
        </div>

        {purchases.length === 0 ? (
          <div className="text-center py-12">
            <Lock className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              {activeTab === 'active' ? 'No Active Tasks' : 'No Completed Tasks'}
            </h3>
            <p className="text-gray-600">
              {activeTab === 'active'
                ? 'Purchase VIP access to categories to start completing tasks'
                : 'Completed tasks will appear here'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {purchases.map((purchase) => {
            const vipLevel = purchase.vip_level_data;
            if (!vipLevel) return null;

            return (
              <div
                key={purchase.id}
                className="bg-gradient-to-br from-white to-gray-50 rounded-lg shadow-md hover:shadow-xl transition-all border-2 border-transparent hover:border-[#f5b04c] overflow-hidden"
              >
                <div className="relative h-40 overflow-hidden">
                  <img
                    src={vipLevel.category_image_url || 'https://images.pexels.com/photos/1194713/pexels-photo-1194713.jpeg'}
                    alt={vipLevel.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-2 left-2 right-2">
                    <div className="flex items-center justify-between">
                      <span className="bg-[#f5b04c] text-white px-2 py-1 rounded text-xs font-bold">
                        VIP {vipLevel.level}
                      </span>
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    </div>
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-1">
                    {vipLevel.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {vipLevel.description}
                  </p>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2 text-green-600">
                      <Package className="w-4 h-4" />
                      <span className="text-sm font-semibold">
                        {vipLevel.commission_percentage}% total commission
                      </span>
                    </div>
                  </div>
                  <div className="pt-3 border-t">
                    {activeTab === 'active' ? (
                      <button
                        onClick={() => handleStartEarning(vipLevel)}
                        className="w-full bg-gradient-to-r from-[#f5b04c] to-[#2a5f64] text-white py-3 rounded-lg font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                      >
                        <Play className="w-5 h-5" />
                        Start Earning
                      </button>
                    ) : (
                      <div className="bg-blue-50 rounded-lg p-3 text-center border border-blue-200">
                        <div className="flex items-center justify-center gap-2 text-blue-700 mb-1">
                          <CheckCircle className="w-5 h-5" />
                          <span className="font-bold">Completed</span>
                        </div>
                        <p className="text-xs text-blue-600">
                          {new Date(purchase.created_at).toLocaleDateString('en-US')}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          </div>
        )}
      </div>

      {showTaskModal && selectedCategory && (
        <TaskProductsModal
          category={selectedCategory}
          comboEnabled={comboEnabled}
          vipCompletions={vipCompletions}
          onClose={() => {
            setShowTaskModal(false);
            setSelectedCategory(null);
            loadPurchases();
          }}
          onNavigateToDeposit={onNavigateToDeposit}
        />
      )}
    </>
  );
}
