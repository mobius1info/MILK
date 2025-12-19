import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { ShoppingBag, Crown, CheckCircle, Clock, XCircle } from 'lucide-react';

interface VIPLevel {
  id: string;
  level: number;
  name: string;
  commission: number;
  price: number;
  description: string;
  category: string;
  category_image_url: string;
  is_active: boolean;
}

interface VIPPurchaseRequest {
  id: string;
  vip_level: number;
  category_id: string;
  status: string;
  created_at: string;
}

export default function VIPPurchase() {
  const [vipLevels, setVipLevels] = useState<VIPLevel[]>([]);
  const [purchases, setPurchases] = useState<VIPPurchaseRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    await Promise.all([loadVIPLevels(), loadPurchases()]);
  }

  async function loadVIPLevels() {
    try {
      const { data, error } = await supabase
        .from('vip_levels')
        .select('*')
        .eq('is_active', true)
        .order('level');

      if (error) throw error;
      setVipLevels(data || []);
    } catch (error) {
      console.error('Error loading VIP levels:', error);
    }
  }

  async function loadPurchases() {
    try {
      const { data, error } = await supabase
        .from('vip_purchases')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPurchases(data || []);
    } catch (error) {
      console.error('Error loading purchases:', error);
    } finally {
      setLoading(false);
    }
  }

  async function requestVIPAccess(vipLevel: number, categoryId: string, price: number) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Пользователь не авторизован');

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('balance')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profileError) throw profileError;
      if (!profile) throw new Error('Профиль не найден');

      if (profile.balance < price) {
        alert('Недостаточно средств на балансе. Пополните баланс и попробуйте снова.');
        return;
      }

      const newBalance = profile.balance - price;

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ balance: newBalance })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      const { error: insertError } = await supabase
        .from('vip_purchases')
        .insert({
          vip_level: vipLevel,
          category_id: categoryId,
          status: 'pending'
        });

      if (insertError) throw insertError;

      await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          type: 'vip_purchase',
          amount: -price,
          status: 'completed',
          description: `Покупка VIP ${vipLevel} - ${categoryId}`
        });

      alert('Оплата прошла успешно! Ваш запрос на одобрении у администратора.');
      loadPurchases();
    } catch (error: any) {
      console.error('Error requesting VIP:', error);
      alert('Ошибка при оплате: ' + error.message);
    }
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
            <Clock className="w-3 h-3" />
            Ожидает
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
            <CheckCircle className="w-3 h-3" />
            Одобрено
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
            <XCircle className="w-3 h-3" />
            Отклонено
          </span>
        );
      default:
        return null;
    }
  }

  function hasPendingOrApproved(level: number, category: string) {
    return purchases.some(
      p => p.vip_level === level &&
           p.category_id === category &&
           (p.status === 'pending' || p.status === 'approved')
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <Crown className="w-8 h-8" />
          <h2 className="text-2xl font-bold">VIP Уровни</h2>
        </div>
        <p className="text-blue-100">
          Покупайте доступ к VIP категориям и получайте комиссию с каждого товара!
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {vipLevels.map((vipLevel) => {
          const isPurchased = hasPendingOrApproved(vipLevel.level, vipLevel.category);
          const categoryPurchase = purchases.find(
            p => p.vip_level === vipLevel.level && p.category_id === vipLevel.category
          );

          return (
            <div
              key={vipLevel.level}
              className="bg-white rounded-lg shadow-md overflow-hidden border-2 border-gray-200 hover:border-blue-500 transition-colors"
            >
              {vipLevel.category_image_url && (
                <div className="relative h-40 overflow-hidden">
                  <img
                    src={vipLevel.category_image_url}
                    alt={vipLevel.category}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-bold">{vipLevel.name}</h3>
                        <p className="text-sm text-blue-100 capitalize">{vipLevel.category}</p>
                      </div>
                      <Crown className="w-6 h-6" />
                    </div>
                  </div>
                </div>
              )}

              <div className="p-4 space-y-4">
                <p className="text-sm text-gray-600">{vipLevel.description}</p>

                <div className="bg-yellow-50 rounded-lg p-3">
                  <div className="text-sm text-gray-600">Цена доступа</div>
                  <div className="text-2xl font-bold text-yellow-600">
                    ${vipLevel.price.toFixed(2)}
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-3">
                  <div className="text-sm text-gray-600">Комиссия с товара</div>
                  <div className="text-2xl font-bold text-green-600">
                    {vipLevel.commission.toFixed(0)}%
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    На 9-м товаре: {(vipLevel.commission * 3).toFixed(0)}% (3x)
                  </div>
                </div>

                <div>
                  {categoryPurchase ? (
                    <div className="flex items-center justify-center gap-2 p-3 bg-gray-50 rounded">
                      {getStatusBadge(categoryPurchase.status)}
                    </div>
                  ) : (
                    <button
                      onClick={() => requestVIPAccess(vipLevel.level, vipLevel.category, vipLevel.price)}
                      disabled={isPurchased}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      <ShoppingBag className="w-5 h-5" />
                      Оплатить ${vipLevel.price.toFixed(2)}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {purchases.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">История заявок</h3>
          <div className="space-y-2">
            {purchases.map((purchase) => (
              <div
                key={purchase.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded"
              >
                <div>
                  <div className="font-medium">
                    VIP {purchase.vip_level} - <span className="capitalize">{purchase.category_id}</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(purchase.created_at).toLocaleString('ru-RU')}
                  </div>
                </div>
                {getStatusBadge(purchase.status)}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
