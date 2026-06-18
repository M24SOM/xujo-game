export type OutcomeType = "reward" | "punishment" | "leave";

export interface Outcome {
  id: string;
  type: OutcomeType;
  title: string;
  description: string;
  weight: number;
}

/** Maps each number ("1".."20") to the outcome id assigned to it for a game. */
export type OutcomeDeck = Record<string, string>;

export interface Game {
  id: string;
  created_at: string;
  deck: OutcomeDeck | null;
}

export interface Player {
  id: string;
  game_id: string;
  name: string;
  turn_order: number;
  eliminated: boolean;
}

export interface Pick {
  id: string;
  game_id: string;
  player_id: string;
  number: number;
  outcome_id: string;
  created_at: string;
}

/** A pick joined with its outcome and the player who made it. */
export interface PickWithOutcome extends Pick {
  outcome: Outcome;
}

/** Absolute upper bound on the grid (largest board). */
export const TOTAL_NUMBERS = 20;
export const MAX_PLAYERS = 4;

export type PlayerCount = 2 | 4;
export type DeckComposition = Record<OutcomeType, number>;

export const DEFAULT_PLAYER_NAMES = [
  "Player 1",
  "Player 2",
  "Player 3",
  "Player 4",
] as const;
