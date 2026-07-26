-- Moderation for seller postings (products & kuliner)

alter table public.products
  add column if not exists moderation_status text not null default 'approved'
    check (moderation_status in ('pending', 'approved', 'rejected')),
  add column if not exists moderation_note text,
  add column if not exists reviewed_at timestamptz;

alter table public.kuliner
  add column if not exists moderation_status text not null default 'approved'
    check (moderation_status in ('pending', 'approved', 'rejected')),
  add column if not exists moderation_note text,
  add column if not exists reviewed_at timestamptz;

-- Existing seller rows stay approved; new seller inserts should set pending in app
update public.products set moderation_status = 'approved' where seller_id is not null and moderation_status is null;
update public.kuliner set moderation_status = 'approved' where seller_id is not null and moderation_status is null;

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

create index if not exists products_moderation_status_idx on public.products (moderation_status)
  where seller_id is not null;
create index if not exists kuliner_moderation_status_idx on public.kuliner (moderation_status)
  where seller_id is not null;
