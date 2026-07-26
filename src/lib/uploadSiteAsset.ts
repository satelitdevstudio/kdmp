import { supabase, isSupabaseConfigured } from './supabase';

const MAX_SIZE = 2 * 1024 * 1024; // 2 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml', 'image/x-icon', 'image/vnd.microsoft.icon'];

export type SiteAssetFolder = 'logo' | 'favicon' | 'hero';

export async function uploadSiteAsset(
  file: File,
  folder: SiteAssetFolder
): Promise<{ url: string | null; error: string | null }> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { url: null, error: 'Format tidak didukung. Gunakan JPG, PNG, WebP, GIF, SVG, atau ICO.' };
  }
  if (file.size > MAX_SIZE) {
    return { url: null, error: 'Ukuran file maksimal 2 MB.' };
  }

  if (isSupabaseConfigured && supabase) {
    const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
    const path = `${folder}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('site-assets').upload(path, file, {
      cacheControl: '3600',
      upsert: true,
    });
    if (error) return { url: null, error: error.message };
    const { data } = supabase.storage.from('site-assets').getPublicUrl(path);
    return { url: data.publicUrl, error: null };
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve({ url: reader.result as string, error: null });
    reader.onerror = () => resolve({ url: null, error: 'Gagal membaca file.' });
    reader.readAsDataURL(file);
  });
}
