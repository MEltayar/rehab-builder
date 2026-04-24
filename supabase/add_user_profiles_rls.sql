-- ============================================================
-- Rehab Builder — Enable RLS on user_profiles
-- Run this in the Supabase SQL Editor
-- ============================================================

-- Turn on Row Level Security for the user_profiles table.
alter table public.user_profiles enable row level security;

-- Helper: returns true if the current user is an admin.
-- SECURITY DEFINER so the policies below don't recurse into themselves.
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.user_profiles
    where id = auth.uid() and role in ('super_admin', 'staff')
  );
$$;

-- Any authenticated user can read their own profile row.
drop policy if exists "user_profiles_self_read" on public.user_profiles;
create policy "user_profiles_self_read"
  on public.user_profiles for select
  using (auth.uid() = id);

-- Any authenticated user can update their own profile row.
drop policy if exists "user_profiles_self_update" on public.user_profiles;
create policy "user_profiles_self_update"
  on public.user_profiles for update
  using (auth.uid() = id) with check (auth.uid() = id);

-- Any authenticated user can insert their own profile row
-- (used if the app creates the row client-side after signup).
drop policy if exists "user_profiles_self_insert" on public.user_profiles;
create policy "user_profiles_self_insert"
  on public.user_profiles for insert
  with check (auth.uid() = id);

-- Admins (super_admin, staff) can read every profile.
drop policy if exists "user_profiles_admin_read" on public.user_profiles;
create policy "user_profiles_admin_read"
  on public.user_profiles for select
  using (public.is_admin());

-- Admins (super_admin, staff) can update every profile.
drop policy if exists "user_profiles_admin_update" on public.user_profiles;
create policy "user_profiles_admin_update"
  on public.user_profiles for update
  using (public.is_admin()) with check (public.is_admin());
