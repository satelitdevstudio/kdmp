-- Migration: banner sponsor footer
-- Jalankan jika database sudah ada sebelum fitur sponsor banner

create table if not exists public.sponsor_banners (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  image_url text not null,
  link_url text,
  is_active boolean not null default true,
  sort_order integer not null default 1,
  created_at timestamptz default now()
);

alter table public.sponsor_banners enable row level security;

create policy "Active sponsor banners are viewable by everyone"
  on public.sponsor_banners for select
  using (is_active = true);

create policy "Admins can manage sponsor banners"
  on public.sponsor_banners for all
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

insert into public.sponsor_banners (title, image_url, link_url, is_active, sort_order) values
  (
    'Bank Desa Makmur',
    'https://images.pexels.com/photos/50987/money-card-business-credit-card-50987.jpeg?auto=compress&cs=tinysrgb&w=400&h=120&fit=crop',
    'https://example.com/bank-desa',
    true,
    1
  ),
  (
    'Toko Tani Sejahtera',
    'https://images.pexels.com/photos/162712/egg-white-food-protein-162712.jpeg?auto=compress&cs=tinysrgb&w=400&h=120&fit=crop',
    'https://example.com/toko-tani',
    true,
    2
  ),
  (
    'Koperasi Merah Putih',
    'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=400&h=120&fit=crop',
    null,
    true,
    3
  )
on conflict do nothing;
