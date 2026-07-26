import { supabase, isSupabaseConfigured } from './supabase';
import { defaultSiteSettings } from '../data/defaultSiteSettings';
import type { SiteSettings, SiteSettingsInput } from '../types';

const STORAGE_KEY = 'argasarihub-site-settings';
const SETTINGS_ID = 'default';

function loadLocal(): SiteSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as SiteSettings;
  } catch {
    /* fallback to default */
  }
  return { ...defaultSiteSettings };
}

function saveLocal(settings: SiteSettings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

function ensureLocal(): SiteSettings {
  const settings = loadLocal();
  if (!localStorage.getItem(STORAGE_KEY)) {
    saveLocal(settings);
  }
  return settings;
}

export async function fetchSiteSettings(): Promise<{
  settings: SiteSettings;
  error: string | null;
}> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .eq('id', SETTINGS_ID)
      .maybeSingle();

    if (error) return { settings: defaultSiteSettings, error: error.message };
    if (!data) return { settings: defaultSiteSettings, error: null };
    return { settings: data as SiteSettings, error: null };
  }

  return { settings: ensureLocal(), error: null };
}

export async function adminUpdateSiteSettings(
  input: SiteSettingsInput
): Promise<{ settings: SiteSettings | null; error: string | null }> {
  const payload = {
    ...input,
    site_tagline: input.site_tagline?.trim() || null,
    logo_url: input.logo_url?.trim() || null,
    favicon_url: input.favicon_url?.trim() || null,
    hero_background_url: input.hero_background_url?.trim() || null,
    hero_title: input.hero_title?.trim() || null,
    hero_subtitle: input.hero_subtitle?.trim() || null,
    contact_phone: input.contact_phone?.trim() || null,
    contact_email: input.contact_email?.trim() || null,
    updated_at: new Date().toISOString(),
  };

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('site_settings')
      .upsert({ id: SETTINGS_ID, ...payload })
      .select()
      .single();

    if (error) return { settings: null, error: error.message };
    return { settings: data as SiteSettings, error: null };
  }

  const settings: SiteSettings = {
    id: SETTINGS_ID,
    ...payload,
  };
  saveLocal(settings);
  return { settings, error: null };
}

export function applySiteMeta(settings: SiteSettings) {
  document.title = settings.site_title;

  const descriptionMeta = document.querySelector('meta[name="description"]');
  if (descriptionMeta) {
    descriptionMeta.setAttribute('content', settings.site_description);
  }

  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) {
    ogTitle.setAttribute('content', settings.site_title);
  }

  const ogDescription = document.querySelector('meta[property="og:description"]');
  if (ogDescription) {
    ogDescription.setAttribute('content', settings.site_description);
  }

  if (settings.favicon_url) {
    let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = settings.favicon_url;
  }
}
