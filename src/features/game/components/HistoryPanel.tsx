import { Card } from "@/components/ui/card";
import type { PickWithOutcome, Player } from "@/lib/types";
import { OUTCOME_STYLE } from "@/features/game/outcome-style";

export function HistoryPanel({
  picks,
  players,
}: {
  picks: PickWithOutcome[];
  players: Player[];
}) {
  if (picks.length === 0) {
    return (
      <Card className="text-center text-sm text-violet-300/50">
        No picks yet. The history of every reveal will show up here.
      </Card>
    );
  }

  const nameOf = (id: string) =>
    players.find((p) => p.id === id)?.name ?? "Unknown";

  // Newest first.
  const ordered = [...picks].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  return (
    <Card className="flex flex-col gap-2">
      <h2 className="text-xs font-bold uppercase tracking-widest text-violet-300/60">
        History
      </h2>
      <ul className="flex flex-col gap-2">
        {ordered.map((pick) => {
          const style = OUTCOME_STYLE[pick.outcome.type];
          return (
            <li
              key={pick.id}
              className="flex items-center gap-3 rounded-2xl bg-surface-2/50 px-3 py-2"
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-surface text-sm font-bold text-violet-200">
                {pick.number}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white">
                  {nameOf(pick.player_id)}
                </p>
                <p className={`truncate text-xs ${style.text}`}>
                  {style.emoji} {pick.outcome.title}
                </p>
              </div>
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${style.chip}`}
              >
                {style.label}
              </span>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
