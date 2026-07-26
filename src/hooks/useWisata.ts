import { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { mockWisata } from '../data/mockWisata';
import type { Wisata, WisataType } from '../types';

interface UseWisataOptions {
  type?: WisataType | 'all';
  search?: string;
}

export function useWisata(options: UseWisataOptions = {}) {
  const [items, setItems] = useState<Wisata[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchWisata() {
      setLoading(true);
      setError(null);

      try {
        if (isSupabaseConfigured && supabase) {
          let query = supabase
            .from('wisata')
            .select('*')
            .order('rating', { ascending: false });

          if (options.type && options.type !== 'all') {
            query = query.eq('type', options.type);
          }

          const { data, error: fetchError } = await query;
          if (fetchError) throw fetchError;

          let filtered = (data as Wisata[]) ?? [];
          if (options.search?.trim()) {
            const q = options.search.trim().toLowerCase();
            filtered = filtered.filter(
              (w) =>
                w.name.toLowerCase().includes(q) ||
                w.village.toLowerCase().includes(q) ||
                w.description.toLowerCase().includes(q)
            );
          }
          if (!cancelled) setItems(filtered);
        } else {
          let filtered = [...mockWisata];
          if (options.type && options.type !== 'all') {
            filtered = filtered.filter((w) => w.type === options.type);
          }
          if (options.search?.trim()) {
            const q = options.search.trim().toLowerCase();
            filtered = filtered.filter(
              (w) =>
                w.name.toLowerCase().includes(q) ||
                w.village.toLowerCase().includes(q) ||
                w.description.toLowerCase().includes(q)
            );
          }
          if (!cancelled) setItems(filtered);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Gagal memuat wisata');
          setItems(mockWisata);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchWisata();
    return () => {
      cancelled = true;
    };
  }, [options.type, options.search]);

  return { items, loading, error };
}

export function useWisataItem(id: string | undefined) {
  const [item, setItem] = useState<Wisata | null>(null);
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
            .from('wisata')
            .select('*')
            .eq('id', id)
            .single();

          if (fetchError) throw fetchError;
          if (!cancelled) setItem(data as Wisata);
        } else {
          const found = mockWisata.find((w) => w.id === id) ?? null;
          if (!cancelled) setItem(found);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Wisata tidak ditemukan');
          setItem(mockWisata.find((w) => w.id === id) ?? null);
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
