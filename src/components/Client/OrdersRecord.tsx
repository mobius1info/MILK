import { useState, useEffect } from 'react';
import { supabase, Product } from '../../lib/supabase';
import { Package, DollarSign, TrendingUp, ChevronDown, ChevronRight, CheckCircle, Clock, XCircle } from 'lucide-react';

interface ProductPurchase {
  id: string;
  user_id: string;
  product_id: string;
  category_id: string;
  vip_level: number;
  product_price: number;
  commission_earned: number;
  commission_percentage: number;
  is_ninth_product: boolean;
  created_at: string;
  product?: Product;
}

interface VIPPurchase {
  id: string;
  user_id: string;
  vip_level: number;
  status: string;
  category_id: string;
  created_at: string;
  approved_at: string | null;
  is_completed: boolean;
  completed_products_count: number;
}

interface OrdersRecordProps {
  userId: string;
}

export default function OrdersRecord({ userId }: OrdersRecordProps) {
  const [vipPurchases, setVipPurchases] = useState<VIPPurchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedPurchase, setExpandedPurchase] = useState<string | null>(null);
  const [purchaseProducts, setPurchaseProducts] = useState<Record<string, ProductPurchase[]>>({});

  useEffect(() => {
    fetchVIPPurchases();
  }, [userId]);

  async function fetchVIPPurchases() {
    try {
      const { data, error } = await supabase
        .from('vip_purchases')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setVipPurchases(data || []);
    } catch (error) {
      console.error('Error fetching VIP purchases:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchProductsForPurchase(categoryId: string, vipLevel: number) {
    const key = `${categoryId}-${vipLevel}`;

    if (purchaseProducts[key]) {
      return;
    }

    try {
      const { data, error } = await supabase
        .from('product_purchases')
        .select(`
          *,
          product:products(*)
        `)
        .eq('user_id', userId)
        .eq('category_id', categoryId)
        .eq('vip_level', vipLevel)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setPurchaseProducts(prev => ({
        ...prev,
        [key]: data || []
      }));
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  }

  function handleToggleExpand(purchase: VIPPurchase) {
    const key = `${purchase.category_id}-${purchase.vip_level}`;

    if (expandedPurchase === purchase.id) {
      setExpandedPurchase(null);
    } else {
      setExpandedPurchase(purchase.id);
      fetchProductsForPurchase(purchase.category_id, purchase.vip_level);
    }
  }

  function getStatusIcon(status: string, isCompleted: boolean) {
    if (isCompleted) {
      return <CheckCircle className="w-5 h-5 text-blue-600" />;
    }
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  }

  function getStatusColor(status: string, isCompleted: boolean) {
    if (isCompleted) {
      return 'bg-blue-100 text-blue-800';
    }
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  function getStatusText(status: string, isCompleted: boolean) {
    if (isCompleted) {
      return 'Завершено';
    }
    switch (status) {
      case 'approved':
        return 'Одобрено';
      case 'pending':
        return 'Ожидает';
      case 'rejected':
        return 'Отклонено';
      default:
        return status;
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f5b04c]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="bg-gradient-to-r from-[#f5b04c] to-[#2a5f64] p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Orders Record</h2>
        <p className="text-sm text-white/90">History of your VIP category purchases</p>
      </div>

      <div className="p-4 sm:p-6">
        {vipPurchases.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No purchase history</h3>
            <p className="text-gray-600">You haven't purchased any VIP categories yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {vipPurchases.map((purchase) => {
              const key = `${purchase.category_id}-${purchase.vip_level}`;
              const products = purchaseProducts[key] || [];
              const isExpanded = expandedPurchase === purchase.id;

              return (
                <div key={purchase.id} className="bg-white rounded-lg border-2 border-gray-200 overflow-hidden">
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(purchase.status, purchase.is_completed)}
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-bold text-gray-900 text-lg capitalize">
                              {purchase.category_id}
                            </h4>
                            <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full font-medium">
                              VIP {purchase.vip_level}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500">
                            {new Date(purchase.created_at).toLocaleString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(purchase.status, purchase.is_completed)}`}>
                          {getStatusText(purchase.status, purchase.is_completed)}
                        </span>
                        {purchase.status === 'approved' && !purchase.is_completed && (
                          <button
                            onClick={() => handleToggleExpand(purchase)}
                            className="flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                          >
                            {isExpanded ? (
                              <>
                                <ChevronDown className="w-4 h-4" />
                                Hide
                              </>
                            ) : (
                              <>
                                <ChevronRight className="w-4 h-4" />
                                Details
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>

                    {isExpanded && purchase.status === 'approved' && (
                      <div className="mt-4 pt-4 border-t">
                        {products.length === 0 ? (
                          <div className="text-center py-8">
                            <Package className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                            <p className="text-gray-600">No products purchased yet in this category</p>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center gap-4 mb-4 p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
                              <div className="flex items-center gap-2">
                                <Package className="w-5 h-5 text-blue-600" />
                                <span className="text-sm font-semibold text-gray-700">
                                  {products.length} products
                                </span>
                              </div>
                              <div className="w-px h-6 bg-gray-300"></div>
                              <div className="flex items-center gap-2">
                                <DollarSign className="w-5 h-5 text-green-600" />
                                <span className="text-sm font-semibold text-gray-700">
                                  ${products.reduce((sum, p) => sum + Number(p.commission_earned), 0).toFixed(2)} earned
                                </span>
                              </div>
                            </div>

                            <div className="space-y-2">
                              {products.map((product) => (
                                <div key={product.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                  <div className="flex items-start gap-3">
                                    {product.product?.image_url && (
                                      <img
                                        src={product.product.image_url}
                                        alt={product.product.name}
                                        className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                                      />
                                    )}
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-start justify-between gap-2 mb-2">
                                        <div>
                                          <h5 className="font-bold text-gray-900">{product.product?.name}</h5>
                                          <p className="text-xs text-gray-500">
                                            {new Date(product.created_at).toLocaleString('en-US', {
                                              month: 'short',
                                              day: 'numeric',
                                              hour: '2-digit',
                                              minute: '2-digit'
                                            })}
                                          </p>
                                        </div>
                                        {product.is_ninth_product && (
                                          <span className="px-2 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold rounded-full flex items-center gap-1">
                                            <TrendingUp className="w-3 h-3" />
                                            3x
                                          </span>
                                        )}
                                      </div>

                                      <div className="grid grid-cols-3 gap-2">
                                        <div className="bg-white rounded p-2">
                                          <p className="text-xs text-gray-600">Price</p>
                                          <p className="font-bold text-blue-600 text-sm">
                                            ${Number(product.product_price).toFixed(2)}
                                          </p>
                                        </div>
                                        <div className="bg-white rounded p-2">
                                          <p className="text-xs text-gray-600">Commission</p>
                                          <p className="font-bold text-green-600 text-sm">
                                            ${Number(product.commission_earned).toFixed(2)}
                                          </p>
                                        </div>
                                        <div className="bg-white rounded p-2">
                                          <p className="text-xs text-gray-600">Rate</p>
                                          <p className="font-bold text-purple-600 text-sm">
                                            {Number(product.commission_percentage).toFixed(0)}%
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
