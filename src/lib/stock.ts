import { supabase, isSupabaseConfigured } from './supabase';
import type { CartItem } from '../types';
import { getLocalSellerProducts } from './sellerProducts';

const OVERRIDES_KEY = 'argasarihub-stock-overrides';

function loadOverrides(): Record<string, number> {
  try {
    const raw = localStorage.getItem(OVERRIDES_KEY);
    return raw ? (JSON.parse(raw) as Record<string, number>) : {};
  } catch {
    return {};
  }
}

function saveOverrides(overrides: Record<string, number>) {
  localStorage.setItem(OVERRIDES_KEY, JSON.stringify(overrides));
}

export function getStockOverride(productId: string): number | undefined {
  return loadOverrides()[productId];
}

function decrementLocalStock(productId: string, quantity: number): void {
  const raw = localStorage.getItem('argasarihub-seller-products');
  if (raw) {
    const all = JSON.parse(raw) as Record<string, ReturnType<typeof getLocalSellerProducts>>;
    for (const sellerId of Object.keys(all)) {
      const idx = all[sellerId].findIndex((p) => p.id === productId);
      if (idx !== -1) {
        all[sellerId][idx] = {
          ...all[sellerId][idx],
          stock: Math.max(0, all[sellerId][idx].stock - quantity),
        };
        localStorage.setItem('argasarihub-seller-products', JSON.stringify(all));
        return;
      }
    }
  }

  const overrides = loadOverrides();
  if (productId in overrides) {
    overrides[productId] = Math.max(0, overrides[productId] - quantity);
    saveOverrides(overrides);
  }
}

export async function decrementStockForItems(
  items: CartItem[]
): Promise<{ error: string | null }> {
  const productItems = items.filter((i) => i.type === 'product');
  if (productItems.length === 0) return { error: null };

  if (isSupabaseConfigured && supabase) {
    for (const item of productItems) {
      if (item.type !== 'product') continue;

      const { data: product, error: fetchError } = await supabase
        .from('products')
        .select('stock')
        .eq('id', item.product.id)
        .single();

      if (fetchError) return { error: fetchError.message };

      const newStock = Math.max(0, (product.stock as number) - item.quantity);
      const { error: updateError } = await supabase
        .from('products')
        .update({ stock: newStock })
        .eq('id', item.product.id);

      if (updateError) return { error: updateError.message };
    }
    return { error: null };
  }

  for (const item of productItems) {
    if (item.type !== 'product') continue;

    const overrides = loadOverrides();
    if (!(item.product.id in overrides)) {
      overrides[item.product.id] = item.product.stock;
    }
    saveOverrides(overrides);
    decrementLocalStock(item.product.id, item.quantity);
  }

  return { error: null };
}
