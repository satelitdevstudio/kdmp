import { supabase, isSupabaseConfigured } from './supabase';
import type { Product, ProductCategory } from '../types';

const STORAGE_KEY = 'argasarihub-seller-products';

export type ProductInput = {
  name: string;
  description: string;
  price: number;
  village: string;
  category: ProductCategory;
  stock: number;
  image_url: string;
};

function loadLocalProducts(sellerId: string): Product[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const all = raw ? (JSON.parse(raw) as Record<string, Product[]>) : {};
    return all[sellerId] ?? [];
  } catch {
    return [];
  }
}

function saveLocalProducts(sellerId: string, products: Product[]) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const all = raw ? (JSON.parse(raw) as Record<string, Product[]>) : {};
    all[sellerId] = products;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch {
    // ignore
  }
}

export function getLocalSellerProducts(): Product[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const all = JSON.parse(raw) as Record<string, Product[]>;
    return Object.values(all).flat();
  } catch {
    return [];
  }
}

export async function fetchSellerProducts(
  sellerId: string
): Promise<{ products: Product[]; error: string | null }> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('seller_id', sellerId)
      .order('created_at', { ascending: false });

    if (error) return { products: [], error: error.message };
    return { products: (data as Product[]) ?? [], error: null };
  }

  return { products: loadLocalProducts(sellerId), error: null };
}

export async function createProduct(
  sellerId: string,
  input: ProductInput
): Promise<{ product: Product | null; error: string | null }> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('products')
      .insert({ ...input, seller_id: sellerId, rating: 0, moderation_status: 'pending' })
      .select()
      .single();

    if (error) return { product: null, error: error.message };
    return { product: data as Product, error: null };
  }

  const product: Product = {
    id: crypto.randomUUID(),
    ...input,
    rating: 0,
    seller_id: sellerId,
    moderation_status: 'pending',
    created_at: new Date().toISOString(),
  };
  const existing = loadLocalProducts(sellerId);
  saveLocalProducts(sellerId, [product, ...existing]);
  return { product, error: null };
}

export async function updateProduct(
  sellerId: string,
  productId: string,
  input: Partial<ProductInput>
): Promise<{ product: Product | null; error: string | null }> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('products')
      .update({ ...input, moderation_status: 'pending', moderation_note: null })
      .eq('id', productId)
      .eq('seller_id', sellerId)
      .select()
      .single();

    if (error) return { product: null, error: error.message };
    return { product: data as Product, error: null };
  }

  const existing = loadLocalProducts(sellerId);
  const index = existing.findIndex((p) => p.id === productId);
  if (index === -1) return { product: null, error: 'Produk tidak ditemukan' };

  const updated = {
    ...existing[index],
    ...input,
    moderation_status: 'pending' as const,
    moderation_note: undefined,
  };
  existing[index] = updated;
  saveLocalProducts(sellerId, existing);
  return { product: updated, error: null };
}

export async function deleteProduct(
  sellerId: string,
  productId: string
): Promise<{ error: string | null }> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId)
      .eq('seller_id', sellerId);

    return { error: error?.message ?? null };
  }

  const existing = loadLocalProducts(sellerId);
  saveLocalProducts(
    sellerId,
    existing.filter((p) => p.id !== productId)
  );
  return { error: null };
}
