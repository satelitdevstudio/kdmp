-- Migration: jam operasional warung kuliner
-- Jalankan jika tabel kuliner sudah ada tanpa kolom opening_time / closing_time

alter table public.kuliner
  add column if not exists opening_time text not null default '08:00',
  add column if not exists closing_time text not null default '21:00';
