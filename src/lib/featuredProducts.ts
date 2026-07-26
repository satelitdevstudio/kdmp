import { supabase, isSupabaseConfigured } from './supabase';
import { mockFeaturedProducts } from '../data/mockFeaturedProducts';
import { mockProducts } from '../data/mockProducts';
import { getLocalAdminProducts } from './admin';
import { getLocalSellerProducts } from './sellerProducts';
import type {
  FeaturedProductRecord,
  FeaturedProductInput,
  FeaturedProductWithProduct,
  Product,
} from '../types';
import { isPublicListing } from '../types';

const STORAGE_KEY = 'argasarihub-featured-products';

function loadLocal(): FeaturedProductRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as FeaturedProductRecord[];
  } catch {
    /* fallback to mock */
  }
  return mockFeaturedProducts;
}

function saveLocal(items: FeaturedProductRecord[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function ensureLocal(): FeaturedProductRecord[] {
  const items = loadLocal();
  if (!localStorage.getItem(STORAGE_KEY)) {
    saveLocal(items);
  }
  return items;
}

function sortFeatured(items: FeaturedProductRecord[]): FeaturedProductRecord[] {
  return [...items].sort((a, b) => a.sort_order - b.sort_order);
}

async function resolveLocalProducts(): Promise<Product[]> {
  const adminProducts = getLocalAdminProducts();
  const sellerProducts = getLocalSellerProducts();
  const platformProducts = [
    ...adminProducts,
    ...mockProducts.filter((m) => !adminProducts.some((a) => a.id === m.id)),
  ];
  return [
    ...platformProducts,
    ...sellerProducts.filter(
      (s) => !platformProducts.some((p) => p.id === s.id) && isPublicListing(s)
    ),
  ];
}

function attachProducts(
  records: FeaturedProductRecord[],
  products: Product[]
): FeaturedProductWithProduct[] {
  return sortFeatured(records)
    .map((record) => {
      const product = products.find((p) => p.id === record.product_id);
      if (!product || !isPublicListing(product)) return null;
      return { ...record, product };
    })
    .filter((item): item is FeaturedProductWithProduct => item !== null);
}

export async function fetchFeaturedProducts(): Promise<{
  items: FeaturedProductWithProduct[];
  error: string | null;
}> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('featured_products')
      .select('*, product:products(*)')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) return { items: [], error: error.message };

    const items = ((data as FeaturedProductWithProduct[]) ?? [])
      .sort((a, b) => a.sort_order - b.sort_order)
      .filter((item) => item.product && isPublicListing(item.product));
    return { items, error: null };
  }

  const records = loadLocal().filter((r) => r.is_active);
  const products = await resolveLocalProducts();
  return { items: attachProducts(records, products), error: null };
}

export async function fetchAllFeaturedProductsAdmin(): Promise<{
  items: FeaturedProductWithProduct[];
  error: string | null;
}> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('featured_products')
      .select('*, product:products(*)')
      .order('sort_order', { ascending: true });

    if (error) return { items: [], error: error.message };

    const items = ((data as FeaturedProductWithProduct[]) ?? [])
      .sort((a, b) => a.sort_order - b.sort_order)
      .filter((item) => item.product && isPublicListing(item.product));
    return { items, error: null };
  }

  const records = ensureLocal();
  const products = await resolveLocalProducts();
  return { items: attachProducts(records, products), error: null };
}

export async function adminCreateFeaturedProduct(
  input: FeaturedProductInput
): Promise<{ item: FeaturedProductRecord | null; error: string | null }> {
  if (!input.product_id) {
    return { item: null, error: 'Produk wajib dipilih' };
  }

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('featured_products')
      .insert(input)
      .select()
      .single();

    if (error) return { item: null, error: error.message };
    return { item: data as FeaturedProductRecord, error: null };
  }

  const items = ensureLocal();
  if (items.some((i) => i.product_id === input.product_id)) {
    return { item: null, error: 'Produk sudah ada di daftar pilihan' };
  }

  const item: FeaturedProductRecord = {
    id: crypto.randomUUID(),
    ...input,
    created_at: new Date().toISOString(),
  };
  saveLocal([item, ...items]);
  return { item, error: null };
}

export async function adminUpdateFeaturedProduct(
  id: string,
  input: Partial<FeaturedProductInput>
): Promise<{ item: FeaturedProductRecord | null; error: string | null }> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('featured_products')
      .update(input)
      .eq('id', id)
      .select()
      .single();

    if (error) return { item: null, error: error.message };
    return { item: data as FeaturedProductRecord, error: null };
  }

  const items = ensureLocal();
  const index = items.findIndex((i) => i.id === id);
  if (index === -1) return { item: null, error: 'Produk pilihan tidak ditemukan' };

  if (
    input.product_id &&
    items.some((i) => i.product_id === input.product_id && i.id !== id)
  ) {
    return { item: null, error: 'Produk sudah ada di daftar pilihan' };
  }

  const updated: FeaturedProductRecord = { ...items[index], ...input };
  items[index] = updated;
  saveLocal(items);
  return { item: updated, error: null };
}

export async function adminDeleteFeaturedProduct(
  id: string
): Promise<{ error: string | null }> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from('featured_products').delete().eq('id', id);
    return { error: error?.message ?? null };
  }

  const items = ensureLocal();
  saveLocal(items.filter((i) => i.id !== id));
  return { error: null };
}
