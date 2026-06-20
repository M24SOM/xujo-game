"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabase/server";
import {
  getAdminPin,
  isAdmin,
  signInAdmin,
  signOutAdmin,
} from "@/lib/admin-auth";
import type { Outcome, OutcomeType } from "@/lib/types";

const OUTCOME_TYPES: OutcomeType[] = ["reward", "punishment", "leave"];

export interface LoginState {
  error?: string;
}

export interface ActionResult<T = undefined> {
  ok: boolean;
  error?: string;
  data?: T;
}

export interface OutcomeInput {
  id?: string;
  type: OutcomeType;
  title: string;
  description: string;
  weight: number;
}

/** PIN login — used with useActionState in the client form. */
export async function adminLogin(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const pin = String(formData.get("pin") ?? "").trim();
  if (!/^\d{4}$/.test(pin)) return { error: "Enter a 4-digit PIN." };
  if (pin !== getAdminPin()) return { error: "Incorrect PIN." };

  await signInAdmin();
  redirect("/admin");
}

export async function adminLogout(): Promise<void> {
  await signOutAdmin();
  redirect("/admin");
}

function validate(input: OutcomeInput): string | null {
  if (!OUTCOME_TYPES.includes(input.type)) return "Invalid outcome type.";
  if (!input.title.trim()) return "Title is required.";
  if (!Number.isFinite(input.weight) || input.weight < 1) {
    return "Weight must be a whole number of at least 1.";
  }
  return null;
}

function normalize(input: OutcomeInput) {
  return {
    type: input.type,
    title: input.title.trim().slice(0, 80),
    description: input.description.trim().slice(0, 240),
    weight: Math.max(1, Math.round(input.weight)),
  };
}

/** Create a new outcome and return it (so the client can render it with its id). */
export async function addOutcome(
  input: OutcomeInput,
): Promise<ActionResult<Outcome>> {
  if (!(await isAdmin())) return { ok: false, error: "Not authorized." };
  const invalid = validate(input);
  if (invalid) return { ok: false, error: invalid };

  const supabase = getSupabaseServer();
  const { data, error } = await supabase
    .from("outcomes")
    .insert(normalize(input))
    .select("*")
    .single();

  if (error || !data) {
    return { ok: false, error: error?.message ?? "Could not add outcome." };
  }
  revalidatePath("/admin");
  return { ok: true, data: data as Outcome };
}

/** Update an existing outcome. */
export async function saveOutcome(input: OutcomeInput): Promise<ActionResult> {
  if (!(await isAdmin())) return { ok: false, error: "Not authorized." };
  if (!input.id) return { ok: false, error: "Missing outcome id." };
  const invalid = validate(input);
  if (invalid) return { ok: false, error: invalid };

  const supabase = getSupabaseServer();
  const { error } = await supabase
    .from("outcomes")
    .update(normalize(input))
    .eq("id", input.id);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin");
  return { ok: true };
}

/** Delete an outcome. Fails gracefully if it's referenced by past picks. */
export async function removeOutcome(id: string): Promise<ActionResult> {
  if (!(await isAdmin())) return { ok: false, error: "Not authorized." };

  const supabase = getSupabaseServer();
  const { error } = await supabase.from("outcomes").delete().eq("id", id);

  if (error) {
    // Foreign-key violation: the outcome is used by an existing pick.
    if (error.code === "23503") {
      return {
        ok: false,
        error: "Can't delete — this outcome was used in a past game.",
      };
    }
    return { ok: false, error: error.message };
  }
  revalidatePath("/admin");
  return { ok: true };
}
