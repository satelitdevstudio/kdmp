import { useEffect, useState } from 'react';
import { Pencil, Trash2, Loader2 } from 'lucide-react';
import {
  fetchAllKuliner,
  fetchAllProfiles,
  adminUpdateKuliner,
  adminDeleteKuliner,
  type AdminKulinerInput,
} from '../../lib/admin';
import { formatPrice } from '../../data/mockProducts';
import { getModerationStatus, KULINER_CATEGORY_LABELS, type Kuliner, type KulinerCategory } from '../../types';
import AdminFormModal, { FormField, TextInput, TextArea, NumberInput, SelectInput } from './AdminFormModal';
import StoreStatusBadge from '../StoreStatusBadge';
import ModerationStatusBadge from '../ModerationStatusBadge';
import AdminListingImageField from './AdminListingImageField';

const emptyForm: AdminKulinerInput = {
  name: '',
  description: '',
  price: 0,
  seller_name: '',
  village: '',
  category: 'makanan-berat',
  delivery_time: '30-45 menit',
  is_available: true,
  opening_time: '08:00',
  closing_time: '21:00',
  image_url: '',
};

interface Props {
  onError: (msg: string | null) => void;
  onChange?: () => void;
}

export default function AdminKulinerTab({ onError, onChange }: Props) {
  const [items, setItems] = useState<Kuliner[]>([]);
  const [sellerNames, setSellerNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<AdminKulinerInput>(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const [kulinerRes, profilesRes] = await Promise.all([fetchAllKuliner(), fetchAllProfiles()]);

    setItems(kulinerRes.items.filter((k) => k.seller_id));

    const names: Record<string, string> = {};
    for (const profile of profilesRes.profiles) {
      names[profile.id] = profile.full_name || 'Penjual';
    }
    setSellerNames(names);

    onError(kulinerRes.error ?? profilesRes.error);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const openEdit = (item: Kuliner) => {
    setEditingId(item.id);
    setForm({
      name: item.name,
      description: item.description,
      price: item.price,
      seller_name: item.seller_name,
      village: item.village,
      category: item.category,
      delivery_time: item.delivery_time,
      is_available: item.is_available,
      opening_time: item.opening_time ?? '08:00',
      closing_time: item.closing_time ?? '21:00',
      image_url: item.image_url,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    setSaving(true);
    const result = await adminUpdateKuliner(editingId, form);
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
    const { error } = await adminDeleteKuliner(id);
    if (error) onError(error);
    else {
      load();
      onChange?.();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-gray-400">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        Memuat kuliner...
      </div>
    );
  }

  return (
    <div>
      <p className="text-xs text-gray-500 mb-3">
        Menu kuliner dari penjual UMKM. Postingan baru memerlukan persetujuan di tab Moderasi.
      </p>

      {items.length === 0 ? (
        <p className="text-center text-gray-500 py-8">Belum ada posting kuliner dari penjual</p>
      ) : (
        <div className="space-y-2">
          {items.map((k) => (
            <div
              key={k.id}
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <img src={k.image_url} alt={k.name} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium text-gray-800 truncate">{k.name}</p>
                    <span className="text-[10px] px-1.5 py-0.5 rounded flex-shrink-0 bg-orange-100 text-orange-700">
                      Penjual
                    </span>
                    <ModerationStatusBadge
                      status={getModerationStatus(k)}
                      note={k.moderation_note}
                      compact
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    {k.seller_name} · {k.village}
                    {k.seller_id && <> · {sellerNames[k.seller_id] ?? 'Penjual'}</>}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <StoreStatusBadge
                  openingTime={k.opening_time}
                  closingTime={k.closing_time}
                  isAvailable={k.is_available}
                />
                <span
                  className={`text-xs px-2 py-0.5 rounded ${
                    k.is_available ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {k.is_available ? 'Tersedia' : 'Tidak Tersedia'}
                </span>
                <p className="text-sm font-bold text-red-600">{formatPrice(k.price)}</p>
                <button
                  onClick={() => openEdit(k)}
                  className="text-blue-600 hover:bg-blue-50 p-1.5 rounded"
                  aria-label={`Edit ${k.name}`}
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(k.id, k.name)}
                  className="text-red-600 hover:bg-red-50 p-1.5 rounded"
                  aria-label={`Hapus ${k.name}`}
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
        title="Edit Kuliner Penjual"
        onClose={() => setShowForm(false)}
        onSubmit={handleSubmit}
        saving={saving}
        submitLabel="Simpan Perubahan"
      >
        <FormField label="Nama Menu">
          <TextInput value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
        </FormField>
        <FormField label="Deskripsi">
          <TextArea value={form.description} onChange={(v) => setForm({ ...form, description: v })} />
        </FormField>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Nama Penjual">
            <TextInput value={form.seller_name} onChange={(v) => setForm({ ...form, seller_name: v })} />
          </FormField>
          <FormField label="Desa">
            <TextInput value={form.village} onChange={(v) => setForm({ ...form, village: v })} />
          </FormField>
        </div>
        <FormField label="Kategori">
          <SelectInput
            value={form.category}
            onChange={(v) => setForm({ ...form, category: v as KulinerCategory })}
            options={Object.entries(KULINER_CATEGORY_LABELS).map(([value, label]) => ({
              value: value as KulinerCategory,
              label,
            }))}
          />
        </FormField>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Harga (Rp)">
            <NumberInput value={form.price} onChange={(v) => setForm({ ...form, price: v })} />
          </FormField>
          <FormField label="Estimasi Pengiriman">
            <TextInput
              value={form.delivery_time}
              onChange={(v) => setForm({ ...form, delivery_time: v })}
              placeholder="30-45 menit"
            />
          </FormField>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Jam Buka">
            <TextInput
              value={form.opening_time}
              onChange={(v) => setForm({ ...form, opening_time: v })}
              type="time"
            />
          </FormField>
          <FormField label="Jam Tutup">
            <TextInput
              value={form.closing_time}
              onChange={(v) => setForm({ ...form, closing_time: v })}
              type="time"
            />
          </FormField>
        </div>
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
