-- ============================================================
-- Rehab Builder — Food Items table
-- Run this in the Supabase SQL Editor
-- ============================================================

create table if not exists public.food_items (
  id           text    primary key,
  name         text    not null,
  category     text    not null,
  serving_size numeric not null default 100,
  serving_unit text    not null default 'g',
  calories     numeric not null default 0,
  protein      numeric not null default 0,
  carbs        numeric not null default 0,
  fat          numeric not null default 0,
  fiber        numeric,
  sugar        numeric,
  sodium       numeric,
  notes        text,
  is_custom    boolean not null default false,
  created_at   text    not null
);

-- Enable Row Level Security
alter table public.food_items enable row level security;

-- Allow all authenticated users to read all food items
create policy "food_items_select" on public.food_items
  for select using (true);

-- Allow authenticated users to insert/update/delete their own custom items
create policy "food_items_insert" on public.food_items
  for insert with check (true);

create policy "food_items_update" on public.food_items
  for update using (true);

create policy "food_items_delete" on public.food_items
  for delete using (true);
