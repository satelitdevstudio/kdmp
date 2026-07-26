import { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { mockLowongan } from '../data/mockLowongan';
import type { EmploymentType, Lowongan } from '../types';

interface UseLowonganOptions {
  employmentType?: EmploymentType | 'all';
  search?: string;
}

export function useLowongan(options: UseLowonganOptions = {}) {
  const [items, setItems] = useState<Lowongan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchLowongan() {
      setLoading(true);
      setError(null);

      try {
        if (isSupabaseConfigured && supabase) {
          let query = supabase
            .from('lowongan')
            .select('*')
            .order('deadline', { ascending: true });

          if (options.employmentType && options.employmentType !== 'all') {
            query = query.eq('employment_type', options.employmentType);
          }

          const { data, error: fetchError } = await query;
          if (fetchError) throw fetchError;

          let filtered = (data as Lowongan[]) ?? [];
          if (options.search?.trim()) {
            const q = options.search.trim().toLowerCase();
            filtered = filtered.filter(
              (l) =>
                l.title.toLowerCase().includes(q) ||
                l.company.toLowerCase().includes(q) ||
                l.village.toLowerCase().includes(q)
            );
          }
          if (!cancelled) setItems(filtered);
        } else {
          let filtered = [...mockLowongan];
          if (options.employmentType && options.employmentType !== 'all') {
            filtered = filtered.filter((l) => l.employment_type === options.employmentType);
          }
          if (options.search?.trim()) {
            const q = options.search.trim().toLowerCase();
            filtered = filtered.filter(
              (l) =>
                l.title.toLowerCase().includes(q) ||
                l.company.toLowerCase().includes(q) ||
                l.village.toLowerCase().includes(q)
            );
          }
          if (!cancelled) setItems(filtered);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Gagal memuat lowongan');
          setItems(mockLowongan);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchLowongan();
    return () => {
      cancelled = true;
    };
  }, [options.employmentType, options.search]);

  return { items, loading, error };
}

export function useLowonganItem(id: string | undefined) {
  const [item, setItem] = useState<Lowongan | null>(null);
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
            .from('lowongan')
            .select('*')
            .eq('id', id)
            .single();

          if (fetchError) throw fetchError;
          if (!cancelled) setItem(data as Lowongan);
        } else {
          const found = mockLowongan.find((l) => l.id === id) ?? null;
          if (!cancelled) setItem(found);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Lowongan tidak ditemukan');
          setItem(mockLowongan.find((l) => l.id === id) ?? null);
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
