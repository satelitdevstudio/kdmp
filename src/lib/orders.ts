import { supabase, isSupabaseConfigured } from './supabase';
import type { CartItem, Order, OrderItemRecord } from '../types';
import { getCartItemPrice } from '../types';
import { decrementStockForItems } from './stock';
import { notifyOrderCreated } from './notifications';
import { collectSellerIdsFromItems } from './sellerOrders';
import {
  buildInitialSellerConfirmations,
  insertSellerConfirmations,
  mapConfirmationRows,
} from './orderSellerConfirmations';

const STORAGE_KEY = 'argasarihub-orders';

function loadLocalOrders(): Order[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Order[]) : [];
  } catch {
    return [];
  }
}

function saveLocalOrders(orders: Order[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
}

function cartToOrderItems(items: CartItem[]): OrderItemRecord[] {
  return items.map((item) => {
    if (item.type === 'product') {
      return {
        item_type: 'product',
        product_id: item.product.id,
        product_name: item.product.name,
        product_image_url: item.product.image_url,
        quantity: item.quantity,
        price: item.product.price,
      };
    }
    if (item.type === 'kuliner') {
      return {
        item_type: 'kuliner',
        product_id: item.kuliner.id,
        product_name: item.kuliner.name,
        product_image_url: item.kuliner.image_url,
        quantity: item.quantity,
        price: item.kuliner.price,
      };
    }
    return {
      item_type: 'jasa',
      product_id: item.jasa.id,
      product_name: item.jasa.name,
      product_image_url: item.jasa.image_url,
      quantity: item.quantity,
      price: item.jasa.price,
    };
  });
}

export async function createOrder(
  buyerId: string,
  items: CartItem[],
  shippingAddress: string
): Promise<{ order: Order | null; error: string | null }> {
  if (items.length === 0) {
    return { order: null, error: 'Keranjang kosong' };
  }

  const total = items.reduce((sum, i) => sum + getCartItemPrice(i) * i.quantity, 0);
  const orderItems = cartToOrderItems(items);

  if (isSupabaseConfigured && supabase) {
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        buyer_id: buyerId,
        total,
        shipping_address: shippingAddress,
        status: 'pending',
      })
      .select()
      .single();

    if (orderError) {
      return { order: null, error: orderError.message };
    }

    const { error: itemsError } = await supabase.from('order_items').insert(
      orderItems.map((item) => ({
        order_id: order.id,
        item_type: item.item_type,
        product_id: item.item_type === 'product' ? item.product_id : null,
        kuliner_id: item.item_type === 'kuliner' ? item.product_id : null,
        jasa_id: item.item_type === 'jasa' ? item.product_id : null,
        item_name: item.product_name,
        item_image_url: item.product_image_url,
        quantity: item.quantity,
        price: item.price,
      }))
    );

    if (itemsError) {
      return { order: null, error: itemsError.message };
    }

    const { error: stockError } = await decrementStockForItems(items);
    if (stockError) {
      return { order: null, error: stockError };
    }

    const result: Order = {
      id: order.id,
      buyer_id: order.buyer_id,
      status: order.status,
      total: order.total,
      shipping_address: order.shipping_address ?? shippingAddress,
      created_at: order.created_at,
      items: orderItems,
    };

    const sellerConfirmations = await buildInitialSellerConfirmations(orderItems, 'pending');
    await insertSellerConfirmations(order.id, sellerConfirmations);
    result.seller_confirmations = sellerConfirmations;

    const sellerIds = await collectSellerIdsFromItems(orderItems);
    await notifyOrderCreated(result, sellerIds);

    return { order: result, error: null };
  }

  const order: Order = {
    id: crypto.randomUUID(),
    buyer_id: buyerId,
    status: 'pending',
    total,
    shipping_address: shippingAddress,
    created_at: new Date().toISOString(),
    items: orderItems,
    seller_confirmations: await buildInitialSellerConfirmations(orderItems, 'pending'),
  };

  const existing = loadLocalOrders();
  saveLocalOrders([order, ...existing]);

  const { error: stockError } = await decrementStockForItems(items);
  if (stockError) {
    return { order: null, error: stockError };
  }

  const sellerIds = await collectSellerIdsFromItems(orderItems);
  await notifyOrderCreated(order, sellerIds);

  return { order, error: null };
}

export async function fetchOrders(buyerId: string): Promise<{ orders: Order[]; error: string | null }> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        id,
        buyer_id,
        status,
        total,
        shipping_address,
        created_at,
        order_items (
          id,
          item_type,
          product_id,
          kuliner_id,
          jasa_id,
          item_name,
          item_image_url,
          quantity,
          price,
          products ( name, image_url )
        ),
        order_seller_confirmations ( seller_id, status, updated_at )
      `)
      .eq('buyer_id', buyerId)
      .order('created_at', { ascending: false });

    if (error) {
      return { orders: [], error: error.message };
    }

    const orders: Order[] = (data ?? []).map((row) => {
      const rawItems = (row.order_items as Array<{
        id: string;
        item_type: 'product' | 'kuliner' | 'jasa';
        product_id: string | null;
        kuliner_id: string | null;
        jasa_id: string | null;
        item_name: string | null;
        item_image_url: string | null;
        quantity: number;
        price: number;
        products: { name: string; image_url: string } | { name: string; image_url: string }[] | null;
      }>) ?? [];

      const items: OrderItemRecord[] = rawItems.map((item) => {
        const product = Array.isArray(item.products) ? item.products[0] : item.products;
        return {
          id: item.id,
          item_type: item.item_type ?? 'product',
          product_id: item.product_id ?? item.kuliner_id ?? item.jasa_id ?? '',
          product_name: item.item_name ?? product?.name ?? 'Item',
          product_image_url: item.item_image_url ?? product?.image_url ?? '',
          quantity: item.quantity,
          price: item.price,
        };
      });

      return {
        id: row.id,
        buyer_id: row.buyer_id,
        status: row.status,
        total: row.total,
        shipping_address: row.shipping_address ?? '',
        created_at: row.created_at,
        items,
        seller_confirmations: mapConfirmationRows(
          (row as { order_seller_confirmations?: Array<{ seller_id: string; status: Order['status']; updated_at?: string }> })
            .order_seller_confirmations
        ),
      };
    });

    return { orders, error: null };
  }

  const orders = loadLocalOrders().filter((o) => o.buyer_id === buyerId);
  return { orders, error: null };
}

export function getDemoBuyerId(): string {
  const key = 'argasarihub-demo-buyer';
  let id = localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(key, id);
  }
  return id;
}
