import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Crown, Plus, Edit2, Trash2, Save, X, Upload } from 'lucide-react';

interface VIPLevel {
  id: string;
  level: number;
  name: string;
  commission: number;
  price: number;
  description: string;
  category: string;
  category_image_url: string;
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
    price: 0,
    description: '',
    category: '',
    category_image_url: '',
    is_active: true
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

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
      price: level.price,
      description: level.description,
      category: level.category,
      category_image_url: level.category_image_url,
      is_active: level.is_active
    });
    setImageFile(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setFormData({
      level: 0,
      name: '',
      commission: 0,
      price: 0,
      description: '',
      category: '',
      category_image_url: '',
      is_active: true
    });
    setImageFile(null);
  }

  async function uploadImage(file: File): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `category-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath);

    return data.publicUrl;
  }

  async function saveVIPLevel() {
    try {
      setUploading(true);

      let imageUrl = formData.category_image_url;
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      const levelData = {
        name: formData.name,
        commission: formData.commission,
        price: formData.price,
        description: formData.description,
        category: formData.category.trim(),
        category_image_url: imageUrl,
        is_active: formData.is_active
      };

      if (editingId && editingId !== 'new') {
        const { error } = await supabase
          .from('vip_levels')
          .update({
            ...levelData,
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
            ...levelData
          });

        if (error) throw error;
        alert('VIP уровень создан!');
      }

      cancelEdit();
      loadVIPLevels();
    } catch (error: any) {
      console.error('Error saving VIP level:', error);
      alert('Ошибка: ' + error.message);
    } finally {
      setUploading(false);
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
                price: 0,
                description: '',
                category: '',
                category_image_url: '',
                is_active: true
              });
              setImageFile(null);
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
                  Комиссия (%)
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
                  Цена ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="100.00"
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Категория
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="">Выберите категорию</option>
                  <option value="electronics">Electronics</option>
                  <option value="fashion">Fashion</option>
                  <option value="home">Home & Living</option>
                  <option value="beauty">Beauty</option>
                  <option value="sports">Sports</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Изображение категории
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                />
                {formData.category_image_url && !imageFile && (
                  <img
                    src={formData.category_image_url}
                    alt="Category"
                    className="mt-2 w-24 h-24 object-cover rounded-lg"
                  />
                )}
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
                disabled={uploading}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50"
              >
                <Save className="w-5 h-5" />
                {uploading ? 'Сохранение...' : 'Сохранить'}
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

                  <div className="flex items-center gap-4 mt-3">
                    {level.category_image_url && (
                      <img
                        src={level.category_image_url}
                        alt={level.category}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                    )}
                    <div className="flex-1 grid md:grid-cols-3 gap-4">
                      <div className="bg-yellow-50 rounded-lg p-3">
                        <div className="text-sm text-gray-600">Цена</div>
                        <div className="text-2xl font-bold text-yellow-600">
                          ${level.price.toFixed(2)}
                        </div>
                      </div>

                      <div className="bg-green-50 rounded-lg p-3">
                        <div className="text-sm text-gray-600">Комиссия с товара</div>
                        <div className="text-2xl font-bold text-green-600">
                          {level.commission.toFixed(0)}%
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          На 9-м товаре: {(level.commission * 3).toFixed(0)}% (3x)
                        </div>
                      </div>

                      <div className="bg-blue-50 rounded-lg p-3">
                        <div className="text-sm text-gray-600">Категория:</div>
                        <div className="text-xl font-bold text-blue-800 capitalize">
                          {level.category}
                        </div>
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
