-- Migration: tambah jasa ke order_items
-- Jalankan jika database sudah ada sebelum fitur pesanan jasa

alter table public.order_items add column if not exists jasa_id uuid references public.jasa(id);

-- Perbarui constraint item_type
alter table public.order_items drop constraint if exists order_items_item_type_check;
alter table public.order_items add constraint order_items_item_type_check
  check (item_type in ('product', 'kuliner', 'jasa'));

-- Perbarui constraint referensi item
alter table public.order_items drop constraint if exists order_items_check;
alter table public.order_items add constraint order_items_check check (
  (item_type = 'product' and product_id is not null) or
  (item_type = 'kuliner' and kuliner_id is not null) or
  (item_type = 'jasa' and jasa_id is not null)
);

-- Perbarui RLS: seller dapat melihat pesanan yang berisi jasa mereka
drop policy if exists "Sellers can view orders containing their items" on public.orders;
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

drop policy if exists "Sellers can update orders containing their items" on public.orders;
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
    or exists (
      select 1 from public.jasa j
      where j.id = order_items.jasa_id and j.seller_id = auth.uid()
    )
  );
