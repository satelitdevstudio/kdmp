import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { CartItem, Product, Kuliner, Jasa } from '../types';
import { getCartItemId, getCartItemPrice } from '../types';
import { canOrderKuliner } from '../lib/storeHours';

interface CartContextValue {
  items: CartItem[];
  itemCount: number;
  total: number;
  addProduct: (product: Product, quantity?: number) => void;
  addItem: (product: Product, quantity?: number) => void;
  addKuliner: (kuliner: Kuliner, quantity?: number) => void;
  addJasa: (jasa: Jasa, quantity?: number) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = 'argasarihub-cart';

function normalizeCartItem(raw: unknown): CartItem | null {
  if (!raw || typeof raw !== 'object') return null;
  const item = raw as Record<string, unknown>;
  if (item.type === 'kuliner' && item.kuliner && item.quantity) {
    return item as CartItem;
  }
  if (item.type === 'jasa' && item.jasa && item.quantity) {
    return item as CartItem;
  }
  if (item.type === 'product' && item.product && item.quantity) {
    return item as CartItem;
  }
  if (item.product && item.quantity) {
    return { type: 'product', product: item.product as Product, quantity: item.quantity as number };
  }
  return null;
}

function loadCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown[];
    return parsed.map(normalizeCartItem).filter((i): i is CartItem => i !== null);
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => loadCart());

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addProduct = (product: Product, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.type === 'product' && i.product.id === product.id);
      if (existing && existing.type === 'product') {
        return prev.map((i) =>
          i.type === 'product' && i.product.id === product.id
            ? { ...i, quantity: Math.min(i.quantity + quantity, product.stock) }
            : i
        );
      }
      return [...prev, { type: 'product', product, quantity: Math.min(quantity, product.stock) }];
    });
  };

  const addKuliner = (kuliner: Kuliner, quantity = 1) => {
    if (!canOrderKuliner(kuliner)) return;
    setItems((prev) => {
      const existing = prev.find((i) => i.type === 'kuliner' && i.kuliner.id === kuliner.id);
      if (existing && existing.type === 'kuliner') {
        return prev.map((i) =>
          i.type === 'kuliner' && i.kuliner.id === kuliner.id
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      }
      return [...prev, { type: 'kuliner', kuliner, quantity }];
    });
  };

  const addJasa = (jasa: Jasa, quantity = 1) => {
    if (!jasa.is_available) return;
    setItems((prev) => {
      const existing = prev.find((i) => i.type === 'jasa' && i.jasa.id === jasa.id);
      if (existing && existing.type === 'jasa') {
        return prev.map((i) =>
          i.type === 'jasa' && i.jasa.id === jasa.id
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      }
      return [...prev, { type: 'jasa', jasa, quantity }];
    });
  };

  const removeItem = (itemId: string) => {
    setItems((prev) => prev.filter((i) => getCartItemId(i) !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId);
      return;
    }
    setItems((prev) =>
      prev.map((i) => {
        if (getCartItemId(i) !== itemId) return i;
        if (i.type === 'product') {
          return { ...i, quantity: Math.min(quantity, i.product.stock) };
        }
        return { ...i, quantity };
      })
    );
  };

  const clearCart = () => setItems([]);

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const total = items.reduce((sum, i) => sum + getCartItemPrice(i) * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, itemCount, total, addProduct, addItem: addProduct, addKuliner, addJasa, removeItem, updateQuantity, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}

// Backward-compatible alias
export function useCartAddProduct() {
  const { addProduct } = useCart();
  return addProduct;
}
