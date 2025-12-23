import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { X, Plus, Clock, Trash2, Zap, Hash, Percent, Play } from 'lucide-react';

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

interface ComboActivation {
  id: string;
  start_position: number;
  combo_multiplier: number;
  deposit_percent: number;
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
  const [activations, setActivations] = useState<ComboActivation[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [startPosition, setStartPosition] = useState(currentPosition + 1);
  const [comboMultiplier, setComboMultiplier] = useState(2);
  const [depositPercent, setDepositPercent] = useState(150);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadActivations();
  }, [vipPurchaseId]);

  async function loadActivations() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('vip_combo_activations')
        .select('*')
        .eq('vip_purchase_id', vipPurchaseId)
        .order('start_position', { ascending: true });

      if (error) throw error;

      const activationsWithEmails = await Promise.all(
        (data || []).map(async (activation) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('email')
            .eq('id', activation.created_by)
            .maybeSingle();

          return {
            ...activation,
            creator_email: profile?.email || 'Unknown'
          };
        })
      );

      setActivations(activationsWithEmails);
    } catch (error) {
      console.error('Error loading combo activations:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddActivation() {
    if (startPosition <= currentPosition) {
      alert(`Start position must be greater than current position (${currentPosition})`);
      return;
    }

    if (startPosition > totalProducts) {
      alert(`Start position cannot be greater than total products (${totalProducts})`);
      return;
    }

    try {
      setSaving(true);
      const { data, error } = await supabase.rpc('admin_add_vip_combo_activation', {
        p_vip_purchase_id: vipPurchaseId,
        p_start_position: startPosition,
        p_combo_multiplier: comboMultiplier,
        p_deposit_percent: depositPercent,
        p_notes: notes || null
      });

      if (error) throw error;

      if (data && !data.success) {
        alert(data.error || 'Failed to add combo activation');
        return;
      }

      setAdding(false);
      setStartPosition(currentPosition + 1);
      setComboMultiplier(2);
      setDepositPercent(150);
      setNotes('');
      await loadActivations();
      onUpdate?.();
    } catch (error) {
      console.error('Error adding combo activation:', error);
      alert('Failed to add combo activation');
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteActivation(activationId: string) {
    if (!confirm('Are you sure you want to delete this combo activation?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('vip_combo_activations')
        .delete()
        .eq('id', activationId);

      if (error) throw error;

      await loadActivations();
      onUpdate?.();
    } catch (error) {
      console.error('Error deleting combo activation:', error);
      alert('Failed to delete combo activation');
    }
  }

  const calculatePrice = (multiplier: number, percent: number) => {
    return vipPrice * (percent / 100) * multiplier;
  };

  const activeActivations = activations.filter(a => a.is_active);
  const inactiveActivations = activations.filter(a => !a.is_active);

  const getActivationStatus = (startPos: number) => {
    if (startPos <= currentPosition) return 'past';
    if (startPos === currentPosition + 1) return 'current';
    return 'future';
  };

  const getCurrentActiveCombo = () => {
    return activeActivations
      .filter(a => a.start_position <= currentPosition + 1)
      .sort((a, b) => b.start_position - a.start_position)[0];
  };

  const currentActiveCombo = getCurrentActiveCombo();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b bg-gradient-to-r from-purple-50 to-pink-50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                <Zap className="w-7 h-7 mr-2 text-purple-600" />
                User Combo Settings - Multiple Activations
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
          {currentActiveCombo && (
            <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-400 rounded-lg shadow-md">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                  <Zap className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">ACTIVE COMBO NOW</h3>
                  <p className="text-sm text-gray-600">Started from position {currentActiveCombo.start_position}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 mt-3">
                <div className="bg-white rounded p-3">
                  <p className="text-xs text-gray-600">Multiplier</p>
                  <p className="text-2xl font-bold text-purple-600">{currentActiveCombo.combo_multiplier}x</p>
                </div>
                <div className="bg-white rounded p-3">
                  <p className="text-xs text-gray-600">Deposit %</p>
                  <p className="text-2xl font-bold text-blue-600">{currentActiveCombo.deposit_percent}%</p>
                </div>
                <div className="bg-white rounded p-3">
                  <p className="text-xs text-gray-600">Price</p>
                  <p className="text-2xl font-bold text-green-600">
                    ${calculatePrice(currentActiveCombo.combo_multiplier, currentActiveCombo.deposit_percent).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {!adding && (
            <button
              onClick={() => setAdding(true)}
              className="mb-6 w-full flex items-center justify-center space-x-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-md"
            >
              <Plus className="w-5 h-5" />
              <span className="font-semibold">Add New Combo Activation</span>
            </button>
          )}

          {adding && (
            <div className="mb-6 p-6 bg-purple-50 rounded-lg border-2 border-purple-300 shadow-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800 flex items-center">
                  <Plus className="w-5 h-5 mr-2 text-purple-600" />
                  New Combo Activation
                </h3>
                <button
                  onClick={() => {
                    setAdding(false);
                    setStartPosition(currentPosition + 1);
                    setComboMultiplier(2);
                    setDepositPercent(150);
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
                    <Play className="w-4 h-4 mr-1 text-purple-600" />
                    Start Position
                  </label>
                  <input
                    type="number"
                    min={currentPosition + 1}
                    max={totalProducts}
                    value={startPosition}
                    onChange={(e) => setStartPosition(parseInt(e.target.value) || currentPosition + 1)}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <p className="mt-1 text-xs text-gray-600">
                    From which product # ({currentPosition + 1}-{totalProducts})
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                    <X className="w-4 h-4 mr-1 text-purple-600" />
                    Combo Multiplier
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
                    Price multiplier (1-10x)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                    <Percent className="w-4 h-4 mr-1 text-purple-600" />
                    Deposit %
                  </label>
                  <input
                    type="number"
                    min="100"
                    max="500"
                    step="10"
                    value={depositPercent}
                    onChange={(e) => setDepositPercent(parseInt(e.target.value) || 100)}
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
                  placeholder="Add any notes about this activation..."
                  rows={2}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200 mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Calculated Price:</p>
                    <p className="text-xs text-gray-600 mt-1">
                      ${vipPrice.toFixed(2)} × {depositPercent}% × {comboMultiplier}x
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-purple-600">
                      ${calculatePrice(comboMultiplier, depositPercent).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleAddActivation}
                disabled={saving}
                className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 font-semibold shadow-md"
              >
                {saving ? 'Saving...' : 'Add Combo Activation'}
              </button>
            </div>
          )}

          <div>
            <h3 className="text-lg font-bold mb-4 text-gray-800 flex items-center">
              <Zap className="w-5 h-5 mr-2 text-green-600" />
              Active Combo Activations ({activeActivations.length})
            </h3>

            {loading ? (
              <div className="text-center py-8 text-gray-500">Loading...</div>
            ) : activeActivations.length === 0 ? (
              <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <Zap className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="font-medium">No combo activations yet</p>
                <p className="text-sm mt-1">Click "Add New Combo Activation" to get started</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {activeActivations.map((activation) => {
                  const status = getActivationStatus(activation.start_position);
                  const isActive = activation.start_position <= currentPosition + 1;

                  return (
                    <div
                      key={activation.id}
                      className={`p-4 rounded-lg border-2 ${
                        isActive
                          ? 'bg-green-50 border-green-400 shadow-lg'
                          : 'bg-blue-50 border-blue-300'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                            isActive
                              ? 'bg-green-500 text-white'
                              : 'bg-blue-500 text-white'
                          }`}>
                            #{activation.start_position}
                          </div>
                          <div>
                            <p className="font-bold text-gray-800">From Position {activation.start_position}</p>
                            <p className="text-xs text-gray-600">
                              {isActive ? 'ACTIVE NOW' : 'Will activate'}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteActivation(activation.id)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                          title="Delete activation"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between bg-white bg-opacity-60 rounded p-2">
                          <span className="text-sm font-medium text-gray-700">Multiplier:</span>
                          <span className="font-bold text-purple-600">{activation.combo_multiplier}x</span>
                        </div>
                        <div className="flex items-center justify-between bg-white bg-opacity-60 rounded p-2">
                          <span className="text-sm font-medium text-gray-700">Deposit %:</span>
                          <span className="font-bold text-blue-600">{activation.deposit_percent}%</span>
                        </div>
                        <div className="flex items-center justify-between bg-white bg-opacity-60 rounded p-2">
                          <span className="text-sm font-medium text-gray-700">Price:</span>
                          <span className="font-bold text-green-600">
                            ${calculatePrice(activation.combo_multiplier, activation.deposit_percent).toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {activation.notes && (
                        <div className="mt-3 pt-3 border-t border-gray-300">
                          <p className="text-xs text-gray-600 italic">{activation.notes}</p>
                        </div>
                      )}

                      <div className="mt-3 pt-3 border-t border-gray-300 flex items-center text-xs text-gray-500">
                        <Clock className="w-3 h-3 mr-1" />
                        {new Date(activation.created_at).toLocaleString()}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {inactiveActivations.length > 0 && (
              <>
                <h3 className="text-lg font-bold mb-4 text-gray-800 flex items-center mt-6">
                  <Clock className="w-5 h-5 mr-2 text-gray-400" />
                  History ({inactiveActivations.length})
                </h3>
                <div className="space-y-3">
                  {inactiveActivations.map((activation) => (
                    <div
                      key={activation.id}
                      className="p-3 rounded-lg bg-gray-50 border border-gray-200 opacity-60"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-sm font-bold text-gray-600">
                            #{activation.start_position}
                          </div>
                          <div className="text-sm">
                            <span className="font-semibold text-gray-700">From position {activation.start_position}</span>
                            <span className="mx-2 text-gray-400">|</span>
                            <span className="text-gray-600">{activation.combo_multiplier}x</span>
                            <span className="mx-2 text-gray-400">|</span>
                            <span className="text-gray-600">{activation.deposit_percent}%</span>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(activation.created_at).toLocaleDateString()}
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