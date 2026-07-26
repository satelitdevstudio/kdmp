import { useEffect, useState } from 'react';
import { fetchSponsorBanners } from '../lib/sponsorBanners';
import type { SponsorBanner } from '../types';

export function useSponsorBanners() {
  const [banners, setBanners] = useState<SponsorBanner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    fetchSponsorBanners().then(({ items }) => {
      if (!cancelled) {
        setBanners(items);
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return { banners, loading };
}
