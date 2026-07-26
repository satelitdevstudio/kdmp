import { useEffect, useState, useCallback } from 'react';
import { fetchFeaturedProducts } from '../lib/featuredProducts';
import type { FeaturedProductWithProduct } from '../types';

export function useFeaturedProducts() {
  const [items, setItems] = useState<FeaturedProductWithProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { items: data, error: err } = await fetchFeaturedProducts();
    setItems(data);
    setError(err);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { items, loading, error, reload: load };
}
