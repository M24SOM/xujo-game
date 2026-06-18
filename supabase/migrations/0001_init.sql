-- Lucky 20 — schema
-- Run in the Supabase SQL editor (or `supabase db push`).

create extension if not exists "pgcrypto";

-- Outcome types
do $$
begin
  if not exists (select 1 from pg_type where typname = 'outcome_type') then
    create type outcome_type as enum ('reward', 'punishment', 'leave');
  end if;
end$$;

-- Outcomes pool (shared across games)
create table if not exists public.outcomes (
  id          uuid primary key default gen_random_uuid(),
  type        outcome_type not null,
  title       text not null,
  description text not null default '',
  weight      integer not null default 1 check (weight > 0)
);

-- Games
create table if not exists public.games (
  id         uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now()
);

-- Players
create table if not exists public.players (
  id         uuid primary key default gen_random_uuid(),
  game_id    uuid not null references public.games(id) on delete cascade,
  name       text not null,
  turn_order integer not null,
  eliminated boolean not null default false,
  unique (game_id, turn_order)
);

-- Picks
create table if not exists public.picks (
  id         uuid primary key default gen_random_uuid(),
  game_id    uuid not null references public.games(id) on delete cascade,
  player_id  uuid not null references public.players(id) on delete cascade,
  number     integer not null check (number between 1 and 20),
  outcome_id uuid not null references public.outcomes(id),
  created_at timestamptz not null default now(),
  unique (game_id, number)
);

create index if not exists picks_game_id_idx on public.picks (game_id);
create index if not exists players_game_id_idx on public.players (game_id);

-- Row level security.
-- The app talks to Supabase only from the server using the service-role key,
-- which bypasses RLS. We still enable RLS so the tables are locked down to
-- anon/auth clients. Outcomes are world-readable so they can be browsed.
alter table public.outcomes enable row level security;
alter table public.games   enable row level security;
alter table public.players enable row level security;
alter table public.picks   enable row level security;

drop policy if exists "outcomes are readable" on public.outcomes;
create policy "outcomes are readable" on public.outcomes
  for select using (true);
