import { v } from "convex/values";
import { internal } from "./_generated/api";
import { action, query } from "./_generated/server";
import { _sha256Hex } from "./reviewKey";
import { passwordHash } from "./sitePassword";

declare const process: { env: Record<string, string | undefined> };

/**
 * Site-wide gate: one password box, top right of the splash page. No email or
 * username. A correct password returns a token
 * derived from the platform-managed project secret; the page keeps it in memory
 * only and sends it with every question (see ask.ts), so every visit starts on
 * the splash page.
 */
export function gateToken(): string {
  const secret = process.env.VIKTOR_SPACES_PROJECT_SECRET ?? "";
  if (!secret) throw new Error("Project secret missing");
  return _sha256Hex(`trust-ai-gate-token:${secret}`).slice(0, 40);
}

export function gateOk(token: string | undefined): boolean {
  return !!token && token === gateToken();
}

/**
 * Exchange the site password for the gate token. Password only; `email` is accepted but
 * ignored (kept so older pages still call this without error). The password itself is
 * not in the code: its hash is stored in the settings table (see sitePassword.ts).
 */
export const unlock = action({
  args: { password: v.string(), email: v.optional(v.string()) },
  returns: v.union(v.string(), v.null()),
  handler: async (ctx, { password, email }) => {
    void email;
    const p = password.trim().slice(0, 200);
    if (!p) return null;
    const stored = await ctx.runQuery(internal.sitePassword.getHash, {});
    if (!stored || passwordHash(p) !== stored) return null;
    await ctx.runMutation(internal.signins.record, { name: "site password" });
    return gateToken();
  },
});

/** Is this locally stored token still valid? */
export const check = query({
  args: { token: v.optional(v.string()) },
  returns: v.boolean(),
  handler: async (_ctx, { token }) => gateOk(token),
});
