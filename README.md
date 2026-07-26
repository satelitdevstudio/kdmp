# ArgasariHub

Platform digital **Koperasi Merah Putih** untuk ekonomi desa — marketplace UMKM, kuliner desa, dan layanan warga.

> *Belanja di Desa, Dari Desa, Untuk Desa*

## Fitur

| Modul | Status | Route |
|-------|--------|-------|
| Produk Desa (e-commerce) | ✅ Aktif | `/produk` |
| Kuliner Desa | ✅ Aktif | `/kuliner` |
| Keranjang & Checkout (COD) | ✅ Aktif | `/keranjang`, `/checkout` |
| Pesanan & Profil | ✅ Aktif | `/pesanan`, `/profil` |
| Dashboard Penjual | ✅ Aktif | `/seller` |
| Info Desa | ✅ Aktif | `/info-desa` |
| Pencarian Global | ✅ Aktif | `/cari` |
| Jasa Warga | ✅ Aktif | `/jasa` |
| Event & Channel Desa | ✅ Aktif | `/event` |
| Wisata & Homestay | ✅ Aktif | `/wisata` |
| Lowongan Kerja | ✅ Aktif | `/lowongan` |

## Tech Stack

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS
- **Routing:** React Router v7
- **Backend:** Supabase (Auth + PostgreSQL) — opsional
- **Icons:** Lucide React

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Mode Demo (tanpa backend)

Jalankan langsung tanpa konfigurasi Supabase. Data produk & kuliner menggunakan mock data, pesanan disimpan di `localStorage`.

```bash
npm run dev
```

Buka http://localhost:5173

### 3. Mode Produksi (dengan Supabase)

1. Buat project di [supabase.com](https://supabase.com)
2. Salin `.env.example` ke `.env`:

```bash
cp .env.example .env
```

3. Isi kredensial Supabase:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

4. Jalankan schema database di **Supabase SQL Editor**:
   - **Instalasi baru:** jalankan `supabase/schema.sql` (sudah termasuk storage)
   - **Upgrade dari versi lama:** lihat urutan migration di `supabase/README.md`
   - **Hanya storage belum ada:** jalankan `supabase/storage.sql`

5. Verifikasi setup:

```bash
npm run db:check
```

6. Start dev server:

```bash
npm run dev
```

## Scripts

| Command | Deskripsi |
|---------|-----------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run preview` | Preview build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript check |

## Struktur Project

```
src/
├── pages/          # Halaman (Home, Produk, Kuliner, Cart, dll.)
├── components/     # Komponen UI reusable
├── layouts/        # Layout wrapper
├── contexts/       # Auth & Cart state
├── hooks/          # Data fetching hooks
├── lib/            # Supabase, orders, profile
├── data/           # Mock data (fallback demo mode)
└── types/          # TypeScript interfaces

supabase/
├── schema.sql      # Schema lengkap + storage (fresh install)
├── storage.sql     # Bucket storage saja (upgrade/idempotent)
├── README.md       # Panduan migration & troubleshooting
└── migrations/     # Migration per fitur (upgrade bertahap)
```

## Alur Pengguna

### Pembeli
1. Browse produk (`/produk`) atau kuliner (`/kuliner`)
2. Tambah ke keranjang (campuran produk + kuliner didukung)
3. Checkout dengan alamat pengiriman
4. Lacak pesanan di `/pesanan`

### Penjual UMKM
1. Daftar / login
2. Upgrade ke penjual di halaman profil
3. Kelola produk di `/seller`

## Environment Variables

| Variable | Required | Deskripsi |
|----------|----------|-----------|
| `VITE_SUPABASE_URL` | Opsional | URL project Supabase |
| `VITE_SUPABASE_ANON_KEY` | Opsional | Anon/public key Supabase |

Tanpa env vars, aplikasi berjalan di **mode demo** dengan data mock.

## Roadmap

- [ ] Integrasi payment (Midtrans / Xendit)
- [x] Upload gambar via Supabase Storage
- [x] Dashboard admin & moderasi pesanan
- [x] Notifikasi pesanan (polling 30 detik)
- [x] Info Desa (berita & cerita UMKM)
- [x] Fitur Jasa, Event, Wisata, Lowongan

## Lisensi

Private — Koperasi Merah Putih Argasari
