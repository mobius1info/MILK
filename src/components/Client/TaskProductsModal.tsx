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

  useEffect(() => {
    loadProductsAndProgress();
  }, [category.category, category.level]);

  async function loadProductsAndProgress() {
    try {
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

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

      if (!vipPurchase) {
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

      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('category', category.category)
        .order('name')
        .limit(totalProductsCount);

      if (productsError) throw productsError;

      const normalizedProducts = (productsData || []).map(p => ({
        ...p,
        price: Number(p.price),
        commission_percentage: Number(p.commission_percentage),
        quantity_multiplier: Number(p.quantity_multiplier || 1)
      }));

      setAllProducts(normalizedProducts);

      const { data: purchasedProducts, error: purchasedError } = await supabase
        .from('product_purchases')
        .select('product_id, quantity_count, commission_earned')
        .eq('vip_purchase_id', vipPurchase.id);

      if (purchasedError) throw purchasedError;

      const purchasedMap = new Map(
        (purchasedProducts || []).map(p => [p.product_id, {
          count: p.quantity_count,
          commission: Number(p.commission_earned)
        }])
      );

      let currentIndex = 0;
      let totalPurchased = 0;
      let totalCommission = 0;

      for (let i = 0; i < normalizedProducts.length; i++) {
        const prod = normalizedProducts[i];
        const purchased = purchasedMap.get(prod.id);

        if (!purchased || purchased.count === 0) {
          currentIndex = i;
          break;
        }

        totalPurchased++;
        totalCommission += purchased.commission;

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
    } catch (error) {
      console.error('Error loading products:', error);
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: 'Failed to load products'
      });
    } finally {
      setLoading(false);
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
        p_product_id: product.id,
        p_vip_purchase_id: vipPurchaseData.id
      });

      if (error) throw error;

      const result = data as any;

      if (result.error) {
        if (result.requires_deposit) {
          setInsufficientBalance({
            productPrice: result.product_price,
            commission: result.commission,
            neededAmount: result.needed_amount,
            currentBalance: result.current_balance
          });
          setMessage(result.error);
        } else {
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
        setDynamicPrice(result.product_price);
        setDynamicCommission(result.commission);
        setMessage(result.message);

        // If all products completed, show total commission earned
        if (result.is_completed) {
          // Calculate total commission from current progress + this commission
          const totalCommission = progress.total_commission_earned + result.commission;

          console.log('Completion Summary:', {
            previousEarnings: progress.total_commission_earned,
            thisCommission: result.commission,
            totalCommission,
            productsPurchased: result.products_purchased,
            totalProducts: result.total_products
          });

          setNotification({
            isOpen: true,
            type: 'success',
            title: 'Success!',
            message: `All products in this category completed!\n\nTotal profit earned: $${totalCommission.toFixed(2)}`
          });
        } else {
          setNotification({
            isOpen: true,
            type: 'success',
            title: result.is_ninth_product ? 'COMBO product purchased!' : 'Success!',
            message: result.message
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

  const displayPrice = dynamicPrice !== null
    ? dynamicPrice
    : isNextCombo
      ? comboPrice
      : product?.price || 0;

  // New commission logic: based on VIP price and percentage, not product price
  const baseCommission = (vipPrice * (category.commission_percentage || 15) / 100);
  const potentialCommission = dynamicCommission !== null
    ? dynamicCommission
    : isNextCombo
      ? baseCommission * activeComboMultiplier
      : baseCommission;

  if (loading) {
    return (
      <div
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
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
        onClick={onClose}
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
      className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4 overflow-hidden pb-16 sm:pb-0"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-t-2xl sm:rounded-xl w-full sm:max-w-2xl lg:max-w-3xl sm:max-h-[90vh] flex flex-col overflow-hidden"
        style={{ maxHeight: 'calc(100dvh - 64px)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex-shrink-0 bg-gradient-to-r from-[#f5b04c] to-[#2a5f64] p-3.5 sm:p-5 text-white">
          <div className="flex items-start justify-between gap-2 sm:gap-3">
            <div className="flex-1 min-w-0">
              <h2 className="text-xl sm:text-2xl font-bold mb-1.5 truncate">
                {category.name}
              </h2>
              <div className="flex flex-wrap items-center gap-x-2.5 sm:gap-x-3 gap-y-1 text-sm text-white/90">
                <span className="flex items-center gap-1.5">
                  <ShoppingBag className="w-4 h-4" />
                  <span className="hidden sm:inline">Product</span> {nextProductNumber}/{progress.total_products_count}
                  {isNextCombo && (
                    <span className="ml-1 px-1.5 py-0.5 bg-yellow-500 text-yellow-900 rounded-full text-xs font-bold animate-pulse">
                      COMBO
                    </span>
                  )}
                </span>
                <span className="flex items-center gap-1.5">
                  <Coins className="w-4 h-4" />
                  ${progress.total_commission_earned.toFixed(2)}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="flex-shrink-0 p-1 sm:p-1.5 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto p-3 sm:p-6 space-y-2.5 sm:space-y-4 max-h-[50vh] sm:flex-1">
          {message && (
            <div className={`rounded-lg p-2.5 sm:p-3 flex items-start gap-2 ${
              message.includes('deposit')
                ? 'bg-red-50 text-red-800 border border-red-200'
                : 'bg-green-50 text-green-800 border border-green-200'
            }`}>
              {message.includes('deposit') ? (
                <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5" />
              ) : (
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5" />
              )}
              <div className="font-medium text-xs sm:text-sm">{message}</div>
            </div>
          )}

          <div className="bg-gray-100 rounded-lg overflow-hidden shadow-md">
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-40 sm:h-72 object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.pexels.com/photos/1194713/pexels-photo-1194713.jpeg';
              }}
            />
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-2.5 sm:p-4 shadow-sm">
            <div className="flex items-start justify-between mb-2 sm:mb-3">
              <h3 className="text-base sm:text-xl font-bold text-gray-900 line-clamp-2 flex-1">{product.name}</h3>
              {isNextCombo && (
                <span className="ml-2 px-2 py-0.5 sm:px-3 sm:py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full text-xs font-bold shadow-lg flex-shrink-0">
                  COMBO
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2 sm:gap-4">
              <div className={`rounded-lg p-2.5 sm:p-3 ${isNextCombo ? 'bg-orange-50 border-2 border-orange-300' : 'bg-blue-50'}`}>
                <div className="text-xs text-gray-600 mb-1">
                  {isNextCombo ? 'COMBO Price' : 'Price'}
                </div>
                <div className={`text-lg sm:text-2xl font-bold ${isNextCombo ? 'text-orange-600' : 'text-blue-600'}`}>
                  ${displayPrice.toFixed(2)}
                </div>
              </div>
              <div className={`rounded-lg p-2.5 sm:p-3 ${isNextCombo ? 'bg-yellow-50 border-2 border-yellow-300' : 'bg-green-50'}`}>
                <div className="text-xs text-gray-600 mb-1">
                  Profit
                </div>
                <div className={`text-lg sm:text-2xl font-bold ${isNextCombo ? 'text-yellow-600' : 'text-green-600'}`}>
                  ${potentialCommission.toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-2.5 sm:p-3.5 border border-blue-200 shadow-sm">
            <div className="flex items-start gap-2 sm:gap-2.5">
              <TrendingUp className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="font-semibold text-blue-900 mb-1.5 text-sm">How it Works</div>
                <ul className="text-xs text-blue-800 space-y-1 leading-relaxed">
                  <li>• Click the purchase button to receive commission</li>
                  <li>• Commission is automatically credited to your balance</li>
                  <li>• Browse products in order until completion</li>
                </ul>
              </div>
            </div>
          </div>

          {isNextCombo && (
            <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-2 sm:p-3.5 border border-orange-300 shadow-sm">
              <div className="flex items-start gap-1.5 sm:gap-2">
                <Star className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="font-semibold text-orange-900 mb-0.5 text-xs sm:text-sm">COMBO - {activeComboMultiplier}x Commission!</div>
                  <p className="text-xs text-orange-800 leading-snug sm:leading-relaxed">
                    Balance ${displayPrice.toFixed(2)} required. Earn ${potentialCommission.toFixed(2)}!
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex-shrink-0 p-3 sm:p-5 bg-gray-50 border-t space-y-2.5 sm:space-y-3">
          {insufficientBalance ? (
            <>
              <div className="bg-red-50 border-2 border-red-300 rounded-lg p-2 sm:p-4 text-center">
                <AlertCircle className="w-6 h-6 sm:w-12 sm:h-12 mx-auto text-red-600 mb-1 sm:mb-2" />
                <h4 className="font-bold text-red-900 mb-0.5 sm:mb-1 text-xs sm:text-base">Insufficient Funds</h4>
                <p className="text-xs sm:text-sm text-red-700 mb-1.5 sm:mb-3">
                  Need <span className="font-bold">${insufficientBalance.neededAmount.toFixed(2)}</span>
                </p>
                <div className="grid grid-cols-2 gap-1.5 sm:gap-2 text-xs">
                  <div className="bg-white rounded p-1 sm:p-2">
                    <div className="text-gray-600 text-xs">Balance</div>
                    <div className="font-bold text-gray-900 text-sm">${insufficientBalance.currentBalance.toFixed(2)}</div>
                  </div>
                  <div className="bg-white rounded p-1 sm:p-2">
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
                  className="w-full py-3.5 sm:py-4 bg-gradient-to-r from-green-500 to-green-600 hover:opacity-90 text-white rounded-lg font-bold text-base sm:text-lg flex items-center justify-center gap-2 transition-all shadow-lg"
                >
                  <Coins className="w-5 h-5 flex-shrink-0" />
                  <span>Deposit Funds</span>
                </button>
              )}
            </>
          ) : (
            <button
              onClick={purchaseProduct}
              disabled={purchasing}
              className={`w-full py-3.5 sm:py-4 hover:opacity-90 text-white rounded-lg font-bold text-base sm:text-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg ${
                isNextCombo
                  ? 'bg-gradient-to-r from-yellow-500 to-orange-600 animate-pulse'
                  : 'bg-gradient-to-r from-[#f5b04c] to-[#2a5f64]'
              }`}
            >
              {purchasing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-5 h-5 flex-shrink-0" />
                  <span className="hidden sm:inline">
                    {isNextCombo ? `COMBO: Buy for $${displayPrice.toFixed(2)} and get $${potentialCommission.toFixed(2)}` : `Buy and get $${potentialCommission.toFixed(2)}`}
                  </span>
                  <span className="sm:hidden truncate">
                    {isNextCombo ? `COMBO $${displayPrice.toFixed(2)} → +$${potentialCommission.toFixed(2)}` : `Buy & Get +$${potentialCommission.toFixed(2)}`}
                  </span>
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
              await loadProductsAndProgress();
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
