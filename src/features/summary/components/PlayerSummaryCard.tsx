import { Card } from "@/components/ui/card";
import type { PickWithOutcome, Player } from "@/lib/types";
import { OUTCOME_STYLE } from "@/features/game/outcome-style";

const AVATARS = ["🦊", "🐼", "🐸", "🦄"];

export function PlayerSummaryCard({
  player,
  picks,
  isWinner,
}: {
  player: Player;
  picks: PickWithOutcome[];
  isWinner: boolean;
}) {
  const own = picks
    .filter((p) => p.player_id === player.id)
    .sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    );
  const rewards = own.filter((p) => p.outcome.type === "reward").length;
  const punishments = own.filter((p) => p.outcome.type === "punishment").length;

  return (
    <Card
      className={
        isWinner
          ? "border-primary/60 bg-gradient-to-br from-primary/15 to-surface ring-1 ring-primary/40"
          : player.eliminated
            ? "opacity-80"
            : ""
      }
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-surface-2 text-2xl">
            {AVATARS[player.turn_order % AVATARS.length]}
          </span>
          <div>
            <p className="flex items-center gap-2 text-lg font-bold leading-tight">
              {player.name}
              {isWinner && <span title="Winner">👑</span>}
            </p>
            <p className="text-xs text-violet-300/60">
              {player.eliminated ? "Eliminated" : "Survived"} · {own.length} pick
              {own.length === 1 ? "" : "s"}
            </p>
          </div>
        </div>
        <div className="flex gap-2 text-xs font-bold">
          <span className="rounded-full bg-reward/15 px-2 py-1 text-reward">
            {rewards} 🎁
          </span>
          <span className="rounded-full bg-punish/15 px-2 py-1 text-punish">
            {punishments} ⚡
          </span>
        </div>
      </div>

      {own.length > 0 && (
        <ul className="mt-3 flex flex-col gap-1.5 border-t border-border pt-3">
          {own.map((pick) => {
            const style = OUTCOME_STYLE[pick.outcome.type];
            return (
              <li
                key={pick.id}
                className="flex items-center gap-2 text-sm"
              >
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-surface-2 text-xs font-bold text-violet-200">
                  {pick.number}
                </span>
                <span className={`font-medium ${style.text}`}>
                  {style.emoji} {pick.outcome.title}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
