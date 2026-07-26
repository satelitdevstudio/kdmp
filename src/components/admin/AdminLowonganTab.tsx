import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import {
  fetchAllLowonganAdmin,
  adminCreateLowongan,
  adminUpdateLowongan,
  adminDeleteLowongan,
  type LowonganInput,
} from '../../lib/adminContent';
import { EMPLOYMENT_TYPE_LABELS, type EmploymentType, type Lowongan } from '../../types';
import AdminFormModal, { FormField, TextInput, TextArea, SelectInput } from './AdminFormModal';
import AdminListingImageField from './AdminListingImageField';

const emptyForm: LowonganInput = {
  title: '',
  company: '',
  village: '',
  description: '',
  salary_range: '',
  employment_type: 'penuh-waktu',
  requirements: [],
  deadline: '',
  image_url: '',
  contact_phone: '',
};

interface Props {
  onError: (msg: string | null) => void;
}

export default function AdminLowonganTab({ onError }: Props) {
  const [items, setItems] = useState<Lowongan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<LowonganInput>(emptyForm);
  const [requirementsText, setRequirementsText] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const { items: data, error } = await fetchAllLowonganAdmin();
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
    setRequirementsText('');
    setShowForm(true);
  };

  const openEdit = (item: Lowongan) => {
    setEditingId(item.id);
    setForm({
      title: item.title,
      company: item.company,
      village: item.village,
      description: item.description,
      salary_range: item.salary_range,
      employment_type: item.employment_type,
      requirements: item.requirements,
      deadline: item.deadline,
      image_url: item.image_url,
      contact_phone: item.contact_phone,
    });
    setRequirementsText(item.requirements.join('\n'));
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
      requirements: requirementsText.split('\n').map((s) => s.trim()).filter(Boolean),
    };
    const result = editingId
      ? await adminUpdateLowongan(editingId, payload)
      : await adminCreateLowongan(payload);
    setSaving(false);
    if (result.error) onError(result.error);
    else {
      setShowForm(false);
      load();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus lowongan ini?')) return;
    const { error } = await adminDeleteLowongan(id);
    if (error) onError(error);
    else load();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-gray-400">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        Memuat lowongan...
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button onClick={openCreate} className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold">
          <Plus className="w-4 h-4" />
          Tambah Lowongan
        </button>
      </div>

      {items.length === 0 ? (
        <p className="text-center text-gray-500 py-8">Belum ada lowongan</p>
      ) : (
        <div className="space-y-2">
          {items.map((l) => (
            <div key={l.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <img src={l.image_url} alt={l.title} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{l.title}</p>
                  <p className="text-xs text-gray-500">
                    {l.company} · {EMPLOYMENT_TYPE_LABELS[l.employment_type]} · Batas: {l.deadline}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button onClick={() => openEdit(l)} className="text-blue-600 hover:bg-blue-50 p-1.5 rounded">
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(l.id)} className="text-red-600 hover:bg-red-50 p-1.5 rounded">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AdminFormModal
        open={showForm}
        title={editingId ? 'Edit Lowongan' : 'Tambah Lowongan'}
        onClose={() => setShowForm(false)}
        onSubmit={handleSubmit}
        saving={saving}
        submitDisabled={!editingId && !form.image_url.trim()}
        submitLabel={editingId ? 'Simpan Perubahan' : 'Tambah Lowongan'}
      >
        <FormField label="Posisi / Judul">
          <TextInput value={form.title} onChange={(v) => setForm({ ...form, title: v })} />
        </FormField>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Perusahaan / Instansi">
            <TextInput value={form.company} onChange={(v) => setForm({ ...form, company: v })} />
          </FormField>
          <FormField label="Desa">
            <TextInput value={form.village} onChange={(v) => setForm({ ...form, village: v })} />
          </FormField>
        </div>
        <FormField label="Deskripsi">
          <TextArea value={form.description} onChange={(v) => setForm({ ...form, description: v })} />
        </FormField>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Kisaran Gaji">
            <TextInput value={form.salary_range} onChange={(v) => setForm({ ...form, salary_range: v })} placeholder="Rp 2.5 – 3.5 juta/bulan" />
          </FormField>
          <FormField label="Tipe Pekerjaan">
            <SelectInput
              value={form.employment_type}
              onChange={(v) => setForm({ ...form, employment_type: v })}
              options={Object.entries(EMPLOYMENT_TYPE_LABELS).map(([value, label]) => ({
                value: value as EmploymentType,
                label,
              }))}
            />
          </FormField>
        </div>
        <FormField label="Persyaratan (satu per baris)">
          <TextArea
            value={requirementsText}
            onChange={setRequirementsText}
            rows={3}
            placeholder={'Minimal SMA/SMK\nBisa operasional komputer'}
          />
        </FormField>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Batas Lamaran">
            <TextInput value={form.deadline} onChange={(v) => setForm({ ...form, deadline: v })} type="date" />
          </FormField>
          <FormField label="Kontak Telepon">
            <TextInput value={form.contact_phone} onChange={(v) => setForm({ ...form, contact_phone: v })} type="tel" />
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
