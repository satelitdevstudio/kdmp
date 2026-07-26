-- Migration: bucket Supabase Storage untuk gambar postingan
-- Untuk instalasi lengkap gunakan supabase/storage.sql (lebih mutakhir).
-- Membutuhkan fungsi public.is_admin() — jalankan setelah schema.sql.

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

create policy "Listing images are publicly readable"
  on storage.objects for select
  using (bucket_id = 'listing-images');

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

create policy "Sellers can update own listing images"
  on storage.objects for update
  using (
    bucket_id = 'listing-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Sellers can delete own listing images"
  on storage.objects for delete
  using (
    bucket_id = 'listing-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

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
