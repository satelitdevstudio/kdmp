import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Loader2, ExternalLink } from 'lucide-react';
import {
  fetchAllSponsorBannersAdmin,
  adminCreateSponsorBanner,
  adminUpdateSponsorBanner,
  adminDeleteSponsorBanner,
} from '../../lib/sponsorBanners';
import type { SponsorBanner, SponsorBannerInput } from '../../types';
import AdminFormModal, { FormField, TextInput, NumberInput } from './AdminFormModal';
import AdminListingImageField from './AdminListingImageField';

const emptyForm: SponsorBannerInput = {
  title: '',
  image_url: '',
  link_url: '',
  is_active: true,
  sort_order: 1,
};

interface Props {
  onError: (msg: string | null) => void;
}

export default function AdminSponsorTab({ onError }: Props) {
  const [items, setItems] = useState<SponsorBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<SponsorBannerInput>(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const { items: data, error } = await fetchAllSponsorBannersAdmin();
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

  const openEdit = (item: SponsorBanner) => {
    setEditingId(item.id);
    setForm({
      title: item.title,
      image_url: item.image_url,
      link_url: item.link_url ?? '',
      is_active: item.is_active,
      sort_order: item.sort_order,
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
      ? await adminUpdateSponsorBanner(editingId, form)
      : await adminCreateSponsorBanner(form);
    setSaving(false);
    if (result.error) onError(result.error);
    else {
      setShowForm(false);
      load();
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Hapus banner sponsor "${title}"?`)) return;
    const { error } = await adminDeleteSponsorBanner(id);
    if (error) onError(error);
    else load();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-gray-400">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        Memuat banner sponsor...
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <p className="text-sm text-gray-500">
          Kelola banner sponsor yang tampil di footer situs. Hanya banner aktif yang ditampilkan ke pengunjung.
        </p>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold shrink-0"
        >
          <Plus className="w-4 h-4" />
          Tambah Banner
        </button>
      </div>

      {items.length === 0 ? (
        <p className="text-center text-gray-500 py-8">Belum ada banner sponsor</p>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-24 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200">
                  <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-800 truncate">{item.title}</p>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded flex-shrink-0 ${
                        item.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {item.is_active ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Urutan: {item.sort_order}
                    {item.link_url && (
                      <>
                        {' · '}
                        <a
                          href={item.link_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-red-600 hover:underline inline-flex items-center gap-0.5"
                        >
                          Link <ExternalLink className="w-3 h-3" />
                        </a>
                      </>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => openEdit(item)}
                  className="text-blue-600 hover:bg-blue-50 p-1.5 rounded"
                  aria-label={`Edit ${item.title}`}
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(item.id, item.title)}
                  className="text-red-600 hover:bg-red-50 p-1.5 rounded"
                  aria-label={`Hapus ${item.title}`}
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
        title={editingId ? 'Edit Banner Sponsor' : 'Tambah Banner Sponsor'}
        onClose={() => setShowForm(false)}
        onSubmit={handleSubmit}
        saving={saving}
        submitDisabled={!editingId && !form.image_url.trim()}
        submitLabel={editingId ? 'Simpan Perubahan' : 'Tambah Banner'}
      >
        <FormField label="Nama Sponsor">
          <TextInput value={form.title} onChange={(v) => setForm({ ...form, title: v })} />
        </FormField>
        <AdminListingImageField
          label="Gambar Banner"
          value={form.image_url}
          onChange={(v) => setForm({ ...form, image_url: v })}
          isEdit={!!editingId}
        />
        {editingId && form.image_url && (
          <div className="rounded-lg overflow-hidden border border-gray-200 bg-gray-50 h-16">
            <img src={form.image_url} alt="Preview" className="w-full h-full object-cover" />
          </div>
        )}
        <FormField label="Link Tujuan (opsional)">
          <TextInput
            value={form.link_url}
            onChange={(v) => setForm({ ...form, link_url: v })}
            type="url"
            placeholder="https://..."
          />
        </FormField>
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
          Tampilkan di footer
        </label>
      </AdminFormModal>
    </div>
  );
}
