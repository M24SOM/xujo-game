-- Each game gets a fixed, shuffled deck of 20 outcomes assigned to numbers 1..20.
-- Composition is always: 5 leave, 10 punishment, 5 reward.
-- Stored as jsonb: { "1": "<outcome_id>", "2": "<outcome_id>", ... }.

alter table public.games
  add column if not exists deck jsonb;
