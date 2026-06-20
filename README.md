# Lucky 20 — Number Pick Game

A pass-the-phone party game for **2 or 4 players**. Take turns picking numbers;
each one reveals its outcome (reward, punishment, or elimination). Every game has
a fixed, shuffled deck whose size and mix depend on the player count:

- **4 players** → 20 numbers: 5 leave / 10 punishment / 5 reward
- **2 players** → 10 numbers: 2 leave / 5 punishment / 3 reward

The board size and outcome mix live in one place — `src/lib/settings.ts`. No
multiplayer networking — one device, a few friends.

Built with **Next.js (App Router)**, **TypeScript (strict)**, **Tailwind CSS v4**,
**Supabase**, and **Server Actions**.

## Quick start

### 1. Install

```bash
npm install
```

### 2. Set up Supabase

Create a project at [supabase.com](https://supabase.com), then in the SQL editor
run, in order:

1. `supabase/migrations/0001_init.sql` — creates the tables and types.
2. `supabase/migrations/0002_game_deck.sql` — adds the per-game `deck` column.
3. `supabase/seed.sql` — fills the outcomes pool.

### 3. Configure env

```bash
cp .env.local.example .env.local
```

Fill in from **Project Settings → API**:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server-only — never exposed to the browser)
- `ADMIN_PIN` — 4-digit PIN for the `/admin` outcomes editor (defaults to `1234`)

### 4. Run

```bash
npm run dev
```

Open http://localhost:3000.

## How it works

- All database access happens on the **server** (server components + server
  actions) using the Supabase service-role key. There is no client-side auth, so
  RLS is enabled to lock the tables to anon clients while the server bypasses it.
- When a game is created, a fixed **deck** is generated: exactly 5 leave,
  10 punishment, and 5 reward outcomes, shuffled across numbers 1–20 and saved on
  the game. A move (`pickNumber`) is fully validated server-side (it's that
  player's turn, the number is free, the game isn't over) and reveals the outcome
  pre-assigned to that number. Within each type, the concrete outcome row is
  chosen by weighted random using the `weight` column.
- Turn order is derived deterministically from the pick history, skipping
  eliminated players and looping through whoever's still active.
- The game ends when all 20 numbers are gone, or only one player remains.

## Admin

Visit `/admin` (or the discreet **Admin** link on the home screen) and enter the
4-digit `ADMIN_PIN`. From there you can add, edit, and delete outcomes (type,
title, description, weight). Changes apply to **new** games. The PIN is checked
server-side and stored as a salted hash in an httpOnly cookie. An outcome used by
a past game can't be deleted (it's referenced by that game's history).

## Project structure

```
src/
  app/                      # routes (home, setup, game, summary)
  components/ui/            # reusable Button, Card
  features/
    setup/                  # create-game action + name form
    game/                   # logic, queries, actions, board components
    summary/                # results UI
  lib/
    supabase/server.ts      # service-role client (server-only)
    types.ts                # shared domain types
supabase/
  migrations/0001_init.sql
  seed.sql
```

Business logic (`src/features/game/logic.ts`) is pure and side-effect free, so it
can be unit-tested without a database.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run typecheck` | Strict TypeScript check |
| `npm run lint` | ESLint |
