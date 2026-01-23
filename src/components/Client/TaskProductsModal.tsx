import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { X, ShoppingBag, CheckCircle, Coins, Star, TrendingUp, AlertCircle } from 'lucide-react';
import NotificationModal from '../NotificationModal';

interface Product {
  id: string;
  name: string;
  price: number;
  image_url: string;
  category: string;
  commission_percentage: number;
  description: string;
}

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
}

interface TaskProductsModalProps {
  category: VIPLevel;
  comboEnabled: boolean;
  vipCompletions: number;
  onClose: () => void;
  onNavigateToDeposit?: () => void;
}

interface ComboSettings {
  enabled: boolean;
  position: number;
  multiplier: number;
  depositPercent: number;
}

interface VIPComboSetting {
  id: string;
  combo_position: number;
  combo_multiplier: number;
  combo_deposit_percent: number;
  is_completed: boolean;
}

interface ProductProgress {
  current_product_index: number;
  products_purchased: number;
  total_commission_earned: number;
  total_products_count: number;
}

export default function TaskProductsModal({ category, comboEnabled, vipCompletions, onClose, onNavigateToDeposit }: TaskProductsModalProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [progress, setProgress] = useState<ProductProgress>({
    current_product_index: 0,
    products_purchased: 0,
    total_commission_earned: 0,
    total_products_count: 25
  });
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [message, setMessage] = useState('');
  const [insufficientBalance, setInsufficientBalance] = useState<{
    productPrice: number;
    commission: number;
    neededAmount: number;
    currentBalance: number;
  } | null>(null);
  const [dynamicPrice, setDynamicPrice] = useState<number | null>(null);
  const [dynamicCommission, setDynamicCommission] = useState<number | null>(null);
  const [vipPrice, setVipPrice] = useState<number>(100);
  const [comboSettings, setComboSettings] = useState<ComboSettings>({
    enabled: false,
    position: 9,
    multiplier: 3,
    depositPercent: 50
  });
  const [vipComboSettings, setVipComboSettings] = useState<VIPComboSetting[]>([]);
  const [notification, setNotification] = useState({
    isOpen: false,
    type: 'success' as 'success' | 'error' | 'warning' | 'info',
    title: '',
    message: ''
  });
  const [loadedKey, setLoadedKey] = useState<string>('');
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    const key = `${category.category}-${category.level}`;
    if (loadedKey !== key) {
      loadProductsAndProgress(true);
    }
  }, [category.category, category.level, loadedKey]);

  async function loadProductsAndProgress(showLoading: boolean = false) {
    try {
      const key = `${category.category}-${category.level}`;
      if (showLoading || isInitialLoad) {
        setLoading(true);
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      console.log('TaskProductsModal - Loading data for:', {
        categoryName: category.category,
        categoryLevel: category.level,
        userId: user.id
      });

      const [vipPurchaseResult, vipLevelResult] = await Promise.all([
        supabase
          .from('vip_purchases')
          .select('*')
          .eq('user_id', user.id)
          .eq('category_id', category.category)
          .eq('vip_level', category.level)
          .eq('status', 'approved')
          .eq('is_completed', false)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from('vip_levels')
          .select('products_count')
          .eq('level', category.level)
          .eq('category', category.category)
          .maybeSingle()
      ]);

      const vipPurchase = vipPurchaseResult.data;
      const vipLevelData = vipLevelResult.data;

      console.log('VIP Purchase query result:', {
        found: !!vipPurchase,
        purchaseId: vipPurchase?.id,
        status: vipPurchase?.status,
        isCompleted: vipPurchase?.is_completed,
        error: vipPurchaseResult.error,
        query: {
          user_id: user.id,
          category_id: category.category,
          vip_level: category.level,
          status: 'approved',
          is_completed: false
        }
      });

      if (!vipPurchase) {
        console.error('❌ No active VIP purchase found!', {
          categoryName: category.category,
          level: category.level,
          userId: user.id
        });

        // Debug: Show ALL vip_purchases for this user
        const { data: allPurchases } = await supabase
          .from('vip_purchases')
          .select('id, category_id, vip_level, status, is_completed, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        console.error('All VIP purchases for this user:', allPurchases);

        // Also show what we're looking for
        console.error('Looking for:', {
          category_id: category.category,
          vip_level: category.level,
          status: 'approved',
          is_completed: false
        });

        // VIP purchase not found or already completed - show completion screen
        const totalProductsCount = vipLevelData?.products_count || 25;
        setProgress({
          current_product_index: totalProductsCount,
          products_purchased: totalProductsCount,
          total_commission_earned: 0,
          total_products_count: totalProductsCount
        });
        setProduct(null);
        setLoading(false);
        return;
      }

      const totalProductsCount = vipLevelData?.products_count || 25;
      const purchaseVipPrice = vipPurchase.vip_price || category.price || 100;
      setVipPrice(purchaseVipPrice);

      // Load combo settings from vip_combo_settings table
      const { data: comboSettingsData, error: comboError } = await supabase
        .from('vip_combo_settings')
        .select('*')
        .eq('vip_purchase_id', vipPurchase.id)
        .order('combo_position', { ascending: true });

      if (comboError) {
        console.error('Error loading combo settings:', comboError);
      } else {
        setVipComboSettings(comboSettingsData || []);
        console.log('Loaded combo settings:', comboSettingsData);
      }

      // Load combo settings from VIP purchase snapshot (legacy fallback)
      setComboSettings({
        enabled: vipPurchase.combo_enabled_at_approval ?? false,
        position: Number(vipPurchase.combo_position_at_approval ?? 9),
        multiplier: Number(vipPurchase.combo_multiplier_at_approval ?? 3),
        depositPercent: Number(vipPurchase.combo_deposit_percent_at_approval ?? 50)
      });

      // Get category UUID from category name
      const { data: categoryData } = await supabase
        .from('categories')
        .select('id')
        .eq('name', category.category)
        .maybeSingle();

      if (!categoryData) {
        throw new Error(`Category ${category.category} not found`);
      }

      console.log('Loading products for category:', {
        categoryName: category.category,
        categoryId: categoryData.id,
        totalProductsCount
      });

      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('category_id', categoryData.id)
        .eq('is_active', true)
        .order('name')
        .limit(totalProductsCount);

      if (productsError) throw productsError;

      console.log('Products loaded:', {
        count: productsData?.length || 0,
        firstProduct: productsData?.[0]?.name
      });

      const normalizedProducts = (productsData || []).map(p => ({
        ...p,
        price: Number(p.price),
        commission_percentage: Number(p.commission_percentage),
        quantity_multiplier: Number(p.quantity_multiplier || 1)
      }));

      if (normalizedProducts.length === 0) {
        throw new Error(`No products found for category ${category.category}`);
      }

      setAllProducts(normalizedProducts);

      const { data: purchasedProducts, error: purchasedError } = await supabase
        .from('product_purchases')
        .select('product_id, quantity, commission_earned')
        .eq('vip_purchase_id', vipPurchase.id);

      if (purchasedError) throw purchasedError;

      const purchasedMap = new Map(
        (purchasedProducts || []).map(p => [p.product_id, {
          count: p.quantity,
          commission: Number(p.commission_earned)
        }])
      );

      // Calculate total commission from ALL purchases (not just current products list)
      let totalCommission = 0;
      let uniqueProductsPurchased = 0;

      for (const purchase of (purchasedProducts || [])) {
        totalCommission += Number(purchase.commission_earned);
        if (purchase.quantity > 0) {
          uniqueProductsPurchased++;
        }
      }

      let currentIndex = 0;
      let totalPurchased = 0;

      for (let i = 0; i < normalizedProducts.length; i++) {
        const prod = normalizedProducts[i];
        const purchased = purchasedMap.get(prod.id);

        if (!purchased || purchased.count === 0) {
          currentIndex = i;
          break;
        }

        totalPurchased++;

        if (i === normalizedProducts.length - 1) {
          currentIndex = normalizedProducts.length;
        }
      }

      console.log('Progress calculated:', {
        totalPurchased,
        totalCommission,
        totalProductsCount,
        currentIndex,
        normalizedProductsLength: normalizedProducts.length,
        vipPurchaseId: vipPurchase.id
      });

      setProgress({
        current_product_index: currentIndex,
        products_purchased: totalPurchased,
        total_commission_earned: totalCommission,
        total_products_count: totalProductsCount
      });

      if (totalPurchased >= totalProductsCount && totalPurchased > 0) {
        setProduct(null);
      } else if (normalizedProducts && normalizedProducts[currentIndex]) {
        setProduct(normalizedProducts[currentIndex]);
      } else {
        console.error('No product found at index:', currentIndex);
      }

      setLoadedKey(key);
      setIsInitialLoad(false);
    } catch (error) {
      console.error('Error loading products:', error);
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: 'Failed to load products'
      });
    } finally {
      if (showLoading || isInitialLoad) {
        setLoading(false);
      }
    }
  }

  async function purchaseProduct() {
    if (!product) return;

    try {
      setPurchasing(true);
      setMessage('');
      setInsufficientBalance(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get the active VIP purchase ID
      const { data: vipPurchaseData } = await supabase
        .from('vip_purchases')
        .select('id')
        .eq('user_id', user.id)
        .eq('category_id', category.category)
        .eq('vip_level', category.level)
        .eq('status', 'approved')
        .eq('is_completed', false)
        .maybeSingle();

      if (!vipPurchaseData) {
        setNotification({
          isOpen: true,
          type: 'error',
          title: 'Error',
          message: 'No active VIP purchase found'
        });
        return;
      }

      const { data, error } = await supabase.rpc('process_product_purchase', {
        p_user_id: user.id,
        p_vip_purchase_id: vipPurchaseData.id,
        p_product_id: product.id
      });

      if (error) throw error;

      const result = data as any;

      console.log('Product purchase result:', result);

      if (!result.success || result.error) {
        // Check if this is an insufficient balance error for combo
        if ((result.error === 'Insufficient balance' || result.error?.includes('Insufficient balance'))
            && result.required !== undefined) {
          console.log('Showing insufficient balance UI:', {
            required: result.required,
            current: result.current,
            needed: result.required - result.current
          });
          setInsufficientBalance({
            productPrice: result.required,
            commission: 0,
            neededAmount: result.required - result.current,
            currentBalance: result.current
          });
          setMessage(result.error || 'Insufficient balance for combo product');
        } else {
          console.log('Showing error notification:', result.error);
          setNotification({
            isOpen: true,
            type: 'error',
            title: 'Error',
            message: result.error || 'Purchase error'
          });
        }
        return;
      }

      if (result.success) {
        const totalEarnings = (result.commission || 0) + (result.combo_deposit || 0);

        if (result.product_price != null) {
          setDynamicPrice(result.product_price);
        }
        if (totalEarnings > 0) {
          setDynamicCommission(totalEarnings);
        }

        // Check if all products completed
        const isCompleted = result.progress?.completed >= result.progress?.total;

        if (isCompleted) {
          // Calculate total commission from current progress + this commission
          const totalCommission = progress.total_commission_earned + totalEarnings;

          console.log('Completion Summary:', {
            previousEarnings: progress.total_commission_earned,
            thisCommission: result.commission,
            comboBonus: result.combo_deposit,
            totalEarnings,
            totalCommission,
            productsPurchased: result.progress.completed,
            totalProducts: result.progress.total
          });

          setNotification({
            isOpen: true,
            type: 'success',
            title: `Total Profit: $${totalCommission.toFixed(2)}`,
            message: `All products in this category completed!`
          });
        } else {
          const successMessage = result.is_combo_position
            ? `Commission $${result.commission.toFixed(2)} + Combo Bonus $${result.combo_deposit.toFixed(2)} = $${totalEarnings.toFixed(2)}!`
            : `Profit credited to your balance`;

          setNotification({
            isOpen: true,
            type: 'success',
            title: `You earned $${totalEarnings.toFixed(2)}!`,
            message: successMessage
          });
        }
      }
    } catch (error: any) {
      console.error('Error purchasing product:', error);
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: 'Purchase error: ' + error.message
      });
    } finally {
      setPurchasing(false);
    }
  }

  const nextProductNumber = progress.products_purchased + 1;

  // Check if next product is a combo from vip_combo_settings table
  const nextComboSetting = vipComboSettings.find(
    combo => combo.combo_position === nextProductNumber && !combo.is_completed
  );
  const isNextCombo = !!nextComboSetting;

  // Get combo settings from vip_combo_settings or fallback to legacy settings
  const activeComboMultiplier = nextComboSetting?.combo_multiplier ?? comboSettings.multiplier;
  const activeComboDepositPercent = nextComboSetting?.combo_deposit_percent ?? comboSettings.depositPercent;

  // COMBO price = VIP price * (Deposit % / 100)
  const comboPrice = vipPrice * (activeComboDepositPercent / 100);

  console.log('TaskProductsModal - Combo Check:', {
    nextProductNumber,
    isNextCombo,
    nextComboSetting,
    vipComboSettings,
    activeComboDepositPercent,
    comboPrice,
    vipPrice
  });

  const displayPrice = dynamicPrice != null
    ? dynamicPrice
    : isNextCombo
      ? comboPrice
      : product?.price || 0;

  // Commission per product = (VIP Price × VIP Commission %) ÷ Products Count
  const totalProductsCount = progress.total_products_count || 25;
  const baseCommission = (vipPrice * (category.commission_percentage || 15) / 100) / totalProductsCount;
  const potentialCommission = dynamicCommission != null
    ? dynamicCommission
    : isNextCombo
      ? baseCommission * activeComboMultiplier
      : baseCommission;

  if (loading) {
    return (
      <div
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
        onTouchStart={(e) => {
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
      >
        <div
          className="bg-white rounded-lg p-8"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f5b04c] mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
        onTouchStart={(e) => {
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
      >
        <div
          className="bg-white rounded-lg p-8 max-w-md"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="text-center">
            <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
            <h3 className="text-2xl font-bold text-gray-800 mb-3">
              Work Completed!
            </h3>
            <p className="text-gray-600 mb-2">
              You have completed all {progress.total_products_count} products in category <strong>{category.name}</strong>
            </p>
            <p className="text-lg font-semibold text-green-600 mb-6">
              Total Earned: ${progress.total_commission_earned.toFixed(2)}
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Purchase VIP {category.level} again to continue earning in this category
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-full px-4 py-3 bg-gradient-to-r from-[#f5b04c] to-[#2a5f64] text-white rounded-lg font-bold hover:opacity-90"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4 overflow-y-auto"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      onTouchStart={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="bg-white rounded-t-2xl sm:rounded-xl w-full sm:max-w-md sm:max-h-[85vh] flex flex-col overflow-hidden mb-28 sm:mb-0"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
      >
        <div className="flex-shrink-0 bg-gradient-to-r from-[#f5b04c] to-[#2a5f64] p-3 text-white">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold mb-1 truncate">
                {category.name}
              </h2>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-white/90">
                <span className="flex items-center gap-1">
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Product</span> {nextProductNumber}/{progress.total_products_count}
                  {isNextCombo && (
                    <span className="ml-1 px-1.5 py-0.5 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-full text-xs font-bold animate-pulse shadow-lg">
                      COMBO
                    </span>
                  )}
                </span>
                <span className="flex items-center gap-1">
                  <Coins className="w-3.5 h-3.5" />
                  ${progress.total_commission_earned.toFixed(2)}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="flex-shrink-0 p-1 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto p-3 space-y-2 sm:flex-1">
          {message && (
            <div className={`rounded-lg p-2 flex items-start gap-2 ${
              message.includes('deposit')
                ? 'bg-red-50 text-red-800 border border-red-200'
                : 'bg-green-50 text-green-800 border border-green-200'
            }`}>
              {message.includes('deposit') ? (
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              ) : (
                <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              )}
              <div className="font-medium text-xs">{message}</div>
            </div>
          )}

          <div className="bg-gray-100 rounded-lg overflow-hidden shadow-md">
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-36 sm:h-44 object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.pexels.com/photos/1194713/pexels-photo-1194713.jpeg';
              }}
            />
          </div>

          <div className={`border rounded-lg p-2.5 shadow-sm ${
            isNextCombo
              ? 'bg-gradient-to-br from-red-50 to-pink-50 border-red-300'
              : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-sm font-bold text-gray-900 line-clamp-2 flex-1">{product.name}</h3>
              {isNextCombo && (
                <span className="px-2 py-0.5 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-full text-xs font-bold shadow-lg animate-pulse">
                  COMBO
                </span>
              )}
            </div>
            {isNextCombo ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">Base Commission:</span>
                  <span className="font-bold text-gray-600">${baseCommission.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">COMBO Bonus:</span>
                  <span className="font-bold text-red-600">{activeComboDepositPercent}%</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">COMBO Earnings:</span>
                  <span className="font-bold text-green-600">+${comboPrice.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between pt-1.5 border-t border-red-200">
                  <span className="font-bold text-gray-900">Total Profit:</span>
                  <span className="text-xl font-bold text-green-600 animate-pulse">
                    ${potentialCommission.toFixed(2)}
                  </span>
                </div>
                <div className="bg-gradient-to-r from-red-500 to-pink-500 rounded-lg p-2 mt-2">
                  <p className="text-white font-bold text-center text-xs">
                    🔥 HUGE EARNINGS! 🔥
                  </p>
                  <p className="text-white text-center text-xs mt-0.5">
                    Combo product with ${comboPrice.toFixed(2)} bonus!
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg p-2 bg-blue-50">
                  <div className="text-xs text-gray-600 mb-0.5">
                    Price
                  </div>
                  <div className="text-lg font-bold text-blue-600">
                    ${displayPrice.toFixed(2)}
                  </div>
                </div>
                <div className="rounded-lg p-2 bg-green-50">
                  <div className="text-xs text-gray-600 mb-0.5">
                    Profit
                  </div>
                  <div className="text-lg font-bold text-green-600">
                    ${potentialCommission.toFixed(2)}
                  </div>
                </div>
              </div>
            )}
          </div>

          {isNextCombo ? (
            <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-lg p-2 border border-red-300 shadow-sm">
              <div className="flex items-start gap-2">
                <Star className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="font-semibold text-red-900 mb-1 text-xs">COMBO Product!</div>
                  <ul className="text-xs text-red-800 space-y-0.5 leading-relaxed">
                    <li>• This is your COMBO product at position {nextProductNumber}!</li>
                    <li>• You earn extra ${comboPrice.toFixed(2)} bonus on this product</li>
                    <li>• Total profit: ${potentialCommission.toFixed(2)}</li>
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-2 border border-blue-200 shadow-sm">
              <div className="flex items-start gap-2">
                <TrendingUp className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="font-semibold text-blue-900 mb-1 text-xs">How it Works</div>
                  <ul className="text-xs text-blue-800 space-y-0.5 leading-relaxed">
                    <li>• Click the purchase button to receive commission</li>
                    <li>• Commission is automatically credited to your balance</li>
                    <li>• Browse products in order until completion</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex-shrink-0 p-3 bg-gray-50 border-t space-y-2">
          {insufficientBalance ? (
            <>
              <div className="bg-red-50 border-2 border-red-300 rounded-lg p-2 text-center">
                <AlertCircle className="w-8 h-8 mx-auto text-red-600 mb-1" />
                <h4 className="font-bold text-red-900 mb-0.5 text-sm">Insufficient Funds</h4>
                <p className="text-xs text-red-700 mb-1.5">
                  Need <span className="font-bold">${insufficientBalance.neededAmount.toFixed(2)}</span>
                </p>
                <div className="grid grid-cols-2 gap-1.5 text-xs">
                  <div className="bg-white rounded p-1.5">
                    <div className="text-gray-600 text-xs">Balance</div>
                    <div className="font-bold text-gray-900 text-sm">${insufficientBalance.currentBalance.toFixed(2)}</div>
                  </div>
                  <div className="bg-white rounded p-1.5">
                    <div className="text-gray-600 text-xs">Need</div>
                    <div className="font-bold text-orange-600 text-sm">${insufficientBalance.productPrice.toFixed(2)}</div>
                  </div>
                </div>
              </div>
              {onNavigateToDeposit && (
                <button
                  onClick={() => {
                    onClose();
                    onNavigateToDeposit();
                  }}
                  className="w-full py-3 bg-gradient-to-r from-green-500 to-green-600 hover:opacity-90 text-white rounded-lg font-bold text-base flex items-center justify-center gap-2 transition-all shadow-lg"
                >
                  <Coins className="w-4 h-4 flex-shrink-0" />
                  <span>Deposit Funds</span>
                </button>
              )}
            </>
          ) : (
            <button
              onClick={purchaseProduct}
              disabled={purchasing}
              className={`w-full py-3 hover:opacity-90 text-white rounded-lg font-bold text-base flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg ${
                isNextCombo
                  ? 'bg-gradient-to-r from-red-600 to-pink-600 animate-pulse'
                  : 'bg-gradient-to-r from-[#f5b04c] to-[#2a5f64]'
              }`}
            >
              {purchasing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4 flex-shrink-0" />
                  <span>{isNextCombo ? `BUY AND GET $${potentialCommission.toFixed(2)}!` : `Buy and get $${potentialCommission.toFixed(2)}`}</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      <NotificationModal
        isOpen={notification.isOpen}
        onClose={async () => {
          setNotification({ ...notification, isOpen: false });
          if (notification.type === 'success') {
            await new Promise(resolve => setTimeout(resolve, 300));

            // Check if all products are completed
            if (notification.message.includes('All products') && notification.message.includes('completed')) {
              // Close the modal completely when all products are done
              onClose();
            } else {
              // For regular purchases, reload progress and combo settings
              setDynamicPrice(null);
              setDynamicCommission(null);
              setMessage('');
              setInsufficientBalance(null);
              setLoadedKey(''); // Force reload
              await loadProductsAndProgress(false);
            }
          }
        }}
        type={notification.type}
        title={notification.title}
        message={notification.message}
      />
    </div>
  );
}
