-- Add a lifetime client creation counter to subscriptions
alter table public.subscriptions
  add column clients_created integer not null default 0;
