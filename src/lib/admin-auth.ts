import "server-only";
import { cookies } from "next/headers";
import { createHash, timingSafeEqual } from "crypto";

/**
 * Minimal admin auth for the outcomes editor.
 *
 * A 4-digit PIN (env `ADMIN_PIN`, default "1234") gates the /admin page. On a
 * correct PIN we set an httpOnly cookie holding a salted hash of the PIN — the
 * raw PIN never reaches the browser and the cookie can't be read by client JS.
 */

const COOKIE = "xujo_admin";
const MAX_AGE = 60 * 60 * 8; // 8 hours

export function getAdminPin(): string {
  const pin = process.env.ADMIN_PIN?.trim();
  return pin && /^\d{4}$/.test(pin) ? pin : "1234";
}

function token(): string {
  return createHash("sha256").update(`xujo-admin:${getAdminPin()}`).digest("hex");
}

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

export async function isAdmin(): Promise<boolean> {
  const store = await cookies();
  const value = store.get(COOKIE)?.value;
  return Boolean(value) && safeEqual(value!, token());
}

export async function signInAdmin(): Promise<void> {
  const store = await cookies();
  store.set(COOKIE, token(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function signOutAdmin(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE);
}
