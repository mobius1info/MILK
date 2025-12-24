import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { X, ShoppingBag, Star, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import NotificationModal from '../NotificationModal';

interface Product {
  id: string;
  name: string;
  price: number;
  image_url: string;
  category: string;
  commission_percentage: number;
  quantity_multiplier: number;
}

interface VIPProductModalProps {
  vipLevel: number;
  categoryId: string;
  onClose: () => void;
  onProductPurchased: (categoryId: string) => void;
  onAllComplete: () => void;
}

interface ProductProgress {
  current_product_index: number;
  products_purchased: number;
  total_commission_earned: number;
  total_products_count: number;
}

export default function VIPProductModal({ vipLevel, categoryId, onClose, onProductPurchased, onAllComplete }: VIPProductModalProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [progress, setProgress] = useState<ProductProgress>({
    current_product_index: 0,
    products_purchased: 0,
    total_commission_earned: 0,
    total_products_count: 0
  });
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [message, setMessage] = useState('');
  const [notification, setNotification] = useState<{
    isOpen: boolean;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
  }>({
    isOpen: false,
    type: 'info',
    title: '',
    message: ''
  });

  useEffect(() => {
    loadProductsAndProgress();
  }, [categoryId, vipLevel]);

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
          .eq('category_id', categoryId)
          .eq('vip_level', vipLevel)
          .eq('status', 'approved')
          .eq('is_completed', false)
          .maybeSingle(),
        supabase
          .from('vip_levels')
          .select('products_count')
          .eq('level', vipLevel)
          .eq('category', categoryId)
          .maybeSingle()
      ]);

      const vipPurchase = vipPurchaseResult.data;
      const vipLevelData = vipLevelResult.data;
      const totalProductsCount = vipLevelData?.products_count || 25;

      if (!vipPurchase) {
        // No active purchase - find the last completed one
        const { data: lastCompletedPurchase } = await supabase
          .from('vip_purchases')
          .select('id')
          .eq('user_id', user.id)
          .eq('category_id', categoryId)
          .eq('vip_level', vipLevel)
          .eq('status', 'approved')
          .eq('is_completed', true)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        let totalCommission = 0;

        if (lastCompletedPurchase) {
          const { data: purchasedProducts } = await supabase
            .from('product_purchases')
            .select('commission_earned')
            .eq('vip_purchase_id', lastCompletedPurchase.id);

          (purchasedProducts || []).forEach(pp => {
            totalCommission += Number((pp as any).commission_earned || 0);
          });
        }

        console.log('All products completed:', {
          totalCommission,
          totalProductsCount,
          lastCompletedPurchaseId: lastCompletedPurchase?.id
        });

        setProgress({
          current_product_index: totalProductsCount,
          products_purchased: totalProductsCount,
          total_commission_earned: totalCommission,
          total_products_count: totalProductsCount
        });

        setProduct(null);
        setLoading(false);
        return;
      }

      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('category', categoryId)
        .order('name')
        .limit(totalProductsCount);

      if (productsError) throw productsError;

      const normalizedProducts = (productsData || []).map(p => ({
        ...p,
        price: Number(p.price),
        commission_percentage: Number(p.commission_percentage),
        quantity_multiplier: Number(p.quantity_multiplier)
      }));

      setAllProducts(normalizedProducts);

      const { data: purchasedProducts, error: purchasedError } = await supabase
        .from('product_purchases')
        .select('product_id, quantity_count, commission_earned')
        .eq('vip_purchase_id', vipPurchase.id)
        .order('created_at');

      if (purchasedError) throw purchasedError;

      let totalQuantityPurchased = 0;
      const purchasedProductIds = new Set();
      let totalCommission = 0;

      (purchasedProducts || []).forEach(pp => {
        totalQuantityPurchased += pp.quantity_count || 1;
        purchasedProductIds.add(pp.product_id);
        totalCommission += Number((pp as any).commission_earned || 0);
      });

      console.log('VIPProductModal progress:', {
        totalQuantityPurchased,
        totalCommission,
        vipPurchaseId: vipPurchase.id
      });

      setProgress({
        current_product_index: purchasedProductIds.size,
        products_purchased: totalQuantityPurchased,
        total_commission_earned: totalCommission,
        total_products_count: totalProductsCount
      });

      if (totalQuantityPurchased >= totalProductsCount) {
        setProduct(null);
      } else {
        const nextProductIndex = purchasedProductIds.size;
        if (normalizedProducts && normalizedProducts[nextProductIndex]) {
          setProduct(normalizedProducts[nextProductIndex]);
        } else if (normalizedProducts && normalizedProducts.length > 0) {
          setProduct(normalizedProducts[0]);
        }
      }
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  }

  async function purchaseProduct() {
    if (!product) return;

    try {
      setPurchasing(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get the active VIP purchase ID
      const { data: vipPurchaseData } = await supabase
        .from('vip_purchases')
        .select('id')
        .eq('user_id', user.id)
        .eq('category_id', categoryId)
        .eq('vip_level', vipLevel)
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
        setNotification({
          isOpen: true,
          type: 'error',
          title: 'Error',
          message: result.error || 'Purchase error'
        });
        return;
      }

      const newTotalCommission = progress.total_commission_earned + result.commission;
      const isComplete = result.is_completed;

      onClose();

      setTimeout(() => {
        if (!isComplete) {
          onProductPurchased(categoryId);
        } else {
          onAllComplete();
        }
      }, 200);
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

  const baseCommission = product ? (product.price * product.commission_percentage / 100) : 0;
  const potentialCommission = baseCommission;
  const totalAmount = product ? product.price : 0;

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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={() => {
          onClose();
          onAllComplete();
        }}
      >
        <div
          className="bg-white rounded-lg p-8 max-w-md"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">
              All Products Completed!
            </h3>
            <p className="text-gray-600 mb-2">
              VIP {vipLevel} - <span className="capitalize font-semibold">{categoryId}</span>
            </p>
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 mb-4 border border-green-200">
              <p className="text-sm text-gray-600 mb-1">Total Earned</p>
              <p className="text-3xl font-bold text-green-600">
                ${progress.total_commission_earned.toFixed(2)}
              </p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 mb-6 border border-blue-200">
              <p className="text-sm text-blue-700 font-medium">
                To continue earning commission in this category, purchase VIP {vipLevel} again in the "VIP Purchase" section
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              onClose();
              onAllComplete();
            }}
            className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-bold hover:opacity-90 transition-opacity"
          >
            Got It
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg max-w-2xl w-full my-4 sm:my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 sm:p-6 border-b flex items-start sm:items-center justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg sm:text-2xl font-bold truncate">
              VIP {vipLevel} - <span className="capitalize">{categoryId}</span>
            </h2>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-2 text-xs sm:text-sm text-gray-600">
              <span className="whitespace-nowrap">Product {progress.current_product_index + 1} of {progress.total_products_count}</span>
              <span className="whitespace-nowrap">Earned: ${progress.total_commission_earned.toFixed(2)}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">

          <div className="bg-gray-100 rounded-lg overflow-hidden">
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-48 sm:h-64 object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400';
              }}
            />
          </div>

          <div>
            <div className="flex items-center gap-3 mb-4">
              <h3 className="text-xl sm:text-2xl font-bold">{product.name}</h3>
              {product.quantity_multiplier > 1 && (
                <span className="px-3 py-1 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full text-sm font-bold shadow-lg animate-pulse">
                  x{product.quantity_multiplier}
                </span>
              )}
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 space-y-4 border-2 border-blue-200">
              <div className="flex items-center justify-between pb-3 border-b border-blue-200">
                <span className="text-gray-700 font-medium">Product Price:</span>
                <span className="text-2xl font-bold text-blue-600">${product.price.toFixed(2)}</span>
              </div>

              <div className="flex items-center justify-between pb-3 border-b border-blue-200">
                <span className="text-gray-700 font-medium">Your Commission:</span>
                <span className="text-2xl font-bold text-green-600">{product.commission_percentage.toFixed(2)}%</span>
              </div>

              <div className="flex items-center justify-between pb-3 border-b border-blue-200">
                <span className="text-gray-700 font-medium">Commission Amount:</span>
                <span className="text-2xl font-bold text-green-600">+${potentialCommission.toFixed(2)}</span>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-lg font-bold text-gray-900">Total:</span>
                <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  ${totalAmount.toFixed(2)}
                </span>
              </div>

              {product.quantity_multiplier > 1 && (
                <div className="bg-orange-100 rounded-lg p-3 mt-3">
                  <p className="text-sm text-orange-800 font-semibold text-center">
                    This product counts as {product.quantity_multiplier} purchases
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-3 sm:p-4 border border-blue-200">
            <div className="flex items-start gap-2 sm:gap-3">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-blue-900 mb-2 text-sm sm:text-base">How it Works</div>
                <ul className="text-xs sm:text-sm text-blue-800 space-y-1 sm:space-y-1.5">
                  <li>• Product price: ${product.price.toFixed(2)}</li>
                  <li>• Your commission equals: ${potentialCommission.toFixed(2)}</li>
                  <li>• Commission will be automatically credited to your balance</li>
                  <li>• Each product has its own commission percentage</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-3 sm:p-4 border border-yellow-200">
            <div className="flex items-start gap-2 sm:gap-3">
              <Star className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-orange-900 mb-1 text-sm sm:text-base">Earn More Commission!</div>
                <p className="text-xs sm:text-sm text-orange-800">
                  Deposit funds to unlock more tasks with increased commission,
                  or upgrade to a different VIP level to get different commission percentages.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={purchaseProduct}
            disabled={purchasing}
            className="w-full py-4 sm:py-5 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white rounded-xl font-bold text-lg sm:text-xl flex items-center justify-center gap-2 sm:gap-3 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
          >
            <ShoppingBag className="w-6 h-6 sm:w-7 sm:h-7" />
            {purchasing ? 'Submitting order...' : 'SUBMIT ORDER'}
          </button>
        </div>
      </div>

      <NotificationModal
        isOpen={notification.isOpen}
        onClose={() => setNotification({ ...notification, isOpen: false })}
        type={notification.type}
        title={notification.title}
        message={notification.message}
      />
    </div>
  );
}
