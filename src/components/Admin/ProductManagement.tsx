import { useState, useEffect } from 'react';
import { supabase, Product } from '../../lib/supabase';
import { Plus, Upload, Trash2, Edit, Search, Filter, Package } from 'lucide-react';
import NotificationModal from '../NotificationModal';

interface CategoryStats {
  category: string;
  count: number;
  avgPrice: number;
}

interface Category {
  id: string;
  name: string;
  description: string;
  image_url: string;
  is_active: boolean;
}

export default function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryStats, setCategoryStats] = useState<CategoryStats[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
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
    name: '',
    description: '',
    price: '',
    category: '',
    rating: '0',
    reviews: '0',
    vip_level: '0',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, selectedCategory, searchQuery]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, description, image_url, is_active')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(id, name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const productsData = (data || []).map(p => ({
        ...p,
        category: p.category?.name || 'Unknown'
      }));

      setProducts(productsData as any);

      const uniqueCategories = Array.from(new Set(productsData.map(p => p.category)));

      const stats: CategoryStats[] = uniqueCategories.map(cat => {
        const catProducts = productsData.filter(p => p.category === cat);
        return {
          category: cat,
          count: catProducts.length,
          avgPrice: catProducts.reduce((sum, p) => sum + parseFloat(p.price.toString()), 0) / catProducts.length || 0
        };
      });
      setCategoryStats(stats);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = products;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    if (searchQuery) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  };

  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    try {
      let imageUrl = editingProduct?.image_url || '';

      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        category_id: formData.category,
        image_url: imageUrl,
      };

      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('products')
          .insert([productData]);

        if (error) throw error;
      }

      setShowForm(false);
      setEditingProduct(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        category: '',
        rating: '0',
        reviews: '0',
        vip_level: '0',
      });
      setImageFile(null);
      fetchProducts();
    } catch (error: any) {
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: error.message,
      });
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      category: (product as any).category_id || '',
      rating: '0',
      reviews: '0',
      vip_level: '0',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchProducts();
    } catch (error: any) {
      setNotification({
        isOpen: true,
        type: 'error',
        title: 'Error',
        message: error.message,
      });
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div>
      <div className="mb-6 space-y-4">
        <div className="bg-gradient-to-r from-[#f5b04c] to-[#2a5f64] rounded-lg p-6 text-white">
          <div className="flex items-center gap-3">
            <Package className="w-8 h-8" />
            <div>
              <h2 className="text-2xl font-bold">Products by Category</h2>
              <p className="text-white/90 text-sm mt-1">Click on a category to view its products</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSearchQuery('');
            }}
            className={`bg-gradient-to-br rounded-lg p-4 border-2 transition-all text-left hover:shadow-lg ${
              selectedCategory === 'all'
                ? 'from-blue-100 to-cyan-100 border-blue-500 shadow-md'
                : 'from-blue-50 to-cyan-50 border-blue-200 hover:border-blue-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <Package className={`w-5 h-5 ${selectedCategory === 'all' ? 'text-blue-700' : 'text-blue-600'}`} />
              <span className={`text-2xl font-bold ${selectedCategory === 'all' ? 'text-blue-700' : 'text-blue-600'}`}>
                {products.length}
              </span>
            </div>
            <h3 className={`font-semibold ${selectedCategory === 'all' ? 'text-gray-800' : 'text-gray-700'}`}>
              All Products
            </h3>
            <p className="text-xs text-gray-500 mt-1">View all products</p>
          </button>
          {categoryStats.map(stat => (
            <button
              key={stat.category}
              onClick={() => {
                setSelectedCategory(stat.category);
                setSearchQuery('');
              }}
              className={`bg-gradient-to-br rounded-lg p-4 border-2 transition-all text-left hover:shadow-lg ${
                selectedCategory === stat.category
                  ? 'from-blue-100 to-cyan-100 border-blue-500 shadow-md'
                  : 'from-blue-50 to-cyan-50 border-blue-200 hover:border-blue-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <Package className={`w-5 h-5 ${selectedCategory === stat.category ? 'text-blue-700' : 'text-blue-600'}`} />
                <span className={`text-2xl font-bold ${selectedCategory === stat.category ? 'text-blue-700' : 'text-blue-600'}`}>
                  {stat.count}
                </span>
              </div>
              <h3 className={`font-semibold capitalize ${selectedCategory === stat.category ? 'text-gray-800' : 'text-gray-700'}`}>
                {stat.category}
              </h3>
              <p className="text-xs text-gray-500 mt-1">Avg: ${stat.avgPrice.toFixed(2)}</p>
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search products by name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f5b04c]"
            />
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f5b04c] appearance-none bg-white"
              >
                <option value="all">All Categories ({products.length})</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name} ({products.filter(p => p.category === cat.name).length})
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={() => {
                setShowForm(true);
                setEditingProduct(null);
                setFormData({
                  name: '',
                  description: '',
                  price: '',
                  category: '',
                  rating: '0',
                  reviews: '0',
                  vip_level: '0',
                });
              }}
              className="flex items-center justify-center space-x-2 bg-gradient-to-r from-[#f5b04c] to-[#2a5f64] text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all whitespace-nowrap"
            >
              <Plus className="w-5 h-5" />
              <span>Add</span>
            </button>
          </div>
        </div>

        {(selectedCategory !== 'all' || searchQuery) && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2 text-sm font-medium text-blue-800">
                <Filter className="w-4 h-4" />
                <span>
                  {selectedCategory !== 'all' && `Category: ${selectedCategory}`}
                  {selectedCategory !== 'all' && searchQuery && ' • '}
                  {searchQuery && `Search: "${searchQuery}"`}
                </span>
                <span className="px-2 py-0.5 bg-blue-200 rounded-full text-xs font-bold">
                  {filteredProducts.length} found
                </span>
              </div>
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSearchQuery('');
                }}
                className="text-sm text-blue-600 hover:text-blue-700 font-semibold hover:underline"
              >
                Reset filters
              </button>
            </div>
          </div>
        )}
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6">
          <h3 className="text-lg sm:text-xl font-semibold mb-4">
            {editingProduct ? 'Edit Product' : 'Add New Product'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f5b04c]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f5b04c]"
                  required
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                {categories.length === 0 && (
                  <p className="mt-1 text-xs text-orange-600">
                    First create a category in the "Categories" section
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f5b04c]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f5b04c]"
              />
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-800">
                <strong>Commission:</strong> Commission percentage is set at the VIP level in the "Per Task" field.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Image
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#f5b04c] file:text-white hover:file:bg-[#e5a03c]"
                />
                {editingProduct && !imageFile && (
                  <img
                    src={editingProduct.image_url}
                    alt="Current"
                    className="w-16 h-16 object-cover rounded"
                  />
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              <button
                type="submit"
                disabled={uploading}
                className="flex items-center justify-center space-x-2 bg-gradient-to-r from-[#f5b04c] to-[#2a5f64] text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
              >
                <Upload className="w-4 h-4" />
                <span>{uploading ? 'Saving...' : 'Save Product'}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingProduct(null);
                }}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {filteredProducts.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Products not found</h3>
          <p className="text-gray-500">Try changing search parameters or add a new product</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative">
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-48 object-cover"
                />
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-lg flex-1">{product.name}</h3>
                </div>
                <p className="text-gray-600 text-sm mb-2 line-clamp-2">{product.description}</p>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[#f5b04c] font-bold text-lg">${parseFloat(product.price.toString()).toFixed(2)}</span>
                  <span className="text-xs text-gray-500 capitalize px-2 py-1 bg-gray-100 rounded">{product.category}</span>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(product)}
                    className="flex-1 flex items-center justify-center space-x-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    <span className="text-sm">Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="flex-1 flex items-center justify-center space-x-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="text-sm">Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
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
