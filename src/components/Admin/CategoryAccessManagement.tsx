import { useState, useEffect } from 'react';
import { supabase, Profile, CategoryAccess } from '../../lib/supabase';
import { categories } from '../../data/products';
import NotificationModal from '../NotificationModal';

export default function CategoryAccessManagement() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [categoryAccess, setCategoryAccess] = useState<CategoryAccess[]>([]);
  const [loading, setLoading] = useState(false);
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
    fetchUsers();
  }, []);

  useEffect(() => {
    if (selectedUser) {
      fetchCategoryAccess(selectedUser.id);
    }
  }, [selectedUser]);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'client')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchCategoryAccess = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('category_access')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;
      setCategoryAccess(data || []);
    } catch (error) {
      console.error('Error fetching category access:', error);
    }
  };

  const toggleCategoryAccess = async (category: string, isEnabled: boolean) => {
    if (!selectedUser) return;

    setLoading(true);
    try {
      const existing = categoryAccess.find((ca) => ca.category === category);

      if (existing) {
        const { error } = await supabase
          .from('category_access')
          .update({ is_enabled: isEnabled })
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('category_access')
          .insert([
            {
              user_id: selectedUser.id,
              category,
              is_enabled: isEnabled,
              product_limit: 0,
            },
          ]);

        if (error) throw error;
      }

      await fetchCategoryAccess(selectedUser.id);
    } catch (error) {
      console.error('Error toggling category access:', error);
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Ошибка',
        message: 'Не удалось обновить доступ к категории',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateProductLimit = async (category: string, limit: number) => {
    if (!selectedUser) return;

    setLoading(true);
    try {
      const existing = categoryAccess.find((ca) => ca.category === category);

      if (existing) {
        const { error } = await supabase
          .from('category_access')
          .update({ product_limit: limit })
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('category_access')
          .insert([
            {
              user_id: selectedUser.id,
              category,
              is_enabled: false,
              product_limit: limit,
            },
          ]);

        if (error) throw error;
      }

      await fetchCategoryAccess(selectedUser.id);
    } catch (error) {
      console.error('Error updating product limit:', error);
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Ошибка',
        message: 'Не удалось обновить лимит товаров',
      });
    } finally {
      setLoading(false);
    }
  };

  const getCategoryAccess = (category: string) => {
    return categoryAccess.find((ca) => ca.category === category);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1 bg-white rounded-lg shadow-md p-4">
        <h3 className="text-lg font-bold mb-4 text-gray-800">Select User</h3>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {users.map((user) => (
            <button
              key={user.id}
              onClick={() => setSelectedUser(user)}
              className={`w-full text-left p-3 rounded-lg transition-colors ${
                selectedUser?.id === user.id
                  ? 'bg-gradient-to-r from-[#f5b04c] to-[#2a5f64] text-white'
                  : 'bg-gray-50 hover:bg-gray-100'
              }`}
            >
              <div className="font-medium text-sm">{user.email}</div>
              <div className="text-xs opacity-75 mt-1">{user.full_name || 'No name'}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-4">
        <h3 className="text-lg font-bold mb-4 text-gray-800">
          {selectedUser ? `Category Access for ${selectedUser.email}` : 'Select a user to manage access'}
        </h3>

        {selectedUser ? (
          <div className="space-y-4">
            {categories.map((category) => {
              const access = getCategoryAccess(category.id);
              return (
                <div key={category.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-800">{category.name}</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={access?.is_enabled || false}
                        onChange={(e) => toggleCategoryAccess(category.id, e.target.checked)}
                        disabled={loading}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#f5b04c]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-[#f5b04c] peer-checked:to-[#2a5f64]"></div>
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <label className="text-sm text-gray-600 whitespace-nowrap">Product Limit:</label>
                    <input
                      type="number"
                      min="0"
                      value={access?.product_limit || 0}
                      onChange={(e) => updateProductLimit(category.id, parseInt(e.target.value) || 0)}
                      disabled={loading}
                      className="flex-1 px-3 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#f5b04c]"
                      placeholder="0 = unlimited"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    0 means unlimited products. Enter a number to limit visible products.
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <p>Please select a user from the list to manage their category access</p>
          </div>
        )}
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
