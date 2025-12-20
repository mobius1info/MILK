import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Image, Plus, Trash2, Edit2, Check, X, MoveUp, MoveDown } from 'lucide-react';
import NotificationModal from '../NotificationModal';

interface Banner {
  id: string;
  image_url: string;
  title: string;
  order_position: number;
  is_active: boolean;
  created_at: string;
}

export default function BannerManagement() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [formData, setFormData] = useState({
    image_url: '',
    title: '',
    is_active: true,
  });
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

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const { data, error } = await supabase
        .from('banners')
        .select('*')
        .order('order_position', { ascending: true });

      if (error) throw error;
      setBanners(data || []);
    } catch (error) {
      console.error('Error fetching banners:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingBanner) {
        const { error } = await supabase
          .from('banners')
          .update({
            image_url: formData.image_url,
            title: formData.title,
            is_active: formData.is_active,
          })
          .eq('id', editingBanner.id);

        if (error) throw error;
      } else {
        const maxOrder = Math.max(...banners.map(b => b.order_position), 0);
        const { error } = await supabase
          .from('banners')
          .insert([{
            image_url: formData.image_url,
            title: formData.title,
            is_active: formData.is_active,
            order_position: maxOrder + 1,
          }]);

        if (error) throw error;
      }

      setShowAddModal(false);
      setEditingBanner(null);
      setFormData({ image_url: '', title: '', is_active: true });
      fetchBanners();
    } catch (error: any) {
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Ошибка',
        message: error.message,
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this banner?')) return;

    try {
      const { error } = await supabase
        .from('banners')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchBanners();
    } catch (error: any) {
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Ошибка',
        message: error.message,
      });
    }
  };

  const handleEdit = (banner: Banner) => {
    setEditingBanner(banner);
    setFormData({
      image_url: banner.image_url,
      title: banner.title,
      is_active: banner.is_active,
    });
    setShowAddModal(true);
  };

  const handleToggleActive = async (banner: Banner) => {
    try {
      const { error } = await supabase
        .from('banners')
        .update({ is_active: !banner.is_active })
        .eq('id', banner.id);

      if (error) throw error;
      fetchBanners();
    } catch (error: any) {
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Ошибка',
        message: error.message,
      });
    }
  };

  const handleMoveUp = async (banner: Banner) => {
    const currentIndex = banners.findIndex(b => b.id === banner.id);
    if (currentIndex === 0) return;

    const previousBanner = banners[currentIndex - 1];

    try {
      await supabase
        .from('banners')
        .update({ order_position: previousBanner.order_position })
        .eq('id', banner.id);

      await supabase
        .from('banners')
        .update({ order_position: banner.order_position })
        .eq('id', previousBanner.id);

      fetchBanners();
    } catch (error: any) {
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Ошибка',
        message: error.message,
      });
    }
  };

  const handleMoveDown = async (banner: Banner) => {
    const currentIndex = banners.findIndex(b => b.id === banner.id);
    if (currentIndex === banners.length - 1) return;

    const nextBanner = banners[currentIndex + 1];

    try {
      await supabase
        .from('banners')
        .update({ order_position: nextBanner.order_position })
        .eq('id', banner.id);

      await supabase
        .from('banners')
        .update({ order_position: banner.order_position })
        .eq('id', nextBanner.id);

      fetchBanners();
    } catch (error: any) {
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Ошибка',
        message: error.message,
      });
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          onClick={() => {
            setEditingBanner(null);
            setFormData({ image_url: '', title: '', is_active: true });
            setShowAddModal(true);
          }}
          className="flex items-center space-x-2 bg-[#f5b04c] text-white px-4 py-2 rounded-lg hover:bg-[#e5a03c] transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Add Banner</span>
        </button>
      </div>

      <div className="grid gap-4">
        {banners.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <Image className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">No banners yet</p>
          </div>
        ) : (
          banners.map((banner, index) => (
            <div
              key={banner.id}
              className="bg-white rounded-lg shadow-md p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4"
            >
              <img
                src={banner.image_url}
                alt={banner.title}
                className="w-full sm:w-48 h-32 object-cover rounded-lg"
              />

              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg text-gray-800 truncate">{banner.title}</h3>
                <p className="text-sm text-gray-600 break-all">{banner.image_url}</p>
                <div className="mt-2 flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Order: {banner.order_position}</span>
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      banner.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {banner.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleMoveUp(banner)}
                  disabled={index === 0}
                  className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Move Up"
                >
                  <MoveUp className="w-4 h-4" />
                </button>

                <button
                  onClick={() => handleMoveDown(banner)}
                  disabled={index === banners.length - 1}
                  className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Move Down"
                >
                  <MoveDown className="w-4 h-4" />
                </button>

                <button
                  onClick={() => handleToggleActive(banner)}
                  className={`p-2 rounded-lg transition-colors ${
                    banner.is_active
                      ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                      : 'bg-green-500 text-white hover:bg-green-600'
                  }`}
                  title={banner.is_active ? 'Deactivate' : 'Activate'}
                >
                  {banner.is_active ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                </button>

                <button
                  onClick={() => handleEdit(banner)}
                  className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  title="Edit"
                >
                  <Edit2 className="w-4 h-4" />
                </button>

                <button
                  onClick={() => handleDelete(banner.id)}
                  className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showAddModal && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => {
              setShowAddModal(false);
              setEditingBanner(null);
            }}
          />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h3 className="text-2xl font-bold mb-4">
                {editingBanner ? 'Edit Banner' : 'Add New Banner'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image URL
                  </label>
                  <input
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f5b04c]"
                    placeholder="https://example.com/image.jpg"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Use Pexels, Unsplash, or any direct image URL
                  </p>
                </div>

                {formData.image_url && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preview
                    </label>
                    <img
                      src={formData.image_url}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-lg"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x400?text=Invalid+URL';
                      }}
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f5b04c]"
                    placeholder="Banner title"
                    required
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4 text-[#f5b04c] border-gray-300 rounded focus:ring-[#f5b04c]"
                  />
                  <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                    Active
                  </label>
                </div>

                <div className="flex space-x-3">
                  <button
                    type="submit"
                    className="flex-1 bg-[#f5b04c] text-white py-2 rounded-lg hover:bg-[#e5a03c] transition-colors"
                  >
                    {editingBanner ? 'Update Banner' : 'Add Banner'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setEditingBanner(null);
                    }}
                    className="flex-1 border border-gray-300 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}

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
