import { useEffect, useRef } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export type OrderRealtimeRole = 'buyer' | 'seller' | 'admin';

interface UseOrderRealtimeOptions {
  role: OrderRealtimeRole;
  userId?: string;
  enabled?: boolean;
  onUpdate: () => void | Promise<void>;
}

const DEBOUNCE_MS = 300;

export function useOrderRealtime({
  role,
  userId,
  enabled = true,
  onUpdate,
}: UseOrderRealtimeOptions) {
  const onUpdateRef = useRef(onUpdate);
  onUpdateRef.current = onUpdate;

  useEffect(() => {
    if (!enabled || !isSupabaseConfigured || !supabase) return;
    if (role !== 'admin' && !userId) return;

    let debounceTimer: ReturnType<typeof setTimeout> | null = null;

    const triggerUpdate = () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        void onUpdateRef.current();
      }, DEBOUNCE_MS);
    };

    const channelId =
      role === 'admin' ? 'orders-admin' : role === 'buyer' ? `orders-buyer-${userId}` : `orders-seller-${userId}`;
    const channel = supabase.channel(channelId);

    if (role === 'buyer') {
      channel
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'orders', filter: `buyer_id=eq.${userId}` },
          triggerUpdate
        )
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'order_seller_confirmations' },
          triggerUpdate
        );
    } else if (role === 'seller') {
      channel
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'order_seller_confirmations',
            filter: `seller_id=eq.${userId}`,
          },
          triggerUpdate
        )
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders' }, triggerUpdate);
    } else {
      channel
        .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, triggerUpdate)
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'order_seller_confirmations' },
          triggerUpdate
        );
    }

    channel.subscribe();

    return () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      void supabase.removeChannel(channel);
    };
  }, [role, userId, enabled]);
}
