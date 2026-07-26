import { supabase, isSupabaseConfigured } from './supabase';
import { mockEvents, mockChannelVideos } from '../data/mockEvents';
import { mockJasa } from '../data/mockJasa';
import { mockWisata } from '../data/mockWisata';
import { mockLowongan } from '../data/mockLowongan';
import { mockVillageNews } from '../data/mockVillageNews';
import type {
  ChannelVideo,
  EmploymentType,
  EventCategory,
  Jasa,
  JasaCategory,
  Lowongan,
  VillageEvent,
  VillageNews,
  VillageNewsCategory,
  Wisata,
  WisataType,
} from '../types';

const KEYS = {
  news: 'argasarihub-village-news',
  events: 'argasarihub-events',
  videos: 'argasarihub-channel-videos',
  jasa: 'argasarihub-jasa',
  wisata: 'argasarihub-wisata',
  lowongan: 'argasarihub-lowongan',
} as const;

function loadLocal<T>(key: string, fallback: T[]): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw) as T[];
  } catch {
    /* ignore */
  }
  return fallback;
}

function saveLocal<T>(key: string, items: T[]) {
  localStorage.setItem(key, JSON.stringify(items));
}

function ensureLocal<T extends { id: string }>(key: string, fallback: T[]): T[] {
  const items = loadLocal(key, fallback);
  if (!localStorage.getItem(key)) {
    saveLocal(key, items);
  }
  return items;
}

// --- Public getters for hooks (demo mode) ---

export function getLocalEvents(): VillageEvent[] {
  return loadLocal(KEYS.events, mockEvents);
}

export function getLocalChannelVideos(): ChannelVideo[] {
  return loadLocal(KEYS.videos, mockChannelVideos);
}

export function getLocalJasa(): Jasa[] {
  return loadLocal(KEYS.jasa, mockJasa);
}

export function getLocalWisata(): Wisata[] {
  return loadLocal(KEYS.wisata, mockWisata);
}

export function getLocalLowongan(): Lowongan[] {
  return loadLocal(KEYS.lowongan, mockLowongan);
}

// --- Village News ---

export type VillageNewsInput = {
  title: string;
  excerpt: string;
  content: string;
  category: VillageNewsCategory;
  village: string;
  image_url: string;
  author: string;
  published: boolean;
};

export async function adminCreateVillageNews(
  input: VillageNewsInput
): Promise<{ item: VillageNews | null; error: string | null }> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from('village_news').insert(input).select().single();
    if (error) return { item: null, error: error.message };
    return { item: data as VillageNews, error: null };
  }

  const item: VillageNews = {
    id: crypto.randomUUID(),
    ...input,
    created_at: new Date().toISOString(),
  };
  const items = ensureLocal(KEYS.news, mockVillageNews);
  saveLocal(KEYS.news, [item, ...items]);
  return { item, error: null };
}

export async function adminUpdateVillageNews(
  id: string,
  input: Partial<VillageNewsInput>
): Promise<{ item: VillageNews | null; error: string | null }> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from('village_news').update(input).eq('id', id).select().single();
    if (error) return { item: null, error: error.message };
    return { item: data as VillageNews, error: null };
  }

  const items = ensureLocal(KEYS.news, mockVillageNews);
  const idx = items.findIndex((n) => n.id === id);
  if (idx === -1) return { item: null, error: 'Artikel tidak ditemukan' };
  const updated = { ...items[idx], ...input };
  items[idx] = updated;
  saveLocal(KEYS.news, items);
  return { item: updated, error: null };
}

// --- Events ---

export type EventInput = {
  title: string;
  description: string;
  location: string;
  village: string;
  category: EventCategory;
  event_date: string;
  end_date?: string;
  sponsors_count: number;
  image_url: string;
};

export async function fetchAllEventsAdmin(): Promise<{ items: VillageEvent[]; error: string | null }> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from('village_events').select('*').order('event_date', { ascending: true });
    if (error) return { items: [], error: error.message };
    return { items: (data as VillageEvent[]) ?? [], error: null };
  }
  return { items: getLocalEvents(), error: null };
}

export async function adminCreateEvent(input: EventInput): Promise<{ item: VillageEvent | null; error: string | null }> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from('village_events').insert(input).select().single();
    if (error) return { item: null, error: error.message };
    return { item: data as VillageEvent, error: null };
  }

  const item: VillageEvent = { id: crypto.randomUUID(), ...input, created_at: new Date().toISOString() };
  const items = ensureLocal(KEYS.events, mockEvents);
  saveLocal(KEYS.events, [item, ...items]);
  return { item, error: null };
}

export async function adminUpdateEvent(
  id: string,
  input: Partial<EventInput>
): Promise<{ item: VillageEvent | null; error: string | null }> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from('village_events').update(input).eq('id', id).select().single();
    if (error) return { item: null, error: error.message };
    return { item: data as VillageEvent, error: null };
  }

  const items = ensureLocal(KEYS.events, mockEvents);
  const idx = items.findIndex((e) => e.id === id);
  if (idx === -1) return { item: null, error: 'Event tidak ditemukan' };
  const updated = { ...items[idx], ...input };
  items[idx] = updated;
  saveLocal(KEYS.events, items);
  return { item: updated, error: null };
}

export async function adminDeleteEvent(id: string): Promise<{ error: string | null }> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from('village_events').delete().eq('id', id);
    return { error: error?.message ?? null };
  }
  saveLocal(KEYS.events, ensureLocal(KEYS.events, mockEvents).filter((e) => e.id !== id));
  return { error: null };
}

// --- Channel Videos ---

export type ChannelVideoInput = {
  title: string;
  description: string;
  duration: string;
  image_url: string;
  is_live: boolean;
  viewer_count?: number;
  video_url?: string;
  village: string;
};

export async function fetchAllVideosAdmin(): Promise<{ items: ChannelVideo[]; error: string | null }> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from('channel_videos').select('*').order('created_at', { ascending: false });
    if (error) return { items: [], error: error.message };
    return { items: (data as ChannelVideo[]) ?? [], error: null };
  }
  return { items: getLocalChannelVideos(), error: null };
}

export async function adminCreateVideo(
  input: ChannelVideoInput
): Promise<{ item: ChannelVideo | null; error: string | null }> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from('channel_videos').insert(input).select().single();
    if (error) return { item: null, error: error.message };
    return { item: data as ChannelVideo, error: null };
  }

  const item: ChannelVideo = { id: crypto.randomUUID(), ...input, created_at: new Date().toISOString() };
  const items = ensureLocal(KEYS.videos, mockChannelVideos);
  saveLocal(KEYS.videos, [item, ...items]);
  return { item, error: null };
}

export async function adminUpdateVideo(
  id: string,
  input: Partial<ChannelVideoInput>
): Promise<{ item: ChannelVideo | null; error: string | null }> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from('channel_videos').update(input).eq('id', id).select().single();
    if (error) return { item: null, error: error.message };
    return { item: data as ChannelVideo, error: null };
  }

  const items = ensureLocal(KEYS.videos, mockChannelVideos);
  const idx = items.findIndex((v) => v.id === id);
  if (idx === -1) return { item: null, error: 'Video tidak ditemukan' };
  const updated = { ...items[idx], ...input };
  items[idx] = updated;
  saveLocal(KEYS.videos, items);
  return { item: updated, error: null };
}

export async function adminDeleteVideo(id: string): Promise<{ error: string | null }> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from('channel_videos').delete().eq('id', id);
    return { error: error?.message ?? null };
  }
  saveLocal(KEYS.videos, ensureLocal(KEYS.videos, mockChannelVideos).filter((v) => v.id !== id));
  return { error: null };
}

// --- Jasa ---

export type JasaInput = {
  name: string;
  description: string;
  provider_name: string;
  village: string;
  category: JasaCategory;
  price: number;
  price_unit: string;
  phone: string;
  is_available: boolean;
  image_url: string;
};

export async function fetchAllJasaAdmin(): Promise<{ items: Jasa[]; error: string | null }> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from('jasa').select('*').order('created_at', { ascending: false });
    if (error) return { items: [], error: error.message };
    return { items: (data as Jasa[]) ?? [], error: null };
  }
  return { items: getLocalJasa(), error: null };
}

export async function adminCreateJasa(input: JasaInput): Promise<{ item: Jasa | null; error: string | null }> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from('jasa').insert({ ...input, rating: 0 }).select().single();
    if (error) return { item: null, error: error.message };
    return { item: data as Jasa, error: null };
  }

  const item: Jasa = { id: crypto.randomUUID(), ...input, rating: 0, created_at: new Date().toISOString() };
  const items = ensureLocal(KEYS.jasa, mockJasa);
  saveLocal(KEYS.jasa, [item, ...items]);
  return { item, error: null };
}

export async function adminUpdateJasa(
  id: string,
  input: Partial<JasaInput>
): Promise<{ item: Jasa | null; error: string | null }> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from('jasa').update(input).eq('id', id).select().single();
    if (error) return { item: null, error: error.message };
    return { item: data as Jasa, error: null };
  }

  const items = ensureLocal(KEYS.jasa, mockJasa);
  const idx = items.findIndex((j) => j.id === id);
  if (idx === -1) return { item: null, error: 'Jasa tidak ditemukan' };
  const updated = { ...items[idx], ...input };
  items[idx] = updated;
  saveLocal(KEYS.jasa, items);
  return { item: updated, error: null };
}

export async function adminDeleteJasa(id: string): Promise<{ error: string | null }> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from('jasa').delete().eq('id', id);
    return { error: error?.message ?? null };
  }
  saveLocal(KEYS.jasa, ensureLocal(KEYS.jasa, mockJasa).filter((j) => j.id !== id));
  return { error: null };
}

// --- Wisata ---

export type WisataInput = {
  name: string;
  description: string;
  village: string;
  type: WisataType;
  price: number;
  price_label: string;
  phone: string;
  facilities: string[];
  image_url: string;
};

export async function fetchAllWisataAdmin(): Promise<{ items: Wisata[]; error: string | null }> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from('wisata').select('*').order('created_at', { ascending: false });
    if (error) return { items: [], error: error.message };
    return { items: (data as Wisata[]) ?? [], error: null };
  }
  return { items: getLocalWisata(), error: null };
}

export async function adminCreateWisata(input: WisataInput): Promise<{ item: Wisata | null; error: string | null }> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from('wisata').insert({ ...input, rating: 0 }).select().single();
    if (error) return { item: null, error: error.message };
    return { item: data as Wisata, error: null };
  }

  const item: Wisata = { id: crypto.randomUUID(), ...input, rating: 0, created_at: new Date().toISOString() };
  const items = ensureLocal(KEYS.wisata, mockWisata);
  saveLocal(KEYS.wisata, [item, ...items]);
  return { item, error: null };
}

export async function adminUpdateWisata(
  id: string,
  input: Partial<WisataInput>
): Promise<{ item: Wisata | null; error: string | null }> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from('wisata').update(input).eq('id', id).select().single();
    if (error) return { item: null, error: error.message };
    return { item: data as Wisata, error: null };
  }

  const items = ensureLocal(KEYS.wisata, mockWisata);
  const idx = items.findIndex((w) => w.id === id);
  if (idx === -1) return { item: null, error: 'Wisata tidak ditemukan' };
  const updated = { ...items[idx], ...input };
  items[idx] = updated;
  saveLocal(KEYS.wisata, items);
  return { item: updated, error: null };
}

export async function adminDeleteWisata(id: string): Promise<{ error: string | null }> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from('wisata').delete().eq('id', id);
    return { error: error?.message ?? null };
  }
  saveLocal(KEYS.wisata, ensureLocal(KEYS.wisata, mockWisata).filter((w) => w.id !== id));
  return { error: null };
}

// --- Lowongan ---

export type LowonganInput = {
  title: string;
  company: string;
  village: string;
  description: string;
  salary_range: string;
  employment_type: EmploymentType;
  requirements: string[];
  deadline: string;
  image_url: string;
  contact_phone: string;
};

export async function fetchAllLowonganAdmin(): Promise<{ items: Lowongan[]; error: string | null }> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from('lowongan').select('*').order('deadline', { ascending: true });
    if (error) return { items: [], error: error.message };
    return { items: (data as Lowongan[]) ?? [], error: null };
  }
  return { items: getLocalLowongan(), error: null };
}

export async function adminCreateLowongan(
  input: LowonganInput
): Promise<{ item: Lowongan | null; error: string | null }> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from('lowongan').insert(input).select().single();
    if (error) return { item: null, error: error.message };
    return { item: data as Lowongan, error: null };
  }

  const item: Lowongan = { id: crypto.randomUUID(), ...input, created_at: new Date().toISOString() };
  const items = ensureLocal(KEYS.lowongan, mockLowongan);
  saveLocal(KEYS.lowongan, [item, ...items]);
  return { item, error: null };
}

export async function adminUpdateLowongan(
  id: string,
  input: Partial<LowonganInput>
): Promise<{ item: Lowongan | null; error: string | null }> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.from('lowongan').update(input).eq('id', id).select().single();
    if (error) return { item: null, error: error.message };
    return { item: data as Lowongan, error: null };
  }

  const items = ensureLocal(KEYS.lowongan, mockLowongan);
  const idx = items.findIndex((l) => l.id === id);
  if (idx === -1) return { item: null, error: 'Lowongan tidak ditemukan' };
  const updated = { ...items[idx], ...input };
  items[idx] = updated;
  saveLocal(KEYS.lowongan, items);
  return { item: updated, error: null };
}

export async function adminDeleteLowongan(id: string): Promise<{ error: string | null }> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from('lowongan').delete().eq('id', id);
    return { error: error?.message ?? null };
  }
  saveLocal(KEYS.lowongan, ensureLocal(KEYS.lowongan, mockLowongan).filter((l) => l.id !== id));
  return { error: null };
}
