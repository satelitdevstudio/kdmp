import type { LucideIcon } from 'lucide-react';
import {
  Shield,
  ClipboardList,
  Package,
  Tags,
  Star,
  UtensilsCrossed,
  ShieldCheck,
  Newspaper,
  Calendar,
  Tv,
  Wrench,
  MapPin,
  Briefcase,
  Megaphone,
  Users,
  Store,
  Landmark,
  Settings,
} from 'lucide-react';

export type AdminTab =
  | 'ringkasan'
  | 'pesanan'
  | 'produk'
  | 'kuliner'
  | 'berita'
  | 'event'
  | 'video'
  | 'jasa'
  | 'wisata'
  | 'lowongan'
  | 'sponsor'
  | 'kategori'
  | 'produk-pilihan'
  | 'moderasi'
  | 'pengguna'
  | 'pengaturan';

export type AdminNavItem = {
  id: AdminTab;
  label: string;
  icon: LucideIcon;
};

export type AdminNavGroup = {
  id: string;
  label: string;
  icon: LucideIcon;
  items: AdminNavItem[];
};

export type AdminNavEntry =
  | { type: 'item'; item: AdminNavItem }
  | { type: 'group'; group: AdminNavGroup };

export const ADMIN_NAV: AdminNavEntry[] = [
  { type: 'item', item: { id: 'ringkasan', label: 'Ringkasan', icon: Shield } },
  {
    type: 'group',
    group: {
      id: 'operasional',
      label: 'Operasional',
      icon: ClipboardList,
      items: [{ id: 'pesanan', label: 'Pesanan', icon: ClipboardList }],
    },
  },
  {
    type: 'group',
    group: {
      id: 'marketplace',
      label: 'Marketplace',
      icon: Store,
      items: [
        { id: 'produk', label: 'Daftar Produk', icon: Package },
        { id: 'moderasi', label: 'Moderasi', icon: ShieldCheck },
        { id: 'kategori', label: 'Kategori', icon: Tags },
        { id: 'produk-pilihan', label: 'Produk Pilihan', icon: Star },
        { id: 'kuliner', label: 'Kuliner', icon: UtensilsCrossed },
      ],
    },
  },
  {
    type: 'group',
    group: {
      id: 'konten',
      label: 'Konten Desa',
      icon: Landmark,
      items: [
        { id: 'berita', label: 'Info Desa', icon: Newspaper },
        { id: 'event', label: 'Event', icon: Calendar },
        { id: 'video', label: 'Channel TV', icon: Tv },
        { id: 'jasa', label: 'Jasa', icon: Wrench },
        { id: 'wisata', label: 'Wisata', icon: MapPin },
        { id: 'lowongan', label: 'Lowongan', icon: Briefcase },
        { id: 'sponsor', label: 'Sponsor', icon: Megaphone },
      ],
    },
  },
  { type: 'item', item: { id: 'pengguna', label: 'Pengguna', icon: Users } },
  { type: 'item', item: { id: 'pengaturan', label: 'Pengaturan Template', icon: Settings } },
];

export const CONTENT_TABS: AdminTab[] = [
  'berita',
  'event',
  'video',
  'jasa',
  'wisata',
  'lowongan',
  'sponsor',
  'kategori',
  'produk-pilihan',
];

export function getAdminTabLabel(tab: AdminTab): string {
  for (const entry of ADMIN_NAV) {
    if (entry.type === 'item' && entry.item.id === tab) return entry.item.label;
    if (entry.type === 'group') {
      const found = entry.group.items.find((i) => i.id === tab);
      if (found) return found.label;
    }
  }
  return tab;
}

export function getAdminTabGroupId(tab: AdminTab): string | null {
  for (const entry of ADMIN_NAV) {
    if (entry.type === 'item' && entry.item.id === tab) return entry.item.id;
    if (entry.type === 'group' && entry.group.items.some((i) => i.id === tab)) {
      return entry.group.id;
    }
  }
  return null;
}

/** Mobile top-level sections (standalone items + groups) */
export const ADMIN_MOBILE_SECTIONS: {
  id: string;
  label: string;
  icon: LucideIcon;
  tab?: AdminTab;
  groupId?: string;
}[] = [
  { id: 'ringkasan', label: 'Ringkasan', icon: Shield, tab: 'ringkasan' },
  { id: 'operasional', label: 'Operasional', icon: ClipboardList, groupId: 'operasional' },
  { id: 'marketplace', label: 'Marketplace', icon: Store, groupId: 'marketplace' },
  { id: 'konten', label: 'Konten Desa', icon: Landmark, groupId: 'konten' },
  { id: 'pengguna', label: 'Pengguna', icon: Users, tab: 'pengguna' },
  { id: 'pengaturan', label: 'Pengaturan', icon: Settings, tab: 'pengaturan' },
];
