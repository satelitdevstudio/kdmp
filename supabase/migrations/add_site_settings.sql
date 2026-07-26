-- Migration: pengaturan template situs (branding, hero, kontak desa)
-- Jalankan jika database sudah ada sebelum fitur pengaturan template

create table if not exists public.site_settings (
  id text primary key default 'default',
  site_title text not null,
  site_description text not null,
  site_tagline text,
  logo_url text,
  favicon_url text,
  hero_background_url text,
  hero_title text,
  hero_subtitle text,
  contact_address text not null,
  contact_phone text,
  contact_email text,
  updated_at timestamptz default now()
);

alter table public.site_settings enable row level security;

create policy "Site settings are viewable by everyone"
  on public.site_settings for select
  using (true);

create policy "Admins can manage site settings"
  on public.site_settings for all
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

insert into public.site_settings (
  id,
  site_title,
  site_description,
  site_tagline,
  logo_url,
  favicon_url,
  hero_background_url,
  hero_title,
  hero_subtitle,
  contact_address,
  contact_phone,
  contact_email
) values (
  'default',
  'Koperasi Merah Putih',
  'Platform ekonomi desa untuk kemakmuran dan kesejahteraan bersama. Dari desa, oleh desa, untuk Indonesia.',
  'Ekonomi Desa, Kuat Bersama',
  null,
  null,
  '/assets/bg-desafx.jpg',
  'Belanja di Desa, Dari Desa, Untuk Desa',
  'Dukung UMKM lokal, pesan kuliner lezat, dan nikmati setiap event desa.',
  'Jl. Desa No. 17, Desa Sukamaju, Kec. Makmur, Kab. Indonesia',
  '0812-3456-7890',
  'info@koperasimerahputih.id'
)
on conflict (id) do nothing;
