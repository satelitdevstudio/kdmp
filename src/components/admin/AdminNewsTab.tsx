import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import { fetchAllVillageNewsAdmin, adminDeleteVillageNews } from '../../lib/villageNews';
import { adminCreateVillageNews, adminUpdateVillageNews, type VillageNewsInput } from '../../lib/adminContent';
import { formatNewsDate } from '../../lib/villageNews';
import { VILLAGE_NEWS_CATEGORY_LABELS, type VillageNews, type VillageNewsCategory } from '../../types';
import AdminFormModal, {
  FormField,
  TextInput,
  TextArea,
  SelectInput,
} from './AdminFormModal';
import AdminListingImageField from './AdminListingImageField';

const emptyForm: VillageNewsInput = {
  title: '',
  excerpt: '',
  content: '',
  category: 'berita',
  village: '',
  image_url: '',
  author: 'Admin Desa',
  published: true,
};

interface Props {
  onError: (msg: string | null) => void;
}

export default function AdminNewsTab({ onError }: Props) {
  const [items, setItems] = useState<VillageNews[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<VillageNewsInput>(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const { items: data, error } = await fetchAllVillageNewsAdmin();
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

  const openEdit = (item: VillageNews) => {
    setEditingId(item.id);
    setForm({
      title: item.title,
      excerpt: item.excerpt,
      content: item.content,
      category: item.category,
      village: item.village,
      image_url: item.image_url,
      author: item.author,
      published: item.published,
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
      ? await adminUpdateVillageNews(editingId, form)
      : await adminCreateVillageNews(form);
    setSaving(false);
    if (result.error) onError(result.error);
    else {
      setShowForm(false);
      load();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus artikel ini?')) return;
    const { error } = await adminDeleteVillageNews(id);
    if (error) onError(error);
    else load();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-gray-400">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        Memuat artikel...
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold"
        >
          <Plus className="w-4 h-4" />
          Tambah Artikel
        </button>
      </div>

      {items.length === 0 ? (
        <p className="text-center text-gray-500 py-8">Belum ada artikel</p>
      ) : (
        <div className="space-y-2">
          {items.map((n) => (
            <div key={n.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <img src={n.image_url} alt={n.title} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{n.title}</p>
                  <p className="text-xs text-gray-500">
                    {VILLAGE_NEWS_CATEGORY_LABELS[n.category]} · {n.village} · {formatNewsDate(n.created_at)}
                    {!n.published && ' · Draft'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button onClick={() => openEdit(n)} className="text-blue-600 hover:bg-blue-50 p-1.5 rounded">
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(n.id)} className="text-red-600 hover:bg-red-50 p-1.5 rounded">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AdminFormModal
        open={showForm}
        title={editingId ? 'Edit Artikel' : 'Tambah Artikel'}
        onClose={() => setShowForm(false)}
        onSubmit={handleSubmit}
        saving={saving}
        submitDisabled={!editingId && !form.image_url.trim()}
        submitLabel={editingId ? 'Simpan Perubahan' : 'Tambah Artikel'}
      >
        <FormField label="Judul">
          <TextInput value={form.title} onChange={(v) => setForm({ ...form, title: v })} />
        </FormField>
        <FormField label="Ringkasan">
          <TextArea value={form.excerpt} onChange={(v) => setForm({ ...form, excerpt: v })} rows={2} />
        </FormField>
        <FormField label="Konten">
          <TextArea value={form.content} onChange={(v) => setForm({ ...form, content: v })} rows={4} />
        </FormField>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Kategori">
            <SelectInput
              value={form.category}
              onChange={(v) => setForm({ ...form, category: v })}
              options={Object.entries(VILLAGE_NEWS_CATEGORY_LABELS).map(([value, label]) => ({
                value: value as VillageNewsCategory,
                label,
              }))}
            />
          </FormField>
          <FormField label="Desa">
            <TextInput value={form.village} onChange={(v) => setForm({ ...form, village: v })} />
          </FormField>
        </div>
        <FormField label="Penulis">
          <TextInput value={form.author} onChange={(v) => setForm({ ...form, author: v })} />
        </FormField>
        <AdminListingImageField
          value={form.image_url}
          onChange={(v) => setForm({ ...form, image_url: v })}
          isEdit={!!editingId}
        />
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={form.published}
            onChange={(e) => setForm({ ...form, published: e.target.checked })}
            className="rounded"
          />
          Publikasikan artikel
        </label>
      </AdminFormModal>
    </div>
  );
}
