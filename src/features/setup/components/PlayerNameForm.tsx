"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createGame } from "@/features/setup/actions";
import { DEFAULT_PLAYER_NAMES, MAX_PLAYERS, type PlayerCount } from "@/lib/types";
import {
  ALLOWED_PLAYER_COUNTS,
  DEFAULT_PLAYER_COUNT,
  GAME_SETTINGS,
} from "@/lib/settings";

const AVATARS = ["🦊", "🐼", "🐸", "🦄"];

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Starting…" : "Start Game"}
    </Button>
  );
}

export function PlayerNameForm() {
  const [count, setCount] = useState<PlayerCount>(DEFAULT_PLAYER_COUNT);
  const [names, setNames] = useState<string[]>([...DEFAULT_PLAYER_NAMES]);

  const setting = GAME_SETTINGS[count];

  return (
    <form action={createGame} className="flex flex-col gap-4">
      <input type="hidden" name="playerCount" value={count} />

      <div className="grid grid-cols-2 gap-2 rounded-2xl bg-surface-2/60 p-1.5">
        {ALLOWED_PLAYER_COUNTS.map((c) => (
          <button
            key={c}
            type="button"
            aria-pressed={count === c}
            onClick={() => setCount(c)}
            className={[
              "rounded-xl py-2.5 text-sm font-semibold transition-all",
              count === c
                ? "bg-primary text-white shadow-md shadow-primary/30"
                : "text-violet-200/70 hover:text-white",
            ].join(" ")}
          >
            {c} Players
          </button>
        ))}
      </div>

      <div className="flex items-center justify-center gap-2 text-xs font-semibold">
        <span className="rounded-full bg-surface-2 px-2.5 py-1 text-violet-200/70">
          {setting.numbers} numbers
        </span>
        <span className="rounded-full bg-reward/15 px-2.5 py-1 text-reward">
          {setting.composition.reward} 🎁
        </span>
        <span className="rounded-full bg-punish/15 px-2.5 py-1 text-punish">
          {setting.composition.punishment} ⚡
        </span>
        <span className="rounded-full bg-leave/15 px-2.5 py-1 text-leave">
          {setting.composition.leave} 💀
        </span>
      </div>

      <Card className="flex flex-col gap-3">
        {Array.from({ length: MAX_PLAYERS }).map((_, i) => {
          const active = i < count;
          return (
            <label
              key={i}
              hidden={!active}
              className="flex items-center gap-3 rounded-2xl border border-border bg-surface-2/60 px-4 py-3 focus-within:border-primary/60"
            >
              <span className="text-2xl" aria-hidden>
                {AVATARS[i]}
              </span>
              <span className="sr-only">Player {i + 1} name</span>
              <input
                name={`name-${i}`}
                value={names[i]}
                disabled={!active}
                onChange={(e) =>
                  setNames((prev) =>
                    prev.map((n, idx) => (idx === i ? e.target.value : n)),
                  )
                }
                onFocus={(e) => e.target.select()}
                maxLength={24}
                autoComplete="off"
                placeholder={DEFAULT_PLAYER_NAMES[i]}
                className="w-full bg-transparent text-lg font-semibold text-white outline-none placeholder:text-violet-300/30"
              />
            </label>
          );
        })}
      </Card>

      <SubmitButton />
      <p className="text-center text-xs text-violet-300/40">
        Tip: tap a name to rename a player before you start.
      </p>
    </form>
  );
}
