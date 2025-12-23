import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Crown, Plus, Edit2, Trash2, Save, X, Upload } from 'lucide-react';
import NotificationModal from '../NotificationModal';

interface VIPLevel {
  id: string;
  level: number;
  name: string;
  commission: number;
  commission_percentage: number;
  price: number;
  description: string;
  category: string;
  category_image_url: string;
  products_count: number;
  is_active: boolean;
}

export default function VIPLevelManagement() {
  const [vipLevels, setVipLevels] = useState<VIPLevel[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    isOpen: boolean;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
  }>({
    isOpen: false,
    type: 'info',
    title: '',
    message: '',
  });
  const [formData, setFormData] = useState({
    level: 0,
    name: '',
    commission: 0,
    commission_percentage: 15,
    price: 0,
    description: '',
    category: '',
    category_image_url: '',
    products_count: 25,
    is_active: true
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadVIPLevels();
  }, []);

  async function loadVIPLevels() {
    try {
      await supabase.auth.refreshSession();

      const { data, error } = await supabase
        .from('vip_levels')
        .select('*')
        .order('level');

      if (error) throw error;
      console.log('[Admin] Raw VIP levels from DB:', data);
      const levels = (data || []).map(level => ({
        ...level,
        commission: parseFloat(level.commission) || 0,
        commission_percentage: parseFloat(level.commission_percentage) || 15,
        price: parseFloat(level.price) || 0
      }));
      console.log('[Admin] Processed VIP levels:', levels);
      console.log('[Admin] VIP 1 from DB:', data?.find(l => l.level === 1));
      console.log('[Admin] VIP 1 processed:', levels.find(l => l.level === 1));
      setVipLevels(levels);
    } catch (error) {
      console.error('Error loading VIP levels:', error);
    } finally {
      setLoading(false);
    }
  }

  function startEdit(level: VIPLevel) {
    console.log('[Admin] Starting edit for level:', level);
    console.log('[Admin] Current price from level object:', level.price, typeof level.price);

    setEditingId(level.id);
    const newFormData = {
      level: level.level,
      name: level.name,
      commission: Number(level.commission),
      commission_percentage: Number(level.commission_percentage) || 15,
      price: Number(level.price),
      description: level.description,
      category: level.category,
      category_image_url: level.category_image_url,
      products_count: level.products_count || 25,
      is_active: level.is_active
    };

    console.log('[Admin] Form data set to:', newFormData);
    console.log('[Admin] Form price:', newFormData.price, typeof newFormData.price);

    setFormData(newFormData);
    setImageFile(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setFormData({
      level: 0,
      name: '',
      commission: 0,
      commission_percentage: 15,
      price: 0,
      description: '',
      category: '',
      category_image_url: '',
      products_count: 25,
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
        commission_percentage: formData.commission_percentage,
        price: Number(formData.price),
        description: formData.description,
        category: formData.category.trim(),
        category_image_url: imageUrl,
        products_count: formData.products_count,
        is_active: formData.is_active
      };

      console.log('[Admin] Saving VIP level with ID:', editingId);
      console.log('[Admin] Level data to save:', levelData);
      console.log('[Admin] Price type:', typeof levelData.price, 'Value:', levelData.price);

      if (editingId && editingId !== 'new') {
        console.log('[Admin] Executing UPDATE for id:', editingId);

        // DEBUG: Check JWT and session
        const { data: sessionData } = await supabase.auth.getSession();
        console.log('[Admin] Session user:', sessionData.session?.user);
        console.log('[Admin] Session user role:', sessionData.session?.user?.app_metadata?.role);

        const { data: updateResult, error } = await supabase
          .from('vip_levels')
          .update(levelData)
          .eq('id', editingId)
          .select();

        console.log('[Admin] UPDATE result:', updateResult);
        console.log('[Admin] UPDATE error:', error);

        if (error) throw error;

        console.log('[Admin] VIP level updated successfully');

        // Verify the update
        const { data: verifyData } = await supabase
          .from('vip_levels')
          .select('id, level, price')
          .eq('id', editingId)
          .single();

        console.log('[Admin] Verification - data after update:', verifyData);

        setNotification({
          isOpen: true,
          type: 'success',
          title: 'Success',
          message: 'VIP level updated successfully. Changes will be visible to all users immediately.',
        });
      } else {
        const { error } = await supabase
          .from('vip_levels')
          .insert({
            level: formData.level,
            ...levelData
          });

        if (error) throw error;
        setNotification({
          isOpen: true,
          type: 'success',
          title: 'Success',
          message: 'VIP level created',
        });
      }

      cancelEdit();
      await loadVIPLevels();
    } catch (error: any) {
      console.error('[Admin] Error saving VIP level:', error);
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: error.message,
      });
    } finally {
      setUploading(false);
    }
  }

  async function deleteVIPLevel(id: string) {
    if (!confirm('Delete this VIP level?')) return;

    try {
      const { error } = await supabase
        .from('vip_levels')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setNotification({
        isOpen: true,
        type: 'success',
        title: 'Success',
        message: 'VIP level deleted',
      });
      await loadVIPLevels();
    } catch (error: any) {
      console.error('Error deleting VIP level:', error);
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: error.message,
      });
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
            <h2 className="text-2xl font-bold">VIP Level Management</h2>
            <p className="text-purple-100">Configure commissions and categories for each VIP level</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">VIP Levels</h3>
          <button
            onClick={() => {
              setEditingId('new');
              setFormData({
                level: vipLevels.length + 1,
                name: `VIP ${vipLevels.length + 1}`,
                commission: 0,
                commission_percentage: 15,
                price: 0,
                description: '',
                category: '',
                category_image_url: '',
                products_count: 25,
                is_active: true
              });
              setImageFile(null);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
          >
            <Plus className="w-5 h-5" />
            Add Level
          </button>
        </div>

        {editingId && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
            <h4 className="font-semibold mb-4">
              {editingId === 'new' ? 'Create New VIP Level' : 'Edit VIP Level'}
            </h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Level (number)
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
                  Name
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
                  Total Commission (%)
                </label>
                <input
                  type="number"
                  step="1"
                  value={formData.commission_percentage}
                  onChange={(e) => setFormData({ ...formData, commission_percentage: parseFloat(e.target.value) || 15 })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="15"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Client earns this % of VIP price total (divided by 25 tasks)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="100.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Number of Products (tasks)
                </label>
                <input
                  type="number"
                  value={formData.products_count}
                  onChange={(e) => setFormData({ ...formData, products_count: parseInt(e.target.value) || 25 })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="25"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Basic level"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="">Select category</option>
                  <option value="electronics">Electronics</option>
                  <option value="fashion">Fashion</option>
                  <option value="home">Home & Living</option>
                  <option value="beauty">Beauty</option>
                  <option value="sports">Sports</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category Image
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
                  Active
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
                {uploading ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={cancelEdit}
                className="flex items-center gap-2 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg"
              >
                <X className="w-5 h-5" />
                Cancel
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
                        Inactive
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
                    <div className="flex-1 grid md:grid-cols-4 gap-4">
                      <div className="bg-yellow-50 rounded-lg p-3">
                        <div className="text-sm text-gray-600">Price</div>
                        <div className="text-2xl font-bold text-yellow-600">
                          ${level.price.toFixed(2)}
                        </div>
                      </div>

                      <div className="bg-green-50 rounded-lg p-3">
                        <div className="text-sm text-gray-600">Total Commission</div>
                        <div className="text-2xl font-bold text-green-600">
                          {level.commission_percentage.toFixed(0)}%
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          ${(level.price * level.commission_percentage / 100).toFixed(2)} total
                        </div>
                      </div>

                      <div className="bg-purple-50 rounded-lg p-3">
                        <div className="text-sm text-gray-600">Per Task</div>
                        <div className="text-2xl font-bold text-purple-600">
                          ${((level.price * level.commission_percentage / 100) / level.products_count).toFixed(2)}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {level.products_count} tasks total
                        </div>
                      </div>

                      <div className="bg-blue-50 rounded-lg p-3">
                        <div className="text-sm text-gray-600">Category:</div>
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

      <NotificationModal
        isOpen={notification.isOpen}
        onClose={() => setNotification({ ...notification, isOpen: false })}
        type={notification.type}
        title={notification.title}
        message={notification.message}
      />
    </div>
  );
}
