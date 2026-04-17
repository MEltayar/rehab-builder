-- ============================================================
-- Rehab Builder — Client Extended Fields Migration
-- Run this in the Supabase SQL Editor
-- ============================================================

alter table public.clients
  add column if not exists height_cm integer,
  add column if not exists weight_kg numeric,
  add column if not exists fitness_goal text,
  add column if not exists medical_history text,
  add column if not exists food_preferences text,
  add column if not exists food_dislikes text,
  add column if not exists health_alerts text,
  add column if not exists general_notes text;
