-- ============================================================
-- Rehab Builder — Add user_id and grams_per_unit to food_items
-- Run this in the Supabase SQL Editor
-- ============================================================

alter table public.food_items
  add column if not exists user_id uuid references auth.users(id) on delete cascade,
  add column if not exists grams_per_unit numeric;
