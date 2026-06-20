"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { adminLogin, type LoginState } from "@/features/admin/actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Checking…" : "Unlock"}
    </Button>
  );
}

export function PinForm() {
  const [state, action] = useActionState<LoginState, FormData>(adminLogin, {});

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6">
      <div className="text-6xl">🔒</div>
      <div className="text-center">
        <h1 className="text-2xl font-black">Admin</h1>
        <p className="mt-1 text-sm text-violet-200/60">
          Enter the 4-digit PIN to edit outcomes.
        </p>
      </div>

      <Card className="w-full max-w-xs">
        <form action={action} className="flex flex-col gap-4">
          <input
            name="pin"
            type="password"
            inputMode="numeric"
            autoComplete="off"
            maxLength={4}
            pattern="\d{4}"
            required
            autoFocus
            placeholder="••••"
            className="w-full rounded-2xl border border-border bg-surface-2/60 py-4 text-center text-3xl font-black tracking-[0.5em] text-white outline-none placeholder:text-violet-300/30 focus:border-primary/60"
          />
          {state.error && (
            <p className="text-center text-sm font-semibold text-punish">
              {state.error}
            </p>
          )}
          <SubmitButton />
        </form>
      </Card>
    </div>
  );
}
