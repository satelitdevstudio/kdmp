/** Slug kategori produk — dinamis, dikelola admin */
export type ProductCategory = string;

export interface ProductCategoryRecord {
  id: string;
  slug: string;
  label: string;
  image_url: string;
  is_active: boolean;
  sort_order: number;
  created_at?: string;
}

export interface ProductCategoryInput {
  slug: string;
  label: string;
  image_url: string;
  is_active: boolean;
  sort_order: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  village: string;
  category: ProductCategory;
  rating: number;
  stock: number;
  image_url: string;
  seller_id?: string;
  moderation_status?: ModerationStatus;
  moderation_note?: string;
  reviewed_at?: string;
  created_at?: string;
}

/** Produk milik koperasi/admin (bukan UMKM penjual) */
export function isPlatformProduct(product: Product): boolean {
  return !product.seller_id;
}

/** Produk milik penjual UMKM */
export function isSellerProduct(product: Product): boolean {
  return !!product.seller_id;
}

export type KulinerCategory =
  | 'makanan-berat'
  | 'camilan'
  | 'minuman'
  | 'kue-tradisional'
  | 'masakan-rumahan';

export interface Kuliner {
  id: string;
  name: string;
  description: string;
  price: number;
  seller_name: string;
  village: string;
  category: KulinerCategory;
  rating: number;
  delivery_time: string;
  is_available: boolean;
  opening_time?: string;
  closing_time?: string;
  image_url: string;
  seller_id?: string;
  moderation_status?: ModerationStatus;
  moderation_note?: string;
  reviewed_at?: string;
  created_at?: string;
}

export type CartItem =
  | { type: 'product'; product: Product; quantity: number }
  | { type: 'kuliner'; kuliner: Kuliner; quantity: number }
  | { type: 'jasa'; jasa: Jasa; quantity: number };

export type ModerationStatus = 'pending' | 'approved' | 'rejected';

export const MODERATION_STATUS_LABELS: Record<ModerationStatus, string> = {
  pending: 'Menunggu Review',
  approved: 'Disetujui',
  rejected: 'Ditolak',
};

export interface ModeratableListing {
  seller_id?: string;
  moderation_status?: ModerationStatus;
}

export function getModerationStatus(item: ModeratableListing): ModerationStatus {
  if (!item.seller_id) return 'approved';
  return item.moderation_status ?? 'approved';
}

export function isPublicListing(item: ModeratableListing): boolean {
  return getModerationStatus(item) === 'approved';
}

export type OrderItemType = 'product' | 'kuliner' | 'jasa';

export type NotificationType = 'order' | 'promo' | 'info' | 'kuliner';

export interface AppNotification {
  id: string;
  user_id: string;
  title: string;
  body: string;
  type: NotificationType;
  link?: string;
  read: boolean;
  created_at: string;
}

export interface Profile {
  id: string;
  full_name: string;
  phone?: string;
  address?: string;
  role: 'buyer' | 'seller' | 'admin';
}

export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderSellerConfirmation {
  seller_id: string;
  status: OrderStatus;
  updated_at?: string;
}

export interface OrderItemRecord {
  id?: string;
  item_type: OrderItemType;
  product_id: string;
  product_name: string;
  product_image_url: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  buyer_id: string;
  status: OrderStatus;
  total: number;
  shipping_address: string;
  created_at: string;
  items: OrderItemRecord[];
  seller_confirmations?: OrderSellerConfirmation[];
}

/** Fallback label untuk demo mode / slug lama */
export const CATEGORY_LABELS: Record<string, string> = {
  'makanan-minuman': 'Makanan & Minuman',
  'hasil-pertanian': 'Hasil Pertanian',
  kerajinan: 'Kerajinan Tangan',
  fashion: 'Fashion & Kain',
  'kebutuhan-harian': 'Kebutuhan Harian',
  oleholeh: 'Oleh-Oleh Khas',
};

export function getProductCategoryLabel(
  slug: string,
  categories?: ProductCategoryRecord[]
): string {
  const fromDb = categories?.find((c) => c.slug === slug)?.label;
  if (fromDb) return fromDb;
  return CATEGORY_LABELS[slug] ?? slug;
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Menunggu Konfirmasi',
  confirmed: 'Dikonfirmasi',
  shipped: 'Dikirim',
  delivered: 'Selesai',
  cancelled: 'Dibatalkan',
};

export const ORDER_ITEM_TYPE_LABELS: Record<OrderItemType, string> = {
  product: 'Produk',
  kuliner: 'Kuliner',
  jasa: 'Jasa',
};

export type OrderCategoryFilter = 'all' | OrderItemType;

export type OrderStatusFilter = 'all' | 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';

export const ORDER_STATUS_FILTERS: { id: OrderStatusFilter; label: string }[] = [
  { id: 'all', label: 'Semua' },
  { id: 'pending', label: 'Menunggu Konfirmasi' },
  { id: 'confirmed', label: 'Dikonfirmasi' },
  { id: 'shipped', label: 'Dikirim' },
  { id: 'delivered', label: 'Selesai' },
  { id: 'cancelled', label: 'Dibatalkan' },
];

export function orderMatchesCategory(order: Order, category: OrderCategoryFilter): boolean {
  if (category === 'all') return true;
  return order.items.some((item) => item.item_type === category);
}

export function orderMatchesStatus(order: Order, status: OrderStatusFilter): boolean {
  if (status === 'all') return true;
  return order.status === status;
}

export function countOrdersByCategory(
  orders: Order[],
  category: OrderCategoryFilter,
  status?: OrderStatus
): number {
  return orders.filter(
    (order) => orderMatchesCategory(order, category) && (!status || order.status === status)
  ).length;
}

export function countOrdersByStatus(
  orders: Order[],
  category: OrderCategoryFilter,
  status: OrderStatusFilter
): number {
  return orders.filter(
    (order) => orderMatchesCategory(order, category) && orderMatchesStatus(order, status)
  ).length;
}

export const KULINER_CATEGORY_LABELS: Record<KulinerCategory, string> = {
  'makanan-berat': 'Makanan Berat',
  camilan: 'Camilan',
  minuman: 'Minuman',
  'kue-tradisional': 'Kue Tradisional',
  'masakan-rumahan': 'Masakan Rumahan',
};

export function getCartItemId(item: CartItem): string {
  if (item.type === 'product') return item.product.id;
  if (item.type === 'kuliner') return item.kuliner.id;
  return item.jasa.id;
}

export function getCartItemPrice(item: CartItem): number {
  if (item.type === 'product') return item.product.price;
  if (item.type === 'kuliner') return item.kuliner.price;
  return item.jasa.price;
}

export function getCartItemName(item: CartItem): string {
  if (item.type === 'product') return item.product.name;
  if (item.type === 'kuliner') return item.kuliner.name;
  return item.jasa.name;
}

export function getCartItemImage(item: CartItem): string {
  if (item.type === 'product') return item.product.image_url;
  if (item.type === 'kuliner') return item.kuliner.image_url;
  return item.jasa.image_url;
}

export type VillageNewsCategory = 'berita' | 'pengumuman' | 'kegiatan' | 'cerita-umkm';

export interface VillageNews {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: VillageNewsCategory;
  village: string;
  image_url: string;
  author: string;
  published: boolean;
  created_at: string;
}

export const VILLAGE_NEWS_CATEGORY_LABELS: Record<VillageNewsCategory, string> = {
  berita: 'Berita',
  pengumuman: 'Pengumuman',
  kegiatan: 'Kegiatan',
  'cerita-umkm': 'Cerita UMKM',
};

export type JasaCategory =
  | 'tukang'
  | 'fotografi'
  | 'pengajaran'
  | 'kebersihan'
  | 'transportasi'
  | 'lainnya';

export interface Jasa {
  id: string;
  name: string;
  description: string;
  provider_name: string;
  village: string;
  category: JasaCategory;
  price: number;
  price_unit: string;
  rating: number;
  phone: string;
  is_available: boolean;
  image_url: string;
  seller_id?: string;
  created_at?: string;
}

export const JASA_CATEGORY_LABELS: Record<JasaCategory, string> = {
  tukang: 'Tukang & Bangunan',
  fotografi: 'Fotografi & Video',
  pengajaran: 'Les & Pengajaran',
  kebersihan: 'Kebersihan & Laundry',
  transportasi: 'Transportasi',
  lainnya: 'Lainnya',
};

export type EventCategory = 'olahraga' | 'agama' | 'budaya' | 'sosial' | 'pelatihan';

export interface VillageEvent {
  id: string;
  title: string;
  description: string;
  location: string;
  village: string;
  category: EventCategory;
  event_date: string;
  end_date?: string;
  sponsors_count: number;
  image_url: string;
  created_at?: string;
}

export const EVENT_CATEGORY_LABELS: Record<EventCategory, string> = {
  olahraga: 'Olahraga',
  agama: 'Keagamaan',
  budaya: 'Budaya & Seni',
  sosial: 'Sosial Kemasyarakatan',
  pelatihan: 'Pelatihan & Workshop',
};

export interface ChannelVideo {
  id: string;
  title: string;
  description: string;
  duration: string;
  image_url: string;
  is_live: boolean;
  viewer_count?: number;
  video_url?: string;
  village: string;
  created_at?: string;
}

export type WisataType = 'wisata' | 'homestay';

export interface Wisata {
  id: string;
  name: string;
  description: string;
  village: string;
  type: WisataType;
  price: number;
  price_label: string;
  rating: number;
  facilities: string[];
  phone: string;
  image_url: string;
  created_at?: string;
}

export const WISATA_TYPE_LABELS: Record<WisataType, string> = {
  wisata: 'Destinasi Wisata',
  homestay: 'Homestay',
};

export type EmploymentType = 'penuh-waktu' | 'paruh-waktu' | 'freelance' | 'magang';

export interface Lowongan {
  id: string;
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
  created_at?: string;
}

export const EMPLOYMENT_TYPE_LABELS: Record<EmploymentType, string> = {
  'penuh-waktu': 'Penuh Waktu',
  'paruh-waktu': 'Paruh Waktu',
  freelance: 'Freelance',
  magang: 'Magang',
};

export interface SponsorBanner {
  id: string;
  title: string;
  image_url: string;
  link_url?: string;
  is_active: boolean;
  sort_order: number;
  created_at?: string;
}

export type SponsorBannerInput = {
  title: string;
  image_url: string;
  link_url: string;
  is_active: boolean;
  sort_order: number;
};

export interface FeaturedProductRecord {
  id: string;
  product_id: string;
  sort_order: number;
  is_active: boolean;
  created_at?: string;
}

export interface FeaturedProductWithProduct extends FeaturedProductRecord {
  product: Product;
}

export type FeaturedProductInput = {
  product_id: string;
  sort_order: number;
  is_active: boolean;
};

export interface SiteSettings {
  id: string;
  site_title: string;
  site_description: string;
  site_tagline?: string | null;
  logo_url?: string | null;
  favicon_url?: string | null;
  hero_background_url?: string | null;
  hero_title?: string | null;
  hero_subtitle?: string | null;
  contact_address: string;
  contact_phone?: string | null;
  contact_email?: string | null;
  updated_at?: string;
}

export type SiteSettingsInput = Omit<SiteSettings, 'id' | 'updated_at'>;
