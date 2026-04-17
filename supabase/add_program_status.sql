-- ============================================================
-- Rehab Builder — Add status column to programs table
-- Run this in the Supabase SQL Editor
-- ============================================================

alter table public.programs
  add column if not exists status text not null default 'active';
