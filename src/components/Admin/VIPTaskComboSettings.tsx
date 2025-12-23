import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { X, Plus, Settings, Clock, CheckCircle, XCircle } from 'lucide-react';

interface VIPTaskComboSettingsProps {
  vipPurchaseId: string;
  vipLevel: number;
  categoryId: string;
  onClose: () => void;
  onUpdate?: () => void;
}

interface ComboOverride {
  id: string;
  combo_enabled: boolean;
  combo_multiplier: number;
  created_at: string;
  is_active: boolean;
  created_by: string;
  creator_email?: string;
}

export default function VIPTaskComboSettings({ vipPurchaseId, vipLevel, categoryId, onClose, onUpdate }: VIPTaskComboSettingsProps) {
  const [overrides, setOverrides] = useState<ComboOverride[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [comboEnabled, setComboEnabled] = useState(false);
  const [comboMultiplier, setComboMultiplier] = useState(2);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadOverrides();
  }, [vipPurchaseId]);

  async function loadOverrides() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('vip_purchase_combo_overrides')
        .select(`
          id,
          combo_enabled,
          combo_multiplier,
          created_at,
          is_active,
          created_by
        `)
        .eq('vip_purchase_id', vipPurchaseId)
        .order('created_at', { ascending: false });

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
    try {
      setSaving(true);
      const { data, error } = await supabase.rpc('admin_add_vip_combo_override', {
        p_vip_purchase_id: vipPurchaseId,
        p_combo_enabled: comboEnabled,
        p_combo_multiplier: comboMultiplier
      });

      if (error) throw error;

      if (data && !data.success) {
        alert(data.error || 'Failed to add combo override');
        return;
      }

      setAdding(false);
      setComboEnabled(false);
      setComboMultiplier(2);
      await loadOverrides();
      onUpdate?.();
    } catch (error) {
      console.error('Error adding combo override:', error);
      alert('Failed to add combo override');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <Settings className="w-6 h-6 mr-2 text-blue-600" />
              Individual Combo Settings
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              VIP {vipLevel} - {categoryId}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {!adding && (
            <button
              onClick={() => setAdding(true)}
              className="mb-6 w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Add New Combo Settings</span>
            </button>
          )}

          {adding && (
            <div className="mb-6 p-6 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">New Combo Settings</h3>

              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={comboEnabled}
                      onChange={(e) => setComboEnabled(e.target.checked)}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-gray-700 font-medium">Enable Combo</span>
                  </label>
                </div>

                {comboEnabled && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Combo Multiplier
                    </label>
                    <input
                      type="number"
                      min="2"
                      max="10"
                      value={comboMultiplier}
                      onChange={(e) => setComboMultiplier(parseInt(e.target.value) || 2)}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="mt-2 text-sm text-gray-600">
                      Product price will be multiplied by {comboMultiplier}x
                    </p>
                  </div>
                )}

                <div className="flex space-x-3">
                  <button
                    onClick={handleAddOverride}
                    disabled={saving}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save Settings'}
                  </button>
                  <button
                    onClick={() => {
                      setAdding(false);
                      setComboEnabled(false);
                      setComboMultiplier(2);
                    }}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Settings History</h3>

            {loading ? (
              <div className="text-center py-8 text-gray-500">Loading...</div>
            ) : overrides.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No combo settings yet. Add one above to get started.
              </div>
            ) : (
              <div className="space-y-3">
                {overrides.map((override) => (
                  <div
                    key={override.id}
                    className={`p-4 rounded-lg border ${
                      override.is_active
                        ? 'bg-green-50 border-green-200'
                        : 'bg-gray-50 border-gray-200 opacity-60'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          {override.is_active ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : (
                            <XCircle className="w-5 h-5 text-gray-400" />
                          )}
                          <span className={`font-semibold ${
                            override.is_active ? 'text-green-700' : 'text-gray-600'
                          }`}>
                            {override.is_active ? 'Active Settings' : 'Inactive'}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-3">
                          <div>
                            <span className="text-sm text-gray-600">Combo Status:</span>
                            <p className="font-semibold">
                              {override.combo_enabled ? (
                                <span className="text-green-600">Enabled</span>
                              ) : (
                                <span className="text-red-600">Disabled</span>
                              )}
                            </p>
                          </div>
                          <div>
                            <span className="text-sm text-gray-600">Multiplier:</span>
                            <p className="font-semibold text-blue-600">
                              {override.combo_multiplier}x
                            </p>
                          </div>
                        </div>

                        <div className="mt-3 pt-3 border-t border-gray-200 flex items-center text-xs text-gray-500">
                          <Clock className="w-4 h-4 mr-1" />
                          {new Date(override.created_at).toLocaleString()}
                          <span className="mx-2">•</span>
                          By: {override.creator_email}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}