-- ============================================================
-- Rehab Builder — Tighten RLS on exercises, food_items & diet_plans
-- Fix function search_path on is_admin & handle_new_user_subscription
-- Run this in the Supabase SQL Editor
-- ============================================================

-- ── exercises ─────────────────────────────────────────────────────────────────
-- Built-in exercises (is_custom = false) are shared with everyone.
-- Custom exercises belong to their owner.
-- Admins/staff can manage built-ins. No admin bypass on reads — admins
-- see built-ins + their own customs only (not every user's customs).

drop policy if exists "exercises_select_all" on public.exercises;
drop policy if exists "exercises_insert_own" on public.exercises;
drop policy if exists "exercises_update_own" on public.exercises;
drop policy if exists "exercises_delete_own" on public.exercises;
drop policy if exists "exercises_select" on public.exercises;
drop policy if exists "exercises_insert" on public.exercises;
drop policy if exists "exercises_update" on public.exercises;
drop policy if exists "exercises_delete" on public.exercises;

create policy "exercises_select"
  on public.exercises for select
  using (
    is_custom = false
    or user_id = auth.uid()
  );

create policy "exercises_insert"
  on public.exercises for insert
  with check (
    (user_id = auth.uid() and is_custom = true)
    or public.is_admin()
  );

create policy "exercises_update"
  on public.exercises for update
  using (
    (user_id = auth.uid() and is_custom = true)
    or public.is_admin()
  )
  with check (
    (user_id = auth.uid() and is_custom = true)
    or public.is_admin()
  );

create policy "exercises_delete"
  on public.exercises for delete
  using (
    (user_id = auth.uid() and is_custom = true)
    or public.is_admin()
  );


-- ── food_items ────────────────────────────────────────────────────────────────
-- Built-in items (is_custom = false) are shared with everyone.
-- Custom items belong to their owner.
-- Admins/staff can manage built-ins.

drop policy if exists "food_items_select" on public.food_items;
drop policy if exists "food_items_insert" on public.food_items;
drop policy if exists "food_items_update" on public.food_items;
drop policy if exists "food_items_delete" on public.food_items;

create policy "food_items_select"
  on public.food_items for select
  using (
    is_custom = false
    or user_id = auth.uid()
  );

create policy "food_items_insert"
  on public.food_items for insert
  with check (
    (user_id = auth.uid() and is_custom = true)
    or public.is_admin()
  );

create policy "food_items_update"
  on public.food_items for update
  using (
    (user_id = auth.uid() and is_custom = true)
    or public.is_admin()
  )
  with check (
    (user_id = auth.uid() and is_custom = true)
    or public.is_admin()
  );

create policy "food_items_delete"
  on public.food_items for delete
  using (
    (user_id = auth.uid() and is_custom = true)
    or public.is_admin()
  );

-- ── diet_plans ────────────────────────────────────────────────────────────────
-- Strict owner-only (Option A). Backfill any legacy rows with null user_id
-- from the owning client before enforcing the new rules.

update public.diet_plans dp
set user_id = c.user_id
from public.clients c
where dp.client_id = c.id and dp.user_id is null;

drop policy if exists "diet_plans_select" on public.diet_plans;
drop policy if exists "diet_plans_insert" on public.diet_plans;
drop policy if exists "diet_plans_update" on public.diet_plans;
drop policy if exists "diet_plans_delete" on public.diet_plans;

create policy "diet_plans_select"
  on public.diet_plans for select
  using (user_id = auth.uid());

create policy "diet_plans_insert"
  on public.diet_plans for insert
  with check (user_id = auth.uid());

create policy "diet_plans_update"
  on public.diet_plans for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "diet_plans_delete"
  on public.diet_plans for delete
  using (user_id = auth.uid());

-- ── Lock down function search_path ────────────────────────────────────────────
-- Prevents search_path hijacking without changing behavior.

alter function public.is_admin() set search_path = public, pg_temp;
alter function public.handle_new_user_subscription() set search_path = public, pg_temp;
