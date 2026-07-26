-- Perbaikan policy storage (jika sudah menjalankan versi lama add_listing_images_storage.sql)
-- Aman dijalankan ulang — idempotent.

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

drop policy if exists "Admins can manage all listing images" on storage.objects;

drop policy if exists "Admins can insert listing images" on storage.objects;
create policy "Admins can insert listing images"
  on storage.objects for insert
  with check (
    bucket_id = 'listing-images'
    and public.is_admin()
  );

drop policy if exists "Admins can update listing images" on storage.objects;
create policy "Admins can update listing images"
  on storage.objects for update
  using (
    bucket_id = 'listing-images'
    and public.is_admin()
  );

drop policy if exists "Admins can delete listing images" on storage.objects;
create policy "Admins can delete listing images"
  on storage.objects for delete
  using (
    bucket_id = 'listing-images'
    and public.is_admin()
  );
