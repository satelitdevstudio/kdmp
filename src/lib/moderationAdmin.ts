import { supabase, isSupabaseConfigured } from './supabase';
import type { Kuliner, ModerationStatus, Product } from '../types';

export type ModerationInput = {
  status: ModerationStatus;
  note?: string;
};

const SELLER_PRODUCTS_KEY = 'argasarihub-seller-products';
const SELLER_KULINER_KEY = 'argasarihub-seller-kuliner';

function updateLocalSellerProduct(
  productId: string,
  updates: Partial<Product>
): { product: Product | null; error: string | null } {
  try {
    const raw = localStorage.getItem(SELLER_PRODUCTS_KEY);
    if (!raw) return { product: null, error: 'Produk tidak ditemukan' };

    const all = JSON.parse(raw) as Record<string, Product[]>;
    for (const sellerId of Object.keys(all)) {
      const index = all[sellerId].findIndex((p) => p.id === productId);
      if (index === -1) continue;

      const updated: Product = {
        ...all[sellerId][index],
        ...updates,
        reviewed_at: new Date().toISOString(),
      };
      all[sellerId][index] = updated;
      localStorage.setItem(SELLER_PRODUCTS_KEY, JSON.stringify(all));
      return { product: updated, error: null };
    }
  } catch {
    return { product: null, error: 'Gagal memperbarui moderasi produk' };
  }

  return { product: null, error: 'Produk tidak ditemukan' };
}

function updateLocalSellerKuliner(
  kulinerId: string,
  updates: Partial<Kuliner>
): { item: Kuliner | null; error: string | null } {
  try {
    const raw = localStorage.getItem(SELLER_KULINER_KEY);
    if (!raw) return { item: null, error: 'Kuliner tidak ditemukan' };

    const all = JSON.parse(raw) as Record<string, Kuliner[]>;
    for (const sellerId of Object.keys(all)) {
      const index = all[sellerId].findIndex((k) => k.id === kulinerId);
      if (index === -1) continue;

      const updated: Kuliner = {
        ...all[sellerId][index],
        ...updates,
        reviewed_at: new Date().toISOString(),
      };
      all[sellerId][index] = updated;
      localStorage.setItem(SELLER_KULINER_KEY, JSON.stringify(all));
      return { item: updated, error: null };
    }
  } catch {
    return { item: null, error: 'Gagal memperbarui moderasi kuliner' };
  }

  return { item: null, error: 'Kuliner tidak ditemukan' };
}

export async function fetchPendingSellerListings(): Promise<{
  products: Product[];
  kuliner: Kuliner[];
  error: string | null;
}> {
  if (isSupabaseConfigured && supabase) {
    const [productsRes, kulinerRes] = await Promise.all([
      supabase
        .from('products')
        .select('*')
        .not('seller_id', 'is', null)
        .eq('moderation_status', 'pending')
        .order('created_at', { ascending: false }),
      supabase
        .from('kuliner')
        .select('*')
        .not('seller_id', 'is', null)
        .eq('moderation_status', 'pending')
        .order('created_at', { ascending: false }),
    ]);

    const error = productsRes.error?.message ?? kulinerRes.error?.message ?? null;
    return {
      products: (productsRes.data as Product[]) ?? [],
      kuliner: (kulinerRes.data as Kuliner[]) ?? [],
      error,
    };
  }

  const { getLocalSellerProducts } = await import('./sellerProducts');
  const { getLocalSellerKuliner } = await import('./sellerKuliner');

  const products = getLocalSellerProducts().filter((p) => p.moderation_status === 'pending');
  const kuliner = getLocalSellerKuliner().filter((k) => k.moderation_status === 'pending');

  return { products, kuliner, error: null };
}

export async function countPendingSellerListings(): Promise<number> {
  const { products, kuliner } = await fetchPendingSellerListings();
  return products.length + kuliner.length;
}

export async function moderateProduct(
  productId: string,
  input: ModerationInput
): Promise<{ product: Product | null; error: string | null }> {
  const payload: Partial<Product> = {
    moderation_status: input.status,
    moderation_note: input.status === 'rejected' ? input.note?.trim() || undefined : undefined,
    reviewed_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('products')
      .update({
        moderation_status: input.status,
        moderation_note: input.status === 'rejected' ? input.note?.trim() || null : null,
        reviewed_at: payload.reviewed_at,
      })
      .eq('id', productId)
      .not('seller_id', 'is', null)
      .select()
      .single();

    if (error) return { product: null, error: error.message };
    return { product: data as Product, error: null };
  }

  return updateLocalSellerProduct(productId, payload);
}

export async function moderateKuliner(
  kulinerId: string,
  input: ModerationInput
): Promise<{ item: Kuliner | null; error: string | null }> {
  const payload: Partial<Kuliner> = {
    moderation_status: input.status,
    moderation_note: input.status === 'rejected' ? input.note?.trim() || undefined : undefined,
    reviewed_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('kuliner')
      .update({
        moderation_status: input.status,
        moderation_note: input.status === 'rejected' ? input.note?.trim() || null : null,
        reviewed_at: payload.reviewed_at,
      })
      .eq('id', kulinerId)
      .not('seller_id', 'is', null)
      .select()
      .single();

    if (error) return { item: null, error: error.message };
    return { item: data as Kuliner, error: null };
  }

  return updateLocalSellerKuliner(kulinerId, payload);
}
