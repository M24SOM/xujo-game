import "server-only";
import { getSupabaseServer } from "@/lib/supabase/server";
import type { Game, Outcome, Player, PickWithOutcome } from "@/lib/types";

export interface GameState {
  game: Game;
  players: Player[];
  picks: PickWithOutcome[];
}

/** Load a full game snapshot, or null if the game id does not exist. */
export async function getGameState(gameId: string): Promise<GameState | null> {
  const supabase = getSupabaseServer();

  const { data: game, error: gameError } = await supabase
    .from("games")
    .select("*")
    .eq("id", gameId)
    .maybeSingle();

  if (gameError) throw gameError;
  if (!game) return null;

  const [{ data: players, error: playersError }, { data: picks, error: picksError }] =
    await Promise.all([
      supabase
        .from("players")
        .select("*")
        .eq("game_id", gameId)
        .order("turn_order", { ascending: true }),
      supabase
        .from("picks")
        .select("*, outcome:outcomes(*)")
        .eq("game_id", gameId)
        .order("created_at", { ascending: true }),
    ]);

  if (playersError) throw playersError;
  if (picksError) throw picksError;

  return {
    game: game as Game,
    players: (players ?? []) as Player[],
    picks: (picks ?? []) as unknown as PickWithOutcome[],
  };
}

export async function getOutcomes(): Promise<Outcome[]> {
  const supabase = getSupabaseServer();
  const { data, error } = await supabase.from("outcomes").select("*");
  if (error) throw error;
  return (data ?? []) as Outcome[];
}
