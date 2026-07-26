import { useCallback, useMemo, useState } from 'react';
import {
  countNewOrders,
  getUnseenOrderIds,
  markAllOrdersAsSeen,
} from '../lib/adminOrderNotifications';
import type { Order } from '../types';

export function useAdminOrderNotifications(orders: Order[]) {
  const [seenVersion, setSeenVersion] = useState(0);

  const newOrderCount = useMemo(
    () => countNewOrders(orders),
    [orders, seenVersion]
  );

  const unseenOrderIds = useMemo(
    () => new Set(getUnseenOrderIds(orders)),
    [orders, seenVersion]
  );

  const markAllSeen = useCallback(() => {
    markAllOrdersAsSeen(orders);
    setSeenVersion((version) => version + 1);
  }, [orders]);

  return { newOrderCount, unseenOrderIds, markAllSeen };
}
