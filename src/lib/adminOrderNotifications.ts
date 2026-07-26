import type { Order } from '../types';

const STORAGE_KEY = 'argasarihub-admin-seen-orders';

function loadSeenOrderIds(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

function saveSeenOrderIds(seen: Set<string>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...seen]));
}

export function getUnseenOrderIds(orders: Order[]): string[] {
  const seen = loadSeenOrderIds();
  return orders.filter((order) => order.status === 'pending' && !seen.has(order.id)).map((order) => order.id);
}

export function countNewOrders(orders: Order[]): number {
  return getUnseenOrderIds(orders).length;
}

export function markOrdersAsSeen(orderIds: string[]): void {
  if (orderIds.length === 0) return;
  const seen = loadSeenOrderIds();
  for (const id of orderIds) {
    seen.add(id);
  }
  saveSeenOrderIds(seen);
}

export function markAllOrdersAsSeen(orders: Order[]): void {
  markOrdersAsSeen(orders.map((order) => order.id));
}
