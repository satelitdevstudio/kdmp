import { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { getLocalEvents, getLocalChannelVideos } from '../lib/adminContent';
import { mockEvents, mockChannelVideos } from '../data/mockEvents';
import type { ChannelVideo, EventCategory, VillageEvent } from '../types';

interface UseEventsOptions {
  category?: EventCategory | 'all';
  search?: string;
}

export function useEvents(options: UseEventsOptions = {}) {
  const [items, setItems] = useState<VillageEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchEvents() {
      setLoading(true);
      setError(null);

      try {
        if (isSupabaseConfigured && supabase) {
          let query = supabase
            .from('village_events')
            .select('*')
            .order('event_date', { ascending: true });

          if (options.category && options.category !== 'all') {
            query = query.eq('category', options.category);
          }

          const { data, error: fetchError } = await query;
          if (fetchError) throw fetchError;

          let filtered = (data as VillageEvent[]) ?? [];
          if (options.search?.trim()) {
            const q = options.search.trim().toLowerCase();
            filtered = filtered.filter(
              (e) =>
                e.title.toLowerCase().includes(q) ||
                e.location.toLowerCase().includes(q) ||
                e.village.toLowerCase().includes(q)
            );
          }
          if (!cancelled) setItems(filtered);
        } else {
          let filtered = [...getLocalEvents()];
          if (options.category && options.category !== 'all') {
            filtered = filtered.filter((e) => e.category === options.category);
          }
          if (options.search?.trim()) {
            const q = options.search.trim().toLowerCase();
            filtered = filtered.filter(
              (e) =>
                e.title.toLowerCase().includes(q) ||
                e.location.toLowerCase().includes(q) ||
                e.village.toLowerCase().includes(q)
            );
          }
          if (!cancelled) setItems(filtered);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Gagal memuat event');
          setItems(mockEvents);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchEvents();
    return () => {
      cancelled = true;
    };
  }, [options.category, options.search]);

  return { items, loading, error };
}

export function useEventItem(id: string | undefined) {
  const [item, setItem] = useState<VillageEvent | null>(null);
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
            .from('village_events')
            .select('*')
            .eq('id', id)
            .single();

          if (fetchError) throw fetchError;
          if (!cancelled) setItem(data as VillageEvent);
        } else {
          const found = getLocalEvents().find((e) => e.id === id) ?? null;
          if (!cancelled) setItem(found);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Event tidak ditemukan');
          setItem(mockEvents.find((e) => e.id === id) ?? null);
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

export function useChannelVideos() {
  const [items, setItems] = useState<ChannelVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchVideos() {
      setLoading(true);
      setError(null);

      try {
        if (isSupabaseConfigured && supabase) {
          const { data, error: fetchError } = await supabase
            .from('channel_videos')
            .select('*')
            .order('created_at', { ascending: false });

          if (fetchError) throw fetchError;
          if (!cancelled) setItems((data as ChannelVideo[]) ?? []);
        } else {
          if (!cancelled) setItems(getLocalChannelVideos());
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Gagal memuat video');
          setItems(mockChannelVideos);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchVideos();
    return () => {
      cancelled = true;
    };
  }, []);

  return { items, loading, error };
}

export function useChannelVideoItem(id: string | undefined) {
  const [item, setItem] = useState<ChannelVideo | null>(null);
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
            .from('channel_videos')
            .select('*')
            .eq('id', id)
            .single();

          if (fetchError) throw fetchError;
          if (!cancelled) setItem(data as ChannelVideo);
        } else {
          const found = getLocalChannelVideos().find((v) => v.id === id) ?? null;
          if (!cancelled) setItem(found);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Video tidak ditemukan');
          setItem(mockChannelVideos.find((v) => v.id === id) ?? null);
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
