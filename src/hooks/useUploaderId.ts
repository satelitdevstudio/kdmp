import { useAuth } from '../contexts/AuthContext';
import { getDemoBuyerId } from '../lib/orders';
import { isSupabaseConfigured } from '../lib/supabase';

export function useUploaderId() {
  const { user, loading } = useAuth();
  const uploaderId = user?.id ?? (!isSupabaseConfigured ? getDemoBuyerId() : null);
  return { uploaderId, loading };
}
