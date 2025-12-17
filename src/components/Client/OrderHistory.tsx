import { useState, useEffect } from 'react';
import { supabase, Order, OrderItem, Product } from '../../lib/supabase';
import { Package, Clock, CheckCircle, XCircle, Crown, Lock, Wallet } from 'lucide-react';

interface OrderWithItems extends Order {
  items?: Array<OrderItem & { product?: Product }>;
}

interface OrderHistoryProps {
  userId: string;
  onNavigateToDeposit?: () => void;
}

interface VIPLevel {
  level: number;
  name: string;
  minBalance: number;
  color: string;
  category?: string;
  commission?: number;
}

const VIP_LEVELS: VIPLevel[] = [
  { level: 0, name: 'ALL', minBalance: 0, color: 'bg-gray-100 text-gray-800' },
  { level: 1, name: 'VIP 1', minBalance: 100, color: 'bg-blue-100 text-blue-800', category: 'Sports Equipment', commission: 4 },
  { level: 2, name: 'VIP 2', minBalance: 500, color: 'bg-green-100 text-green-800', category: 'Clothing', commission: 10 },
  { level: 3, name: 'VIP 3', minBalance: 2000, color: 'bg-yellow-100 text-yellow-800', category: 'Home & Living', commission: 15 },
  { level: 4, name: 'VIP 4', minBalance: 5000, color: 'bg-orange-100 text-orange-800', category: 'Electronics', commission: 17 },
  { level: 5, name: 'VIP 5', minBalance: 20000, color: 'bg-red-100 text-red-800', category: 'Crypto Mining Equipment', commission: 20 },
];

export default function OrderHistory({ userId, onNavigateToDeposit }: OrderHistoryProps) {
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [userBalance, setUserBalance] = useState(0);
  const [expandedVIP, setExpandedVIP] = useState<number | null>(null);

  useEffect(() => {
    fetchUserBalance();
    fetchOrders();
    fetchProducts();
  }, []);

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
    const vipLevel = VIP_LEVELS.find((v) => v.level === level);
    return vipLevel ? userBalance >= vipLevel.minBalance : false;
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

      <div className="flex flex-wrap gap-2 border-b">
        {VIP_LEVELS.map((vip) => {
          const isAccessible = userBalance >= vip.minBalance;
          const productsCount = products.filter((p) =>
            vip.level === 0
              ? isVIPLevelAccessible(p.vip_level || 0)
              : p.vip_level === vip.level && isAccessible
          ).length;

          return (
            <button
              key={vip.level}
              onClick={() => setActiveTab(vip.level)}
              disabled={!isAccessible && vip.level !== 0}
              className={`px-4 py-2 font-medium rounded-t-lg transition-all flex items-center gap-2 ${
                activeTab === vip.level
                  ? 'bg-[#f5b04c] text-white'
                  : isAccessible
                  ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  : 'bg-gray-50 text-gray-400 cursor-not-allowed'
              }`}
            >
              {vip.level > 0 && <Crown className="w-4 h-4" />}
              {!isAccessible && vip.level > 0 && <Lock className="w-4 h-4" />}
              <span>{vip.name}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                activeTab === vip.level ? 'bg-white text-[#f5b04c]' : 'bg-gray-200 text-gray-600'
              }`}>
                {productsCount}
              </span>
            </button>
          );
        })}
      </div>

      {activeTab === 0 ? (
        <div className="space-y-4">
          {VIP_LEVELS.filter(vip => vip.level > 0).map((vip) => {
            const isAccessible = userBalance >= vip.minBalance;
            const productsCount = products.filter((p) => p.vip_level === vip.level).length;
            const vipProducts = products.filter((p) => p.vip_level === vip.level);
            const isExpanded = expandedVIP === vip.level;

            return (
              <div
                key={vip.level}
                className={`bg-white rounded-lg shadow-md border-2 transition-all ${
                  isAccessible ? 'border-[#f5b04c]' : 'border-gray-200'
                }`}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-lg ${vip.color}`}>
                        {isAccessible ? (
                          <Crown className="w-6 h-6" />
                        ) : (
                          <Lock className="w-6 h-6" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">{vip.name}</h3>
                        <p className="text-sm text-gray-600">{vip.category}</p>
                      </div>
                    </div>
                    <div className={`px-4 py-2 rounded-full font-semibold ${
                      isAccessible ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {isAccessible ? 'Unlocked' : 'Locked'}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Unlock Amount</p>
                      <p className="text-2xl font-bold text-[#f5b04c]">${vip.minBalance.toFixed(2)}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Commission</p>
                      <p className="text-2xl font-bold text-green-600">{vip.commission}%</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Available Tasks</p>
                      <p className="text-2xl font-bold text-blue-600">{productsCount}</p>
                    </div>
                  </div>

                  {!isAccessible && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                      <p className="text-sm text-gray-700 mb-3">
                        <span className="font-semibold">Your balance:</span> ${userBalance.toFixed(2)} |
                        <span className="font-semibold text-red-600"> Need: ${(vip.minBalance - userBalance).toFixed(2)} more</span>
                      </p>
                      {onNavigateToDeposit && (
                        <button
                          onClick={onNavigateToDeposit}
                          className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                        >
                          <Wallet className="w-5 h-5" />
                          <span>Пополнить счет</span>
                        </button>
                      )}
                    </div>
                  )}

                  {isAccessible && (
                    <button
                      onClick={() => setExpandedVIP(isExpanded ? null : vip.level)}
                      className="w-full bg-gradient-to-r from-[#f5b04c] to-[#2a5f64] text-white py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
                    >
                      {isExpanded ? 'Скрыть задачи' : `Посмотреть ${productsCount} задач`}
                    </button>
                  )}
                </div>

                {isExpanded && isAccessible && (
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
      ) : !isVIPLevelAccessible(activeTab) && activeTab > 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <Lock className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            {VIP_LEVELS[activeTab].name} Locked
          </h3>
          <p className="text-gray-600 mb-4">
            Minimum balance required: <span className="font-bold text-[#f5b04c]">
              ${VIP_LEVELS[activeTab].minBalance.toFixed(2)}
            </span>
          </p>
          <p className="text-sm text-gray-500">
            Your current balance: ${userBalance.toFixed(2)}
          </p>
          <p className="text-sm text-gray-500 mt-2 mb-6">
            You need ${(VIP_LEVELS[activeTab].minBalance - userBalance).toFixed(2)} more to unlock this level
          </p>
          {onNavigateToDeposit && (
            <button
              onClick={onNavigateToDeposit}
              className="mx-auto bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              <Wallet className="w-5 h-5" />
              <span>Пополнить счет</span>
            </button>
          )}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <Package className="w-12 h-12 mx-auto text-gray-400 mb-3" />
          <p className="text-gray-500">No products available at this level</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-800">{product.name}</h3>
                  {product.vip_level && product.vip_level > 0 && (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      VIP_LEVELS[product.vip_level].color
                    }`}>
                      {VIP_LEVELS[product.vip_level].name}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-3">{product.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-[#f5b04c]">
                    ${product.price.toFixed(2)}
                  </span>
                  <span className="text-sm text-gray-500">
                    ⭐ {product.rating} ({product.reviews})
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

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
