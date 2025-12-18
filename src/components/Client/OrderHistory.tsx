import { useState, useEffect } from 'react';
import { supabase, Order, OrderItem, Product } from '../../lib/supabase';
import { Package, Clock, CheckCircle, XCircle, Crown, Lock, Wallet, AlertCircle, ShoppingCart } from 'lucide-react';

interface OrderWithItems extends Order {
  items?: Array<OrderItem & { product?: Product }>;
}

interface OrderHistoryProps {
  userId: string;
  onNavigateToDeposit?: () => void;
}

interface VIPLevel {
  id: string;
  level: number;
  name: string;
  commission: number;
  description: string;
  categories: string[];
  is_active: boolean;
}

export default function OrderHistory({ userId, onNavigateToDeposit }: OrderHistoryProps) {
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [vipLevels, setVipLevels] = useState<VIPLevel[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [userBalance, setUserBalance] = useState(0);
  const [expandedVIP, setExpandedVIP] = useState<number | null>(null);
  const [categoryAccess, setCategoryAccess] = useState<Record<string, boolean>>({});
  const [categoryPrices, setCategoryPrices] = useState<Record<string, number>>({});
  const [categoryRequests, setCategoryRequests] = useState<Record<string, any>>({});
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchVIPLevels();
    fetchUserBalance();
    fetchOrders();
    fetchProducts();
    fetchCategoryAccess();
    fetchCategoryPrices();
    fetchCategoryRequests();
  }, []);

  const fetchVIPLevels = async () => {
    try {
      const { data, error } = await supabase
        .from('vip_levels')
        .select('*')
        .eq('is_active', true)
        .order('level');

      if (error) throw error;
      setVipLevels(data || []);
    } catch (error) {
      console.error('Error fetching VIP levels:', error);
    }
  };

  const fetchUserBalance = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('balance')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setUserBalance(Number(data.balance) || 0);
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  };

  const fetchCategoryAccess = async () => {
    try {
      const { data, error } = await supabase
        .from('category_access')
        .select('category, is_enabled')
        .eq('user_id', userId)
        .eq('is_enabled', true);

      if (error) throw error;

      const accessMap: Record<string, boolean> = {};
      (data || []).forEach((access) => {
        accessMap[access.category] = access.is_enabled;
      });
      setCategoryAccess(accessMap);
    } catch (error) {
      console.error('Error fetching category access:', error);
    }
  };

  const fetchCategoryPrices = async () => {
    try {
      const { data, error } = await supabase
        .from('category_prices')
        .select('category, price')
        .eq('is_available', true);

      if (error) throw error;

      const pricesMap: Record<string, number> = {};
      (data || []).forEach((item) => {
        pricesMap[item.category] = item.price;
      });
      setCategoryPrices(pricesMap);
    } catch (error) {
      console.error('Error fetching category prices:', error);
    }
  };

  const fetchCategoryRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('category_access_requests')
        .select('*')
        .eq('user_id', userId)
        .order('requested_at', { ascending: false });

      if (error) throw error;

      const requestsMap: Record<string, any> = {};
      (data || []).forEach((request) => {
        if (!requestsMap[request.category] || new Date(request.requested_at) > new Date(requestsMap[request.category].requested_at)) {
          requestsMap[request.category] = request;
        }
      });
      setCategoryRequests(requestsMap);
    } catch (error) {
      console.error('Error fetching category requests:', error);
    }
  };

  const purchaseCategoryAccess = async (category: string, price: number) => {
    setError('');
    setSuccess('');
    setPurchasing(category);

    try {
      if (userBalance < price) {
        throw new Error('Insufficient balance');
      }

      const { error: insertError } = await supabase
        .from('category_access_requests')
        .insert({
          user_id: userId,
          category: category,
          price_paid: price,
          status: 'pending'
        });

      if (insertError) throw insertError;

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ balance: userBalance - price })
        .eq('id', userId);

      if (updateError) throw updateError;

      setSuccess(`Access request for ${category} submitted successfully! Awaiting administrator approval.`);

      await fetchUserBalance();
      await fetchCategoryRequests();

      setTimeout(() => setSuccess(''), 5000);
    } catch (err: any) {
      setError(err.message || 'Failed to purchase access');
      setTimeout(() => setError(''), 5000);
    } finally {
      setPurchasing(null);
    }
  };

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchOrders = async () => {
    try {
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      const ordersWithItems = await Promise.all(
        (ordersData || []).map(async (order) => {
          const { data: itemsData } = await supabase
            .from('order_items')
            .select(`
              *,
              product:products(*)
            `)
            .eq('order_id', order.id);

          return { ...order, items: itemsData || [] };
        })
      );

      setOrders(ordersWithItems);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'processing':
        return <Package className="w-5 h-5 text-blue-500" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const isVIPLevelAccessible = (level: number) => {
    const vipLevel = vipLevels.find((v) => v.level === level);
    if (!vipLevel) return false;

    return vipLevel.categories.some(cat => categoryAccess[cat] === true);
  };

  const getFilteredProducts = () => {
    if (activeTab === 0) {
      return products.filter((p) => isVIPLevelAccessible(p.vip_level || 0));
    }
    return products.filter(
      (p) => p.vip_level === activeTab && isVIPLevelAccessible(activeTab)
    );
  };

  const filteredProducts = getFilteredProducts();

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Available Tasks</h2>
        <p className="text-sm text-gray-600">
          Your balance: <span className="font-bold text-[#f5b04c]">${userBalance.toFixed(2)}</span>
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-red-800 mb-1">Error</h4>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-green-800 mb-1">Success</h4>
            <p className="text-sm text-green-700">{success}</p>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2 border-b">
        <button
          onClick={() => setActiveTab(0)}
          className={`px-4 py-2 font-medium rounded-t-lg transition-all flex items-center gap-2 ${
            activeTab === 0
              ? 'bg-[#f5b04c] text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <span>ALL</span>
        </button>
        {vipLevels.map((vip) => {
          const hasCategoryAccess = vip.categories.some(cat => categoryAccess[cat] === true);

          return (
            <button
              key={vip.level}
              onClick={() => setActiveTab(vip.level)}
              className={`px-4 py-2 font-medium rounded-t-lg transition-all flex items-center gap-2 ${
                activeTab === vip.level
                  ? 'bg-[#f5b04c] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Crown className="w-4 h-4" />
              {!hasCategoryAccess && <Lock className="w-4 h-4" />}
              <span>{vip.name}</span>
            </button>
          );
        })}
      </div>

      <div className="space-y-4">
        {vipLevels.filter(vip => {
          if (activeTab === 0) {
            return true;
          }
          return vip.level === activeTab;
        }).map((vip) => {
          const hasCategoryAccess = vip.categories.some(cat => categoryAccess[cat] === true);
          const productsCount = products.filter((p) => p.vip_level === vip.level).length;
          const vipProducts = products.filter((p) => p.vip_level === vip.level);
          const isExpanded = expandedVIP === vip.level;

          return (
            <div
              key={vip.level}
              className={`bg-white rounded-lg shadow-md border-2 transition-all overflow-hidden ${
                hasCategoryAccess ? 'border-[#f5b04c]' : 'border-gray-200'
              }`}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500">
                      {hasCategoryAccess ? (
                        <Crown className="w-6 h-6 text-white" />
                      ) : (
                        <Lock className="w-6 h-6 text-white" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-800">{vip.name}</h3>
                      <p className="text-sm text-gray-600">{vip.description}</p>
                    </div>
                  </div>
                  <div className={`px-4 py-2 rounded-full font-semibold ${
                    hasCategoryAccess ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {hasCategoryAccess ? 'Purchased' : 'Not Purchased'}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div className="bg-gradient-to-br from-green-50 to-green-100/30 p-4 rounded-lg border border-green-200">
                    <p className="text-xs text-gray-600 mb-1 uppercase tracking-wide">Commission Per Product</p>
                    <p className="text-2xl font-bold text-green-600">${vip.commission.toFixed(2)}</p>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100/30 p-4 rounded-lg border border-blue-200">
                    <p className="text-xs text-gray-600 mb-1 uppercase tracking-wide">Categories</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {vip.categories.map(cat => (
                        <span key={cat} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs capitalize">
                          {cat}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {!hasCategoryAccess && vip.categories.length > 0 && (() => {
                  const firstCategory = vip.categories[0];
                  const categoryPrice = categoryPrices[firstCategory] || 0;
                  const request = categoryRequests[firstCategory];
                    const hasSufficientBalance = userBalance >= categoryPrice;

                    return (
                      <div className="space-y-3">
                        <div className="bg-amber-50 border-2 border-amber-300 rounded-lg p-5">
                          <div className="flex items-start gap-3 mb-3">
                            <Lock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <h4 className="font-semibold text-gray-800 mb-1">Category Not Purchased</h4>
                              <p className="text-sm text-gray-700 mb-2">
                                Purchase access to this category to view and buy products.
                              </p>
                              <div className="bg-white rounded p-3 text-sm space-y-1">
                                <p className="text-gray-600">
                                  <span className="font-semibold">Category price:</span> <span className="text-[#f5b04c] font-bold">${categoryPrice.toFixed(2)}</span>
                                </p>
                                <p className="text-gray-600">
                                  <span className="font-semibold">Your balance:</span> <span className={`font-bold ${hasSufficientBalance ? 'text-green-600' : 'text-red-600'}`}>${userBalance.toFixed(2)}</span>
                                </p>
                              </div>
                            </div>
                          </div>

                          {request?.status === 'pending' && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
                              <div className="flex items-center gap-2 text-yellow-800 mb-1">
                                <Clock className="w-4 h-4" />
                                <span className="font-semibold text-sm">Request Pending</span>
                              </div>
                              <p className="text-xs text-yellow-700">
                                Your request is awaiting admin approval. You will be notified once processed.
                              </p>
                              <p className="text-xs text-gray-600 mt-1">
                                Requested: {new Date(request.requested_at).toLocaleString()}
                              </p>
                            </div>
                          )}

                          {request?.status === 'rejected' && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
                              <div className="flex items-center gap-2 text-red-800 mb-1">
                                <XCircle className="w-4 h-4" />
                                <span className="font-semibold text-sm">Request Rejected</span>
                              </div>
                              {request.admin_notes && (
                                <p className="text-xs text-red-700 mb-1">Reason: {request.admin_notes}</p>
                              )}
                              <p className="text-xs text-gray-600">You can submit a new request.</p>
                            </div>
                          )}

                          {(!request || request.status === 'rejected') && (
                            <button
                              onClick={() => purchaseCategoryAccess(firstCategory, categoryPrice)}
                              disabled={purchasing === firstCategory || !hasSufficientBalance}
                              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                              {purchasing === firstCategory ? (
                                <>
                                  <Clock className="w-5 h-5 animate-spin" />
                                  <span>Processing...</span>
                                </>
                              ) : !hasSufficientBalance ? (
                                <>
                                  <Lock className="w-5 h-5" />
                                  <span>Insufficient Balance</span>
                                </>
                              ) : (
                                <>
                                  <ShoppingCart className="w-5 h-5" />
                                  <span>Purchase Access - ${categoryPrice.toFixed(2)}</span>
                                </>
                              )}
                            </button>
                          )}

                          {!hasSufficientBalance && onNavigateToDeposit && (
                            <button
                              onClick={onNavigateToDeposit}
                              className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-2 rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2 mt-2"
                            >
                              <Wallet className="w-4 h-4" />
                              <span>Deposit Funds</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })()}

                {hasCategoryAccess && (
                  <button
                    onClick={() => setExpandedVIP(isExpanded ? null : vip.level)}
                    className="w-full bg-gradient-to-r from-[#f5b04c] to-[#2a5f64] text-white py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
                  >
                    {isExpanded ? 'Скрыть задачи' : 'Посмотреть задачи'}
                  </button>
                )}
              </div>

              {isExpanded && hasCategoryAccess && (
                <div className="border-t bg-gray-50 p-4">
                  {vipProducts.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Package className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                      <p>Нет доступных задач</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {vipProducts.map((product) => (
                        <div key={product.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-full h-40 object-cover"
                          />
                          <div className="p-3">
                            <h4 className="font-semibold text-gray-800 mb-1 text-sm">{product.name}</h4>
                            <p className="text-xs text-gray-600 mb-2 line-clamp-2">{product.description}</p>
                            <div className="flex items-center justify-between">
                              <span className="text-lg font-bold text-[#f5b04c]">
                                ${product.price.toFixed(2)}
                              </span>
                              <span className="text-xs text-gray-500">
                                ⭐ {product.rating} ({product.reviews})
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-8 border-t pt-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Your Order History</h3>
        {orders.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <Package className="w-12 h-12 mx-auto text-gray-400 mb-3" />
            <p className="text-gray-500">No orders yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div
                  className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(order.status)}
                      <div>
                        <p className="font-semibold text-gray-800">
                          Order #{order.id.slice(0, 8)}
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(order.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-[#f5b04c]">
                        ${order.total_amount.toFixed(2)}
                      </p>
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
                    </div>
                  </div>
                </div>

                {expandedOrder === order.id && (
                  <div className="border-t bg-gray-50 p-4">
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-1">
                        <span className="font-medium">Payment Method:</span>{' '}
                        {order.payment_method}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Shipping Address:</span>{' '}
                        {order.shipping_address}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <p className="font-medium text-gray-800 mb-2">Items:</p>
                      {order.items?.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center space-x-3 bg-white p-3 rounded"
                        >
                          {item.product?.image_url && (
                            <img
                              src={item.product.image_url}
                              alt={item.product.name}
                              className="w-12 h-12 object-cover rounded"
                            />
                          )}
                          <div className="flex-1">
                            <p className="font-medium text-sm">
                              {item.product?.name || 'Product'}
                            </p>
                            <p className="text-xs text-gray-600">
                              Qty: {item.quantity} × ${item.price.toFixed(2)}
                            </p>
                          </div>
                          <p className="font-medium text-[#f5b04c]">
                            ${(item.quantity * item.price).toFixed(2)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
