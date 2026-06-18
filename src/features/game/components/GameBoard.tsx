"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Player, PickWithOutcome } from "@/lib/types";
import { pickNumber } from "@/features/game/actions";
import { CurrentPlayerCard } from "./CurrentPlayerCard";
import { NumberGrid } from "./NumberGrid";
import { HistoryPanel } from "./HistoryPanel";
import { RevealDialog, type RevealData } from "./RevealDialog";

export function GameBoard({
  gameId,
  current,
  players,
  picks,
  activeCount,
  remaining,
  totalNumbers,
}: {
  gameId: string;
  current: Player;
  players: Player[];
  picks: PickWithOutcome[];
  activeCount: number;
  remaining: number;
  totalNumbers: number;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [pendingNumber, setPendingNumber] = useState<number | null>(null);
  const [reveal, setReveal] = useState<RevealData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const taken = new Set(picks.map((p) => p.number));
  const busy = isPending || pendingNumber !== null || reveal !== null;

  function handlePick(n: number) {
    if (busy) return;
    setError(null);
    setPendingNumber(n);

    startTransition(async () => {
      const result = await pickNumber(gameId, current.id, n);
      if (!result.ok || !result.outcome) {
        setError(result.error ?? "Something went wrong.");
        setPendingNumber(null);
        router.refresh();
        return;
      }
      setReveal({
        number: n,
        outcome: result.outcome,
        playerName: result.playerName ?? current.name,
        eliminated: Boolean(result.eliminated),
        gameOver: Boolean(result.gameOver),
      });
    });
  }

  function handleClose() {
    const wasGameOver = reveal?.gameOver;
    setReveal(null);
    setPendingNumber(null);
    if (wasGameOver) {
      router.push(`/game/${gameId}/summary`);
    } else {
      router.refresh();
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      <CurrentPlayerCard
        name={current.name}
        turnOrder={current.turn_order}
        remaining={remaining}
        activeCount={activeCount}
      />

      {error && (
        <p className="rounded-2xl bg-punish/15 px-4 py-2 text-center text-sm font-semibold text-punish">
          {error}
        </p>
      )}

      <NumberGrid
        total={totalNumbers}
        taken={taken}
        pendingNumber={pendingNumber}
        disabled={busy}
        onPick={handlePick}
      />

      <HistoryPanel picks={picks} players={players} />

      <RevealDialog data={reveal} onClose={handleClose} />
    </div>
  );
}
