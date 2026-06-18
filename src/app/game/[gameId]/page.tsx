import { notFound, redirect } from "next/navigation";
import { getGameState } from "@/features/game/queries";
import {
  activePlayers,
  availableNumbers,
  currentPlayer,
  isGameOver,
} from "@/features/game/logic";
import { GameBoard } from "@/features/game/components/GameBoard";

export const dynamic = "force-dynamic";

export default async function GamePage({
  params,
}: {
  params: Promise<{ gameId: string }>;
}) {
  const { gameId } = await params;
  const state = await getGameState(gameId);
  if (!state) notFound();

  const totalNumbers = Object.keys(state.game.deck ?? {}).length || 20;

  if (isGameOver(state.players, state.picks, totalNumbers)) {
    redirect(`/game/${gameId}/summary`);
  }

  const current = currentPlayer(state.players, state.picks);
  if (!current) {
    redirect(`/game/${gameId}/summary`);
  }

  const remaining = availableNumbers(state.picks, totalNumbers).length;
  const activeCount = activePlayers(state.players).length;

  return (
    <div className="flex flex-1 flex-col gap-4 animate-fade-in">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-black tracking-tight">Lucky 20</h1>
        <span className="rounded-full bg-surface-2 px-3 py-1 text-xs font-semibold text-violet-200/70">
          Pass the phone
        </span>
      </header>

      <GameBoard
        gameId={gameId}
        current={current}
        players={state.players}
        picks={state.picks}
        activeCount={activeCount}
        remaining={remaining}
        totalNumbers={totalNumbers}
      />
    </div>
  );
}
