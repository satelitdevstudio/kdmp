import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import {
  fetchAllJasaAdmin,
  adminCreateJasa,
  adminUpdateJasa,
  adminDeleteJasa,
  type JasaInput,
} from '../../lib/adminContent';
import { formatPrice } from '../../data/mockProducts';
import { JASA_CATEGORY_LABELS, type Jasa, type JasaCategory } from '../../types';
import AdminFormModal, { FormField, TextInput, TextArea, NumberInput, SelectInput } from './AdminFormModal';
import AdminListingImageField from './AdminListingImageField';

const emptyForm: JasaInput = {
  name: '',
  description: '',
  provider_name: '',
  village: '',
  category: 'lainnya',
  price: 0,
  price_unit: 'per hari',
  phone: '',
  is_available: true,
  image_url: '',
};

interface Props {
  onError: (msg: string | null) => void;
}

export default function AdminJasaTab({ onError }: Props) {
  const [items, setItems] = useState<Jasa[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<JasaInput>(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const { items: data, error } = await fetchAllJasaAdmin();
    setItems(data);
    onError(error);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (item: Jasa) => {
    setEditingId(item.id);
    setForm({
      name: item.name,
      description: item.description,
      provider_name: item.provider_name,
      village: item.village,
      category: item.category,
      price: item.price,
      price_unit: item.price_unit,
      phone: item.phone,
      is_available: item.is_available,
      image_url: item.image_url,
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
      ? await adminUpdateJasa(editingId, form)
      : await adminCreateJasa(form);
    setSaving(false);
    if (result.error) onError(result.error);
    else {
      setShowForm(false);
      load();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus jasa ini?')) return;
    const { error } = await adminDeleteJasa(id);
    if (error) onError(error);
    else load();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-gray-400">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        Memuat jasa...
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button onClick={openCreate} className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold">
          <Plus className="w-4 h-4" />
          Tambah Jasa
        </button>
      </div>

      {items.length === 0 ? (
        <p className="text-center text-gray-500 py-8">Belum ada jasa</p>
      ) : (
        <div className="space-y-2">
          {items.map((j) => (
            <div key={j.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <img src={j.image_url} alt={j.name} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{j.name}</p>
                  <p className="text-xs text-gray-500">
                    {j.provider_name} · {formatPrice(j.price)}/{j.price_unit}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button onClick={() => openEdit(j)} className="text-blue-600 hover:bg-blue-50 p-1.5 rounded">
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(j.id)} className="text-red-600 hover:bg-red-50 p-1.5 rounded">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AdminFormModal
        open={showForm}
        title={editingId ? 'Edit Jasa' : 'Tambah Jasa'}
        onClose={() => setShowForm(false)}
        onSubmit={handleSubmit}
        saving={saving}
        submitDisabled={!editingId && !form.image_url.trim()}
        submitLabel={editingId ? 'Simpan Perubahan' : 'Tambah Jasa'}
      >
        <FormField label="Nama Jasa">
          <TextInput value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
        </FormField>
        <FormField label="Deskripsi">
          <TextArea value={form.description} onChange={(v) => setForm({ ...form, description: v })} />
        </FormField>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Penyedia">
            <TextInput value={form.provider_name} onChange={(v) => setForm({ ...form, provider_name: v })} />
          </FormField>
          <FormField label="Desa">
            <TextInput value={form.village} onChange={(v) => setForm({ ...form, village: v })} />
          </FormField>
        </div>
        <FormField label="Kategori">
          <SelectInput
            value={form.category}
            onChange={(v) => setForm({ ...form, category: v })}
            options={Object.entries(JASA_CATEGORY_LABELS).map(([value, label]) => ({
              value: value as JasaCategory,
              label,
            }))}
          />
        </FormField>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Harga (Rp)">
            <NumberInput value={form.price} onChange={(v) => setForm({ ...form, price: v })} />
          </FormField>
          <FormField label="Satuan Harga">
            <TextInput value={form.price_unit} onChange={(v) => setForm({ ...form, price_unit: v })} placeholder="per hari" />
          </FormField>
        </div>
        <FormField label="No. Telepon / WhatsApp">
          <TextInput value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} type="tel" />
        </FormField>
        <AdminListingImageField
          value={form.image_url}
          onChange={(v) => setForm({ ...form, image_url: v })}
          isEdit={!!editingId}
        />
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={form.is_available}
            onChange={(e) => setForm({ ...form, is_available: e.target.checked })}
            className="rounded"
          />
          Tersedia untuk dipesan
        </label>
      </AdminFormModal>
    </div>
  );
}
