import { useState, useEffect } from 'react';
import { supabase, Order, OrderItem, Product } from '../../lib/supabase';
import { X, Package, Clock, CheckCircle, XCircle, DollarSign } from 'lucide-react';

interface OrderWithItems extends Order {
  items?: Array<OrderItem & { product?: Product }>;
}

interface ActiveTasksModalProps {
  userId: string;
  categoryId: string;
  vipLevel: number;
  onClose: () => void;
}

export default function ActiveTasksModal({ userId, categoryId, vipLevel, onClose }: ActiveTasksModalProps) {
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, [userId, categoryId]);

  async function fetchOrders() {
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

      const categoryOrders = ordersWithItems.filter(order =>
        order.items?.some(item => item.product?.category === categoryId && item.product?.vip_level === vipLevel)
      );

      setOrders(categoryOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  }

  function getStatusIcon(status: string) {
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
  }

  function getStatusColor(status: string) {
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
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold">Активные Таски</h2>
            <p className="text-sm text-gray-600 capitalize">VIP {vipLevel} - {categoryId}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Нет активных задач</h3>
              <p className="text-gray-600">
                Вы еще не совершали покупки в этой категории
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div
                    className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                  >
                    <div className="flex items-center space-x-4">
                      {getStatusIcon(order.status)}
                      <div>
                        <div className="font-semibold">Заказ #{order.id.slice(0, 8)}</div>
                        <div className="text-sm text-gray-500">
                          {new Date(order.created_at).toLocaleString('ru-RU')}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                        {order.status === 'pending' && 'Ожидает'}
                        {order.status === 'processing' && 'В обработке'}
                        {order.status === 'completed' && 'Завершен'}
                        {order.status === 'cancelled' && 'Отменен'}
                      </span>
                      <div className="text-right">
                        <div className="text-sm text-gray-500">Сумма</div>
                        <div className="font-bold text-[#f5b04c]">${order.total_amount.toFixed(2)}</div>
                      </div>
                    </div>
                  </div>

                  {expandedOrder === order.id && order.items && order.items.length > 0 && (
                    <div className="border-t border-gray-200 p-4 bg-gray-50">
                      <h4 className="font-semibold mb-3">Товары в заказе:</h4>
                      <div className="space-y-2">
                        {order.items
                          .filter(item => item.product?.category === categoryId && item.product?.vip_level === vipLevel)
                          .map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between bg-white p-3 rounded-lg">
                              <div className="flex items-center space-x-3">
                                {item.product?.image_url && (
                                  <img
                                    src={item.product.image_url}
                                    alt={item.product.name}
                                    className="w-16 h-16 object-cover rounded"
                                  />
                                )}
                                <div>
                                  <div className="font-medium">{item.product?.name}</div>
                                  <div className="text-sm text-gray-500">
                                    Количество: {item.quantity}
                                  </div>
                                  {item.product?.commission_percentage && (
                                    <div className="text-xs text-green-600 flex items-center gap-1 mt-1">
                                      <DollarSign className="w-3 h-3" />
                                      Комиссия: {item.product.commission_percentage}%
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-bold text-[#f5b04c]">
                                  ${(item.price_at_time * item.quantity).toFixed(2)}
                                </div>
                                <div className="text-xs text-gray-500">
                                  ${item.price_at_time.toFixed(2)} каждый
                                </div>
                              </div>
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
    </div>
  );
}
