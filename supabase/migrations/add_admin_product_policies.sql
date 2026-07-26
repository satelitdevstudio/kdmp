-- Allow admin to create and edit platform products (seller_id = null)
create policy "Admins can insert products"
  on public.products for insert
  with check (public.is_admin());

create policy "Admins can update any product"
  on public.products for update
  using (public.is_admin());

create policy "Admins can update any kuliner"
  on public.kuliner for update
  using (public.is_admin());
