import { v } from "convex/values";
import { internal } from "./_generated/api";
import { action, internalAction, internalMutation, internalQuery, query } from "./_generated/server";
import { _sha256Hex } from "./reviewKey";
import { passwordHash, siteArg } from "./sitePassword";

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

export const MAX_FAILS = 10;

/**
 * Old direct check, kept only so stale open pages get a clean "no".
 * The real check is the /gate/unlock HTTP route (it knows the visitor's IP).
 */
export const unlock = action({
  args: { password: v.string(), email: v.optional(v.string()), site: siteArg },
  returns: v.union(v.string(), v.null()),
  handler: async () => null,
});

type TryResult = { token?: string; wrong?: boolean; locked?: boolean };

/** Check a password for one visitor (IP + browser id). 10 wrong = cut off. */
export const tryUnlock = internalAction({
  args: {
    password: v.string(),
    site: v.union(v.literal("trustorgs"), v.literal("trustcompanyai")),
    ip: v.string(),
    device: v.string(),
    userAgent: v.string(),
  },
  handler: async (ctx, a): Promise<TryResult> => {
    const clients = [`ip:${a.ip}`];
    if (a.device) clients.push(`dev:${a.device}`);
    if (await ctx.runQuery(internal.gate.anyLocked, { clients })) return { locked: true };
    const p = a.password.trim().slice(0, 200);
    if (!p) return { wrong: true };
    const stored = await ctx.runQuery(internal.sitePassword.getHash, {
      site: a.site === "trustcompanyai" ? "trustcompanyai" : undefined,
    });
    if (stored && passwordHash(p) === stored) {
      await ctx.runMutation(internal.gate.clearFails, { clients });
      await ctx.runMutation(internal.signins.record, { name: "site password" });
      return { token: gateToken() };
    }
    const locked = await ctx.runMutation(internal.gate.recordFail, {
      clients,
      site: a.site,
      ip: a.ip,
      userAgent: a.userAgent,
    });
    return locked ? { locked: true } : { wrong: true };
  },
});

export const anyLocked = internalQuery({
  args: { clients: v.array(v.string()) },
  returns: v.boolean(),
  handler: async (ctx, { clients }) => {
    for (const client of clients) {
      const row = await ctx.db.query("gateFails").withIndex("by_client", q => q.eq("client", client)).unique();
      if (row?.lockedAt) return true;
    }
    return false;
  },
});

export const recordFail = internalMutation({
  args: { clients: v.array(v.string()), site: v.string(), ip: v.string(), userAgent: v.string() },
  returns: v.boolean(),
  handler: async (ctx, a) => {
    const now = Date.now();
    let locked = false;
    for (const client of a.clients) {
      const row = await ctx.db.query("gateFails").withIndex("by_client", q => q.eq("client", client)).unique();
      const fails = (row?.fails ?? 0) + 1;
      const lockNow = fails >= MAX_FAILS && !row?.lockedAt;
      const patch = {
        fails,
        lastAt: now,
        site: a.site,
        ip: a.ip,
        userAgent: a.userAgent,
        ...(lockNow ? { lockedAt: now, notified: false } : {}),
      };
      if (row) await ctx.db.patch(row._id, patch);
      else await ctx.db.insert("gateFails", { client, ...patch });
      if (fails >= MAX_FAILS) locked = true;
    }
    return locked;
  },
});

export const clearFails = internalMutation({
  args: { clients: v.array(v.string()) },
  returns: v.null(),
  handler: async (ctx, { clients }) => {
    for (const client of clients) {
      const row = await ctx.db.query("gateFails").withIndex("by_client", q => q.eq("client", client)).unique();
      if (row && !row.lockedAt) await ctx.db.delete(row._id);
    }
    return null;
  },
});

/** Owner report: lockouts not yet reported (or all with `all`), marked reported. */
export const takeLockouts = internalMutation({
  args: { all: v.boolean() },
  handler: async (ctx, { all }) => {
    const rows = all
      ? (await ctx.db.query("gateFails").collect()).filter(r => r.lockedAt)
      : await ctx.db.query("gateFails").withIndex("by_notified", q => q.eq("notified", false)).collect();
    for (const r of rows) if (r.notified === false) await ctx.db.patch(r._id, { notified: true });
    return rows.map(r => ({
      client: r.client,
      ip: r.ip,
      site: r.site,
      fails: r.fails,
      lockedAt: r.lockedAt,
      userAgent: r.userAgent,
    }));
  },
});

/** Owner: let a cut-off visitor try again (client id, or an IP to lift its ip: row). */
export const liftLock = internalMutation({
  args: { client: v.string() },
  returns: v.number(),
  handler: async (ctx, { client }) => {
    let n = 0;
    for (const r of await ctx.db.query("gateFails").collect())
      if (r.client === client || r.ip === client) {
        await ctx.db.delete(r._id);
        n++;
      }
    return n;
  },
});

/** Is this locally stored token still valid? */
export const check = query({
  args: { token: v.optional(v.string()) },
  returns: v.boolean(),
  handler: async (_ctx, { token }) => gateOk(token),
});
