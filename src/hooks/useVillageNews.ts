import { useEffect, useState } from 'react';
import { fetchVillageNews } from '../lib/villageNews';
import type { VillageNews, VillageNewsCategory } from '../types';

export function useVillageNews(options?: {
  category?: VillageNewsCategory | 'all';
  search?: string;
}) {
  const [items, setItems] = useState<VillageNews[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      const { items: data, error: fetchError } = await fetchVillageNews(options);
      if (!cancelled) {
        setItems(data);
        setError(fetchError);
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [options?.category, options?.search]);

  return { items, loading, error };
}
