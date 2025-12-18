import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Crown, Plus, Edit2, Trash2, Save, X } from 'lucide-react';

interface VIPLevel {
  id: string;
  level: number;
  name: string;
  commission: number;
  description: string;
  categories: string[];
  is_active: boolean;
}

export default function VIPLevelManagement() {
  const [vipLevels, setVipLevels] = useState<VIPLevel[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    level: 0,
    name: '',
    commission: 0,
    description: '',
    categories: '',
    is_active: true
  });

  useEffect(() => {
    loadVIPLevels();
  }, []);

  async function loadVIPLevels() {
    try {
      const { data, error } = await supabase
        .from('vip_levels')
        .select('*')
        .order('level');

      if (error) throw error;
      setVipLevels(data || []);
    } catch (error) {
      console.error('Error loading VIP levels:', error);
    } finally {
      setLoading(false);
    }
  }

  function startEdit(level: VIPLevel) {
    setEditingId(level.id);
    setFormData({
      level: level.level,
      name: level.name,
      commission: level.commission,
      description: level.description,
      categories: level.categories.join(', '),
      is_active: level.is_active
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setFormData({
      level: 0,
      name: '',
      commission: 0,
      description: '',
      categories: '',
      is_active: true
    });
  }

  async function saveVIPLevel() {
    try {
      const categoriesArray = formData.categories
        .split(',')
        .map(c => c.trim())
        .filter(c => c.length > 0);

      if (editingId) {
        const { error } = await supabase
          .from('vip_levels')
          .update({
            name: formData.name,
            commission: formData.commission,
            description: formData.description,
            categories: categoriesArray,
            is_active: formData.is_active,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingId);

        if (error) throw error;
        alert('VIP уровень обновлен!');
      } else {
        const { error } = await supabase
          .from('vip_levels')
          .insert({
            level: formData.level,
            name: formData.name,
            commission: formData.commission,
            description: formData.description,
            categories: categoriesArray,
            is_active: formData.is_active
          });

        if (error) throw error;
        alert('VIP уровень создан!');
      }

      cancelEdit();
      loadVIPLevels();
    } catch (error: any) {
      console.error('Error saving VIP level:', error);
      alert('Ошибка: ' + error.message);
    }
  }

  async function deleteVIPLevel(id: string) {
    if (!confirm('Удалить этот VIP уровень?')) return;

    try {
      const { error } = await supabase
        .from('vip_levels')
        .delete()
        .eq('id', id);

      if (error) throw error;
      alert('VIP уровень удален!');
      loadVIPLevels();
    } catch (error: any) {
      console.error('Error deleting VIP level:', error);
      alert('Ошибка: ' + error.message);
    }
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
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-6 text-white">
        <div className="flex items-center gap-3">
          <Crown className="w-8 h-8" />
          <div>
            <h2 className="text-2xl font-bold">Управление VIP Уровнями</h2>
            <p className="text-purple-100">Настройка комиссий и категорий для каждого VIP уровня</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">VIP Уровни</h3>
          <button
            onClick={() => {
              setEditingId('new');
              setFormData({
                level: vipLevels.length + 1,
                name: `VIP ${vipLevels.length + 1}`,
                commission: 0,
                description: '',
                categories: '',
                is_active: true
              });
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
          >
            <Plus className="w-5 h-5" />
            Добавить уровень
          </button>
        </div>

        {editingId && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
            <h4 className="font-semibold mb-4">
              {editingId === 'new' ? 'Создать новый VIP уровень' : 'Редактировать VIP уровень'}
            </h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Уровень (номер)
                </label>
                <input
                  type="number"
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: parseInt(e.target.value) })}
                  disabled={editingId !== 'new'}
                  className="w-full px-3 py-2 border rounded-lg disabled:bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Название
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="VIP 1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Комиссия ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.commission}
                  onChange={(e) => setFormData({ ...formData, commission: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="5.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Описание
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Базовый уровень"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Категории (через запятую)
                </label>
                <input
                  type="text"
                  value={formData.categories}
                  onChange={(e) => setFormData({ ...formData, categories: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="fashion, sports, electronics"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 text-blue-600"
                />
                <label className="ml-2 text-sm font-medium text-gray-700">
                  Активен
                </label>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={saveVIPLevel}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
              >
                <Save className="w-5 h-5" />
                Сохранить
              </button>
              <button
                onClick={cancelEdit}
                className="flex items-center gap-2 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg"
              >
                <X className="w-5 h-5" />
                Отмена
              </button>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {vipLevels.map((level) => (
            <div
              key={level.id}
              className={`p-4 rounded-lg border-2 ${
                level.is_active ? 'border-blue-200 bg-white' : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {level.level}
                    </div>
                    <div>
                      <h4 className="text-lg font-bold">{level.name}</h4>
                      <p className="text-sm text-gray-600">{level.description}</p>
                    </div>
                    {!level.is_active && (
                      <span className="px-2 py-1 bg-gray-200 text-gray-600 rounded text-xs">
                        Неактивен
                      </span>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mt-3">
                    <div className="bg-green-50 rounded-lg p-3">
                      <div className="text-sm text-gray-600">Комиссия с товара</div>
                      <div className="text-2xl font-bold text-green-600">
                        ${level.commission.toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        На 9-м товаре: ${(level.commission * 3).toFixed(2)} (3x)
                      </div>
                    </div>

                    <div>
                      <div className="text-sm font-semibold text-gray-700 mb-2">Категории:</div>
                      <div className="flex flex-wrap gap-1">
                        {level.categories.map((cat) => (
                          <span
                            key={cat}
                            className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs capitalize"
                          >
                            {cat}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => startEdit(level)}
                    className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => deleteVIPLevel(level.id)}
                    className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
