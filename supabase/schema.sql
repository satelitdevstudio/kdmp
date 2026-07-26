-- ArgasariHub Database Schema
-- Jalankan di Supabase SQL Editor: https://supabase.com/dashboard

-- Profiles (extends auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text not null,
  phone text,
  address text,
  role text not null default 'buyer' check (role in ('buyer', 'seller', 'admin')),
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''));
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Product categories (dikelola admin)
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

-- Products
create table if not exists public.products (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text not null default '',
  price integer not null check (price >= 0),
  village text not null,
  category text not null,
  rating numeric(2,1) default 0,
  stock integer not null default 0 check (stock >= 0),
  image_url text not null,
  seller_id uuid references public.profiles(id),
  moderation_status text not null default 'approved'
    check (moderation_status in ('pending', 'approved', 'rejected')),
  moderation_note text,
  reviewed_at timestamptz,
  created_at timestamptz default now()
);

alter table public.products enable row level security;

drop policy if exists "Products are viewable by everyone" on public.products;
create policy "Products are viewable by everyone"
  on public.products for select
  using (
    seller_id is null
    or moderation_status = 'approved'
    or auth.uid() = seller_id
    or exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

create policy "Sellers can insert own products"
  on public.products for insert
  with check (auth.uid() = seller_id);

create policy "Sellers can update own products"
  on public.products for update
  using (auth.uid() = seller_id);

create policy "Sellers can delete own products"
  on public.products for delete
  using (auth.uid() = seller_id);

-- Kuliner (menu warung & UMKM desa)
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
  moderation_status text not null default 'approved'
    check (moderation_status in ('pending', 'approved', 'rejected')),
  moderation_note text,
  reviewed_at timestamptz,
  created_at timestamptz default now()
);

alter table public.kuliner enable row level security;

drop policy if exists "Kuliner are viewable by everyone" on public.kuliner;
create policy "Kuliner are viewable by everyone"
  on public.kuliner for select
  using (
    seller_id is null
    or moderation_status = 'approved'
    or auth.uid() = seller_id
    or exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

create policy "Sellers can insert own kuliner"
  on public.kuliner for insert
  with check (auth.uid() = seller_id);

create policy "Sellers can update own kuliner"
  on public.kuliner for update
  using (auth.uid() = seller_id);

create policy "Sellers can delete own kuliner"
  on public.kuliner for delete
  using (auth.uid() = seller_id);

-- Orders
create table if not exists public.orders (
  id uuid default gen_random_uuid() primary key,
  buyer_id uuid references public.profiles(id) not null,
  status text not null default 'pending' check (status in (
    'pending', 'confirmed', 'shipped', 'delivered', 'cancelled'
  )),
  total integer not null check (total >= 0),
  shipping_address text,
  created_at timestamptz default now()
);

alter table public.orders enable row level security;

create policy "Buyers can view own orders"
  on public.orders for select
  using (auth.uid() = buyer_id);

create policy "Buyers can create orders"
  on public.orders for insert
  with check (auth.uid() = buyer_id);

-- Order items (supports produk, kuliner & jasa)
create table if not exists public.order_items (
  id uuid default gen_random_uuid() primary key,
  order_id uuid references public.orders(id) on delete cascade not null,
  item_type text not null default 'product' check (item_type in ('product', 'kuliner', 'jasa')),
  product_id uuid references public.products(id),
  kuliner_id uuid references public.kuliner(id),
  jasa_id uuid references public.jasa(id),
  item_name text not null,
  item_image_url text not null default '',
  quantity integer not null check (quantity > 0),
  price integer not null check (price >= 0),
  check (
    (item_type = 'product' and product_id is not null) or
    (item_type = 'kuliner' and kuliner_id is not null) or
    (item_type = 'jasa' and jasa_id is not null)
  )
);

alter table public.order_items enable row level security;

create policy "Buyers can view own order items"
  on public.order_items for select
  using (
    exists (
      select 1 from public.orders
      where orders.id = order_items.order_id
      and orders.buyer_id = auth.uid()
    )
  );

create policy "Buyers can create order items for own orders"
  on public.order_items for insert
  with check (
    exists (
      select 1 from public.orders
      where orders.id = order_items.order_id
      and orders.buyer_id = auth.uid()
    )
  );

-- Per-seller order confirmation (mixed carts)
create table if not exists public.order_seller_confirmations (
  id uuid default gen_random_uuid() primary key,
  order_id uuid references public.orders(id) on delete cascade not null,
  seller_id uuid references public.profiles(id) not null,
  status text not null default 'pending' check (status in (
    'pending', 'confirmed', 'shipped', 'delivered', 'cancelled'
  )),
  updated_at timestamptz default now(),
  unique (order_id, seller_id)
);

alter table public.order_seller_confirmations enable row level security;

create policy "Buyers can view seller confirmations for own orders"
  on public.order_seller_confirmations for select
  using (
    exists (
      select 1 from public.orders
      where orders.id = order_seller_confirmations.order_id
      and orders.buyer_id = auth.uid()
    )
  );

create policy "Sellers can view own confirmations"
  on public.order_seller_confirmations for select
  using (auth.uid() = seller_id);

create policy "Sellers can update own confirmations"
  on public.order_seller_confirmations for update
  using (auth.uid() = seller_id);

create policy "System can insert seller confirmations"
  on public.order_seller_confirmations for insert
  with check (true);

-- Notifications
create table if not exists public.notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  body text not null,
  type text not null default 'info' check (type in ('order', 'promo', 'info', 'kuliner')),
  link text,
  read boolean not null default false,
  created_at timestamptz default now()
);

alter table public.notifications enable row level security;

create policy "Users can view own notifications"
  on public.notifications for select
  using (auth.uid() = user_id);

create policy "Users can update own notifications"
  on public.notifications for update
  using (auth.uid() = user_id);

create policy "System can insert notifications"
  on public.notifications for insert
  with check (true);

-- Village news / Info Desa
create table if not exists public.village_news (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  excerpt text not null default '',
  content text not null default '',
  category text not null default 'berita' check (category in (
    'berita', 'pengumuman', 'kegiatan', 'cerita-umkm'
  )),
  village text not null,
  image_url text not null,
  author text not null default 'Admin Desa',
  published boolean not null default true,
  created_at timestamptz default now()
);

alter table public.village_news enable row level security;

create policy "Published news are viewable by everyone"
  on public.village_news for select
  using (published = true);

create policy "Admins can manage village news"
  on public.village_news for all
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

-- Featured products (produk pilihan di beranda)
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

-- Sponsor banners (footer)
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

-- Site settings (branding, hero, kontak)
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

-- Admin helper: check if current user is admin
create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer stable;

-- Admin policies for moderation
create policy "Admins can view all profiles"
  on public.profiles for select
  using (public.is_admin());

create policy "Admins can update any profile"
  on public.profiles for update
  using (public.is_admin());

create policy "Admins can view all orders"
  on public.orders for select
  using (public.is_admin());

create policy "Admins can update any order"
  on public.orders for update
  using (public.is_admin());

create policy "Admins can view all order items"
  on public.order_items for select
  using (public.is_admin());

create policy "Admins can view all seller confirmations"
  on public.order_seller_confirmations for select
  using (public.is_admin());

create policy "Admins can update all seller confirmations"
  on public.order_seller_confirmations for update
  using (public.is_admin());

create policy "Admins can delete any product"
  on public.products for delete
  using (public.is_admin());

create policy "Admins can insert products"
  on public.products for insert
  with check (public.is_admin());

create policy "Admins can update any product"
  on public.products for update
  using (public.is_admin());

create policy "Admins can delete any kuliner"
  on public.kuliner for delete
  using (public.is_admin());

create policy "Admins can update any kuliner"
  on public.kuliner for update
  using (public.is_admin());

create policy "Sellers can view orders containing their items"
  on public.orders for select
  using (
    exists (
      select 1 from public.order_items oi
      left join public.products p on oi.product_id = p.id
      left join public.kuliner k on oi.kuliner_id = k.id
      left join public.jasa j on oi.jasa_id = j.id
      where oi.order_id = orders.id
      and (p.seller_id = auth.uid() or k.seller_id = auth.uid() or j.seller_id = auth.uid())
    )
  );

create policy "Sellers can update orders containing their items"
  on public.orders for update
  using (
    exists (
      select 1 from public.order_items oi
      left join public.products p on oi.product_id = p.id
      left join public.kuliner k on oi.kuliner_id = k.id
      left join public.jasa j on oi.jasa_id = j.id
      where oi.order_id = orders.id
      and (p.seller_id = auth.uid() or k.seller_id = auth.uid() or j.seller_id = auth.uid())
    )
  );

create policy "Sellers can view order items for their products"
  on public.order_items for select
  using (
    exists (
      select 1 from public.products p
      where p.id = order_items.product_id and p.seller_id = auth.uid()
    )
    or exists (
      select 1 from public.kuliner k
      where k.id = order_items.kuliner_id and k.seller_id = auth.uid()
    )
    or exists (
      select 1 from public.jasa j
      where j.id = order_items.jasa_id and j.seller_id = auth.uid()
    )
  );

-- ── Supabase Storage (lihat juga supabase/storage.sql) ──

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

-- Sample seed data (optional)
insert into public.product_categories (slug, label, image_url, is_active, sort_order) values
  ('makanan-minuman', 'Makanan & Minuman', 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=200&h=150&fit=crop', true, 1),
  ('hasil-pertanian', 'Hasil Pertanian', 'https://images.pexels.com/photos/1414651/pexels-photo-1414651.jpeg?auto=compress&cs=tinysrgb&w=200&h=150&fit=crop', true, 2),
  ('kerajinan', 'Kerajinan Tangan', 'https://images.pexels.com/photos/3735218/pexels-photo-3735218.jpeg?auto=compress&cs=tinysrgb&w=200&h=150&fit=crop', true, 3),
  ('fashion', 'Fashion & Kain', 'https://images.pexels.com/photos/3622608/pexels-photo-3622608.jpeg?auto=compress&cs=tinysrgb&w=200&h=150&fit=crop', true, 4),
  ('kebutuhan-harian', 'Kebutuhan Harian', 'https://images.pexels.com/photos/264636/pexels-photo-264636.jpeg?auto=compress&cs=tinysrgb&w=200&h=150&fit=crop', true, 5),
  ('oleholeh', 'Oleh-Oleh Khas', 'https://images.pexels.com/photos/1099680/pexels-photo-1099680.jpeg?auto=compress&cs=tinysrgb&w=200&h=150&fit=crop', true, 6)
on conflict (slug) do nothing;

insert into public.products (name, description, price, village, category, rating, stock, image_url) values
  ('Keripik Pisang Original', 'Keripik pisang renyah buatan tangan', 18000, 'Desa Sukamaju', 'makanan-minuman', 4.8, 50, 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop'),
  ('Madu Murni Hutan', 'Madu asli dari hutan lokal', 75000, 'Desa Wonosari', 'hasil-pertanian', 4.9, 30, 'https://images.pexels.com/photos/1638280/pexels-photo-1638280.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop'),
  ('Kopi Robusta Premium', 'Biji kopi robusta pilihan', 65000, 'Desa Pucang', 'makanan-minuman', 4.8, 40, 'https://images.pexels.com/photos/894695/pexels-photo-894695.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop')
on conflict do nothing;

insert into public.featured_products (product_id, sort_order, is_active)
select id, row_number() over (order by created_at), true
from public.products
order by created_at
limit 3
on conflict (product_id) do nothing;

insert into public.kuliner (name, description, price, seller_name, village, category, rating, delivery_time, is_available, image_url) values
  ('Nasi Liwet Komplit', 'Nasi liwet dengan ayam suwir, sambal, tahu, dan telur', 18000, 'Warung Bu Siti', 'Desa Sukamaju', 'makanan-berat', 4.8, '30-45 menit', true, 'https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop'),
  ('Bakso Desa Spesial', 'Bakso urat dengan kuah kaldu sapi, mie, dan pelengkap lengkap', 15000, 'Bakso Pak Darto', 'Desa Wonosari', 'makanan-berat', 4.8, '20-30 menit', true, 'https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop'),
  ('Es Dawet Durian', 'Es dawet dengan topping durian lokal', 12000, 'Es Teler Desa', 'Desa Harjosari', 'minuman', 4.7, '15-25 menit', true, 'https://images.pexels.com/photos/103566/pexels-photo-103566.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop')
on conflict do nothing;

insert into public.village_news (title, excerpt, content, category, village, image_url, author) values
  ('Panen Raya Padi, Petani Desa Sukamaju Bahagia', 'Musim panen kali ini menghasilkan 15% lebih banyak dari tahun lalu berkat program bantuan benih unggul.', 'Desa Sukamaju merayakan panen raya padi dengan hasil yang melampaui target. Koperasi Merah Putih mendampingi 120 petani dalam program benih unggul dan pupuk organik. Hasil panen diharapkan menstabilkan harga beras lokal dan meningkatkan kesejahteraan warga.', 'berita', 'Desa Sukamaju', 'https://images.pexels.com/photos/1414651/pexels-photo-1414651.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop', 'Admin Desa Sukamaju'),
  ('Pelatihan Digital Marketing untuk UMKM Desa', '30 pelaku UMKM mengikuti pelatihan pemasaran digital agar produk desa bisa dijual ke pasar yang lebih luas.', 'Koperasi Merah Putih menggelar pelatihan digital marketing selama 3 hari. Peserta belajar membuat konten media sosial, mengelola toko online, dan memanfaatkan ArgasariHub sebagai kanal penjualan. Pelatihan ini merupakan bagian dari program pemberdayaan ekonomi desa.', 'kegiatan', 'Desa Wonosari', 'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop', 'Tim Koperasi'),
  ('Koperasi Merah Putih Gelar Bazar Produk Lokal', 'Bazar minggu ini menampilkan 50+ produk UMKM dari 8 desa sekitar. Gratis masuk untuk warga.', 'Bazar produk lokal digelar di balai desa setiap akhir pekan. Pengunjung bisa langsung bertemu penjual, mencicipi kuliner desa, dan berbelanja produk unggulan. Acara ini mendukung ekonomi sirkular antar-desa.', 'pengumuman', 'Desa Pucang', 'https://images.pexels.com/photos/1488463/pexels-photo-1488463.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop', 'Panitia Bazar'),
  ('Dari Hobi Jadi Rezeki: Cerita Keripik Bu Siti', 'Berawal dari hobi membuat keripik di rumah, kini usaha Bu Siti sudah dikenal hingga luar desa.', 'Ibu Siti (52) memulai usaha keripik pisang dari dapur rumahnya di Desa Sukamaju. Dengan bantuan Koperasi Merah Putih, produknya kini dipasarkan melalui ArgasariHub dan sudah mempekerjakan 5 warga sekitar. Omzet bulanan naik 300% dalam setahun terakhir.', 'cerita-umkm', 'Desa Sukamaju', 'https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop', 'Redaksi ArgasariHub')
on conflict do nothing;

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
