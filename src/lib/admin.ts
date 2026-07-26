import { supabase, isSupabaseConfigured } from './supabase';
import type { Kuliner, KulinerCategory, Product, ProductCategory, Profile } from '../types';

const ADMIN_PRODUCTS_KEY = 'argasarihub-admin-products';

export type AdminProductInput = {
  name: string;
  description: string;
  price: number;
  village: string;
  category: ProductCategory;
  stock: number;
  image_url: string;
};

function loadLocalAdminProducts(): Product[] {
  try {
    const raw = localStorage.getItem(ADMIN_PRODUCTS_KEY);
    return raw ? (JSON.parse(raw) as Product[]) : [];
  } catch {
    return [];
  }
}

function saveLocalAdminProducts(products: Product[]) {
  localStorage.setItem(ADMIN_PRODUCTS_KEY, JSON.stringify(products));
}

export function getLocalAdminProducts(): Product[] {
  return loadLocalAdminProducts();
}

export async function fetchAllProfiles(): Promise<{ profiles: Profile[]; error: string | null }> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) return { profiles: [], error: error.message };
    return { profiles: (data as Profile[]) ?? [], error: null };
  }

  try {
    const raw = localStorage.getItem('argasarihub-profile');
    const profiles = raw ? Object.values(JSON.parse(raw) as Record<string, Profile>) : [];
    return { profiles, error: null };
  } catch {
    return { profiles: [], error: null };
  }
}

export async function fetchAllProducts(): Promise<{ products: Product[]; error: string | null }> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) return { products: [], error: error.message };
    return { products: (data as Product[]) ?? [], error: null };
  }

  const { getLocalSellerProducts } = await import('./sellerProducts');
  const { mockProducts } = await import('../data/mockProducts');
  const adminProducts = getLocalAdminProducts();
  const sellerProducts = getLocalSellerProducts();
  const platformProducts = [
    ...adminProducts,
    ...mockProducts.filter((m) => !adminProducts.some((a) => a.id === m.id)),
  ];
  const merged = [
    ...platformProducts,
    ...sellerProducts.filter((s) => !platformProducts.some((p) => p.id === s.id)),
  ];
  return { products: merged, error: null };
}

export async function fetchPlatformProducts(): Promise<{ products: Product[]; error: string | null }> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .is('seller_id', null)
      .order('created_at', { ascending: false });

    if (error) return { products: [], error: error.message };
    return { products: (data as Product[]) ?? [], error: null };
  }

  const { mockProducts } = await import('../data/mockProducts');
  const adminProducts = getLocalAdminProducts();
  const merged = [
    ...adminProducts,
    ...mockProducts.filter((m) => !adminProducts.some((a) => a.id === m.id)),
  ];
  return { products: merged, error: null };
}

export async function fetchSellerProductsAdmin(): Promise<{ products: Product[]; error: string | null }> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .not('seller_id', 'is', null)
      .order('created_at', { ascending: false });

    if (error) return { products: [], error: error.message };
    return { products: (data as Product[]) ?? [], error: null };
  }

  const { getLocalSellerProducts } = await import('./sellerProducts');
  return { products: getLocalSellerProducts(), error: null };
}

export async function adminCreateProduct(
  input: AdminProductInput
): Promise<{ product: Product | null; error: string | null }> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('products')
      .insert({ ...input, seller_id: null, rating: 0, moderation_status: 'approved' })
      .select()
      .single();

    if (error) return { product: null, error: error.message };
    return { product: data as Product, error: null };
  }

  const product: Product = {
    id: crypto.randomUUID(),
    ...input,
    rating: 0,
    moderation_status: 'approved',
    created_at: new Date().toISOString(),
  };
  const existing = loadLocalAdminProducts();
  saveLocalAdminProducts([product, ...existing]);
  return { product, error: null };
}

export async function adminUpdateProduct(
  productId: string,
  input: Partial<AdminProductInput>
): Promise<{ product: Product | null; error: string | null }> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('products')
      .update(input)
      .eq('id', productId)
      .select()
      .single();

    if (error) return { product: null, error: error.message };
    return { product: data as Product, error: null };
  }

  const adminProducts = loadLocalAdminProducts();
  const adminIndex = adminProducts.findIndex((p) => p.id === productId);
  if (adminIndex !== -1) {
    const updated = { ...adminProducts[adminIndex], ...input };
    adminProducts[adminIndex] = updated;
    saveLocalAdminProducts(adminProducts);
    return { product: updated, error: null };
  }

  try {
    const raw = localStorage.getItem('argasarihub-seller-products');
    if (raw) {
      const all = JSON.parse(raw) as Record<string, Product[]>;
      for (const sellerId of Object.keys(all)) {
        const index = all[sellerId].findIndex((p) => p.id === productId);
        if (index !== -1) {
          const updated = { ...all[sellerId][index], ...input };
          all[sellerId][index] = updated;
          localStorage.setItem('argasarihub-seller-products', JSON.stringify(all));
          return { product: updated, error: null };
        }
      }
    }
  } catch {
    /* ignore */
  }

  return { product: null, error: 'Produk tidak ditemukan' };
}

export async function fetchAllKuliner(): Promise<{ items: Kuliner[]; error: string | null }> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('kuliner')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) return { items: [], error: error.message };
    return { items: (data as Kuliner[]) ?? [], error: null };
  }

  const { getLocalSellerKuliner } = await import('./sellerKuliner');
  const { mockKuliner } = await import('../data/mockKuliner');
  const sellerItems = getLocalSellerKuliner();
  const merged = [
    ...sellerItems,
    ...mockKuliner.filter((m) => !sellerItems.some((s) => s.id === m.id)),
  ];
  return { items: merged, error: null };
}

export async function adminDeleteProduct(productId: string): Promise<{ error: string | null }> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from('products').delete().eq('id', productId);
    return { error: error?.message ?? null };
  }

  const adminProducts = loadLocalAdminProducts();
  if (adminProducts.some((p) => p.id === productId)) {
    saveLocalAdminProducts(adminProducts.filter((p) => p.id !== productId));
    return { error: null };
  }

  try {
    const raw = localStorage.getItem('argasarihub-seller-products');
    if (raw) {
      const all = JSON.parse(raw) as Record<string, Product[]>;
      let changed = false;
      for (const sellerId of Object.keys(all)) {
        const filtered = all[sellerId].filter((p) => p.id !== productId);
        if (filtered.length !== all[sellerId].length) {
          all[sellerId] = filtered;
          changed = true;
        }
      }
      if (changed) {
        localStorage.setItem('argasarihub-seller-products', JSON.stringify(all));
        return { error: null };
      }
    }
  } catch {
    /* ignore */
  }

  return { error: null };
}

export async function adminDeleteKuliner(kulinerId: string): Promise<{ error: string | null }> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from('kuliner').delete().eq('id', kulinerId);
    return { error: error?.message ?? null };
  }

  try {
    const raw = localStorage.getItem('argasarihub-seller-kuliner');
    if (raw) {
      const all = JSON.parse(raw) as Record<string, Kuliner[]>;
      let changed = false;
      for (const sellerId of Object.keys(all)) {
        const filtered = all[sellerId].filter((k) => k.id !== kulinerId);
        if (filtered.length !== all[sellerId].length) {
          all[sellerId] = filtered;
          changed = true;
        }
      }
      if (changed) {
        localStorage.setItem('argasarihub-seller-kuliner', JSON.stringify(all));
        return { error: null };
      }
    }
  } catch {
    /* ignore */
  }

  return { error: null };
}

export type AdminKulinerInput = {
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

export async function adminUpdateKuliner(
  kulinerId: string,
  input: Partial<AdminKulinerInput>
): Promise<{ item: Kuliner | null; error: string | null }> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('kuliner')
      .update(input)
      .eq('id', kulinerId)
      .select()
      .single();

    if (error) return { item: null, error: error.message };
    return { item: data as Kuliner, error: null };
  }

  try {
    const raw = localStorage.getItem('argasarihub-seller-kuliner');
    if (raw) {
      const all = JSON.parse(raw) as Record<string, Kuliner[]>;
      for (const sellerId of Object.keys(all)) {
        const index = all[sellerId].findIndex((k) => k.id === kulinerId);
        if (index !== -1) {
          const updated = { ...all[sellerId][index], ...input };
          all[sellerId][index] = updated;
          localStorage.setItem('argasarihub-seller-kuliner', JSON.stringify(all));
          return { item: updated, error: null };
        }
      }
    }
  } catch {
    /* ignore */
  }

  return { item: null, error: 'Menu kuliner tidak ditemukan' };
}

export async function setUserRole(
  userId: string,
  role: Profile['role']
): Promise<{ error: string | null }> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from('profiles').update({ role }).eq('id', userId);
    return { error: error?.message ?? null };
  }

  try {
    const raw = localStorage.getItem('argasarihub-profile');
    const profiles = raw ? (JSON.parse(raw) as Record<string, Profile>) : {};
    if (profiles[userId]) {
      profiles[userId] = { ...profiles[userId], role };
      localStorage.setItem('argasarihub-profile', JSON.stringify(profiles));
    }
    return { error: null };
  } catch {
    return { error: 'Gagal mengubah role' };
  }
}

export async function becomeAdmin(userId: string): Promise<{ error: string | null }> {
  return setUserRole(userId, 'admin');
}

export async function fetchAdminIds(): Promise<string[]> {
  const { profiles } = await fetchAllProfiles();
  return profiles.filter((p) => p.role === 'admin').map((p) => p.id);
}
