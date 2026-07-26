-- Per-seller order confirmation for mixed carts

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

drop policy if exists "Buyers can view seller confirmations for own orders" on public.order_seller_confirmations;
create policy "Buyers can view seller confirmations for own orders"
  on public.order_seller_confirmations for select
  using (
    exists (
      select 1 from public.orders
      where orders.id = order_seller_confirmations.order_id
      and orders.buyer_id = auth.uid()
    )
  );

drop policy if exists "Sellers can view own confirmations" on public.order_seller_confirmations;
create policy "Sellers can view own confirmations"
  on public.order_seller_confirmations for select
  using (auth.uid() = seller_id);

drop policy if exists "Sellers can update own confirmations" on public.order_seller_confirmations;
create policy "Sellers can update own confirmations"
  on public.order_seller_confirmations for update
  using (auth.uid() = seller_id);

drop policy if exists "Admins can view all seller confirmations" on public.order_seller_confirmations;
create policy "Admins can view all seller confirmations"
  on public.order_seller_confirmations for select
  using (public.is_admin());

drop policy if exists "Admins can update all seller confirmations" on public.order_seller_confirmations;
create policy "Admins can update all seller confirmations"
  on public.order_seller_confirmations for update
  using (public.is_admin());

drop policy if exists "System can insert seller confirmations" on public.order_seller_confirmations;
create policy "System can insert seller confirmations"
  on public.order_seller_confirmations for insert
  with check (true);
