-- ============================================================
-- Rehab Builder — Add profile_type to settings
-- Run this in the Supabase SQL Editor
-- ============================================================

alter table public.settings
  add column if not exists profile_type text not null default 'physio';

-- Constraint to enforce valid values
alter table public.settings
  drop constraint if exists settings_profile_type_check;

alter table public.settings
  add constraint settings_profile_type_check
  check (profile_type in ('physio', 'gym'));
