import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { X, Zap, Save, Settings } from 'lucide-react';
import NotificationModal from '../NotificationModal';

interface ComboSettingsModalProps {
  clientId: string;
  clientEmail: string;
  currentStatus: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export default function ComboSettingsModal({ clientId, clientEmail, currentStatus, onClose, onUpdate }: ComboSettingsModalProps) {
  const [comboEnabled, setComboEnabled] = useState(currentStatus);
  const [comboProductPosition, setComboProductPosition] = useState(9);
  const [comboMultiplier, setComboMultiplier] = useState(3);
  const [comboDepositPercent, setComboDepositPercent] = useState(50);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState({
    isOpen: false,
    type: 'success' as 'success' | 'error' | 'warning' | 'info',
    title: '',
    message: ''
  });

  useEffect(() => {
    loadComboSettings();
  }, [clientId]);

  async function loadComboSettings() {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('combo_enabled, combo_product_position, combo_multiplier, combo_deposit_percent')
        .eq('id', clientId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setComboEnabled(data.combo_enabled ?? false);
        setComboProductPosition(data.combo_product_position ?? 9);
        setComboMultiplier(data.combo_multiplier ?? 3);
        setComboDepositPercent(data.combo_deposit_percent ?? 50);
      }
    } catch (error) {
      console.error('Error loading combo settings:', error);
    }
  }

  async function saveSettings() {
    try {
      setSaving(true);

      if (comboEnabled && comboMultiplier < 1) {
        setNotification({
          isOpen: true,
          type: 'error',
          title: 'Error',
          message: 'Multiplier must be at least 1'
        });
        setSaving(false);
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          combo_enabled: comboEnabled,
          combo_product_position: comboProductPosition,
          combo_multiplier: comboMultiplier,
          combo_deposit_percent: comboDepositPercent
        })
        .eq('id', clientId);

      if (error) throw error;

      setNotification({
        isOpen: true,
        type: 'success',
        title: 'Success',
        message: 'COMBO settings saved successfully'
      });

      setTimeout(() => {
        onUpdate();
        onClose();
      }, 1500);
    } catch (error: any) {
      console.error('Error saving combo settings:', error);
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: 'Failed to save settings: ' + error.message
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <div
          className="bg-white rounded-lg shadow-xl max-w-md w-full"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-6 rounded-t-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Zap className="w-8 h-8 text-white" />
                <div>
                  <h2 className="text-xl font-bold text-white">COMBO Settings</h2>
                  <p className="text-sm text-white/90">{clientEmail}</p>
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

          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-semibold text-gray-900">COMBO Status</p>
                <p className="text-sm text-gray-600">Enable or disable COMBO products</p>
              </div>
              <button
                onClick={() => setComboEnabled(!comboEnabled)}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                  comboEnabled ? 'bg-green-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                    comboEnabled ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {comboEnabled && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    COMBO Product Position
                  </label>
                  <select
                    value={comboProductPosition}
                    onChange={(e) => setComboProductPosition(Number(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    {Array.from({ length: 25 }, (_, i) => i + 1).map((num) => (
                      <option key={num} value={num}>
                        Product #{num}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Client will see COMBO on product #{comboProductPosition}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Commission Multiplier (min 1x)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={comboMultiplier}
                    onChange={(e) => setComboMultiplier(Number(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Enter multiplier (min 1)"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    COMBO products will earn {comboMultiplier}x the normal commission
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Required Deposit (5% - 5000% of VIP price)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min="5"
                      max="5000"
                      step="5"
                      value={comboDepositPercent}
                      onChange={(e) => setComboDepositPercent(Number(e.target.value))}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Enter 5-5000"
                    />
                    <span className="text-lg font-bold text-gray-900 w-20 text-right">
                      {comboDepositPercent}%
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Client must deposit {comboDepositPercent}% of VIP price to continue after COMBO.
                    <br />
                    Example: VIP costs $800, client must deposit ${(800 * comboDepositPercent / 100).toFixed(2)} to proceed
                  </p>
                </div>
              </>
            )}
          </div>

          <div className="px-6 pb-6 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={saveSettings}
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-lg hover:from-yellow-500 hover:to-orange-600 transition-colors disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              {saving ? 'Saving...' : 'Save Settings'}
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
