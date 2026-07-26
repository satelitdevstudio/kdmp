import { useCallback, useEffect, useState } from 'react';
import { useProfile } from './useProfile';
import {
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '../lib/notifications';
import type { AppNotification } from '../types';

export function useNotifications() {
  const { userId } = useProfile();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    if (!userId) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const { notifications: data } = await fetchNotifications(userId);
    setNotifications(data);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    reload();
    const interval = setInterval(reload, 30000);
    return () => clearInterval(interval);
  }, [reload]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markRead = async (id: string) => {
    if (!userId) return;
    await markNotificationRead(id, userId);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllRead = async () => {
    if (!userId) return;
    await markAllNotificationsRead(userId);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return { notifications, unreadCount, loading, markRead, markAllRead, reload };
}
