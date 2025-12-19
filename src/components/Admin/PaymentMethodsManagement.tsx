import { useState, useEffect } from 'react';
import { supabase, PaymentMethod } from '../../lib/supabase';
import { Plus, Edit2, Trash2, Save, X, ArrowUp, ArrowDown } from 'lucide-react';

export default function PaymentMethodsManagement() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'crypto' as 'crypto' | 'bank' | 'other',
    wallet_address: '',
    network: '',
    qr_code_url: '',
    min_amount: '10',
    max_amount: '',
    instructions: '',
    is_active: true,
    display_order: 0,
  });

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const fetchPaymentMethods = async () => {
    try {
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setPaymentMethods(data || []);
    } catch (error) {
      console.error('Error fetching payment methods:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'crypto',
      wallet_address: '',
      network: '',
      qr_code_url: '',
      min_amount: '10',
      max_amount: '',
      instructions: '',
      is_active: true,
      display_order: 0,
    });
    setEditingId(null);
    setShowAddForm(false);
  };

  const handleEdit = (method: PaymentMethod) => {
    setFormData({
      name: method.name,
      type: method.type,
      wallet_address: method.wallet_address,
      network: method.network || '',
      qr_code_url: method.qr_code_url || '',
      min_amount: method.min_amount.toString(),
      max_amount: method.max_amount?.toString() || '',
      instructions: method.instructions || '',
      is_active: method.is_active,
      display_order: method.display_order,
    });
    setEditingId(method.id);
    setShowAddForm(false);
  };

  const handleAdd = () => {
    resetForm();
    setFormData(prev => ({
      ...prev,
      display_order: paymentMethods.length + 1,
    }));
    setShowAddForm(true);
  };

  const handleSave = async () => {
    try {
      const dataToSave = {
        name: formData.name,
        type: formData.type,
        wallet_address: formData.wallet_address,
        network: formData.network || null,
        qr_code_url: formData.qr_code_url || null,
        min_amount: parseFloat(formData.min_amount),
        max_amount: formData.max_amount ? parseFloat(formData.max_amount) : null,
        instructions: formData.instructions || null,
        is_active: formData.is_active,
        display_order: formData.display_order,
      };

      if (editingId) {
        const { error } = await supabase
          .from('payment_methods')
          .update(dataToSave)
          .eq('id', editingId);

        if (error) throw error;
        alert('Payment method updated successfully!');
      } else {
        const { error } = await supabase
          .from('payment_methods')
          .insert([dataToSave]);

        if (error) throw error;
        alert('Payment method added successfully!');
      }

      resetForm();
      fetchPaymentMethods();
    } catch (error: any) {
      alert('Error: ' + error.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this payment method?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('payment_methods')
        .delete()
        .eq('id', id);

      if (error) throw error;

      alert('Payment method deleted successfully!');
      fetchPaymentMethods();
    } catch (error: any) {
      alert('Error: ' + error.message);
    }
  };

  const handleToggleActive = async (method: PaymentMethod) => {
    try {
      const { error } = await supabase
        .from('payment_methods')
        .update({ is_active: !method.is_active })
        .eq('id', method.id);

      if (error) throw error;
      fetchPaymentMethods();
    } catch (error: any) {
      alert('Error: ' + error.message);
    }
  };

  const handleReorder = async (method: PaymentMethod, direction: 'up' | 'down') => {
    const currentIndex = paymentMethods.findIndex(m => m.id === method.id);
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

    if (targetIndex < 0 || targetIndex >= paymentMethods.length) return;

    const targetMethod = paymentMethods[targetIndex];

    try {
      await supabase
        .from('payment_methods')
        .update({ display_order: targetMethod.display_order })
        .eq('id', method.id);

      await supabase
        .from('payment_methods')
        .update({ display_order: method.display_order })
        .eq('id', targetMethod.id);

      fetchPaymentMethods();
    } catch (error: any) {
      alert('Error: ' + error.message);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading payment methods...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          onClick={handleAdd}
          className="flex items-center space-x-2 bg-gradient-to-r from-[#f5b04c] to-[#2a5f64] text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
        >
          <Plus className="w-5 h-5" />
          <span>Add Method</span>
        </button>
      </div>

      {(showAddForm || editingId) && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-800">
              {editingId ? 'Edit Payment Method' : 'Add Payment Method'}
            </h3>
            <button
              onClick={resetForm}
              className="text-gray-600 hover:text-gray-800"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Method Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f5b04c]"
                placeholder="e.g., Bitcoin (BTC)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f5b04c]"
              >
                <option value="crypto">Cryptocurrency</option>
                <option value="bank">Bank Transfer</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Wallet Address / Account Details
              </label>
              <input
                type="text"
                value={formData.wallet_address}
                onChange={(e) => setFormData({ ...formData, wallet_address: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f5b04c] font-mono text-sm"
                placeholder="Enter wallet address or account details"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Network (Optional)
              </label>
              <input
                type="text"
                value={formData.network}
                onChange={(e) => setFormData({ ...formData, network: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f5b04c]"
                placeholder="e.g., BTC, ETH, TRC20"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                QR Code URL (Optional)
              </label>
              <input
                type="text"
                value={formData.qr_code_url}
                onChange={(e) => setFormData({ ...formData, qr_code_url: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f5b04c]"
                placeholder="https://..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Amount (USD)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.min_amount}
                onChange={(e) => setFormData({ ...formData, min_amount: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f5b04c]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Amount (USD) - Optional
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.max_amount}
                onChange={(e) => setFormData({ ...formData, max_amount: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f5b04c]"
                placeholder="Leave empty for unlimited"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Instructions for Users
              </label>
              <textarea
                value={formData.instructions}
                onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f5b04c]"
                placeholder="Enter any special instructions for users..."
              />
            </div>

            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-5 h-5 text-[#f5b04c] rounded focus:ring-[#f5b04c]"
                />
                <span className="text-sm font-medium text-gray-700">Active</span>
              </label>
            </div>
          </div>

          <div className="flex space-x-3 mt-6">
            <button
              onClick={handleSave}
              className="flex items-center space-x-2 bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors"
            >
              <Save className="w-5 h-5" />
              <span>Save</span>
            </button>
            <button
              onClick={resetForm}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Method
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Wallet/Account
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Limits
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paymentMethods.map((method, index) => (
                <tr key={method.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleReorder(method, 'up')}
                        disabled={index === 0}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleReorder(method, 'down')}
                        disabled={index === paymentMethods.length - 1}
                        className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>
                      <span className="text-sm text-gray-500 ml-2">{method.display_order}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{method.name}</div>
                      <div className="text-sm text-gray-500">
                        {method.network || method.type}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 font-mono max-w-xs truncate">
                      {method.wallet_address}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      ${method.min_amount.toFixed(2)}
                      {method.max_amount && ` - $${method.max_amount.toFixed(2)}`}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleActive(method)}
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        method.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {method.is_active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(method)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(method.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {paymentMethods.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No payment methods configured yet</p>
            <button
              onClick={handleAdd}
              className="mt-4 text-[#f5b04c] hover:underline"
            >
              Add your first payment method
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
