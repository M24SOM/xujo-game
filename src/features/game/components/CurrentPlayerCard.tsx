import { Card } from "@/components/ui/card";

const AVATARS = ["🦊", "🐼", "🐸", "🦄"];

export function CurrentPlayerCard({
  name,
  turnOrder,
  remaining,
  activeCount,
}: {
  name: string;
  turnOrder: number;
  remaining: number;
  activeCount: number;
}) {
  return (
    <Card className="flex items-center justify-between bg-gradient-to-br from-surface-2 to-surface">
      <div className="flex items-center gap-3">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/20 text-2xl ring-1 ring-primary/40">
          {AVATARS[turnOrder % AVATARS.length]}
        </span>
        <div>
          <p className="text-xs uppercase tracking-widest text-violet-300/60">
            Current turn
          </p>
          <p className="text-xl font-bold leading-tight">{name}</p>
        </div>
      </div>
      <div className="text-right text-sm text-violet-200/70">
        <p>
          <span className="font-bold text-white">{remaining}</span> left
        </p>
        <p>
          <span className="font-bold text-white">{activeCount}</span> in play
        </p>
      </div>
    </Card>
  );
}
