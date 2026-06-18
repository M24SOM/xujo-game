"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getGameState, getOutcomes } from "@/features/game/queries";
import { currentPlayer, isGameOver } from "@/features/game/logic";
import type { Outcome } from "@/lib/types";

export interface PickResult {
  ok: boolean;
  error?: string;
  outcome?: Outcome;
  playerName?: string;
  eliminated?: boolean;
  gameOver?: boolean;
}

/**
 * The core move: a player taps a number. We validate the move on the server,
 * pick a weighted-random outcome, persist the pick, eliminate the player if the
 * outcome is "leave", then report back so the client can play the reveal.
 */
export async function pickNumber(
  gameId: string,
  playerId: string,
  pickedNumber: number,
): Promise<PickResult> {
  if (!Number.isInteger(pickedNumber) || pickedNumber < 1) {
    return { ok: false, error: "Invalid number." };
  }

  const supabase = getSupabaseServer();
  const state = await getGameState(gameId);
  if (!state) return { ok: false, error: "Game not found." };

  // The outcome and board size for this game were fixed at creation time.
  const deck = state.game.deck;
  if (!deck) {
    return {
      ok: false,
      error:
        "This game has no outcome deck. Run the 0002 migration and start a new game.",
    };
  }
  const totalNumbers = Object.keys(deck).length;

  if (isGameOver(state.players, state.picks, totalNumbers)) {
    return { ok: false, error: "Game is already over.", gameOver: true };
  }

  // Validate it is actually this player's turn.
  const turnPlayer = currentPlayer(state.players, state.picks);
  if (!turnPlayer || turnPlayer.id !== playerId) {
    return { ok: false, error: "It is not this player's turn." };
  }

  // Validate the number is still available.
  if (state.picks.some((p) => p.number === pickedNumber)) {
    return { ok: false, error: "That number was already taken." };
  }

  const outcomeId = deck[String(pickedNumber)];
  if (!outcomeId) {
    return { ok: false, error: "That number is not on the board." };
  }

  const outcomes = await getOutcomes();
  const outcome = outcomes.find((o) => o.id === outcomeId);
  if (!outcome) {
    return { ok: false, error: "Assigned outcome not found." };
  }

  const { error: pickError } = await supabase.from("picks").insert({
    game_id: gameId,
    player_id: playerId,
    number: pickedNumber,
    outcome_id: outcome.id,
  });

  if (pickError) {
    // Unique violation = someone grabbed that number first.
    return { ok: false, error: "That number was just taken. Try another." };
  }

  let eliminated = false;
  if (outcome.type === "leave") {
    eliminated = true;
    const { error: elimError } = await supabase
      .from("players")
      .update({ eliminated: true })
      .eq("id", playerId);
    if (elimError) {
      return { ok: false, error: `Could not eliminate player: ${elimError.message}` };
    }
  }

  // Recompute end-state after the move.
  const updatedPlayers = state.players.map((p) =>
    p.id === playerId ? { ...p, eliminated: p.eliminated || eliminated } : p,
  );
  const gameOver = isGameOver(
    updatedPlayers,
    [...state.picks, { number: pickedNumber }],
    totalNumbers,
  );

  revalidatePath(`/game/${gameId}`);

  return {
    ok: true,
    outcome,
    playerName: turnPlayer.name,
    eliminated,
    gameOver,
  };
}
