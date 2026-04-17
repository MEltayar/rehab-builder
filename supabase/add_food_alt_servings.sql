-- ============================================================
-- Rehab Builder — Add alt_servings column to food_items
-- Run this in the Supabase SQL Editor
-- ============================================================

alter table public.food_items
  add column if not exists alt_servings jsonb;
