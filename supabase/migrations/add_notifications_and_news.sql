-- Migration: notifications, village_news, admin & seller policies
-- Jalankan jika database sudah ada sebelum fitur ini

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

drop policy if exists "Users can view own notifications" on public.notifications;
create policy "Users can view own notifications"
  on public.notifications for select using (auth.uid() = user_id);

drop policy if exists "Users can update own notifications" on public.notifications;
create policy "Users can update own notifications"
  on public.notifications for update using (auth.uid() = user_id);

drop policy if exists "System can insert notifications" on public.notifications;
create policy "System can insert notifications"
  on public.notifications for insert with check (true);

-- Village news
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

drop policy if exists "Published news are viewable by everyone" on public.village_news;
create policy "Published news are viewable by everyone"
  on public.village_news for select using (published = true);

-- Admin helper
create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer stable;

-- Admin policies
drop policy if exists "Admins can view all profiles" on public.profiles;
create policy "Admins can view all profiles"
  on public.profiles for select using (public.is_admin());

drop policy if exists "Admins can update any profile" on public.profiles;
create policy "Admins can update any profile"
  on public.profiles for update using (public.is_admin());

drop policy if exists "Admins can view all orders" on public.orders;
create policy "Admins can view all orders"
  on public.orders for select using (public.is_admin());

drop policy if exists "Admins can update any order" on public.orders;
create policy "Admins can update any order"
  on public.orders for update using (public.is_admin());

drop policy if exists "Admins can view all order items" on public.order_items;
create policy "Admins can view all order items"
  on public.order_items for select using (public.is_admin());

drop policy if exists "Admins can delete any product" on public.products;
create policy "Admins can delete any product"
  on public.products for delete using (public.is_admin());

drop policy if exists "Admins can delete any kuliner" on public.kuliner;
create policy "Admins can delete any kuliner"
  on public.kuliner for delete using (public.is_admin());

drop policy if exists "Admins can manage village news" on public.village_news;
create policy "Admins can manage village news"
  on public.village_news for all
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

-- Seller order policies
drop policy if exists "Sellers can view orders containing their items" on public.orders;
create policy "Sellers can view orders containing their items"
  on public.orders for select
  using (
    exists (
      select 1 from public.order_items oi
      left join public.products p on oi.product_id = p.id
      left join public.kuliner k on oi.kuliner_id = k.id
      where oi.order_id = orders.id
      and (p.seller_id = auth.uid() or k.seller_id = auth.uid())
    )
  );

drop policy if exists "Sellers can update orders containing their items" on public.orders;
create policy "Sellers can update orders containing their items"
  on public.orders for update
  using (
    exists (
      select 1 from public.order_items oi
      left join public.products p on oi.product_id = p.id
      left join public.kuliner k on oi.kuliner_id = k.id
      where oi.order_id = orders.id
      and (p.seller_id = auth.uid() or k.seller_id = auth.uid())
    )
  );

drop policy if exists "Sellers can view order items for their products" on public.order_items;
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
  );

-- Seed news
insert into public.village_news (title, excerpt, content, category, village, image_url, author) values
  ('Panen Raya Padi, Petani Desa Sukamaju Bahagia', 'Musim panen kali ini menghasilkan 15% lebih banyak dari tahun lalu.', 'Desa Sukamaju merayakan panen raya padi dengan hasil yang melampaui target.', 'berita', 'Desa Sukamaju', 'https://images.pexels.com/photos/1414651/pexels-photo-1414651.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop', 'Admin Desa Sukamaju'),
  ('Pelatihan Digital Marketing untuk UMKM Desa', '30 pelaku UMKM mengikuti pelatihan pemasaran digital.', 'Koperasi Merah Putih menggelar pelatihan digital marketing selama 3 hari.', 'kegiatan', 'Desa Wonosari', 'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop', 'Tim Koperasi'),
  ('Koperasi Merah Putih Gelar Bazar Produk Lokal', 'Bazar minggu ini menampilkan 50+ produk UMKM dari 8 desa.', 'Bazar produk lokal digelar di balai desa setiap akhir pekan.', 'pengumuman', 'Desa Pucang', 'https://images.pexels.com/photos/1488463/pexels-photo-1488463.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop', 'Panitia Bazar'),
  ('Dari Hobi Jadi Rezeki: Cerita Keripik Bu Siti', 'Berawal dari hobi membuat keripik di rumah, kini usaha Bu Siti dikenal luas.', 'Ibu Siti memulai usaha keripik pisang dari dapur rumahnya di Desa Sukamaju.', 'cerita-umkm', 'Desa Sukamaju', 'https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop', 'Redaksi ArgasariHub')
on conflict do nothing;
