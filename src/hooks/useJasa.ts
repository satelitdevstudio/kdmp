import { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { mockJasa } from '../data/mockJasa';
import type { Jasa, JasaCategory } from '../types';

interface UseJasaOptions {
  category?: JasaCategory | 'all';
  search?: string;
}

export function useJasa(options: UseJasaOptions = {}) {
  const [items, setItems] = useState<Jasa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchJasa() {
      setLoading(true);
      setError(null);

      try {
        if (isSupabaseConfigured && supabase) {
          let query = supabase
            .from('jasa')
            .select('*')
            .eq('is_available', true)
            .order('created_at', { ascending: false });

          if (options.category && options.category !== 'all') {
            query = query.eq('category', options.category);
          }

          const { data, error: fetchError } = await query;
          if (fetchError) throw fetchError;

          let filtered = (data as Jasa[]) ?? [];
          if (options.search?.trim()) {
            const q = options.search.trim().toLowerCase();
            filtered = filtered.filter(
              (j) =>
                j.name.toLowerCase().includes(q) ||
                j.provider_name.toLowerCase().includes(q) ||
                j.village.toLowerCase().includes(q)
            );
          }
          if (!cancelled) setItems(filtered);
        } else {
          let filtered = [...mockJasa];
          if (options.category && options.category !== 'all') {
            filtered = filtered.filter((j) => j.category === options.category);
          }
          if (options.search?.trim()) {
            const q = options.search.trim().toLowerCase();
            filtered = filtered.filter(
              (j) =>
                j.name.toLowerCase().includes(q) ||
                j.provider_name.toLowerCase().includes(q) ||
                j.village.toLowerCase().includes(q)
            );
          }
          if (!cancelled) setItems(filtered);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Gagal memuat jasa');
          setItems(mockJasa);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchJasa();
    return () => {
      cancelled = true;
    };
  }, [options.category, options.search]);

  return { items, loading, error };
}

export function useJasaItem(id: string | undefined) {
  const [item, setItem] = useState<Jasa | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setItem(null);
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function fetchItem() {
      setLoading(true);
      setError(null);

      try {
        if (isSupabaseConfigured && supabase) {
          const { data, error: fetchError } = await supabase
            .from('jasa')
            .select('*')
            .eq('id', id)
            .single();

          if (fetchError) throw fetchError;
          if (!cancelled) setItem(data as Jasa);
        } else {
          const found = mockJasa.find((j) => j.id === id) ?? null;
          if (!cancelled) setItem(found);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Jasa tidak ditemukan');
          setItem(mockJasa.find((j) => j.id === id) ?? null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchItem();
    return () => {
      cancelled = true;
    };
  }, [id]);

  return { item, loading, error };
}
