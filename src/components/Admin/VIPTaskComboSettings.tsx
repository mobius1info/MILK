import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { X, Plus, Settings, Clock, Trash2, Zap, DollarSign, Hash, Percent } from 'lucide-react';

interface VIPTaskComboSettingsProps {
  vipPurchaseId: string;
  vipLevel: number;
  categoryId: string;
  currentPosition: number;
  totalProducts: number;
  vipPrice: number;
  onClose: () => void;
  onUpdate?: () => void;
}

interface ComboOverride {
  id: string;
  product_position: number;
  combo_multiplier: number;
  vip_price_percentage: number;
  created_at: string;
  is_active: boolean;
  created_by: string;
  notes: string | null;
  creator_email?: string;
}

export default function VIPTaskComboSettings({
  vipPurchaseId,
  vipLevel,
  categoryId,
  currentPosition,
  totalProducts,
  vipPrice,
  onClose,
  onUpdate
}: VIPTaskComboSettingsProps) {
  const [overrides, setOverrides] = useState<ComboOverride[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [productPosition, setProductPosition] = useState(currentPosition + 1);
  const [comboMultiplier, setComboMultiplier] = useState(2);
  const [vipPricePercentage, setVipPricePercentage] = useState(150);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadOverrides();
  }, [vipPurchaseId]);

  async function loadOverrides() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('vip_purchase_combo_overrides')
        .select('*')
        .eq('vip_purchase_id', vipPurchaseId)
        .order('product_position', { ascending: true });

      if (error) throw error;

      const overridesWithEmails = await Promise.all(
        (data || []).map(async (override) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('email')
            .eq('id', override.created_by)
            .maybeSingle();

          return {
            ...override,
            creator_email: profile?.email || 'Unknown'
          };
        })
      );

      setOverrides(overridesWithEmails);
    } catch (error) {
      console.error('Error loading combo overrides:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddOverride() {
    if (productPosition <= 0 || productPosition > totalProducts) {
      alert(`Product position must be between 1 and ${totalProducts}`);
      return;
    }

    try {
      setSaving(true);
      const { data, error } = await supabase.rpc('admin_manage_vip_combo_override', {
        p_vip_purchase_id: vipPurchaseId,
        p_product_position: productPosition,
        p_combo_multiplier: comboMultiplier,
        p_vip_price_percentage: vipPricePercentage,
        p_notes: notes || null
      });

      if (error) throw error;

      if (data && !data.success) {
        alert(data.error || 'Failed to add combo override');
        return;
      }

      setAdding(false);
      setProductPosition(currentPosition + 1);
      setComboMultiplier(2);
      setVipPricePercentage(150);
      setNotes('');
      await loadOverrides();
      onUpdate?.();
    } catch (error) {
      console.error('Error adding combo override:', error);
      alert('Failed to add combo override');
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteOverride(overrideId: string) {
    if (!confirm('Are you sure you want to delete this combo setting?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('vip_purchase_combo_overrides')
        .delete()
        .eq('id', overrideId);

      if (error) throw error;

      await loadOverrides();
      onUpdate?.();
    } catch (error) {
      console.error('Error deleting combo override:', error);
      alert('Failed to delete combo override');
    }
  }

  const calculatePrice = (multiplier: number, percentage: number) => {
    return vipPrice * (percentage / 100) * multiplier;
  };

  const activeOverrides = overrides.filter(o => o.is_active);
  const inactiveOverrides = overrides.filter(o => !o.is_active);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b bg-gradient-to-r from-purple-50 to-pink-50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                <Zap className="w-7 h-7 mr-2 text-purple-600" />
                Individual Task Combo Settings
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                VIP {vipLevel} - {categoryId} | Current: {currentPosition}/{totalProducts} | VIP Price: ${vipPrice.toFixed(2)}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {!adding && (
            <button
              onClick={() => setAdding(true)}
              className="mb-6 w-full flex items-center justify-center space-x-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-md"
            >
              <Plus className="w-5 h-5" />
              <span className="font-semibold">Add New Combo Position</span>
            </button>
          )}

          {adding && (
            <div className="mb-6 p-6 bg-purple-50 rounded-lg border-2 border-purple-300 shadow-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800 flex items-center">
                  <Settings className="w-5 h-5 mr-2 text-purple-600" />
                  New Combo Configuration
                </h3>
                <button
                  onClick={() => {
                    setAdding(false);
                    setProductPosition(currentPosition + 1);
                    setComboMultiplier(2);
                    setVipPricePercentage(150);
                    setNotes('');
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                    <Hash className="w-4 h-4 mr-1 text-purple-600" />
                    Product Position
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={totalProducts}
                    value={productPosition}
                    onChange={(e) => setProductPosition(parseInt(e.target.value) || 1)}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <p className="mt-1 text-xs text-gray-600">
                    Which product # (1-{totalProducts})
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                    <X className="w-4 h-4 mr-1 text-purple-600" />
                    Price Multiplier
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={comboMultiplier}
                    onChange={(e) => setComboMultiplier(parseInt(e.target.value) || 1)}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <p className="mt-1 text-xs text-gray-600">
                    Multiply final price (1-10x)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                    <Percent className="w-4 h-4 mr-1 text-purple-600" />
                    VIP Price %
                  </label>
                  <input
                    type="number"
                    min="100"
                    max="500"
                    step="10"
                    value={vipPricePercentage}
                    onChange={(e) => setVipPricePercentage(parseInt(e.target.value) || 100)}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <p className="mt-1 text-xs text-gray-600">
                    % of VIP price (100-500%)
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Notes (optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any notes about this combo setting..."
                  rows={2}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200 mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Calculated Price:</p>
                    <p className="text-xs text-gray-600 mt-1">
                      ${vipPrice.toFixed(2)} × {vipPricePercentage}% × {comboMultiplier}x
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-purple-600">
                      ${calculatePrice(comboMultiplier, vipPricePercentage).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleAddOverride}
                disabled={saving}
                className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 font-semibold shadow-md"
              >
                {saving ? 'Saving...' : 'Save Combo Setting'}
              </button>
            </div>
          )}

          <div>
            <h3 className="text-lg font-bold mb-4 text-gray-800 flex items-center">
              <Zap className="w-5 h-5 mr-2 text-green-600" />
              Active Combo Positions ({activeOverrides.length})
            </h3>

            {loading ? (
              <div className="text-center py-8 text-gray-500">Loading...</div>
            ) : activeOverrides.length === 0 ? (
              <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <Zap className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="font-medium">No combo positions configured yet</p>
                <p className="text-sm mt-1">Click "Add New Combo Position" to get started</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {activeOverrides.map((override) => {
                  const isPast = override.product_position < currentPosition;
                  const isCurrent = override.product_position === currentPosition + 1;
                  const isFuture = override.product_position > currentPosition;

                  return (
                    <div
                      key={override.id}
                      className={`p-4 rounded-lg border-2 ${
                        isPast
                          ? 'bg-gray-100 border-gray-300 opacity-60'
                          : isCurrent
                          ? 'bg-yellow-50 border-yellow-400 shadow-lg'
                          : 'bg-green-50 border-green-300'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                            isPast
                              ? 'bg-gray-300 text-gray-600'
                              : isCurrent
                              ? 'bg-yellow-400 text-yellow-900'
                              : 'bg-green-400 text-green-900'
                          }`}>
                            #{override.product_position}
                          </div>
                          <div>
                            <p className="font-bold text-gray-800">Position {override.product_position}</p>
                            <p className="text-xs text-gray-600">
                              {isPast ? 'Completed' : isCurrent ? 'Next Product' : 'Upcoming'}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteOverride(override.id)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                          title="Delete combo"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between bg-white bg-opacity-60 rounded p-2">
                          <span className="text-sm font-medium text-gray-700">Multiplier:</span>
                          <span className="font-bold text-purple-600">{override.combo_multiplier}x</span>
                        </div>
                        <div className="flex items-center justify-between bg-white bg-opacity-60 rounded p-2">
                          <span className="text-sm font-medium text-gray-700">VIP Price %:</span>
                          <span className="font-bold text-blue-600">{override.vip_price_percentage}%</span>
                        </div>
                        <div className="flex items-center justify-between bg-white bg-opacity-60 rounded p-2">
                          <span className="text-sm font-medium text-gray-700">Final Price:</span>
                          <span className="font-bold text-green-600">
                            ${calculatePrice(override.combo_multiplier, override.vip_price_percentage).toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {override.notes && (
                        <div className="mt-3 pt-3 border-t border-gray-300">
                          <p className="text-xs text-gray-600 italic">{override.notes}</p>
                        </div>
                      )}

                      <div className="mt-3 pt-3 border-t border-gray-300 flex items-center text-xs text-gray-500">
                        <Clock className="w-3 h-3 mr-1" />
                        {new Date(override.created_at).toLocaleString()}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {inactiveOverrides.length > 0 && (
              <>
                <h3 className="text-lg font-bold mb-4 text-gray-800 flex items-center mt-6">
                  <Clock className="w-5 h-5 mr-2 text-gray-400" />
                  History ({inactiveOverrides.length})
                </h3>
                <div className="space-y-3">
                  {inactiveOverrides.map((override) => (
                    <div
                      key={override.id}
                      className="p-3 rounded-lg bg-gray-50 border border-gray-200 opacity-60"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-sm font-bold text-gray-600">
                            #{override.product_position}
                          </div>
                          <div className="text-sm">
                            <span className="font-semibold text-gray-700">Position {override.product_position}</span>
                            <span className="mx-2 text-gray-400">|</span>
                            <span className="text-gray-600">{override.combo_multiplier}x multiplier</span>
                            <span className="mx-2 text-gray-400">|</span>
                            <span className="text-gray-600">{override.vip_price_percentage}% VIP price</span>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(override.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}