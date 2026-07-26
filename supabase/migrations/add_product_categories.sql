-- Migration: kategori produk dinamis (dikelola admin)
-- Jalankan jika database sudah ada sebelum fitur kategori produk

create table if not exists public.product_categories (
  id uuid default gen_random_uuid() primary key,
  slug text not null unique,
  label text not null,
  image_url text not null,
  is_active boolean not null default true,
  sort_order integer not null default 1,
  created_at timestamptz default now()
);

alter table public.product_categories enable row level security;

create policy "Active product categories are viewable by everyone"
  on public.product_categories for select
  using (is_active = true);

create policy "Admins can manage product categories"
  on public.product_categories for all
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

-- Hapus batasan enum kategori pada produk agar admin bisa menambah kategori baru
alter table public.products drop constraint if exists products_category_check;

insert into public.product_categories (slug, label, image_url, is_active, sort_order) values
  (
    'makanan-minuman',
    'Makanan & Minuman',
    'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=200&h=150&fit=crop',
    true,
    1
  ),
  (
    'hasil-pertanian',
    'Hasil Pertanian',
    'https://images.pexels.com/photos/1414651/pexels-photo-1414651.jpeg?auto=compress&cs=tinysrgb&w=200&h=150&fit=crop',
    true,
    2
  ),
  (
    'kerajinan',
    'Kerajinan Tangan',
    'https://images.pexels.com/photos/3735218/pexels-photo-3735218.jpeg?auto=compress&cs=tinysrgb&w=200&h=150&fit=crop',
    true,
    3
  ),
  (
    'fashion',
    'Fashion & Kain',
    'https://images.pexels.com/photos/3622608/pexels-photo-3622608.jpeg?auto=compress&cs=tinysrgb&w=200&h=150&fit=crop',
    true,
    4
  ),
  (
    'kebutuhan-harian',
    'Kebutuhan Harian',
    'https://images.pexels.com/photos/264636/pexels-photo-264636.jpeg?auto=compress&cs=tinysrgb&w=200&h=150&fit=crop',
    true,
    5
  ),
  (
    'oleholeh',
    'Oleh-Oleh Khas',
    'https://images.pexels.com/photos/1099680/pexels-photo-1099680.jpeg?auto=compress&cs=tinysrgb&w=200&h=150&fit=crop',
    true,
    6
  )
on conflict (slug) do nothing;
