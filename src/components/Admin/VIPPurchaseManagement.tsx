import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Crown, CheckCircle, XCircle, Clock, User, Bell } from 'lucide-react';

interface VIPPurchaseRequest {
  id: string;
  user_id: string;
  vip_level: number;
  category_id: string;
  status: string;
  created_at: string;
  approved_at: string | null;
  approved_by: string | null;
  profiles: {
    email: string;
    full_name: string;
  };
}

export default function VIPPurchaseManagement() {
  const [requests, setRequests] = useState<VIPPurchaseRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');

  useEffect(() => {
    loadRequests();

    const channel = supabase
      .channel('vip_purchases_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'vip_purchases'
        },
        () => {
          loadRequests();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function loadRequests() {
    try {
      const { data, error } = await supabase
        .from('vip_purchases')
        .select(`
          *,
          profiles:user_id (
            email,
            full_name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('Error loading VIP requests:', error);
    } finally {
      setLoading(false);
    }
  }

  async function approveRequest(requestId: string, userId: string, categoryId: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error: updateError } = await supabase
        .from('vip_purchases')
        .update({
          status: 'approved',
          approved_at: new Date().toISOString(),
          approved_by: user.id
        })
        .eq('id', requestId);

      if (updateError) throw updateError;

      const { error: accessError } = await supabase
        .from('category_access')
        .insert({
          user_id: userId,
          category: categoryId,
          is_enabled: true
        });

      if (accessError && accessError.code !== '23505') {
        throw accessError;
      }

      alert('VIP доступ одобрен и предоставлен клиенту!');
      loadRequests();
    } catch (error: any) {
      console.error('Error approving request:', error);
      alert('Ошибка при одобрении: ' + error.message);
    }
  }

  async function rejectRequest(requestId: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('vip_purchases')
        .update({
          status: 'rejected',
          approved_by: user.id
        })
        .eq('id', requestId);

      if (error) throw error;

      alert('Заявка отклонена');
      loadRequests();
    } catch (error: any) {
      console.error('Error rejecting request:', error);
      alert('Ошибка при отклонении: ' + error.message);
    }
  }

  const filteredRequests = requests.filter(req => {
    if (filter === 'all') return true;
    return req.status === filter;
  });

  const pendingCount = requests.filter(r => r.status === 'pending').length;

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-end">
          {pendingCount > 0 && (
            <div className="flex items-center gap-2 bg-white/20 rounded-full px-4 py-2">
              <Bell className="w-5 h-5 animate-pulse" />
              <span className="font-bold">{pendingCount} новых</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-2 bg-white rounded-lg p-2 shadow-sm">
        {(['all', 'pending', 'approved', 'rejected'] as const).map((filterOption) => (
          <button
            key={filterOption}
            onClick={() => setFilter(filterOption)}
            className={`flex-1 px-4 py-2 rounded font-medium transition-colors ${
              filter === filterOption
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {filterOption === 'all' && 'Все'}
            {filterOption === 'pending' && `Ожидают (${pendingCount})`}
            {filterOption === 'approved' && 'Одобренные'}
            {filterOption === 'rejected' && 'Отклоненные'}
          </button>
        ))}
      </div>

      {filteredRequests.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center text-gray-500">
          <Crown className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-lg">Нет заявок для отображения</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredRequests.map((request) => (
            <div
              key={request.id}
              className={`bg-white rounded-lg shadow-md p-6 border-2 ${
                request.status === 'pending'
                  ? 'border-yellow-300 bg-yellow-50/30'
                  : request.status === 'approved'
                  ? 'border-green-300'
                  : 'border-red-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                      {request.vip_level}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        VIP {request.vip_level} - <span className="capitalize">{request.category_id}</span>
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <User className="w-4 h-4" />
                        <span>{request.profiles?.full_name || request.profiles?.email}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Email:</span>
                      <div className="font-medium">{request.profiles?.email}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Дата заявки:</span>
                      <div className="font-medium">
                        {new Date(request.created_at).toLocaleString('ru-RU')}
                      </div>
                    </div>
                  </div>

                  {request.status === 'pending' && (
                    <div className="mt-4 p-3 bg-yellow-100 border border-yellow-300 rounded-lg flex items-center gap-2 text-yellow-800">
                      <Bell className="w-5 h-5 animate-pulse" />
                      <span className="font-semibold">
                        КЛИЕНТ КУПИЛ ВИП НОМЕР {request.vip_level}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-end gap-3">
                  {request.status === 'pending' ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => approveRequest(request.id, request.user_id, request.category_id)}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                      >
                        <CheckCircle className="w-5 h-5" />
                        Дать доступ
                      </button>
                      <button
                        onClick={() => rejectRequest(request.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                      >
                        <XCircle className="w-5 h-5" />
                        Отклонить
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      {request.status === 'approved' && (
                        <span className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-lg font-medium">
                          <CheckCircle className="w-5 h-5" />
                          Одобрено
                        </span>
                      )}
                      {request.status === 'rejected' && (
                        <span className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-800 rounded-lg font-medium">
                          <XCircle className="w-5 h-5" />
                          Отклонено
                        </span>
                      )}
                    </div>
                  )}

                  {request.status !== 'pending' && request.approved_at && (
                    <div className="text-xs text-gray-500">
                      {new Date(request.approved_at).toLocaleString('ru-RU')}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
