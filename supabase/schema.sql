-- ============================================================
-- Rehab Builder — Supabase Schema
-- Run this in the Supabase SQL Editor for your project
-- ============================================================

-- exercises
create table public.exercises (
  id text primary key,
  name text not null,
  category text not null,
  description text not null default '',
  image_url text,
  video_url text,
  tags jsonb not null default '[]',
  progression_level text,
  progression_group_id text,
  notes text,
  created_at text not null,
  is_custom boolean not null default false
);

-- clients
create table public.clients (
  id text primary key,
  name text not null,
  age integer,
  email text,
  phone text,
  created_at text not null
);

-- programs
create table public.programs (
  id text primary key,
  client_id text not null references public.clients(id) on delete cascade,
  name text not null,
  condition text not null default '',
  goal text not null default '',
  duration_weeks integer not null default 4,
  start_date text not null,
  sessions jsonb not null default '[]',
  created_at text not null,
  updated_at text not null
);

-- templates
create table public.templates (
  id text primary key,
  name text not null,
  condition text not null default '',
  description text,
  tags jsonb not null default '[]',
  sessions jsonb not null default '[]',
  is_built_in boolean not null default false,
  created_at text not null
);

-- settings (single-row table, id is always 1)
create table public.settings (
  id integer primary key default 1,
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

-- ── Row Level Security ────────────────────────────────────────────────────────
-- RLS is disabled for now. Enable and add policies when auth is added.
alter table public.exercises disable row level security;
alter table public.clients disable row level security;
alter table public.programs disable row level security;
alter table public.templates disable row level security;
alter table public.settings disable row level security;
