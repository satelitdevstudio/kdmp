-- Migration: bucket Supabase Storage untuk aset template (logo, favicon, hero)
-- Jalankan setelah add_site_settings.sql
-- Membutuhkan fungsi public.is_admin() — jalankan setelah schema.sql.

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

create policy "Site assets are publicly readable"
  on storage.objects for select
  using (bucket_id = 'site-assets');

create policy "Admins can upload site assets"
  on storage.objects for insert
  with check (
    bucket_id = 'site-assets'
    and public.is_admin()
  );

create policy "Admins can update site assets"
  on storage.objects for update
  using (
    bucket_id = 'site-assets'
    and public.is_admin()
  );

create policy "Admins can delete site assets"
  on storage.objects for delete
  using (
    bucket_id = 'site-assets'
    and public.is_admin()
  );
