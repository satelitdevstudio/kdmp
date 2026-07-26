import { supabase, isSupabaseConfigured } from './supabase';
import type { Kuliner, KulinerCategory } from '../types';

const STORAGE_KEY = 'argasarihub-seller-kuliner';

export type KulinerInput = {
  name: string;
  description: string;
  price: number;
  seller_name: string;
  village: string;
  category: KulinerCategory;
  delivery_time: string;
  is_available: boolean;
  opening_time: string;
  closing_time: string;
  image_url: string;
};

function loadLocalKuliner(sellerId: string): Kuliner[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const all = raw ? (JSON.parse(raw) as Record<string, Kuliner[]>) : {};
    return all[sellerId] ?? [];
  } catch {
    return [];
  }
}

function saveLocalKuliner(sellerId: string, items: Kuliner[]) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const all = raw ? (JSON.parse(raw) as Record<string, Kuliner[]>) : {};
    all[sellerId] = items;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch {
    // ignore
  }
}

export function getLocalSellerKuliner(): Kuliner[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const all = JSON.parse(raw) as Record<string, Kuliner[]>;
    return Object.values(all).flat();
  } catch {
    return [];
  }
}

export async function fetchSellerKuliner(
  sellerId: string
): Promise<{ items: Kuliner[]; error: string | null }> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('kuliner')
      .select('*')
      .eq('seller_id', sellerId)
      .order('created_at', { ascending: false });

    if (error) return { items: [], error: error.message };
    return { items: (data as Kuliner[]) ?? [], error: null };
  }

  return { items: loadLocalKuliner(sellerId), error: null };
}

export async function createKuliner(
  sellerId: string,
  input: KulinerInput
): Promise<{ item: Kuliner | null; error: string | null }> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('kuliner')
      .insert({ ...input, seller_id: sellerId, rating: 0, moderation_status: 'pending' })
      .select()
      .single();

    if (error) return { item: null, error: error.message };
    return { item: data as Kuliner, error: null };
  }

  const item: Kuliner = {
    id: crypto.randomUUID(),
    ...input,
    rating: 0,
    seller_id: sellerId,
    moderation_status: 'pending',
    created_at: new Date().toISOString(),
  };
  const existing = loadLocalKuliner(sellerId);
  saveLocalKuliner(sellerId, [item, ...existing]);
  return { item, error: null };
}

export async function updateKuliner(
  sellerId: string,
  kulinerId: string,
  input: Partial<KulinerInput>
): Promise<{ item: Kuliner | null; error: string | null }> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('kuliner')
      .update({ ...input, moderation_status: 'pending', moderation_note: null })
      .eq('id', kulinerId)
      .eq('seller_id', sellerId)
      .select()
      .single();

    if (error) return { item: null, error: error.message };
    return { item: data as Kuliner, error: null };
  }

  const existing = loadLocalKuliner(sellerId);
  const index = existing.findIndex((k) => k.id === kulinerId);
  if (index === -1) return { item: null, error: 'Kuliner tidak ditemukan' };

  const updated = {
    ...existing[index],
    ...input,
    moderation_status: 'pending' as const,
    moderation_note: undefined,
  };
  existing[index] = updated;
  saveLocalKuliner(sellerId, existing);
  return { item: updated, error: null };
}

export async function deleteKuliner(
  sellerId: string,
  kulinerId: string
): Promise<{ error: string | null }> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase
      .from('kuliner')
      .delete()
      .eq('id', kulinerId)
      .eq('seller_id', sellerId);

    return { error: error?.message ?? null };
  }

  const existing = loadLocalKuliner(sellerId);
  saveLocalKuliner(
    sellerId,
    existing.filter((k) => k.id !== kulinerId)
  );
  return { error: null };
}
