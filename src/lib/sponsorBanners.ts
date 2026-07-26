import { supabase, isSupabaseConfigured } from './supabase';
import { mockSponsorBanners } from '../data/mockSponsorBanners';
import type { SponsorBanner, SponsorBannerInput } from '../types';

const STORAGE_KEY = 'argasarihub-sponsor-banners';

function loadLocal(): SponsorBanner[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as SponsorBanner[];
  } catch {
    /* fallback to mock */
  }
  return mockSponsorBanners;
}

function saveLocal(items: SponsorBanner[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function ensureLocal(): SponsorBanner[] {
  const items = loadLocal();
  if (!localStorage.getItem(STORAGE_KEY)) {
    saveLocal(items);
  }
  return items;
}

function sortBanners(items: SponsorBanner[]): SponsorBanner[] {
  return [...items].sort((a, b) => a.sort_order - b.sort_order || a.title.localeCompare(b.title));
}

export async function fetchSponsorBanners(): Promise<{
  items: SponsorBanner[];
  error: string | null;
}> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('sponsor_banners')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) return { items: [], error: error.message };
    return { items: sortBanners((data as SponsorBanner[]) ?? []), error: null };
  }

  return {
    items: sortBanners(loadLocal().filter((b) => b.is_active)),
    error: null,
  };
}

export async function fetchAllSponsorBannersAdmin(): Promise<{
  items: SponsorBanner[];
  error: string | null;
}> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('sponsor_banners')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) return { items: [], error: error.message };
    return { items: sortBanners((data as SponsorBanner[]) ?? []), error: null };
  }

  return { items: sortBanners(ensureLocal()), error: null };
}

export async function adminCreateSponsorBanner(
  input: SponsorBannerInput
): Promise<{ item: SponsorBanner | null; error: string | null }> {
  const payload = {
    ...input,
    link_url: input.link_url.trim() || null,
  };

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('sponsor_banners')
      .insert(payload)
      .select()
      .single();

    if (error) return { item: null, error: error.message };
    return { item: data as SponsorBanner, error: null };
  }

  const item: SponsorBanner = {
    id: crypto.randomUUID(),
    ...input,
    link_url: input.link_url.trim() || undefined,
    created_at: new Date().toISOString(),
  };
  const items = ensureLocal();
  saveLocal([item, ...items]);
  return { item, error: null };
}

export async function adminUpdateSponsorBanner(
  id: string,
  input: Partial<SponsorBannerInput>
): Promise<{ item: SponsorBanner | null; error: string | null }> {
  const payload = {
    ...input,
    ...(input.link_url !== undefined && { link_url: input.link_url.trim() || null }),
  };

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('sponsor_banners')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) return { item: null, error: error.message };
    return { item: data as SponsorBanner, error: null };
  }

  const items = ensureLocal();
  const index = items.findIndex((b) => b.id === id);
  if (index === -1) return { item: null, error: 'Banner sponsor tidak ditemukan' };

  const updated: SponsorBanner = {
    ...items[index],
    ...input,
    link_url: input.link_url === '' ? undefined : (input.link_url ?? items[index].link_url),
  };
  items[index] = updated;
  saveLocal(items);
  return { item: updated, error: null };
}

export async function adminDeleteSponsorBanner(
  id: string
): Promise<{ error: string | null }> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from('sponsor_banners').delete().eq('id', id);
    return { error: error?.message ?? null };
  }

  const items = ensureLocal();
  saveLocal(items.filter((b) => b.id !== id));
  return { error: null };
}
