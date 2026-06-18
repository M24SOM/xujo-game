import type {
  DeckComposition,
  Outcome,
  OutcomeDeck,
  OutcomeType,
  Player,
  PickWithOutcome,
} from "@/lib/types";

/**
 * Pure game logic. No I/O here so it can be unit-tested in isolation.
 */

/** In-place Fisher–Yates shuffle using the supplied rng. */
function shuffle<T>(items: T[], rng: () => number): T[] {
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = items[i]!;
    items[i] = items[j]!;
    items[j] = tmp;
  }
  return items;
}

/**
 * Build a game's fixed outcome deck: exactly `composition` counts of each type,
 * shuffled across numbers 1..N (where N is the sum of the composition). Within a
 * type, a concrete outcome row is chosen by weighted random (the row's
 * title/description can repeat — there are usually more slots than rows).
 */
export function buildOutcomeDeck(
  outcomes: Outcome[],
  composition: DeckComposition,
  rng: () => number = Math.random,
): OutcomeDeck {
  const byType = new Map<OutcomeType, Outcome[]>();
  for (const o of outcomes) {
    const list = byType.get(o.type) ?? [];
    list.push(o);
    byType.set(o.type, list);
  }

  const slots: OutcomeType[] = [];
  for (const [type, count] of Object.entries(composition) as [
    OutcomeType,
    number,
  ][]) {
    if (count > 0 && (byType.get(type)?.length ?? 0) === 0) {
      throw new Error(`No "${type}" outcomes available. Run supabase/seed.sql.`);
    }
    for (let i = 0; i < count; i++) slots.push(type);
  }

  shuffle(slots, rng);

  const deck: OutcomeDeck = {};
  slots.forEach((type, index) => {
    const pool = byType.get(type)!;
    const chosen = selectWeightedOutcome(pool, rng);
    deck[String(index + 1)] = chosen.id;
  });
  return deck;
}

/** Pick an outcome using weighted random selection (higher weight = more likely). */
export function selectWeightedOutcome(
  outcomes: Outcome[],
  rng: () => number = Math.random,
): Outcome {
  if (outcomes.length === 0) {
    throw new Error("No outcomes available to choose from.");
  }
  const totalWeight = outcomes.reduce((sum, o) => sum + Math.max(0, o.weight), 0);
  if (totalWeight <= 0) {
    // All weights zero — fall back to uniform.
    return outcomes[Math.floor(rng() * outcomes.length)]!;
  }
  let roll = rng() * totalWeight;
  for (const outcome of outcomes) {
    roll -= Math.max(0, outcome.weight);
    if (roll < 0) return outcome;
  }
  return outcomes[outcomes.length - 1]!;
}

/** Players still in the game, sorted by turn order. */
export function activePlayers(players: Player[]): Player[] {
  return players
    .filter((p) => !p.eliminated)
    .sort((a, b) => a.turn_order - b.turn_order);
}

/** Numbers 1..total that have not been picked yet. */
export function availableNumbers(
  picks: Pick[] | PickWithOutcome[],
  total: number,
): number[] {
  const taken = new Set(picks.map((p) => p.number));
  const out: number[] = [];
  for (let n = 1; n <= total; n++) {
    if (!taken.has(n)) out.push(n);
  }
  return out;
}

type Pick = { number: number };

/**
 * Whose turn is it now?
 *
 * Determined by walking from the most recent pick's player to the next active
 * player in turn order, looping around. Eliminated players are skipped. If no
 * picks have been made, the lowest-turn-order active player starts.
 *
 * Returns null when the game is over (no active players, or the game has ended).
 */
export function currentPlayer(
  players: Player[],
  picks: PickWithOutcome[],
): Player | null {
  const ordered = [...players].sort((a, b) => a.turn_order - b.turn_order);
  const active = ordered.filter((p) => !p.eliminated);
  if (active.length === 0) return null;

  if (picks.length === 0) {
    return active[0]!;
  }

  // Most recent pick (picks are expected newest-last; sort to be safe).
  const lastPick = [...picks].sort(
    (a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  )[picks.length - 1]!;

  const lastPlayer = ordered.find((p) => p.id === lastPick.player_id);
  const startIndex = lastPlayer
    ? ordered.findIndex((p) => p.id === lastPlayer.id)
    : -1;

  // Walk forward through the full order, looping, until we hit an active player.
  for (let step = 1; step <= ordered.length; step++) {
    const candidate = ordered[(startIndex + step) % ordered.length]!;
    if (!candidate.eliminated) return candidate;
  }
  return null;
}

/** The game ends when every number is gone, or one/zero players remain active. */
export function isGameOver(
  players: Player[],
  picks: Pick[] | PickWithOutcome[],
  total: number,
): boolean {
  const active = players.filter((p) => !p.eliminated);
  return picks.length >= total || active.length <= 1;
}

/**
 * Determine the winner for the summary screen.
 *
 * If exactly one player is left standing, they win. Otherwise (all numbers ran
 * out with several still active) the winner is the active player with the most
 * rewards, then fewest punishments. Ties return null (shared / no clear winner).
 */
export function determineWinner(
  players: Player[],
  picks: PickWithOutcome[],
): Player | null {
  const active = players.filter((p) => !p.eliminated);
  if (active.length === 1) return active[0]!;
  if (active.length === 0) return null;

  const score = (playerId: string) => {
    const own = picks.filter((p) => p.player_id === playerId);
    const rewards = own.filter((p) => p.outcome.type === "reward").length;
    const punishments = own.filter((p) => p.outcome.type === "punishment").length;
    return { rewards, punishments };
  };

  const ranked = [...active].sort((a, b) => {
    const sa = score(a.id);
    const sb = score(b.id);
    if (sb.rewards !== sa.rewards) return sb.rewards - sa.rewards;
    return sa.punishments - sb.punishments;
  });

  const top = score(ranked[0]!.id);
  const second = ranked[1] ? score(ranked[1].id) : null;
  if (
    second &&
    top.rewards === second.rewards &&
    top.punishments === second.punishments
  ) {
    return null; // tie
  }
  return ranked[0]!;
}
