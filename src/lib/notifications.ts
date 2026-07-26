import { supabase, isSupabaseConfigured } from './supabase';
import { fetchAdminIds } from './admin';
import type { AppNotification, NotificationType, Order, OrderStatus } from '../types';
import { ORDER_STATUS_LABELS } from '../types';

const STORAGE_KEY = 'argasarihub-notifications';

function loadLocal(): AppNotification[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AppNotification[]) : [];
  } catch {
    return [];
  }
}

function saveLocal(notifications: AppNotification[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
}

export async function fetchNotifications(
  userId: string
): Promise<{ notifications: AppNotification[]; error: string | null }> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) return { notifications: [], error: error.message };
    return { notifications: (data as AppNotification[]) ?? [], error: null };
  }

  const notifications = loadLocal()
    .filter((n) => n.user_id === userId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  return { notifications, error: null };
}

export async function createNotification(
  userId: string,
  title: string,
  body: string,
  type: NotificationType,
  link?: string
): Promise<{ error: string | null }> {
  const notification: AppNotification = {
    id: crypto.randomUUID(),
    user_id: userId,
    title,
    body,
    type,
    link,
    read: false,
    created_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from('notifications').insert({
      user_id: userId,
      title,
      body,
      type,
      link,
      read: false,
    });
    return { error: error?.message ?? null };
  }

  saveLocal([notification, ...loadLocal()]);
  return { error: null };
}

export async function markNotificationRead(
  notificationId: string,
  userId: string
): Promise<{ error: string | null }> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId)
      .eq('user_id', userId);
    return { error: error?.message ?? null };
  }

  const all = loadLocal().map((n) =>
    n.id === notificationId && n.user_id === userId ? { ...n, read: true } : n
  );
  saveLocal(all);
  return { error: null };
}

export async function markAllNotificationsRead(
  userId: string
): Promise<{ error: string | null }> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false);
    return { error: error?.message ?? null };
  }

  const all = loadLocal().map((n) =>
    n.user_id === userId ? { ...n, read: true } : n
  );
  saveLocal(all);
  return { error: null };
}

export async function notifyOrderCreated(
  order: Order,
  sellerIds: string[]
): Promise<void> {
  await createNotification(
    order.buyer_id,
    'Pesanan Berhasil Dibuat',
    `Pesanan #${order.id.slice(0, 8)} menunggu konfirmasi penjual.`,
    'order',
    '/pesanan'
  );

  const uniqueSellers = [...new Set(sellerIds.filter((id) => id !== order.buyer_id))];
  for (const sellerId of uniqueSellers) {
    await createNotification(
      sellerId,
      'Pesanan Baru Masuk',
      `Ada pesanan baru #${order.id.slice(0, 8)} — cek dashboard penjual.`,
      'order',
      '/seller'
    );
  }

  const adminIds = await fetchAdminIds();
  for (const adminId of adminIds) {
    if (adminId === order.buyer_id) continue;
    await createNotification(
      adminId,
      'Pesanan Baru Perlu Konfirmasi',
      `Pesanan #${order.id.slice(0, 8)} menunggu konfirmasi — kelola di dashboard admin.`,
      'order',
      '/admin'
    );
  }
}

export async function notifyOrderStatusChanged(
  order: Order,
  newStatus: OrderStatus
): Promise<void> {
  await createNotification(
    order.buyer_id,
    'Status Pesanan Diperbarui',
    `Pesanan #${order.id.slice(0, 8)}: ${ORDER_STATUS_LABELS[newStatus]}`,
    'order',
    '/pesanan'
  );
}
