import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import {
  fetchAllEventsAdmin,
  adminCreateEvent,
  adminUpdateEvent,
  adminDeleteEvent,
  type EventInput,
} from '../../lib/adminContent';
import { EVENT_CATEGORY_LABELS, type VillageEvent, type EventCategory } from '../../types';
import AdminFormModal, { FormField, TextInput, TextArea, NumberInput, SelectInput } from './AdminFormModal';
import AdminListingImageField from './AdminListingImageField';

const emptyForm: EventInput = {
  title: '',
  description: '',
  location: '',
  village: '',
  category: 'sosial',
  event_date: '',
  end_date: '',
  sponsors_count: 0,
  image_url: '',
};

interface Props {
  onError: (msg: string | null) => void;
}

export default function AdminEventsTab({ onError }: Props) {
  const [items, setItems] = useState<VillageEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<EventInput>(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const { items: data, error } = await fetchAllEventsAdmin();
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

  const openEdit = (item: VillageEvent) => {
    setEditingId(item.id);
    setForm({
      title: item.title,
      description: item.description,
      location: item.location,
      village: item.village,
      category: item.category,
      event_date: item.event_date,
      end_date: item.end_date ?? '',
      sponsors_count: item.sponsors_count,
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
    const payload = { ...form, end_date: form.end_date || undefined };
    const result = editingId
      ? await adminUpdateEvent(editingId, payload)
      : await adminCreateEvent(payload);
    setSaving(false);
    if (result.error) onError(result.error);
    else {
      setShowForm(false);
      load();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus event ini?')) return;
    const { error } = await adminDeleteEvent(id);
    if (error) onError(error);
    else load();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-gray-400">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        Memuat event...
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button onClick={openCreate} className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold">
          <Plus className="w-4 h-4" />
          Tambah Event
        </button>
      </div>

      {items.length === 0 ? (
        <p className="text-center text-gray-500 py-8">Belum ada event</p>
      ) : (
        <div className="space-y-2">
          {items.map((e) => (
            <div key={e.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <img src={e.image_url} alt={e.title} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{e.title}</p>
                  <p className="text-xs text-gray-500">
                    {EVENT_CATEGORY_LABELS[e.category]} · {e.village} · {e.event_date}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button onClick={() => openEdit(e)} className="text-blue-600 hover:bg-blue-50 p-1.5 rounded">
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(e.id)} className="text-red-600 hover:bg-red-50 p-1.5 rounded">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AdminFormModal
        open={showForm}
        title={editingId ? 'Edit Event' : 'Tambah Event'}
        onClose={() => setShowForm(false)}
        onSubmit={handleSubmit}
        saving={saving}
        submitDisabled={!editingId && !form.image_url.trim()}
        submitLabel={editingId ? 'Simpan Perubahan' : 'Tambah Event'}
      >
        <FormField label="Judul Event">
          <TextInput value={form.title} onChange={(v) => setForm({ ...form, title: v })} />
        </FormField>
        <FormField label="Deskripsi">
          <TextArea value={form.description} onChange={(v) => setForm({ ...form, description: v })} />
        </FormField>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Lokasi">
            <TextInput value={form.location} onChange={(v) => setForm({ ...form, location: v })} />
          </FormField>
          <FormField label="Desa">
            <TextInput value={form.village} onChange={(v) => setForm({ ...form, village: v })} />
          </FormField>
        </div>
        <FormField label="Kategori">
          <SelectInput
            value={form.category}
            onChange={(v) => setForm({ ...form, category: v })}
            options={Object.entries(EVENT_CATEGORY_LABELS).map(([value, label]) => ({
              value: value as EventCategory,
              label,
            }))}
          />
        </FormField>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Tanggal Mulai">
            <TextInput value={form.event_date} onChange={(v) => setForm({ ...form, event_date: v })} type="date" />
          </FormField>
          <FormField label="Tanggal Selesai (opsional)">
            <TextInput value={form.end_date ?? ''} onChange={(v) => setForm({ ...form, end_date: v })} type="date" required={false} />
          </FormField>
        </div>
        <FormField label="Jumlah Sponsor">
          <NumberInput value={form.sponsors_count} onChange={(v) => setForm({ ...form, sponsors_count: v })} />
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
