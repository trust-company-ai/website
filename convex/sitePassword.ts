import { v } from "convex/values";
import { internalMutation, internalQuery, mutation } from "./_generated/server";
import { _sha256Hex, assertReviewKey } from "./reviewKey";

/**
 * The site password lives in the database (settings table), never in the code.
 * Only its hash is stored; the owner sets it with the review key.
 */
const KEY = "gatePasswordHash";

export function passwordHash(password: string): string {
  return _sha256Hex(`trust-ai-gate:${password.trim().toLowerCase()}`);
}

export const getHash = internalQuery({
  args: {},
  returns: v.union(v.string(), v.null()),
  handler: async ctx => {
    const row = await ctx.db
      .query("settings")
      .withIndex("by_key", q => q.eq("key", KEY))
      .unique();
    return row?.value ?? null;
  },
});

async function store(ctx: { db: any }, hash: string) {
  const row = await ctx.db
    .query("settings")
    .withIndex("by_key", (q: any) => q.eq("key", KEY))
    .unique();
  if (row) await ctx.db.patch(row._id, { value: hash });
  else await ctx.db.insert("settings", { key: KEY, value: hash });
}

/** Owner-only: set or change the site password. */
export const set = mutation({
  args: { key: v.string(), password: v.string() },
  returns: v.null(),
  handler: async (ctx, { key, password }) => {
    assertReviewKey(key);
    if (password.trim().length < 4) throw new Error("Password too short.");
    await store(ctx, passwordHash(password));
    return null;
  },
});

export const setInternal = internalMutation({
  args: { password: v.string() },
  returns: v.null(),
  handler: async (ctx, { password }) => {
    await store(ctx, passwordHash(password));
    return null;
  },
});
