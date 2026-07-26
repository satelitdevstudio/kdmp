-- Migration: tambah kuliner & perbarui order_items
-- Jalankan jika database sudah ada sebelum fitur kuliner

-- 1. Tabel kuliner
create table if not exists public.kuliner (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text not null default '',
  price integer not null check (price >= 0),
  seller_name text not null,
  village text not null,
  category text not null check (category in (
    'makanan-berat', 'camilan', 'minuman', 'kue-tradisional', 'masakan-rumahan'
  )),
  rating numeric(2,1) default 0,
  delivery_time text not null default '30-45 menit',
  is_available boolean not null default true,
  opening_time text not null default '08:00',
  closing_time text not null default '21:00',
  image_url text not null,
  seller_id uuid references public.profiles(id),
  created_at timestamptz default now()
);

alter table public.kuliner enable row level security;

create policy "Kuliner are viewable by everyone"
  on public.kuliner for select using (true);

create policy "Sellers can insert own kuliner"
  on public.kuliner for insert with check (auth.uid() = seller_id);

create policy "Sellers can update own kuliner"
  on public.kuliner for update using (auth.uid() = seller_id);

create policy "Sellers can delete own kuliner"
  on public.kuliner for delete using (auth.uid() = seller_id);

-- 2. Perbarui order_items (skip jika kolom item_type sudah ada)
alter table public.order_items add column if not exists item_type text not null default 'product';
alter table public.order_items add column if not exists kuliner_id uuid references public.kuliner(id);
alter table public.order_items add column if not exists item_name text;
alter table public.order_items add column if not exists item_image_url text not null default '';

-- Backfill item_name dari products untuk data lama
update public.order_items oi
set item_name = p.name,
    item_image_url = coalesce(nullif(oi.item_image_url, ''), p.image_url)
from public.products p
where oi.product_id = p.id and oi.item_name is null;

alter table public.order_items alter column item_name set not null;

-- Seed kuliner demo
insert into public.kuliner (name, description, price, seller_name, village, category, rating, delivery_time, is_available, image_url) values
  ('Nasi Liwet Komplit', 'Nasi liwet dengan ayam suwir, sambal, tahu, dan telur', 18000, 'Warung Bu Siti', 'Desa Sukamaju', 'makanan-berat', 4.8, '30-45 menit', true, 'https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop'),
  ('Bakso Desa Spesial', 'Bakso urat dengan kuah kaldu sapi, mie, dan pelengkap lengkap', 15000, 'Bakso Pak Darto', 'Desa Wonosari', 'makanan-berat', 4.8, '20-30 menit', true, 'https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop'),
  ('Es Dawet Durian', 'Es dawet dengan topping durian lokal', 12000, 'Es Teler Desa', 'Desa Harjosari', 'minuman', 4.7, '15-25 menit', true, 'https://images.pexels.com/photos/103566/pexels-photo-103566.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop')
on conflict do nothing;
