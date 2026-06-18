"use client";

import { useEffect } from "react";
import type { Outcome } from "@/lib/types";
import { OUTCOME_STYLE } from "@/features/game/outcome-style";
import { Button } from "@/components/ui/button";

export interface RevealData {
  number: number;
  outcome: Outcome;
  playerName: string;
  eliminated: boolean;
  gameOver: boolean;
}

export function RevealDialog({
  data,
  onClose,
}: {
  data: RevealData | null;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!data) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [data, onClose]);

  if (!data) return null;

  const style = OUTCOME_STYLE[data.outcome.type];

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 backdrop-blur-sm animate-fade-in sm:items-center"
      onClick={onClose}
    >
      <div
        className={`w-full max-w-sm animate-rise rounded-3xl border border-border bg-surface p-6 text-center shadow-2xl ring-1 ${style.ring}`}
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-sm text-violet-300/60">
          {data.playerName} picked number{" "}
          <span className="font-bold text-white">{data.number}</span>
        </p>

        <div className="my-5 [perspective:800px]">
          <div className="animate-flip text-6xl">{style.emoji}</div>
        </div>

        <span
          className={`inline-block rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${style.chip}`}
        >
          {style.label}
        </span>

        <h2 className={`mt-3 text-2xl font-black ${style.text}`}>
          {data.outcome.title}
        </h2>
        {data.outcome.description && (
          <p className="mt-2 text-violet-100/80">{data.outcome.description}</p>
        )}

        {data.eliminated && (
          <p className="mt-4 rounded-2xl bg-leave/10 px-3 py-2 text-sm font-semibold text-leave">
            {data.playerName} is out of the game.
          </p>
        )}

        <Button onClick={onClose} className="mt-6 w-full">
          {data.gameOver ? "See results →" : "Next player →"}
        </Button>
      </div>
    </div>
  );
}
