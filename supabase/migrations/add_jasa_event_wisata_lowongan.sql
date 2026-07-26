-- Migration: Jasa, Event, Wisata, Lowongan modules
-- Jalankan di Supabase SQL Editor untuk upgrade dari versi sebelumnya

-- Jasa Warga
create table if not exists public.jasa (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text not null default '',
  provider_name text not null,
  village text not null,
  category text not null check (category in (
    'tukang', 'fotografi', 'pengajaran', 'kebersihan', 'transportasi', 'lainnya'
  )),
  price integer not null check (price >= 0),
  price_unit text not null default 'per hari',
  rating numeric(2,1) default 0,
  phone text not null,
  is_available boolean not null default true,
  image_url text not null,
  seller_id uuid references public.profiles(id),
  created_at timestamptz default now()
);

alter table public.jasa enable row level security;

create policy "Jasa are viewable by everyone"
  on public.jasa for select using (true);

create policy "Sellers can manage own jasa"
  on public.jasa for all
  using (auth.uid() = seller_id);

-- Village Events
create table if not exists public.village_events (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text not null default '',
  location text not null,
  village text not null,
  category text not null check (category in (
    'olahraga', 'agama', 'budaya', 'sosial', 'pelatihan'
  )),
  event_date date not null,
  end_date date,
  sponsors_count integer not null default 0,
  image_url text not null,
  created_at timestamptz default now()
);

alter table public.village_events enable row level security;

create policy "Events are viewable by everyone"
  on public.village_events for select using (true);

create policy "Admins can manage events"
  on public.village_events for all
  using (public.is_admin());

-- Channel Desa TV
create table if not exists public.channel_videos (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text not null default '',
  duration text not null default '00:00',
  image_url text not null,
  is_live boolean not null default false,
  viewer_count integer,
  video_url text,
  village text not null,
  created_at timestamptz default now()
);

alter table public.channel_videos enable row level security;

create policy "Channel videos are viewable by everyone"
  on public.channel_videos for select using (true);

create policy "Admins can manage channel videos"
  on public.channel_videos for all
  using (public.is_admin());

-- Wisata & Homestay
create table if not exists public.wisata (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text not null default '',
  village text not null,
  type text not null check (type in ('wisata', 'homestay')),
  price integer not null check (price >= 0),
  price_label text not null default 'tiket masuk',
  rating numeric(2,1) default 0,
  facilities text[] not null default '{}',
  phone text not null,
  image_url text not null,
  created_at timestamptz default now()
);

alter table public.wisata enable row level security;

create policy "Wisata are viewable by everyone"
  on public.wisata for select using (true);

create policy "Admins can manage wisata"
  on public.wisata for all
  using (public.is_admin());

-- Lowongan Kerja
create table if not exists public.lowongan (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  company text not null,
  village text not null,
  description text not null default '',
  salary_range text not null,
  employment_type text not null check (employment_type in (
    'penuh-waktu', 'paruh-waktu', 'freelance', 'magang'
  )),
  requirements text[] not null default '{}',
  deadline date not null,
  image_url text not null,
  contact_phone text not null,
  created_at timestamptz default now()
);

alter table public.lowongan enable row level security;

create policy "Lowongan are viewable by everyone"
  on public.lowongan for select using (true);

create policy "Admins can manage lowongan"
  on public.lowongan for all
  using (public.is_admin());

-- Sample seed data
insert into public.jasa (name, description, provider_name, village, category, price, price_unit, rating, phone, is_available, image_url) values
  ('Tukang Bangunan & Renovasi', 'Jasa bangun rumah, renovasi, plester, dan cat.', 'Pak Joko', 'Desa Sukamaju', 'tukang', 150000, 'per hari', 4.9, '081234567890', true, 'https://images.pexels.com/photos/159306/construction-site-build-construction-work-159306.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop'),
  ('Fotografi Acara & Ulang Tahun', 'Dokumentasi acara desa dan pre-wedding.', 'Studio Foto Desa', 'Desa Wonosari', 'fotografi', 350000, 'per acara', 4.8, '081298765432', true, 'https://images.pexels.com/photos/51383/photo-camera-subject-photographer-51383.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop')
on conflict do nothing;

insert into public.village_events (title, description, location, village, category, event_date, end_date, sponsors_count, image_url) values
  ('Turnamen Sepak Bola Kepala Desa Cup 2024', 'Turnamen sepak bola antar-RT dengan hadiah total Rp 10 juta.', 'Lapangan Desa Sukamaju', 'Desa Sukamaju', 'olahraga', '2024-05-25', '2024-06-10', 12, 'https://images.pexels.com/photos/46798/the-ball-stadion-football-the-pitch-46798.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop'),
  ('Festival Musik & Seni Desa', 'Pentas seni tradisional dan bazar UMKM.', 'Lapangan Desa Pucang', 'Desa Pucang', 'budaya', '2024-06-15', null, 15, 'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop')
on conflict do nothing;

insert into public.channel_videos (title, description, duration, image_url, is_live, viewer_count, village) values
  ('LIVE: Pengajian Akbar Desa Wonosari', 'Siaran langsung pengajian akbar.', 'LIVE', 'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop', true, 1250, 'Desa Wonosari'),
  ('Highlight Turnamen Desa Sukamaju Cup', 'Cuplikan gol terbaik turnamen.', '12:46', 'https://images.pexels.com/photos/46798/the-ball-stadion-football-the-pitch-46798.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop', false, null, 'Desa Sukamaju')
on conflict do nothing;

insert into public.wisata (name, description, village, type, price, price_label, rating, facilities, phone, image_url) values
  ('Curug Bidadari', 'Air terjun setinggi 25 meter dengan kolam alami.', 'Desa Sukamaju', 'wisata', 10000, 'tiket masuk', 4.8, array['Parkir', 'Warung makan', 'Toilet'], '081234567890', 'https://images.pexels.com/photos/957024/forest-trees-perspective-bright-957024.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop'),
  ('Homestay Sawah Hijau', 'Penginapan nyaman dengan pemandangan sawah.', 'Desa Wonosari', 'homestay', 250000, 'per malam', 4.9, array['WiFi', 'Sarapan', 'Parkir'], '081298765432', 'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop')
on conflict do nothing;

insert into public.lowongan (title, company, village, description, salary_range, employment_type, requirements, deadline, image_url, contact_phone) values
  ('Kasir & Admin Toko Sembako', 'Toko Berkah Desa', 'Desa Sukamaju', 'Mencari kasir dan admin toko sembako desa.', 'Rp 2.5 – 3.5 juta/bulan', 'penuh-waktu', array['Minimal SMA/SMK', 'Bisa operasional komputer'], '2024-08-15', 'https://images.pexels.com/photos/264636/pexels-photo-264636.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop', '081234567890'),
  ('Kurir Antar Produk UMKM', 'Koperasi Merah Putih', 'Desa Wonosari', 'Kurir motor untuk produk UMKM dan kuliner desa.', 'Rp 50.000 – 150.000/hari', 'paruh-waktu', array['Punya SIM C & motor'], '2024-07-30', 'https://images.pexels.com/photos/4484078/pexels-photo-4484078.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop', '081298765432')
on conflict do nothing;
