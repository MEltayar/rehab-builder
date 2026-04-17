-- ============================================================
-- Rehab Builder — Fix RLS for built-in exercises & templates
-- Run this in the Supabase SQL Editor
-- ============================================================

-- EXERCISES: all users can read all exercises (built-in ones are shared);
-- only the owner can insert / update / delete their own rows.
drop policy if exists "exercises_own" on public.exercises;

create policy "exercises_select_all" on public.exercises
  for select using (true);

create policy "exercises_insert_own" on public.exercises
  for insert with check (auth.uid() = user_id);

create policy "exercises_update_own" on public.exercises
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "exercises_delete_own" on public.exercises
  for delete using (auth.uid() = user_id);

-- TEMPLATES: all users can read built-in templates;
-- only the owner can read / write their own custom templates.
drop policy if exists "templates_own" on public.templates;

create policy "templates_select" on public.templates
  for select using (auth.uid() = user_id OR is_built_in = true);

create policy "templates_insert_own" on public.templates
  for insert with check (auth.uid() = user_id);

create policy "templates_update_own" on public.templates
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "templates_delete_own" on public.templates
  for delete using (auth.uid() = user_id);
