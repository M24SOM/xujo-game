"use client";

import { useMemo, useState, useTransition } from "react";
import type { Outcome, OutcomeType } from "@/lib/types";
import {
  addOutcome,
  removeOutcome,
  saveOutcome,
  type OutcomeInput,
} from "@/features/admin/actions";
import { adminLogout } from "@/features/admin/actions";
import { OUTCOME_STYLE } from "@/features/game/outcome-style";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const TYPES: OutcomeType[] = ["reward", "punishment", "leave"];
const TYPE_ORDER: Record<OutcomeType, number> = {
  reward: 0,
  punishment: 1,
  leave: 2,
};

type Banner = { kind: "ok" | "error"; text: string } | null;

const fieldCls =
  "rounded-xl border border-border bg-surface-2/60 px-3 py-2 text-sm text-white outline-none focus:border-primary/60";

export function OutcomesEditor({
  initialOutcomes,
}: {
  initialOutcomes: Outcome[];
}) {
  const [outcomes, setOutcomes] = useState<Outcome[]>(initialOutcomes);
  const [banner, setBanner] = useState<Banner>(null);

  const sorted = useMemo(
    () =>
      [...outcomes].sort(
        (a, b) =>
          TYPE_ORDER[a.type] - TYPE_ORDER[b.type] ||
          a.title.localeCompare(b.title),
      ),
    [outcomes],
  );

  const counts = useMemo(() => {
    const c: Record<OutcomeType, number> = { reward: 0, punishment: 0, leave: 0 };
    for (const o of outcomes) c[o.type]++;
    return c;
  }, [outcomes]);

  return (
    <div className="flex flex-1 flex-col gap-4">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-black tracking-tight">Outcomes</h1>
        <form action={adminLogout}>
          <button className="rounded-full bg-surface-2 px-3 py-1.5 text-xs font-semibold text-violet-200/70 transition-colors hover:text-white">
            Lock 🔒
          </button>
        </form>
      </header>

      <div className="flex gap-2 text-xs font-bold">
        <span className="rounded-full bg-reward/15 px-2.5 py-1 text-reward">
          {counts.reward} reward
        </span>
        <span className="rounded-full bg-punish/15 px-2.5 py-1 text-punish">
          {counts.punishment} punishment
        </span>
        <span className="rounded-full bg-leave/15 px-2.5 py-1 text-leave">
          {counts.leave} leave
        </span>
      </div>

      {banner && (
        <p
          className={`rounded-2xl px-4 py-2 text-center text-sm font-semibold ${
            banner.kind === "ok"
              ? "bg-reward/15 text-reward"
              : "bg-punish/15 text-punish"
          }`}
        >
          {banner.text}
        </p>
      )}

      <AddRow
        onAdded={(o) => {
          setOutcomes((prev) => [...prev, o]);
          setBanner({ kind: "ok", text: `Added "${o.title}".` });
        }}
        onError={(text) => setBanner({ kind: "error", text })}
      />

      <div className="flex flex-col gap-3">
        {sorted.map((o) => (
          <Row
            key={o.id}
            outcome={o}
            onSaved={(updated) => {
              setOutcomes((prev) =>
                prev.map((x) => (x.id === updated.id ? updated : x)),
              );
              setBanner({ kind: "ok", text: `Saved "${updated.title}".` });
            }}
            onRemoved={(id) => {
              setOutcomes((prev) => prev.filter((x) => x.id !== id));
              setBanner({ kind: "ok", text: "Outcome deleted." });
            }}
            onError={(text) => setBanner({ kind: "error", text })}
          />
        ))}
      </div>

      <p className="pb-4 text-center text-xs text-violet-300/40">
        Changes apply to new games. Weight sets how likely a row is within its
        type.
      </p>
    </div>
  );
}

function TypeSelect({
  value,
  onChange,
}: {
  value: OutcomeType;
  onChange: (t: OutcomeType) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as OutcomeType)}
      className={`${fieldCls} font-semibold ${OUTCOME_STYLE[value].text}`}
    >
      {TYPES.map((t) => (
        <option key={t} value={t} className="bg-surface text-white">
          {OUTCOME_STYLE[t].emoji} {OUTCOME_STYLE[t].label}
        </option>
      ))}
    </select>
  );
}

function Row({
  outcome,
  onSaved,
  onRemoved,
  onError,
}: {
  outcome: Outcome;
  onSaved: (o: Outcome) => void;
  onRemoved: (id: string) => void;
  onError: (text: string) => void;
}) {
  const [draft, setDraft] = useState<Outcome>(outcome);
  const [pending, start] = useTransition();

  const dirty =
    draft.type !== outcome.type ||
    draft.title !== outcome.title ||
    draft.description !== outcome.description ||
    draft.weight !== outcome.weight;

  function handleSave() {
    start(async () => {
      const input: OutcomeInput = {
        id: draft.id,
        type: draft.type,
        title: draft.title,
        description: draft.description,
        weight: draft.weight,
      };
      const res = await saveOutcome(input);
      if (res.ok) onSaved(draft);
      else onError(res.error ?? "Could not save.");
    });
  }

  function handleDelete() {
    if (!confirm(`Delete "${outcome.title}"?`)) return;
    start(async () => {
      const res = await removeOutcome(outcome.id);
      if (res.ok) onRemoved(outcome.id);
      else onError(res.error ?? "Could not delete.");
    });
  }

  return (
    <Card className="flex flex-col gap-2.5">
      <div className="flex gap-2">
        <TypeSelect
          value={draft.type}
          onChange={(type) => setDraft((d) => ({ ...d, type }))}
        />
        <input
          type="number"
          min={1}
          value={draft.weight}
          onChange={(e) =>
            setDraft((d) => ({ ...d, weight: Number(e.target.value) }))
          }
          aria-label="Weight"
          className={`${fieldCls} w-20`}
        />
      </div>
      <input
        value={draft.title}
        maxLength={80}
        placeholder="Title"
        onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
        className={`${fieldCls} font-semibold`}
      />
      <textarea
        value={draft.description}
        maxLength={240}
        placeholder="Description"
        rows={2}
        onChange={(e) =>
          setDraft((d) => ({ ...d, description: e.target.value }))
        }
        className={`${fieldCls} resize-none`}
      />
      <div className="flex gap-2">
        <Button
          type="button"
          onClick={handleSave}
          disabled={pending || !dirty}
          className="flex-1 px-4 py-2.5 text-sm"
        >
          {pending ? "…" : dirty ? "Save" : "Saved"}
        </Button>
        <Button
          type="button"
          variant="danger"
          onClick={handleDelete}
          disabled={pending}
          className="px-4 py-2.5 text-sm"
        >
          Delete
        </Button>
      </div>
    </Card>
  );
}

function AddRow({
  onAdded,
  onError,
}: {
  onAdded: (o: Outcome) => void;
  onError: (text: string) => void;
}) {
  const empty: OutcomeInput = {
    type: "reward",
    title: "",
    description: "",
    weight: 1,
  };
  const [draft, setDraft] = useState<OutcomeInput>(empty);
  const [pending, start] = useTransition();

  function handleAdd() {
    start(async () => {
      const res = await addOutcome(draft);
      if (res.ok && res.data) {
        onAdded(res.data);
        setDraft(empty);
      } else {
        onError(res.error ?? "Could not add.");
      }
    });
  }

  return (
    <Card className="flex flex-col gap-2.5 border-dashed border-primary/40">
      <p className="text-xs font-bold uppercase tracking-widest text-violet-300/60">
        Add outcome
      </p>
      <div className="flex gap-2">
        <TypeSelect
          value={draft.type}
          onChange={(type) => setDraft((d) => ({ ...d, type }))}
        />
        <input
          type="number"
          min={1}
          value={draft.weight}
          onChange={(e) =>
            setDraft((d) => ({ ...d, weight: Number(e.target.value) }))
          }
          aria-label="Weight"
          className={`${fieldCls} w-20`}
        />
      </div>
      <input
        value={draft.title}
        maxLength={80}
        placeholder="Title"
        onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
        className={`${fieldCls} font-semibold`}
      />
      <textarea
        value={draft.description}
        maxLength={240}
        placeholder="Description"
        rows={2}
        onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
        className={`${fieldCls} resize-none`}
      />
      <Button
        type="button"
        onClick={handleAdd}
        disabled={pending || !draft.title.trim()}
        className="px-4 py-2.5 text-sm"
      >
        {pending ? "Adding…" : "+ Add outcome"}
      </Button>
    </Card>
  );
}
