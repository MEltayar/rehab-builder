-- ============================================================
-- Rehab Builder — Diet Plans table
-- Run this in the Supabase SQL Editor
-- ============================================================

create table if not exists public.diet_plans (
  id               text    primary key,
  client_id        text    not null references public.clients(id) on delete cascade,
  name             text    not null,
  goal             text    not null default '',
  target_calories  numeric,
  target_protein   numeric,
  target_carbs     numeric,
  target_fat       numeric,
  duration_weeks   integer not null default 4,
  start_date       text    not null,
  days             jsonb   not null default '[]',
  notes            text,
  created_at       text    not null,
  updated_at       text    not null
);

alter table public.diet_plans enable row level security;

create policy "diet_plans_select" on public.diet_plans for select using (true);
create policy "diet_plans_insert" on public.diet_plans for insert with check (true);
create policy "diet_plans_update" on public.diet_plans for update using (true);
create policy "diet_plans_delete" on public.diet_plans for delete using (true);
