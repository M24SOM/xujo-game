"use server";

import { redirect } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getOutcomes } from "@/features/game/queries";
import { buildOutcomeDeck } from "@/features/game/logic";
import { DEFAULT_PLAYER_NAMES, type PlayerCount } from "@/lib/types";
import {
  DEFAULT_PLAYER_COUNT,
  assertValidSetting,
  getGameSetting,
  isPlayerCount,
} from "@/lib/settings";

function cleanName(raw: string, index: number): string {
  const trimmed = raw.trim().slice(0, 24);
  return trimmed.length > 0 ? trimmed : DEFAULT_PLAYER_NAMES[index]!;
}

function parsePlayerCount(raw: FormDataEntryValue | null): PlayerCount {
  const n = Number(raw);
  return isPlayerCount(n) ? n : DEFAULT_PLAYER_COUNT;
}

/**
 * Create a new game with the chosen number of players (2 or 4), generate the
 * fixed outcome deck, then redirect into the game.
 */
export async function createGame(formData: FormData): Promise<void> {
  const supabase = getSupabaseServer();

  const playerCount = parsePlayerCount(formData.get("playerCount"));
  const setting = getGameSetting(playerCount);
  assertValidSetting(setting);

  const names = Array.from({ length: playerCount }, (_, i) =>
    cleanName(String(formData.get(`name-${i}`) ?? ""), i),
  );

  // Build the per-game deck per this player count's composition, shuffled.
  const outcomes = await getOutcomes();
  const deck = buildOutcomeDeck(outcomes, setting.composition);

  const { data: game, error: gameError } = await supabase
    .from("games")
    .insert({ deck })
    .select("id")
    .single();

  if (gameError || !game) {
    throw new Error(`Could not create game: ${gameError?.message ?? "unknown"}`);
  }

  const playerRows = names.map((name, i) => ({
    game_id: game.id,
    name,
    turn_order: i,
    eliminated: false,
  }));

  const { error: playersError } = await supabase.from("players").insert(playerRows);
  if (playersError) {
    throw new Error(`Could not create players: ${playersError.message}`);
  }

  redirect(`/game/${game.id}`);
}
