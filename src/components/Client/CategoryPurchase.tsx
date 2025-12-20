import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { ShoppingBag, Lock, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface CategoryPrice {
  id: string;
  category: string;
  price: number;
  description: string;
  is_available: boolean;
}

interface CategoryRequest {
  id: string;
  category: string;
  price_paid: number;
  status: 'pending' | 'approved' | 'rejected';
  requested_at: string;
  processed_at: string | null;
  admin_notes: string;
}

interface CategoryAccess {
  category: string;
  is_enabled: boolean;
}

export default function CategoryPurchase() {
  const [categories, setCategories] = useState<CategoryPrice[]>([]);
  const [requests, setRequests] = useState<CategoryRequest[]>([]);
  const [access, setAccess] = useState<CategoryAccess[]>([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [categoriesRes, requestsRes, accessRes, profileRes] = await Promise.all([
        supabase.from('category_prices').select('*').eq('is_available', true).order('price'),
        supabase.from('category_access_requests').select('*').eq('user_id', user.id).order('requested_at', { ascending: false }),
        supabase.from('category_access').select('category, is_enabled').eq('user_id', user.id).eq('is_enabled', true),
        supabase.from('profiles').select('balance').eq('id', user.id).single()
      ]);

      if (categoriesRes.data) {
        const cats = categoriesRes.data.map(cat => ({
          ...cat,
          price: Number(cat.price)
        }));
        setCategories(cats);
      }
      if (requestsRes.data) {
        const reqs = requestsRes.data.map(req => ({
          ...req,
          price_paid: Number(req.price_paid)
        }));
        setRequests(reqs);
      }
      if (accessRes.data) setAccess(accessRes.data);
      if (profileRes.data) setBalance(Number(profileRes.data.balance));
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const purchaseAccess = async (category: string, price: number) => {
    setError('');
    setSuccess('');
    setPurchasing(category);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      if (balance < price) {
        throw new Error('Insufficient balance');
      }

      const { error: insertError } = await supabase
        .from('category_access_requests')
        .insert({
          user_id: user.id,
          category: category,
          price_paid: price,
          status: 'pending'
        });

      if (insertError) throw insertError;

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ balance: balance - price })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setSuccess(`Access request for ${category} submitted successfully! Awaiting administrator approval.`);
      await loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to purchase access');
    } finally {
      setPurchasing(null);
    }
  };

  const getRequestStatus = (category: string) => {
    return requests.find(r => r.category === category);
  };

  const hasAccess = (category: string) => {
    return access.some(a => a.category === category && a.is_enabled);
  };

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <div className="flex items-center gap-2 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
            <Clock className="w-4 h-4" />
            <span>Pending Approval</span>
          </div>
        );
      case 'approved':
        return (
          <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
            <CheckCircle className="w-4 h-4" />
            <span>Approved</span>
          </div>
        );
      case 'rejected':
        return (
          <div className="flex items-center gap-2 px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
            <XCircle className="w-4 h-4" />
            <span>Rejected</span>
          </div>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-gray-600">Loading categories...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Purchase Category Access</h1>
        <p className="text-gray-600">Buy access to product categories. Administrator approval required.</p>
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <p className="text-blue-900 font-semibold">Your Balance: ${balance.toFixed(2)}</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-green-800">{success}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {categories.map((category) => {
          const request = getRequestStatus(category.category);
          const approved = hasAccess(category.category);

          return (
            <div key={category.id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <ShoppingBag className="w-8 h-8 text-blue-600" />
                    <h3 className="text-xl font-bold text-gray-900">{category.category}</h3>
                  </div>
                  {approved && <Lock className="w-6 h-6 text-green-600" />}
                </div>

                <p className="text-gray-600 mb-4 min-h-[48px]">{category.description}</p>

                <div className="mb-4">
                  <span className="text-3xl font-bold text-gray-900">${category.price.toFixed(2)}</span>
                </div>

                {approved ? (
                  <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-lg text-sm font-medium">
                    <CheckCircle className="w-4 h-4" />
                    <span>Access Granted</span>
                  </div>
                ) : request?.status === 'pending' ? (
                  <div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg text-sm font-medium mb-2">
                      <Clock className="w-4 h-4" />
                      <span>Awaiting Admin Approval</span>
                    </div>
                    <p className="text-xs text-gray-500">
                      Requested: {new Date(request.requested_at).toLocaleString()}
                    </p>
                  </div>
                ) : request?.status === 'rejected' ? (
                  <div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-800 rounded-lg text-sm font-medium mb-2">
                      <XCircle className="w-4 h-4" />
                      <span>Request Rejected</span>
                    </div>
                    {request.admin_notes && (
                      <p className="text-xs text-gray-600 mb-2">Reason: {request.admin_notes}</p>
                    )}
                    <button
                      onClick={() => purchaseAccess(category.category, category.price)}
                      disabled={purchasing === category.category || balance < category.price}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                      {purchasing === category.category ? 'Processing...' : 'Try Again'}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => purchaseAccess(category.category, category.price)}
                    disabled={purchasing === category.category || balance < category.price}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
                  >
                    {purchasing === category.category ? 'Processing...' : balance < category.price ? 'Insufficient Balance' : 'Purchase Access'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Request History</h2>

        {requests.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No requests yet</p>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{request.category}</h3>
                  {renderStatusBadge(request.status)}
                </div>

                <div className="text-sm text-gray-600 space-y-1">
                  <p>Price Paid: ${request.price_paid.toFixed(2)}</p>
                  <p>Requested: {new Date(request.requested_at).toLocaleString()}</p>
                  {request.processed_at && (
                    <p>Processed: {new Date(request.processed_at).toLocaleString()}</p>
                  )}
                  {request.admin_notes && (
                    <p className="text-gray-700 mt-2">
                      <span className="font-medium">Admin Notes:</span> {request.admin_notes}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
