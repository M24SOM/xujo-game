import type { DeckComposition, PlayerCount } from "@/lib/types";

/**
 * Game settings — the single source of truth for board size and outcome mix.
 *
 * Each player count has its own board: how many numbers are on the grid and how
 * the outcomes are split across them. `numbers` must equal the sum of the
 * composition counts (validated by `assertValidSettings` below).
 */
export interface GameSetting {
  /** How many numbers appear on the grid (1..numbers). */
  numbers: number;
  /** Exact count of each outcome type, spread across the numbers. */
  composition: DeckComposition;
}

export const GAME_SETTINGS: Record<PlayerCount, GameSetting> = {
  2: {
    numbers: 10,
    composition: { leave: 2, punishment: 5, reward: 3 },
  },
  4: {
    numbers: 20,
    composition: { leave: 5, punishment: 10, reward: 5 },
  },
};

/** Player counts offered on the setup screen, in display order. */
export const ALLOWED_PLAYER_COUNTS = Object.keys(GAME_SETTINGS)
  .map(Number)
  .sort((a, b) => a - b) as PlayerCount[];

export const DEFAULT_PLAYER_COUNT: PlayerCount = 4;

export function getGameSetting(count: PlayerCount): GameSetting {
  return GAME_SETTINGS[count];
}

export function isPlayerCount(value: number): value is PlayerCount {
  return value in GAME_SETTINGS;
}

/** Sum of a composition's counts. */
export function compositionTotal(composition: DeckComposition): number {
  return Object.values(composition).reduce((sum, n) => sum + n, 0);
}

/** Guard against a misconfigured setting (counts must fill the board exactly). */
export function assertValidSetting(setting: GameSetting): void {
  const total = compositionTotal(setting.composition);
  if (total !== setting.numbers) {
    throw new Error(
      `Invalid game setting: composition sums to ${total} but board has ${setting.numbers} numbers.`,
    );
  }
}
