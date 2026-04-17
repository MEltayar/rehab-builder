-- ============================================================
-- Rehab Builder — Client Check-ins Migration
-- Run this in the Supabase SQL Editor
-- ============================================================

create table public.client_check_ins (
  id text primary key,
  client_id text not null references public.clients(id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  date text not null,
  weight_kg numeric,
  body_fat_pct numeric,
  waist_cm numeric,
  chest_cm numeric,
  hip_cm numeric,
  notes text,
  created_at text not null
);

alter table public.client_check_ins enable row level security;

create policy "check_ins_own" on public.client_check_ins
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
