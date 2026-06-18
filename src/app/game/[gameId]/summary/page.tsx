import { notFound } from "next/navigation";
import { getGameState } from "@/features/game/queries";
import { activePlayers, determineWinner } from "@/features/game/logic";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PlayerSummaryCard } from "@/features/summary/components/PlayerSummaryCard";

export const dynamic = "force-dynamic";

export default async function SummaryPage({
  params,
}: {
  params: Promise<{ gameId: string }>;
}) {
  const { gameId } = await params;
  const state = await getGameState(gameId);
  if (!state) notFound();

  const winner = determineWinner(state.players, state.picks);
  const survivors = activePlayers(state.players);
  const orderedPlayers = [...state.players].sort(
    (a, b) => a.turn_order - b.turn_order,
  );

  return (
    <div className="flex flex-1 flex-col gap-5 animate-rise">
      <header className="text-center">
        <div className="animate-float text-6xl">🏁</div>
        <h1 className="mt-2 text-3xl font-black tracking-tight">Game Over</h1>
      </header>

      <Card className="bg-gradient-to-br from-primary/20 to-surface text-center">
        {winner ? (
          <>
            <p className="text-sm uppercase tracking-widest text-violet-200/60">
              Winner
            </p>
            <p className="mt-1 text-3xl font-black text-white">
              👑 {winner.name}
            </p>
            <p className="mt-1 text-sm text-violet-200/70">
              {survivors.length <= 1
                ? "Last player standing!"
                : "Most rewards, fewest punishments."}
            </p>
          </>
        ) : (
          <>
            <p className="text-2xl font-black text-white">It&apos;s a tie!</p>
            <p className="mt-1 text-sm text-violet-200/70">
              No single winner this round.
            </p>
          </>
        )}
      </Card>

      <section className="flex flex-col gap-3">
        <h2 className="text-xs font-bold uppercase tracking-widest text-violet-300/60">
          Results
        </h2>
        {orderedPlayers.map((player) => (
          <PlayerSummaryCard
            key={player.id}
            player={player}
            picks={state.picks}
            isWinner={winner?.id === player.id}
          />
        ))}
      </section>

      <div className="mt-2 flex flex-col gap-3">
        <ButtonLink href="/setup" className="w-full">
          Restart Game
        </ButtonLink>
        <ButtonLink href="/" variant="ghost" className="w-full">
          Home
        </ButtonLink>
      </div>
    </div>
  );
}
