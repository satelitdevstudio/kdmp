import { useEffect, useState, useCallback } from 'react';
import { fetchProductCategories } from '../lib/productCategories';
import type { ProductCategoryRecord } from '../types';

export function useProductCategories() {
  const [categories, setCategories] = useState<ProductCategoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { items, error: err } = await fetchProductCategories();
    setCategories(items);
    setError(err);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { categories, loading, error, reload: load };
}
