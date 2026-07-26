import { mockProducts } from '../data/mockProducts';
import { mockKuliner } from '../data/mockKuliner';
import { mockJasa } from '../data/mockJasa';
import { mockEvents } from '../data/mockEvents';
import { mockWisata } from '../data/mockWisata';
import { mockLowongan } from '../data/mockLowongan';
import { mockVillageNews } from '../data/mockVillageNews';
import { getLocalSellerProducts } from './sellerProducts';
import { getLocalSellerKuliner } from './sellerKuliner';
import { fetchVillageNews } from './villageNews';
import { isPublicListing } from '../types';

export type SearchResultType =
  | 'produk'
  | 'kuliner'
  | 'jasa'
  | 'event'
  | 'wisata'
  | 'lowongan'
  | 'info';

export interface SearchResult {
  id: string;
  type: SearchResultType;
  title: string;
  subtitle: string;
  image_url: string;
  to: string;
  opening_time?: string;
  closing_time?: string;
  is_available?: boolean;
}

const TYPE_LABELS: Record<SearchResultType, string> = {
  produk: 'Produk Desa',
  kuliner: 'Kuliner',
  jasa: 'Jasa Warga',
  event: 'Event Desa',
  wisata: 'Wisata',
  lowongan: 'Lowongan',
  info: 'Info Desa',
};

export { TYPE_LABELS };

function matches(query: string, ...fields: string[]): boolean {
  const q = query.toLowerCase();
  return fields.some((f) => f.toLowerCase().includes(q));
}

export async function globalSearch(query: string): Promise<SearchResult[]> {
  const q = query.trim();
  if (!q) return [];

  const sellerProducts = getLocalSellerProducts().filter(isPublicListing);
  const products = [
    ...sellerProducts,
    ...mockProducts.filter((m) => !sellerProducts.some((s) => s.id === m.id)),
  ];

  const sellerKuliner = getLocalSellerKuliner().filter(isPublicListing);
  const kuliner = [
    ...sellerKuliner,
    ...mockKuliner.filter((m) => !sellerKuliner.some((s) => s.id === m.id)),
  ];

  const { items: news } = await fetchVillageNews({ search: q });

  const results: SearchResult[] = [];

  for (const p of products) {
    if (matches(q, p.name, p.village, p.description)) {
      results.push({
        id: p.id,
        type: 'produk',
        title: p.name,
        subtitle: p.village,
        image_url: p.image_url,
        to: `/produk/${p.id}`,
      });
    }
  }

  for (const k of kuliner) {
    if (matches(q, k.name, k.seller_name, k.village, k.description)) {
      results.push({
        id: k.id,
        type: 'kuliner',
        title: k.name,
        subtitle: `${k.seller_name} · ${k.village}`,
        image_url: k.image_url,
        to: `/kuliner/${k.id}`,
        opening_time: k.opening_time,
        closing_time: k.closing_time,
        is_available: k.is_available,
      });
    }
  }

  for (const j of mockJasa) {
    if (matches(q, j.name, j.provider_name, j.village, j.description)) {
      results.push({
        id: j.id,
        type: 'jasa',
        title: j.name,
        subtitle: `${j.provider_name} · ${j.village}`,
        image_url: j.image_url,
        to: `/jasa/${j.id}`,
      });
    }
  }

  for (const e of mockEvents) {
    if (matches(q, e.title, e.location, e.village, e.description)) {
      results.push({
        id: e.id,
        type: 'event',
        title: e.title,
        subtitle: `${e.location}, ${e.village}`,
        image_url: e.image_url,
        to: `/event/${e.id}`,
      });
    }
  }

  for (const w of mockWisata) {
    if (matches(q, w.name, w.village, w.description)) {
      results.push({
        id: w.id,
        type: 'wisata',
        title: w.name,
        subtitle: w.village,
        image_url: w.image_url,
        to: `/wisata/${w.id}`,
      });
    }
  }

  for (const l of mockLowongan) {
    if (matches(q, l.title, l.company, l.village, l.description)) {
      results.push({
        id: l.id,
        type: 'lowongan',
        title: l.title,
        subtitle: `${l.company} · ${l.village}`,
        image_url: l.image_url,
        to: `/lowongan/${l.id}`,
      });
    }
  }

  for (const n of news.length > 0 ? news : mockVillageNews.filter((item) =>
    matches(q, item.title, item.excerpt, item.village)
  )) {
    results.push({
      id: n.id,
      type: 'info',
      title: n.title,
      subtitle: n.village,
      image_url: n.image_url,
      to: `/info-desa/${n.id}`,
    });
  }

  return results;
}
