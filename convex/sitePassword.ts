import { v } from "convex/values";
import { internalMutation, internalQuery, mutation } from "./_generated/server";
import { _sha256Hex, assertReviewKey } from "./reviewKey";

/**
 * The site password lives in the database (settings table), never in the code.
 * Only its hash is stored; the owner sets it with the review key.
 */
const KEY = "gatePasswordHash";

/**
 * Each address the site is served at has its own password. The default address
 * (trustorgs.ai) uses the plain key; trustcompanyai.org uses a suffixed key.
 */
export const siteArg = v.optional(v.union(v.literal("trustorgs"), v.literal("trustcompanyai")));
export type SiteKey = "trustorgs" | "trustcompanyai";

export function settingKey(site?: SiteKey): string {
  return site === "trustcompanyai" ? `${KEY}:trustcompanyai` : KEY;
}

export function passwordHash(password: string): string {
  return _sha256Hex(`trust-ai-gate:${password.trim().toLowerCase()}`);
}

export const getHash = internalQuery({
  args: { site: siteArg },
  returns: v.union(v.string(), v.null()),
  handler: async (ctx, { site }) => {
    const row = await ctx.db
      .query("settings")
      .withIndex("by_key", q => q.eq("key", settingKey(site)))
      .unique();
    return row?.value ?? null;
  },
});

async function store(ctx: { db: any }, hash: string, site?: SiteKey) {
  const key = settingKey(site);
  const row = await ctx.db
    .query("settings")
    .withIndex("by_key", (q: any) => q.eq("key", key))
    .unique();
  if (row) await ctx.db.patch(row._id, { value: hash });
  else await ctx.db.insert("settings", { key, value: hash });
}

/** Owner-only: set or change the site password. */
export const set = mutation({
  args: { key: v.string(), password: v.string(), site: siteArg },
  returns: v.null(),
  handler: async (ctx, { key, password, site }) => {
    assertReviewKey(key);
    if (password.trim().length < 4) throw new Error("Password too short.");
    await store(ctx, passwordHash(password), site);
    return null;
  },
});

export const setInternal = internalMutation({
  args: { password: v.string(), site: siteArg },
  returns: v.null(),
  handler: async (ctx, { password, site }) => {
    await store(ctx, passwordHash(password), site);
    return null;
  },
});
