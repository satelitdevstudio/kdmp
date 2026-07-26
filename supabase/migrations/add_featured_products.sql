-- Migration: produk pilihan di beranda (dikelola admin)
-- Jalankan jika database sudah ada sebelum fitur produk pilihan

create table if not exists public.featured_products (
  id uuid default gen_random_uuid() primary key,
  product_id uuid not null unique references public.products(id) on delete cascade,
  sort_order integer not null default 1,
  is_active boolean not null default true,
  created_at timestamptz default now()
);

alter table public.featured_products enable row level security;

create policy "Active featured products are viewable by everyone"
  on public.featured_products for select
  using (is_active = true);

create policy "Admins can manage featured products"
  on public.featured_products for all
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

-- Seed dari produk yang sudah ada (jika ada)
insert into public.featured_products (product_id, sort_order, is_active)
select id, row_number() over (order by created_at), true
from public.products
order by created_at
limit 3
on conflict (product_id) do nothing;
