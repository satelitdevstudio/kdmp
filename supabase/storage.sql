-- ArgasariHub — Supabase Storage (bucket + RLS)
-- Jalankan setelah schema.sql / tabel profiles sudah ada.
-- Bisa juga dijalankan standalone untuk project yang sudah punya database.

-- Bucket: gambar postingan (produk, kuliner, berita, event, dll.)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'listing-images',
  'listing-images',
  true,
  2097152,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Bucket: aset template situs (logo, favicon, hero)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'site-assets',
  'site-assets',
  true,
  2097152,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml', 'image/x-icon', 'image/vnd.microsoft.icon']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- ── listing-images policies ──

drop policy if exists "Listing images are publicly readable" on storage.objects;
create policy "Listing images are publicly readable"
  on storage.objects for select
  using (bucket_id = 'listing-images');

drop policy if exists "Sellers can upload own listing images" on storage.objects;
create policy "Sellers can upload own listing images"
  on storage.objects for insert
  with check (
    bucket_id = 'listing-images'
    and exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role in ('seller', 'admin')
    )
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Sellers can update own listing images" on storage.objects;
create policy "Sellers can update own listing images"
  on storage.objects for update
  using (
    bucket_id = 'listing-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Sellers can delete own listing images" on storage.objects;
create policy "Sellers can delete own listing images"
  on storage.objects for delete
  using (
    bucket_id = 'listing-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Admins can manage all listing images" on storage.objects;
drop policy if exists "Admins can insert listing images" on storage.objects;
drop policy if exists "Admins can update listing images" on storage.objects;
drop policy if exists "Admins can delete listing images" on storage.objects;

create policy "Admins can insert listing images"
  on storage.objects for insert
  with check (
    bucket_id = 'listing-images'
    and public.is_admin()
  );

create policy "Admins can update listing images"
  on storage.objects for update
  using (
    bucket_id = 'listing-images'
    and public.is_admin()
  );

create policy "Admins can delete listing images"
  on storage.objects for delete
  using (
    bucket_id = 'listing-images'
    and public.is_admin()
  );

-- ── site-assets policies ──

drop policy if exists "Site assets are publicly readable" on storage.objects;
create policy "Site assets are publicly readable"
  on storage.objects for select
  using (bucket_id = 'site-assets');

drop policy if exists "Admins can upload site assets" on storage.objects;
create policy "Admins can upload site assets"
  on storage.objects for insert
  with check (
    bucket_id = 'site-assets'
    and public.is_admin()
  );

drop policy if exists "Admins can update site assets" on storage.objects;
create policy "Admins can update site assets"
  on storage.objects for update
  using (
    bucket_id = 'site-assets'
    and public.is_admin()
  );

drop policy if exists "Admins can delete site assets" on storage.objects;
create policy "Admins can delete site assets"
  on storage.objects for delete
  using (
    bucket_id = 'site-assets'
    and public.is_admin()
  );
