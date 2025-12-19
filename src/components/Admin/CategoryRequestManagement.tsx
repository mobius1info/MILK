import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { CheckCircle, XCircle, Clock, AlertCircle, Search } from 'lucide-react';

interface CategoryRequest {
  id: string;
  user_id: string;
  category: string;
  price_paid: number;
  status: 'pending' | 'approved' | 'rejected';
  requested_at: string;
  processed_at: string | null;
  processed_by: string | null;
  admin_notes: string;
  profiles: {
    email: string;
    telegram_username: string | null;
  };
}

export default function CategoryRequestManagement() {
  const [requests, setRequests] = useState<CategoryRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [adminNotes, setAdminNotes] = useState<{ [key: string]: string }>({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadRequests();
  }, [filter]);

  const loadRequests = async () => {
    try {
      setLoading(true);
      setError('');

      let query = supabase
        .from('category_access_requests')
        .select('*')
        .order('requested_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data: requestsData, error: fetchError } = await query;

      if (fetchError) {
        console.error('Error fetching requests:', fetchError);
        throw fetchError;
      }

      const requestsWithProfiles = await Promise.all(
        (requestsData || []).map(async (request) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('email, telegram_username')
            .eq('id', request.user_id)
            .maybeSingle();

          return {
            ...request,
            profiles: profile || { email: 'Unknown', telegram_username: null }
          };
        })
      );

      setRequests(requestsWithProfiles);
    } catch (err: any) {
      console.error('Error loading requests:', err);
      setError(err.message || 'Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  const approveRequest = async (requestId: string) => {
    setError('');
    setSuccess('');
    setProcessing(requestId);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase.rpc('approve_category_access_request', {
        request_id: requestId,
        admin_id: user.id,
        notes: adminNotes[requestId] || ''
      });

      if (error) throw error;

      setSuccess('Request approved successfully');
      await loadRequests();
    } catch (err: any) {
      setError(err.message || 'Failed to approve request');
    } finally {
      setProcessing(null);
    }
  };

  const rejectRequest = async (requestId: string) => {
    setError('');
    setSuccess('');

    if (!adminNotes[requestId]?.trim()) {
      setError('Please provide a reason for rejection');
      return;
    }

    setProcessing(requestId);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase.rpc('reject_category_access_request', {
        request_id: requestId,
        admin_id: user.id,
        notes: adminNotes[requestId]
      });

      if (error) throw error;

      setSuccess('Request rejected and user refunded');
      await loadRequests();
    } catch (err: any) {
      setError(err.message || 'Failed to reject request');
    } finally {
      setProcessing(null);
    }
  };

  const filteredRequests = requests.filter(request => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      request.category.toLowerCase().includes(search) ||
      request.profiles.email.toLowerCase().includes(search) ||
      request.profiles.telegram_username?.toLowerCase().includes(search)
    );
  });

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
            <Clock className="w-4 h-4" />
            Pending
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
            <CheckCircle className="w-4 h-4" />
            Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
            <XCircle className="w-4 h-4" />
            Rejected
          </span>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-gray-600">Loading requests...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-green-800">{success}</p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by category, email, or username..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="flex gap-2">
          {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium capitalize transition-colors ${
                filter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {filteredRequests.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No requests found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((request) => (
            <div key={request.id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-gray-900">{request.category}</h3>
                    {renderStatusBadge(request.status)}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Email:</span> {request.profiles.email}
                    </div>
                    {request.profiles.telegram_username && (
                      <div>
                        <span className="font-medium">Telegram:</span> @{request.profiles.telegram_username}
                      </div>
                    )}
                    <div>
                      <span className="font-medium">Price Paid:</span> ${request.price_paid.toFixed(2)}
                    </div>
                    <div>
                      <span className="font-medium">Requested:</span> {new Date(request.requested_at).toLocaleString()}
                    </div>
                    {request.processed_at && (
                      <div>
                        <span className="font-medium">Processed:</span> {new Date(request.processed_at).toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {request.status === 'pending' ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Admin Notes {request.status === 'pending' && <span className="text-gray-500">(optional for approval, required for rejection)</span>}
                    </label>
                    <textarea
                      value={adminNotes[request.id] || ''}
                      onChange={(e) => setAdminNotes({ ...adminNotes, [request.id]: e.target.value })}
                      placeholder="Add notes about this request..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={2}
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => approveRequest(request.id)}
                      disabled={processing === request.id}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 font-medium"
                    >
                      <CheckCircle className="w-5 h-5" />
                      {processing === request.id ? 'Processing...' : 'Approve'}
                    </button>

                    <button
                      onClick={() => rejectRequest(request.id)}
                      disabled={processing === request.id}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 font-medium"
                    >
                      <XCircle className="w-5 h-5" />
                      {processing === request.id ? 'Processing...' : 'Reject & Refund'}
                    </button>
                  </div>
                </div>
              ) : request.admin_notes && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Admin Notes:</span> {request.admin_notes}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
