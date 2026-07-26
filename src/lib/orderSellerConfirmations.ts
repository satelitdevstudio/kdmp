import { supabase, isSupabaseConfigured } from './supabase';
import type { Order, OrderItemRecord, OrderSellerConfirmation, OrderStatus } from '../types';
import { collectSellerIdsFromItems } from './sellerOrders';

const STATUS_RANK: Record<OrderStatus, number> = {
  pending: 0,
  confirmed: 1,
  shipped: 2,
  delivered: 3,
  cancelled: -1,
};

const RANK_TO_STATUS: OrderStatus[] = ['pending', 'confirmed', 'shipped', 'delivered'];

export function getItemSellerKey(item: OrderItemRecord): string {
  return `${item.item_type}:${item.product_id}`;
}

export function computeAggregateOrderStatus(
  confirmations: OrderSellerConfirmation[]
): OrderStatus {
  if (confirmations.length === 0) return 'pending';
  if (confirmations.every((c) => c.status === 'cancelled')) return 'cancelled';

  const active = confirmations.filter((c) => c.status !== 'cancelled');
  if (active.length === 0) return 'cancelled';

  const minRank = Math.min(...active.map((c) => STATUS_RANK[c.status]));
  return RANK_TO_STATUS[minRank] ?? 'pending';
}

export function getSellerConfirmationStatus(
  order: Order,
  sellerId: string
): OrderStatus {
  const confirmation = order.seller_confirmations?.find((c) => c.seller_id === sellerId);
  return confirmation?.status ?? order.status;
}

export function groupItemsBySellerId(
  items: OrderItemRecord[],
  itemToSellerId: Record<string, string>
): { sellerId: string; items: OrderItemRecord[] }[] {
  const map = new Map<string, OrderItemRecord[]>();

  for (const item of items) {
    const sellerId = itemToSellerId[getItemSellerKey(item)];
    if (!sellerId) continue;
    const list = map.get(sellerId) ?? [];
    list.push(item);
    map.set(sellerId, list);
  }

  return [...map.entries()].map(([sellerId, groupedItems]) => ({
    sellerId,
    items: groupedItems,
  }));
}

export async function buildInitialSellerConfirmations(
  items: OrderItemRecord[],
  initialStatus: OrderStatus = 'pending'
): Promise<OrderSellerConfirmation[]> {
  const sellerIds = await collectSellerIdsFromItems(items);
  const now = new Date().toISOString();
  return sellerIds.map((seller_id) => ({
    seller_id,
    status: initialStatus,
    updated_at: now,
  }));
}

export async function ensureOrderSellerConfirmations(
  order: Order
): Promise<OrderSellerConfirmation[]> {
  if (order.seller_confirmations?.length) {
    return order.seller_confirmations;
  }
  return buildInitialSellerConfirmations(order.items, order.status);
}

export async function insertSellerConfirmations(
  orderId: string,
  confirmations: OrderSellerConfirmation[]
): Promise<{ error: string | null }> {
  if (!isSupabaseConfigured || !supabase || confirmations.length === 0) {
    return { error: null };
  }

  const { error } = await supabase.from('order_seller_confirmations').insert(
    confirmations.map((c) => ({
      order_id: orderId,
      seller_id: c.seller_id,
      status: c.status,
    }))
  );

  return { error: error?.message ?? null };
}

export function mapConfirmationRows(
  rows: Array<{ seller_id: string; status: OrderStatus; updated_at?: string }> | null | undefined
): OrderSellerConfirmation[] {
  return (rows ?? []).map((row) => ({
    seller_id: row.seller_id,
    status: row.status,
    updated_at: row.updated_at,
  }));
}

export function applySellerStatusUpdate(
  confirmations: OrderSellerConfirmation[],
  sellerId: string,
  status: OrderStatus
): OrderSellerConfirmation[] {
  const now = new Date().toISOString();
  const existing = confirmations.find((c) => c.seller_id === sellerId);

  if (existing) {
    return confirmations.map((c) =>
      c.seller_id === sellerId ? { ...c, status, updated_at: now } : c
    );
  }

  return [...confirmations, { seller_id: sellerId, status, updated_at: now }];
}

export function applyAllSellerStatusUpdate(
  confirmations: OrderSellerConfirmation[],
  status: OrderStatus
): OrderSellerConfirmation[] {
  const now = new Date().toISOString();
  return confirmations.map((c) => ({ ...c, status, updated_at: now }));
}
