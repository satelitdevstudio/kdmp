import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { fetchProfile, updateProfile, becomeSeller } from '../lib/profile';
import { getDemoBuyerId } from '../lib/orders';
import { isSupabaseConfigured } from '../lib/supabase';
import type { Profile } from '../types';

export function useProfile() {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const userId = user?.id ?? (!isSupabaseConfigured ? getDemoBuyerId() : null);
  const fallbackName = user?.user_metadata?.full_name ?? '';

  const reload = useCallback(async () => {
    if (!userId) {
      setProfile(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const { profile: data, error: fetchError } = await fetchProfile(userId, fallbackName);
    setProfile(data);
    setError(fetchError);
    setLoading(false);
  }, [userId, fallbackName]);

  useEffect(() => {
    if (authLoading) return;
    reload();
  }, [authLoading, reload]);

  const save = async (updates: Partial<Pick<Profile, 'full_name' | 'phone' | 'address'>>) => {
    if (!userId) return { error: 'Tidak ada pengguna aktif' };
    const { profile: updated, error: saveError } = await updateProfile(userId, updates);
    if (updated) setProfile(updated);
    return { error: saveError };
  };

  const upgradeToSeller = async () => {
    if (!userId) return { error: 'Tidak ada pengguna aktif' };
    const { profile: updated, error: upgradeError } = await becomeSeller(userId);
    if (updated) setProfile(updated);
    return { error: upgradeError };
  };

  const isSeller = profile?.role === 'seller' || profile?.role === 'admin';
  const isAdmin = profile?.role === 'admin';

  return { profile, loading: authLoading || loading, error, save, upgradeToSeller, isSeller, isAdmin, reload, userId };
}
