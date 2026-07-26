import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Loader2, Star } from 'lucide-react';
import {
  fetchAllFeaturedProductsAdmin,
  adminCreateFeaturedProduct,
  adminUpdateFeaturedProduct,
  adminDeleteFeaturedProduct,
} from '../../lib/featuredProducts';
import { fetchAllProducts } from '../../lib/admin';
import { formatPrice } from '../../data/mockProducts';
import type { FeaturedProductWithProduct, FeaturedProductInput, Product } from '../../types';
import { isPlatformProduct, isPublicListing } from '../../types';
import AdminFormModal, { FormField, NumberInput, SelectInput } from './AdminFormModal';

const emptyForm: FeaturedProductInput = {
  product_id: '',
  sort_order: 1,
  is_active: true,
};

interface Props {
  onError: (msg: string | null) => void;
}

export default function AdminFeaturedProductsTab({ onError }: Props) {
  const [items, setItems] = useState<FeaturedProductWithProduct[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FeaturedProductInput>(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const [featuredRes, productsRes] = await Promise.all([
      fetchAllFeaturedProductsAdmin(),
      fetchAllProducts(),
    ]);
    setItems(featuredRes.items);
    setAllProducts(productsRes.products);
    onError(featuredRes.error ?? productsRes.error);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const featuredProductIds = new Set(items.map((i) => i.product_id));

  const availableProducts = allProducts.filter(
    (p) =>
      isPublicListing(p) &&
      (!featuredProductIds.has(p.id) ||
        (editingId && items.find((i) => i.id === editingId)?.product_id === p.id))
  );

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...emptyForm, sort_order: items.length + 1, product_id: availableProducts[0]?.id ?? '' });
    setShowForm(true);
  };

  const openEdit = (item: FeaturedProductWithProduct) => {
    setEditingId(item.id);
    setForm({
      product_id: item.product_id,
      sort_order: item.sort_order,
      is_active: item.is_active,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.product_id) {
      onError('Pilih produk terlebih dahulu');
      return;
    }

    setSaving(true);
    const result = editingId
      ? await adminUpdateFeaturedProduct(editingId, form)
      : await adminCreateFeaturedProduct(form);
    setSaving(false);
    if (result.error) onError(result.error);
    else {
      setShowForm(false);
      onError(null);
      load();
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Hapus "${name}" dari Produk Pilihan?`)) return;
    const { error } = await adminDeleteFeaturedProduct(id);
    if (error) onError(error);
    else load();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-gray-400">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        Memuat produk pilihan...
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <p className="text-sm text-gray-500">
          Atur produk yang tampil di bagian &quot;Produk Pilihan&quot; pada halaman beranda. Hanya
          produk aktif yang ditampilkan ke pengunjung.
        </p>
        <button
          onClick={openCreate}
          disabled={availableProducts.length === 0 && !editingId}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-semibold shrink-0"
        >
          <Plus className="w-4 h-4" />
          Tambah Produk Pilihan
        </button>
      </div>

      {items.length === 0 ? (
        <p className="text-center text-gray-500 py-8">Belum ada produk pilihan</p>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-16 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200">
                  <img
                    src={item.product.image_url}
                    alt={item.product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 flex-shrink-0" />
                    <p className="text-sm font-medium text-gray-800 truncate">{item.product.name}</p>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded flex-shrink-0 ${
                        item.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {item.is_active ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {formatPrice(item.product.price)} · {item.product.village} · Urutan:{' '}
                    {item.sort_order}
                    {isPlatformProduct(item.product) ? ' · Koperasi' : ' · UMKM'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => openEdit(item)}
                  className="text-blue-600 hover:bg-blue-50 p-1.5 rounded"
                  aria-label={`Edit ${item.product.name}`}
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(item.id, item.product.name)}
                  className="text-red-600 hover:bg-red-50 p-1.5 rounded"
                  aria-label={`Hapus ${item.product.name}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AdminFormModal
        open={showForm}
        title={editingId ? 'Edit Produk Pilihan' : 'Tambah Produk Pilihan'}
        onClose={() => setShowForm(false)}
        onSubmit={handleSubmit}
        saving={saving}
        submitLabel={editingId ? 'Simpan Perubahan' : 'Tambah'}
      >
        <FormField label="Produk">
          <SelectInput
            value={form.product_id}
            onChange={(v) => setForm({ ...form, product_id: v })}
            options={availableProducts.map((p) => ({
              value: p.id,
              label: `${p.name} (${formatPrice(p.price)})`,
            }))}
          />
        </FormField>
        <FormField label="Urutan Tampil">
          <NumberInput
            value={form.sort_order}
            onChange={(v) => setForm({ ...form, sort_order: v })}
            min={1}
          />
        </FormField>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={form.is_active}
            onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
            className="rounded"
          />
          Tampilkan di beranda
        </label>
      </AdminFormModal>
    </div>
  );
}
