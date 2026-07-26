import { supabase, isSupabaseConfigured } from './supabase';
import { mockProductCategories } from '../data/mockProductCategories';
import type { ProductCategoryRecord, ProductCategoryInput } from '../types';

const STORAGE_KEY = 'argasarihub-product-categories';

function loadLocal(): ProductCategoryRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as ProductCategoryRecord[];
  } catch {
    /* fallback to mock */
  }
  return mockProductCategories;
}

function saveLocal(items: ProductCategoryRecord[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function ensureLocal(): ProductCategoryRecord[] {
  const items = loadLocal();
  if (!localStorage.getItem(STORAGE_KEY)) {
    saveLocal(items);
  }
  return items;
}

function sortCategories(items: ProductCategoryRecord[]): ProductCategoryRecord[] {
  return [...items].sort((a, b) => a.sort_order - b.sort_order || a.label.localeCompare(b.label));
}

function normalizeSlug(slug: string): string {
  return slug
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export async function fetchProductCategories(): Promise<{
  items: ProductCategoryRecord[];
  error: string | null;
}> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('product_categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) return { items: [], error: error.message };
    return { items: sortCategories((data as ProductCategoryRecord[]) ?? []), error: null };
  }

  return {
    items: sortCategories(loadLocal().filter((c) => c.is_active)),
    error: null,
  };
}

export async function fetchAllProductCategoriesAdmin(): Promise<{
  items: ProductCategoryRecord[];
  error: string | null;
}> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('product_categories')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) return { items: [], error: error.message };
    return { items: sortCategories((data as ProductCategoryRecord[]) ?? []), error: null };
  }

  return { items: sortCategories(ensureLocal()), error: null };
}

export async function adminCreateProductCategory(
  input: ProductCategoryInput
): Promise<{ item: ProductCategoryRecord | null; error: string | null }> {
  const slug = normalizeSlug(input.slug);
  if (!slug) return { item: null, error: 'Slug kategori tidak valid' };

  const payload = {
    ...input,
    slug,
    label: input.label.trim(),
  };

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('product_categories')
      .insert(payload)
      .select()
      .single();

    if (error) return { item: null, error: error.message };
    return { item: data as ProductCategoryRecord, error: null };
  }

  const items = ensureLocal();
  if (items.some((c) => c.slug === slug)) {
    return { item: null, error: 'Slug kategori sudah digunakan' };
  }

  const item: ProductCategoryRecord = {
    id: crypto.randomUUID(),
    ...payload,
    created_at: new Date().toISOString(),
  };
  saveLocal([item, ...items]);
  return { item, error: null };
}

export async function adminUpdateProductCategory(
  id: string,
  input: Partial<ProductCategoryInput>
): Promise<{ item: ProductCategoryRecord | null; error: string | null }> {
  const payload: Partial<ProductCategoryInput> = { ...input };
  if (input.slug !== undefined) {
    const slug = normalizeSlug(input.slug);
    if (!slug) return { item: null, error: 'Slug kategori tidak valid' };
    payload.slug = slug;
  }
  if (input.label !== undefined) payload.label = input.label.trim();

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('product_categories')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) return { item: null, error: error.message };
    return { item: data as ProductCategoryRecord, error: null };
  }

  const items = ensureLocal();
  const index = items.findIndex((c) => c.id === id);
  if (index === -1) return { item: null, error: 'Kategori tidak ditemukan' };

  if (payload.slug && items.some((c) => c.slug === payload.slug && c.id !== id)) {
    return { item: null, error: 'Slug kategori sudah digunakan' };
  }

  const updated: ProductCategoryRecord = { ...items[index], ...payload };
  items[index] = updated;
  saveLocal(items);
  return { item: updated, error: null };
}

export async function adminDeleteProductCategory(
  id: string
): Promise<{ error: string | null }> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from('product_categories').delete().eq('id', id);
    return { error: error?.message ?? null };
  }

  const items = ensureLocal();
  saveLocal(items.filter((c) => c.id !== id));
  return { error: null };
}

export { normalizeSlug };
