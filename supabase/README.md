# Supabase — ArgasariHub

Panduan setup database dan storage untuk mode produksi.

## Instalasi Baru

Jalankan **satu file** di [Supabase SQL Editor](https://supabase.com/dashboard):

```
supabase/schema.sql
```

File ini sudah mencakup:
- Semua tabel (produk, kuliner, pesanan, berita, event, dll.)
- Row Level Security (RLS)
- Fungsi `is_admin()`
- Bucket storage `listing-images` dan `site-assets`
- Kebijakan upload/read storage
- Data seed awal

## Upgrade dari Versi Lama

Jika database sudah ada, jalankan migration yang belum pernah dijalankan **berurutan**:

| Urutan | File | Keterangan |
|--------|------|------------|
| 1 | `migrations/add_kuliner.sql` | Tabel kuliner |
| 2 | `migrations/add_notifications_and_news.sql` | Notifikasi & berita desa |
| 3 | `migrations/add_jasa_event_wisata_lowongan.sql` | Jasa, event, wisata, lowongan |
| 4 | `migrations/add_jasa_to_order_items.sql` | Jasa di keranjang |
| 5 | `migrations/add_order_seller_confirmations.sql` | Konfirmasi penjual |
| 6 | `migrations/add_sponsor_banners.sql` | Banner sponsor |
| 7 | `migrations/add_kuliner_store_hours.sql` | Jam buka kuliner |
| 8 | `migrations/add_admin_product_policies.sql` | Kebijakan admin produk |
| 9 | `migrations/add_seller_moderation.sql` | Moderasi postingan penjual |
| 10 | `migrations/add_product_categories.sql` | Kategori produk dinamis |
| 11 | `migrations/add_featured_products.sql` | Produk pilihan beranda |
| 12 | `migrations/add_site_settings.sql` | Pengaturan template situs |
| 13 | `migrations/add_site_assets_storage.sql` | Storage logo/favicon/hero |
| 14 | `migrations/add_listing_images_storage.sql` | Storage gambar postingan |
| — | `migrations/fix_storage_policies.sql` | Perbaikan policy admin upload (jika sudah jalankan v14 lama) |

> **Shortcut storage saja:** jalankan `supabase/storage.sql` — aman dijalankan ulang (idempotent).

## Storage Buckets

| Bucket | Digunakan untuk | Upload oleh | Batas |
|--------|-----------------|-------------|-------|
| `listing-images` | Gambar produk, kuliner, berita, event, dll. | Penjual & admin | 2 MB, JPG/PNG/WebP/GIF |
| `site-assets` | Logo, favicon, hero background | Admin saja | 2 MB + SVG/ICO |

Path upload: `{user_id}/{timestamp}.{ext}`

## Setup Admin Pertama

Setelah user mendaftar via `/register`, jadikan admin di SQL Editor:

```sql
update public.profiles
set role = 'admin'
where id = (
  select id from auth.users
  where email = 'email-admin@example.com'
);
```

## Environment Variables

Salin `.env.example` ke `.env`:

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbG...
```

Verifikasi koneksi:

```bash
npm run db:check
```

## Supabase CLI (opsional)

```bash
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push
```

Pastikan migration files ada di folder yang dikenali CLI, atau jalankan `storage.sql` manual via SQL Editor.

## Troubleshooting Upload

| Error | Penyebab | Solusi |
|-------|----------|--------|
| `new row violates row-level security` | Bucket/policy belum ada | Jalankan `storage.sql` |
| `Bucket not found` | Bucket belum dibuat | Jalankan `storage.sql` |
| `File size exceeds limit` | File > 2 MB | Kompres gambar |
| `Invalid MIME type` | Format tidak didukung | Gunakan JPG/PNG/WebP/GIF |
| Upload OK tapi gambar tidak tampil | Bucket tidak public | Pastikan `public = true` di bucket |
