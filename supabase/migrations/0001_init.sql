-- Where Was I — schema + RLS.
-- Identity model mirrors oneui: the client sends an `x-user-hash` header (the
-- SHA-256 of the user's secret). RLS policies scope every row to that header,
-- so the public/anon key alone never exposes another user's data.

-- ── Trips ──────────────────────────────────────────────────
create table if not exists public.trips (
  id           uuid primary key default gen_random_uuid(),
  user_hash    text not null,
  country_code text not null,
  country_name text,
  is_schengen  boolean not null default false,
  arrive_at    timestamptz not null,
  leave_at     timestamptz,
  source       text not null default 'manual', -- 'manual' | 'daily_confirm'
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index if not exists trips_user_hash_idx on public.trips (user_hash);
create index if not exists trips_arrive_idx on public.trips (arrive_at);

-- ── Settings (one row per user) ────────────────────────────
create table if not exists public.user_settings (
  user_hash     text primary key,
  home_country  text not null default 'IN',
  counting_mode text not null default 'anytime', -- 'anytime' | 'midnight'
  notif_enabled boolean not null default true,
  notif_hour    int not null default 18,
  snooze_until  timestamptz,
  tz            text,
  updated_at    timestamptz not null default now()
);

-- ── Push subscriptions ─────────────────────────────────────
create table if not exists public.push_subscriptions (
  id         uuid primary key default gen_random_uuid(),
  user_hash  text not null,
  endpoint   text not null unique,
  p256dh     text not null,
  auth       text not null,
  tz         text,
  last_seen  timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create index if not exists push_user_hash_idx on public.push_subscriptions (user_hash);

-- ── Row Level Security ─────────────────────────────────────
alter table public.trips enable row level security;
alter table public.user_settings enable row level security;
alter table public.push_subscriptions enable row level security;

-- Helper expression: the hash carried in the request header.
-- current_setting('request.headers', true)::json ->> 'x-user-hash'

create policy trips_by_hash on public.trips
  for all to anon, authenticated
  using (user_hash = (current_setting('request.headers', true)::json ->> 'x-user-hash'))
  with check (user_hash = (current_setting('request.headers', true)::json ->> 'x-user-hash'));

create policy settings_by_hash on public.user_settings
  for all to anon, authenticated
  using (user_hash = (current_setting('request.headers', true)::json ->> 'x-user-hash'))
  with check (user_hash = (current_setting('request.headers', true)::json ->> 'x-user-hash'));

create policy push_by_hash on public.push_subscriptions
  for all to anon, authenticated
  using (user_hash = (current_setting('request.headers', true)::json ->> 'x-user-hash'))
  with check (user_hash = (current_setting('request.headers', true)::json ->> 'x-user-hash'));
