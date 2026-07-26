import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Loader2, Store, Building2 } from 'lucide-react';
import {
  fetchPlatformProducts,
  fetchSellerProductsAdmin,
  fetchAllProfiles,
  adminCreateProduct,
  adminUpdateProduct,
  adminDeleteProduct,
  type AdminProductInput,
} from '../../lib/admin';
import { formatPrice } from '../../data/mockProducts';
import { getProductCategoryLabel, getModerationStatus, type Product, type ProductCategory } from '../../types';
import { useProductCategories } from '../../hooks/useProductCategories';
import AdminFormModal, { FormField, TextInput, TextArea, NumberInput, SelectInput } from './AdminFormModal';
import ModerationStatusBadge from '../ModerationStatusBadge';
import AdminListingImageField from './AdminListingImageField';

const emptyForm: AdminProductInput = {
  name: '',
  description: '',
  price: 0,
  village: '',
  category: 'makanan-minuman',
  stock: 0,
  image_url: '',
};

type Section = 'koperasi' | 'penjual';

interface Props {
  onError: (msg: string | null) => void;
  onChange?: () => void;
}

export default function AdminProductsTab({ onError, onChange }: Props) {
  const [section, setSection] = useState<Section>('koperasi');
  const { categories: productCategories } = useProductCategories();
  const [platformProducts, setPlatformProducts] = useState<Product[]>([]);
  const [sellerProducts, setSellerProducts] = useState<Product[]>([]);
  const [sellerNames, setSellerNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingSection, setEditingSection] = useState<Section>('koperasi');
  const [form, setForm] = useState<AdminProductInput>(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const [platformRes, sellerRes, profilesRes] = await Promise.all([
      fetchPlatformProducts(),
      fetchSellerProductsAdmin(),
      fetchAllProfiles(),
    ]);

    setPlatformProducts(platformRes.products);
    setSellerProducts(sellerRes.products);

    const names: Record<string, string> = {};
    for (const profile of profilesRes.profiles) {
      names[profile.id] = profile.full_name || 'Penjual';
    }
    setSellerNames(names);

    onError(platformRes.error ?? sellerRes.error ?? profilesRes.error);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setEditingSection('koperasi');
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (product: Product, productSection: Section) => {
    setEditingId(product.id);
    setEditingSection(productSection);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId && !form.image_url.trim()) {
      onError('Gambar wajib diunggah.');
      return;
    }
    setSaving(true);
    const result = editingId
      ? await adminUpdateProduct(editingId, form)
      : await adminCreateProduct(form);
    setSaving(false);
    if (result.error) onError(result.error);
    else {
      setShowForm(false);
      load();
      onChange?.();
    }
  };

  const handleDelete = async (id: string, label: string) => {
    if (!confirm(`Hapus ${label}?`)) return;
    const { error } = await adminDeleteProduct(id);
    if (error) onError(error);
    else {
      load();
      onChange?.();
    }
  };

  const currentProducts = section === 'koperasi' ? platformProducts : sellerProducts;

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setSection('koperasi')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              section === 'koperasi'
                ? 'bg-red-600 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-red-300'
            }`}
          >
            <Building2 className="w-4 h-4" />
            Produk Koperasi ({platformProducts.length})
          </button>
          <button
            type="button"
            onClick={() => setSection('penjual')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              section === 'penjual'
                ? 'bg-red-600 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-red-300'
            }`}
          >
            <Store className="w-4 h-4" />
            Produk Penjual ({sellerProducts.length})
          </button>
        </div>

        {section === 'koperasi' && (
          <button
            onClick={openCreate}
            className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold"
          >
            <Plus className="w-4 h-4" />
            Tambah Produk Koperasi
          </button>
        )}
      </div>

      {section === 'koperasi' && (
        <p className="text-xs text-gray-500 mb-3">
          Produk resmi koperasi/des hub. Dikelola langsung oleh admin, terpisah dari produk UMKM penjual.
        </p>
      )}

      {section === 'penjual' && (
        <p className="text-xs text-gray-500 mb-3">
          Produk dari penjual UMKM. Postingan baru memerlukan persetujuan di tab Moderasi sebelum tampil publik.
        </p>
      )}

      {currentProducts.length === 0 ? (
        <p className="text-center text-gray-500 py-8">
          {section === 'koperasi' ? 'Belum ada produk koperasi' : 'Belum ada produk dari penjual'}
        </p>
      ) : (
        <div className="space-y-2">
          {currentProducts.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <img src={p.image_url} alt={p.name} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium text-gray-800 truncate">{p.name}</p>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded flex-shrink-0 ${
                        section === 'koperasi'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-orange-100 text-orange-700'
                      }`}
                    >
                      {section === 'koperasi' ? 'Koperasi' : 'UMKM'}
                    </span>
                    {section === 'penjual' && (
                      <ModerationStatusBadge
                        status={getModerationStatus(p)}
                        note={p.moderation_note}
                        compact
                      />
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    {p.village} · {getProductCategoryLabel(p.category, productCategories)} · Stok: {p.stock}
                    {section === 'penjual' && p.seller_id && (
                      <> · {sellerNames[p.seller_id] ?? 'Penjual'}</>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <p className="text-sm font-bold text-red-600">{formatPrice(p.price)}</p>
                <button
                  onClick={() => openEdit(p, section)}
                  className="text-blue-600 hover:bg-blue-50 p-1.5 rounded"
                  aria-label={`Edit ${p.name}`}
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(p.id, p.name)}
                  className="text-red-600 hover:bg-red-50 p-1.5 rounded"
                  aria-label={`Hapus ${p.name}`}
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
        title={
          editingId
            ? editingSection === 'koperasi'
              ? 'Edit Produk Koperasi'
              : 'Edit Produk Penjual'
            : 'Tambah Produk Koperasi'
        }
        onClose={() => setShowForm(false)}
        onSubmit={handleSubmit}
        saving={saving}
        submitDisabled={!editingId && !form.image_url.trim()}
        submitLabel={editingId ? 'Simpan Perubahan' : 'Tambah Produk'}
      >
        <FormField label="Nama Produk">
          <TextInput value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
        </FormField>
        <FormField label="Deskripsi">
          <TextArea value={form.description} onChange={(v) => setForm({ ...form, description: v })} />
        </FormField>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Desa">
            <TextInput value={form.village} onChange={(v) => setForm({ ...form, village: v })} />
          </FormField>
          <FormField label="Kategori">
            <SelectInput
              value={form.category}
              onChange={(v) => setForm({ ...form, category: v as ProductCategory })}
              options={productCategories.map((c) => ({
                value: c.slug,
                label: c.label,
              }))}
            />
          </FormField>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Harga (Rp)">
            <NumberInput value={form.price} onChange={(v) => setForm({ ...form, price: v })} />
          </FormField>
          <FormField label="Stok">
            <NumberInput value={form.stock} onChange={(v) => setForm({ ...form, stock: v })} />
          </FormField>
        </div>
        <AdminListingImageField
          value={form.image_url}
          onChange={(v) => setForm({ ...form, image_url: v })}
          isEdit={!!editingId}
        />
      </AdminFormModal>
    </div>
  );
}
