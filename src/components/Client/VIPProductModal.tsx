import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { X, ShoppingBag, Star, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  image_url: string;
  category: string;
  commission_percentage: number;
}

interface VIPProductModalProps {
  vipLevel: number;
  categoryId: string;
  onClose: () => void;
}

interface ProductProgress {
  current_product_index: number;
  products_purchased: number;
  total_commission_earned: number;
}

export default function VIPProductModal({ vipLevel, categoryId, onClose }: VIPProductModalProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [progress, setProgress] = useState<ProductProgress>({
    current_product_index: 0,
    products_purchased: 0,
    total_commission_earned: 0
  });
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadProductsAndProgress();
  }, [categoryId, vipLevel]);

  async function loadProductsAndProgress() {
    try {
      setLoading(true);

      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('category', categoryId)
        .order('name');

      if (productsError) throw productsError;
      setAllProducts(productsData || []);

      const { data: progressData } = await supabase
        .from('product_progress')
        .select('*')
        .eq('category_id', categoryId)
        .eq('vip_level', vipLevel)
        .maybeSingle();

      if (progressData) {
        setProgress(progressData);
        const currentIndex = progressData.current_product_index;
        if (productsData && productsData[currentIndex]) {
          setProduct(productsData[currentIndex]);
        }
      } else {
        if (productsData && productsData.length > 0) {
          setProduct(productsData[0]);
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
      setMessage('');

      const { data, error } = await supabase.rpc('process_product_purchase', {
        p_category_id: categoryId,
        p_vip_level: vipLevel,
        p_product_id: product.id
      });

      if (error) throw error;

      const result = data as any;

      if (result.requires_deposit) {
        setMessage(result.message);
        setTimeout(() => {
          alert(result.message);
        }, 500);
      } else {
        setMessage(`Комиссия $${result.commission.toFixed(2)} зачислена на баланс!`);
      }

      setProgress({
        current_product_index: result.next_product_index,
        products_purchased: result.products_purchased,
        total_commission_earned: progress.total_commission_earned + result.commission
      });

      const nextProduct = allProducts[result.next_product_index];
      if (nextProduct) {
        setProduct(nextProduct);
      } else {
        setTimeout(() => {
          alert('Вы завершили все товары в этой категории!');
          onClose();
        }, 1000);
      }
    } catch (error: any) {
      console.error('Error purchasing product:', error);
      alert('Ошибка при покупке: ' + error.message);
    } finally {
      setPurchasing(false);
    }
  }

  const isNinthProduct = ((progress.products_purchased + 1) % 9) === 0;
  const baseCommission = product ? (product.price * product.commission_percentage / 100) : 0;
  const potentialCommission = isNinthProduct ? baseCommission * 3 : baseCommission;

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-8 max-w-md">
          <p className="text-center text-gray-600 mb-4">Нет доступных товаров в этой категории</p>
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Закрыть
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-2xl w-full my-8">
        <div className="p-6 border-b flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">
              VIP {vipLevel} - <span className="capitalize">{categoryId}</span>
            </h2>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
              <span>Товар {progress.products_purchased + 1} из {allProducts.length}</span>
              <span>Всего заработано: ${progress.total_commission_earned.toFixed(2)}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {isNinthProduct && (
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg p-4 text-white">
              <div className="flex items-center gap-3">
                <Star className="w-8 h-8 animate-pulse" />
                <div>
                  <div className="font-bold text-lg">9-й ТОВАР - ТРОЙНАЯ КОМИССИЯ!</div>
                  <div className="text-sm">Вы получите ${potentialCommission.toFixed(2)} вместо ${baseCommission.toFixed(2)}</div>
                </div>
              </div>
            </div>
          )}

          {message && (
            <div className={`rounded-lg p-4 flex items-center gap-3 ${
              message.includes('пополнить')
                ? 'bg-red-50 text-red-800 border border-red-200'
                : 'bg-green-50 text-green-800 border border-green-200'
            }`}>
              {message.includes('пополнить') ? (
                <AlertCircle className="w-6 h-6 flex-shrink-0" />
              ) : (
                <CheckCircle className="w-6 h-6 flex-shrink-0" />
              )}
              <div className="font-medium">{message}</div>
            </div>
          )}

          <div className="bg-gray-100 rounded-lg overflow-hidden">
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-64 object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400';
              }}
            />
          </div>

          <div>
            <h3 className="text-2xl font-bold mb-2">{product.name}</h3>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-blue-600">
                  ${product.price.toFixed(2)}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  Комиссия: {product.commission_percentage}%
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600">Ваша комиссия</div>
                <div className={`text-2xl font-bold ${isNinthProduct ? 'text-orange-500' : 'text-green-600'}`}>
                  ${potentialCommission.toFixed(2)}
                  {isNinthProduct && <span className="text-sm ml-1">(3x)</span>}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <TrendingUp className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <div className="font-semibold text-blue-900 mb-1">Как это работает</div>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>Нажмите "Купить" чтобы получить комиссию</li>
                  <li>Комиссия автоматически зачислится на ваш баланс</li>
                  <li>Каждый 9-й товар дает тройную комиссию</li>
                  <li>На 9-м товаре нужно пополнить счет для перехода на следующий VIP</li>
                </ul>
              </div>
            </div>
          </div>

          <button
            onClick={purchaseProduct}
            disabled={purchasing}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-bold text-lg flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <ShoppingBag className="w-6 h-6" />
            {purchasing ? 'Обработка...' : 'Купить и получить комиссию'}
          </button>
        </div>
      </div>
    </div>
  );
}
