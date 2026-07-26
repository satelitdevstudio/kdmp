import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import {
  fetchAllProductCategoriesAdmin,
  adminCreateProductCategory,
  adminUpdateProductCategory,
  adminDeleteProductCategory,
  normalizeSlug,
} from '../../lib/productCategories';
import type { ProductCategoryRecord, ProductCategoryInput } from '../../types';
import AdminFormModal, { FormField, TextInput, NumberInput } from './AdminFormModal';
import AdminListingImageField from './AdminListingImageField';

const emptyForm: ProductCategoryInput = {
  slug: '',
  label: '',
  image_url: '',
  is_active: true,
  sort_order: 1,
};

interface Props {
  onError: (msg: string | null) => void;
}

export default function AdminCategoriesTab({ onError }: Props) {
  const [items, setItems] = useState<ProductCategoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductCategoryInput>(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const { items: data, error } = await fetchAllProductCategoriesAdmin();
    setItems(data);
    onError(error);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...emptyForm, sort_order: items.length + 1 });
    setShowForm(true);
  };

  const openEdit = (item: ProductCategoryRecord) => {
    setEditingId(item.id);
    setForm({
      slug: item.slug,
      label: item.label,
      image_url: item.image_url,
      is_active: item.is_active,
      sort_order: item.sort_order,
    });
    setShowForm(true);
  };

  const handleLabelChange = (label: string) => {
    setForm((prev) => ({
      ...prev,
      label,
      slug: editingId ? prev.slug : normalizeSlug(label),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.label.trim()) {
      onError('Nama kategori wajib diisi');
      return;
    }
    if (!form.slug.trim()) {
      onError('Slug kategori wajib diisi');
      return;
    }
    if (!editingId && !form.image_url.trim()) {
      onError('Gambar wajib diunggah.');
      return;
    }
    if (editingId && !form.image_url.trim()) {
      onError('URL gambar wajib diisi');
      return;
    }

    setSaving(true);
    const result = editingId
      ? await adminUpdateProductCategory(editingId, form)
      : await adminCreateProductCategory(form);
    setSaving(false);
    if (result.error) onError(result.error);
    else {
      setShowForm(false);
      onError(null);
      load();
    }
  };

  const handleDelete = async (id: string, label: string) => {
    if (!confirm(`Hapus kategori "${label}"? Produk dengan kategori ini tetap ada.`)) return;
    const { error } = await adminDeleteProductCategory(id);
    if (error) onError(error);
    else load();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-gray-400">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        Memuat kategori produk...
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <p className="text-sm text-gray-500">
          Kelola kategori produk yang tampil di beranda dan halaman produk. Hanya kategori aktif yang
          ditampilkan ke pengunjung.
        </p>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold shrink-0"
        >
          <Plus className="w-4 h-4" />
          Tambah Kategori
        </button>
      </div>

      {items.length === 0 ? (
        <p className="text-center text-gray-500 py-8">Belum ada kategori produk</p>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-16 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200">
                  <img src={item.image_url} alt={item.label} className="w-full h-full object-cover" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-800 truncate">{item.label}</p>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded flex-shrink-0 ${
                        item.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {item.is_active ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Slug: {item.slug} · Urutan: {item.sort_order}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => openEdit(item)}
                  className="text-blue-600 hover:bg-blue-50 p-1.5 rounded"
                  aria-label={`Edit ${item.label}`}
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(item.id, item.label)}
                  className="text-red-600 hover:bg-red-50 p-1.5 rounded"
                  aria-label={`Hapus ${item.label}`}
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
        title={editingId ? 'Edit Kategori Produk' : 'Tambah Kategori Produk'}
        onClose={() => setShowForm(false)}
        onSubmit={handleSubmit}
        saving={saving}
        submitDisabled={!editingId && !form.image_url.trim()}
        submitLabel={editingId ? 'Simpan Perubahan' : 'Tambah Kategori'}
      >
        <FormField label="Nama Kategori">
          <TextInput value={form.label} onChange={handleLabelChange} placeholder="Contoh: Makanan & Minuman" />
        </FormField>
        <FormField label="Slug (URL)">
          <TextInput
            value={form.slug}
            onChange={(v) => setForm({ ...form, slug: normalizeSlug(v) })}
            placeholder="makanan-minuman"
          />
          <p className="text-xs text-gray-400 mt-1">Digunakan di URL: /produk?category=slug</p>
        </FormField>
        <AdminListingImageField
          value={form.image_url}
          onChange={(v) => setForm({ ...form, image_url: v })}
          isEdit={!!editingId}
        />
        {editingId && form.image_url && (
          <div className="rounded-lg overflow-hidden border border-gray-200 bg-gray-50 h-16">
            <img src={form.image_url} alt="Preview" className="w-full h-full object-cover" />
          </div>
        )}
        <FormField label="Urutan Tampil">
          <NumberInput value={form.sort_order} onChange={(v) => setForm({ ...form, sort_order: v })} min={1} />
        </FormField>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={form.is_active}
            onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
            className="rounded"
          />
          Tampilkan ke pengunjung
        </label>
      </AdminFormModal>
    </div>
  );
}
