import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import {
  fetchAllVideosAdmin,
  adminCreateVideo,
  adminUpdateVideo,
  adminDeleteVideo,
  type ChannelVideoInput,
} from '../../lib/adminContent';
import type { ChannelVideo } from '../../types';
import AdminFormModal, { FormField, TextInput, TextArea } from './AdminFormModal';
import AdminListingImageField from './AdminListingImageField';

const emptyForm: ChannelVideoInput = {
  title: '',
  description: '',
  duration: '00:00',
  image_url: '',
  is_live: false,
  viewer_count: undefined,
  video_url: '',
  village: '',
};

interface Props {
  onError: (msg: string | null) => void;
}

export default function AdminVideosTab({ onError }: Props) {
  const [items, setItems] = useState<ChannelVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ChannelVideoInput>(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const { items: data, error } = await fetchAllVideosAdmin();
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

  const openEdit = (item: ChannelVideo) => {
    setEditingId(item.id);
    setForm({
      title: item.title,
      description: item.description,
      duration: item.duration,
      image_url: item.image_url,
      is_live: item.is_live,
      viewer_count: item.viewer_count,
      video_url: item.video_url ?? '',
      village: item.village,
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
    const payload = {
      ...form,
      viewer_count: form.is_live ? form.viewer_count : undefined,
      video_url: form.video_url || undefined,
      duration: form.is_live ? 'LIVE' : form.duration,
    };
    const result = editingId
      ? await adminUpdateVideo(editingId, payload)
      : await adminCreateVideo(payload);
    setSaving(false);
    if (result.error) onError(result.error);
    else {
      setShowForm(false);
      load();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus video ini?')) return;
    const { error } = await adminDeleteVideo(id);
    if (error) onError(error);
    else load();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-gray-400">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        Memuat video...
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button onClick={openCreate} className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold">
          <Plus className="w-4 h-4" />
          Tambah Video
        </button>
      </div>

      {items.length === 0 ? (
        <p className="text-center text-gray-500 py-8">Belum ada video</p>
      ) : (
        <div className="space-y-2">
          {items.map((v) => (
            <div key={v.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <img src={v.image_url} alt={v.title} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{v.title}</p>
                  <p className="text-xs text-gray-500">
                    {v.village} · {v.is_live ? 'LIVE' : v.duration}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button onClick={() => openEdit(v)} className="text-blue-600 hover:bg-blue-50 p-1.5 rounded">
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(v.id)} className="text-red-600 hover:bg-red-50 p-1.5 rounded">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AdminFormModal
        open={showForm}
        title={editingId ? 'Edit Video' : 'Tambah Video'}
        onClose={() => setShowForm(false)}
        onSubmit={handleSubmit}
        saving={saving}
        submitDisabled={!editingId && !form.image_url.trim()}
        submitLabel={editingId ? 'Simpan Perubahan' : 'Tambah Video'}
      >
        <FormField label="Judul Video">
          <TextInput value={form.title} onChange={(v) => setForm({ ...form, title: v })} />
        </FormField>
        <FormField label="Deskripsi">
          <TextArea value={form.description} onChange={(v) => setForm({ ...form, description: v })} />
        </FormField>
        <FormField label="Desa">
          <TextInput value={form.village} onChange={(v) => setForm({ ...form, village: v })} />
        </FormField>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={form.is_live}
            onChange={(e) => setForm({ ...form, is_live: e.target.checked })}
            className="rounded"
          />
          Sedang Live
        </label>
        {form.is_live ? (
          <FormField label="Jumlah Penonton">
            <TextInput
              value={form.viewer_count?.toString() ?? ''}
              onChange={(v) => setForm({ ...form, viewer_count: v ? Number(v) : undefined })}
              type="number"
              required={false}
            />
          </FormField>
        ) : (
          <FormField label="Durasi (contoh: 12:46)">
            <TextInput value={form.duration} onChange={(v) => setForm({ ...form, duration: v })} />
          </FormField>
        )}
        <FormField label="URL Video (opsional)">
          <TextInput value={form.video_url ?? ''} onChange={(v) => setForm({ ...form, video_url: v })} type="url" required={false} placeholder="https://..." />
        </FormField>
        <AdminListingImageField
          label="Thumbnail"
          value={form.image_url}
          onChange={(v) => setForm({ ...form, image_url: v })}
          isEdit={!!editingId}
        />
      </AdminFormModal>
    </div>
  );
}
