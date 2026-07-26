import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { applySiteMeta, fetchSiteSettings } from '../lib/siteSettings';
import { defaultSiteSettings } from '../data/defaultSiteSettings';
import type { SiteSettings } from '../types';

type SiteSettingsContextValue = {
  settings: SiteSettings;
  loading: boolean;
  refresh: () => Promise<void>;
  updateSettings: (settings: SiteSettings) => void;
};

const SiteSettingsContext = createContext<SiteSettingsContextValue | null>(null);

export function SiteSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SiteSettings>(defaultSiteSettings);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const { settings: data } = await fetchSiteSettings();
    setSettings(data);
    applySiteMeta(data);
    setLoading(false);
  }, []);

  const updateSettings = useCallback((next: SiteSettings) => {
    setSettings(next);
    applySiteMeta(next);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <SiteSettingsContext.Provider value={{ settings, loading, refresh, updateSettings }}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() {
  const ctx = useContext(SiteSettingsContext);
  if (!ctx) {
    throw new Error('useSiteSettings must be used within SiteSettingsProvider');
  }
  return ctx;
}
