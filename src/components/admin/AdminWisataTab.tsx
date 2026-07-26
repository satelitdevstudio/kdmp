import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import {
  fetchAllWisataAdmin,
  adminCreateWisata,
  adminUpdateWisata,
  adminDeleteWisata,
  type WisataInput,
} from '../../lib/adminContent';
import { formatPrice } from '../../data/mockProducts';
import { WISATA_TYPE_LABELS, type Wisata, type WisataType } from '../../types';
import AdminFormModal, { FormField, TextInput, TextArea, NumberInput, SelectInput } from './AdminFormModal';
import AdminListingImageField from './AdminListingImageField';

const emptyForm: WisataInput = {
  name: '',
  description: '',
  village: '',
  type: 'wisata',
  price: 0,
  price_label: 'tiket masuk',
  phone: '',
  facilities: [],
  image_url: '',
};

interface Props {
  onError: (msg: string | null) => void;
}

export default function AdminWisataTab({ onError }: Props) {
  const [items, setItems] = useState<Wisata[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<WisataInput>(emptyForm);
  const [facilitiesText, setFacilitiesText] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const { items: data, error } = await fetchAllWisataAdmin();
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
    setFacilitiesText('');
    setShowForm(true);
  };

  const openEdit = (item: Wisata) => {
    setEditingId(item.id);
    setForm({
      name: item.name,
      description: item.description,
      village: item.village,
      type: item.type,
      price: item.price,
      price_label: item.price_label,
      phone: item.phone,
      facilities: item.facilities,
      image_url: item.image_url,
    });
    setFacilitiesText(item.facilities.join('\n'));
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId && !form.image_url.trim()) {
      onError('Gambar wajib diunggah.');
      return;
    }
    setSaving(true);
    const payload = {
      ...form,
      facilities: facilitiesText.split('\n').map((s) => s.trim()).filter(Boolean),
    };
    const result = editingId
      ? await adminUpdateWisata(editingId, payload)
      : await adminCreateWisata(payload);
    setSaving(false);
    if (result.error) onError(result.error);
    else {
      setShowForm(false);
      load();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus destinasi ini?')) return;
    const { error } = await adminDeleteWisata(id);
    if (error) onError(error);
    else load();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-gray-400">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        Memuat wisata...
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button onClick={openCreate} className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold">
          <Plus className="w-4 h-4" />
          Tambah Destinasi
        </button>
      </div>

      {items.length === 0 ? (
        <p className="text-center text-gray-500 py-8">Belum ada destinasi</p>
      ) : (
        <div className="space-y-2">
          {items.map((w) => (
            <div key={w.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <img src={w.image_url} alt={w.name} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{w.name}</p>
                  <p className="text-xs text-gray-500">
                    {WISATA_TYPE_LABELS[w.type]} · {w.village} · {formatPrice(w.price)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button onClick={() => openEdit(w)} className="text-blue-600 hover:bg-blue-50 p-1.5 rounded">
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(w.id)} className="text-red-600 hover:bg-red-50 p-1.5 rounded">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AdminFormModal
        open={showForm}
        title={editingId ? 'Edit Destinasi' : 'Tambah Destinasi'}
        onClose={() => setShowForm(false)}
        onSubmit={handleSubmit}
        saving={saving}
        submitDisabled={!editingId && !form.image_url.trim()}
        submitLabel={editingId ? 'Simpan Perubahan' : 'Tambah Destinasi'}
      >
        <FormField label="Nama Destinasi">
          <TextInput value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
        </FormField>
        <FormField label="Deskripsi">
          <TextArea value={form.description} onChange={(v) => setForm({ ...form, description: v })} />
        </FormField>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Desa">
            <TextInput value={form.village} onChange={(v) => setForm({ ...form, village: v })} />
          </FormField>
          <FormField label="Tipe">
            <SelectInput
              value={form.type}
              onChange={(v) => setForm({ ...form, type: v })}
              options={Object.entries(WISATA_TYPE_LABELS).map(([value, label]) => ({
                value: value as WisataType,
                label,
              }))}
            />
          </FormField>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Harga (Rp)">
            <NumberInput value={form.price} onChange={(v) => setForm({ ...form, price: v })} />
          </FormField>
          <FormField label="Label Harga">
            <TextInput value={form.price_label} onChange={(v) => setForm({ ...form, price_label: v })} placeholder="tiket masuk" />
          </FormField>
        </div>
        <FormField label="Fasilitas (satu per baris)">
          <TextArea
            value={facilitiesText}
            onChange={setFacilitiesText}
            rows={3}
            placeholder={'Parkir\nToilet\nWarung makan'}
          />
        </FormField>
        <FormField label="No. Telepon">
          <TextInput value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} type="tel" />
        </FormField>
        <AdminListingImageField
          value={form.image_url}
          onChange={(v) => setForm({ ...form, image_url: v })}
          isEdit={!!editingId}
        />
      </AdminFormModal>
    </div>
  );
}
