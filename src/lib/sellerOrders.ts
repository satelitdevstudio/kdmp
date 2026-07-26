import { supabase, isSupabaseConfigured } from './supabase';
import type { Order, OrderItemRecord, OrderSellerConfirmation, OrderStatus } from '../types';
import { getLocalSellerProducts } from './sellerProducts';
import { getLocalSellerKuliner } from './sellerKuliner';
import { mockJasa } from '../data/mockJasa';
import { notifyOrderStatusChanged } from './notifications';
import {
  applyAllSellerStatusUpdate,
  applySellerStatusUpdate,
  buildInitialSellerConfirmations,
  computeAggregateOrderStatus,
  insertSellerConfirmations,
  mapConfirmationRows,
} from './orderSellerConfirmations';

const STORAGE_KEY = 'argasarihub-orders';

const ORDER_SELECT = `
  id, buyer_id, status, total, shipping_address, created_at,
  order_items (id, item_type, product_id, kuliner_id, jasa_id, item_name, item_image_url, quantity, price, products (name, image_url)),
  order_seller_confirmations (seller_id, status, updated_at)
`;

export function getAllLocalOrders(): Order[] {
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

function mapOrderRow(row: {
  id: string;
  buyer_id: string;
  status: OrderStatus;
  total: number;
  shipping_address: string | null;
  created_at: string;
  order_items: Array<{
    id: string;
    item_type: 'product' | 'kuliner' | 'jasa';
    product_id: string | null;
    kuliner_id: string | null;
    jasa_id: string | null;
    item_name: string | null;
    item_image_url: string | null;
    quantity: number;
    price: number;
    products?: { name: string; image_url: string } | { name: string; image_url: string }[] | null;
  }>;
  order_seller_confirmations?: Array<{
    seller_id: string;
    status: OrderStatus;
    updated_at?: string;
  }>;
}): Order {
  const items: OrderItemRecord[] = (row.order_items ?? []).map((item) => {
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

  const sellerConfirmations = mapConfirmationRows(row.order_seller_confirmations);

  return {
    id: row.id,
    buyer_id: row.buyer_id,
    status: row.status,
    total: row.total,
    shipping_address: row.shipping_address ?? '',
    created_at: row.created_at,
    items,
    seller_confirmations: sellerConfirmations.length > 0 ? sellerConfirmations : undefined,
  };
}

async function hydrateOrderConfirmations(order: Order): Promise<Order> {
  if (order.seller_confirmations?.length) return order;

  const confirmations = await buildInitialSellerConfirmations(order.items, order.status);

  if (isSupabaseConfigured && supabase) {
    await insertSellerConfirmations(order.id, confirmations);
  } else {
    const orders = getAllLocalOrders();
    const index = orders.findIndex((o) => o.id === order.id);
    if (index !== -1) {
      orders[index] = { ...orders[index], seller_confirmations: confirmations };
      saveLocalOrders(orders);
    }
  }

  return { ...order, seller_confirmations: confirmations };
}

async function hydrateOrders(orders: Order[]): Promise<Order[]> {
  return Promise.all(orders.map((order) => hydrateOrderConfirmations(order)));
}

function getSellerItemIds(sellerId: string): Set<string> {
  const productIds = getLocalSellerProducts()
    .filter((p) => p.seller_id === sellerId)
    .map((p) => p.id);
  const kulinerIds = getLocalSellerKuliner()
    .filter((k) => k.seller_id === sellerId)
    .map((k) => k.id);
  const jasaIds = mockJasa
    .filter((j) => j.seller_id === sellerId)
    .map((j) => j.id);
  return new Set([...productIds, ...kulinerIds, ...jasaIds]);
}

export async function getSellerCatalogItemIds(sellerId: string): Promise<Set<string>> {
  if (isSupabaseConfigured && supabase) {
    const ids = new Set<string>();
    const { data: products } = await supabase.from('products').select('id').eq('seller_id', sellerId);
    const { data: kuliner } = await supabase.from('kuliner').select('id').eq('seller_id', sellerId);
    const { data: jasa } = await supabase.from('jasa').select('id').eq('seller_id', sellerId);
    for (const row of products ?? []) ids.add(row.id);
    for (const row of kuliner ?? []) ids.add(row.id);
    for (const row of jasa ?? []) ids.add(row.id);
    return ids;
  }
  return getSellerItemIds(sellerId);
}

export function filterOrderItemsForSeller(
  order: Order,
  sellerItemIds: Set<string>
): OrderItemRecord[] {
  return order.items.filter((item) => sellerItemIds.has(item.product_id));
}

function orderHasSellerItems(order: Order, sellerItemIds: Set<string>): boolean {
  return order.items.some((item) => sellerItemIds.has(item.product_id));
}

async function persistOrderUpdate(
  orderId: string,
  confirmations: OrderSellerConfirmation[],
  aggregateStatus: OrderStatus,
  previousStatus: OrderStatus
): Promise<{ order: Order | null; error: string | null }> {
  if (isSupabaseConfigured && supabase) {
    for (const confirmation of confirmations) {
      const { error: confirmError } = await supabase
        .from('order_seller_confirmations')
        .upsert(
          {
            order_id: orderId,
            seller_id: confirmation.seller_id,
            status: confirmation.status,
            updated_at: confirmation.updated_at ?? new Date().toISOString(),
          },
          { onConflict: 'order_id,seller_id' }
        );

      if (confirmError) return { order: null, error: confirmError.message };
    }

    const { data, error } = await supabase
      .from('orders')
      .update({ status: aggregateStatus })
      .eq('id', orderId)
      .select(ORDER_SELECT)
      .single();

    if (error) return { order: null, error: error.message };

    const order = mapOrderRow(data as Parameters<typeof mapOrderRow>[0]);
    if (aggregateStatus !== previousStatus) {
      await notifyOrderStatusChanged(order, aggregateStatus);
    }
    return { order, error: null };
  }

  const orders = getAllLocalOrders();
  const index = orders.findIndex((o) => o.id === orderId);
  if (index === -1) return { order: null, error: 'Pesanan tidak ditemukan' };

  const updated: Order = {
    ...orders[index],
    status: aggregateStatus,
    seller_confirmations: confirmations,
  };
  orders[index] = updated;
  saveLocalOrders(orders);

  if (aggregateStatus !== previousStatus) {
    await notifyOrderStatusChanged(updated, aggregateStatus);
  }
  return { order: updated, error: null };
}

export async function fetchSellerOrders(
  sellerId: string
): Promise<{ orders: Order[]; error: string | null }> {
  if (isSupabaseConfigured && supabase) {
    const { data: products } = await supabase
      .from('products')
      .select('id')
      .eq('seller_id', sellerId);

    const { data: kuliner } = await supabase
      .from('kuliner')
      .select('id')
      .eq('seller_id', sellerId);

    const { data: jasa } = await supabase
      .from('jasa')
      .select('id')
      .eq('seller_id', sellerId);

    const productIds = (products ?? []).map((p) => p.id);
    const kulinerIds = (kuliner ?? []).map((k) => k.id);
    const jasaIds = (jasa ?? []).map((j) => j.id);

    if (productIds.length === 0 && kulinerIds.length === 0 && jasaIds.length === 0) {
      return { orders: [], error: null };
    }

    const orderIds: string[] = [];

    if (productIds.length > 0) {
      const { data: productItems } = await supabase
        .from('order_items')
        .select('order_id')
        .in('product_id', productIds);
      orderIds.push(...(productItems ?? []).map((i) => i.order_id));
    }

    if (kulinerIds.length > 0) {
      const { data: kulinerItems } = await supabase
        .from('order_items')
        .select('order_id')
        .in('kuliner_id', kulinerIds);
      orderIds.push(...(kulinerItems ?? []).map((i) => i.order_id));
    }

    if (jasaIds.length > 0) {
      const { data: jasaItems } = await supabase
        .from('order_items')
        .select('order_id')
        .in('jasa_id', jasaIds);
      orderIds.push(...(jasaItems ?? []).map((i) => i.order_id));
    }

    const uniqueOrderIds = [...new Set(orderIds)];
    if (uniqueOrderIds.length === 0) return { orders: [], error: null };

    const { data, error } = await supabase
      .from('orders')
      .select(ORDER_SELECT)
      .in('id', uniqueOrderIds)
      .order('created_at', { ascending: false });

    if (error) return { orders: [], error: error.message };

    const orders = await hydrateOrders(
      (data ?? []).map((row) => mapOrderRow(row as Parameters<typeof mapOrderRow>[0]))
    );
    return { orders, error: null };
  }

  const sellerItemIds = getSellerItemIds(sellerId);
  const orders = await hydrateOrders(
    getAllLocalOrders().filter((o) => orderHasSellerItems(o, sellerItemIds))
  );
  return { orders, error: null };
}

export async function fetchAllOrders(): Promise<{ orders: Order[]; error: string | null }> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('orders')
      .select(ORDER_SELECT)
      .order('created_at', { ascending: false });

    if (error) return { orders: [], error: error.message };
    const orders = await hydrateOrders(
      (data ?? []).map((row) => mapOrderRow(row as Parameters<typeof mapOrderRow>[0]))
    );
    return { orders, error: null };
  }

  return { orders: await hydrateOrders(getAllLocalOrders()), error: null };
}

export async function updateSellerOrderStatus(
  orderId: string,
  sellerId: string,
  status: OrderStatus
): Promise<{ order: Order | null; error: string | null }> {
  let order: Order | null = null;

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('orders')
      .select(ORDER_SELECT)
      .eq('id', orderId)
      .single();

    if (error) return { order: null, error: error.message };
    order = await hydrateOrderConfirmations(mapOrderRow(data as Parameters<typeof mapOrderRow>[0]));
  } else {
    const orders = getAllLocalOrders();
    const found = orders.find((o) => o.id === orderId);
    if (!found) return { order: null, error: 'Pesanan tidak ditemukan' };
    order = await hydrateOrderConfirmations(found);
  }

  const previousStatus = order.status;
  const confirmations = applySellerStatusUpdate(
    order.seller_confirmations ?? [],
    sellerId,
    status
  );
  const aggregateStatus = computeAggregateOrderStatus(confirmations);

  return persistOrderUpdate(orderId, confirmations, aggregateStatus, previousStatus);
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus
): Promise<{ order: Order | null; error: string | null }> {
  let order: Order | null = null;

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('orders')
      .select(ORDER_SELECT)
      .eq('id', orderId)
      .single();

    if (error) return { order: null, error: error.message };
    order = await hydrateOrderConfirmations(mapOrderRow(data as Parameters<typeof mapOrderRow>[0]));
  } else {
    const orders = getAllLocalOrders();
    const found = orders.find((o) => o.id === orderId);
    if (!found) return { order: null, error: 'Pesanan tidak ditemukan' };
    order = await hydrateOrderConfirmations(found);
  }

  const previousStatus = order.status;
  const confirmations = applyAllSellerStatusUpdate(order.seller_confirmations ?? [], status);

  return persistOrderUpdate(orderId, confirmations, status, previousStatus);
}

export async function collectSellerIdsFromItems(
  items: OrderItemRecord[]
): Promise<string[]> {
  const sellerIds: string[] = [];

  if (isSupabaseConfigured && supabase) {
    const productIds = items.filter((i) => i.item_type === 'product').map((i) => i.product_id);
    const kulinerIds = items.filter((i) => i.item_type === 'kuliner').map((i) => i.product_id);
    const jasaIds = items.filter((i) => i.item_type === 'jasa').map((i) => i.product_id);

    if (productIds.length > 0) {
      const { data } = await supabase
        .from('products')
        .select('seller_id')
        .in('id', productIds);
      sellerIds.push(...(data ?? []).map((p) => p.seller_id).filter(Boolean));
    }

    if (kulinerIds.length > 0) {
      const { data } = await supabase
        .from('kuliner')
        .select('seller_id')
        .in('id', kulinerIds);
      sellerIds.push(...(data ?? []).map((k) => k.seller_id).filter(Boolean));
    }

    if (jasaIds.length > 0) {
      const { data } = await supabase
        .from('jasa')
        .select('seller_id')
        .in('id', jasaIds);
      sellerIds.push(...(data ?? []).map((j) => j.seller_id).filter(Boolean));
    }
  } else {
    const allProducts = getLocalSellerProducts();
    const allKuliner = getLocalSellerKuliner();

    for (const item of items) {
      if (item.item_type === 'product') {
        const p = allProducts.find((x) => x.id === item.product_id);
        if (p?.seller_id) sellerIds.push(p.seller_id);
      } else if (item.item_type === 'kuliner') {
        const k = allKuliner.find((x) => x.id === item.product_id);
        if (k?.seller_id) sellerIds.push(k.seller_id);
      } else {
        const j = mockJasa.find((x) => x.id === item.product_id);
        if (j?.seller_id) sellerIds.push(j.seller_id);
      }
    }
  }

  return [...new Set(sellerIds)];
}
