-- ============================================================
-- Rehab Builder — Subscriptions Table
-- Run this in the Supabase SQL Editor
-- ============================================================

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  plan text not null default 'trial',          -- 'trial' | 'pro_monthly' | 'pro_yearly'
  status text not null default 'active',        -- 'active' | 'expired'
  trial_started_at timestamptz not null default now(),
  current_period_end timestamptz,               -- set when upgraded to pro
  created_at timestamptz not null default now()
);

alter table public.subscriptions enable row level security;

create policy "subscriptions_own" on public.subscriptions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
