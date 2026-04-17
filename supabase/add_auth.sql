-- ============================================================
-- Rehab Builder — Auth Migration
-- Run this in the Supabase SQL Editor AFTER schema.sql
-- ============================================================

-- Step 1: Clear existing rows (seeded without a user_id — will re-seed per user on first login)
truncate table public.programs;
truncate table public.exercises;
truncate table public.templates;

-- Step 2: Add user_id to exercises, clients, programs, templates
alter table public.exercises
  add column user_id uuid not null default auth.uid() references auth.users(id) on delete cascade;

alter table public.clients
  add column user_id uuid not null default auth.uid() references auth.users(id) on delete cascade;

alter table public.programs
  add column user_id uuid not null default auth.uid() references auth.users(id) on delete cascade;

alter table public.templates
  add column user_id uuid not null default auth.uid() references auth.users(id) on delete cascade;

-- Step 3: Recreate settings table with user_id as primary key
drop table public.settings;
create table public.settings (
  user_id uuid primary key default auth.uid() references auth.users(id) on delete cascade,
  clinic_name text not null default '',
  clinic_logo text,
  clinic_phone text,
  clinic_email text,
  clinic_address text,
  clinic_website text,
  therapist_name text,
  dark_mode boolean not null default false,
  whatsapp_template text,
  email_template text,
  email_subject text,
  favourite_template_ids jsonb default '[]',
  clinic_instagram text,
  clinic_facebook text,
  clinic_gmail text,
  clinic_whatsapp text,
  export_template_id text,
  export_template_favorites jsonb default '[]',
  export_palette_id text
);

-- Step 4: Enable Row Level Security
alter table public.exercises enable row level security;
alter table public.clients enable row level security;
alter table public.programs enable row level security;
alter table public.templates enable row level security;
alter table public.settings enable row level security;

-- Step 5: RLS policies — each user owns their own rows
create policy "exercises_own" on public.exercises
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "clients_own" on public.clients
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "programs_own" on public.programs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "templates_own" on public.templates
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "settings_own" on public.settings
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
