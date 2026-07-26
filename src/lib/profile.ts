import { supabase, isSupabaseConfigured } from './supabase';
import type { Profile } from '../types';

const STORAGE_KEY = 'argasarihub-profile';

function loadLocalProfiles(): Record<string, Profile> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, Profile>) : {};
  } catch {
    return {};
  }
}

function saveLocalProfile(profile: Profile) {
  const profiles = loadLocalProfiles();
  profiles[profile.id] = profile;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
}

export async function fetchProfile(
  userId: string,
  fallbackName = ''
): Promise<{ profile: Profile | null; error: string | null }> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) return { profile: null, error: error.message };
    return { profile: data as Profile, error: null };
  }

  const local = loadLocalProfiles()[userId];
  if (local) return { profile: local, error: null };

  const defaultProfile: Profile = {
    id: userId,
    full_name: fallbackName,
    role: 'buyer',
  };
  saveLocalProfile(defaultProfile);
  return { profile: defaultProfile, error: null };
}

export async function updateProfile(
  userId: string,
  updates: Partial<Pick<Profile, 'full_name' | 'phone' | 'address' | 'role'>>
): Promise<{ profile: Profile | null; error: string | null }> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) return { profile: null, error: error.message };
    return { profile: data as Profile, error: null };
  }

  const profiles = loadLocalProfiles();
  const existing = profiles[userId] ?? { id: userId, full_name: '', role: 'buyer' as const };
  const updated: Profile = { ...existing, ...updates };
  saveLocalProfile(updated);
  return { profile: updated, error: null };
}

export async function becomeSeller(userId: string): Promise<{ profile: Profile | null; error: string | null }> {
  return updateProfile(userId, { role: 'seller' });
}
