import { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { mockProducts } from '../data/mockProducts';
import { getLocalSellerProducts } from '../lib/sellerProducts';
import { getLocalAdminProducts } from '../lib/admin';
import { getStockOverride } from '../lib/stock';
import { isPublicListing } from '../types';
import type { Product, ProductCategory } from '../types';

interface UseProductsOptions {
  category?: ProductCategory | 'all';
  search?: string;
}

export function useProducts(options: UseProductsOptions = {}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchProducts() {
      setLoading(true);
      setError(null);

      try {
        if (isSupabaseConfigured && supabase) {
          let query = supabase
            .from('products')
            .select('*')
            .or('seller_id.is.null,moderation_status.eq.approved')
            .order('created_at', { ascending: false });

          if (options.category && options.category !== 'all') {
            query = query.eq('category', options.category);
          }

          if (options.search?.trim()) {
            query = query.ilike('name', `%${options.search.trim()}%`);
          }

          const { data, error: fetchError } = await query;

          if (fetchError) throw fetchError;
          if (!cancelled) setProducts((data as Product[]) ?? []);
        } else {
          const adminProducts = getLocalAdminProducts();
          const sellerProducts = getLocalSellerProducts();
          const platformProducts = [
            ...adminProducts,
            ...mockProducts.filter((m) => !adminProducts.some((a) => a.id === m.id)),
          ];
          const merged = [
            ...platformProducts,
            ...sellerProducts.filter(
              (s) => !platformProducts.some((p) => p.id === s.id) && isPublicListing(s)
            ),
          ];
          let filtered = [...merged];

          if (options.category && options.category !== 'all') {
            filtered = filtered.filter((p) => p.category === options.category);
          }

          if (options.search?.trim()) {
            const q = options.search.trim().toLowerCase();
            filtered = filtered.filter(
              (p) =>
                p.name.toLowerCase().includes(q) ||
                p.village.toLowerCase().includes(q)
            );
          }

          if (!cancelled) {
            setProducts(
              filtered.map((p) => {
                const override = getStockOverride(p.id);
                return override !== undefined ? { ...p, stock: override } : p;
              })
            );
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Gagal memuat produk');
          setProducts(mockProducts);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchProducts();
    return () => {
      cancelled = true;
    };
  }, [options.category, options.search]);

  return { products, loading, error };
}

export function useProduct(id: string | undefined) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setProduct(null);
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function fetchProduct() {
      setLoading(true);
      setError(null);

      try {
        if (isSupabaseConfigured && supabase) {
          const { data, error: fetchError } = await supabase
            .from('products')
            .select('*')
            .eq('id', id)
            .single();

          if (fetchError) throw fetchError;
          const product = data as Product;
          if (!cancelled) {
            if (product.seller_id && !isPublicListing(product)) {
              setProduct(null);
            } else {
              setProduct(product);
            }
          }
        } else {
          const adminProducts = getLocalAdminProducts();
          const sellerProducts = getLocalSellerProducts();
          const found = adminProducts.find((p) => p.id === id)
            ?? sellerProducts.find((p) => p.id === id)
            ?? mockProducts.find((p) => p.id === id)
            ?? null;
          if (!cancelled) {
            if (found && found.seller_id && !isPublicListing(found)) {
              setProduct(null);
            } else if (found) {
              const override = getStockOverride(found.id);
              setProduct(override !== undefined ? { ...found, stock: override } : found);
            } else {
              setProduct(null);
            }
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Produk tidak ditemukan');
          setProduct(mockProducts.find((p) => p.id === id) ?? null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchProduct();
    return () => {
      cancelled = true;
    };
  }, [id]);

  return { product, loading, error };
}
