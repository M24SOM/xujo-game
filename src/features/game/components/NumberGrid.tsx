"use client";

export function NumberGrid({
  total,
  taken,
  pendingNumber,
  disabled,
  onPick,
}: {
  total: number;
  taken: Set<number>;
  pendingNumber: number | null;
  disabled: boolean;
  onPick: (n: number) => void;
}) {
  return (
    <div className="grid grid-cols-5 gap-2.5">
      {Array.from({ length: total }, (_, i) => i + 1).map((n) => {
        const isTaken = taken.has(n);
        const isPending = pendingNumber === n;
        const isDisabled = disabled || isTaken;

        return (
          <button
            key={n}
            type="button"
            disabled={isDisabled}
            onClick={() => onPick(n)}
            aria-label={`Pick number ${n}`}
            className={[
              "relative aspect-square rounded-2xl text-xl font-bold transition-all duration-150",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
              isTaken
                ? "cursor-not-allowed bg-surface/40 text-violet-300/25 line-through"
                : "bg-surface-2 text-white shadow-md shadow-black/20 hover:bg-primary hover:-translate-y-0.5 active:scale-95",
              isPending ? "animate-pop bg-primary ring-2 ring-primary" : "",
              disabled && !isTaken ? "opacity-60" : "",
            ].join(" ")}
          >
            {n}
          </button>
        );
      })}
    </div>
  );
}
