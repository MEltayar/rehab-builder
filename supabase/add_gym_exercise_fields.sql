-- ============================================================
-- Rehab Builder — Add gym exercise fields to exercises table
-- Run this in the Supabase SQL Editor
-- ============================================================

alter table public.exercises
  add column if not exists muscle_group text,
  add column if not exists equipment   text;
