import { useEffect, useState } from 'react';
import { Loader2, Save, ImageIcon } from 'lucide-react';
import { fetchSiteSettings, adminUpdateSiteSettings } from '../../lib/siteSettings';
import { useSiteSettings } from '../../contexts/SiteSettingsContext';
import type { SiteSettingsInput } from '../../types';
import { FormField, TextInput, TextArea } from './AdminFormModal';
import ImageUploadField from './ImageUploadField';
import AdminAlertPopup, { type AdminAlertType } from './AdminAlertPopup';

interface Props {
  onError: (msg: string | null) => void;
}

type AlertState = {
  open: boolean;
  type: AdminAlertType;
  title: string;
  message: string;
};

const alertClosed: AlertState = { open: false, type: 'success', title: '', message: '' };

export default function AdminTemplateSettingsTab({ onError }: Props) {
  const { updateSettings } = useSiteSettings();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState<AlertState>(alertClosed);
  const [form, setForm] = useState<SiteSettingsInput>({
    site_title: '',
    site_description: '',
    site_tagline: '',
    logo_url: '',
    favicon_url: '',
    hero_background_url: '',
    hero_title: '',
    hero_subtitle: '',
    contact_address: '',
    contact_phone: '',
    contact_email: '',
  });

  const load = async () => {
    setLoading(true);
    const { settings, error } = await fetchSiteSettings();
    setForm({
      site_title: settings.site_title,
      site_description: settings.site_description,
      site_tagline: settings.site_tagline ?? '',
      logo_url: settings.logo_url ?? '',
      favicon_url: settings.favicon_url ?? '',
      hero_background_url: settings.hero_background_url ?? '',
      hero_title: settings.hero_title ?? '',
      hero_subtitle: settings.hero_subtitle ?? '',
      contact_address: settings.contact_address,
      contact_phone: settings.contact_phone ?? '',
      contact_email: settings.contact_email ?? '',
    });
    if (error) {
      setAlert({
        open: true,
        type: 'error',
        title: 'Gagal Memuat',
        message: error,
      });
    }
    onError(error);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const showAlert = (type: AdminAlertType, title: string, message: string) => {
    setAlert({ open: true, type, title, message });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { settings, error } = await adminUpdateSiteSettings(form);
    setSaving(false);
    if (error) {
      onError(error);
      showAlert(
        'error',
        'Gagal Menyimpan',
        error || 'Terjadi kesalahan saat menyimpan pengaturan template. Silakan coba lagi.'
      );
    } else if (settings) {
      updateSettings(settings);
      onError(null);
      showAlert(
        'success',
        'Berhasil Disimpan',
        'Pengaturan template telah disimpan. Perubahan langsung tampil di halaman publik.'
      );
    }
  };

  const set = (field: keyof SiteSettingsInput, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-gray-400">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        Memuat pengaturan template...
      </div>
    );
  }

  return (
    <div>
      <AdminAlertPopup
        open={alert.open}
        type={alert.type}
        title={alert.title}
        message={alert.message}
        onClose={() => setAlert(alertClosed)}
      />

      <p className="text-sm text-gray-500 mb-6">
        Atur tampilan situs: logo, favicon, background hero, judul, deskripsi, dan kontak desa.
        Perubahan langsung tampil di halaman publik setelah disimpan.
      </p>

      <form onSubmit={handleSubmit} className="space-y-8">
        <section className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 space-y-4">
          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-red-600" />
            Identitas Situs
          </h3>

          <FormField label="Judul Situs">
            <TextInput
              value={form.site_title}
              onChange={(v) => set('site_title', v)}
              placeholder="Contoh: Koperasi Merah Putih Desa Sukamaju"
            />
          </FormField>

          <FormField label="Tagline (opsional)">
            <TextInput
              value={form.site_tagline ?? ''}
              onChange={(v) => set('site_tagline', v)}
              required={false}
              placeholder="Contoh: Ekonomi Desa, Kuat Bersama"
            />
          </FormField>

          <FormField label="Deskripsi Situs">
            <TextArea
              value={form.site_description}
              onChange={(v) => set('site_description', v)}
              rows={3}
              placeholder="Deskripsi singkat tentang platform desa..."
            />
          </FormField>
        </section>

        <section className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 space-y-4">
          <h3 className="font-semibold text-gray-800">Logo & Favicon</h3>
          <p className="text-xs text-gray-400 -mt-2">
            Unggah gambar atau masukkan URL. Kosongkan logo untuk menggunakan ikon default.
          </p>

          <ImageUploadField
            label="Logo"
            value={form.logo_url ?? ''}
            onChange={(v) => set('logo_url', v)}
            folder="logo"
            placeholder="https://... atau unggah file"
          />

          <ImageUploadField
            label="Favicon"
            value={form.favicon_url ?? ''}
            onChange={(v) => set('favicon_url', v)}
            folder="favicon"
            placeholder="https://... atau /favicon.ico"
            hint="Ikon kecil di tab browser. Disarankan 32×32 px atau 64×64 px."
          />
        </section>

        <section className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 space-y-4">
          <h3 className="font-semibold text-gray-800">Hero / Background Beranda</h3>

          <ImageUploadField
            label="Background Hero"
            value={form.hero_background_url ?? ''}
            onChange={(v) => set('hero_background_url', v)}
            folder="hero"
            placeholder="/assets/bg-desafx.jpg atau unggah file"
            hint="Gambar latar belakang area hero di halaman beranda."
          />

          <FormField label="Judul Hero">
            <TextInput
              value={form.hero_title ?? ''}
              onChange={(v) => set('hero_title', v)}
              required={false}
              placeholder="Belanja di Desa, Dari Desa, Untuk Desa"
            />
            <p className="text-xs text-gray-400 mt-1">
              Pisahkan dengan koma untuk baris kedua berwarna merah. Contoh: &quot;Belanja di Desa, Dari Desa, Untuk Desa&quot;
            </p>
          </FormField>

          <FormField label="Subjudul Hero">
            <TextArea
              value={form.hero_subtitle ?? ''}
              onChange={(v) => set('hero_subtitle', v)}
              rows={2}
              required={false}
              placeholder="Dukung UMKM lokal, pesan kuliner lezat..."
            />
          </FormField>
        </section>

        <section className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 space-y-4">
          <h3 className="font-semibold text-gray-800">Kontak Desa</h3>

          <FormField label="Alamat Kontak Desa">
            <TextArea
              value={form.contact_address}
              onChange={(v) => set('contact_address', v)}
              rows={2}
              placeholder="Jl. Desa No. 17, Desa Sukamaju, Kec. Makmur..."
            />
          </FormField>

          <div className="grid sm:grid-cols-2 gap-4">
            <FormField label="Telepon">
              <TextInput
                value={form.contact_phone ?? ''}
                onChange={(v) => set('contact_phone', v)}
                required={false}
                placeholder="0812-3456-7890"
              />
            </FormField>

            <FormField label="Email">
              <TextInput
                value={form.contact_email ?? ''}
                onChange={(v) => set('contact_email', v)}
                required={false}
                type="email"
                placeholder="info@desa.id"
              />
            </FormField>
          </div>
        </section>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white px-6 py-2.5 rounded-lg text-sm font-semibold"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Simpan Pengaturan
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
