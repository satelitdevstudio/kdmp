import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, Loader2, Package, X } from 'lucide-react';
import {
  fetchSellerProducts,
  updateProduct,
  deleteProduct,
  type ProductInput,
} from '../../lib/sellerProducts';
import { formatPrice } from '../../data/mockProducts';
import { getModerationStatus, type Product, type ProductCategory } from '../../types';
import { useProductCategories } from '../../hooks/useProductCategories';
import ModerationStatusBadge from '../ModerationStatusBadge';

const emptyForm: ProductInput = {
  name: '',
  description: '',
  price: 0,
  village: '',
  category: 'makanan-minuman',
  stock: 0,
  image_url: '',
};

interface Props {
  userId: string;
  onAdd?: () => void;
  reloadTrigger?: number;
}

export default function SellerProductsTab({ userId, onAdd, reloadTrigger = 0 }: Props) {
  const { categories: productCategories } = useProductCategories();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductInput>(emptyForm);
  const [saving, setSaving] = useState(false);

  const loadProducts = async () => {
    setLoading(true);
    const { products: data, error: fetchError } = await fetchSellerProducts(userId);
    setProducts(data);
    setError(fetchError);
    setLoading(false);
  };

  useEffect(() => {
    loadProducts();
  }, [userId, reloadTrigger]);

  const openCreate = () => {
    onAdd?.();
  };

  const openEdit = (product: Product) => {
    setEditingId(product.id);
    setForm({
      name: product.name,
      description: product.description,
      price: product.price,
      village: product.village,
      category: product.category,
      stock: product.stock,
      image_url: product.image_url,
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    if (editingId) {
      const { error: updateError } = await updateProduct(userId, editingId, form);
      if (updateError) setError(updateError);
      else closeForm();
    }

    setSaving(false);
    loadProducts();
  };

  const handleDelete = async (productId: string) => {
    if (!confirm('Hapus produk ini?')) return;
    const { error: deleteError } = await deleteProduct(userId, productId);
    if (deleteError) setError(deleteError);
    else loadProducts();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-gray-400">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        Memuat produk...
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
        >
          <Plus className="w-4 h-4" />
          Tambah Produk
        </button>
      </div>

      {error && (
        <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
          {error}
        </p>
      )}

      {showForm && editingId && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-800">Edit Produk</h2>
              <button onClick={closeForm} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Produk</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                <textarea
                  required
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-red-500 resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Harga (Rp)</label>
                  <input
                    required
                    type="number"
                    min={0}
                    value={form.price || ''}
                    onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stok</label>
                  <input
                    required
                    type="number"
                    min={0}
                    value={form.stock || ''}
                    onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-red-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Desa</label>
                <input
                  required
                  value={form.village}
                  onChange={(e) => setForm({ ...form, village: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value as ProductCategory })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-red-500"
                >
                  {productCategories.map((c) => (
                    <option key={c.slug} value={c.slug}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL Gambar</label>
                <input
                  required
                  type="url"
                  value={form.image_url}
                  onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-red-500"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white py-2.5 rounded-lg text-sm font-semibold"
                >
                  {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
                <button
                  type="button"
                  onClick={closeForm}
                  className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {products.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <Package className="w-8 h-8 text-gray-400 mx-auto mb-4" />
          <p className="font-medium text-gray-800">Belum ada produk</p>
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 mt-6 bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-lg text-sm font-semibold"
          >
            <Plus className="w-4 h-4" />
            Tambah Produk
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
              <div className="h-36 overflow-hidden">
                <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold text-gray-800 text-sm">{product.name}</p>
                  <ModerationStatusBadge
                    status={getModerationStatus(product)}
                    note={product.moderation_note}
                    compact
                  />
                </div>
                <p className="text-red-600 font-bold text-sm mt-1">{formatPrice(product.price)}</p>
                <p className="text-xs text-gray-500 mt-1">Stok: {product.stock}</p>
                {getModerationStatus(product) === 'pending' && (
                  <p className="text-[10px] text-amber-700 mt-2">
                    Postingan menunggu persetujuan admin sebelum tampil di marketplace.
                  </p>
                )}
                {getModerationStatus(product) === 'rejected' && (
                  <p className="text-[10px] text-red-600 mt-2">
                    Perbaiki postingan lalu simpan ulang untuk diajukan review kembali.
                  </p>
                )}
                <div className="flex gap-2 mt-3">
                  {getModerationStatus(product) === 'approved' && (
                    <Link to={`/produk/${product.id}`} className="text-xs text-gray-500 hover:text-red-600">
                      Lihat
                    </Link>
                  )}
                  <button onClick={() => openEdit(product)} className="flex items-center gap-1 text-xs text-blue-600">
                    <Pencil className="w-3 h-3" /> Edit
                  </button>
                  <button onClick={() => handleDelete(product.id)} className="flex items-center gap-1 text-xs text-red-600">
                    <Trash2 className="w-3 h-3" /> Hapus
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
