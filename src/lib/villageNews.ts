import { supabase, isSupabaseConfigured } from './supabase';
import { mockVillageNews } from '../data/mockVillageNews';
import type { VillageNews, VillageNewsCategory } from '../types';

const STORAGE_KEY = 'argasarihub-village-news';

function loadLocal(): VillageNews[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as VillageNews[];
  } catch {
    /* fallback to mock */
  }
  return mockVillageNews;
}

function saveLocal(items: VillageNews[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export async function fetchVillageNews(options?: {
  category?: VillageNewsCategory | 'all';
  search?: string;
}): Promise<{ items: VillageNews[]; error: string | null }> {
  if (isSupabaseConfigured && supabase) {
    let query = supabase
      .from('village_news')
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: false });

    if (options?.category && options.category !== 'all') {
      query = query.eq('category', options.category);
    }

    const { data, error } = await query;
    if (error) return { items: [], error: error.message };

    let items = (data as VillageNews[]) ?? [];
    if (options?.search) {
      const q = options.search.toLowerCase();
      items = items.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.excerpt.toLowerCase().includes(q) ||
          n.village.toLowerCase().includes(q)
      );
    }
    return { items, error: null };
  }

  let items = loadLocal().filter((n) => n.published);
  if (options?.category && options.category !== 'all') {
    items = items.filter((n) => n.category === options.category);
  }
  if (options?.search) {
    const q = options.search.toLowerCase();
    items = items.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.excerpt.toLowerCase().includes(q) ||
        n.village.toLowerCase().includes(q)
    );
  }
  return { items, error: null };
}

export async function fetchVillageNewsById(
  id: string
): Promise<{ item: VillageNews | null; error: string | null }> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('village_news')
      .select('*')
      .eq('id', id)
      .eq('published', true)
      .single();

    if (error) return { item: null, error: error.message };
    return { item: data as VillageNews, error: null };
  }

  const item = loadLocal().find((n) => n.id === id && n.published) ?? null;
  return { item, error: item ? null : 'Artikel tidak ditemukan' };
}

export async function fetchAllVillageNewsAdmin(): Promise<{
  items: VillageNews[];
  error: string | null;
}> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('village_news')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) return { items: [], error: error.message };
    return { items: (data as VillageNews[]) ?? [], error: null };
  }

  return { items: loadLocal(), error: null };
}

export async function adminDeleteVillageNews(id: string): Promise<{ error: string | null }> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from('village_news').delete().eq('id', id);
    return { error: error?.message ?? null };
  }

  const items = loadLocal().filter((n) => n.id !== id);
  saveLocal(items);
  return { error: null };
}

export function formatNewsDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}
