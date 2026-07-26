-- Enable Supabase Realtime for order status updates

alter publication supabase_realtime add table public.orders;
alter publication supabase_realtime add table public.order_seller_confirmations;
