import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { X, Zap, Plus, Trash2, Save, Edit2 } from 'lucide-react';
import NotificationModal from '../NotificationModal';

interface VIPComboManagerProps {
  vipPurchaseId: string;
  vipLevel: number;
  category: string;
  totalProducts: number;
  onClose: () => void;
  onUpdate: () => void;
}

interface ComboSetting {
  id: string;
  combo_position: number;
  combo_multiplier: number;
  combo_deposit_percent: number;
  is_completed: boolean;
  created_at: string;
}

export default function VIPComboManager({
  vipPurchaseId,
  vipLevel,
  category,
  totalProducts,
  onClose,
  onUpdate
}: VIPComboManagerProps) {
  const [combos, setCombos] = useState<ComboSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCombo, setEditingCombo] = useState<ComboSetting | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newCombo, setNewCombo] = useState({
    position: 9,
    multiplier: 3,
    depositPercent: 50
  });
  const [notification, setNotification] = useState({
    isOpen: false,
    type: 'success' as 'success' | 'error' | 'warning' | 'info',
    title: '',
    message: ''
  });

  useEffect(() => {
    loadCombos();
  }, [vipPurchaseId]);

  async function loadCombos() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('vip_combo_settings')
        .select('*')
        .eq('vip_purchase_id', vipPurchaseId)
        .order('combo_position', { ascending: true });

      if (error) throw error;
      setCombos(data || []);
    } catch (error) {
      console.error('Error loading combos:', error);
    } finally {
      setLoading(false);
    }
  }

  async function addCombo() {
    try {
      if (newCombo.multiplier < 1 || newCombo.multiplier > 500) {
        setNotification({
          isOpen: true,
          type: 'error',
          title: 'Error',
          message: 'Multiplier must be between 1 and 500'
        });
        return;
      }

      const existingPositions = combos.map(c => c.combo_position);
      if (existingPositions.includes(newCombo.position)) {
        setNotification({
          isOpen: true,
          type: 'error',
          title: 'Error',
          message: `Combo already exists at position ${newCombo.position}`
        });
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('vip_combo_settings')
        .insert({
          vip_purchase_id: vipPurchaseId,
          combo_position: newCombo.position,
          combo_multiplier: newCombo.multiplier,
          combo_deposit_percent: newCombo.depositPercent,
          created_by: user.id
        });

      if (error) throw error;

      setNotification({
        isOpen: true,
        type: 'success',
        title: 'Success',
        message: `Combo added at position ${newCombo.position}`
      });

      setIsAddingNew(false);
      setNewCombo({ position: 9, multiplier: 3, depositPercent: 50 });
      loadCombos();
      onUpdate();
    } catch (error: any) {
      console.error('Error adding combo:', error);
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: error.message || 'Failed to add combo'
      });
    }
  }

  async function updateCombo(comboId: string, updates: Partial<ComboSetting>) {
    try {
      if (updates.combo_multiplier && updates.combo_multiplier < 1) {
        setNotification({
          isOpen: true,
          type: 'error',
          title: 'Error',
          message: 'Multiplier must be at least 1'
        });
        return;
      }

      const { error } = await supabase
        .from('vip_combo_settings')
        .update(updates)
        .eq('id', comboId);

      if (error) throw error;

      setNotification({
        isOpen: true,
        type: 'success',
        title: 'Success',
        message: 'Combo updated successfully'
      });

      setEditingCombo(null);
      loadCombos();
      onUpdate();
    } catch (error: any) {
      console.error('Error updating combo:', error);
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: error.message || 'Failed to update combo'
      });
    }
  }

  async function deleteCombo(comboId: string, position: number) {
    if (!confirm(`Delete combo at position ${position}?`)) return;

    try {
      const { error } = await supabase
        .from('vip_combo_settings')
        .delete()
        .eq('id', comboId);

      if (error) throw error;

      setNotification({
        isOpen: true,
        type: 'success',
        title: 'Success',
        message: 'Combo deleted successfully'
      });

      loadCombos();
      onUpdate();
    } catch (error: any) {
      console.error('Error deleting combo:', error);
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: error.message || 'Failed to delete combo'
      });
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto"
        onClick={onClose}
      >
        <div
          className="bg-white rounded-lg shadow-xl max-w-3xl w-full my-8"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-6 rounded-t-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Zap className="w-8 h-8 text-white" />
                <div>
                  <h2 className="text-xl font-bold text-white">Manage COMBO Settings</h2>
                  <p className="text-sm text-white/90">VIP {vipLevel} - {category}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Total combos: {combos.length} | Available positions: 1-{totalProducts}
              </p>
              <button
                onClick={() => setIsAddingNew(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-lg hover:from-yellow-500 hover:to-orange-600 transition-colors font-medium"
              >
                <Plus className="w-5 h-5" />
                Add Combo
              </button>
            </div>

            {isAddingNew && (
              <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Plus className="w-5 h-5 text-yellow-600" />
                  New Combo
                </h3>
                <div className="grid grid-cols-3 gap-3 mb-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Position
                    </label>
                    <select
                      value={newCombo.position}
                      onChange={(e) => setNewCombo({ ...newCombo, position: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    >
                      {Array.from({ length: totalProducts }, (_, i) => i + 1).map((num) => (
                        <option key={num} value={num} disabled={combos.some(c => c.combo_position === num)}>
                          #{num} {combos.some(c => c.combo_position === num) ? '(Used)' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Multiplier (1x - 500x)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="500"
                      value={newCombo.multiplier}
                      onChange={(e) => setNewCombo({ ...newCombo, multiplier: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                      placeholder="Enter multiplier"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Deposit % (5-5000%)
                    </label>
                    <input
                      type="number"
                      min="5"
                      max="5000"
                      step="5"
                      value={newCombo.depositPercent}
                      onChange={(e) => setNewCombo({ ...newCombo, depositPercent: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsAddingNew(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={addCombo}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    Add Combo
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {combos.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Zap className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>No combos configured yet</p>
                  <p className="text-sm mt-2">Click "Add Combo" to create one</p>
                </div>
              ) : (
                combos.map((combo) => (
                  <div
                    key={combo.id}
                    className={`border-2 rounded-lg p-4 ${
                      combo.is_completed
                        ? 'bg-gray-100 border-gray-300'
                        : 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-400'
                    }`}
                  >
                    {editingCombo?.id === combo.id ? (
                      <div>
                        <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                          <Edit2 className="w-5 h-5 text-blue-600" />
                          Edit Combo at Position {combo.combo_position}
                        </h3>
                        <div className="grid grid-cols-2 gap-3 mb-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Multiplier (1x - 500x)
                            </label>
                            <input
                              type="number"
                              min="1"
                              max="500"
                              value={editingCombo.combo_multiplier}
                              onChange={(e) => setEditingCombo({ ...editingCombo, combo_multiplier: Number(e.target.value) })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                              placeholder="Enter multiplier"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Deposit % (5-5000%)
                            </label>
                            <input
                              type="number"
                              min="5"
                              max="5000"
                              step="5"
                              value={editingCombo.combo_deposit_percent}
                              onChange={(e) => setEditingCombo({ ...editingCombo, combo_deposit_percent: Number(e.target.value) })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditingCombo(null)}
                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => updateCombo(combo.id, {
                              combo_multiplier: editingCombo.combo_multiplier,
                              combo_deposit_percent: editingCombo.combo_deposit_percent
                            })}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                          >
                            <Save className="w-4 h-4" />
                            Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <Zap className={`w-6 h-6 ${combo.is_completed ? 'text-gray-400' : 'text-yellow-600'}`} />
                            <div>
                              <p className="font-bold text-gray-900">
                                Position #{combo.combo_position}
                                {combo.is_completed && (
                                  <span className="ml-2 text-xs bg-gray-500 text-white px-2 py-1 rounded">
                                    COMPLETED
                                  </span>
                                )}
                              </p>
                              <p className="text-sm text-gray-600">
                                Multiplier: {combo.combo_multiplier}x | Deposit: {combo.combo_deposit_percent}%
                              </p>
                            </div>
                          </div>
                          {!combo.is_completed && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => setEditingCombo(combo)}
                                className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                title="Edit"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => deleteCombo(combo.id, combo.combo_position)}
                                className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">
                          Created: {new Date(combo.created_at).toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      <NotificationModal
        isOpen={notification.isOpen}
        onClose={() => setNotification({ ...notification, isOpen: false })}
        type={notification.type}
        title={notification.title}
        message={notification.message}
      />
    </>
  );
}
